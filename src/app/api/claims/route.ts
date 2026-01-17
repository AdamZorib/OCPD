import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { safeJsonParse } from '@/lib/utils/safe-json';
import { isGreaterThan, toNumber, addDecimals, subtractDecimals } from '@/lib/utils/decimal';
import { createClaimSchema, validateInput } from '@/lib/validation/schemas';
import { getAuthFromRequest, getBrokerId, checkRateLimit, requirePermission } from '@/lib/auth/server';
import { ClaimResponse } from '@/types/api';
import { EXCLUDED_CLAIM_STATUSES, ClaimStatus } from '@/lib/constants/statuses';
import { randomBytes } from 'crypto';

/**
 * Generate a unique claim number
 * Format: CLM/{year}/{random-6-chars}
 */
function generateClaimNumber(): string {
    const year = new Date().getFullYear();
    const random = randomBytes(3).toString('hex').toUpperCase();
    return `CLM/${year}/${random}`;
}

// GET /api/claims - List claims
export async function GET(request: NextRequest) {
    const auth = getAuthFromRequest(request);
    const authCheck = requirePermission(auth, 'claims:read');
    if (!authCheck.authorized) {
        return NextResponse.json(
            { error: authCheck.error || 'Unauthorized' },
            { status: auth.authenticated ? 403 : 401 }
        );
    }

    const rateLimit = checkRateLimit(auth.user?.id || 'anonymous');
    if (!rateLimit.allowed) {
        return NextResponse.json(
            { error: 'Zbyt wiele żądań' },
            { status: 429 }
        );
    }

    try {
        const brokerId = getBrokerId(auth);

        let where: any = {};
        if (brokerId) {
            // Get all client IDs for this broker first for safer filtering
            const brokerClients = await prisma.client.findMany({
                where: { brokerId },
                select: { id: true }
            });
            where = { clientId: { in: brokerClients.map(c => c.id) } };
        }

        const claims = await prisma.claim.findMany({
            where,
            include: {
                policy: true,
                client: true,
            },
            orderBy: { createdAt: 'desc' },
        }) as any[];

        const responseData: ClaimResponse[] = claims.map(claim => ({
            id: claim.id,
            claimNumber: claim.claimNumber,
            policyId: claim.policyId,
            clientId: claim.clientId,
            incidentDate: claim.incidentDate.toISOString(),
            reportedDate: claim.reportedDate.toISOString(),
            description: claim.description,
            location: claim.location,
            claimedAmount: claim.claimedAmount,
            reservedAmount: claim.reservedAmount,
            paidAmount: claim.paidAmount,
            status: claim.status,
            policyNumber: claim.policy?.policyNumber,
            clientName: claim.client?.name,
            clientNIP: claim.client?.nip,
            createdAt: claim.createdAt.toISOString(),
            updatedAt: claim.updatedAt.toISOString(),
            documents: safeJsonParse(claim.documentsJson, []),
        }));

        return NextResponse.json({ data: responseData, total: responseData.length });
    } catch (error) {
        console.error('Error fetching claims:', error);
        return NextResponse.json({ error: 'Failed to fetch claims' }, { status: 500 });
    }
}

