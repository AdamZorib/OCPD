import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/clients - List all clients
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search')?.toLowerCase() || '';

    try {
        const clients = await prisma.client.findMany({
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

        // Parse JSON fields for response
        const clientsWithParsedData = filteredClients.map((client) => ({
            ...client,
            regonData: client.regonDataJson ? JSON.parse(client.regonDataJson) : null,
            riskProfile: client.riskProfileJson ? JSON.parse(client.riskProfileJson) : null,
            fleet: client.fleetJson ? JSON.parse(client.fleetJson) : [],
            claimsHistory: client.claimsHistoryJson ? JSON.parse(client.claimsHistoryJson) : [],
        }));

        return NextResponse.json({
            data: clientsWithParsedData,
            total: clientsWithParsedData.length,
        });
    } catch (error) {
        console.error('Error fetching clients:', error);
        return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
    }
}

// POST /api/clients - Create a new client
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.nip || !body.name) {
            return NextResponse.json(
                { error: 'NIP and name are required' },
                { status: 400 }
            );
        }

        const newClient = await prisma.client.create({
            data: {
                nip: body.nip,
                name: body.name,
                email: body.email || null,
                phone: body.phone || null,
                street: body.regonData?.address?.street || null,
                city: body.regonData?.address?.city || null,
                postalCode: body.regonData?.address?.postalCode || null,
                voivodeship: body.regonData?.address?.voivodeship || null,
                regonDataJson: body.regonData ? JSON.stringify(body.regonData) : null,
                riskProfileJson: body.riskProfile ? JSON.stringify(body.riskProfile) : JSON.stringify({
                    overallScore: 70,
                    riskLevel: 'MEDIUM',
                    yearsInBusiness: body.yearsInBusiness || 1,
                    claimsRatio: 0,
                    bonusMalus: 0,
                    transportTypes: [],
                    mainRoutes: ['POLAND'],
                    hasADRCertificate: false,
                    hasTAPACertificate: false,
                }),
                fleetJson: body.fleet ? JSON.stringify(body.fleet) : '[]',
                claimsHistoryJson: '[]',
                brokerId: 'broker-1',
            },
        });

        return NextResponse.json({
            ...newClient,
            regonData: newClient.regonDataJson ? JSON.parse(newClient.regonDataJson) : null,
            riskProfile: newClient.riskProfileJson ? JSON.parse(newClient.riskProfileJson) : null,
            fleet: newClient.fleetJson ? JSON.parse(newClient.fleetJson) : [],
            claimsHistory: [],
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating client:', error);
        return NextResponse.json(
            { error: 'Failed to create client' },
            { status: 500 }
        );
    }
}
