/**
 * Zod validation schemas for API inputs
 * Uses sanitize-html for proper XSS protection
 */

import { z } from 'zod';
import sanitizeHtml from 'sanitize-html';
import { validateNIP, validateREGON } from './nip';

// ============ Utility Functions ============

/**
 * Sanitize string - removes ALL HTML tags
 * Uses sanitize-html for comprehensive XSS protection
 */
function sanitizeString(str: string): string {
    return sanitizeHtml(str, {
        allowedTags: [],
        allowedAttributes: {},
        disallowedTagsMode: 'recursiveEscape',
    }).trim();
}

/**
 * Create a sanitized string schema
 */
const sanitizedString = (maxLength = 255) =>
    z.string().max(maxLength).transform(sanitizeString);

// ============ Custom Validators ============

// Custom NIP validation
const nipSchema = z.string().refine(
    (val): boolean => {
        if (!val || val.trim() === '') return false;
        return validateNIP(val).valid;
    },
    { message: 'Nieprawidłowy NIP - sprawdź sumę kontrolną' }
);

// Custom REGON validation (optional)
const optionalRegonSchema = z.string().optional().refine(
    (val): boolean => {
        if (!val || val.trim() === '') return true;
        return validateREGON(val).valid;
    },
    { message: 'Nieprawidłowy REGON - sprawdź sumę kontrolną' }
);

// Email validation
const optionalEmail = z.union([
    z.string().email('Nieprawidłowy adres email').transform(sanitizeString),
    z.literal(''),
    z.undefined(),
]).optional();

// Phone validation (Polish format - flexible, accepts international)
const optionalPhone = z.union([
    z.string().regex(
        /^(\+48|0048|48)?\s?(\d{3}[\s-]?){2}\d{3}$|^(\+48|0048|48)?\d{9}$/,
        'Nieprawidłowy numer telefonu'
    ),
    z.literal(''),
    z.undefined(),
]).optional();

// Number validations
const positiveNumber = z.number().positive('Wartość musi być większa od zera');
const nonNegativeNumber = z.number().min(0, 'Wartość nie może być ujemna');

// ============ Date Validation ============

/**
 * Strict ISO date validation
 * Only accepts YYYY-MM-DD or full ISO 8601 format
 * Rejects dates that would be auto-corrected (Feb 30, etc.)
 */
const dateStringSchema = z.string().refine(
    (val) => {
        // Must match ISO format
        const isoDateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?(\.\d{3})?(Z|[+-]\d{2}:\d{2})?)?$/;
        if (!isoDateRegex.test(val)) {
            return false;
        }

        // Parse and verify it's a real date (not auto-corrected)
        const date = new Date(val);
        if (isNaN(date.getTime())) return false;

        // Extract input date parts
        const [year, month, day] = val.slice(0, 10).split('-').map(Number);

        // Verify parsed date matches input (catches Feb 30 -> March 2)
        const parsedYear = date.getUTCFullYear();
        const parsedMonth = date.getUTCMonth() + 1;
        const parsedDay = date.getUTCDate();

        return year === parsedYear && month === parsedMonth && day === parsedDay;
    },
    { message: 'Nieprawidłowy format daty (użyj YYYY-MM-DD)' }
);

// Date range validation helper
function validateDateRange(data: { validFrom?: string | Date; validTo?: string | Date }): boolean {
    if (data.validFrom && data.validTo) {
        const from = new Date(data.validFrom);
        const to = new Date(data.validTo);
        return from < to;
    }
    return true;
}

const DATE_RANGE_ERROR = 'Data rozpoczęcia musi być wcześniejsza niż data zakończenia';

// ============ Client Schemas ============

export const createClientSchema = z.object({
    nip: nipSchema,
    regon: optionalRegonSchema,
    name: sanitizedString(255).pipe(z.string().min(1, 'Nazwa firmy jest wymagana')),
    email: optionalEmail,
    phone: optionalPhone,
    street: sanitizedString(255).optional(),
    houseNumber: sanitizedString(20).optional(),
    apartmentNumber: sanitizedString(20).optional(),
    city: sanitizedString(100).optional(),
    postalCode: z.union([
        z.string().regex(/^\d{2}-\d{3}$/, 'Format kodu: XX-XXX'),
        z.literal(''),
        z.undefined(),
    ]).optional(),
    voivodeship: sanitizedString(50).optional(),
    regonData: z.record(z.string(), z.unknown()).optional(),
    riskProfile: z.record(z.string(), z.unknown()).optional(),
    fleet: z.array(z.record(z.string(), z.unknown())).optional(),
    yearsInBusiness: nonNegativeNumber.optional(),
});

export const updateClientSchema = createClientSchema.partial();

// ============ Policy Schemas ============

