'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, findUserByEmail, validateCredentials } from './users';
import { Permission } from './permissions';
import { RoleType, roleHasPermission, getRole } from './roles';

const AUTH_STORAGE_KEY = 'ocpd_auth_user';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    loginAsRole: (role: RoleType) => void; // Quick demo login
    logout: () => void;
    hasPermission: (permission: Permission) => boolean;
    hasAnyPermission: (permissions: Permission[]) => boolean;
    hasAllPermissions: (permissions: Permission[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(AUTH_STORAGE_KEY);
            if (stored) {
                const userData = JSON.parse(stored) as User;
                // Restore dates
                userData.createdAt = new Date(userData.createdAt);
                if (userData.lastLoginAt) {
                    userData.lastLoginAt = new Date(userData.lastLoginAt);
                }
                setUser(userData);
            }
        } catch (e) {
            console.error('Failed to load auth state:', e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Save user to localStorage when it changes
    useEffect(() => {
        if (user) {
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        } else {
            localStorage.removeItem(AUTH_STORAGE_KEY);
        }
    }, [user]);

    const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const validUser = validateCredentials(email, password);

        if (validUser) {
            if (!validUser.isActive) {
                return { success: false, error: 'Konto jest nieaktywne. Skontaktuj się z administratorem.' };
            }

            // Update last login
            const updatedUser = { ...validUser, lastLoginAt: new Date() };
            setUser(updatedUser);
            return { success: true };
        }

        return { success: false, error: 'Nieprawidłowy email lub hasło.' };
    };

    const loginAsRole = (role: RoleType) => {
        // Quick demo login - find first user with that role
        const roleConfig = getRole(role);
        const demoUser: User = {
            id: `demo-${role.toLowerCase()}`,
            email: `demo-${role.toLowerCase()}@ocpd.pl`,
            name: `Demo ${roleConfig.namePL}`,
            role: role,
            isActive: true,
            createdAt: new Date(),
            lastLoginAt: new Date(),
        };
        setUser(demoUser);
    };

    const logout = () => {
        setUser(null);
    };

    const hasPermission = (permission: Permission): boolean => {
        if (!user) return false;
        return roleHasPermission(user.role, permission);
    };

    const hasAnyPermission = (permissions: Permission[]): boolean => {
        return permissions.some(p => hasPermission(p));
    };

    const hasAllPermissions = (permissions: Permission[]): boolean => {
        return permissions.every(p => hasPermission(p));
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                loginAsRole,
                logout,
                hasPermission,
                hasAnyPermission,
                hasAllPermissions,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Hook to access auth context
 */
export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

/**
 * Hook to check a single permission
 */
export function usePermission(permission: Permission): boolean {
    const { hasPermission } = useAuth();
    return hasPermission(permission);
}

/**
 * Hook to check multiple permissions (any)
 */
export function useAnyPermission(permissions: Permission[]): boolean {
    const { hasAnyPermission } = useAuth();
    return hasAnyPermission(permissions);
}

/**
 * Hook to get current user's role info
 */
export function useRole() {
    const { user } = useAuth();
    if (!user) return null;
    return getRole(user.role);
}
