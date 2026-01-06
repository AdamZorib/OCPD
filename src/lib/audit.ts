// Audit Trail Types and Mock Data

export type AuditEntityType = 'QUOTE' | 'POLICY' | 'CLAIM' | 'CLIENT' | 'USER';

export type AuditAction =
    | 'CREATED'
    | 'UPDATED'
    | 'DELETED'
    | 'CALCULATED'
    | 'SUBMITTED'
    | 'APPROVED'
    | 'REJECTED'
    | 'CONDITIONALLY_APPROVED'
    | 'ISSUED'
    | 'RENEWED'
    | 'CANCELLED'
    | 'REFERRED'
    | 'PAID'
    | 'DOCUMENT_GENERATED'
    | 'EMAIL_SENT'
    | 'CONSENT_GIVEN';

export interface AuditEntry {
    id: string;
    entityType: AuditEntityType;
    entityId: string;
    action: AuditAction;
    userId: string;
    userName: string;
    userRole: 'BROKER' | 'UNDERWRITER' | 'ADMIN' | 'SYSTEM';
    timestamp: Date;
    description: string;
    details?: Record<string, unknown>;
    previousValue?: string;
    newValue?: string;
}

// Action configuration for display
export const AUDIT_ACTION_CONFIG: Record<AuditAction, {
    labelPL: string;
    color: string;
    icon: string;
}> = {
    CREATED: { labelPL: 'Utworzono', color: '#10b981', icon: 'plus-circle' },
    UPDATED: { labelPL: 'Zaktualizowano', color: '#3b82f6', icon: 'edit' },
    DELETED: { labelPL: 'Usunięto', color: '#ef4444', icon: 'trash' },
    CALCULATED: { labelPL: 'Obliczono', color: '#8b5cf6', icon: 'calculator' },
    SUBMITTED: { labelPL: 'Przesłano', color: '#f59e0b', icon: 'send' },
    APPROVED: { labelPL: 'Zatwierdzono', color: '#10b981', icon: 'check-circle' },
    REJECTED: { labelPL: 'Odrzucono', color: '#ef4444', icon: 'x-circle' },
    CONDITIONALLY_APPROVED: { labelPL: 'Warunkowa akceptacja', color: '#f59e0b', icon: 'alert-circle' },
    ISSUED: { labelPL: 'Wystawiono', color: '#10b981', icon: 'file-text' },
    RENEWED: { labelPL: 'Odnowiono', color: '#3b82f6', icon: 'refresh-cw' },
    CANCELLED: { labelPL: 'Anulowano', color: '#ef4444', icon: 'x' },
    REFERRED: { labelPL: 'Skierowano do UW', color: '#f59e0b', icon: 'user-check' },
    PAID: { labelPL: 'Opłacono', color: '#10b981', icon: 'credit-card' },
    DOCUMENT_GENERATED: { labelPL: 'Wygenerowano dokument', color: '#6366f1', icon: 'file' },
    EMAIL_SENT: { labelPL: 'Wysłano email', color: '#3b82f6', icon: 'mail' },
    CONSENT_GIVEN: { labelPL: 'Wyrażono zgodę', color: '#10b981', icon: 'check' },
};

// Mock audit entries
export const mockAuditEntries: AuditEntry[] = [
    {
        id: 'aud-001',
        entityType: 'POLICY',
        entityId: 'pol-2024-001',
        action: 'CREATED',
        userId: 'user-001',
        userName: 'Jan Kowalski',
        userRole: 'BROKER',
        timestamp: new Date('2024-01-15T09:30:00'),
        description: 'Utworzono nową wycenę polisy OCPD',
    },
    {
        id: 'aud-002',
        entityType: 'POLICY',
        entityId: 'pol-2024-001',
        action: 'CALCULATED',
        userId: 'user-001',
        userName: 'Jan Kowalski',
        userRole: 'BROKER',
        timestamp: new Date('2024-01-15T09:35:00'),
        description: 'Obliczono składkę: 12 500 PLN',
        details: { premium: 12500, sumInsured: 500000, scope: 'EUROPE' },
    },
    {
        id: 'aud-003',
        entityType: 'POLICY',
        entityId: 'pol-2024-001',
        action: 'REFERRED',
        userId: 'system',
        userName: 'System',
        userRole: 'SYSTEM',
        timestamp: new Date('2024-01-15T09:35:01'),
        description: 'Automatyczne skierowanie do underwritera: suma ubezpieczenia > 2 mln PLN',
    },
    {
        id: 'aud-004',
        entityType: 'POLICY',
        entityId: 'pol-2024-001',
        action: 'APPROVED',
        userId: 'user-uw-001',
        userName: 'Anna Nowak',
        userRole: 'UNDERWRITER',
        timestamp: new Date('2024-01-15T14:20:00'),
        description: 'Zatwierdzono wycenę przez underwritera',
        details: { note: 'Klient stały, dobra historia szkodowa' },
    },
    {
        id: 'aud-005',
        entityType: 'POLICY',
        entityId: 'pol-2024-001',
        action: 'CONSENT_GIVEN',
        userId: 'client-001',
        userName: 'Trans-Pol Sp. z o.o.',
        userRole: 'BROKER',
        timestamp: new Date('2024-01-16T10:00:00'),
        description: 'Klient wyraził zgody RODO i potwierdził odbiór dokumentów IDD',
    },
    {
        id: 'aud-006',
        entityType: 'POLICY',
        entityId: 'pol-2024-001',
        action: 'PAID',
        userId: 'system',
        userName: 'System płatności',
        userRole: 'SYSTEM',
        timestamp: new Date('2024-01-16T10:15:00'),
        description: 'Otrzymano płatność: 12 500 PLN (Przelewy24)',
        details: { paymentId: 'p24-123456', amount: 12500 },
    },
    {
        id: 'aud-007',
        entityType: 'POLICY',
        entityId: 'pol-2024-001',
        action: 'ISSUED',
        userId: 'system',
        userName: 'System',
        userRole: 'SYSTEM',
        timestamp: new Date('2024-01-16T10:15:30'),
        description: 'Wystawiono polisę OCPD/2024/001234',
    },
    {
        id: 'aud-008',
        entityType: 'POLICY',
        entityId: 'pol-2024-001',
        action: 'DOCUMENT_GENERATED',
        userId: 'system',
        userName: 'System',
        userRole: 'SYSTEM',
        timestamp: new Date('2024-01-16T10:15:45'),
        description: 'Wygenerowano PDF polisy',
    },
    {
        id: 'aud-009',
        entityType: 'POLICY',
        entityId: 'pol-2024-001',
        action: 'EMAIL_SENT',
        userId: 'system',
        userName: 'System',
        userRole: 'SYSTEM',
        timestamp: new Date('2024-01-16T10:16:00'),
        description: 'Wysłano polisę na email klienta: biuro@trans-pol.pl',
    },
];

/**
 * Get audit entries for a specific entity
 */
export function getAuditEntriesForEntity(entityId: string): AuditEntry[] {
    return mockAuditEntries
        .filter(e => e.entityId === entityId)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

/**
 * Get all audit entries (paginated)
 */
export function getAllAuditEntries(limit = 50, offset = 0): AuditEntry[] {
    return mockAuditEntries
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(offset, offset + limit);
}

/**
 * Format timestamp for display
 */
export function formatAuditTimestamp(timestamp: Date): string {
    return new Intl.DateTimeFormat('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(timestamp);
}
