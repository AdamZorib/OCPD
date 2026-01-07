import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { safeJsonParse } from '@/lib/utils/safe-json';
import { createPolicySchema, validateInput } from '@/lib/validation/schemas';
import { getAuthFromRequest, getBrokerId, checkRateLimit, requirePermission } from '@/lib/auth/server';
import { PolicyListResponse, PolicyResponse, ApiValidationError } from '@/types/api';
import { randomBytes } from 'crypto';

/**
 * Generate a unique policy number with retry logic
 * Format: OCPD/{year}/{random-6-chars}
 */
function generatePolicyNumber(): string {
    const year = new Date().getFullYear();
    const random = randomBytes(3).toString('hex').toUpperCase();
    return `OCPD/${year}/${random}`;
}

// GET /api/policies - List all policies
export async function GET(request: NextRequest) {
    // Auth check
    const auth = getAuthFromRequest(request);
    const authCheck = requirePermission(auth, 'policies:read');
    if (!authCheck.authorized) {
        return NextResponse.json(
            { error: authCheck.error || 'Unauthorized' },
            { status: auth.authenticated ? 403 : 401 }
        );
    }

    // Rate limiting
    const rateLimit = checkRateLimit(auth.user?.id || 'anonymous');
    if (!rateLimit.allowed) {
        return NextResponse.json(
            { error: 'Zbyt wiele żądań. Spróbuj ponownie za chwilę.' },
            { status: 429 }
        );
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search')?.toLowerCase() || '';
    const status = searchParams.get('status') || '';
    const scope = searchParams.get('scope') || '';
    const clientId = searchParams.get('clientId') || '';

    try {
        // Build where clause based on filters and user access
        const brokerId = getBrokerId(auth);
        const where: Record<string, unknown> = {};

        if (brokerId) where.brokerId = brokerId;
        if (status) where.status = status;
        if (scope) where.territorialScope = scope;
        if (clientId) where.clientId = clientId;

        const policies = await prisma.policy.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });

        // Apply search filter in memory
        let filteredPolicies = policies;
        if (search) {
            filteredPolicies = policies.filter(
                (policy) =>
                    policy.policyNumber.toLowerCase().includes(search) ||
                    (policy.clientName && policy.clientName.toLowerCase().includes(search)) ||
                    policy.clientNIP.includes(search)
            );
        }

        // Parse JSON fields and add client info for response
        const policiesWithParsedData: PolicyResponse[] = filteredPolicies.map((policy) => ({
            ...policy,
            clauses: safeJsonParse(policy.clausesJson, []),
            client: {
                id: policy.clientId,
                name: policy.clientName,
                nip: policy.clientNIP,
            },
            validFrom: policy.validFrom?.toISOString() || null,
            validTo: policy.validTo?.toISOString() || null,
            issuedAt: policy.issuedAt?.toISOString() || null,
            signedAt: policy.signedAt?.toISOString() || null,
            createdAt: policy.createdAt.toISOString(),
            updatedAt: policy.updatedAt.toISOString(),
        }));

        // Calculate stats
        const allPolicies = await prisma.policy.findMany({
            where: brokerId ? { brokerId } : {},
        });
        const activePolicies = allPolicies.filter((p) => p.status === 'ACTIVE');
        const expiredPolicies = allPolicies.filter((p) => p.status === 'EXPIRED');
        const totalPremium = activePolicies.reduce((sum, p) => sum + (p.totalPremium || 0), 0);

        const response: PolicyListResponse = {
            data: policiesWithParsedData,
            total: policiesWithParsedData.length,
            stats: {
                active: activePolicies.length,
                expired: expiredPolicies.length,
                totalPremium,
            },
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching policies:', error);
        return NextResponse.json({ error: 'Failed to fetch policies' }, { status: 500 });
    }
}

// POST /api/policies - Create a new policy
export async function POST(request: NextRequest) {
    // Auth check
    const auth = getAuthFromRequest(request);
    const authCheck = requirePermission(auth, 'policies:issue');
    if (!authCheck.authorized) {
        return NextResponse.json(
            { error: authCheck.error || 'Unauthorized' },
            { status: auth.authenticated ? 403 : 401 }
        );
    }

    try {
        const body = await request.json();

        // Validate input with Zod
        const validation = validateInput(createPolicySchema, body);
        if (!validation.success) {
            const errorResponse: ApiValidationError = {
                error: 'Błędy walidacji',
                validationErrors: validation.errors || [],
            };
            return NextResponse.json(errorResponse, { status: 400 });
        }

        const data = validation.data!;

        // Validate sum insured is positive
        if (data.sumInsured <= 0) {
            return NextResponse.json(
                { error: 'Suma ubezpieczenia musi być większa od zera' },
                { status: 400 }
            );
        }

        // Get client info if available
        let clientName = data.clientName;
        let clientNIP = data.clientNIP;

        if (data.clientId && (!clientName || !clientNIP)) {
            const client = await prisma.client.findUnique({
                where: { id: data.clientId },
            });
            if (client) {
                clientName = clientName || client.name;
                clientNIP = clientNIP || client.nip;
            } else {
                return NextResponse.json(
                    { error: 'Nie znaleziono klienta o podanym ID' },
                    { status: 404 }
                );
            }
        }

        // Generate unique policy number with retry for collision safety
        let policyNumber = generatePolicyNumber();
        let retries = 0;
        const maxRetries = 5;

        while (retries < maxRetries) {
            const existing = await prisma.policy.findUnique({
                where: { policyNumber },
            });
            if (!existing) break;
            policyNumber = generatePolicyNumber();
            retries++;
        }

        if (retries >= maxRetries) {
            console.error('Failed to generate unique policy number after retries');
            return NextResponse.json(
                { error: 'Błąd generowania numeru polisy' },
                { status: 500 }
            );
        }

        const newPolicy = await prisma.policy.create({
            data: {
                policyNumber,
                clientId: data.clientId,
                clientNIP: clientNIP || '',
                clientName: clientName || null,
                type: data.type || 'OCPD',
                status: 'DRAFT',
                sumInsured: data.sumInsured,
                territorialScope: data.territorialScope,
                basePremium: data.basePremium || null,
                clausesPremium: data.clausesPremium || null,
                totalPremium: data.totalPremium || null,
                clausesJson: data.clauses ? JSON.stringify(data.clauses) : null,
                validFrom: data.validFrom ? new Date(data.validFrom) : null,
                validTo: data.validTo ? new Date(data.validTo) : null,
                brokerId: auth.user?.brokerId || auth.user?.id || 'system',
            },
        });

        const response: PolicyResponse = {
            ...newPolicy,
            clauses: safeJsonParse(newPolicy.clausesJson, []),
            client: {
                id: newPolicy.clientId,
                name: newPolicy.clientName,
                nip: newPolicy.clientNIP,
            },
            validFrom: newPolicy.validFrom?.toISOString() || null,
            validTo: newPolicy.validTo?.toISOString() || null,
            issuedAt: newPolicy.issuedAt?.toISOString() || null,
            signedAt: newPolicy.signedAt?.toISOString() || null,
            createdAt: newPolicy.createdAt.toISOString(),
            updatedAt: newPolicy.updatedAt.toISOString(),
        };

        return NextResponse.json(response, { status: 201 });
    } catch (error) {
        console.error('Error creating policy:', error);
        return NextResponse.json(
            { error: 'Failed to create policy' },
            { status: 500 }
        );
    }
}
