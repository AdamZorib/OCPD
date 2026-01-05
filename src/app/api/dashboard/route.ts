import { NextRequest, NextResponse } from 'next/server';
import { mockDashboardStats, mockPolicies, mockClaims, mockQuotes } from '@/lib/mock-data';

// GET /api/dashboard - Get dashboard statistics
export async function GET() {
    // Calculate real-time stats
    const activePolicies = mockPolicies.filter((p) => p.status === 'ACTIVE');

    const now = Date.now();
    const thirtyDaysFromNow = now + 30 * 24 * 60 * 60 * 1000;
    const sixtyDaysFromNow = now + 60 * 24 * 60 * 60 * 1000;

    const expiringPolicies30Days = activePolicies.filter((p) => {
        const expiryTime = p.validTo.getTime();
        return expiryTime > now && expiryTime <= thirtyDaysFromNow;
    });

    const expiringPolicies60Days = activePolicies.filter((p) => {
        const expiryTime = p.validTo.getTime();
        return expiryTime > now && expiryTime <= sixtyDaysFromNow;
    });

    const openClaims = mockClaims.filter(
        (c) => c.status === 'UNDER_REVIEW' || c.status === 'REPORTED'
    );

    const pendingQuotes = mockQuotes.filter(
        (q) => q.status === 'CALCULATED' || q.status === 'SENT'
    );

    const totalPremium = activePolicies.reduce((sum, p) => sum + p.totalPremium, 0);
    const totalClaims = mockClaims.reduce((sum, c) => sum + (c.paidAmount || 0), 0);
    const claimsRatio = totalPremium > 0 ? totalClaims / totalPremium : 0;

    const stats = {
        activePolicies: activePolicies.length,
        expiringPolicies30Days: expiringPolicies30Days.length,
        expiringPolicies60Days: expiringPolicies60Days.length,
        totalPremium,
        pendingQuotes: pendingQuotes.length,
        openClaims: openClaims.length,
        claimsRatio,
        topClients: mockDashboardStats.topClients,
        recentActivity: {
            newPolicies: activePolicies.slice(0, 5).map((p) => ({
                id: p.id,
                policyNumber: p.policyNumber,
                clientName: p.client?.name,
                premium: p.totalPremium,
                date: p.issuedAt,
            })),
            openClaimsList: openClaims.slice(0, 5).map((c) => ({
                id: c.id,
                claimNumber: c.claimNumber,
                amount: c.claimedAmount,
                status: c.status,
                date: c.reportedDate,
            })),
            pendingQuotesList: pendingQuotes.slice(0, 5).map((q) => ({
                id: q.id,
                clientNIP: q.clientNIP,
                sumInsured: q.requestedSumInsured,
                premium: q.calculatedPremium,
                status: q.status,
            })),
        },
    };

    return NextResponse.json(stats);
}
