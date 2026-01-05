import { NextRequest, NextResponse } from 'next/server';
import { mockClaims } from '@/lib/mock-data';

// GET /api/claims - List all claims
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || '';
    const clientId = searchParams.get('clientId') || '';
    const policyId = searchParams.get('policyId') || '';

    let claims = [...mockClaims];

    if (status) {
        claims = claims.filter((claim) => claim.status === status);
    }

    if (clientId) {
        claims = claims.filter((claim) => claim.clientId === clientId);
    }

    if (policyId) {
        claims = claims.filter((claim) => claim.policyId === policyId);
    }

    return NextResponse.json({
        data: claims,
        total: claims.length,
        stats: {
            open: mockClaims.filter((c) => c.status === 'UNDER_REVIEW' || c.status === 'REPORTED').length,
            paid: mockClaims.filter((c) => c.status === 'PAID').length,
            totalClaimed: mockClaims.reduce((sum, c) => sum + c.claimedAmount, 0),
            totalPaid: mockClaims.reduce((sum, c) => sum + (c.paidAmount || 0), 0),
        },
    });
}

// POST /api/claims - Report a new claim
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.policyId || !body.clientId || !body.description || !body.claimedAmount) {
            return NextResponse.json(
                { error: 'policyId, clientId, description, and claimedAmount are required' },
                { status: 400 }
            );
        }

        const newClaim = {
            id: `claim-${Date.now()}`,
            claimNumber: `SZK/${new Date().getFullYear()}/${String(Date.now()).slice(-5)}`,
            ...body,
            incidentDate: body.incidentDate ? new Date(body.incidentDate) : new Date(),
            reportedDate: new Date(),
            status: 'REPORTED',
            documents: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        return NextResponse.json(newClaim, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: 'Invalid request body' },
            { status: 400 }
        );
    }
}
