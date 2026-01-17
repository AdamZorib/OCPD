# OCPD Insurance Platform

Platforma do zarządzania ubezpieczeniami odpowiedzialności cywilnej przewoźnika drogowego (OCPD).

![Dashboard](https://img.shields.io/badge/Status-Development-blue)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## 📋 Spis treści

- [O projekcie](#-o-projekcie)
- [Funkcjonalności](#-funkcjonalności)
- [Technologie](#-technologie)
- [Instalacja](#-instalacja)
- [Struktura projektu](#-struktura-projektu)
- [API Reference](#-api-reference)
- [Komponenty UI](#-komponenty-ui)
- [Kalkulator składek](#-kalkulator-składek)

---

## 🎯 O projekcie

OCPD Insurance Platform to kompletne rozwiązanie dla brokerów ubezpieczeniowych do zarządzania polisami odpowiedzialności cywilnej przewoźnika drogowego. System umożliwia:

- Zarządzanie klientami (przewoźnikami)
- Generowanie wycen z automatycznym kalkulatorem składek
- Śledzenie polis i ich statusów
- Obsługę zgłoszeń szkód
- Generowanie certyfikatów przewozowych

---

## ✨ Funkcjonalności

### Dashboard

- KPI: aktywne polisy, wygasające, składka roczna, otwarte szkody
- Wykresy: trendy składek vs szkód, top klienci
- Ostatnia aktywność: polisy, szkody, wyceny

### Zarządzanie klientami

- Lista klientów z wyszukiwaniem i filtrami
- Profil ryzyka (scoring 0-100)
- Historia polis i szkód
- Integracja z REGON (mock)

### Polisy

- Lista z filtrami statusu i zakresu terytorialnego
- Oznaczanie polis wygasających
- Statystyki: aktywne, wygasające, suma składek
- **Szczegóły polisy** (`/policies/[id]`):
  - Pełne informacje o polisie i kliencie
  - Lista klauzul dodatkowych z sublimitami
  - Alert o wygasających polisach
  - **Druk polisy do PDF**

### Kreator wycen (5 kroków)

1. **Dane klienta** - NIP, kontakt, flota
2. **Parametry polisy** - suma ubezpieczenia, zakres, okres
3. **Analiza Potrzeb (APK)** - typy ładunków, charakterystyka
4. **Klauzule dodatkowe** - 7 typów z wpływem na składkę
5. **Podsumowanie** - kalkulacja, ocena ryzyka, referral

### Szkody

- Lista zgłoszeń z statusami
- Kwoty: roszczenie, rezerwa, wypłata
- Lokalizacja i opis zdarzenia

### Certyfikaty

- Certyfikaty przewozowe
- Szczegóły ładunku i trasy
- **Druk certyfikatu do PDF** - profesjonalny szablon z:
  - Danymi przewoźnika i polisy
  - Opisem ładunku i wartością
  - Trasą i datą transportu
  - Miejscem na pieczęć i podpis

---

## 🛠 Technologie

| Kategoria | Technologia |
|-----------|-------------|
| Framework | Next.js 15 (App Router) |
| Język | TypeScript 5 |
| Stylowanie | CSS Modules + Custom Properties |
| Wykresy | Recharts |
| Formularze | React Hook Form + Zod |
| Ikony | Lucide React |
| Narzędzia | clsx, date-fns |

---

## 🚀 Instalacja

### Wymagania

- Node.js 18+
- npm lub yarn

### Kroki instalacji

```bash
# Klonowanie repozytorium
git clone <repository-url>
cd ocpd-platform

# Instalacja zależności
npm install

# Uruchomienie serwera deweloperskiego
npm run dev
```

Aplikacja dostępna pod: [http://localhost:3000](http://localhost:3000)

### Skrypty

| Skrypt | Opis |
|--------|------|
| `npm run dev` | Serwer deweloperski |
| `npm run build` | Build produkcyjny |
| `npm run start` | Uruchomienie produkcji |
| `npm run lint` | Sprawdzenie ESLint |

---

## 📁 Struktura projektu

```
src/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Dashboard
│   ├── layout.tsx                # Root layout + Sidebar
│   ├── globals.css               # Design system
│   ├── clients/                  # Moduł klientów
│   │   ├── page.tsx              # Lista klientów
│   │   └── [id]/page.tsx         # Szczegóły klienta
│   ├── policies/
│   │   ├── page.tsx              # Lista polis
│   │   └── [id]/page.tsx         # Szczegóły + druk polisy
│   ├── quotes/
│   │   ├── page.tsx              # Lista wycen
│   │   └── new/page.tsx          # Kreator wycen
│   ├── claims/page.tsx           # Szkody
│   ├── certificates/page.tsx     # Certyfikaty
│   ├── settings/page.tsx         # Ustawienia
│   └── api/                      # REST API
│       ├── dashboard/route.ts
│       ├── clients/route.ts
│       ├── policies/route.ts
│       ├── quotes/route.ts
│       ├── claims/route.ts
│       └── certificates/route.ts
│
├── components/ui/                # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── Select.tsx
│   ├── Badge.tsx
│   ├── Table.tsx
│   ├── Modal.tsx
│   ├── Sidebar.tsx
│   └── index.ts
│
├── lib/
│   ├── mock-data.ts              # Dane testowe
│   ├── clauses/definitions.ts    # Definicje klauzul
│   └── underwriting/calculator.ts # Kalkulator składek
│
└── types/index.ts                # TypeScript types
```

---

## 🔌 API Reference

### Dashboard

```http
GET /api/dashboard
```

Zwraca statystyki dashboardu.

**Response:**

```json
{
  "activePolicies": 4,
  "expiringPolicies30Days": 0,
  "totalPremium": 44560,
  "openClaims": 2,
  "claimsRatio": 0.94,
  "topClients": [...],
  "recentActivity": {...}
}
```

---

### Klienci

```http
GET /api/clients
GET /api/clients?search=trans&riskLevel=MEDIUM
```

| Parametr | Typ | Opis |
|----------|-----|------|
| `search` | string | Szukaj po nazwie, NIP, email |
| `riskLevel` | enum | LOW, MEDIUM, HIGH, VERY_HIGH |
| `scope` | enum | POLAND, EUROPE, WORLD |

```http
POST /api/clients
```

```json
{
  "nip": "1234567890",
  "name": "Transport Sp. z o.o.",
  "email": "kontakt@transport.pl",
  "phone": "+48 600 123 456",
  "yearsInBusiness": 5
}
```

```http
GET /api/clients/:id
PUT /api/clients/:id
DELETE /api/clients/:id
```

---

### Polisy

```http
GET /api/policies
GET /api/policies?status=ACTIVE&scope=EUROPE&clientId=client-1
```

| Parametr | Typ | Opis |
|----------|-----|------|
| `search` | string | Numer polisy, klient |
| `status` | enum | DRAFT, QUOTED, ACTIVE, EXPIRED, CANCELLED |
| `scope` | enum | POLAND, EUROPE, WORLD |
| `clientId` | string | ID klienta |

```http
POST /api/policies
```

```json
{
  "clientId": "client-1",
  "sumInsured": 300000,
  "territorialScope": "EUROPE",
  "clauses": ["GROSS_NEGLIGENCE", "FRIDGE"]
}
```

```http
GET /api/policies/:id
PUT /api/policies/:id
PATCH /api/policies/:id  # Update status only
```

---

### Wyceny

```http
GET /api/quotes
POST /api/quotes
```

#### Kalkulator składek

```http
POST /api/quotes/calculate
```

**Quick Quote (szybka wycena):**

```json
{
  "sumInsured": 300000,
  "territorialScope": "EUROPE",
  "quickQuote": true
}
```

**Response:**

```json
{
  "type": "quick",
  "estimatedPremium": 360,
  "range": { "min": 270, "max": 540 }
}
```

**Full Quote (pełna kalkulacja):**

```json
{
  "sumInsured": 300000,
  "territorialScope": "EUROPE",
  "selectedClauses": ["GROSS_NEGLIGENCE", "FRIDGE"],
  "yearsInBusiness": 10,
  "fleetSize": 15,
  "apkData": {
    "mainCargoTypes": ["Elektronika", "AGD"],
    "averageCargoValue": 50000,
    "claimsLast3Years": 0,
    "highValueGoods": false,
    "dangerousGoods": false
  }
}
```

**Response:**

```json
{
  "type": "full",
  "result": {
    "breakdown": {
      "basePremium": 360,
      "riskModifier": 1.0,
      "bonusMalusModifier": 0.85,
      "clausesPremium": {...},
      "totalPremium": 450
    },
    "riskLevel": "LOW",
    "isAutoApproved": true,
    "referralReasons": []
  }
}
```

---

### Szkody

```http
GET /api/claims
GET /api/claims?status=UNDER_REVIEW&clientId=client-1
POST /api/claims
```

```json
{
  "policyId": "policy-1",
  "clientId": "client-1",
  "description": "Uszkodzenie ładunku podczas transportu",
  "claimedAmount": 50000,
  "incidentDate": "2024-01-15",
  "location": "Autostrada A2, km 234"
}
```

---

### Certyfikaty

```http
GET /api/certificates
GET /api/certificates?page=1&pageSize=20
```

| Parametr | Typ | Opis |
|----------|-----|------|
| `page` | number | Numer strony (domyślnie: 1) |
| `pageSize` | number | Ilość na stronę (max: 100, domyślnie: 20) |

**Response:**

```json
{
  "data": [...],
  "total": 25,
  "page": 1,
  "pageSize": 20,
  "totalPages": 2
}
```

```http
POST /api/certificates
```

```json
{
  "policyId": "policy-1",
  "clientId": "client-1",
  "cargoDescription": "Elektronika - telewizory",
  "cargoValue": 50000,
  "route": "Warszawa -> Berlin",
  "transportDate": "2026-01-15"
}
```

**Walidacja:**

- `clientId` musi być właścicielem `policyId`
- Polisa musi mieć status `ACTIVE`
- `cargoValue` nie może przekroczyć `sumInsured` polisy

```http
GET /api/certificates/:id
DELETE /api/certificates/:id  # Soft delete (tylko admin)
```

## 🎨 Komponenty UI

### Button

```tsx
import { Button } from '@/components/ui';

<Button variant="primary" size="md" leftIcon={<Plus />}>
  Dodaj
</Button>
```

| Prop | Wartości | Default |
|------|----------|---------|
| `variant` | primary, secondary, ghost, danger, success | primary |
| `size` | sm, md, lg | md |
| `leftIcon` | ReactNode | - |
| `rightIcon` | ReactNode | - |
| `loading` | boolean | false |

### Card

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

<Card variant="elevated" padding="lg" hoverable>
  <CardHeader>
    <CardTitle>Tytuł</CardTitle>
  </CardHeader>
  <CardContent>
    Zawartość
  </CardContent>
</Card>
```

| Prop | Wartości | Default |
|------|----------|---------|
| `variant` | default, elevated, glass, bordered | default |
| `padding` | none, sm, md, lg | md |
| `hoverable` | boolean | false |

### Badge

```tsx
import { Badge } from '@/components/ui';

<Badge variant="success" dot>Aktywna</Badge>
```

| Prop | Wartości | Default |
|------|----------|---------|
| `variant` | default, success, warning, danger, info, accent | default |
| `size` | sm, md | md |
| `dot` | boolean | false |

### Input / Select

```tsx
import { Input, Select } from '@/components/ui';

<Input 
  label="Email" 
  error="Nieprawidłowy email"
  leftIcon={<Mail />}
/>

<Select 
  label="Zakres"
  options={[
    { value: 'POLAND', label: 'Polska' },
    { value: 'EUROPE', label: 'Europa' },
  ]}
/>
```

### Table

```tsx
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui';

<Table striped>
  <TableHeader>
    <TableRow>
      <TableHead sortable>Nazwa</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Trans-Europa</TableCell>
      <TableCell><Badge>Aktywna</Badge></TableCell>
    </TableRow>
  </TableBody>
</Table>
```

---

## 🧮 Kalkulator składek

### Algorytm kalkulacji

1. **Składka bazowa** = Suma ubezpieczenia × Stawka bazowa

   | Zakres | Stawka |
   |--------|--------|
   | Polska | 0.08% |
   | Europa | 0.12% |
   | Świat | 0.18% |

2. **Modyfikatory ryzyka** (APK):
   - Towary wysokiej wartości: +20%
   - Towary niebezpieczne (ADR): +35%
   - Transport chłodniczy: +15%
   - Wysoka szkodowość: +10-50%

3. **Zniżki**:
   - Doświadczenie (5+ lat): -5% do -15%
   - Wielkość floty (10+ pojazdów): -3% do -10%
   - Bonus za bezszkodowość: -5% do -15%

4. **Klauzule dodatkowe**:

   | Klauzula | Wpływ na składkę |
   |----------|------------------|
   | Rażące niedbalstwo | +8% |
   | Chłodnia | +12% |
   | ADR | +15% |
   | Kradzież z parkingu | +10% |
   | Opóźnienie dostawy | +5% |
   | Koszty dodatkowe | +3% |
   | Kabotaż | +6% |

5. **Składka minimalna**: 500 PLN

### Auto-approval

Wycena wymaga akceptacji underwritera gdy:

- Suma ubezpieczenia > 1 000 000 PLN
- Poziom ryzyka = HIGH lub VERY_HIGH
- Wybrane klauzule wysokiego ryzyka (ADR, Kradzież)
- Zakres = WORLD

---

## 📊 Typy danych

### Client

```typescript
interface Client {
  id: string;
  nip: string;
  name: string;
  email: string;
  phone: string;
  riskProfile: RiskProfile;
  regonData?: RegonData;
  fleet: Vehicle[];
  claimsHistory: ClaimSummary[];
}
```

### Policy

```typescript
interface Policy {
  id: string;
  policyNumber: string;
  clientId: string;
  status: PolicyStatus; // DRAFT | QUOTED | ACTIVE | EXPIRED | CANCELLED
  sumInsured: number;
  totalPremium: number;
  territorialScope: TerritorialScope; // POLAND | EUROPE | WORLD
  validFrom: Date;
  validTo: Date;
  clauses: PolicyClause[];
}
```

### RiskProfile

```typescript
interface RiskProfile {
  overallScore: number; // 0-100
  riskLevel: RiskLevel; // LOW | MEDIUM | HIGH | VERY_HIGH
  yearsInBusiness: number;
  claimsRatio: number;
  bonusMalus: number; // -15% to +50%
  transportTypes: string[];
  mainRoutes: TerritorialScope[];
  hasADRCertificate: boolean;
  hasTAPACertificate: boolean;
}
```

---

## 🔒 Bezpieczeństwo

> ⚠️ **Uwaga**: Niektóre funkcje bezpieczeństwa są zaimplementowane, inne wymagają dalszej pracy.

**Zaimplementowane:**

- [x] Walidacja uprawnień (RBAC) - `src/lib/auth/roles.ts`
- [x] Rate limiting na endpointy API
- [x] Soft delete dla audit compliance
- [x] Input validation (Zod schemas)

**Do wdrożenia:**

- [ ] Dodać autentykację (NextAuth.js / Clerk)
- [ ] Wdrożyć HTTPS
- [ ] Zaimplementować pełny audit log
- [ ] Migracja localStorage auth do httpOnly cookies

---

## 📝 Licencja

MIT License - zobacz [LICENSE](LICENSE)

---

## 👥 Autorzy

Adam B. Zbudowane z ❤️ dla branży transportowej w Polsce.
