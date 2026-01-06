// Notification Types and Preferences

export type NotificationChannel = 'EMAIL' | 'SMS' | 'PUSH';

export type NotificationEvent =
    | 'QUOTE_CREATED'
    | 'QUOTE_CALCULATED'
    | 'QUOTE_REFERRED'
    | 'QUOTE_APPROVED'
    | 'QUOTE_REJECTED'
    | 'POLICY_ISSUED'
    | 'POLICY_RENEWED'
    | 'POLICY_EXPIRING_30'
    | 'POLICY_EXPIRING_7'
    | 'POLICY_EXPIRED'
    | 'CLAIM_SUBMITTED'
    | 'CLAIM_UPDATE'
    | 'CLAIM_RESOLVED'
    | 'PAYMENT_RECEIVED'
    | 'PAYMENT_REMINDER'
    | 'DOCUMENT_READY';

export interface NotificationPreference {
    event: NotificationEvent;
    email: boolean;
    sms: boolean;
    push: boolean;
}

export interface NotificationEventConfig {
    event: NotificationEvent;
    labelPL: string;
    descriptionPL: string;
    category: 'QUOTES' | 'POLICIES' | 'CLAIMS' | 'PAYMENTS' | 'DOCUMENTS';
    defaultEmail: boolean;
    defaultSms: boolean;
}

export const NOTIFICATION_EVENTS: NotificationEventConfig[] = [
    // Quotes
    {
        event: 'QUOTE_CREATED',
        labelPL: 'Nowa wycena',
        descriptionPL: 'Gdy zostanie utworzona nowa wycena',
        category: 'QUOTES',
        defaultEmail: true,
        defaultSms: false,
    },
    {
        event: 'QUOTE_CALCULATED',
        labelPL: 'Wycena obliczona',
        descriptionPL: 'Gdy składka zostanie obliczona',
        category: 'QUOTES',
        defaultEmail: true,
        defaultSms: false,
    },
    {
        event: 'QUOTE_REFERRED',
        labelPL: 'Wycena skierowana do UW',
        descriptionPL: 'Gdy wycena wymaga akceptacji underwritera',
        category: 'QUOTES',
        defaultEmail: true,
        defaultSms: true,
    },
    {
        event: 'QUOTE_APPROVED',
        labelPL: 'Wycena zatwierdzona',
        descriptionPL: 'Gdy underwriter zatwierdzi wycenę',
        category: 'QUOTES',
        defaultEmail: true,
        defaultSms: true,
    },
    {
        event: 'QUOTE_REJECTED',
        labelPL: 'Wycena odrzucona',
        descriptionPL: 'Gdy underwriter odrzuci wycenę',
        category: 'QUOTES',
        defaultEmail: true,
        defaultSms: true,
    },

    // Policies
    {
        event: 'POLICY_ISSUED',
        labelPL: 'Polisa wystawiona',
        descriptionPL: 'Gdy polisa zostanie wystawiona',
        category: 'POLICIES',
        defaultEmail: true,
        defaultSms: true,
    },
    {
        event: 'POLICY_RENEWED',
        labelPL: 'Polisa odnowiona',
        descriptionPL: 'Gdy polisa zostanie odnowiona',
        category: 'POLICIES',
        defaultEmail: true,
        defaultSms: false,
    },
    {
        event: 'POLICY_EXPIRING_30',
        labelPL: 'Polisa wygasa za 30 dni',
        descriptionPL: 'Przypomnienie o wygasającej polisie',
        category: 'POLICIES',
        defaultEmail: true,
        defaultSms: false,
    },
    {
        event: 'POLICY_EXPIRING_7',
        labelPL: 'Polisa wygasa za 7 dni',
        descriptionPL: 'Pilne przypomnienie o wygasającej polisie',
        category: 'POLICIES',
        defaultEmail: true,
        defaultSms: true,
    },
    {
        event: 'POLICY_EXPIRED',
        labelPL: 'Polisa wygasła',
        descriptionPL: 'Gdy polisa wygaśnie',
        category: 'POLICIES',
        defaultEmail: true,
        defaultSms: false,
    },

    // Claims
    {
        event: 'CLAIM_SUBMITTED',
        labelPL: 'Szkoda zgłoszona',
        descriptionPL: 'Gdy zostanie zgłoszona nowa szkoda',
        category: 'CLAIMS',
        defaultEmail: true,
        defaultSms: true,
    },
    {
        event: 'CLAIM_UPDATE',
        labelPL: 'Aktualizacja szkody',
        descriptionPL: 'Gdy zmieni się status szkody',
        category: 'CLAIMS',
        defaultEmail: true,
        defaultSms: false,
    },
    {
        event: 'CLAIM_RESOLVED',
        labelPL: 'Szkoda rozwiązana',
        descriptionPL: 'Gdy szkoda zostanie rozwiązana',
        category: 'CLAIMS',
        defaultEmail: true,
        defaultSms: true,
    },

    // Payments
    {
        event: 'PAYMENT_RECEIVED',
        labelPL: 'Płatność otrzymana',
        descriptionPL: 'Gdy płatność zostanie zaksięgowana',
        category: 'PAYMENTS',
        defaultEmail: true,
        defaultSms: false,
    },
    {
        event: 'PAYMENT_REMINDER',
        labelPL: 'Przypomnienie o płatności',
        descriptionPL: 'Przed terminem płatności raty',
        category: 'PAYMENTS',
        defaultEmail: true,
        defaultSms: true,
    },

    // Documents
    {
        event: 'DOCUMENT_READY',
        labelPL: 'Dokument gotowy',
        descriptionPL: 'Gdy dokument (polisa, certyfikat) jest gotowy do pobrania',
        category: 'DOCUMENTS',
        defaultEmail: true,
        defaultSms: false,
    },
];

export const CATEGORY_LABELS: Record<string, string> = {
    QUOTES: 'Wyceny',
    POLICIES: 'Polisy',
    CLAIMS: 'Szkody',
    PAYMENTS: 'Płatności',
    DOCUMENTS: 'Dokumenty',
};

/**
 * Get notification events grouped by category
 */
export function getEventsByCategory(): Record<string, NotificationEventConfig[]> {
    const grouped: Record<string, NotificationEventConfig[]> = {};

    for (const event of NOTIFICATION_EVENTS) {
        if (!grouped[event.category]) {
            grouped[event.category] = [];
        }
        grouped[event.category].push(event);
    }

    return grouped;
}

/**
 * Get default notification preferences
 */
export function getDefaultPreferences(): NotificationPreference[] {
    return NOTIFICATION_EVENTS.map(event => ({
        event: event.event,
        email: event.defaultEmail,
        sms: event.defaultSms,
        push: false,
    }));
}
