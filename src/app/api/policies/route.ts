import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/policies - List all policies
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search')?.toLowerCase() || '';
    const status = searchParams.get('status') || '';
    const scope = searchParams.get('scope') || '';
    const clientId = searchParams.get('clientId') || '';

    try {
        // Build where clause
        const where: Record<string, unknown> = {};
        if (status) where.status = status;
        if (scope) where.territorialScope = scope;
        if (clientId) where.clientId = clientId;

        const policies = await prisma.policy.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });

        // Apply search filter in memory
        let filteredPolicies = policies;
        if (search) {
            filteredPolicies = policies.filter(
                (policy) =>
                    policy.policyNumber.toLowerCase().includes(search) ||
                    (policy.clientName && policy.clientName.toLowerCase().includes(search)) ||
                    policy.clientNIP.includes(search)
            );
        }

        // Parse JSON fields and add client info for response
        const policiesWithParsedData = filteredPolicies.map((policy) => ({
            ...policy,
            clauses: policy.clausesJson ? JSON.parse(policy.clausesJson) : [],
            client: {
                id: policy.clientId,
                name: policy.clientName,
                nip: policy.clientNIP,
            },
        }));

        // Calculate stats
        const allPolicies = await prisma.policy.findMany();
        const activePolicies = allPolicies.filter(p => p.status === 'ACTIVE');
        const expiredPolicies = allPolicies.filter(p => p.status === 'EXPIRED');
        const totalPremium = activePolicies.reduce((sum, p) => sum + (p.totalPremium || 0), 0);

        return NextResponse.json({
            data: policiesWithParsedData,
            total: policiesWithParsedData.length,
            stats: {
                active: activePolicies.length,
                expired: expiredPolicies.length,
                totalPremium,
            },
        });
    } catch (error) {
        console.error('Error fetching policies:', error);
        return NextResponse.json({ error: 'Failed to fetch policies' }, { status: 500 });
    }
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

        // Get client info if available
        let clientName = body.clientName;
        let clientNIP = body.clientNIP;

        if (body.clientId && (!clientName || !clientNIP)) {
            const client = await prisma.client.findUnique({
                where: { id: body.clientId },
            });
            if (client) {
                clientName = clientName || client.name;
                clientNIP = clientNIP || client.nip;
            }
        }

        const newPolicy = await prisma.policy.create({
            data: {
                policyNumber: `OCPD/${new Date().getFullYear()}/${String(Date.now()).slice(-6)}`,
                clientId: body.clientId,
                clientNIP: clientNIP || '',
                clientName: clientName || null,
                type: body.type || 'OCPD',
                status: 'DRAFT',
                sumInsured: body.sumInsured,
                territorialScope: body.territorialScope,
                basePremium: body.basePremium || null,
                clausesPremium: body.clausesPremium || null,
                totalPremium: body.totalPremium || null,
                clausesJson: body.clauses ? JSON.stringify(body.clauses) : null,
                validFrom: body.validFrom ? new Date(body.validFrom) : null,
                validTo: body.validTo ? new Date(body.validTo) : null,
                brokerId: 'broker-1',
            },
        });

        return NextResponse.json({
            ...newPolicy,
            clauses: newPolicy.clausesJson ? JSON.parse(newPolicy.clausesJson) : [],
            client: {
                id: newPolicy.clientId,
                name: newPolicy.clientName,
                nip: newPolicy.clientNIP,
            },
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating policy:', error);
        return NextResponse.json(
            { error: 'Failed to create policy' },
            { status: 500 }
        );
    }
}
