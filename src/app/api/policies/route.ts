import { NextRequest, NextResponse } from 'next/server';
import { mockPolicies } from '@/lib/mock-data';

// GET /api/policies - List all policies
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search')?.toLowerCase() || '';
    const status = searchParams.get('status') || '';
    const scope = searchParams.get('scope') || '';
    const clientId = searchParams.get('clientId') || '';

    let policies = [...mockPolicies];

    // Apply search filter
    if (search) {
        policies = policies.filter(
            (policy) =>
                policy.policyNumber.toLowerCase().includes(search) ||
                policy.client?.name.toLowerCase().includes(search) ||
                policy.client?.nip.includes(search)
        );
    }

    // Apply status filter
    if (status) {
        policies = policies.filter((policy) => policy.status === status);
    }

    // Apply scope filter
    if (scope) {
        policies = policies.filter((policy) => policy.territorialScope === scope);
    }

    // Apply client filter
    if (clientId) {
        policies = policies.filter((policy) => policy.clientId === clientId);
    }

    return NextResponse.json({
        data: policies,
        total: policies.length,
        stats: {
            active: mockPolicies.filter((p) => p.status === 'ACTIVE').length,
            expired: mockPolicies.filter((p) => p.status === 'EXPIRED').length,
            totalPremium: mockPolicies
                .filter((p) => p.status === 'ACTIVE')
                .reduce((sum, p) => sum + p.totalPremium, 0),
        },
    });
}

// POST /api/policies - Create a new policy
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.clientId || !body.sumInsured || !body.territorialScope) {
            return NextResponse.json(
                { error: 'clientId, sumInsured, and territorialScope are required' },
                { status: 400 }
            );
        }

        const newPolicy = {
            id: `policy-${Date.now()}`,
            policyNumber: `OCPD/${new Date().getFullYear()}/${String(Date.now()).slice(-6)}`,
            ...body,
            status: 'DRAFT',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        return NextResponse.json(newPolicy, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: 'Invalid request body' },
            { status: 400 }
        );
    }
}