const basePolicyFields = {
    clientId: z.string().min(1, 'ID klienta jest wymagane'),
    clientNIP: z.string().optional(),
    clientName: sanitizedString(255).optional(),
    type: z.enum(['OCPD', 'OCP', 'OCS']).default('OCPD'),
    sumInsured: z.number()
        .positive('Suma ubezpieczenia musi być większa od zera')
        .min(50000, 'Minimalna suma ubezpieczenia to 50 000 PLN')
        .max(50000000, 'Maksymalna suma ubezpieczenia to 50 000 000 PLN'),
    territorialScope: z.enum(['POLAND', 'EUROPE', 'WORLD']),
    basePremium: positiveNumber.optional(),
    clausesPremium: nonNegativeNumber.optional(),
    totalPremium: positiveNumber.optional(),
    clauses: z.array(z.string()).optional(),
    validFrom: z.union([dateStringSchema, z.date()]).optional(),
    validTo: z.union([dateStringSchema, z.date()]).optional(),
};

export const createPolicySchema = z.object(basePolicyFields).refine(
    validateDateRange,
    { message: DATE_RANGE_ERROR, path: ['validFrom'] }
);

export const updatePolicySchema = z.object(basePolicyFields).partial().refine(
    validateDateRange,
    { message: DATE_RANGE_ERROR, path: ['validFrom'] }
);

// ============ Quote Schemas ============

const baseQuoteFields = {
    clientNIP: nipSchema,
    clientName: sanitizedString(255).optional(),
    clientEmail: optionalEmail,
    clientPhone: optionalPhone,
    clientStreet: sanitizedString(255).optional(),
    clientHouseNumber: sanitizedString(20).optional(),
    clientApartmentNumber: sanitizedString(20).optional(),
    clientCity: sanitizedString(100).optional(),
    clientPostalCode: z.string().optional(),
    clientVoivodeship: sanitizedString(50).optional(),
    yearsInBusiness: nonNegativeNumber.optional(),
    fleetSize: z.number().int().min(1, 'Flota musi mieć co najmniej 1 pojazd').optional(),
    sumInsured: z.number()
        .positive('Suma ubezpieczenia musi być większa od zera')
        .min(50000, 'Minimalna suma ubezpieczenia to 50 000 PLN')
        .max(50000000, 'Maksymalna suma ubezpieczenia to 50 000 000 PLN'),
    territorialScope: z.enum(['POLAND', 'EUROPE', 'WORLD']),
    selectedClauses: z.array(z.string()).optional(),
    policyDuration: z.number().int().min(1).max(36).optional(),
    cargoType: sanitizedString(100).optional(),
    subcontractorPercent: z.number().min(0).max(100).optional(),
    paymentInstallments: z.union([z.enum(['1', '2', '4']), z.number().int().min(1).max(12)]).optional(),
    deductibleLevel: z.enum(['ZERO', 'STANDARD', 'ELEVATED', 'HIGH']).optional(),
    apkData: z.record(z.string(), z.unknown()).optional(),
    calculationResult: z.record(z.string(), z.unknown()).optional(),
    vehicles: z.array(z.object({
        registrationNumber: z.string().max(15),
        brand: sanitizedString(50).optional(),
        model: sanitizedString(50).optional(),
        year: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
        vin: z.string().max(17).optional(),
    })).optional(),
    selectedVariant: z.string().optional(),
    status: z.enum(['DRAFT', 'CALCULATED', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED']).optional(),
    validFrom: z.union([dateStringSchema, z.date()]).optional(),
    validTo: z.union([dateStringSchema, z.date()]).optional(),
};

export const createQuoteSchema = z.object(baseQuoteFields).refine(
    validateDateRange,
    { message: DATE_RANGE_ERROR, path: ['validFrom'] }
);

// ============ Claim Schemas ============

/**
 * Claim schema - claimedAmount validation against policy.sumInsured
 * must be done in the API route since it requires DB lookup
 */
export const createClaimSchema = z.object({
    policyId: z.string().min(1, 'ID polisy jest wymagane'),
    clientId: z.string().min(1, 'ID klienta jest wymagane'),
    incidentDate: z.union([dateStringSchema, z.date()]),
    reportedDate: z.union([dateStringSchema, z.date()]).optional(),
    description: sanitizedString(2000).pipe(
        z.string().min(10, 'Opis musi mieć co najmniej 10 znaków')
    ),
    location: sanitizedString(255).optional(),
    claimedAmount: positiveNumber.max(50000000, 'Maksymalna kwota roszczenia to 50 000 000 PLN'),
    reservedAmount: nonNegativeNumber.optional(),
    status: z.enum(['REPORTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'PAID', 'CLOSED']).optional(),
}).refine(
    (data) => {
        const incidentDate = new Date(data.incidentDate);
        return incidentDate <= new Date();
    },
    { message: 'Data zdarzenia nie może być w przyszłości', path: ['incidentDate'] }
);

// ============ Type exports ============

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type CreatePolicyInput = z.infer<typeof createPolicySchema>;
export type UpdatePolicyInput = z.infer<typeof updatePolicySchema>;
export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;
export type CreateClaimInput = z.infer<typeof createClaimSchema>;

// ============ Validation helper ============

export interface ValidationResult<T> {
    success: boolean;
    data?: T;
    errors?: { path: string; message: string }[];
}

export function validateInput<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): ValidationResult<T> {
    const result = schema.safeParse(data);
    if (result.success) {
        return { success: true, data: result.data };
    }
    return {
        success: false,
        errors: result.error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
        })),
    };
}
