// Atomic Permissions for OCPD Insurance Platform
// Each permission represents a single action that can be granted to a role

/**
 * Permission string format: "resource:action"
 * Resources: quotes, policies, certificates, claims, clients, underwriting, admin
 * Actions: create, read, update, delete, and resource-specific actions
 */
export type Permission =
    // Quotes
    | 'quotes:create'
    | 'quotes:read'
    | 'quotes:calculate'
    | 'quotes:delete'
    | 'quotes:submit'
    // Policies
    | 'policies:read'
    | 'policies:issue'
    | 'policies:cancel'
    | 'policies:renew'
    | 'policies:print'
    | 'policies:modify'
    // Certificates
    | 'certificates:read'
    | 'certificates:create'
    | 'certificates:print'
    | 'certificates:revoke'
    // Claims
    | 'claims:read'
    | 'claims:create'
    | 'claims:update'
    | 'claims:resolve'
    | 'claims:reject'
    // Clients
    | 'clients:read'
    | 'clients:create'
    | 'clients:update'
    | 'clients:delete'
    // Underwriting
    | 'underwriting:view'
    | 'underwriting:approve'
    | 'underwriting:reject'
    | 'underwriting:adjust_premium'
    | 'underwriting:conditional_approve'
    // Payments
    | 'payments:view'
    | 'payments:process'
    | 'payments:refund'
    // Documents
    | 'documents:view'
    | 'documents:generate'
    | 'documents:download'
    // Admin
    | 'admin:users'
    | 'admin:roles'
    | 'admin:settings'
    | 'admin:audit'
    | 'admin:reports';

/**
 * Permission metadata for UI display
 */
export interface PermissionMeta {
    permission: Permission;
    namePL: string;
    nameEN: string;
    descriptionPL: string;
    category: 'QUOTES' | 'POLICIES' | 'CERTIFICATES' | 'CLAIMS' | 'CLIENTS' | 'UNDERWRITING' | 'PAYMENTS' | 'DOCUMENTS' | 'ADMIN';
}

