import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { safeJsonParse } from '@/lib/utils/safe-json';
import { getAuthFromRequest, getBrokerId, checkRateLimit, requirePermission } from '@/lib/auth/server';
import { DashboardStats } from '@/types/api';

// GET /api/dashboard - Get dashboard statistics
export async function GET(request: NextRequest) {
    // Auth check
    const auth = getAuthFromRequest(request);
    const authCheck = requirePermission(auth, 'policies:read');
    if (!authCheck.authorized) {
        return NextResponse.json(
            { error: authCheck.error || 'Unauthorized' },
            { status: auth.authenticated ? 403 : 401 }
        );
    }

    // Rate limiting
    const rateLimit = checkRateLimit(auth.user?.id || 'anonymous');
    if (!rateLimit.allowed) {
        return NextResponse.json(
            { error: 'Zbyt wiele żądań. Spróbuj ponownie za chwilę.' },
            { status: 429 }
        );
    }

    try {
        // Build where clause based on user access
        const brokerId = getBrokerId(auth);
        const brokerFilter = brokerId ? { brokerId } : {};

        // Get all data from database
        const [policies, claims, quotes] = await Promise.all([
            prisma.policy.findMany({ where: brokerFilter }),
            prisma.claim.findMany(),
            prisma.quote.findMany({ where: brokerFilter }),
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

        const stats: DashboardStats = {
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
                    validTo: p.validTo?.toISOString() || null,
                    status: p.status as DashboardStats['recentActivity']['newPolicies'][0]['status'],
                    date: p.issuedAt?.toISOString() || null,
                })),
                openClaimsList: openClaims.slice(0, 5).map((c) => ({
                    id: c.id,
                    claimNumber: c.claimNumber,
                    description: c.description,
                    amount: c.claimedAmount,
                    status: c.status as DashboardStats['recentActivity']['openClaimsList'][0]['status'],
                    date: c.reportedDate.toISOString(),
                })),
                pendingQuotesList: pendingQuotes.slice(0, 5).map((q) => {
                    const calcResult = safeJsonParse<{ breakdown?: { totalPremium?: number } }>(
                        q.calculationResultJson,
                        {}
                    );
                    return {
                        id: q.id,
                        clientNIP: q.clientNIP,
                        sumInsured: q.sumInsured,
                        premium: calcResult.breakdown?.totalPremium || null,
                        status: q.status as DashboardStats['recentActivity']['pendingQuotesList'][0]['status'],
                    };
                }),
            },
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
    }
}
