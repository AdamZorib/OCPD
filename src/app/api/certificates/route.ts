import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createCertificateSchema, validateInput } from '@/lib/validation/schemas';
import { getAuthFromRequest, getBrokerId, checkRateLimit, requirePermission } from '@/lib/auth/server';
import { createId } from '@paralleldrive/cuid2';

/**
 * Generate a unique certificate number using CUID
 * Format: CERT/{year}/{full-cuid}
 * CUID provides guaranteed uniqueness - no collision possible
 */
function generateCertificateNumber(): string {
    const year = new Date().getFullYear();
    const uniqueId = createId().toUpperCase();
    return `CERT/${year}/${uniqueId}`;
}

/**
 * Sanitize error message - never expose internal/Prisma errors to client
 */
function sanitizeErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        const msg = error.message.toLowerCase();
        // Don't expose database/internal errors
        if (msg.includes('prisma') || msg.includes('database') || msg.includes('constraint')) {
            return 'Nie udało się przetworzyć żądania';
        }
        return error.message;
    }
    return 'Wystąpił nieoczekiwany błąd';
}

// GET /api/certificates - List certificates with pagination
export async function GET(request: NextRequest) {
    const auth = getAuthFromRequest(request);
    const authCheck = requirePermission(auth, 'certificates:read');
    if (!authCheck.authorized) {
        return NextResponse.json(
            { error: authCheck.error || 'Unauthorized' },
            { status: auth.authenticated ? 403 : 401 }
        );
    }

    const rateLimit = checkRateLimit(auth.user?.id || 'anonymous');
    if (!rateLimit.allowed) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    try {
        const brokerId = getBrokerId(auth);
        const searchParams = request.nextUrl.searchParams;

        // Pagination with bounds checking
        const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
        const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10)));
        const skip = (page - 1) * pageSize;

        const whereClause = brokerId
            ? { brokerId, deletedAt: null }
            : { deletedAt: null };

        const [certificates, total] = await Promise.all([
            prisma.insuranceCertificate.findMany({
                where: whereClause,
                orderBy: { createdAt: 'desc' },
                skip,
                take: pageSize,
                include: {
                    policy: {
                        select: {
                            policyNumber: true,
                            validTo: true,
                            status: true
                        }
                    },
                    client: {
                        select: {
                            name: true,
                            nip: true
                        }
                    }
                }
            }),
            prisma.insuranceCertificate.count({ where: whereClause })
        ]);

        return NextResponse.json({
            data: certificates,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize)
        });
    } catch (error) {
        console.error('Error fetching certificates:', error);
        return NextResponse.json({ error: 'Failed to fetch certificates' }, { status: 500 });
    }
}

