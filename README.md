# PTWG.pl MVP

Sklep z cyfrowymi produktami premium zbudowany w `Next.js 16`, `TypeScript`, `Tailwind CSS v4` i `shadcn/ui`, z prawdziwym `Supabase Auth`, bazą danych, RLS i bucketami storage.

## Wymagane envy

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
```

Opcjonalnie zostawione pod kolejny etap:

```bash
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
- rola użytkownika jest trzymana w `public.profiles.role`

## Storage i uploady

1. W `Storage` utwórz buckety `product-files` i `product-covers`.
2. Oba buckety zostaw jako prywatne.
3. Upload okładek i plików działa z panelu admina przy tworzeniu i edycji produktu.
4. Ścieżki plików zapisują się w `public.products.cover_path` oraz `public.products.file_path`.
5. Pobrania z biblioteki działają tylko dla użytkownika, który ma rekord w `library_items`.
6. Endpoint `/api/library/[productId]/download` generuje signed URL dla `product-files` i aktualizuje `download_count` oraz `last_downloaded_at`.

## Co kliknąć w Supabase

1. Wejdź do `Authentication > Providers > Email` i upewnij się, że Email jest włączony.
2. Jeśli chcesz logowanie bez potwierdzenia maila, wyłącz `Confirm email`.
3. W `Storage` sprawdź buckety `product-files` i `product-covers`.
4. W `Table Editor` zobacz tabele: `profiles`, `categories`, `products`, `orders`, `order_items`, `library_items`.

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
- listing produktów i karta produktu czytane z Supabase, z bezpiecznym fallbackiem na mocki
- konto, biblioteka i panel admina czytają prawdziwe dane z Supabase
- admin ma działający CRUD kategorii i produktów
- upload okładek i plików działa przez Supabase Storage
- biblioteka obsługuje bezpieczne pobrania i liczniki downloadów

## Następne kroki przed Stripe

1. Dodać finalny zapis zamówienia po prawdziwym checkout flow.
2. Powiązać `orders`, `order_items` i `library_items` z webhookiem płatności.
3. Dodać automatyczne nadawanie dostępu do biblioteki po opłaceniu zamówienia.
4. Dodać historię statusów zamówień i mailowe potwierdzenia po zakupie.
