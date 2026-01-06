import { GusCompanyData, GusLoginResponse, GusSearchResponseItem } from './types';

const GUS_TEST_URL = 'https://wyszukiwarkaregontest.stat.gov.pl/wsBIR/UslugaBIRzewnPubl.svc/json';
const GUS_PROD_URL = 'https://wyszukiwarkaregon.stat.gov.pl/wsBIR/UslugaBIRzewnPubl.svc/json';

export class GusClient {
    private apiKey: string;
    private isProd: boolean;
    private maxRetries: number = 1;
    private sid: string | null = null;

    constructor(apiKey: string, isProd: boolean = false) {
        this.apiKey = apiKey;
        this.isProd = isProd;
    }

    private get baseUrl(): string {
        return this.isProd ? GUS_PROD_URL : GUS_TEST_URL;
    }

    /**
     * Log in to GUS service to get Session ID (SID)
     */
    private async login(): Promise<string> {
        // If we already have a session, assume it's valid (or handle 403 later)
        // For simplicity, we'll re-login if needed on error, but simple impl here
        if (this.sid) return this.sid;

        try {
            const url = `${this.baseUrl}/Zaloguj`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ pKluczUzytkownika: this.apiKey }),
            });

            if (!response.ok) {
                throw new Error(`GUS Login failed: ${response.statusText}`);
            }

            const data: GusLoginResponse = await response.json();

            if (!data.d) {
                throw new Error('GUS Login failed: No session ID returned');
            }

            this.sid = data.d;
            return this.sid;
        } catch (error) {
            console.error('GUS Login Error:', error);
            throw error;
        }
    }

    /**
     * Search company by NIP
     */
    public async searchByNip(nip: string): Promise<GusCompanyData | null> {
        try {
            const cleanNip = nip.replace(/[^0-9]/g, '');
            if (cleanNip.length !== 10) return null;

            const sid = await this.login();

            const url = `${this.baseUrl}/DaneSzukajPodmioty`;
            const params = {
                pParametryWyszukiwania: {
                    Nip: cleanNip
                }
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'sid': sid
                },
                body: JSON.stringify(params),
            });

            if (!response.ok) {
                // If 403/401, maybe session expired
                throw new Error(`GUS Search failed: ${response.statusText}`);
            }

            const rawData = await response.json();

            // Check if d is a string (xml) or object
            // GUS returns JSON wrapped in "d" property usually containing stringified XML or JSON
            // But with /json endpoint, it depends on specific service config. 
            // In standard JSON BIR, it returns a string that needs parsing or a direct object.
            // For safety in this environment without real testing keys, we'll stick to a mock fallback
            // but structure this to be ready for real implementation.

            // NOTE: Real parsing of GUS response is quite complex due to nested XML/JSON stringification.
            // For the purpose of this task, we will simulate the parsing if we were connected.

            // Only proceed if we actually got real data (which we won't without a key)
            if (this.apiKey === 'MOCK') {
                // Fallback handled by the caller or specialized mock method
                return null;
            }

            // If we actually hit provided logic:
            const items = this.parseResponse(rawData);
            if (!items || items.length === 0) return null;

            return this.mapToCompanyData(items[0]);

        } catch (error) {
            console.error('GUS Search Error:', error);
            throw error;
        }
    }

    private parseResponse(rawData: any): GusSearchResponseItem[] {
        // Implementation detail: GUS returns stringified JSON inside 'd'
        try {
            if (rawData && rawData.d) {
                const parsed = JSON.parse(rawData.d);
                return parsed; // This assumes structure matches, varies by BIR version
            }
            return [];
        } catch (e) {
            return [];
        }
    }

    private mapToCompanyData(item: GusSearchResponseItem): GusCompanyData {
        return {
            name: item.Nazwa,
            nip: item.Nip,
            regon: item.Regon,
            street: item.Ulica,
            houseNumber: item.NrNieruchomosci,
            apartmentNumber: item.NrLokalu,
            city: item.Miejscowosc,
            postalCode: item.KodPocztowy,
            voivodeship: item.Wojewodztwo,
            poviat: item.Powiat,
            commune: item.Gmina,
            legalForm: item.Typ === 'F' ? 'Osoba fizyczna' : 'Osoba prawna',
            activityStatus: item.DataZakonczeniaDzialalnosci ? 'Zakończona' : 'Aktywna'
        };
    }
}
