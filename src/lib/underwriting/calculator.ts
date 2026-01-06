// Underwriting Calculator for OCPD Insurance

import { TerritorialScope, RiskLevel, ClauseType, PremiumBreakdown, APKData } from '@/types';
import { calculateClausePremium, CLAUSE_DEFINITIONS } from '@/lib/clauses/definitions';

// Base rates per 1000 PLN sum insured (annual)
const BASE_RATES: Record<TerritorialScope, number> = {
    POLAND: 0.8,    // 0.8‰
    EUROPE: 1.2,    // 1.2‰
    WORLD: 1.8,     // 1.8‰
};

// Risk level modifiers
const RISK_MODIFIERS: Record<RiskLevel, number> = {
    LOW: 0.85,
    MEDIUM: 1.0,
    HIGH: 1.25,
    VERY_HIGH: 1.6,
};

// Years in business discount
const EXPERIENCE_DISCOUNTS: Record<number, number> = {
    0: 1.15,  // New business
    1: 1.10,
    2: 1.05,
    3: 1.0,
    5: 0.95,
    10: 0.90,
    15: 0.85,
};

// ========== NEW: Cargo Type Multipliers ==========
export type CargoType =
    | 'STANDARD'
    | 'ELECTRONICS'
    | 'ADR_DANGEROUS'
    | 'REFRIGERATED'
    | 'FOOD_DRY'
    | 'BULK_MATERIALS'
    | 'ALCOHOL_TOBACCO'
    | 'PHARMACEUTICALS'
    | 'AUTOMOTIVE_PARTS'
    | 'TEXTILES';

export const CARGO_TYPE_MULTIPLIERS: Record<CargoType, { multiplier: number; namePL: string; nameEN: string }> = {
    STANDARD: { multiplier: 1.0, namePL: 'Standardowe (materiały budowlane, meble)', nameEN: 'Standard (construction, furniture)' },
    ELECTRONICS: { multiplier: 2.0, namePL: 'Elektronika (RTV, AGD, komputery)', nameEN: 'Electronics (consumer electronics, computers)' },
    ADR_DANGEROUS: { multiplier: 1.3, namePL: 'Towary niebezpieczne (ADR)', nameEN: 'Dangerous goods (ADR)' },
    REFRIGERATED: { multiplier: 1.2, namePL: 'Chłodnicze (żywność mrożona)', nameEN: 'Refrigerated (frozen food)' },
    FOOD_DRY: { multiplier: 1.0, namePL: 'Spożywcze suche (opakowane)', nameEN: 'Dry food (packaged)' },
    BULK_MATERIALS: { multiplier: 0.8, namePL: 'Sypkie/masowe (kruszywo, zboże)', nameEN: 'Bulk materials (gravel, grain)' },
    ALCOHOL_TOBACCO: { multiplier: 1.8, namePL: 'Alkohol i wyroby tytoniowe', nameEN: 'Alcohol and tobacco' },
    PHARMACEUTICALS: { multiplier: 1.5, namePL: 'Farmaceutyki i kosmetyki', nameEN: 'Pharmaceuticals and cosmetics' },
    AUTOMOTIVE_PARTS: { multiplier: 1.3, namePL: 'Części samochodowe', nameEN: 'Automotive parts' },
    TEXTILES: { multiplier: 1.1, namePL: 'Tekstylia i odzież', nameEN: 'Textiles and clothing' },
};

// ========== NEW: Subcontractor Percentage Factor ==========
export const getSubcontractorModifier = (subcontractorPercent: number): number => {
    if (subcontractorPercent === 0) return 1.0;
    if (subcontractorPercent <= 25) return 1.05;  // +5%
    if (subcontractorPercent <= 50) return 1.10;  // +10%
    if (subcontractorPercent <= 75) return 1.15;  // +15%
    return 1.20;  // +20% for majority subcontracting
};

// ========== NEW: Payment Installment Surcharge ==========
export type PaymentInstallments = 1 | 2 | 4;

export const PAYMENT_INSTALLMENT_SURCHARGE: Record<PaymentInstallments, number> = {
    1: 0,     // No surcharge for single payment
    2: 0.03,  // +3% for 2 installments
    4: 0.05,  // +5% for 4 installments
};

// ========== NEW: Deductible Adjustment ==========
export type DeductibleLevel = 'ZERO' | 'STANDARD' | 'ELEVATED' | 'HIGH';

export const DEDUCTIBLE_OPTIONS: Record<DeductibleLevel, { amount: number; modifier: number; labelPL: string }> = {
    ZERO: { amount: 0, modifier: 1.10, labelPL: 'Brak franszyzy (+10%)' },
    STANDARD: { amount: 1000, modifier: 1.0, labelPL: '1 000 PLN (standard)' },
    ELEVATED: { amount: 2500, modifier: 0.95, labelPL: '2 500 PLN (-5%)' },
    HIGH: { amount: 5000, modifier: 0.90, labelPL: '5 000 PLN (-10%)' },
};

