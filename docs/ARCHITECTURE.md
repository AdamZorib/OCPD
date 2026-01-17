# Dokumentacja Techniczna - OCPD Insurance Platform

## Architektura systemu

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │Dashboard│ │ Clients │ │Policies │ │ Quotes  │           │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘           │
│       │           │           │           │                  │
│  ┌────┴───────────┴───────────┴───────────┴────┐           │
│  │           UI Components (React)              │           │
│  └──────────────────────┬──────────────────────┘           │
└─────────────────────────┼───────────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────────┐
│                    API Layer                                 │
│  ┌──────────────────────┴──────────────────────┐           │
│  │           Next.js API Routes                 │           │
│  └──────────────────────┬──────────────────────┘           │
│       │           │           │           │                  │
│  ┌────┴────┐ ┌────┴────┐ ┌────┴────┐ ┌────┴────┐           │
│  │/clients │ │/policies│ │ /quotes │ │ /claims │ │ /certs  │           │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
└─────────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────────┐
│                  Business Logic                              │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │   Calculator    │  │ Clause Definitions│                  │
│  │ (underwriting)  │  │   (clauses)       │                  │
│  └─────────────────┘  └─────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────────┐
│                   Data Layer                                 │
│  ┌─────────────────────────────────────────────┐           │
│  │              Mock Data (dev)                 │           │
│  │         PostgreSQL + Prisma (prod)           │           │
│  └─────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

## Przepływ danych

### Kreator wycen (Quote Wizard Flow)

```
1. Dane klienta        2. Parametry         3. APK
   ┌─────────┐           ┌─────────┐         ┌─────────┐
   │   NIP   │ ───────▶  │  Suma   │ ──────▶ │ Ładunki │
   │  Nazwa  │           │  Zakres │         │ Ryzyko  │
   │ Kontakt │           │  Okres  │         │ Historia│
   └─────────┘           └─────────┘         └─────────┘
                                                   │
                                                   ▼
4. Klauzule            5. Podsumowanie      Calculator
   ┌─────────┐           ┌─────────┐         ┌─────────┐
   │ Wybór   │ ◀──────── │ Składka │ ◀────── │Kalkulacja│
   │ Opcji   │           │ Ryzyko  │         │ Premium │
   │         │           │ Referral│         │         │
   └─────────┘           └─────────┘         └─────────┘
```

## Kalkulator składek - szczegóły

### Stawki bazowe

```typescript
const BASE_RATES = {
  POLAND: 0.0008,  // 0.08%
  EUROPE: 0.0012,  // 0.12%
  WORLD:  0.0018,  // 0.18%
};
```

### Modyfikatory ryzyka APK

```typescript
const RISK_MODIFIERS = {
  highValueGoods: 1.20,        // +20%
  dangerousGoods: 1.35,        // +35%
  temperatureControlled: 1.15, // +15%
  highClaimsHistory: 1.10-1.50 // +10% do +50%
};
```

### Zniżki za doświadczenie

```typescript
const EXPERIENCE_DISCOUNT = {
  '5-10 lat':  0.95,  // -5%
  '10-15 lat': 0.90,  // -10%
  '15+ lat':   0.85,  // -15%
};
```

### Zniżki za wielkość floty

```typescript
const FLEET_DISCOUNT = {
  '10-20':  0.97,  // -3%
  '20-50':  0.93,  // -7%
  '50+':    0.90,  // -10%
};
```

### Bonus-Malus

```typescript
// Bezszkodowy przebieg
const BONUS = {
  '1 rok':  0.95,  // -5%
  '2 lata': 0.90,  // -10%
  '3+ lat': 0.85,  // -15%
};

// Historia szkód
const MALUS = {
  '1 szkoda':  1.10,  // +10%
  '2 szkody':  1.25,  // +25%
  '3+ szkody': 1.50,  // +50%
};
```

## Klauzule dodatkowe

