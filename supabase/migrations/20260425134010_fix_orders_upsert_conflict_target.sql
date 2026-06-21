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
$$;;
