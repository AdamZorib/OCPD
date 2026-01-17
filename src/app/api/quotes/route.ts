import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { safeJsonParse } from '@/lib/utils/safe-json';
import { toNumber } from '@/lib/utils/decimal';
import { createQuoteSchema, validateInput } from '@/lib/validation/schemas';
import { getAuthFromRequest, getBrokerId, checkRateLimit, requirePermission } from '@/lib/auth/server';
import { QuoteListResponse, QuoteResponse, ApiValidationError } from '@/types/api';

// GET /api/quotes - List all quotes
export async function GET(request: NextRequest) {
    // Auth check
    const auth = getAuthFromRequest(request);
    const authCheck = requirePermission(auth, 'quotes:read');
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

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || '';

    try {
        // Build where clause based on user access
        const brokerId = getBrokerId(auth);
        const where: Record<string, unknown> = {};

        if (brokerId) where.brokerId = brokerId;
        if (status) where.status = status;

        const quotes = await prisma.quote.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });

        const quotesWithParsedData: QuoteResponse[] = quotes.map((q) => ({
            ...q,
            sumInsured: toNumber(q.sumInsured),
            apkData: safeJsonParse(q.apkDataJson, null),
            calculationResult: safeJsonParse(q.calculationResultJson, null),
            vehicles: safeJsonParse(q.vehiclesJson, []),
            selectedClauses: q.selectedClauses ? q.selectedClauses.split(',').filter(Boolean) : [],
            createdAt: q.createdAt.toISOString(),
            updatedAt: q.updatedAt.toISOString(),
        }));

        const response: QuoteListResponse = {
            data: quotesWithParsedData,
            total: quotesWithParsedData.length,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching quotes:', error);
        return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 });
    }
}

// POST /api/quotes - Create a new quote request
export async function POST(request: NextRequest) {
    // Auth check
    const auth = getAuthFromRequest(request);
    const authCheck = requirePermission(auth, 'quotes:create');
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
        const body = await request.json();

        // Validate input with Zod - this handles all validation including
        // positive numbers, date ranges, XSS sanitization, etc.
        const validation = validateInput(createQuoteSchema, body);
        if (!validation.success) {
            const errorResponse: ApiValidationError = {
                error: 'Błędy walidacji',
                validationErrors: validation.errors || [],
            };
            return NextResponse.json(errorResponse, { status: 400 });
        }

        const data = validation.data!;

        // No duplicate validation - Zod already validated:
        // - sumInsured > 0 and >= 50000
        // - fleetSize >= 1 (if provided)
        // - validFrom < validTo (if both provided)

        const newQuote = await prisma.quote.create({
            data: {
                clientNIP: data.clientNIP,
                clientName: data.clientName || null,
                clientEmail: data.clientEmail || null,
                clientPhone: data.clientPhone || null,
                clientStreet: data.clientStreet || null,
                clientHouseNumber: data.clientHouseNumber || null,
                clientApartmentNumber: data.clientApartmentNumber || null,
                clientCity: data.clientCity || null,
                clientPostalCode: data.clientPostalCode || null,
                clientVoivodeship: data.clientVoivodeship || null,
                yearsInBusiness: data.yearsInBusiness || null,
                fleetSize: data.fleetSize || null,
                sumInsured: data.sumInsured, // Aligned field name
                territorialScope: data.territorialScope, // Aligned field name
                policyDuration: data.policyDuration || null,
                cargoType: data.cargoType || null,
                subcontractorPercent: data.subcontractorPercent || null,
                paymentInstallments: typeof data.paymentInstallments === 'string'
                    ? parseInt(data.paymentInstallments)
                    : data.paymentInstallments || null,
                deductibleLevel: data.deductibleLevel || null,
                apkDataJson: data.apkData ? JSON.stringify(data.apkData) : null,
                selectedClauses: data.selectedClauses ? data.selectedClauses.join(',') : null,
                selectedVariant: data.selectedVariant || null,
                calculationResultJson: data.calculationResult ? JSON.stringify(data.calculationResult) : null,
                vehiclesJson: data.vehicles ? JSON.stringify(data.vehicles) : null,
                status: data.status || 'DRAFT',
                brokerId: auth.user?.brokerId || auth.user?.id || 'system',
            },
        });

        const response: QuoteResponse = {
            ...newQuote,
            sumInsured: toNumber(newQuote.sumInsured),
            apkData: safeJsonParse(newQuote.apkDataJson, null),
            calculationResult: safeJsonParse(newQuote.calculationResultJson, null),
            vehicles: safeJsonParse(newQuote.vehiclesJson, []),
            selectedClauses: newQuote.selectedClauses ? newQuote.selectedClauses.split(',').filter(Boolean) : [],
            createdAt: newQuote.createdAt.toISOString(),
            updatedAt: newQuote.updatedAt.toISOString(),
        };

        return NextResponse.json(response, { status: 201 });
    } catch (error) {
        console.error('Error creating quote:', error);
        return NextResponse.json({ error: 'Failed to create quote' }, { status: 500 });
    }
}
