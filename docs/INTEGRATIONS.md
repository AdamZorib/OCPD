# Integracje Zewnętrzne - OCPD Insurance Platform

## Przegląd

System integruje się z następującymi zewnętrznymi usługami:

| Usługa | Cel | Status |
|--------|-----|--------|
| GUS REGON | Pobieranie danych firm po NIP | ✅ Zaimplementowane (mock + ready for prod) |
| CEPiK | Weryfikacja pojazdów | ✅ Zaimplementowane (mock) |
| Autenti | Podpisy elektroniczne | 🔶 Planowane |

---

## GUS REGON API

### Opis

Integracja z Głównym Urzędem Statystycznym pozwala na automatyczne pobieranie danych firmy na podstawie NIP.

### Pliki źródłowe

| Plik | Opis |
|------|------|
| `src/lib/gus/client.ts` | Klient HTTP do API GUS |
| `src/lib/gus/types.ts` | Typy TypeScript |
| `src/app/api/gus/route.ts` | Endpoint API |

### Konfiguracja

```env
# .env
GUS_API_KEY=your_api_key_here
GUS_PRODUCTION=false  # true dla produkcji
```

### Endpointy

- **Środowisko testowe**: `https://wyszukiwarkaregontest.stat.gov.pl/wsBIR/`
- **Środowisko produkcyjne**: `https://wyszukiwarkaregon.stat.gov.pl/wsBIR/`

### Użycie

```typescript
import { GusClient } from '@/lib/gus/client';

const client = new GusClient(process.env.GUS_API_KEY!, false);
const company = await client.searchByNip('1234567890');

// Zwraca:
{
  name: 'TRANSPORT SP. Z O.O.',
  nip: '1234567890',
  regon: '123456789',
  street: 'ul. Transportowa',
  houseNumber: '10',
  city: 'Warszawa',
  postalCode: '00-100',
  voivodeship: 'MAZOWIECKIE',
  legalForm: 'Osoba prawna',
  activityStatus: 'Aktywna'
}
```

### API Endpoint

```http
GET /api/gus?nip=1234567890
```

**Response:**

```json
{
  "success": true,
  "data": {
    "name": "TRANSPORT SP. Z O.O.",
    "nip": "1234567890",
    "regon": "123456789",
    "street": "ul. Transportowa",
    "houseNumber": "10",
    "city": "Warszawa",
    "postalCode": "00-100",
    "voivodeship": "MAZOWIECKIE"
  }
}
```

### Typy danych

```typescript
interface GusCompanyData {
  name: string;
  nip: string;
  regon: string;
  street: string;
  houseNumber: string;
  apartmentNumber?: string;
  city: string;
  postalCode: string;
  voivodeship: string;
  poviat?: string;
  commune?: string;
  legalForm: string;
  activityStatus: string;
}
```

---

## CEPiK API

### Opis

Centralna Ewidencja Pojazdów i Kierowców - weryfikacja danych pojazdów po numerze rejestracyjnym.

### Pliki źródłowe

| Plik | Opis |
|------|------|
| `src/lib/cepik.ts` | Funkcje wyszukiwania pojazdów (mock) |
| `src/app/api/cepik/search/route.ts` | Endpoint API |

### Użycie

```typescript
import { searchVehicle } from '@/lib/cepik';

const vehicle = await searchVehicle('WA12345');

// Zwraca:
{
  registrationNumber: 'WA12345',
  vin: 'WVB1234567890ABCD',
  brand: 'SCANIA',
  model: 'R450',
  productionYear: 2021,
  maxWeight: 18000,
  ownWeight: 8200,
  technicalInspectionValidTo: Date,
  insuranceOCValidTo: Date,
  ownerData: {
    name: 'TRANS-LOGISTYKA S.A.',
    address: 'ul. Transportowa 10, 00-100 Warszawa'
  }
}
```

### API Endpoint

```http
GET /api/cepik/search?registration=WA12345
```

**Response:**

```json
{
  "success": true,
  "data": {
    "registrationNumber": "WA12345",
    "vin": "WVB1234567890ABCD",
    "brand": "SCANIA",
    "model": "R450",
    "productionYear": 2021,
    "maxWeight": 18000,
    "technicalInspectionValidTo": "2025-10-15",
    "insuranceOCValidTo": "2025-05-20"
  }
}
```

### Typy danych

```typescript
interface CEPiKData {
  registrationNumber: string;
  vin: string;
  brand: string;
  model: string;
  productionYear: number;
  engineCapacity: number;
  fuelType: string;
  maxWeight: number;
  ownWeight: number;
  technicalInspectionValidTo: Date;
  insuranceOCValidTo?: Date;
  ownerData?: {
    name: string;
    address: string;
  };
}
```

### Mock Data

Dla celów testowych dostępne są następujące numery rejestracyjne:

| Nr rejestracyjny | Pojazd |
|------------------|--------|
| `WA12345` | SCANIA R450 (2021) |
| `KR99887` | VOLVO FH13 (2022) |
| `PO5566A` | MAN TGX (2020) |

---

## Autenti (Planowane)

### Opis

Integracja z Autenti dla podpisów elektronicznych zgodnych z eIDAS.

### Planowane funkcje

- Wysyłanie dokumentów do podpisu
- Śledzenie statusu podpisu
- Pobieranie podpisanych dokumentów
- Weryfikacja podpisu

### Pliki źródłowe

| Plik | Opis |
|------|------|
| `src/lib/autenti.ts` | Klient Autenti (placeholder) |
| `src/components/documents/SignatureModal.tsx` | UI podpisu |

### Typy danych

```typescript
type SignatureStatus = 'PENDING' | 'SENT' | 'SIGNED' | 'REJECTED' | 'EXPIRED';

interface SignatureRequest {
  documentId: string;
  signerEmail: string;
  signerName: string;
  documentUrl: string;
  callbackUrl?: string;
}
```

---

## Obsługa błędów

Wszystkie integracje używają standardowego formatu błędów:

```typescript
interface IntegrationError {
  success: false;
  error: string;
  code?: string;
  details?: unknown;
}
```

### Kody błędów

| Kod | Opis |
|-----|------|
| `GUS_LOGIN_FAILED` | Błąd logowania do GUS |
| `GUS_NOT_FOUND` | Firma nie znaleziona |
| `CEPIK_NOT_FOUND` | Pojazd nie znaleziony |
| `AUTENTI_INVALID_DOC` | Nieprawidłowy dokument |

---

## Środowiska

| Środowisko | GUS | CEPiK | Autenti |
|------------|-----|-------|---------|
| Development | Test API | Mock | Sandbox |
| Staging | Test API | Mock | Sandbox |
| Production | Prod API | Prod API | Prod API |
