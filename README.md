# Templify

Premium storefront dla digital templates, gotowych systemów i produktów cyfrowych zbudowany w `Next.js 16`, `TypeScript`, `Tailwind CSS v4`, `Supabase` i `Stripe`.

## Env

Wymagane zmienne:

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

## Migracje i typy Supabase

Repo używa migracji w `supabase/migrations`.

Uruchom:

```bash
npx supabase db push --include-all
```

Odśwież typy:

```bash
npx supabase gen types typescript --linked --schema public | Out-File -FilePath src/types/database.types.ts -Encoding utf8
```

## Co kliknąć w Supabase

1. `Authentication > Providers > Email`: włącz Email.
2. `Storage`: utwórz buckety `product-files` i `product-covers`.
3. `Table Editor`: sprawdź tabele:
   `profiles`, `admin_allowlist`, `categories`, `products`, `product_previews`, `orders`, `order_items`, `library_items`, `site_sections`, `content_pages`, `faq_items`, `testimonials`.
4. Jeśli chcesz testować bez potwierdzenia maila, wyłącz `Confirm email`.

## Auth i role

- Logowanie i rejestracja działają przez Supabase Auth.
- Middleware chroni `/konto`, `/biblioteka` i `/admin`.
- Profil użytkownika powstaje automatycznie po zmianach w `auth.users`.
- Rola `admin` jest nadawana na podstawie tabeli `admin_allowlist`.
- Jeśli mail znajduje się na allowliście i użytkownik zaloguje się lub zarejestruje, jego profil dostaje rolę `admin`.
- Zmiany w allowliście synchronizują role także dla istniejących profili o tym samym adresie e-mail.

## Domyślna allowlista adminów

Migracja seeduje aktywne wpisy:

- `kgodlewski04@gmail.com`
- `michwel7@gmail.com`
- `paweltokarski5@gmail.com`
- `podsiadlo.bartosz.bp@gmail.com`
- `ptwgadmin@gmail.com`

Jeśli w adresie pojawią się znaki narodowe, trzymaj zapis w zwykłym ASCII albo dodaj konto przez dokładnie ten sam adres, którego używa logowanie.

## Storage i uploady

- `product-files`: prywatne pliki cyfrowe do pobrania po zakupie.
- `product-covers`: okładki i preview images.
- Uploady okładek, plików i preview działają z panelu admina.
- Pobrania z biblioteki idą przez signed URL i są dostępne tylko dla użytkownika z wpisem w `library_items`.

## Content i panel admina

Panel admina ma sekcje:

- `Dashboard`
- `Produkty`
- `Kategorie`
- `Zamówienia`
- `Content / Strony`
- `Użytkownicy / Admini`
- `Ustawienia`

W `Content / Strony` edytujesz:

- hero i sekcje homepage
- FAQ
- testimonials
- legal pages

W `Produkty` edytujesz:

- status `draft / published / archived`
- badge `bestseller / new / featured / pack`
- pricing i compare-at price
- category
- cover image
- product file
- preview images
- kolejność i featured order

## Theme toggle i cookies

- Theme toggle obsługuje `light`, `dark` i `system`.
- Ustawienie zapisuje się w `localStorage` pod kluczem `templify-theme`.
- Banner cookies zapisuje zgody w `localStorage` pod kluczem `templify-cookie-consent`.
- Kategorie zgód: `necessary`, `analytics`, `marketing`.
- To przygotowuje aplikację pod późniejsze podpięcie narzędzi analitycznych zgodnie ze zgodami.

## Consent-aware analytics

- Eventy są uruchamiane tylko po zgodzie na kategorię `analytics`.
- Warstwa analytics jest abstrakcją gotową pod późniejsze podpięcie docelowego narzędzia.
- Aktualnie emituje eventy:
  - `page_view`
  - `view_product`
  - `add_to_cart`
  - `begin_checkout`
  - `purchase`
- Eventy trafiają do lokalnej kolejki `window.templifyAnalyticsQueue` oraz do `window.dataLayer`, jeśli istnieje.

## SEO i soft launch

- Homepage, listing, produkt i legal pages mają osobne metadata i canonical URLs.
- Produkt ma Open Graph oraz structured data `Product`.
- Homepage renderuje structured data `FAQPage`.
- `robots.txt` blokuje prywatne sekcje (`/admin`, `/konto`, `/biblioteka`, `/checkout`, `/logowanie`, `/rejestracja`).
- `sitemap.xml` zawiera storefront, produkty i legal pages.

## Co przetestować przed soft launch

1. Zwykły user nie powinien dostać się do `/admin` ani wykonać mutacji admina.
2. Spróbuj wgrać niepoprawny plik do produktu i sprawdź komunikat błędu.
3. Wykonaj testowy checkout i odśwież kilka razy `/checkout/sukces`.
4. Sprawdź, że produkt pojawia się w bibliotece tylko raz.
5. Przetestuj `light`, `dark` i `system`.
6. Wyczyść `localStorage` dla consentu i sprawdź zachowanie bannera cookies.
7. Otwórz `/robots.txt` i `/sitemap.xml`.

## Stripe lokalnie

1. Zaloguj się do Stripe CLI:

```bash
stripe login
```

2. Uruchom forwarding webhooków:

```bash
stripe listen --events checkout.session.completed --forward-to localhost:3000/api/stripe/webhook
```

3. Skopiuj sekret `whsec_...` do `STRIPE_WEBHOOK_SECRET`.

## Testowy zakup

1. Uruchom aplikację.
2. Zaloguj się.
3. Dodaj produkt do koszyka.
4. Przejdź do `/checkout`.
5. Użyj testowej karty `4242 4242 4242 4242`.
6. Po sukcesie sprawdź `/biblioteka` i `/konto`.
