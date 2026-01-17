import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { safeJsonParse } from '@/lib/utils/safe-json';
import { updateClientSchema, validateInput } from '@/lib/validation/schemas';
import { getAuthFromRequest, getBrokerId, requirePermission } from '@/lib/auth/server';
import { ClientResponse, ApiValidationError } from '@/types/api';
import { OPEN_CLAIM_STATUSES, ACTIVE_POLICY_STATUSES } from '@/lib/constants/statuses';

// GET /api/clients/[id] - Get a single client
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // Auth check
    const auth = getAuthFromRequest(request);
    const authCheck = requirePermission(auth, 'clients:read');
    if (!authCheck.authorized) {
        return NextResponse.json(
            { error: authCheck.error || 'Unauthorized' },
            { status: auth.authenticated ? 403 : 401 }
        );
    }

    const { id } = await params;
    const brokerId = getBrokerId(auth);

    try {
        // SECURITY FIX: Fetch client FIRST to verify ownership before loading related data
        // Also filter out soft-deleted clients
        const client = await prisma.client.findFirst({
            where: brokerId
                ? { id, brokerId, deletedAt: null }
                : { id, deletedAt: null }
        });

        if (!client) {
            return NextResponse.json(
                { error: 'Client not found' },
                { status: 404 }
            );
        }

        // Only fetch related data AFTER verifying ownership
        // SECURITY FIX: Also filter policies by brokerId and exclude soft-deleted
        const [policies, claims] = await Promise.all([
            prisma.policy.findMany({
                where: brokerId
                    ? { clientId: id, brokerId, deletedAt: null }
                    : { clientId: id, deletedAt: null }
            }),
            prisma.claim.findMany({
                where: { clientId: id, deletedAt: null }
                // Claims are tied to client ownership already verified above
            }),
        ]);

        const response: ClientResponse & { policies: unknown[]; claims: unknown[] } = {
            ...client,
            policies,
            claims,
            regonData: safeJsonParse(client.regonDataJson, null),
            riskProfile: safeJsonParse(client.riskProfileJson, null),
            fleet: safeJsonParse(client.fleetJson, []),
            claimsHistory: safeJsonParse(client.claimsHistoryJson, []),
            createdAt: client.createdAt.toISOString(),
            updatedAt: client.updatedAt.toISOString(),
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching client:', error);
        return NextResponse.json({ error: 'Failed to fetch client' }, { status: 500 });
    }
}

// PUT /api/clients/[id] - Update a client
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // Auth check
    const auth = getAuthFromRequest(request);
    const authCheck = requirePermission(auth, 'clients:update');
    if (!authCheck.authorized) {
        return NextResponse.json(
            { error: authCheck.error || 'Unauthorized' },
            { status: auth.authenticated ? 403 : 401 }
        );
    }

    const { id } = await params;
    const brokerId = getBrokerId(auth);

    try {
        const body = await request.json();

        // Validate input with Zod
        const validation = validateInput(updateClientSchema, body);
        if (!validation.success) {
            const errorResponse: ApiValidationError = {
                error: 'Błędy walidacji',
                validationErrors: validation.errors || [],
            };
            return NextResponse.json(errorResponse, { status: 400 });
        }

        const data = validation.data!;

        // SECURITY FIX: Verify ownership before update
        const existingClient = await prisma.client.findFirst({
            where: brokerId ? { id, brokerId } : { id }
        });

        if (!existingClient) {
            return NextResponse.json(
                { error: 'Client not found' },
                { status: 404 }
            );
        }

        // OPTIMISTIC LOCKING: Check version to prevent concurrent edit overwrites
        const expectedVersion = body.version as number | undefined;
        if (expectedVersion !== undefined && expectedVersion !== existingClient.version) {
            return NextResponse.json(
                {
                    error: 'Konflikt wersji - dane zostały zmienione przez innego użytkownika',
                    currentVersion: existingClient.version,
                    expectedVersion: expectedVersion
                },
                { status: 409 }
            );
        }

        // Extract address from regonData if available
        const regonAddress = data.regonData?.address as Record<string, string> | undefined;

        const updatedClient = await prisma.client.update({
            where: { id }, // Safe now - we verified ownership above
            data: {
                name: data.name,
                email: data.email,
                phone: data.phone,
                street: data.street || regonAddress?.street,
                city: data.city || regonAddress?.city,
                postalCode: data.postalCode || regonAddress?.postalCode,
                voivodeship: data.voivodeship || regonAddress?.voivodeship,
                regon: data.regon,
                regonDataJson: data.regonData ? JSON.stringify(data.regonData) : undefined,
                riskProfileJson: data.riskProfile ? JSON.stringify(data.riskProfile) : undefined,
                fleetJson: data.fleet ? JSON.stringify(data.fleet) : undefined,
                // Increment version on each update
                version: { increment: 1 },
            },
        });

        const response: ClientResponse = {
            ...updatedClient,
            regonData: safeJsonParse(updatedClient.regonDataJson, null),
            riskProfile: safeJsonParse(updatedClient.riskProfileJson, null),
            fleet: safeJsonParse(updatedClient.fleetJson, []),
            claimsHistory: safeJsonParse(updatedClient.claimsHistoryJson, []),
            createdAt: updatedClient.createdAt.toISOString(),
            updatedAt: updatedClient.updatedAt.toISOString(),
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error updating client:', error);
        return NextResponse.json(
            { error: 'Failed to update client' },
            { status: 500 }
        );
    }
}

