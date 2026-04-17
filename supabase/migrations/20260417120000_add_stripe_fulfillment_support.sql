alter table public.orders
add column if not exists stripe_checkout_session_id text,
add column if not exists stripe_payment_intent_id text,
add column if not exists stripe_customer_id text;

create unique index if not exists orders_stripe_checkout_session_id_uidx
on public.orders (stripe_checkout_session_id)
where stripe_checkout_session_id is not null;

create unique index if not exists orders_stripe_payment_intent_id_uidx
on public.orders (stripe_payment_intent_id)
where stripe_payment_intent_id is not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'order_items_order_id_product_id_key'
  ) then
    alter table public.order_items
      add constraint order_items_order_id_product_id_key
      unique (order_id, product_id);
  end if;
end
$$;

create table if not exists public.stripe_webhook_events (
  id text primary key,
  event_type text not null,
  checkout_session_id text not null,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.stripe_webhook_events enable row level security;

drop policy if exists "stripe_webhook_events_admin_select" on public.stripe_webhook_events;
create policy "stripe_webhook_events_admin_select"
on public.stripe_webhook_events
for select
to authenticated
using (public.is_admin());
