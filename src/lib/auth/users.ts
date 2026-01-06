// Mock Users for OCPD Insurance Platform

import { RoleType } from './roles';

export interface User {
    id: string;
    email: string;
    name: string;
    role: RoleType;
    avatar?: string;
    department?: string;
    phone?: string;
    isActive: boolean;
    createdAt: Date;
    lastLoginAt?: Date;
}

/**
 * Mock users for development/demo
 */
export const MOCK_USERS: User[] = [
    {
        id: 'user-broker-001',
        email: 'jan.kowalski@ocpd.pl',
        name: 'Jan Kowalski',
        role: 'BROKER',
        department: 'Sprzedaż',
        phone: '+48 501 234 567',
        isActive: true,
        createdAt: new Date('2023-06-15'),
        lastLoginAt: new Date('2024-01-06T09:00:00'),
    },
    {
        id: 'user-broker-002',
        email: 'maria.wisniewska@ocpd.pl',
        name: 'Maria Wiśniewska',
        role: 'BROKER',
        department: 'Sprzedaż',
        phone: '+48 502 345 678',
        isActive: true,
        createdAt: new Date('2023-08-20'),
        lastLoginAt: new Date('2024-01-05T14:30:00'),
    },
    {
        id: 'user-uw-001',
        email: 'anna.nowak@ocpd.pl',
        name: 'Anna Nowak',
        role: 'UNDERWRITER',
        department: 'Underwriting',
        phone: '+48 503 456 789',
        isActive: true,
        createdAt: new Date('2022-01-10'),
        lastLoginAt: new Date('2024-01-06T08:45:00'),
    },
    {
        id: 'user-uw-002',
        email: 'tomasz.lewandowski@ocpd.pl',
        name: 'Tomasz Lewandowski',
        role: 'UNDERWRITER',
        department: 'Underwriting',
        phone: '+48 504 567 890',
        isActive: true,
        createdAt: new Date('2022-03-15'),
        lastLoginAt: new Date('2024-01-06T07:30:00'),
    },
    {
        id: 'user-supervisor-001',
        email: 'katarzyna.mazur@ocpd.pl',
        name: 'Katarzyna Mazur',
        role: 'SUPERVISOR',
        department: 'Zarząd',
        phone: '+48 505 678 901',
        isActive: true,
        createdAt: new Date('2021-06-01'),
        lastLoginAt: new Date('2024-01-05T16:00:00'),
    },
    {
        id: 'user-admin-001',
        email: 'admin@ocpd.pl',
        name: 'Piotr Administrator',
        role: 'ADMIN',
        department: 'IT',
        phone: '+48 506 789 012',
        isActive: true,
        createdAt: new Date('2020-01-01'),
        lastLoginAt: new Date('2024-01-06T10:00:00'),
    },
    {
        id: 'user-client-001',
        email: 'biuro@trans-pol.pl',
        name: 'Trans-Pol Sp. z o.o.',
        role: 'CLIENT',
        phone: '+48 22 123 45 67',
        isActive: true,
        createdAt: new Date('2023-09-01'),
        lastLoginAt: new Date('2024-01-04T11:20:00'),
    },
];

/**
 * Find user by email (for login)
 */
export function findUserByEmail(email: string): User | undefined {
    return MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
}

/**
 * Find user by ID
 */
export function findUserById(id: string): User | undefined {
    return MOCK_USERS.find(u => u.id === id);
}

/**
 * Get users by role
 */
export function getUsersByRole(role: RoleType): User[] {
    return MOCK_USERS.filter(u => u.role === role);
}

/**
 * Get all active users
 */
export function getActiveUsers(): User[] {
    return MOCK_USERS.filter(u => u.isActive);
}

/**
 * Demo passwords (for mock login)
 * In production, passwords would be hashed and stored securely
 */
export const DEMO_PASSWORDS: Record<string, string> = {
    'jan.kowalski@ocpd.pl': 'broker123',
    'maria.wisniewska@ocpd.pl': 'broker123',
    'anna.nowak@ocpd.pl': 'uw123',
    'tomasz.lewandowski@ocpd.pl': 'uw123',
    'katarzyna.mazur@ocpd.pl': 'super123',
    'admin@ocpd.pl': 'admin123',
    'biuro@trans-pol.pl': 'client123',
};

/**
 * Validate credentials (mock)
 */
export function validateCredentials(email: string, password: string): User | null {
    const user = findUserByEmail(email);
    if (!user) return null;

    const storedPassword = DEMO_PASSWORDS[email.toLowerCase()];
    if (storedPassword && storedPassword === password) {
        return user;
    }

    return null;
}
