// Country definitions for territorial scope and exclusions

export interface Country {
    code: string;
    namePL: string;
    nameEN: string;
    region: 'EU' | 'EEA' | 'EUROPE_OTHER' | 'CIS' | 'WORLD';
    riskLevel: 'STANDARD' | 'ELEVATED' | 'HIGH' | 'EXCLUDED';
    surchargePercent: number;
    requiresReferral: boolean;
    excludedReason?: string;
}

export const COUNTRIES: Country[] = [
    // EU Countries - Standard risk
    { code: 'PL', namePL: 'Polska', nameEN: 'Poland', region: 'EU', riskLevel: 'STANDARD', surchargePercent: 0, requiresReferral: false },
    { code: 'DE', namePL: 'Niemcy', nameEN: 'Germany', region: 'EU', riskLevel: 'STANDARD', surchargePercent: 0, requiresReferral: false },
    { code: 'FR', namePL: 'Francja', nameEN: 'France', region: 'EU', riskLevel: 'STANDARD', surchargePercent: 0, requiresReferral: false },
    { code: 'NL', namePL: 'Holandia', nameEN: 'Netherlands', region: 'EU', riskLevel: 'STANDARD', surchargePercent: 0, requiresReferral: false },
    { code: 'BE', namePL: 'Belgia', nameEN: 'Belgium', region: 'EU', riskLevel: 'STANDARD', surchargePercent: 0, requiresReferral: false },
    { code: 'AT', namePL: 'Austria', nameEN: 'Austria', region: 'EU', riskLevel: 'STANDARD', surchargePercent: 0, requiresReferral: false },
    { code: 'CZ', namePL: 'Czechy', nameEN: 'Czech Republic', region: 'EU', riskLevel: 'STANDARD', surchargePercent: 0, requiresReferral: false },
    { code: 'SK', namePL: 'Słowacja', nameEN: 'Slovakia', region: 'EU', riskLevel: 'STANDARD', surchargePercent: 0, requiresReferral: false },
    { code: 'HU', namePL: 'Węgry', nameEN: 'Hungary', region: 'EU', riskLevel: 'STANDARD', surchargePercent: 0, requiresReferral: false },
    { code: 'ES', namePL: 'Hiszpania', nameEN: 'Spain', region: 'EU', riskLevel: 'STANDARD', surchargePercent: 0, requiresReferral: false },
    { code: 'PT', namePL: 'Portugalia', nameEN: 'Portugal', region: 'EU', riskLevel: 'STANDARD', surchargePercent: 0, requiresReferral: false },
    { code: 'DK', namePL: 'Dania', nameEN: 'Denmark', region: 'EU', riskLevel: 'STANDARD', surchargePercent: 0, requiresReferral: false },
    { code: 'SE', namePL: 'Szwecja', nameEN: 'Sweden', region: 'EU', riskLevel: 'STANDARD', surchargePercent: 0, requiresReferral: false },
    { code: 'FI', namePL: 'Finlandia', nameEN: 'Finland', region: 'EU', riskLevel: 'STANDARD', surchargePercent: 0, requiresReferral: false },
    { code: 'LT', namePL: 'Litwa', nameEN: 'Lithuania', region: 'EU', riskLevel: 'STANDARD', surchargePercent: 0, requiresReferral: false },
    { code: 'LV', namePL: 'Łotwa', nameEN: 'Latvia', region: 'EU', riskLevel: 'STANDARD', surchargePercent: 0, requiresReferral: false },
    { code: 'EE', namePL: 'Estonia', nameEN: 'Estonia', region: 'EU', riskLevel: 'STANDARD', surchargePercent: 0, requiresReferral: false },
    { code: 'LU', namePL: 'Luksemburg', nameEN: 'Luxembourg', region: 'EU', riskLevel: 'STANDARD', surchargePercent: 0, requiresReferral: false },
    { code: 'SI', namePL: 'Słowenia', nameEN: 'Slovenia', region: 'EU', riskLevel: 'STANDARD', surchargePercent: 0, requiresReferral: false },
    { code: 'HR', namePL: 'Chorwacja', nameEN: 'Croatia', region: 'EU', riskLevel: 'STANDARD', surchargePercent: 0, requiresReferral: false },

    // EU Countries - Elevated risk (Southern Europe - theft hotspots)
    { code: 'IT', namePL: 'Włochy', nameEN: 'Italy', region: 'EU', riskLevel: 'ELEVATED', surchargePercent: 15, requiresReferral: false },
    { code: 'GR', namePL: 'Grecja', nameEN: 'Greece', region: 'EU', riskLevel: 'ELEVATED', surchargePercent: 20, requiresReferral: false },
    { code: 'RO', namePL: 'Rumunia', nameEN: 'Romania', region: 'EU', riskLevel: 'ELEVATED', surchargePercent: 25, requiresReferral: false },
    { code: 'BG', namePL: 'Bułgaria', nameEN: 'Bulgaria', region: 'EU', riskLevel: 'ELEVATED', surchargePercent: 25, requiresReferral: false },

    // EEA Countries
    { code: 'NO', namePL: 'Norwegia', nameEN: 'Norway', region: 'EEA', riskLevel: 'STANDARD', surchargePercent: 5, requiresReferral: false },
    { code: 'IS', namePL: 'Islandia', nameEN: 'Iceland', region: 'EEA', riskLevel: 'STANDARD', surchargePercent: 10, requiresReferral: false },
    { code: 'CH', namePL: 'Szwajcaria', nameEN: 'Switzerland', region: 'EEA', riskLevel: 'STANDARD', surchargePercent: 5, requiresReferral: false },

    // Europe Other - High Risk
    { code: 'TR', namePL: 'Turcja', nameEN: 'Turkey', region: 'EUROPE_OTHER', riskLevel: 'HIGH', surchargePercent: 50, requiresReferral: true },
    { code: 'RS', namePL: 'Serbia', nameEN: 'Serbia', region: 'EUROPE_OTHER', riskLevel: 'HIGH', surchargePercent: 40, requiresReferral: true },
    { code: 'MK', namePL: 'Macedonia Północna', nameEN: 'North Macedonia', region: 'EUROPE_OTHER', riskLevel: 'HIGH', surchargePercent: 40, requiresReferral: true },
    { code: 'AL', namePL: 'Albania', nameEN: 'Albania', region: 'EUROPE_OTHER', riskLevel: 'HIGH', surchargePercent: 50, requiresReferral: true },
    { code: 'BA', namePL: 'Bośnia i Hercegowina', nameEN: 'Bosnia and Herzegovina', region: 'EUROPE_OTHER', riskLevel: 'HIGH', surchargePercent: 40, requiresReferral: true },
    { code: 'ME', namePL: 'Czarnogóra', nameEN: 'Montenegro', region: 'EUROPE_OTHER', riskLevel: 'HIGH', surchargePercent: 35, requiresReferral: true },
    { code: 'XK', namePL: 'Kosowo', nameEN: 'Kosovo', region: 'EUROPE_OTHER', riskLevel: 'HIGH', surchargePercent: 50, requiresReferral: true },
    { code: 'MD', namePL: 'Mołdawia', nameEN: 'Moldova', region: 'EUROPE_OTHER', riskLevel: 'HIGH', surchargePercent: 60, requiresReferral: true },

    // CIS - Excluded
    { code: 'RU', namePL: 'Rosja', nameEN: 'Russia', region: 'CIS', riskLevel: 'EXCLUDED', surchargePercent: 0, requiresReferral: false, excludedReason: 'Sankcje międzynarodowe - kraj wyłączony z ochrony' },
    { code: 'BY', namePL: 'Białoruś', nameEN: 'Belarus', region: 'CIS', riskLevel: 'EXCLUDED', surchargePercent: 0, requiresReferral: false, excludedReason: 'Sankcje międzynarodowe - kraj wyłączony z ochrony' },
    { code: 'UA', namePL: 'Ukraina', nameEN: 'Ukraine', region: 'CIS', riskLevel: 'EXCLUDED', surchargePercent: 0, requiresReferral: false, excludedReason: 'Działania wojenne - kraj wyłączony z ochrony' },
    { code: 'KZ', namePL: 'Kazachstan', nameEN: 'Kazakhstan', region: 'CIS', riskLevel: 'EXCLUDED', surchargePercent: 0, requiresReferral: false, excludedReason: 'Kraj poza standardowym zakresem ochrony' },

    // UK - Post Brexit
    { code: 'GB', namePL: 'Wielka Brytania', nameEN: 'United Kingdom', region: 'EUROPE_OTHER', riskLevel: 'ELEVATED', surchargePercent: 20, requiresReferral: false },
    { code: 'IE', namePL: 'Irlandia', nameEN: 'Ireland', region: 'EU', riskLevel: 'STANDARD', surchargePercent: 5, requiresReferral: false },
];

