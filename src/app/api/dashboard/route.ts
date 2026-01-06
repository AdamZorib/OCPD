import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/dashboard - Get dashboard statistics
export async function GET() {
    try {
        // Get all data from database
        const [policies, claims, quotes] = await Promise.all([
            prisma.policy.findMany(),
            prisma.claim.findMany(),
            prisma.quote.findMany(),
        ]);

        // Calculate active policies
        const activePolicies = policies.filter((p) => p.status === 'ACTIVE');

        // Calculate expiring policies
        const now = Date.now();
        const thirtyDaysFromNow = now + 30 * 24 * 60 * 60 * 1000;
        const sixtyDaysFromNow = now + 60 * 24 * 60 * 60 * 1000;

        const expiringPolicies30Days = activePolicies.filter((p) => {
            if (!p.validTo) return false;
            const expiryTime = new Date(p.validTo).getTime();
            return expiryTime > now && expiryTime <= thirtyDaysFromNow;
        });

        const expiringPolicies60Days = activePolicies.filter((p) => {
            if (!p.validTo) return false;
            const expiryTime = new Date(p.validTo).getTime();
            return expiryTime > now && expiryTime <= sixtyDaysFromNow;
        });

        // Claims stats
        const openClaims = claims.filter(
            (c) => c.status === 'UNDER_REVIEW' || c.status === 'REPORTED'
        );

        // Quotes stats
        const pendingQuotes = quotes.filter(
            (q) => q.status === 'CALCULATED' || q.status === 'SENT'
        );

        // Calculate totals
        const totalPremium = activePolicies.reduce((sum, p) => sum + (p.totalPremium || 0), 0);
        const totalClaims = claims.reduce((sum, c) => sum + (c.paidAmount || 0), 0);
        const claimsRatio = totalPremium > 0 ? totalClaims / totalPremium : 0;

        // Get top clients by premium
        const clientPremiums: Record<string, { name: string; premium: number }> = {};
        for (const policy of activePolicies) {
            const key = policy.clientId;
            if (!clientPremiums[key]) {
                clientPremiums[key] = { name: policy.clientName || 'Unknown', premium: 0 };
            }
            clientPremiums[key].premium += policy.totalPremium || 0;
        }
        const topClients = Object.values(clientPremiums)
            .sort((a, b) => b.premium - a.premium)
            .slice(0, 4);

        const stats = {
            activePolicies: activePolicies.length,
            expiringPolicies30Days: expiringPolicies30Days.length,
            expiringPolicies60Days: expiringPolicies60Days.length,
            totalPremium,
            pendingQuotes: pendingQuotes.length,
            openClaims: openClaims.length,
            claimsRatio,
            topClients,
            recentActivity: {
                newPolicies: activePolicies.slice(0, 5).map((p) => ({
                    id: p.id,
                    policyNumber: p.policyNumber,
                    clientName: p.clientName,
                    premium: p.totalPremium,
                    validTo: p.validTo,
                    status: p.status,
                    date: p.issuedAt,
                })),
                openClaimsList: openClaims.slice(0, 5).map((c) => ({
                    id: c.id,
                    claimNumber: c.claimNumber,
                    description: c.description,
                    amount: c.claimedAmount,
                    status: c.status,
                    date: c.reportedDate,
                })),
                pendingQuotesList: pendingQuotes.slice(0, 5).map((q) => ({
                    id: q.id,
                    clientNIP: q.clientNIP,
                    sumInsured: q.sumInsured,
                    premium: q.calculationResultJson
                        ? JSON.parse(q.calculationResultJson).totalPremium
                        : null,
                    status: q.status,
                })),
            },
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
    }
}
