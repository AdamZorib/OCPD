// Role Definitions for OCPD Insurance Platform
// Each role has a set of assigned permissions

import { Permission } from './permissions';

export type RoleType = 'BROKER' | 'UNDERWRITER' | 'ADMIN' | 'CLIENT' | 'SUPERVISOR';

export interface RoleDefinition {
    type: RoleType;
    namePL: string;
    nameEN: string;
    descriptionPL: string;
    color: string;
    permissions: Permission[];
    isSystemRole: boolean; // System roles cannot be modified
}

/**
 * Default role definitions
 * Permissions are explicitly listed for each role (no wildcards for clarity)
 */
export const ROLES: Record<RoleType, RoleDefinition> = {
    BROKER: {
        type: 'BROKER',
        namePL: 'Broker',
        nameEN: 'Broker',
        descriptionPL: 'Sprzedaż polis, obsługa klientów, wystawianie certyfikatów',
        color: '#3b82f6', // blue
        isSystemRole: true,
        permissions: [
            // Quotes - full access
            'quotes:create',
            'quotes:read',
            'quotes:calculate',
            'quotes:submit',
            // Policies - read and basic operations
            'policies:read',
            'policies:print',
            'policies:renew',
            // Certificates - full access
            'certificates:read',
            'certificates:create',
            'certificates:print',
            // Claims - create and view
            'claims:read',
            'claims:create',
            // Clients - full access
            'clients:read',
            'clients:create',
            'clients:update',
            // Payments - view only
            'payments:view',
            // Documents
            'documents:view',
            'documents:generate',
            'documents:download',
        ],
    },

    UNDERWRITER: {
        type: 'UNDERWRITER',
        namePL: 'Underwriter',
        nameEN: 'Underwriter',
        descriptionPL: 'Ocena ryzyka, akceptacja referralów, korekta składek',
        color: '#8b5cf6', // violet
        isSystemRole: true,
        permissions: [
            // Quotes - read and calculate
            'quotes:read',
            'quotes:calculate',
            // Policies - full access
            'policies:read',
            'policies:issue',
            'policies:cancel',
            'policies:print',
            'policies:modify',
            // Certificates
            'certificates:read',
            'certificates:create',
            'certificates:print',
            'certificates:revoke',
            // Claims - full access
            'claims:read',
            'claims:update',
            'claims:resolve',
            'claims:reject',
            // Clients - read and update
            'clients:read',
            'clients:update',
            // Underwriting - full access
            'underwriting:view',
            'underwriting:approve',
            'underwriting:reject',
            'underwriting:adjust_premium',
            'underwriting:conditional_approve',
            // Payments
            'payments:view',
            'payments:process',
            // Documents
            'documents:view',
            'documents:generate',
            'documents:download',
        ],
    },

    SUPERVISOR: {
        type: 'SUPERVISOR',
        namePL: 'Supervisor',
        nameEN: 'Supervisor',
        descriptionPL: 'Nadzór nad brokerami, dostęp do raportów, eskalacje',
        color: '#f59e0b', // amber
        isSystemRole: true,
        permissions: [
            // Quotes - read only
            'quotes:read',
            'quotes:calculate',
            // Policies - read and cancel
            'policies:read',
            'policies:cancel',
            'policies:print',
            // Certificates
            'certificates:read',
            'certificates:print',
            // Claims - view and escalate
            'claims:read',
            'claims:update',
            // Clients
            'clients:read',
            'clients:update',
            // Underwriting - view only
            'underwriting:view',
            // Payments
            'payments:view',
            // Documents
            'documents:view',
            'documents:download',
            // Admin - reports only
            'admin:audit',
            'admin:reports',
        ],
    },

    ADMIN: {
        type: 'ADMIN',
        namePL: 'Administrator',
        nameEN: 'Administrator',
        descriptionPL: 'Pełny dostęp do systemu, zarządzanie użytkownikami i rolami',
        color: '#ef4444', // red
        isSystemRole: true,
        permissions: [
            // All permissions
            'quotes:create', 'quotes:read', 'quotes:calculate', 'quotes:delete', 'quotes:submit',
            'policies:read', 'policies:issue', 'policies:cancel', 'policies:renew', 'policies:print', 'policies:modify',
            'certificates:read', 'certificates:create', 'certificates:print', 'certificates:revoke',
            'claims:read', 'claims:create', 'claims:update', 'claims:resolve', 'claims:reject',
            'clients:read', 'clients:create', 'clients:update', 'clients:delete',
            'underwriting:view', 'underwriting:approve', 'underwriting:reject', 'underwriting:adjust_premium', 'underwriting:conditional_approve',
            'payments:view', 'payments:process', 'payments:refund',
            'documents:view', 'documents:generate', 'documents:download',
            'admin:users', 'admin:roles', 'admin:settings', 'admin:audit', 'admin:reports',
        ],
    },

    CLIENT: {
        type: 'CLIENT',
        namePL: 'Klient',
        nameEN: 'Client',
        descriptionPL: 'Dostęp do własnych polis, certyfikatów i szkód',
        color: '#10b981', // emerald
        isSystemRole: true,
        permissions: [
            // Policies - read own only
            'policies:read',
            // Certificates - read and print own
            'certificates:read',
            'certificates:print',
            // Claims - create and read own
            'claims:read',
            'claims:create',
            // Documents - view and download own
            'documents:view',
            'documents:download',
        ],
    },
};

/**
 * Get role definition by type
 */
export function getRole(roleType: RoleType): RoleDefinition {
    return ROLES[roleType];
}

/**
 * Get all roles as array
 */
export function getAllRoles(): RoleDefinition[] {
    return Object.values(ROLES);
}

/**
 * Check if a role has a specific permission
 */
export function roleHasPermission(roleType: RoleType, permission: Permission): boolean {
    const role = ROLES[roleType];
    return role.permissions.includes(permission);
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(roleType: RoleType): Permission[] {
    return ROLES[roleType].permissions;
}
