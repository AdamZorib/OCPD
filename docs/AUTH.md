# System Autoryzacji - OCPD Insurance Platform

## Przegląd

System autoryzacji oparty jest na modelu RBAC (Role-Based Access Control) z granularnymi uprawnieniami typu `resource:action`.

---

## Role systemowe

System definiuje 5 ról systemowych, które nie mogą być modyfikowane:

| Rola | Kolor | Opis |
|------|-------|------|
| **BROKER** | 🔵 Niebieski | Sprzedaż polis, obsługa klientów, wystawianie certyfikatów |
| **UNDERWRITER** | 🟣 Fioletowy | Ocena ryzyka, akceptacja referralów, korekta składek |
| **SUPERVISOR** | 🟡 Pomarańczowy | Nadzór nad brokerami, dostęp do raportów, eskalacje |
| **ADMIN** | 🔴 Czerwony | Pełny dostęp do systemu, zarządzanie użytkownikami i rolami |
| **CLIENT** | 🟢 Zielony | Dostęp do własnych polis, certyfikatów i szkód |

---

## Uprawnienia

Format uprawnienia: `resource:action`

### Kategorie uprawnień

| Kategoria | Uprawnienia |
|-----------|-------------|
| **QUOTES** | `create`, `read`, `calculate`, `delete`, `submit` |
| **POLICIES** | `read`, `issue`, `cancel`, `renew`, `print`, `modify` |
| **CERTIFICATES** | `read`, `create`, `print`, `revoke` |
| **CLAIMS** | `read`, `create`, `update`, `resolve`, `reject` |
| **CLIENTS** | `read`, `create`, `update`, `delete` |
| **UNDERWRITING** | `view`, `approve`, `reject`, `adjust_premium`, `conditional_approve` |
| **PAYMENTS** | `view`, `process`, `refund` |
| **DOCUMENTS** | `view`, `generate`, `download` |
| **ADMIN** | `users`, `roles`, `settings`, `audit`, `reports` |

---

## Matryca uprawnień

```
                      BROKER  UW    SUPER  ADMIN  CLIENT
quotes:create           ✓      -      -      ✓       -
quotes:read             ✓      ✓      ✓      ✓       -
quotes:calculate        ✓      ✓      ✓      ✓       -
quotes:delete           -      -      -      ✓       -
quotes:submit           ✓      -      -      ✓       -

policies:read           ✓      ✓      ✓      ✓       ✓
policies:issue          -      ✓      -      ✓       -
policies:cancel         -      ✓      ✓      ✓       -
policies:renew          ✓      -      -      ✓       -
policies:print          ✓      ✓      ✓      ✓       -
policies:modify         -      ✓      -      ✓       -

certificates:read       ✓      ✓      ✓      ✓       ✓
certificates:create     ✓      ✓      -      ✓       -
certificates:print      ✓      ✓      ✓      ✓       ✓
certificates:revoke     -      ✓      -      ✓       -

claims:read             ✓      ✓      ✓      ✓       ✓
claims:create           ✓      -      -      ✓       ✓
claims:update           -      ✓      ✓      ✓       -
claims:resolve          -      ✓      -      ✓       -
claims:reject           -      ✓      -      ✓       -

clients:read            ✓      ✓      ✓      ✓       -
clients:create          ✓      -      -      ✓       -
clients:update          ✓      ✓      ✓      ✓       -
clients:delete          -      -      -      ✓       -

underwriting:view       -      ✓      ✓      ✓       -
underwriting:approve    -      ✓      -      ✓       -
underwriting:reject     -      ✓      -      ✓       -
underwriting:adjust     -      ✓      -      ✓       -
underwriting:cond_appr  -      ✓      -      ✓       -

payments:view           ✓      ✓      ✓      ✓       -
payments:process        -      ✓      -      ✓       -
payments:refund         -      -      -      ✓       -

documents:view          ✓      ✓      ✓      ✓       ✓
documents:generate      ✓      ✓      -      ✓       -
documents:download      ✓      ✓      ✓      ✓       ✓

admin:users             -      -      -      ✓       -
admin:roles             -      -      -      ✓       -
admin:settings          -      -      -      ✓       -
admin:audit             -      -      ✓      ✓       -
admin:reports           -      -      ✓      ✓       -
```

---

## Pliki źródłowe

| Plik | Opis |
|------|------|
| `src/lib/auth/roles.ts` | Definicje ról i przypisane uprawnienia |
| `src/lib/auth/permissions.ts` | Lista wszystkich uprawnień z metadanymi |
| `src/lib/auth/context.tsx` | React Context dla stanu autoryzacji |
| `src/lib/auth/users.ts` | Zarządzanie użytkownikami |
| `src/lib/auth/index.ts` | Eksporty modułu |

---

## Użycie w kodzie

### Sprawdzanie uprawnień

```typescript
import { roleHasPermission, getRolePermissions } from '@/lib/auth/roles';

// Sprawdź pojedyncze uprawnienie
const canApprove = roleHasPermission('UNDERWRITER', 'underwriting:approve');

// Pobierz wszystkie uprawnienia roli
const brokerPerms = getRolePermissions('BROKER');
```

### Context API

```tsx
import { useAuth } from '@/lib/auth/context';

function Component() {
    const { user, hasPermission, logout } = useAuth();
    
    if (!hasPermission('policies:issue')) {
        return <div>Brak dostępu</div>;
    }
    
    return <IssuePolicy />;
}
```

---

## Panel administracyjny

Dostępny pod `/admin` dla użytkowników z rolą `ADMIN`.

### Funkcje

| Strona | Ścieżka | Opis |
|--------|---------|------|
| Dashboard | `/admin` | Przegląd systemu |
| Użytkownicy | `/admin/users` | CRUD użytkowników |
| Role | `/admin/roles` | Zarządzanie rolami |
| Audit | `/admin/audit` | Historia zmian |

---

## Bezpieczeństwo

> ⚠️ **Uwaga**: Obecna implementacja używa mock data. Przed wdrożeniem produkcyjnym:

- [ ] Zintegrować z NextAuth.js lub Clerk
- [ ] Dodać hashowanie haseł (bcrypt/argon2)
- [ ] Implementować sesje JWT z odświeżaniem
- [ ] Dodać 2FA dla ról ADMIN i UNDERWRITER
- [ ] Wdrożyć rate limiting na endpointy logowania
