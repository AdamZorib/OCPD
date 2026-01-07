/**
 * Server-side authentication utilities for API routes
 * Uses JWT with HMAC-SHA256 for proper token signing/verification
 */

import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { RoleType, roleHasPermission } from './roles';
import { Permission } from './permissions';

const AUTH_COOKIE_NAME = 'ocpd_auth_token';
const AUTH_HEADER_NAME = 'x-auth-token';

// JWT secret - REQUIRED in production
const JWT_SECRET = process.env.JWT_SECRET;

// Fail fast in production if JWT_SECRET is not set
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
    throw new Error('FATAL: JWT_SECRET environment variable is required in production. Set a strong random string (min 32 chars).');
}

// Use a dev secret only in development
const EFFECTIVE_JWT_SECRET = JWT_SECRET || 'dev-secret-NOT-FOR-PRODUCTION-use-env-var';

// Token expiration
const TOKEN_EXPIRY = '24h';

// Log dev bypass warning ONCE at startup, not per-request
const IS_DEV_BYPASS_ENABLED = process.env.NODE_ENV === 'development' && process.env.DISABLE_AUTH !== 'false';
if (IS_DEV_BYPASS_ENABLED) {
    console.warn('⚠️  AUTH BYPASSED - Development mode. Set DISABLE_AUTH=false to require auth.');
}

export interface AuthUser {
    id: string;
    email: string;
    name: string;
    role: RoleType;
    brokerId?: string;
}

export interface AuthResult {
    authenticated: boolean;
    user?: AuthUser;
    error?: string;
}

// Demo user for development - BROKER role, not admin
const DEV_USER: AuthUser = {
    id: 'dev-user',
    email: 'dev@ocpd.local',
    name: 'Dev User',
    role: 'BROKER',
    brokerId: 'dev-broker',
};

/**
 * Extract and validate auth token from request
 * Uses JWT with proper signature verification
 */
export function getAuthFromRequest(request: NextRequest): AuthResult {
    const cookieToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    const headerToken = request.headers.get(AUTH_HEADER_NAME);
    const token = cookieToken || headerToken;

    if (!token) {
        // Development mode bypass (warning logged once at startup)
        if (IS_DEV_BYPASS_ENABLED) {
            return {
                authenticated: true,
                user: DEV_USER,
            };
        }

        return {
            authenticated: false,
            error: 'Brak tokenu autoryzacji',
        };
    }

    // Verify JWT signature
    try {
        const decoded = jwt.verify(token, EFFECTIVE_JWT_SECRET) as jwt.JwtPayload;

        if (!decoded.id || !decoded.email || !decoded.role) {
            return {
                authenticated: false,
                error: 'Nieprawidłowy token autoryzacji',
            };
        }

        // Validate role is a known role type
        const validRoles: RoleType[] = ['ADMIN', 'UNDERWRITER', 'BROKER', 'SUPERVISOR', 'CLIENT'];
        if (!validRoles.includes(decoded.role as RoleType)) {
            return {
                authenticated: false,
                error: 'Nieznana rola użytkownika',
            };
        }

        return {
            authenticated: true,
            user: {
                id: decoded.id as string,
                email: decoded.email as string,
                name: (decoded.name as string) || decoded.email as string,
                role: decoded.role as RoleType,
                brokerId: decoded.brokerId as string | undefined,
            },
        };
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return { authenticated: false, error: 'Token wygasł' };
        }
        if (error instanceof jwt.JsonWebTokenError) {
            return { authenticated: false, error: 'Nieprawidłowy podpis tokenu' };
        }
        return { authenticated: false, error: 'Błąd weryfikacji tokenu' };
    }
}

/**
 * Check if user has permission to perform an action
 */
export function checkPermission(auth: AuthResult, permission: Permission): boolean {
    if (!auth.authenticated || !auth.user) return false;
    return roleHasPermission(auth.user.role, permission);
}

/**
 * Authorization check - returns error response if not authorized
 */
export function requirePermission(auth: AuthResult, permission: Permission): { authorized: boolean; error?: string } {
    if (!auth.authenticated) {
        return { authorized: false, error: 'Nie zalogowano' };
    }
    if (!checkPermission(auth, permission)) {
        return { authorized: false, error: `Brak uprawnień: ${permission}` };
    }
    return { authorized: true };
}

/**
 * Create a signed JWT token for a user
 */
export function createAuthToken(user: AuthUser): string {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            brokerId: user.brokerId,
        },
        EFFECTIVE_JWT_SECRET,
        { expiresIn: TOKEN_EXPIRY }
    );
}

/**
 * Verify a token without full request context (for testing)
 */
export function verifyToken(token: string): AuthResult {
    try {
        const decoded = jwt.verify(token, EFFECTIVE_JWT_SECRET) as jwt.JwtPayload;
        return {
            authenticated: true,
            user: {
                id: decoded.id as string,
                email: decoded.email as string,
                name: (decoded.name as string) || decoded.email as string,
                role: decoded.role as RoleType,
                brokerId: decoded.brokerId as string | undefined,
            },
        };
    } catch {
        return { authenticated: false, error: 'Invalid token' };
    }
}

/**
 * Check if a route should skip authentication
 */
export function isPublicRoute(pathname: string): boolean {
    const publicRoutes = ['/api/auth/login', '/api/auth/logout', '/api/health'];
    const semiPublicRoutes = ['/api/gus/', '/api/cepik/'];

    const normalized = pathname.replace(/\/$/, '');
    return publicRoutes.some(r => normalized.startsWith(r)) ||
        semiPublicRoutes.some(r => normalized.startsWith(r));
}

/**
 * Get the broker ID from auth context
 */
export function getBrokerId(auth: AuthResult): string | null {
    if (!auth.authenticated || !auth.user) return null;

    // Admins and underwriters can see all data
    if (auth.user.role === 'ADMIN' || auth.user.role === 'UNDERWRITER') {
        return null; // null means "all"
    }

    // Brokers must have a brokerId
    const brokerId = auth.user.brokerId || auth.user.id;
    const reservedIds = ['system', 'admin', 'root', 'dev-admin'];
    if (reservedIds.includes(brokerId.toLowerCase())) {
        return auth.user.id;
    }

    return brokerId;
}

/**
 * Simple in-memory rate limiter
 * ⚠️ Only works for single-instance servers. Use Redis for serverless.
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 100;

export function checkRateLimit(identifier: string): { allowed: boolean; remaining: number } {
    // Cleanup based on map size to avoid integer overflow
    if (rateLimitMap.size > 100) {
        cleanupRateLimitMap();
    }

    const now = Date.now();
    const record = rateLimitMap.get(identifier);

    if (!record || now > record.resetTime) {
        rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
        return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
    }

    if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
        return { allowed: false, remaining: 0 };
    }

    record.count++;
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - record.count };
}

function cleanupRateLimitMap() {
    const now = Date.now();
    for (const [key, value] of rateLimitMap.entries()) {
        if (now > value.resetTime) {
            rateLimitMap.delete(key);
        }
    }
}
