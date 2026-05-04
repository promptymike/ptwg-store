-- Stage 1 revenue layer: durable attribution on orders and an analytics
-- event table that matches the app's existing consent-aware event endpoint.

do $$
begin
  if exists (select 1 from pg_type where typname = 'order_status')
     and not exists (
       select 1
       from pg_enum
       where enumtypid = 'public.order_status'::regtype
         and enumlabel = 'refunded'
     ) then
    alter type public.order_status add value 'refunded';
  end if;
end
$$;

alter table public.orders
  add column if not exists refund_amount integer,
  add column if not exists refund_reason text,
  add column if not exists refunded_at timestamptz,
  add column if not exists stripe_refund_id text,
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists utm_content text,
  add column if not exists utm_term text,
  add column if not exists referrer text,
  add column if not exists landing_page text;

create index if not exists orders_created_at_idx
on public.orders (created_at desc);

create index if not exists orders_utm_source_idx
on public.orders (utm_source)
where utm_source is not null;

create index if not exists orders_utm_campaign_idx
on public.orders (utm_campaign)
where utm_campaign is not null;

create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  event_name text not null check (char_length(event_name) > 0),
  visitor_id text not null check (char_length(visitor_id) > 0),
  user_id uuid references public.profiles (id) on delete set null,
  product_id uuid references public.products (id) on delete set null,
  experiment_key text,
  variant text,
  surface text,
  path text,
  referrer text,
  user_agent text,
  amount integer check (amount is null or amount >= 0),
  properties jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.analytics_events
  add column if not exists event_name text,
  add column if not exists visitor_id text,
  add column if not exists user_id uuid references public.profiles (id) on delete set null,
  add column if not exists product_id uuid references public.products (id) on delete set null,
  add column if not exists experiment_key text,
  add column if not exists variant text,
  add column if not exists surface text,
  add column if not exists path text,
  add column if not exists referrer text,
  add column if not exists user_agent text,
  add column if not exists amount integer,
  add column if not exists properties jsonb not null default '{}'::jsonb,
  add column if not exists created_at timestamptz not null default timezone('utc', now());

alter table public.analytics_events enable row level security;

drop policy if exists "analytics_events_admin_select" on public.analytics_events;
create policy "analytics_events_admin_select"
on public.analytics_events
for select
to authenticated
using (public.is_admin());

-- Client inserts go through /api/analytics/event with the service role key,
-- so there is intentionally no anon/authenticated insert policy here.

create index if not exists analytics_events_event_created_idx
on public.analytics_events (event_name, created_at desc);

create index if not exists analytics_events_visitor_created_idx
on public.analytics_events (visitor_id, created_at desc);

create index if not exists analytics_events_product_created_idx
on public.analytics_events (product_id, created_at desc)
where product_id is not null;