export const getCountryByCode = (code: string): Country | undefined => {
    return COUNTRIES.find((c) => c.code === code);
};

export const getEUCountries = (): Country[] => {
    return COUNTRIES.filter((c) => c.region === 'EU');
};

export const getExcludedCountries = (): Country[] => {
    return COUNTRIES.filter((c) => c.riskLevel === 'EXCLUDED');
};

export const getHighRiskCountries = (): Country[] => {
    return COUNTRIES.filter((c) => c.riskLevel === 'HIGH');
};

export const getCountriesByScope = (scope: 'POLAND' | 'EUROPE' | 'WORLD'): Country[] => {
    switch (scope) {
        case 'POLAND':
            return COUNTRIES.filter((c) => c.code === 'PL');
        case 'EUROPE':
            return COUNTRIES.filter((c) => c.region === 'EU' || c.region === 'EEA');
        case 'WORLD':
            return COUNTRIES.filter((c) => c.riskLevel !== 'EXCLUDED');
    }
};

export interface CountryValidationResult {
    valid: boolean;
    hasExcluded: boolean;
    hasHighRisk: boolean;
    excludedCountries: Country[];
    highRiskCountries: Country[];
    totalSurchargePercent: number;
    requiresReferral: boolean;
}

export const validateSelectedCountries = (countryCodes: string[]): CountryValidationResult => {
    const countries = countryCodes.map(getCountryByCode).filter(Boolean) as Country[];

    const excludedCountries = countries.filter((c) => c.riskLevel === 'EXCLUDED');
    const highRiskCountries = countries.filter((c) => c.riskLevel === 'HIGH');

    // Calculate max surcharge (not additive, use highest)
    const maxSurcharge = Math.max(...countries.map((c) => c.surchargePercent), 0);

    return {
        valid: excludedCountries.length === 0,
        hasExcluded: excludedCountries.length > 0,
        hasHighRisk: highRiskCountries.length > 0,
        excludedCountries,
        highRiskCountries,
        totalSurchargePercent: maxSurcharge,
        requiresReferral: countries.some((c) => c.requiresReferral),
    };
};

export const getCountryOptionsForSelect = (scope: 'POLAND' | 'EUROPE' | 'WORLD') => {
    const available = getCountriesByScope(scope);
    return available.map((c) => ({
        value: c.code,
        label: `${c.namePL}${c.surchargePercent > 0 ? ` (+${c.surchargePercent}%)` : ''}`,
        disabled: c.riskLevel === 'EXCLUDED',
    }));
};
