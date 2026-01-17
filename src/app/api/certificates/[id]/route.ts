import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest, checkRateLimit, requirePermission, getBrokerId } from '@/lib/auth/server';

// GET /api/certificates/[id] - Get a single certificate
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const auth = getAuthFromRequest(request);
    const authCheck = requirePermission(auth, 'certificates:read');
    if (!authCheck.authorized) {
        return NextResponse.json(
            { error: authCheck.error || 'Unauthorized' },
            { status: auth.authenticated ? 403 : 401 }
        );
    }

    const rateLimit = checkRateLimit(auth.user?.id || 'anonymous');
    if (!rateLimit.allowed) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    try {
        // Note: For GET, we still filter by brokerId for non-admins
        // This is intentional - brokers should only see their own certificates
        const isAdmin = auth.user?.role === 'ADMIN' || auth.user?.role === 'UNDERWRITER';
        const brokerId = isAdmin ? null : (auth.user?.brokerId || auth.user?.id);

        const certificate = await prisma.insuranceCertificate.findFirst({
            where: brokerId
                ? { id, brokerId, deletedAt: null }
                : { id, deletedAt: null },
            include: {
                policy: {
                    select: {
                        id: true,
                        policyNumber: true,
                        status: true,
                        validTo: true,
                        sumInsured: true,
                        territorialScope: true
                    }
                },
                client: {
                    select: {
                        id: true,
                        name: true,
                        nip: true,
                        email: true,
                        phone: true
                    }
                }
            }
        });

        if (!certificate) {
            return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
        }

        return NextResponse.json(certificate);
    } catch (error) {
        console.error('Error fetching certificate:', error);
        return NextResponse.json({ error: 'Failed to fetch certificate' }, { status: 500 });
    }
}

// DELETE /api/certificates/[id] - Soft delete a certificate (ADMIN ONLY)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const auth = getAuthFromRequest(request);

    // Only admins can delete certificates - clear authorization model
    const authCheck = requirePermission(auth, 'admin:settings');
    if (!authCheck.authorized) {
        return NextResponse.json(
            { error: 'Tylko administratorzy mogą usuwać certyfikaty' },
            { status: 403 }
        );
    }

    const rateLimit = checkRateLimit(auth.user?.id || 'anonymous');
    if (!rateLimit.allowed) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    try {
        // Admins can delete any certificate - no brokerId filter
        const existing = await prisma.insuranceCertificate.findFirst({
            where: { id, deletedAt: null }
        });

        if (!existing) {
            return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
        }

        await prisma.insuranceCertificate.update({
            where: { id },
            data: { deletedAt: new Date() }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting certificate:', error);
        return NextResponse.json({ error: 'Failed to delete certificate' }, { status: 500 });
    }
}

// Validation schema for revocation
const revokeSchema = z.object({
    reason: z.string()
        .min(10, 'Powód unieważnienia musi mieć co najmniej 10 znaków')
        .max(500, 'Powód unieważnienia nie może przekraczać 500 znaków'),
});

// PATCH /api/certificates/[id] - Revoke a certificate (UNDERWRITER/ADMIN)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const auth = getAuthFromRequest(request);

    // Require certificates:revoke permission
    const authCheck = requirePermission(auth, 'certificates:revoke');
    if (!authCheck.authorized) {
        return NextResponse.json(
            { error: authCheck.error || 'Brak uprawnień do unieważniania certyfikatów' },
            { status: auth.authenticated ? 403 : 401 }
        );
    }

    const rateLimit = checkRateLimit(auth.user?.id || 'anonymous');
    if (!rateLimit.allowed) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    try {
        const body = await request.json();
        const validation = revokeSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({
                error: 'Błędy walidacji',
                validationErrors: validation.error.issues.map(i => ({
                    path: i.path.join('.'),
                    message: i.message,
                })),
            }, { status: 400 });
        }

        const { reason } = validation.data;
        const brokerId = getBrokerId(auth);

        // Find the certificate - admins/underwriters can revoke any, brokers only their own
        const whereClause = brokerId
            ? { id, brokerId, deletedAt: null }
            : { id, deletedAt: null };

        const existing = await prisma.insuranceCertificate.findFirst({
            where: whereClause,
        });

        if (!existing) {
            return NextResponse.json({ error: 'Certyfikat nie znaleziony' }, { status: 404 });
        }

        // Check if already revoked
        if (existing.status === 'REVOKED') {
            return NextResponse.json({ error: 'Certyfikat został już unieważniony' }, { status: 400 });
        }

        // Perform revocation
        const updated = await prisma.insuranceCertificate.update({
            where: { id },
            data: {
                status: 'REVOKED',
                revokedAt: new Date(),
                revokedById: auth.user?.id || null,
                revocationReason: reason,
            },
            include: {
                policy: {
                    select: {
                        policyNumber: true,
                    }
                },
                client: {
                    select: {
                        name: true,
                        nip: true,
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            certificate: updated,
            message: 'Certyfikat został unieważniony',
        });
    } catch (error) {
        console.error('Error revoking certificate:', error);
        return NextResponse.json({ error: 'Nie udało się unieważnić certyfikatu' }, { status: 500 });
    }
}
