# Templify Revenue Dashboard And Analytics

## What The Admin Dashboard Uses

- Revenue, orders, purchases, AOV, refunds, product revenue, and campaign revenue come from `orders` and `order_items`.
- Funnel metrics and "views with no purchases" come from `analytics_events`.
- Campaign/source revenue needs attribution columns on `orders`: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `referrer`, and `landing_page`.
- If analytics or attribution data is missing, the dashboard shows empty states instead of guessing.

## Consent Rules

- `page_view`, `view_product`, `add_to_cart`, `begin_checkout`, and `purchase` fire only after analytics consent.
- UTM/referrer attribution is stored only after analytics or marketing consent.
- Checkout works normally when attribution is missing.

## Event Shape

Events are pushed to:

- `window.templifyAnalyticsQueue`
- `window.dataLayer`
- `/api/analytics/event`

Ecommerce events include a consistent `ecommerce` object with `currency`, `value`, `items`, and `transaction_id` when available.

## GTM / GA / Meta Readiness

The app does not load production tracking scripts by default. Add IDs through env vars only after deciding on the consent-aware script loader:

```bash
NEXT_PUBLIC_GTM_ID=
NEXT_PUBLIC_GA_MEASUREMENT_ID=
NEXT_PUBLIC_META_PIXEL_ID=
```

Recommended next step: load GTM only after analytics consent, and load marketing pixels only after marketing consent.

## Local Testing

1. Clear `localStorage`.
2. Accept analytics cookies.
3. Visit a product URL with UTM params, for example `/produkty/example?utm_source=test&utm_medium=cpc&utm_campaign=launch`.
4. Add to cart and start checkout.
5. Complete a Stripe test purchase.
6. Confirm `/admin` shows funnel, product, and campaign data after the webhook or success-page fulfillment creates the order.