// Bonus-malus based on claims history
function getBonusMalusModifier(claimsLast3Years: number, monthlyShipments: number): number {
    const totalShipments = monthlyShipments * 36; // 3 years
    if (totalShipments === 0) return 1.0;

    const claimsRatio = claimsLast3Years / totalShipments;

    if (claimsRatio === 0) return 0.80;       // 20% discount for no claims
    if (claimsRatio < 0.001) return 0.90;     // 10% discount
    if (claimsRatio < 0.005) return 1.0;      // Standard
    if (claimsRatio < 0.01) return 1.15;      // 15% surcharge
    if (claimsRatio < 0.02) return 1.30;      // 30% surcharge
    return 1.50;                               // 50% surcharge for high claims
}

function getExperienceModifier(yearsInBusiness: number): number {
    const thresholds = Object.keys(EXPERIENCE_DISCOUNTS)
        .map(Number)
        .sort((a, b) => b - a);

    for (const threshold of thresholds) {
        if (yearsInBusiness >= threshold) {
            return EXPERIENCE_DISCOUNTS[threshold];
        }
    }
    return 1.15;
}

function assessRiskLevel(apkData: Partial<APKData>): RiskLevel {
    let riskScore = 0;

    // High value goods
    if (apkData.highValueGoods) riskScore += 2;
    if ((apkData.maxSingleShipmentValue ?? 0) > 500000) riskScore += 2;
    if ((apkData.maxSingleShipmentValue ?? 0) > 1000000) riskScore += 1;

    // Dangerous goods
    if (apkData.dangerousGoods) riskScore += 3;

    // Temperature controlled
    if (apkData.temperatureControlled) riskScore += 2;

    // Claims history
    if ((apkData.claimsLast3Years ?? 0) > 5) riskScore += 2;
    if ((apkData.claimsLast3Years ?? 0) > 10) riskScore += 2;

    // International transport is riskier
    if (apkData.internationalTransport) riskScore += 1;

    if (riskScore <= 2) return 'LOW';
    if (riskScore <= 5) return 'MEDIUM';
    if (riskScore <= 8) return 'HIGH';
    return 'VERY_HIGH';
}

export interface CalculationInput {
    sumInsured: number;
    territorialScope: TerritorialScope;
    selectedClauses: ClauseType[];
    apkData: Partial<APKData>;
    yearsInBusiness: number;
    fleetSize: number;
    // ========== NEW: Enhanced pricing inputs ==========
    cargoType?: CargoType;
    subcontractorPercent?: number;
    paymentInstallments?: PaymentInstallments;
    deductibleLevel?: DeductibleLevel;
    selectedCountries?: string[];
    countrySurchargePercent?: number;
}

export interface CalculationResult {
    breakdown: PremiumBreakdown & {
        cargoTypeModifier?: number;
        subcontractorModifier?: number;
        deductibleModifier?: number;
        countrySurcharge?: number;
        installmentSurcharge?: number;
    };
    riskLevel: RiskLevel;
    isAutoApproved: boolean;
    referralReasons: string[];
    minimumPremium: number;
}

