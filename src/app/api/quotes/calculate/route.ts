import { NextRequest, NextResponse } from 'next/server';
import { calculatePremium, CalculationInput, quickQuote } from '@/lib/underwriting/calculator';
import { TerritorialScope, ClauseType, APKData } from '@/types';

// POST /api/quotes/calculate - Calculate premium for a quote
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.sumInsured || !body.territorialScope) {
            return NextResponse.json(
                { error: 'sumInsured and territorialScope are required' },
                { status: 400 }
            );
        }

        // Validate territorial scope
        const validScopes: TerritorialScope[] = ['POLAND', 'EUROPE', 'WORLD'];
        if (!validScopes.includes(body.territorialScope)) {
            return NextResponse.json(
                { error: `Invalid territorialScope. Must be one of: ${validScopes.join(', ')}` },
                { status: 400 }
            );
        }

        // Quick quote (simple calculation)
        if (body.quickQuote) {
            const result = quickQuote(body.sumInsured, body.territorialScope);
            return NextResponse.json({
                type: 'quick',
                ...result,
            });
        }

        // Full calculation
        const input: CalculationInput = {
            sumInsured: body.sumInsured,
            territorialScope: body.territorialScope,
            selectedClauses: body.selectedClauses || [],
            apkData: body.apkData || {},
            yearsInBusiness: body.yearsInBusiness || 1,
            fleetSize: body.fleetSize || 1,
        };

        const result = calculatePremium(input);

        return NextResponse.json({
            type: 'full',
            input: {
                sumInsured: input.sumInsured,
                territorialScope: input.territorialScope,
                selectedClauses: input.selectedClauses,
                yearsInBusiness: input.yearsInBusiness,
                fleetSize: input.fleetSize,
            },
            result: {
                breakdown: result.breakdown,
                riskLevel: result.riskLevel,
                isAutoApproved: result.isAutoApproved,
                referralReasons: result.referralReasons,
                minimumPremium: result.minimumPremium,
            },
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Invalid request body' },
            { status: 400 }
        );
    }
}
