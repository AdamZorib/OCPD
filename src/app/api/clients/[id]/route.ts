import { NextRequest, NextResponse } from 'next/server';
import { mockClients } from '@/lib/mock-data';

// GET /api/clients/[id] - Get a single client
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const client = mockClients.find((c) => c.id === id);

    if (!client) {
        return NextResponse.json(
            { error: 'Client not found' },
            { status: 404 }
        );
    }

    return NextResponse.json(client);
}

// PUT /api/clients/[id] - Update a client
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const client = mockClients.find((c) => c.id === id);

    if (!client) {
        return NextResponse.json(
            { error: 'Client not found' },
            { status: 404 }
        );
    }

    try {
        const body = await request.json();

        // In a real app, we would update the database
        const updatedClient = {
            ...client,
            ...body,
            id: client.id, // Prevent ID from being changed
            updatedAt: new Date(),
        };

        return NextResponse.json(updatedClient);
    } catch (error) {
        return NextResponse.json(
            { error: 'Invalid request body' },
            { status: 400 }
        );
    }
}

// DELETE /api/clients/[id] - Delete a client
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const clientIndex = mockClients.findIndex((c) => c.id === id);

    if (clientIndex === -1) {
        return NextResponse.json(
            { error: 'Client not found' },
            { status: 404 }
        );
    }

    // In a real app, we would delete from database
    return NextResponse.json({ success: true });
}
