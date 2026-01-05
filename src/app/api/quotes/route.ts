import { NextRequest, NextResponse } from 'next/server';
import { mockQuotes } from '@/lib/mock-data';

// GET /api/quotes - List all quotes
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || '';

    let quotes = [...mockQuotes];

    if (status) {
        quotes = quotes.filter((quote) => quote.status === status);
    }

    return NextResponse.json({
        data: quotes,
        total: quotes.length,
    });
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

        const newQuote = {
            id: `quote-${Date.now()}`,
            ...body,
            status: 'DRAFT',
            createdAt: new Date(),
            brokerId: 'broker-1', // In a real app, this would come from auth
        };

        return NextResponse.json(newQuote, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: 'Invalid request body' },
            { status: 400 }
        );
    }
}
