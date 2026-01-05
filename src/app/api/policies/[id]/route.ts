import { NextRequest, NextResponse } from 'next/server';
import { mockPolicies } from '@/lib/mock-data';

// GET /api/policies/[id] - Get a single policy
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const policy = mockPolicies.find((p) => p.id === id);

    if (!policy) {
        return NextResponse.json(
            { error: 'Policy not found' },
            { status: 404 }
        );
    }

    return NextResponse.json(policy);
}

// PUT /api/policies/[id] - Update a policy
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const policy = mockPolicies.find((p) => p.id === id);

    if (!policy) {
        return NextResponse.json(
            { error: 'Policy not found' },
            { status: 404 }
        );
    }

    try {
        const body = await request.json();

        const updatedPolicy = {
            ...policy,
            ...body,
            id: policy.id,
            policyNumber: policy.policyNumber, // Prevent policy number from being changed
            updatedAt: new Date(),
        };

        return NextResponse.json(updatedPolicy);
    } catch (error) {
        return NextResponse.json(
            { error: 'Invalid request body' },
            { status: 400 }
        );
    }
}

// PATCH /api/policies/[id] - Update policy status
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const policy = mockPolicies.find((p) => p.id === id);

    if (!policy) {
        return NextResponse.json(
            { error: 'Policy not found' },
            { status: 404 }
        );
    }

    try {
        const body = await request.json();

        if (!body.status) {
            return NextResponse.json(
                { error: 'status is required' },
                { status: 400 }
            );
        }

        const validStatuses = ['DRAFT', 'QUOTED', 'ACTIVE', 'EXPIRED', 'CANCELLED'];
        if (!validStatuses.includes(body.status)) {
            return NextResponse.json(
                { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
                { status: 400 }
            );
        }

        const updatedPolicy = {
            ...policy,
            status: body.status,
            updatedAt: new Date(),
        };

        return NextResponse.json(updatedPolicy);
    } catch (error) {
        return NextResponse.json(
            { error: 'Invalid request body' },
            { status: 400 }
        );
    }
}
