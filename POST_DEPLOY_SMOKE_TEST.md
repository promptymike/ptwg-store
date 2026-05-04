# Templify Post-Deploy Smoke Test

Manual verification runbook for the operator after a deployment that includes
revenue dashboard, coupons, order bump and product master import. Run end to
end before turning paid acquisition on.

Reference points used by every step:

- Production URL: `https://ptwg-store.vercel.app`
- Custom domain `https://ptwg.pl` is currently not configured (DNS resolves to
  nothing). Use the Vercel URL until DNS is pointed.
- Supabase project `ptwg-store` (`txbdmrxnrpgfaiobgtnd`, eu-north-1).
- Stripe checkout: pay attention to whether `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  starts with `pk_test_` (test mode, card `4242 4242 4242 4242` works) or
  `pk_live_` (real money, use a low-value real card and refund afterwards from
  the Stripe dashboard).

## Pre-flight

1. Open `https://ptwg-store.vercel.app/admin` while logged in as an admin.
   Confirm the "Stan operacyjny" panel says "Krytyczne envy launch są
   skonfigurowane". If it lists missing env vars, fix them in Vercel before
   continuing — the new flows depend on `SUPABASE_SECRET_KEY`,
   `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`.
2. Open the Stripe dashboard, switch to the same mode the publishable key
   uses (test or live), and confirm the webhook for
   `checkout.session.completed` exists and has been delivering successfully.
3. Note the current values on `/admin`:
   - revenue card
   - order count
   - active coupon count (visible on `/admin/kupony`)
   - latest event count (Lejek "Zakupy" row)

   These are the baseline for Test 8.

## Test 1 — Admin pages load

| Page | URL | Expected |
| --- | --- | --- |
| Dashboard | `/admin` | Revenue cards, lejek `page_view → purchase`, top products, "Widoki bez zakupów", "Przychód po source / campaign" all render. Empty states render with explanatory text where data is missing. |
| Coupons | `/admin/kupony` | Form for creating a code and list of seeded codes (TEMPLIFY15, WELCOME10, STREAK10). Each card has a working "Wyłącz kod" / "Włącz kod" toggle. |
| Product Master | `/admin/product-master` | Upload + paste UI, `Wstaw przykład` button, rows count = 0 before any input. If categories table is empty, an empty state directs the operator to `/admin/kategorie`. |

Pass criteria: each page loads with no 500/blank state, and the visible
labels are in proper Polish (no `Przychod`/`Zamowienia`/`Wyczysc` mojibake-free
labels).

## Test 2 — Checkout, no coupon, no order bump

1. Sign in as a regular (non-admin) user.
2. Add one published product to the cart, go to `/checkout`.
3. Fill the email field if not pre-filled.
4. Click "Zapłać przez Stripe", complete the Stripe Checkout with the test
   card `4242 4242 4242 4242` (or a real low-value card in live mode).
5. Wait for the success redirect to `/checkout/sukces?session_id=cs_…`.

Pass criteria:
- Success page shows order number, amount, item count.
- E-mail with subject `Potwierdzenie zamówienia …` arrives within 1 minute
  (skip in dev if Resend is not configured).
- DB: `select * from public.orders where stripe_checkout_session_id = 'cs_…'`
  has exactly one row with `status='fulfilled'`, `coupon_code is null`,
  `coupon_discount_amount = 0`, `order_bump_product_id is null`.

## Test 3 — Checkout with coupon `TEMPLIFY15`

1. From an empty cart, add one published product to the cart.
2. Go to `/checkout`, type `TEMPLIFY15` into the promo field, click `Użyj`.
3. Confirm the line "Rabat (TEMPLIFY15)" appears with a -15% amount and the
   total drops accordingly.
4. Complete the Stripe checkout.

Pass criteria:
- DB: the new order has `coupon_code = 'TEMPLIFY15'` and
  `coupon_discount_amount` matches the rabat shown in the UI (in zł, integer).
- DB: `select count(*) from public.coupon_redemptions where coupon_id = (select id from public.coupon_codes where code = 'TEMPLIFY15')` increased by exactly 1.
- DB: `select redemption_count from public.coupon_codes where code = 'TEMPLIFY15'` increased by exactly 1.

## Test 4 — Checkout rejects an unknown / inactive coupon

Pick one of the two paths.

Path A (unknown code):
1. On `/checkout`, type `FAKEDEAL` into the promo field, click `Użyj`.
2. Expected: red message "Ten kod nie dziala lub wygasl" (UI label) and
   no rabat line in the summary.

Path B (deactivated existing code):
1. On `/admin/kupony`, click `Wyłącz kod` on `STREAK10`.
2. On `/checkout`, type `STREAK10`, click `Użyj`.
3. Expected: same rejection message, no rabat applied.
4. Re-enable `STREAK10` afterwards via the same button.

Pass criteria:
- The checkout API never returns a 200 with a non-zero discount for an
  invalid code (verify in the browser network tab — `/api/coupons/validate`
  returns 404 with `ok: false`).
- Even if the operator forces the code into the payload via devtools and
  posts to `/api/checkout`, the server independently re-validates and
  responds with `code: "coupon_invalid"`. Optional advanced check.

## Test 5 — Checkout with order bump

