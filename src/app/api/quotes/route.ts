import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/quotes - List all quotes
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || '';

    try {
        const quotes = await prisma.quote.findMany({
            where: status ? { status } : undefined,
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({
            data: quotes.map((q) => ({
                ...q,
                apkData: q.apkDataJson ? JSON.parse(q.apkDataJson) : null,
                calculationResult: q.calculationResultJson ? JSON.parse(q.calculationResultJson) : null,
                vehicles: q.vehiclesJson ? JSON.parse(q.vehiclesJson) : [],
                selectedClauses: q.selectedClauses ? q.selectedClauses.split(',') : [],
            })),
            total: quotes.length,
        });
    } catch (error) {
        console.error('Error fetching quotes:', error);
        return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 });
    }
}

// POST /api/quotes - Create a new quote request
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.clientNIP || !body.requestedSumInsured || !body.requestedScope) {
            return NextResponse.json(
                { error: 'clientNIP, requestedSumInsured, and requestedScope are required' },
                { status: 400 }
            );
        }

        const newQuote = await prisma.quote.create({
            data: {
                clientNIP: body.clientNIP,
                clientName: body.clientName || null,
                clientEmail: body.clientEmail || null,
                clientPhone: body.clientPhone || null,
                clientStreet: body.clientStreet || null,
                clientHouseNumber: body.clientHouseNumber || null,
                clientApartmentNumber: body.clientApartmentNumber || null,
                clientCity: body.clientCity || null,
                clientPostalCode: body.clientPostalCode || null,
                clientVoivodeship: body.clientVoivodeship || null,
                yearsInBusiness: body.yearsInBusiness || null,
                fleetSize: body.fleetSize || null,
                sumInsured: body.requestedSumInsured,
                territorialScope: body.requestedScope,
                policyDuration: body.policyDuration || null,
                cargoType: body.cargoType || null,
                subcontractorPercent: body.subcontractorPercent || null,
                paymentInstallments: body.paymentInstallments || null,
                deductibleLevel: body.deductibleLevel || null,
                apkDataJson: body.apkData ? JSON.stringify(body.apkData) : null,
                selectedClauses: body.requestedClauses ? body.requestedClauses.join(',') : null,
                selectedVariant: body.selectedVariant || null,
                calculationResultJson: body.calculationResult ? JSON.stringify(body.calculationResult) : null,
                vehiclesJson: body.vehicles ? JSON.stringify(body.vehicles) : null,
                status: body.status || 'DRAFT',
                brokerId: 'broker-1', // In a real app, this would come from auth
            },
        });

        return NextResponse.json(newQuote, { status: 201 });
    } catch (error) {
        console.error('Error creating quote:', error);
        return NextResponse.json({ error: 'Failed to create quote' }, { status: 500 });
    }
}
