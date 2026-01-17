/**
 * POST /api/auth/login
 * Authenticates user and returns JWT token
 *
 * NOTE: This is a simplified implementation for development.
 * Production should integrate with a proper identity provider (NextAuth.js, Clerk, etc.)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAuthToken, AuthUser } from '@/lib/auth/server';
import { RoleType } from '@/lib/auth/roles';

const loginSchema = z.object({
    email: z.string().email('Nieprawidłowy adres email'),
    password: z.string().min(1, 'Hasło jest wymagane'),
});

/**
 * Demo users for development/testing
 * In production, replace with database lookup + proper password hashing (bcrypt/argon2)
 */
const DEMO_USERS: Record<string, { password: string; user: AuthUser }> = {
    'admin@ocpd.local': {
        password: 'admin123',
        user: {
            id: 'user-admin-1',
            email: 'admin@ocpd.local',
            name: 'Administrator',
            role: 'ADMIN' as RoleType,
        },
    },
    'broker@ocpd.local': {
        password: 'broker123',
        user: {
            id: 'user-broker-1',
            email: 'broker@ocpd.local',
            name: 'Jan Kowalski',
            role: 'BROKER' as RoleType,
            brokerId: 'broker-1',
        },
    },
    'underwriter@ocpd.local': {
        password: 'underwriter123',
        user: {
            id: 'user-uw-1',
            email: 'underwriter@ocpd.local',
            name: 'Anna Nowak',
            role: 'UNDERWRITER' as RoleType,
        },
    },
    'supervisor@ocpd.local': {
        password: 'supervisor123',
        user: {
            id: 'user-supervisor-1',
            email: 'supervisor@ocpd.local',
            name: 'Piotr Wiśniewski',
            role: 'SUPERVISOR' as RoleType,
        },
    },
    'client@ocpd.local': {
        password: 'client123',
        user: {
            id: 'user-client-1',
            email: 'client@ocpd.local',
            name: 'ABC Logistics Sp. z o.o.',
            role: 'CLIENT' as RoleType,
            brokerId: 'client-1',
        },
    },
};

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validation = loginSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({
                error: 'Błędy walidacji',
                validationErrors: validation.error.issues.map(i => ({
                    path: i.path.join('.'),
                    message: i.message,
                })),
            }, { status: 400 });
        }

        const { email, password } = validation.data;
        const normalizedEmail = email.toLowerCase().trim();

        // Lookup user (demo implementation - replace with DB in production)
        const demoUser = DEMO_USERS[normalizedEmail];

        // Constant-time comparison would be better, but for demo this is fine
        if (!demoUser || demoUser.password !== password) {
            // Generic error to prevent user enumeration
            return NextResponse.json({
                error: 'Nieprawidłowy email lub hasło',
            }, { status: 401 });
        }

        // Generate JWT token
        const token = createAuthToken(demoUser.user);

        // Set HTTP-only cookie for browser clients
        const response = NextResponse.json({
            success: true,
            user: {
                id: demoUser.user.id,
                email: demoUser.user.email,
                name: demoUser.user.name,
                role: demoUser.user.role,
            },
            // Also return token for API clients (mobile apps, Postman, etc.)
            token,
        });

        response.cookies.set('ocpd_auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24, // 24 hours (matches JWT expiry)
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({
            error: 'Wystąpił błąd podczas logowania',
        }, { status: 500 });
    }
}
