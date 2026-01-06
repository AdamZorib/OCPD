// ADR (Dangerous Goods) Class Definitions
// Per European Agreement concerning the International Carriage of Dangerous Goods by Road

export type ADRClass = '1' | '2' | '3' | '4.1' | '4.2' | '4.3' | '5.1' | '5.2' | '6.1' | '6.2' | '7' | '8' | '9';

export interface ADRClassDefinition {
    class: ADRClass;
    namePL: string;
    nameEN: string;
    descriptionPL: string;
    examples: string[];
    riskMultiplier: number;
    isDeclined: boolean;      // Auto-decline
    requiresReferral: boolean; // Manual UW review required
    specialRequirements?: string[];
}

export const ADR_CLASSES: Record<ADRClass, ADRClassDefinition> = {
    '1': {
        class: '1',
        namePL: 'Materiały wybuchowe',
        nameEN: 'Explosives',
        descriptionPL: 'Materiały i przedmioty wybuchowe',
        examples: ['Amunicja', 'Fajerwerki', 'Materiały pirotechniczne'],
        riskMultiplier: 3.0,
        isDeclined: true,
        requiresReferral: true,
        specialRequirements: ['Specjalna licencja wojskowa', 'Eskorta'],
    },
    '2': {
        class: '2',
        namePL: 'Gazy',
        nameEN: 'Gases',
        descriptionPL: 'Gazy sprężone, skroplone lub rozpuszczone pod ciśnieniem',
        examples: ['Propan-butan', 'Tlen medyczny', 'Acetylen', 'Azot'],
        riskMultiplier: 1.5,
        isDeclined: false,
        requiresReferral: true,
    },
    '3': {
        class: '3',
        namePL: 'Materiały ciekłe zapalne',
        nameEN: 'Flammable liquids',
        descriptionPL: 'Ciecze zapalne i ich roztwory',
        examples: ['Benzyna', 'Oleje napędowe', 'Farby', 'Rozpuszczalniki'],
        riskMultiplier: 1.4,
        isDeclined: false,
        requiresReferral: false,
    },
    '4.1': {
        class: '4.1',
        namePL: 'Materiały stałe zapalne',
        nameEN: 'Flammable solids',
        descriptionPL: 'Materiały stałe zapalne, samoreaktywne i materiały odczulone',
        examples: ['Siarka', 'Naftalina', 'Celuloid'],
        riskMultiplier: 1.3,
        isDeclined: false,
        requiresReferral: false,
    },
    '4.2': {
        class: '4.2',
        namePL: 'Materiały samozapalne',
        nameEN: 'Spontaneously combustible',
        descriptionPL: 'Materiały podatne na samozapalenie',
        examples: ['Fosfor biały', 'Węgiel aktywny'],
        riskMultiplier: 1.6,
        isDeclined: false,
        requiresReferral: true,
    },
    '4.3': {
        class: '4.3',
        namePL: 'Materiały wydzielające gazy zapalne',
        nameEN: 'Dangerous when wet',
        descriptionPL: 'Materiały wydzielające gazy zapalne w kontakcie z wodą',
        examples: ['Sód', 'Karbid', 'Lit'],
        riskMultiplier: 1.5,
        isDeclined: false,
        requiresReferral: true,
    },
    '5.1': {
        class: '5.1',
        namePL: 'Materiały utleniające',
        nameEN: 'Oxidizing substances',
        descriptionPL: 'Materiały utleniające',
        examples: ['Nawozy azotowe', 'Nadtlenki', 'Chlorany'],
        riskMultiplier: 1.4,
        isDeclined: false,
        requiresReferral: false,
    },
    '5.2': {
        class: '5.2',
        namePL: 'Nadtlenki organiczne',
        nameEN: 'Organic peroxides',
        descriptionPL: 'Nadtlenki organiczne',
        examples: ['Nadtlenek benzoilu', 'MEKP'],
        riskMultiplier: 1.8,
        isDeclined: false,
        requiresReferral: true,
    },
    '6.1': {
        class: '6.1',
        namePL: 'Materiały trujące',
        nameEN: 'Toxic substances',
        descriptionPL: 'Materiały trujące',
        examples: ['Pestycydy', 'Cyjanek', 'Arsen'],
        riskMultiplier: 1.6,
        isDeclined: false,
        requiresReferral: true,
    },
    '6.2': {
        class: '6.2',
        namePL: 'Materiały zakaźne',
        nameEN: 'Infectious substances',
        descriptionPL: 'Materiały zakaźne',
        examples: ['Próbki medyczne', 'Odpady medyczne'],
        riskMultiplier: 1.8,
        isDeclined: false,
        requiresReferral: true,
        specialRequirements: ['Opakowania zgodne z UN3373', 'Dokumentacja medyczna'],
    },
    '7': {
        class: '7',
        namePL: 'Materiały promieniotwórcze',
        nameEN: 'Radioactive material',
        descriptionPL: 'Materiały promieniotwórcze',
        examples: ['Izotopy medyczne', 'Źródła przemysłowe'],
        riskMultiplier: 3.0,
        isDeclined: true,
        requiresReferral: true,
        specialRequirements: ['Licencja atomowa', 'Dozór radiologiczny'],
    },
    '8': {
        class: '8',
        namePL: 'Materiały żrące',
        nameEN: 'Corrosive substances',
        descriptionPL: 'Materiały żrące',
        examples: ['Kwas siarkowy', 'Kwas solny', 'Ług sodowy'],
        riskMultiplier: 1.3,
        isDeclined: false,
        requiresReferral: false,
    },
    '9': {
        class: '9',
        namePL: 'Różne materiały niebezpieczne',
        nameEN: 'Miscellaneous dangerous goods',
        descriptionPL: 'Inne materiały niebezpieczne nieobjęte klasami 1-8',
        examples: ['Baterie litowe', 'Azbest', 'Suchy lód'],
        riskMultiplier: 1.2,
        isDeclined: false,
        requiresReferral: false,
    },
};