// POST /api/certificates - Create a new certificate
export async function POST(request: NextRequest) {
    const auth = getAuthFromRequest(request);
    const authCheck = requirePermission(auth, 'certificates:create');
    if (!authCheck.authorized) {
        return NextResponse.json(
            { error: authCheck.error || 'Unauthorized' },
            { status: auth.authenticated ? 403 : 401 }
        );
    }

    const rateLimit = checkRateLimit(auth.user?.id || 'anonymous');
    if (!rateLimit.allowed) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    try {
        const body = await request.json();
        const validation = validateInput(createCertificateSchema, body);

        if (!validation.success) {
            return NextResponse.json({
                error: 'Błędy walidacji',
                validationErrors: validation.errors || []
            }, { status: 400 });
        }

        const data = validation.data!;
        const brokerId = getBrokerId(auth);

        // Validate transportDate is within reasonable range
        const transportDateObj = new Date(data.transportDate);
        const now = new Date();
        const maxFutureDate = new Date();
        maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 1);

        if (transportDateObj > maxFutureDate) {
            return NextResponse.json({
                error: 'Data transportu nie może być dalej niż rok w przyszłość'
            }, { status: 400 });
        }

        // Fetch policy and client to verify existence and ownership
        const [policy, client] = await Promise.all([
            prisma.policy.findFirst({
                where: brokerId
                    ? { id: data.policyId, brokerId, deletedAt: null }
                    : { id: data.policyId, deletedAt: null }
            }),
            prisma.client.findFirst({
                where: brokerId
                    ? { id: data.clientId, brokerId, deletedAt: null }
                    : { id: data.clientId, deletedAt: null }
            })
        ]);

        if (!policy) {
            return NextResponse.json({ error: 'Polisa nie istnieje lub nie masz do niej uprawnień' }, { status: 404 });
        }

        if (!client) {
            return NextResponse.json({ error: 'Klient nie istnieje lub nie masz do niego uprawnień' }, { status: 404 });
        }

        // Critical: Verify client is actually the policy holder
        if (policy.clientId !== data.clientId) {
            return NextResponse.json({ error: 'Klient nie jest powiązany z tą polisą' }, { status: 400 });
        }

        // Critical: Only allow certificates for active policies
        if (policy.status !== 'ACTIVE') {
            return NextResponse.json({ error: 'Można wystawić certyfikat tylko dla aktywnej polisy' }, { status: 400 });
        }

        // Check if policy has expired (same-day is still valid until end of day UTC)
        if (policy.validTo) {
            const expiryDate = new Date(policy.validTo);
            // Use UTC end-of-day to avoid timezone issues
            const endOfExpiryDayUTC = new Date(Date.UTC(
                expiryDate.getUTCFullYear(),
                expiryDate.getUTCMonth(),
                expiryDate.getUTCDate(),
                23, 59, 59, 999
            ));
            if (endOfExpiryDayUTC < new Date()) {
                return NextResponse.json({ error: 'Polisa wygasła - nie można wystawić certyfikatu' }, { status: 400 });
            }
        }

        // Business rule: Cargo value should not exceed policy sum insured
        const sumInsuredNum = Number(policy.sumInsured);
        if (data.cargoValue > sumInsuredNum) {
            return NextResponse.json({
                error: `Wartość ładunku (${data.cargoValue}) przekracza sumę ubezpieczenia polisy (${sumInsuredNum})`
            }, { status: 400 });
        }

        // Execute creation in transaction for consistency
        const result = await prisma.$transaction(async (tx) => {
            // Re-verify policy status within transaction (prevents race condition)
            const freshPolicy = await tx.policy.findUnique({ where: { id: data.policyId } });
            if (!freshPolicy || freshPolicy.status !== 'ACTIVE' || freshPolicy.deletedAt) {
                throw new Error('Polisa nie jest już aktywna');
            }

            // Check for duplicate certificate (same policy, route, transport date)
            const transportDate = new Date(data.transportDate);
            const existingCert = await tx.insuranceCertificate.findFirst({
                where: {
                    policyId: data.policyId,
                    route: data.route,
                    transportDate: transportDate,
                    deletedAt: null
                }
            });
            if (existingCert) {
                throw new Error('Certyfikat dla tej trasy i daty już istnieje');
            }

            // Generate unique certificate number (CUID guarantees uniqueness)
            const certificateNumber = generateCertificateNumber();

            return tx.insuranceCertificate.create({
                data: {
                    certificateNumber,
                    policyId: data.policyId,
                    clientId: data.clientId,

                    // Snapshot: Duplicate for audit trail
                    policyNumber: policy.policyNumber,
                    clientName: client.name,

                    cargoDescription: data.cargoDescription,
                    cargoValue: data.cargoValue,
                    route: data.route,
                    transportDate: transportDate,

                    // Proper ownership and audit fields
                    brokerId: brokerId || null,
                    createdById: auth.user?.id || null,
                }
            });
        });

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error('Error creating certificate:', error);
        return NextResponse.json(
            { error: sanitizeErrorMessage(error) },
            { status: 500 }
        );
    }
}