export function calculatePremium(input: CalculationInput): CalculationResult {
    const {
        sumInsured,
        territorialScope,
        selectedClauses,
        apkData,
        yearsInBusiness,
        fleetSize,
        // New enhanced inputs
        cargoType = 'STANDARD',
        subcontractorPercent = 0,
        paymentInstallments = 1,
        deductibleLevel = 'STANDARD',
        countrySurchargePercent = 0,
    } = input;

    const referralReasons: string[] = [];

    // Step 1: Base premium calculation
    const baseRate = BASE_RATES[territorialScope];
    const basePremium = (sumInsured / 1000) * baseRate;

    // Step 2: Assess risk level
    const riskLevel = assessRiskLevel(apkData);
    const riskModifier = RISK_MODIFIERS[riskLevel];

    // Step 3: Experience modifier
    const experienceModifier = getExperienceModifier(yearsInBusiness);

    // Step 4: Bonus-malus
    const bonusMalusModifier = getBonusMalusModifier(
        apkData.claimsLast3Years ?? 0,
        apkData.monthlyShipments ?? 50
    );

    // Step 5: Fleet size discount
    let fleetDiscount = 1.0;
    if (fleetSize >= 50) fleetDiscount = 0.85;
    else if (fleetSize >= 20) fleetDiscount = 0.90;
    else if (fleetSize >= 10) fleetDiscount = 0.95;

    // ========== NEW Step 6: Cargo type modifier ==========
    const cargoTypeModifier = CARGO_TYPE_MULTIPLIERS[cargoType]?.multiplier ?? 1.0;

    // ========== NEW Step 7: Subcontractor modifier ==========
    const subcontractorModifier = getSubcontractorModifier(subcontractorPercent);

    // ========== NEW Step 8: Deductible modifier ==========
    const deductibleModifier = DEDUCTIBLE_OPTIONS[deductibleLevel]?.modifier ?? 1.0;

    // ========== NEW Step 9: Country surcharge ==========
    const countrySurcharge = 1 + (countrySurchargePercent / 100);

    // Calculate adjusted base premium with all modifiers
    const adjustedBasePremium =
        basePremium *
        riskModifier *
        experienceModifier *
        bonusMalusModifier *
        fleetDiscount *
        cargoTypeModifier *
        subcontractorModifier *
        deductibleModifier *
        countrySurcharge;

    // Step 10: Calculate clause premiums
    const clausesPremiumMap: { [key in ClauseType]?: number } = {};
    let totalClausesPremium = 0;

    for (const clauseType of selectedClauses) {
        const clausePremium = calculateClausePremium(clauseType, adjustedBasePremium);
        clausesPremiumMap[clauseType] = clausePremium;
        totalClausesPremium += clausePremium;
    }

    // Step 11: Calculate subtotal
    const scopeModifier = riskModifier;
    let totalPremium = adjustedBasePremium + totalClausesPremium;

    // ========== NEW Step 12: Payment installment surcharge ==========
    const installmentSurchargeRate = PAYMENT_INSTALLMENT_SURCHARGE[paymentInstallments] ?? 0;
    const installmentSurcharge = totalPremium * installmentSurchargeRate;
    totalPremium += installmentSurcharge;

    // Step 13: Apply minimum premium
    const minimumPremium = getMinimumPremium(territorialScope, selectedClauses.length);
    const finalPremium = Math.max(totalPremium, minimumPremium);

    // Step 14: Determine if auto-approval is possible
    let isAutoApproved = true;

    if (sumInsured > 2000000) {
        isAutoApproved = false;
        referralReasons.push('Suma ubezpieczenia przekracza 2 mln PLN');
    }

    if (riskLevel === 'VERY_HIGH') {
        isAutoApproved = false;
        referralReasons.push('Bardzo wysokie ryzyko - wymagana ocena underwritera');
    }

    if (apkData.dangerousGoods) {
        isAutoApproved = false;
        referralReasons.push('Transport towarów niebezpiecznych (ADR)');
    }

    if ((apkData.claimsLast3Years ?? 0) > 5) {
        isAutoApproved = false;
        referralReasons.push('Wysoka szkodowość w ostatnich 3 latach');
    }

    if (bonusMalusModifier > 1.3) {
        isAutoApproved = false;
        referralReasons.push('Znacząca nadwyżka szkodowości');
    }

    // ========== NEW: Additional referral rules ==========
    if (cargoType === 'ELECTRONICS' || cargoType === 'ALCOHOL_TOBACCO') {
        isAutoApproved = false;
        referralReasons.push('Towary wysokowartościowe wymagają akceptacji UW');
    }

    if (subcontractorPercent > 50) {
        isAutoApproved = false;
        referralReasons.push('Wysoki udział podwykonawców (>50%)');
    }

    if (countrySurchargePercent > 30) {
        isAutoApproved = false;
        referralReasons.push('Kraje podwyższonego ryzyka wymagają akceptacji UW');
    }

    return {
        breakdown: {
            basePremium: Math.round(basePremium),
            scopeModifier,
            riskModifier,
            bonusMalusModifier,
            clausesPremium: clausesPremiumMap,
            totalPremium: Math.round(finalPremium),
            // New breakdown fields
            cargoTypeModifier,
            subcontractorModifier,
            deductibleModifier,
            countrySurcharge,
            installmentSurcharge: Math.round(installmentSurcharge),
        },
        riskLevel,
        isAutoApproved,
        referralReasons,
        minimumPremium,
    };
}

function getMinimumPremium(scope: TerritorialScope, clausesCount: number): number {
    const baseMinimum: Record<TerritorialScope, number> = {
        POLAND: 1500,
        EUROPE: 2500,
        WORLD: 4000,
    };

    // Add 200 PLN for each selected clause
    return baseMinimum[scope] + (clausesCount * 200);
}

// Quick quote for initial estimation
export function quickQuote(
    sumInsured: number,
    scope: TerritorialScope
): { estimatedPremium: number; range: { min: number; max: number } } {
    const baseRate = BASE_RATES[scope];
    const basePremium = (sumInsured / 1000) * baseRate;

    return {
        estimatedPremium: Math.round(basePremium),
        range: {
            min: Math.round(basePremium * 0.75),
            max: Math.round(basePremium * 1.5),
        },
    };
}

export { RISK_MODIFIERS, BASE_RATES };
