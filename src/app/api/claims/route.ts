import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/claims - List all claims
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || '';
    const clientId = searchParams.get('clientId') || '';
    const policyId = searchParams.get('policyId') || '';

    try {
        // Build where clause
        const where: Record<string, unknown> = {};
        if (status) where.status = status;
        if (clientId) where.clientId = clientId;
        if (policyId) where.policyId = policyId;

        const claims = await prisma.claim.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });

        // Parse JSON fields
        const claimsWithParsedData = claims.map((claim) => ({
            ...claim,
            documents: claim.documentsJson ? JSON.parse(claim.documentsJson) : [],
        }));

        // Calculate stats
        const allClaims = await prisma.claim.findMany();
        const openClaims = allClaims.filter(c => c.status === 'UNDER_REVIEW' || c.status === 'REPORTED');
        const paidClaims = allClaims.filter(c => c.status === 'PAID');
        const totalClaimed = allClaims.reduce((sum, c) => sum + c.claimedAmount, 0);
        const totalPaid = allClaims.reduce((sum, c) => sum + (c.paidAmount || 0), 0);

        return NextResponse.json({
            data: claimsWithParsedData,
            total: claimsWithParsedData.length,
            stats: {
                open: openClaims.length,
                paid: paidClaims.length,
                totalClaimed,
                totalPaid,
            },
        });
    } catch (error) {
        console.error('Error fetching claims:', error);
        return NextResponse.json({ error: 'Failed to fetch claims' }, { status: 500 });
    }
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

        const newClaim = await prisma.claim.create({
            data: {
                claimNumber: `SZK/${new Date().getFullYear()}/${String(Date.now()).slice(-5)}`,
                policyId: body.policyId,
                clientId: body.clientId,
                incidentDate: body.incidentDate ? new Date(body.incidentDate) : new Date(),
                reportedDate: new Date(),
                description: body.description,
                location: body.location || null,
                claimedAmount: body.claimedAmount,
                reservedAmount: body.reservedAmount || null,
                status: 'REPORTED',
                documentsJson: body.documents ? JSON.stringify(body.documents) : null,
            },
        });

        return NextResponse.json({
            ...newClaim,
            documents: newClaim.documentsJson ? JSON.parse(newClaim.documentsJson) : [],
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating claim:', error);
        return NextResponse.json(
            { error: 'Failed to create claim' },
            { status: 500 }
        );
    }
}
