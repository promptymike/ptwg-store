# Templify Stage 2: conversion mechanics

## What is implemented

- Coupon codes are stored in `coupon_codes` and redeemed in `coupon_redemptions`.
- Checkout validates coupon codes server-side before creating a Stripe Checkout Session.
- Coupon usage is copied into `orders.coupon_code` and `orders.coupon_discount_amount`.
- Order bump is controlled from `/admin/ustawienia` via:
  - `order_bump_enabled`
  - `order_bump_product_id`
  - `order_bump_percent_off`
- The checkout UI can add one discounted order bump product without mutating the cart.
- Product bundles, compare-at pricing, post-purchase cross-sell and product badges already use the existing product/bundle admin flows.

## Manual test path

1. Run migrations:
   ```bash
   supabase db push
   ```

2. In admin, go to `/admin/kupony` and create or confirm a code:
   - code: `WELCOME10`
   - discount: `10`
   - active: checked

3. In admin, go to `/admin/ustawienia`:
   - enable order bump
   - pick a published product
   - set a discount, e.g. `20`

4. As a normal user:
   - add one product to cart
   - go to `/checkout`
   - apply `WELCOME10`
   - accept the order bump
   - pay with Stripe test card `4242 4242 4242 4242`

5. After success:
   - verify the order exists in admin
   - verify `library_items` grants access to the original product and the order bump product
   - verify the coupon redemption count increased
   - verify post-purchase recommendations render when there are more published products

## Stripe notes

- The final prices are calculated on the server in `/api/checkout`.
- Client-side totals are only UX hints. Stripe line item prices are generated from Supabase products and server-side coupon/order bump rules.
- If attribution exists, it is still passed through checkout metadata and order columns from Stage 1.

## Existing mechanics reused

- Bundles: `/admin/pakiety` and `/api/checkout/bundle/[id]`.
- Compare-at pricing: product and bundle `compare_at_price`.
- Badges: product `badge`, `bestseller`, `featured`, `featured_order`.
- Cross-sell: success page and library recommendations from `getRecommendedProducts`.