1. Go to `/admin/ustawienia`. In the "Order bump" section:
   - check `order_bump_enabled` is on,
   - set `order_bump_product_id` to the id of a published product that is
     **different** from what you will put in the cart (an order bump never
     fires when the bump product is already in the cart),
   - keep `order_bump_percent_off` at 20 (default).
2. As a regular user, put a different published product in the cart.
3. Go to `/checkout`. The "Oferta przy checkout" panel must appear with the
   bump product, original price, discounted price and the -20% badge.
4. Tick the checkbox. Confirm the summary now shows the bump price added and
   "oszczędzasz X zł".
5. Complete the Stripe checkout.

Pass criteria:
- DB: the order has `order_bump_product_id` set to the bump product's id and
  `order_bump_discount_amount` matches the savings shown.
- DB: `library_items` for the buyer contains both the original product and
  the bump product (`select product_id from public.library_items where user_id = '<buyer>'`).
- If you skip the checkbox, the order bump fields stay null on the order.

## Test 6 — Success page refresh does not duplicate fulfillment or analytics

1. After completing a Stripe checkout (any of the prior tests), stay on
   `/checkout/sukces?session_id=cs_…`.
2. Open devtools → Network → filter `analytics/event`. You should see exactly
   one POST with `event_name: "purchase"`.
3. Press **F5** (hard refresh) twice.
4. After each refresh, check Network: **no new** POST with `event_name: "purchase"`
   should appear. Other events (page_view) are allowed and expected.

Database checks (run after the refreshes):

```sql
-- exactly one order
select count(*) from public.orders
 where stripe_checkout_session_id = 'cs_test_…';

-- exactly one redemption (only if a coupon was applied)
select count(*) from public.coupon_redemptions
 where stripe_checkout_session_id = 'cs_test_…';

-- redemption_count must NOT have moved between refreshes
select redemption_count from public.coupon_codes
 where code = 'TEMPLIFY15';

-- exactly N library_items for this order, where N = item count
select count(*) from public.library_items
 where order_id = (select id from public.orders
                   where stripe_checkout_session_id = 'cs_test_…');

-- exactly one purchase event for this order in analytics
select count(*) from public.analytics_events
 where event_name = 'purchase'
   and properties ->> 'orderId' = '<orderId from success page>';
```

Pass criteria: every count is exactly the value expected after the **first**
fulfillment. No duplicates after F5.

> **Hotfix applied this round:** the success page guards `track("purchase")`
> with a per-order marker in `sessionStorage`. Without that marker a hard
> refresh would refire the analytics event (server-side fulfillment was
> already idempotent — orders, library and redemption counter are unaffected,
> but the dataLayer / GA4 stream would have seen the duplicate). See
> `src/components/checkout/checkout-success-client.tsx`.

## Test 7 — Library contains purchased products

1. As the buyer from Tests 2–5, go to `/biblioteka`.
2. Verify each purchased product (and the order bump product) is listed with
   a working "Pobierz" / "Otwórz" action.
3. Click download for one product. The redirect should produce a Supabase
   signed URL for the private `product-files` bucket. The link should have
   a short TTL.

Pass criteria:
- All purchased products are present.
- Re-buying the same product (a duplicate purchase) does not produce two
  rows in `library_items` for the same `(user_id, product_id)`.

## Test 8 — Revenue dashboard reflects the new order

1. After the test purchases, return to `/admin`.
2. Compare against the baseline noted in Pre-flight:
   - "Przychód" card: increased by the gross amount of the test orders (net
     of any refunds you issue while testing).
   - "Zamówienia" card: increased by the number of test orders.
   - "AOV" card: recalculated.
   - "Top produkty" / "Przychód po produkcie" lists the purchased products.
   - Lejek `purchase` row: `events` count increased by exactly the number
     of orders you placed (one per real purchase, **not** per refresh —
     this is what Test 6 protects).
   - "Przychód po source / campaign" lists `direct / unknown` if you opened
     the storefront without UTMs, or the campaign you used otherwise.

Pass criteria: each metric moves by the expected delta and nothing else looks
wildly off.

## Sign-off

If every test above passes:

- Mark the release as **smoke-tested**.
- Open soft launch to a limited audience (e.g. one paid-traffic source or one
  newsletter segment).
- Re-run Tests 6 and 8 24 hours after the first real customer purchase to
  confirm there is no drift in production.

If any test fails:

- Capture the failing artefact: a screenshot of the network tab, the SQL
  result that disagrees with the expected count, or the relevant Stripe
  Checkout Session id.
- Open an issue with the failing step number and the captured evidence.
- The hotfix path is "minimal change to the implicated file, run
  `npm run lint && npm run typecheck && npm run build`, push to `main`,
  re-deploy, re-run only the failing test".

## Stripe live-mode considerations

If `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is `pk_live_…`:

- Use a personal card with the smallest available product (or a one-off
  test product priced at 1 zł).
- Refund through the Stripe dashboard immediately after Test 8. The order
  will move to `status='refunded'` (enum value added by migration
  `20260503120000_revenue_attribution_analytics`) once the
  refund webhook fires; verify on `/admin` that the refund rate card
  reflects it.
- The "limited soft launch" gate stays in your hands — do not enable any
  paid acquisition channel until the refund-rate card has confirmed the
  refund flow round-trip.