export const PERMISSION_METADATA: PermissionMeta[] = [
    // Quotes
    { permission: 'quotes:create', namePL: 'Tworzenie wycen', nameEN: 'Create Quotes', descriptionPL: 'Możliwość tworzenia nowych wycen', category: 'QUOTES' },
    { permission: 'quotes:read', namePL: 'Przeglądanie wycen', nameEN: 'View Quotes', descriptionPL: 'Dostęp do listy i szczegółów wycen', category: 'QUOTES' },
    { permission: 'quotes:calculate', namePL: 'Kalkulacja składki', nameEN: 'Calculate Premium', descriptionPL: 'Uruchamianie kalkulatora składki', category: 'QUOTES' },
    { permission: 'quotes:delete', namePL: 'Usuwanie wycen', nameEN: 'Delete Quotes', descriptionPL: 'Usuwanie wycen z systemu', category: 'QUOTES' },
    { permission: 'quotes:submit', namePL: 'Wysyłanie wycen', nameEN: 'Submit Quotes', descriptionPL: 'Wysyłanie wycen do akceptacji', category: 'QUOTES' },

    // Policies
    { permission: 'policies:read', namePL: 'Przeglądanie polis', nameEN: 'View Policies', descriptionPL: 'Dostęp do listy i szczegółów polis', category: 'POLICIES' },
    { permission: 'policies:issue', namePL: 'Wystawianie polis', nameEN: 'Issue Policies', descriptionPL: 'Wystawianie nowych polis', category: 'POLICIES' },
    { permission: 'policies:cancel', namePL: 'Anulowanie polis', nameEN: 'Cancel Policies', descriptionPL: 'Anulowanie aktywnych polis', category: 'POLICIES' },
    { permission: 'policies:renew', namePL: 'Odnawianie polis', nameEN: 'Renew Policies', descriptionPL: 'Odnawianie wygasających polis', category: 'POLICIES' },
    { permission: 'policies:print', namePL: 'Drukowanie polis', nameEN: 'Print Policies', descriptionPL: 'Generowanie i drukowanie dokumentów polis', category: 'POLICIES' },
    { permission: 'policies:modify', namePL: 'Modyfikacja polis', nameEN: 'Modify Policies', descriptionPL: 'Edycja parametrów aktywnych polis', category: 'POLICIES' },

    // Certificates
    { permission: 'certificates:read', namePL: 'Przeglądanie certyfikatów', nameEN: 'View Certificates', descriptionPL: 'Dostęp do certyfikatów', category: 'CERTIFICATES' },
    { permission: 'certificates:create', namePL: 'Tworzenie certyfikatów', nameEN: 'Create Certificates', descriptionPL: 'Wystawianie nowych certyfikatów', category: 'CERTIFICATES' },
    { permission: 'certificates:print', namePL: 'Drukowanie certyfikatów', nameEN: 'Print Certificates', descriptionPL: 'Drukowanie certyfikatów PL/EN', category: 'CERTIFICATES' },
    { permission: 'certificates:revoke', namePL: 'Unieważnianie certyfikatów', nameEN: 'Revoke Certificates', descriptionPL: 'Unieważnianie wydanych certyfikatów', category: 'CERTIFICATES' },

    // Claims
    { permission: 'claims:read', namePL: 'Przeglądanie szkód', nameEN: 'View Claims', descriptionPL: 'Dostęp do zgłoszonych szkód', category: 'CLAIMS' },
    { permission: 'claims:create', namePL: 'Zgłaszanie szkód', nameEN: 'Create Claims', descriptionPL: 'Rejestracja nowych szkód', category: 'CLAIMS' },
    { permission: 'claims:update', namePL: 'Aktualizacja szkód', nameEN: 'Update Claims', descriptionPL: 'Edycja danych szkody', category: 'CLAIMS' },
    { permission: 'claims:resolve', namePL: 'Rozwiązywanie szkód', nameEN: 'Resolve Claims', descriptionPL: 'Zamykanie i rozwiązywanie szkód', category: 'CLAIMS' },
    { permission: 'claims:reject', namePL: 'Odrzucanie szkód', nameEN: 'Reject Claims', descriptionPL: 'Odrzucanie roszczeń', category: 'CLAIMS' },

    // Clients
    { permission: 'clients:read', namePL: 'Przeglądanie klientów', nameEN: 'View Clients', descriptionPL: 'Dostęp do bazy klientów', category: 'CLIENTS' },
    { permission: 'clients:create', namePL: 'Tworzenie klientów', nameEN: 'Create Clients', descriptionPL: 'Dodawanie nowych klientów', category: 'CLIENTS' },
    { permission: 'clients:update', namePL: 'Edycja klientów', nameEN: 'Update Clients', descriptionPL: 'Modyfikacja danych klientów', category: 'CLIENTS' },
    { permission: 'clients:delete', namePL: 'Usuwanie klientów', nameEN: 'Delete Clients', descriptionPL: 'Usuwanie klientów z bazy', category: 'CLIENTS' },

    // Underwriting
    { permission: 'underwriting:view', namePL: 'Panel underwritera', nameEN: 'View Underwriting', descriptionPL: 'Dostęp do panelu UW', category: 'UNDERWRITING' },
    { permission: 'underwriting:approve', namePL: 'Akceptacja referralów', nameEN: 'Approve Referrals', descriptionPL: 'Zatwierdzanie skierowanych wycen', category: 'UNDERWRITING' },
    { permission: 'underwriting:reject', namePL: 'Odrzucanie referralów', nameEN: 'Reject Referrals', descriptionPL: 'Odrzucanie skierowanych wycen', category: 'UNDERWRITING' },
    { permission: 'underwriting:adjust_premium', namePL: 'Korekta składki', nameEN: 'Adjust Premium', descriptionPL: 'Modyfikacja obliczonej składki', category: 'UNDERWRITING' },
    { permission: 'underwriting:conditional_approve', namePL: 'Warunkowa akceptacja', nameEN: 'Conditional Approval', descriptionPL: 'Akceptacja z warunkami', category: 'UNDERWRITING' },

    // Payments
    { permission: 'payments:view', namePL: 'Przeglądanie płatności', nameEN: 'View Payments', descriptionPL: 'Dostęp do historii płatności', category: 'PAYMENTS' },
    { permission: 'payments:process', namePL: 'Przetwarzanie płatności', nameEN: 'Process Payments', descriptionPL: 'Rejestracja płatności', category: 'PAYMENTS' },
    { permission: 'payments:refund', namePL: 'Zwroty płatności', nameEN: 'Refund Payments', descriptionPL: 'Obsługa zwrotów', category: 'PAYMENTS' },

    // Documents
    { permission: 'documents:view', namePL: 'Przeglądanie dokumentów', nameEN: 'View Documents', descriptionPL: 'Dostęp do dokumentów', category: 'DOCUMENTS' },
    { permission: 'documents:generate', namePL: 'Generowanie dokumentów', nameEN: 'Generate Documents', descriptionPL: 'Generowanie PDF', category: 'DOCUMENTS' },
    { permission: 'documents:download', namePL: 'Pobieranie dokumentów', nameEN: 'Download Documents', descriptionPL: 'Pobieranie plików', category: 'DOCUMENTS' },

    // Admin
    { permission: 'admin:users', namePL: 'Zarządzanie użytkownikami', nameEN: 'Manage Users', descriptionPL: 'Tworzenie i edycja użytkowników', category: 'ADMIN' },
    { permission: 'admin:roles', namePL: 'Zarządzanie rolami', nameEN: 'Manage Roles', descriptionPL: 'Konfiguracja ról i uprawnień', category: 'ADMIN' },
    { permission: 'admin:settings', namePL: 'Ustawienia systemu', nameEN: 'System Settings', descriptionPL: 'Konfiguracja systemu', category: 'ADMIN' },
    { permission: 'admin:audit', namePL: 'Dziennik audytu', nameEN: 'Audit Log', descriptionPL: 'Przeglądanie logów systemowych', category: 'ADMIN' },
    { permission: 'admin:reports', namePL: 'Raporty', nameEN: 'Reports', descriptionPL: 'Generowanie raportów', category: 'ADMIN' },
];

/**
 * Get all permissions for a category
 */
export function getPermissionsByCategory(category: PermissionMeta['category']): PermissionMeta[] {
    return PERMISSION_METADATA.filter(p => p.category === category);
}

/**
 * Get permission metadata
 */
export function getPermissionMeta(permission: Permission): PermissionMeta | undefined {
    return PERMISSION_METADATA.find(p => p.permission === permission);
}

/**
 * Category labels for UI
 */
export const CATEGORY_LABELS: Record<PermissionMeta['category'], string> = {
    QUOTES: 'Wyceny',
    POLICIES: 'Polisy',
    CERTIFICATES: 'Certyfikaty',
    CLAIMS: 'Szkody',
    CLIENTS: 'Klienci',
    UNDERWRITING: 'Underwriting',
    PAYMENTS: 'Płatności',
    DOCUMENTS: 'Dokumenty',
    ADMIN: 'Administracja',
};
