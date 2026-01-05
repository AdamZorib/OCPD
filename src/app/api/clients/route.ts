import { NextRequest, NextResponse } from 'next/server';
import { mockClients } from '@/lib/mock-data';

// GET /api/clients - List all clients
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search')?.toLowerCase() || '';
    const riskLevel = searchParams.get('riskLevel') || '';
    const scope = searchParams.get('scope') || '';

    let clients = [...mockClients];

    // Apply search filter
    if (search) {
        clients = clients.filter(
            (client) =>
                client.name.toLowerCase().includes(search) ||
                client.nip.includes(search) ||
                client.email.toLowerCase().includes(search)
        );
    }

    // Apply risk level filter
    if (riskLevel) {
        clients = clients.filter((client) => client.riskProfile.riskLevel === riskLevel);
    }

    // Apply scope filter
    if (scope) {
        clients = clients.filter((client) =>
            client.riskProfile.mainRoutes.includes(scope as 'POLAND' | 'EUROPE' | 'WORLD')
        );
    }

    return NextResponse.json({
        data: clients,
        total: clients.length,
    });
}

// POST /api/clients - Create a new client
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.nip || !body.name || !body.email) {
            return NextResponse.json(
                { error: 'NIP, name, and email are required' },
                { status: 400 }
            );
        }

        // In a real app, we would save to database
        // For demo purposes, we add to mock data (persists during server session)
        const newClient = {
            id: `client-${Date.now()}`,
            nip: body.nip,
            name: body.name,
            email: body.email,
            phone: body.phone || '',
            brokerId: 'broker-1', // Default broker ID for demo
            createdAt: new Date(),
            updatedAt: new Date(),
            regonData: body.regonData || null,
            fleet: body.fleet || [],
            claimsHistory: [],
            riskProfile: body.riskProfile || {
                overallScore: 70,
                riskLevel: 'MEDIUM' as const,
                yearsInBusiness: body.yearsInBusiness || 1,
                claimsRatio: 0,
                bonusMalus: 0,
                transportTypes: [],
                mainRoutes: ['POLAND'] as ('POLAND' | 'EUROPE' | 'WORLD')[],
                hasADRCertificate: false,
                hasTAPACertificate: false,
            },
        };

        // Add to mock data for demo persistence
        mockClients.push(newClient as typeof mockClients[0]);

        return NextResponse.json(newClient, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: 'Invalid request body' },
            { status: 400 }
        );
    }
}
