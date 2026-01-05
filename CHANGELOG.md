# Changelog

Wszystkie istotne zmiany w projekcie są dokumentowane w tym pliku.

## [1.0.0] - 2026-01-05

### Dodane

#### Faza 1: Fundament i Design System

- Ciemny motyw z gradientami i efektami glassmorphism
- Komponenty UI: Button, Card, Input, Select, Badge, Table, Modal, Sidebar
- System CSS Custom Properties dla kolorów, typografii, spacing
- Responsywny sidebar z nawigacją

#### Faza 2: Dashboard

- KPI cards (aktywne polisy, wygasające, składka, szkody)
- Wykresy Recharts (składki vs szkody, top klienci)
- Tabela ostatnich polis
- Listy otwartych szkód i oczekujących wycen

#### Faza 3: Zarządzanie klientami

- Lista klientów z wyszukiwaniem i filtrami
- Widok szczegółów klienta z profilem ryzyka
- Historia polis i szkód klienta
- Certyfikaty ADR/TAPA

#### Faza 4: Zarządzanie polisami

- Lista polis z filtrami statusu i zakresu
- Statystyki: aktywne, wygasające, suma składek
- Oznaczanie polis wygasających (30 dni)

#### Faza 5: Kreator wycen

- 5-krokowy wizard (klient → parametry → APK → klauzule → podsumowanie)
- Integracja z kalkulatorem składek
- Ocena ryzyka i system referral
- 7 typów klauzul dodatkowych

#### Faza 6: Szkody i certyfikaty

- Lista szkód ze statusami i kwotami
- Strona certyfikatów przewozowych

#### Faza 7: API i dokumentacja

- REST API dla wszystkich encji
- Endpoint kalkulacji składek (quick/full)
- Kompletna dokumentacja README.md
- Dokumentacja techniczna (ARCHITECTURE.md, DEVELOPMENT.md)

### Naprawione

- Błąd hydratacji React (Math.random → useId)
- Błąd hydratacji spowodowany rozszerzeniami przeglądarki (suppressHydrationWarning)

### Dodane (aktualizacja 2)

- **Strona szczegółów polisy** (`/policies/[id]`):
  - Pełne informacje o polisie (suma, składka, zakres, daty)
  - Lista klauzul dodatkowych z sublimitami i składkami
  - Dane ubezpieczającego z linkiem do profilu
  - Alert o wygasających polisach
  - Przyciski akcji (druk, certyfikat, szkoda)
- **Druk polisy do PDF** - profesjonalny dokument z:
  - Nagłówkiem i numerem polisy
  - Danymi klienta
  - Parametrami ubezpieczenia
  - Tabelą klauzul
  - Notą prawną i miejscem na podpisy
- **Druk certyfikatu do PDF** - szablon z danymi przewozu

---

## Planowane

### [1.1.0] - Integracje

- [ ] Baza danych PostgreSQL + Prisma
- [ ] Autentykacja NextAuth.js
- [ ] Integracja REGON API
- [ ] Generowanie PDF

### [1.2.0] - Rozszerzenia

- [ ] Panel underwritera
- [ ] Workflow akceptacji wycen
- [ ] Powiadomienia email
- [ ] Dashboard analytics
