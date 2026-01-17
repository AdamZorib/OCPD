/**
 * Next.js Middleware for API Authentication
 * Provides centralized auth checks instead of per-route code
 * 
 * NOTE: Full JWT verification happens in route handlers because jsonwebtoken
 * is not compatible with Edge runtime. Middleware only checks token presence.
 */

import { NextRequest, NextResponse } from 'next/server';

// Public routes that don't require authentication (prefix matching)
const PUBLIC_ROUTE_PREFIXES = [
    '/api/auth/login',
    '/api/auth/logout',
    '/api/health',
];

// Semi-public routes (rate-limited but no auth required)
const SEMI_PUBLIC_ROUTE_PREFIXES = [
    '/api/gus/',
    '/api/cepik/',
];

/**
 * Normalize pathname for consistent matching
 * Removes trailing slashes and query parameters
 */
function normalizePath(pathname: string): string {
    return pathname.replace(/\/$/, '').split('?')[0];
}

/**
 * Check if path matches any prefix in the list
 */
function matchesAnyPrefix(pathname: string, prefixes: string[]): boolean {
    const normalized = normalizePath(pathname);
    return prefixes.some(prefix =>
        normalized === prefix || normalized.startsWith(prefix + '/')
    );
}

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // Only process API routes (config.matcher handles this, but be explicit)
    if (!pathname.startsWith('/api/')) {
        return NextResponse.next();
    }

    // Allow public routes without any checks
    if (matchesAnyPrefix(pathname, PUBLIC_ROUTE_PREFIXES)) {
        return NextResponse.next();
    }

    // Allow semi-public routes
    if (matchesAnyPrefix(pathname, SEMI_PUBLIC_ROUTE_PREFIXES)) {
        return NextResponse.next();
    }

    // SECURITY FIX: Dev bypass now requires explicit DISABLE_AUTH=true
    const IS_DEV_MODE = process.env.NODE_ENV?.toLowerCase() === 'development';
    const IS_DEV_BYPASS = IS_DEV_MODE && process.env.DISABLE_AUTH === 'true';

    if (IS_DEV_BYPASS) {
        const response = NextResponse.next();
        response.headers.set('X-Auth-Dev-Bypass', 'true');
        return response;
    }

    // For protected API routes, require token presence
    // Full JWT verification happens in route handlers (jsonwebtoken not Edge-compatible)
    const cookieToken = request.cookies.get('ocpd_auth_token')?.value;
    const headerToken = request.headers.get('x-auth-token');
    const hasToken = cookieToken || headerToken;

    if (!hasToken) {
        return NextResponse.json(
            { error: 'Brak tokenu autoryzacji' },
            { status: 401 }
        );
    }

    // Token exists - let route handler do full JWT verification
    return NextResponse.next();
}

// Configure which routes this middleware applies to
export const config = {
    matcher: ['/api/:path*'],
};
