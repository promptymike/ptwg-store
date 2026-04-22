-- Checkout fulfillment (src/lib/stripe/fulfillment.ts) upserts orders with
--   .upsert(payload, { onConflict: "stripe_checkout_session_id" })
-- The Supabase JS client serializes this as
--   INSERT ... ON CONFLICT (stripe_checkout_session_id) DO UPDATE ...
-- without a WHERE clause. Migration 20260417120000 only created a **partial**
-- unique index:
--   CREATE UNIQUE INDEX orders_stripe_checkout_session_id_uidx
--   ON public.orders (stripe_checkout_session_id)
--   WHERE stripe_checkout_session_id IS NOT NULL;
-- Postgres inference for ON CONFLICT cannot match a partial index unless the
-- INSERT statement repeats the same predicate, so every fulfillment attempt
-- blew up with:
--   "there is no unique or exclusion constraint matching the ON CONFLICT
--    specification"
-- Fix: drop the partial indexes and replace them with proper UNIQUE
-- constraints. Multiple NULL values remain allowed because PostgreSQL treats
-- NULLs as distinct in UNIQUE constraints by default — admin/manual orders
-- that never reached Stripe stay unaffected.

drop index if exists public.orders_stripe_checkout_session_id_uidx;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'orders_stripe_checkout_session_id_key'
      and conrelid = 'public.orders'::regclass
  ) then
    alter table public.orders
      add constraint orders_stripe_checkout_session_id_key
      unique (stripe_checkout_session_id);
  end if;
end
$$;

drop index if exists public.orders_stripe_payment_intent_id_uidx;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'orders_stripe_payment_intent_id_key'
      and conrelid = 'public.orders'::regclass
  ) then
    alter table public.orders
      add constraint orders_stripe_payment_intent_id_key
      unique (stripe_payment_intent_id);
  end if;
end
$$;

-- library_items.unique (user_id, product_id) was declared inline in
-- 20260417223000_create_store_schema.sql, but older databases that were
-- created before that change shipped might be missing it. Add a safety net so
-- the .upsert({ onConflict: "user_id,product_id" }) in fulfillment works
-- regardless of history.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'library_items_user_id_product_id_key'
      and conrelid = 'public.library_items'::regclass
  ) then
    alter table public.library_items
      add constraint library_items_user_id_product_id_key
      unique (user_id, product_id);
  end if;
end
$$;