| Typ | Nazwa PL | Stawka | Sublimit | Kategoria |
|-----|----------|--------|----------|-----------|
| GROSS_NEGLIGENCE | Rażące niedbalstwo | +8% | 100% | STANDARD |
| FRIDGE | Chłodnia (awaria) | +12% | 80% | ELEVATED |
| ADR | Towary niebezpieczne | +15% | 60% | HIGH |
| THEFT_PARKING | Kradzież z parkingu | +10% | 70% | HIGH |
| DELAY | Opóźnienie dostawy | +5% | 50% | STANDARD |
| ADDITIONAL_COSTS | Koszty dodatkowe | +3% | 30% | STANDARD |
| CABOTAGE | Kabotaż | +6% | 100% | ELEVATED |

## Warunki referral (akceptacja underwritera)

Wycena wymaga ręcznej akceptacji gdy:

```typescript
const REFERRAL_CONDITIONS = [
  sumInsured > 1_000_000,              // Wysoka suma
  riskLevel === 'HIGH' || 'VERY_HIGH', // Wysokie ryzyko
  clauses.includes('ADR'),              // Klauzula ADR
  clauses.includes('THEFT_PARKING'),    // Klauzula kradzież
  territorialScope === 'WORLD',         // Zakres światowy
  claimsRatio > 0.8,                    // Wysoka szkodowość
];
```

## Design System

### Kolory (Dark Theme)

```css
/* Tła */
--color-bg-primary: #0f0f12;
--color-bg-secondary: #16161a;
--color-bg-tertiary: #1c1c22;

/* Akcenty */
--color-accent-primary: #6366f1;    /* Indigo */
--color-accent-secondary: #8b5cf6;  /* Violet */

/* Statusy */
--color-success: #10b981;  /* Zielony */
--color-warning: #f59e0b;  /* Pomarańczowy */
--color-danger: #ef4444;   /* Czerwony */
--color-info: #3b82f6;     /* Niebieski */
```

### Typografia

```css
--font-sans: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

### Spacing

```css
--spacing-xs: 0.25rem;   /* 4px */
--spacing-sm: 0.5rem;    /* 8px */
--spacing-md: 1rem;      /* 16px */
--spacing-lg: 1.5rem;    /* 24px */
--spacing-xl: 2rem;      /* 32px */
```

## API Responses

### Standardowy format odpowiedzi

```typescript
// Lista
interface ListResponse<T> {
  data: T[];
  total: number;
  stats?: Record<string, number>;
}

// Pojedynczy obiekt
interface SingleResponse<T> {
  data: T;
}

// Błąd
interface ErrorResponse {
  error: string;
  details?: string[];
}
```

### Kody HTTP

| Kod | Znaczenie |
|-----|-----------|
| 200 | OK - Sukces |
| 201 | Created - Utworzono |
| 400 | Bad Request - Błędne dane |
| 404 | Not Found - Nie znaleziono |
| 500 | Internal Error - Błąd serwera |

## Rozszerzenia (TODO)

### Integracje zewnętrzne

- **REGON API** - Pobieranie danych firm po NIP
- **CEPiK** - Weryfikacja pojazdów
- **KRS** - Dane rejestrowe spółek
- **Sanction Lists** - Weryfikacja AML

### Baza danych (Prisma Schema)

```prisma
model Client {
  id            String   @id @default(cuid())
  nip           String   @unique
  name          String
  email         String
  phone         String?
  riskProfileId String?
  policies      Policy[]
  claims        Claim[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Policy {
  id              String   @id @default(cuid())
  policyNumber    String   @unique
  clientId        String
  client          Client   @relation(fields: [clientId], references: [id])
  status          PolicyStatus
  sumInsured      Decimal
  totalPremium    Decimal
  territorialScope TerritorialScope
  validFrom       DateTime
  validTo         DateTime
  clauses         PolicyClause[]
  claims          Claim[]
  createdAt       DateTime @default(now())
}

model InsuranceCertificate {
  id                String   @id @default(cuid())
  certificateNumber String   @unique
  policyId          String
  policy            Policy   @relation(fields: [policyId], references: [id])
  clientId          String
  client            Client   @relation(fields: [clientId], references: [id])
  cargoValue        Decimal
  generatedAt       DateTime @default(now())
}
```

### Autentykacja (NextAuth.js)

```typescript
// Planowana konfiguracja
export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Broker Login',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Hasło", type: "password" }
      },
    }),
  ],
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        role: user.role, // BROKER | UNDERWRITER | ADMIN
      },
    }),
  },
};
```
