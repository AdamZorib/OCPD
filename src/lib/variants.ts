// Coverage Variants for OCPD Insurance
// Basic/Standard/Premium packages with predefined clause bundles

import { ClauseType } from '@/types';

export type CoverageVariant = 'BASIC' | 'STANDARD' | 'PREMIUM' | 'CUSTOM';

export interface VariantDefinition {
    type: CoverageVariant;
    namePL: string;
    nameEN: string;
    descriptionPL: string;
    includedClauses: ClauseType[];
    bundleDiscount: number; // Discount for choosing package vs individual clauses
    recommended?: boolean;
    color: string;
}

export const COVERAGE_VARIANTS: Record<Exclude<CoverageVariant, 'CUSTOM'>, VariantDefinition> = {
    BASIC: {
        type: 'BASIC',
        namePL: 'Podstawowy',
        nameEN: 'Basic',
        descriptionPL: 'Podstawowa ochrona dla przewoźników z niskim ryzykiem. Zawiera klauzulę rażącego niedbalstwa.',
        includedClauses: ['GROSS_NEGLIGENCE'],
        bundleDiscount: 0,
        color: '#64748b', // slate
    },
    STANDARD: {
        type: 'STANDARD',
        namePL: 'Standardowy',
        nameEN: 'Standard',
        descriptionPL: 'Rozszerzona ochrona dla większości przewoźników. Klauzula rażącego niedbalstwa, postojowa i podwykonawców.',
        includedClauses: ['GROSS_NEGLIGENCE', 'PARKING', 'SUBCONTRACTORS'],
        bundleDiscount: 0.05, // 5% discount for bundle
        recommended: true,
        color: '#3b82f6', // blue
    },
    PREMIUM: {
        type: 'PREMIUM',
        namePL: 'Premium',
        nameEN: 'Premium',
        descriptionPL: 'Kompleksowa ochrona dla wymagających przewoźników. Wszystkie kluczowe klauzule włączone.',
        includedClauses: [
            'GROSS_NEGLIGENCE',
            'PARKING',
            'SUBCONTRACTORS',
            'ADR',
            'REFRIGERATED',
            'UNAUTHORIZED_RELEASE',
        ],
        bundleDiscount: 0.10, // 10% discount for full bundle
        color: '#8b5cf6', // violet
    },
};

// Custom variant (for manual clause selection)
export const CUSTOM_VARIANT: Omit<VariantDefinition, 'includedClauses'> = {
    type: 'CUSTOM',
    namePL: 'Własny',
    nameEN: 'Custom',
    descriptionPL: 'Wybierz klauzule indywidualnie według potrzeb.',
    bundleDiscount: 0,
    color: '#6b7280', // gray
};

/**
 * Get variant by type
 */
export function getVariant(type: Exclude<CoverageVariant, 'CUSTOM'>): VariantDefinition {
    return COVERAGE_VARIANTS[type];
}

/**
 * Get all standard variants (excluding custom)
 */
export function getStandardVariants(): VariantDefinition[] {
    return Object.values(COVERAGE_VARIANTS);
}

/**
 * Check if a set of clauses matches a variant exactly
 */
export function matchesVariant(selectedClauses: ClauseType[]): CoverageVariant {
    for (const [key, variant] of Object.entries(COVERAGE_VARIANTS)) {
        const variantClauses = [...variant.includedClauses].sort();
        const selected = [...selectedClauses].sort();

        if (
            variantClauses.length === selected.length &&
            variantClauses.every((c, i) => c === selected[i])
        ) {
            return key as CoverageVariant;
        }
    }
    return 'CUSTOM';
}

/**
 * Calculate savings from bundle discount
 */
export function calculateBundleSavings(
    basePremium: number,
    variant: Exclude<CoverageVariant, 'CUSTOM'>
): number {
    const variantDef = COVERAGE_VARIANTS[variant];
    return Math.round(basePremium * variantDef.bundleDiscount);
}
