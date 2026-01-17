import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { safeJsonParse } from '@/lib/utils/safe-json';
import { createClientSchema, validateInput } from '@/lib/validation/schemas';
import { checkAllLimits } from '@/lib/validation/input-limits';
import { getAuthFromRequest, getBrokerId, checkRateLimit, requirePermission } from '@/lib/auth/server';
import { ClientListResponse, ClientResponse, ApiValidationError } from '@/types/api';

// GET /api/clients - List all clients
export async function GET(request: NextRequest) {
    // Auth check
    const auth = getAuthFromRequest(request);
    const authCheck = requirePermission(auth, 'clients:read');
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

    try {
        // Build where clause based on user's access level
        // Also exclude soft-deleted clients
        const brokerId = getBrokerId(auth);
        const where = brokerId
            ? { brokerId, deletedAt: null }
            : { deletedAt: null };

        const clients = await prisma.client.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });

        // Apply search filter in memory (SQLite doesn't have great full-text search)
        let filteredClients = clients;
        if (search) {
            filteredClients = clients.filter(
                (client) =>
                    client.name.toLowerCase().includes(search) ||
                    client.nip.includes(search) ||
                    (client.email && client.email.toLowerCase().includes(search))
            );
        }

        // Parse JSON fields safely for response
        const clientsWithParsedData: ClientResponse[] = filteredClients.map((client) => ({
            ...client,
            regonData: safeJsonParse(client.regonDataJson, null),
            riskProfile: safeJsonParse(client.riskProfileJson, null),
            fleet: safeJsonParse(client.fleetJson, []),
            claimsHistory: safeJsonParse(client.claimsHistoryJson, []),
            createdAt: client.createdAt.toISOString(),
            updatedAt: client.updatedAt.toISOString(),
        }));

        const response: ClientListResponse = {
            data: clientsWithParsedData,
            total: clientsWithParsedData.length,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching clients:', error);
        return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
    }
}

// POST /api/clients - Create a new client
export async function POST(request: NextRequest) {
    // Auth check
    const auth = getAuthFromRequest(request);
    const authCheck = requirePermission(auth, 'clients:create');
    if (!authCheck.authorized) {
        return NextResponse.json(
            { error: authCheck.error || 'Unauthorized' },
            { status: auth.authenticated ? 403 : 401 }
        );
    }

    try {
        const body = await request.json();

        // SECURITY: Check input size limits to prevent DoS
        const limitsCheck = checkAllLimits({
            vehicles: body.fleet,
            payload: body,
        });
        if (!limitsCheck.valid) {
            return NextResponse.json(
                { error: limitsCheck.error },
                { status: 413 }
            );
        }

        // Validate input with Zod
        const validation = validateInput(createClientSchema, body);
        if (!validation.success) {
            const errorResponse: ApiValidationError = {
                error: 'Błędy walidacji',
                validationErrors: validation.errors || [],
            };
            return NextResponse.json(errorResponse, { status: 400 });
        }

        const data = validation.data!;

        // Check if NIP already exists
        const existingClient = await prisma.client.findUnique({
            where: { nip: data.nip },
        });

        if (existingClient) {
            return NextResponse.json(
                { error: 'Klient o podanym NIP już istnieje' },
                { status: 409 }
            );
        }

        // Extract address from regonData if available
        const regonAddress = data.regonData?.address as Record<string, string> | undefined;

        const newClient = await prisma.client.create({
            data: {
                nip: data.nip,
                name: data.name,
                email: data.email || null,
                phone: data.phone || null,
                street: regonAddress?.street || data.street || null,
                city: regonAddress?.city || data.city || null,
                postalCode: regonAddress?.postalCode || data.postalCode || null,
                voivodeship: regonAddress?.voivodeship || data.voivodeship || null,
                regon: data.regon || null,
                regonDataJson: data.regonData ? JSON.stringify(data.regonData) : null,
                riskProfileJson: data.riskProfile ? JSON.stringify(data.riskProfile) : JSON.stringify({
                    overallScore: 70,
                    riskLevel: 'MEDIUM',
                    yearsInBusiness: data.yearsInBusiness || 1,
                    claimsRatio: 0,
                    bonusMalus: 0,
                    transportTypes: [],
                    mainRoutes: ['POLAND'],
                    hasADRCertificate: false,
                    hasTAPACertificate: false,
                }),
                fleetJson: data.fleet ? JSON.stringify(data.fleet) : '[]',
                claimsHistoryJson: '[]',
                brokerId: auth.user?.brokerId || auth.user?.id || 'system',
            },
        });

        const response: ClientResponse = {
            ...newClient,
            regonData: safeJsonParse(newClient.regonDataJson, null),
            riskProfile: safeJsonParse(newClient.riskProfileJson, null),
            fleet: safeJsonParse(newClient.fleetJson, []),
            claimsHistory: [],
            createdAt: newClient.createdAt.toISOString(),
            updatedAt: newClient.updatedAt.toISOString(),
        };

        return NextResponse.json(response, { status: 201 });
    } catch (error: any) {
        console.error('Error creating client:', error);
        return NextResponse.json(
            { error: 'Failed to create client', details: error.message },
            { status: 500 }
        );
    }
}
