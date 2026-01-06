'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Permission, RoleType, useAuth } from '@/lib/auth';
import { Shield, AlertCircle } from 'lucide-react';
import { Card, CardContent, Button } from '@/components/ui';

interface ProtectedRouteProps {
    /** Required permission(s) to access this route */
    permission?: Permission;
    permissions?: Permission[];
    /** Required role(s) to access this route */
    role?: RoleType;
    roles?: RoleType[];
    /** If true for permissions, user must have ALL. For roles, user must be ANY of the roles */
    requireAll?: boolean;
    /** Custom access denied component */
    accessDeniedComponent?: ReactNode;
    /** Redirect URL when not authenticated (default: /login) */
    loginUrl?: string;
    /** Children to render if access is granted */
    children: ReactNode;
}

/**
 * Protect an entire page/route based on authentication and permissions
 * 
 * @example
 * // Require specific permission
 * <ProtectedRoute permission="underwriting:view">
 *   <UnderwritingPage />
 * </ProtectedRoute>
 * 
 * @example
 * // Require specific role
 * <ProtectedRoute roles={['UNDERWRITER', 'ADMIN']}>
 *   <UnderwritingPage />
 * </ProtectedRoute>
 */
export default function ProtectedRoute({
    permission,
    permissions,
    role,
    roles,
    requireAll = false,
    accessDeniedComponent,
    loginUrl = '/login',
    children,
}: ProtectedRouteProps) {
    const router = useRouter();
    const { user, isAuthenticated, isLoading, hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();

    // Still loading auth state
    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '50vh'
            }}>
                <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                    <Shield size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p>Weryfikacja dostępu...</p>
                </div>
            </div>
        );
    }

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
        // Client-side redirect
        if (typeof window !== 'undefined') {
            router.push(loginUrl);
        }
        return null;
    }

    // Check role-based access
    if (role || roles) {
        const allowedRoles = role ? [role] : roles || [];
        const hasRoleAccess = allowedRoles.includes(user!.role);

        if (!hasRoleAccess) {
            return accessDeniedComponent || <AccessDenied />;
        }
    }

    // Check permission-based access
    if (permission || permissions) {
        const permissionsList = permission ? [permission] : permissions || [];
        const hasAccess = requireAll
            ? hasAllPermissions(permissionsList)
            : hasAnyPermission(permissionsList);

        if (!hasAccess) {
            return accessDeniedComponent || <AccessDenied />;
        }
    }

    // Access granted
    return <>{children}</>;
}

/**
 * Default Access Denied component
 */
function AccessDenied() {
    const router = useRouter();
    const { user } = useAuth();

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh',
            padding: 'var(--spacing-xl)',
        }}>
            <Card padding="lg" style={{ maxWidth: '500px', textAlign: 'center' }}>
                <CardContent>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginBottom: 'var(--spacing-lg)'
                    }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: 'rgba(239, 68, 68, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <AlertCircle size={40} style={{ color: 'var(--color-danger, #ef4444)' }} />
                        </div>
                    </div>

                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: '600',
                        marginBottom: 'var(--spacing-sm)',
                        color: 'var(--color-text-primary)',
                    }}>
                        Brak dostępu
                    </h2>

                    <p style={{
                        color: 'var(--color-text-secondary)',
                        marginBottom: 'var(--spacing-lg)',
                        lineHeight: '1.6',
                    }}>
                        Nie masz uprawnień do wyświetlenia tej strony.
                        {user && (
                            <> Twoja rola: <strong>{user.role}</strong>.</>
                        )}
                    </p>

                    <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center' }}>
                        <Button variant="secondary" onClick={() => router.back()}>
                            Wróć
                        </Button>
                        <Button onClick={() => router.push('/')}>
                            Strona główna
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
