import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/clients/[id] - Get a single client
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const [client, policies, claims] = await Promise.all([
            prisma.client.findUnique({ where: { id } }),
            prisma.policy.findMany({ where: { clientId: id } }),
            prisma.claim.findMany({ where: { clientId: id } }),
        ]);

        if (!client) {
            return NextResponse.json(
                { error: 'Client not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            ...client,
            policies,
            claims,
            regonData: client.regonDataJson ? JSON.parse(client.regonDataJson) : null,
            riskProfile: client.riskProfileJson ? JSON.parse(client.riskProfileJson) : null,
            fleet: client.fleetJson ? JSON.parse(client.fleetJson) : [],
            claimsHistory: client.claimsHistoryJson ? JSON.parse(client.claimsHistoryJson) : [],
        });
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
    const { id } = await params;

    try {
        const body = await request.json();

        const updatedClient = await prisma.client.update({
            where: { id },
            data: {
                name: body.name,
                email: body.email,
                phone: body.phone,
                street: body.street || body.regonData?.address?.street,
                city: body.city || body.regonData?.address?.city,
                postalCode: body.postalCode || body.regonData?.address?.postalCode,
                voivodeship: body.voivodeship || body.regonData?.address?.voivodeship,
                regonDataJson: body.regonData ? JSON.stringify(body.regonData) : undefined,
                riskProfileJson: body.riskProfile ? JSON.stringify(body.riskProfile) : undefined,
                fleetJson: body.fleet ? JSON.stringify(body.fleet) : undefined,
                claimsHistoryJson: body.claimsHistory ? JSON.stringify(body.claimsHistory) : undefined,
            },
        });

        return NextResponse.json({
            ...updatedClient,
            regonData: updatedClient.regonDataJson ? JSON.parse(updatedClient.regonDataJson) : null,
            riskProfile: updatedClient.riskProfileJson ? JSON.parse(updatedClient.riskProfileJson) : null,
            fleet: updatedClient.fleetJson ? JSON.parse(updatedClient.fleetJson) : [],
            claimsHistory: updatedClient.claimsHistoryJson ? JSON.parse(updatedClient.claimsHistoryJson) : [],
        });
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
    const { id } = await params;

    try {
        await prisma.client.delete({
            where: { id },
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
