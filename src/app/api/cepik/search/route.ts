import { NextRequest, NextResponse } from 'next/server';
import { searchVehicle } from '@/lib/cepik';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const reg = searchParams.get('reg');

    if (!reg) {
        return NextResponse.json(
            { error: 'Registration number (reg) is required' },
            { status: 400 }
        );
    }

    try {
        const vehicle = await searchVehicle(reg);

        if (!vehicle) {
            return NextResponse.json(
                { error: 'Vehicle not found in CEPiK database' },
                { status: 404 }
            );
        }

        return NextResponse.json({ data: vehicle });
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error while searching CEPiK' },
            { status: 500 }
        );
    }
}
