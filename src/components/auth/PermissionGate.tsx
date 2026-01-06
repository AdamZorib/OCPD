'use client';

import { ReactNode } from 'react';
import { Permission, useAuth } from '@/lib/auth';

interface PermissionGateProps {
    /** Single permission or array of permissions to check */
    permission?: Permission;
    permissions?: Permission[];
    /** If true, user must have ALL permissions. If false (default), user needs ANY permission */
    requireAll?: boolean;
    /** What to show if user doesn't have permission */
    fallback?: ReactNode;
    /** Content to show if user has permission */
    children: ReactNode;
}

/**
 * Conditionally render content based on user permissions
 * 
 * @example
 * // Single permission
 * <PermissionGate permission="policies:issue">
 *   <IssueButton />
 * </PermissionGate>
 * 
 * @example
 * // Multiple permissions (any)
 * <PermissionGate permissions={['policies:issue', 'policies:cancel']}>
 *   <PolicyActions />
 * </PermissionGate>
 * 
 * @example
 * // Multiple permissions (all required)
 * <PermissionGate permissions={['underwriting:view', 'underwriting:approve']} requireAll>
 *   <ApprovalPanel />
 * </PermissionGate>
 */
export default function PermissionGate({
    permission,
    permissions,
    requireAll = false,
    fallback = null,
    children,
}: PermissionGateProps) {
    const { hasPermission, hasAnyPermission, hasAllPermissions, isAuthenticated } = useAuth();

    // Not authenticated - never show protected content
    if (!isAuthenticated) {
        return <>{fallback}</>;
    }

    // Single permission check
    if (permission) {
        return hasPermission(permission) ? <>{children}</> : <>{fallback}</>;
    }

    // Multiple permissions check
    if (permissions && permissions.length > 0) {
        const hasAccess = requireAll
            ? hasAllPermissions(permissions)
            : hasAnyPermission(permissions);

        return hasAccess ? <>{children}</> : <>{fallback}</>;
    }

    // No permissions specified - show content
    return <>{children}</>;
}
