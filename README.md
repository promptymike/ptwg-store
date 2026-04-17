# PTWG.pl MVP

MVP sklepu z cyfrowymi produktami premium zbudowane w `Next.js 16`, `TypeScript`, `Tailwind CSS v4` i `shadcn/ui`.

## Zakres MVP

- publiczny storefront z landing page, listingiem produktów, filtrowaniem, kartą produktu, koszykiem i mock checkoutem
- placeholdery logowania, rejestracji, konta i biblioteki użytkownika
- placeholderowy panel admina z dashboardem, listą produktów, formularzem produktu i formularzem kategorii
- mock dane po polsku dla kategorii: planery, przepisy, plany treningowe, finanse, rozwój osobisty
- struktura gotowa pod integrację `Supabase Auth`, `Supabase DB`, `Supabase Storage` i `Stripe Checkout`
- middleware skeleton do ochrony tras po roli
- walidacja `Zod` dla auth, checkoutu i formularzy admina

## Stack

- `Next.js App Router`
- `TypeScript`
- `Tailwind CSS v4`
- `shadcn/ui`
- `Zod`
- `@supabase/ssr`
- `@supabase/supabase-js`
- `Stripe`

## Uruchomienie lokalne

```bash
npm install
npm run dev
```

Opcjonalna weryfikacja:

```bash
npm run lint
npm run typecheck
npm run build
```

## Główne ścieżki

- `/` - landing page
- `/produkty` - listing produktów z filtrowaniem
- `/produkty/[slug]` - karta produktu
- `/koszyk` - koszyk w `localStorage`
- `/checkout` - mock checkout
- `/logowanie` - placeholder logowania + demo sesje
- `/rejestracja` - placeholder rejestracji
- `/konto` - placeholder konta
- `/biblioteka` - placeholder biblioteki
- `/admin` - placeholder dashboardu admina
- `/admin/produkty` - lista produktów + formularze
- `/admin/zamowienia` - lista zamówień placeholder

## Struktura

```text
src
├─ app
│  ├─ (store)
│  │  ├─ biblioteka
│  │  ├─ checkout
│  │  ├─ konto
│  │  ├─ koszyk
│  │  ├─ logowanie
│  │  ├─ produkty
│  │  ├─ rejestracja
│  │  ├─ layout.tsx
│  │  └─ page.tsx
│  ├─ admin
│  ├─ api
│  │  ├─ auth/mock-session
│  │  └─ checkout
│  ├─ globals.css
│  ├─ layout.tsx
│  ├─ loading.tsx
│  └─ not-found.tsx
├─ components
│  ├─ admin
│  ├─ auth
│  ├─ cart
│  ├─ checkout
│  ├─ layout
│  ├─ products
│  ├─ sections
│  ├─ shared
│  └─ ui
├─ data
│  ├─ mock-store.ts
│  └─ seed.ts
├─ lib
│  ├─ supabase
│  ├─ validations
│  ├─ env.ts
│  ├─ format.ts
│  ├─ session.ts
│  ├─ stripe.ts
│  └─ utils.ts
└─ types
   └─ store.ts
```

## Co jest gotowe pod Supabase

- `src/lib/supabase/client.ts` - browser client skeleton
- `src/lib/supabase/server.ts` - server client skeleton
- `src/lib/session.ts` - miejsce pod odczyt roli / sesji
- `middleware.ts` - ochrona tras dla użytkownika i admina
- `src/data/seed.ts` - seed payload do pierwszego importu danych

Docelowy kierunek:

1. podpiąć prawdziwe sesje z `Supabase Auth`
2. zastąpić mock cookie `ptwg_role` realną sesją
3. przenieść produkty, kategorie, zamówienia i bibliotekę do tabel w Supabase
4. podpiąć `Supabase Storage` pod pliki produktów

## Co jest gotowe pod Stripe

- `src/lib/stripe.ts` - serwerowy helper Stripe
- `src/app/api/checkout/route.ts` - placeholder API z walidacją `Zod`
- `src/components/checkout/checkout-client.tsx` - UI checkoutu do podmiany na prawdziwy flow

Docelowy kierunek:

1. utworzyć sesję `Stripe Checkout` w route handlerze
2. zapisać zamówienie po sukcesie płatności
3. obsłużyć webhook Stripe
4. dodać status płatności do panelu admina i biblioteki użytkownika

## Deploy na Vercel

1. wrzuć repo na GitHub
2. zaimportuj projekt do Vercel
3. ustaw zmienne z `.env.example`
4. ustaw domenę `ptwg.pl`
5. po integracji webhooków dodaj URL webhooka Stripe w dashboardzie Stripe

## Notatki implementacyjne

- koszyk działa w `localStorage` i synchronizuje się przez `useSyncExternalStore`
- wszystkie dane produktowe są obecnie mockowane lokalnie
- placeholder auth tworzy demo sesję na cookie, żeby można było przetestować middleware i role bez backendu
- theme oparty jest o stałe dark / gold i elegancką typografię z `Cormorant Garamond` + `Manrope`