/**
 * Get ADR class definition
 */
export function getADRClass(classId: ADRClass): ADRClassDefinition {
    return ADR_CLASSES[classId];
}

/**
 * Get all ADR classes as array
 */
export function getAllADRClasses(): ADRClassDefinition[] {
    return Object.values(ADR_CLASSES);
}

/**
 * Get classes that are automatically declined
 */
export function getDeclinedClasses(): ADRClassDefinition[] {
    return getAllADRClasses().filter(c => c.isDeclined);
}

/**
 * Get classes that can be insured (not auto-declined)
 */
export function getInsurableClasses(): ADRClassDefinition[] {
    return getAllADRClasses().filter(c => !c.isDeclined);
}

/**
 * Calculate combined risk multiplier for selected ADR classes
 */
export function calculateADRMultiplier(selectedClasses: ADRClass[]): number {
    if (selectedClasses.length === 0) return 1.0;

    // Use highest multiplier among selected classes
    const maxMultiplier = Math.max(
        ...selectedClasses.map(c => ADR_CLASSES[c].riskMultiplier)
    );

    // Add 5% for each additional class
    const additionalRisk = (selectedClasses.length - 1) * 0.05;

    return Math.round((maxMultiplier + additionalRisk) * 100) / 100;
}

/**
 * Check if any selected classes require referral
 */
export function requiresADRReferral(selectedClasses: ADRClass[]): boolean {
    return selectedClasses.some(c => ADR_CLASSES[c].requiresReferral);
}

/**
 * Check if any selected classes are declined
 */
export function hasDeclinedClasses(selectedClasses: ADRClass[]): ADRClass[] {
    return selectedClasses.filter(c => ADR_CLASSES[c].isDeclined);
}

/**
 * Get ADR class options for select component
 */
export function getADRClassOptions(): { value: ADRClass; label: string; disabled: boolean }[] {
    return getAllADRClasses().map(c => ({
        value: c.class,
        label: `${c.class}: ${c.namePL}${c.isDeclined ? ' (odrzucone)' : ''}`,
        disabled: c.isDeclined,
    }));
}
