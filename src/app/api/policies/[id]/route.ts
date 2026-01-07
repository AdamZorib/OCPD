import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest, getBrokerId, requirePermission } from '@/lib/auth/server';

// GET /api/policies/[id] - Get a single policy
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // Auth check
    const auth = getAuthFromRequest(request);
    const authCheck = requirePermission(auth, 'policies:read');
    if (!authCheck.authorized) {
        return NextResponse.json(
            { error: authCheck.error || 'Unauthorized' },
            { status: auth.authenticated ? 403 : 401 }
        );
    }

    const { id } = await params;
    const brokerId = getBrokerId(auth);

    try {
        const policy = await prisma.policy.findFirst({
            where: brokerId ? { id, brokerId } : { id },
        });

        if (!policy) {
            return NextResponse.json(
                { error: 'Policy not found' },
                { status: 404 }
            );
        }

        const client = await prisma.client.findUnique({
            where: { id: policy.clientId },
        });

        return NextResponse.json({
            ...policy,
            clauses: policy.clausesJson ? JSON.parse(policy.clausesJson) : [],
            client: client ? {
                id: client.id,
                name: client.name,
                nip: client.nip,
                email: client.email,
                phone: client.phone,
                regonData: client.regonDataJson ? JSON.parse(client.regonDataJson) : null,
            } : {
                id: policy.clientId,
                name: policy.clientName,
                nip: policy.clientNIP,
            },
        });
    } catch (error) {
        console.error('Error fetching policy:', error);
        return NextResponse.json({ error: 'Failed to fetch policy' }, { status: 500 });
    }
}

// PUT /api/policies/[id] - Update a policy
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // Auth check
    const auth = getAuthFromRequest(request);
    const authCheck = requirePermission(auth, 'policies:modify'); // Using modify for PUT
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

        const updatedPolicy = await prisma.policy.update({
            where: brokerId ? { id, brokerId } : { id },
            data: {
                clientName: body.clientName,
                status: body.status,
                sumInsured: body.sumInsured,
                territorialScope: body.territorialScope,
                basePremium: body.basePremium,
                clausesPremium: body.clausesPremium,
                totalPremium: body.totalPremium,
                clausesJson: body.clauses ? JSON.stringify(body.clauses) : undefined,
                validFrom: body.validFrom ? new Date(body.validFrom) : undefined,
                validTo: body.validTo ? new Date(body.validTo) : undefined,
                issuedAt: body.issuedAt ? new Date(body.issuedAt) : undefined,
                apkCompleted: body.apkCompleted,
                ipidGenerated: body.ipidGenerated,
                signatureStatus: body.signatureStatus,
                signatureId: body.signatureId,
                signedAt: body.signedAt ? new Date(body.signedAt) : undefined,
            },
        });

        return NextResponse.json({
            ...updatedPolicy,
            clauses: updatedPolicy.clausesJson ? JSON.parse(updatedPolicy.clausesJson) : [],
            client: {
                id: updatedPolicy.clientId,
                name: updatedPolicy.clientName,
                nip: updatedPolicy.clientNIP,
            },
        });
    } catch (error) {
        console.error('Error updating policy:', error);
        return NextResponse.json(
            { error: 'Failed to update policy' },
            { status: 500 }
        );
    }
}

// PATCH /api/policies/[id] - Update policy status
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // Auth check
    const auth = getAuthFromRequest(request);
    const authCheck = requirePermission(auth, 'policies:modify');
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

        const updatedPolicy = await prisma.policy.update({
            where: brokerId ? { id, brokerId } : { id },
            data: {
                status: body.status,
            },
        });

        return NextResponse.json({
            ...updatedPolicy,
            clauses: updatedPolicy.clausesJson ? JSON.parse(updatedPolicy.clausesJson) : [],
            client: {
                id: updatedPolicy.clientId,
                name: updatedPolicy.clientName,
                nip: updatedPolicy.clientNIP,
            },
        });
    } catch (error) {
        console.error('Error updating policy status:', error);
        return NextResponse.json(
            { error: 'Failed to update policy status' },
            { status: 500 }
        );
    }
}
