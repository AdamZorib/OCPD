/**
 * POST /api/auth/logout
 * Clears authentication cookie
 */

import { NextResponse } from 'next/server';

export async function POST() {
    const response = NextResponse.json({
        success: true,
        message: 'Wylogowano pomyślnie',
    });

    // Clear the auth cookie
    response.cookies.set('ocpd_auth_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0, // Expire immediately
        path: '/',
    });

    return response;
}

// Also support GET for simple logout links
export async function GET() {
    return POST();
}
