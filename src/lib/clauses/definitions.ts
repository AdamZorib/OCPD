// Clause definitions for OCPD insurance

import { ClauseType, PolicyClause } from '@/types';

export interface ClauseDefinition {
    type: ClauseType;
    name: string;
    namePL: string;
    description: string;
    descriptionPL: string;
    defaultSublimitPercentage: number;
    basePremiumRate: number; // as percentage of total premium
    riskCategory: 'STANDARD' | 'ELEVATED' | 'HIGH';
}

export const CLAUSE_DEFINITIONS: ClauseDefinition[] = [
    {
        type: 'GROSS_NEGLIGENCE',
        name: 'Gross Negligence',
        namePL: 'Rażące niedbalstwo',
        description: 'Coverage for damages caused by gross negligence of the driver, such as leaving the vehicle unlocked, improper cargo securing, or incorrect temperature settings.',
        descriptionPL: 'Ochrona na wypadek szkód spowodowanych rażącym niedbalstwem kierowcy, takich jak pozostawienie pojazdu niezabezpieczonego, niewłaściwe zabezpieczenie ładunku czy błędne ustawienie temperatury.',
        defaultSublimitPercentage: 100,
        basePremiumRate: 15,
        riskCategory: 'ELEVATED',
    },
    {
        type: 'PARKING',
        name: 'Parking Coverage',
        namePL: 'Klauzula postojowa',
        description: 'Extended coverage for theft of cargo from unguarded parking lots. Defines security requirements for stopping places.',
        descriptionPL: 'Rozszerzona ochrona na wypadek kradzieży ładunku z parkingu niestrzeżonego. Definiuje wymogi bezpieczeństwa dla miejsc postoju.',
        defaultSublimitPercentage: 50,
        basePremiumRate: 20,
        riskCategory: 'HIGH',
    },
    {
        type: 'UNAUTHORIZED_RELEASE',
        name: 'Unauthorized Release',
        namePL: 'Wydanie osobie nieuprawnionej',
        description: 'Protection against logistic fraud and "fake subcontractors". Covers losses from releasing cargo to unauthorized persons.',
        descriptionPL: 'Ochrona przed oszustwami logistycznymi i "fałszywymi podwykonawcami". Pokrywa straty z wydania ładunku osobom nieuprawnionym.',
        defaultSublimitPercentage: 100,
        basePremiumRate: 12,
        riskCategory: 'ELEVATED',
    },
    {
        type: 'DOCUMENTS',
        name: 'Transport Documents',
        namePL: 'Dokumenty przewozowe',
        description: 'Coverage for errors in CMR waybills and transport documentation. Particularly important for international transport.',
        descriptionPL: 'Ochrona na wypadek błędów w listach przewozowych CMR i dokumentacji transportowej. Szczególnie istotne przy transporcie międzynarodowym.',
        defaultSublimitPercentage: 30,
        basePremiumRate: 5,
        riskCategory: 'STANDARD',
    },
    {
        type: 'SUBCONTRACTORS',
        name: 'Subcontractors Coverage',
        namePL: 'Klauzula podwykonawców',
        description: 'Extends liability coverage to include transport operations performed by subcontractors on behalf of the insured carrier.',
        descriptionPL: 'Rozszerza ochronę odpowiedzialności na operacje transportowe wykonywane przez podwykonawców w imieniu ubezpieczonego przewoźnika.',
        defaultSublimitPercentage: 100,
        basePremiumRate: 18,
        riskCategory: 'HIGH',
    },
    {
        type: 'REFRIGERATED',
        name: 'Refrigerated Cargo',
        namePL: 'Ładunki chłodnicze',
        description: 'Special coverage for temperature-controlled cargo, including spoilage due to equipment failure or incorrect settings.',
        descriptionPL: 'Specjalna ochrona dla ładunków wymagających kontroli temperatury, w tym zepsucie z powodu awarii sprzętu lub błędnych ustawień.',
        defaultSublimitPercentage: 100,
        basePremiumRate: 25,
        riskCategory: 'HIGH',
    },
    {
        type: 'ADR',
        name: 'Dangerous Goods (ADR)',
        namePL: 'Towary niebezpieczne (ADR)',
        description: 'Extended coverage for transport of dangerous goods under ADR convention. Requires valid ADR certificates.',
        descriptionPL: 'Rozszerzona ochrona dla transportu towarów niebezpiecznych zgodnie z konwencją ADR. Wymaga ważnych certyfikatów ADR.',
        defaultSublimitPercentage: 50,
        basePremiumRate: 30,
        riskCategory: 'HIGH',
    },
];

export function getClauseByType(type: ClauseType): ClauseDefinition | undefined {
    return CLAUSE_DEFINITIONS.find((c) => c.type === type);
}

export function calculateClausePremium(
    clauseType: ClauseType,
    basePolicyPremium: number,
    customSublimitPercentage?: number
): number {
    const clause = getClauseByType(clauseType);
    if (!clause) return 0;

    const sublimitModifier = customSublimitPercentage
        ? customSublimitPercentage / clause.defaultSublimitPercentage
        : 1;

    return (basePolicyPremium * clause.basePremiumRate * sublimitModifier) / 100;
}

export function createPolicyClause(
    clauseType: ClauseType,
    sumInsured: number,
    basePremium: number,
    customSublimitPercentage?: number
): PolicyClause {
    const definition = getClauseByType(clauseType)!;
    const sublimitPct = customSublimitPercentage ?? definition.defaultSublimitPercentage;

    return {
        id: `clause-${clauseType}-${Date.now()}`,
        type: clauseType,
        name: definition.namePL,
        description: definition.descriptionPL,
        sublimit: (sumInsured * sublimitPct) / 100,
        sublimitPercentage: sublimitPct,
        premium: calculateClausePremium(clauseType, basePremium, sublimitPct),
        isActive: true,
    };
}