// DELETE /api/clients/[id] - Delete a client
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // Auth check
    const auth = getAuthFromRequest(request);
    const authCheck = requirePermission(auth, 'clients:delete');
    if (!authCheck.authorized) {
        return NextResponse.json(
            { error: authCheck.error || 'Unauthorized' },
            { status: auth.authenticated ? 403 : 401 }
        );
    }

    const { id } = await params;
    const brokerId = getBrokerId(auth);

    try {
        // SECURITY FIX: Verify ownership FIRST before any checks
        const client = await prisma.client.findFirst({
            where: brokerId ? { id, brokerId } : { id }
        });

        if (!client) {
            return NextResponse.json(
                { error: 'Client not found' },
                { status: 404 }
            );
        }

        // Check for existing policies before deleting
        const existingPolicies = await prisma.policy.findMany({
            where: { clientId: id },
            select: { id: true, policyNumber: true, status: true },
        });

        if (existingPolicies.length > 0) {
            const activePolicies = existingPolicies.filter(
                (p) => ACTIVE_POLICY_STATUSES.includes(p.status as any)
            );

            if (activePolicies.length > 0) {
                return NextResponse.json(
                    {
                        error: 'Nie można usunąć klienta z aktywnymi polisami',
                        details: {
                            activePoliciesCount: activePolicies.length,
                            policies: activePolicies.map((p) => p.policyNumber),
                        },
                    },
                    { status: 409 }
                );
            }

            // If only expired/cancelled policies, warn but allow with confirmation
            const forceDelete = request.nextUrl.searchParams.get('force') === 'true';
            if (!forceDelete) {
                return NextResponse.json(
                    {
                        error: 'Klient posiada historyczne polisy. Użyj force=true aby usunąć.',
                        details: {
                            policiesCount: existingPolicies.length,
                        },
                    },
                    { status: 409 }
                );
            }
        }

        // Check for existing claims
        const existingClaims = await prisma.claim.findMany({
            where: { clientId: id },
            select: { id: true, claimNumber: true, status: true },
        });

        const openClaims = existingClaims.filter(
            (c) => OPEN_CLAIM_STATUSES.includes(c.status as any)
        );

        if (openClaims.length > 0) {
            return NextResponse.json(
                {
                    error: 'Nie można usunąć klienta z otwartymi szkodami',
                    details: {
                        openClaimsCount: openClaims.length,
                        claims: openClaims.map((c) => c.claimNumber),
                    },
                },
                { status: 409 }
            );
        }

        // SOFT DELETE - set deletedAt instead of hard delete for audit compliance
        await prisma.client.update({
            where: { id },
            data: { deletedAt: new Date() },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting client:', error);
        return NextResponse.json(
            { error: 'Failed to delete client' },
            { status: 500 }
        );
    }
}
