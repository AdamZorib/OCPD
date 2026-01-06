export interface GusCompanyData {
    name: string;
    nip?: string;
    regon?: string;
    krs?: string;
    street?: string;
    houseNumber?: string;
    apartmentNumber?: string;
    city: string;
    postalCode?: string;
    voivodeship?: string;
    poviat?: string;
    commune?: string;
    country?: string;
    legalForm?: string;
    pkd?: string[];
    activityStatus?: 'Aktywna' | 'Zawieszona' | 'Zakończona' | 'Nieznana';
    registrationDate?: string;
}

export interface GusAddress {
    street: string;
    houseNumber: string;
    apartmentNumber?: string;
    city: string;
    postalCode: string;
    fullAddress: string;
}

// Internal types for BIR 1.1 Service messages
export interface GusLoginResponse {
    d: string; // Session ID (SID)
}

// Simplified search response structure from parsing XML/JSON
export interface GusSearchResponseItem {
    Regon: string;
    Nip: string;
    StatusNip: string;
    Nazwa: string;
    Wojewodztwo: string;
    Powiat: string;
    Gmina: string;
    Miejscowosc: string;
    KodPocztowy: string;
    Ulica: string;
    NrNieruchomosci: string;
    NrLokalu: string;
    Typ: string; // F - fizyczna, P - prawna
    SilosID: string;
    DataZakonczeniaDzialalnosci: string;
    MiejscowoscPoczty: string;
}
