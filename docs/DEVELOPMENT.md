# Przewodnik dla deweloperów

## Szybki start

```bash
# Instalacja
npm install

# Uruchomienie dev
npm run dev

# Build produkcyjny
npm run build && npm start
```

## Konwencje kodu

### Nazewnictwo plików

| Typ | Konwencja | Przykład |
|-----|-----------|----------|
| Komponenty | PascalCase | `Button.tsx` |
| CSS Modules | ComponentName.module.css | `Button.module.css` |
| Strony | page.tsx (Next.js) | `app/clients/page.tsx` |
| API Routes | route.ts | `app/api/clients/route.ts` |
| Typy | index.ts w types/ | `types/index.ts` |
| Utilities | camelCase | `mock-data.ts` |

### Struktura komponentu

```tsx
'use client'; // Jeśli używa hooks

import { forwardRef, useId } from 'react';
import clsx from 'clsx';
import styles from './Component.module.css';

export interface ComponentProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

export const Component = forwardRef<HTMLDivElement, ComponentProps>(
  ({ variant = 'primary', children, className, ...props }, ref) => {
    return (
      <div 
        ref={ref}
        className={clsx(styles.component, styles[variant], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Component.displayName = 'Component';
```

### Struktura strony

```tsx
'use client';

import { useState } from 'react';
import { Card, Button } from '@/components/ui';
import styles from './page.module.css';

export default function PageName() {
  const [state, setState] = useState();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Tytuł</h1>
      </header>
      <main>
        {/* Content */}
      </main>
    </div>
  );
}
```

### API Route

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  // Logic
  
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation
    if (!body.requiredField) {
      return NextResponse.json(
        { error: 'Field required' },
        { status: 400 }
      );
    }
    
    // Logic
    
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
```

## Dodawanie nowej funkcjonalności

### 1. Nowy komponent UI

```bash
# Utwórz pliki
src/components/ui/
├── NewComponent.tsx
└── NewComponent.module.css

# Dodaj eksport w index.ts
export * from './NewComponent';
```

### 2. Nowa strona

```bash
# Utwórz folder w app/
src/app/new-page/
├── page.tsx
└── page.module.css

# Dodaj link w Sidebar.tsx
{ icon: Icon, label: 'Nowa strona', href: '/new-page' }
```

### 3. Nowy endpoint API

```bash
# Utwórz plik route.ts
src/app/api/new-endpoint/
└── route.ts

# Dla dynamicznych tras
src/app/api/new-endpoint/[id]/
└── route.ts
```

## CSS Design System

### Użycie zmiennych

```css
.component {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
}

.component:hover {
  border-color: var(--color-border-hover);
}
```

### Animacje

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.element {
  animation: fadeIn var(--transition-base) ease-out;
}
```

## Testowanie API

### PowerShell

```powershell
# GET
Invoke-RestMethod -Uri "http://localhost:3000/api/clients"

# POST
Invoke-RestMethod -Uri "http://localhost:3000/api/clients" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"nip": "1234567890", "name": "Test", "email": "test@test.pl"}'
```

### cURL

```bash
# GET
curl http://localhost:3000/api/clients

# POST
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -d '{"nip": "1234567890", "name": "Test", "email": "test@test.pl"}'
```

## Troubleshooting

### Hydration Error

**Problem:** `Hydration failed because the server rendered HTML didn't match the client.`

**Rozwiązanie:** Użyj `useId()` zamiast `Math.random()` dla generowania ID:

```tsx
// ❌ Źle
const id = `input-${Math.random().toString(36).substr(2, 9)}`;

// ✅ Dobrze
const id = useId();
```

### CSS nie działa

**Problem:** Style nie są aplikowane.

**Rozwiązanie:** Sprawdź czy używasz CSS Modules:

```tsx
// ❌ Źle
import './styles.css';
<div className="container">

// ✅ Dobrze
import styles from './styles.module.css';
<div className={styles.container}>
```

### API 404

**Problem:** Endpoint zwraca 404.

**Rozwiązanie:** Sprawdź strukturę plików:

```
✅ src/app/api/clients/route.ts      → /api/clients
✅ src/app/api/clients/[id]/route.ts → /api/clients/:id
❌ src/api/clients.ts                → Nie działa!
```
