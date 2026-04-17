# PTWG.pl MVP

Sklep z cyfrowymi produktami premium zbudowany w `Next.js 16`, `TypeScript`, `Tailwind CSS v4` i `shadcn/ui`, z prawdziwym `Supabase Auth`, bazą danych, RLS, Storage i działającym `Stripe Checkout`.

## Wymagane envy

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

## Start lokalny

```bash
npm install
npm run dev
```

Weryfikacja:

```bash
npm run lint
npm run typecheck
npm run build
```

## Migracje Supabase

Repo używa migracji w `supabase/migrations`.

Uruchomienie:

```bash
npx supabase db push --include-all
```

Odświeżenie typów po zmianach w bazie:

```bash
npx supabase gen types typescript --linked --schema public | Out-File -FilePath src/types/database.types.ts -Encoding utf8
```

## Jak działa auth

- `/logowanie` używa `supabase.auth.signInWithPassword`
- `/rejestracja` używa `supabase.auth.signUp`
- profil użytkownika powstaje automatycznie przez trigger na `auth.users`
- `/konto`, `/biblioteka` i `/admin` są chronione przez middleware oparte o auth cookies
- checkout wymaga zalogowanego użytkownika, aby zakup można było przypisać do biblioteki

## Storage i uploady

1. W `Storage` utwórz buckety `product-files` i `product-covers`.
2. Oba buckety zostaw jako prywatne.
3. Upload okładek i plików działa z panelu admina przy tworzeniu i edycji produktu.
4. Ścieżki plików zapisują się w `public.products.cover_path` oraz `public.products.file_path`.
5. Pobrania z biblioteki działają tylko dla użytkownika, który ma rekord w `library_items`.
6. Endpoint `/api/library/[productId]/download` generuje signed URL dla `product-files` i aktualizuje `download_count` oraz `last_downloaded_at`.

## Stripe Checkout

- `/checkout` tworzy prawdziwą `Checkout Session` na podstawie koszyka i produktów z Supabase
- `success_url` i `cancel_url` używają `NEXT_PUBLIC_SITE_URL`
- webhook działa pod `/api/stripe/webhook`
- po `checkout.session.completed` aplikacja zapisuje:
  - `orders`
  - `order_items`
  - `library_items`
- fulfillment jest idempotentny dzięki unikalnemu `stripe_checkout_session_id`, unikalnym pozycjom `order_items` i tabeli `stripe_webhook_events`

## Jak uruchomić Stripe lokalnie

1. Zaloguj się do Stripe CLI:

```bash
stripe login
```

2. Uruchom forwarding webhooków do lokalnej aplikacji:

```bash
stripe listen --events checkout.session.completed --forward-to localhost:3000/api/stripe/webhook
```

3. Skopiuj sekret `whsec_...` z outputu CLI do `STRIPE_WEBHOOK_SECRET` w `.env.local`.

## Jak testować webhook

Najprostszy test to przejście pełnego checkoutu z UI. Możesz też użyć CLI:

```bash
stripe trigger checkout.session.completed
```

W praktyce najlepszy test to normalny zakup z koszyka, bo wtedy webhook dostaje prawdziwą sesję wygenerowaną przez aplikację.

## Jak wykonać testowy zakup

1. Uruchom aplikację przez `npm run dev`.
2. Upewnij się, że działa `stripe listen --events checkout.session.completed --forward-to localhost:3000/api/stripe/webhook`.
3. Zaloguj się do aplikacji.
4. Dodaj produkt do koszyka i przejdź do `/checkout`.
5. Kliknij przycisk płatności, aby wejść do Stripe Checkout.
6. Użyj testowej karty `4242 4242 4242 4242`, dowolnej przyszłej daty, dowolnego CVC i kodu pocztowego.
7. Po sukcesie wrócisz na `/checkout/sukces`, a produkt powinien pojawić się w `/biblioteka`.

## Co kliknąć w Supabase

1. Wejdź do `Authentication > Providers > Email` i upewnij się, że Email jest włączony.
2. Jeśli chcesz logowanie bez potwierdzenia maila, wyłącz `Confirm email`.
3. W `Storage` sprawdź buckety `product-files` i `product-covers`.
4. W `Table Editor` zobacz tabele: `profiles`, `categories`, `products`, `orders`, `order_items`, `library_items`, `stripe_webhook_events`.

## Jak ustawić role admin/user

Nowi użytkownicy dostają domyślnie rolę `user`.

Aby nadać admina, wykonaj w SQL Editor:

```sql
update public.profiles
set role = 'admin'
where email = 'twoj-adres@example.com';
```

## Obecny zakres integracji

- realny Supabase Auth zamiast demo sesji
- realne middleware z cookie auth
- profile i role z tabeli `profiles`
- listing produktów i karta produktu czytane z Supabase
- admin ma działający CRUD kategorii i produktów
- upload okładek i plików działa przez Supabase Storage
- biblioteka obsługuje bezpieczne pobrania i liczniki downloadów
- Stripe Checkout zapisuje prawdziwe zamówienia i automatycznie nadaje dostęp do biblioteki