// POST /api/claims - Register a new claim
export async function POST(request: NextRequest) {
    const auth = getAuthFromRequest(request);
    const authCheck = requirePermission(auth, 'claims:create');
    if (!authCheck.authorized) {
        return NextResponse.json(
            { error: authCheck.error || 'Unauthorized' },
            { status: auth.authenticated ? 403 : 401 }
        );
    }

    try {
        const body = await request.json();
        const validation = validateInput(createClaimSchema, body);

        if (!validation.success) {
            return NextResponse.json({
                error: 'Błędy walidacji',
                validationErrors: validation.errors || []
            }, { status: 400 });
        }

        const data = validation.data!;

        // CRITICAL BUSINESS LOGIC: Policy Exists and Claim Amount vs Sum Insured
        const policy = await prisma.policy.findUnique({
            where: { id: data.policyId },
        });

        if (!policy) {
            return NextResponse.json({ error: 'Polisa nie istnieje' }, { status: 404 });
        }

        // Use safe decimal comparison to avoid floating point issues
        if (isGreaterThan(data.claimedAmount, policy.sumInsured)) {
            return NextResponse.json({
                error: 'Kwota roszczenia przekracza sumę ubezpieczenia polisy'
                // SECURITY: Don't leak exact amounts to non-admin users
            }, { status: 400 });
        }

        // IDEMPOTENCY: Check for duplicate request using idempotencyKey
        const idempotencyKey = body.idempotencyKey as string | undefined;
        if (idempotencyKey) {
            const existingClaim = await prisma.claim.findFirst({
                where: { idempotencyKey },
                include: { policy: true, client: true }
            }) as any;
            if (existingClaim) {
                // Return existing claim instead of creating duplicate
                const response: ClaimResponse = {
                    id: existingClaim.id,
                    claimNumber: existingClaim.claimNumber,
                    policyId: existingClaim.policyId,
                    clientId: existingClaim.clientId,
                    incidentDate: existingClaim.incidentDate.toISOString(),
                    reportedDate: existingClaim.reportedDate.toISOString(),
                    description: existingClaim.description,
                    location: existingClaim.location,
                    claimedAmount: toNumber(existingClaim.claimedAmount),
                    reservedAmount: existingClaim.reservedAmount ? toNumber(existingClaim.reservedAmount) : null,
                    paidAmount: existingClaim.paidAmount ? toNumber(existingClaim.paidAmount) : null,
                    status: existingClaim.status,
                    policyNumber: existingClaim.policy?.policyNumber,
                    clientName: existingClaim.client?.name,
                    clientNIP: existingClaim.client?.nip,
                    createdAt: existingClaim.createdAt.toISOString(),
                    updatedAt: existingClaim.updatedAt.toISOString(),
                    documents: safeJsonParse(existingClaim.documentsJson, []),
                };
                return NextResponse.json(response, { status: 200 });
            }
        }

        // FIX: Use transaction to prevent race condition where two claims
        // both pass validation but together exceed the limit
        const result = await prisma.$transaction(async (tx) => {
            // Check AGGREGATE claims against sum insured (inside transaction)
            const existingClaims = await tx.claim.findMany({
                where: {
                    policyId: data.policyId,
                    status: { notIn: EXCLUDED_CLAIM_STATUSES },
                    deletedAt: null, // Exclude soft-deleted claims
                },
                select: { claimedAmount: true }
            });

            const totalExistingClaims = existingClaims.reduce((sum, c) => addDecimals(sum, c.claimedAmount), 0);
            const totalWithNewClaim = addDecimals(totalExistingClaims, data.claimedAmount);
            const remainingCoverage = Math.max(0, subtractDecimals(policy.sumInsured, totalExistingClaims));

            if (isGreaterThan(totalWithNewClaim, policy.sumInsured)) {
                // Return error info - will be handled outside transaction
                return {
                    error: true,
                    message: 'Suma roszczeń przekracza dostępny limit polisy',
                    remainingCoverage,
                };
            }

            // Generate unique claim number with retry limit
            const MAX_RETRIES = 10;
            let claimNumber = generateClaimNumber();

            for (let i = 0; i < MAX_RETRIES; i++) {
                const existing = await tx.claim.findUnique({ where: { claimNumber } });
                if (!existing) break;
                claimNumber = generateClaimNumber();
                if (i === MAX_RETRIES - 1) {
                    return { error: true, message: 'Błąd generowania numeru szkody' };
                }
            }

            // Create the claim
            const newClaim = await tx.claim.create({
                data: {
                    claimNumber,
                    policyId: data.policyId,
                    clientId: data.clientId,
                    incidentDate: new Date(data.incidentDate),
                    reportedDate: data.reportedDate ? new Date(data.reportedDate) : new Date(),
                    description: data.description,
                    location: data.location || null,
                    claimedAmount: data.claimedAmount,
                    reservedAmount: data.reservedAmount || data.claimedAmount,
                    status: data.status || ClaimStatus.REPORTED,
                    idempotencyKey: idempotencyKey || null,
                },
                include: {
                    policy: true,
                    client: true,
                }
            });

            return { error: false, claim: newClaim };
        });

        // Handle transaction result
        if (result.error) {
            return NextResponse.json(
                { error: result.message },
                { status: 400 }
            );
        }

        const newClaim = result.claim as any;

        const response: ClaimResponse = {
            id: newClaim.id,
            claimNumber: newClaim.claimNumber,
            policyId: newClaim.policyId,
            clientId: newClaim.clientId,
            incidentDate: newClaim.incidentDate.toISOString(),
            reportedDate: newClaim.reportedDate.toISOString(),
            description: newClaim.description,
            location: newClaim.location,
            claimedAmount: newClaim.claimedAmount,
            reservedAmount: newClaim.reservedAmount,
            paidAmount: newClaim.paidAmount,
            status: newClaim.status,
            policyNumber: newClaim.policy?.policyNumber,
            clientName: newClaim.client?.name,
            clientNIP: newClaim.client?.nip,
            createdAt: newClaim.createdAt.toISOString(),
            updatedAt: newClaim.updatedAt.toISOString(),
            documents: [],
        };

        return NextResponse.json(response, { status: 201 });
    } catch (error) {
        console.error('Error creating claim:', error);
        return NextResponse.json({ error: 'Failed to create claim' }, { status: 500 });
    }
}
