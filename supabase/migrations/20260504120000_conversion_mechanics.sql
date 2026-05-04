-- Stage 2 conversion mechanics: DB-backed coupon codes, redemption tracking
-- and lightweight order metadata for coupon/order-bump reporting.

alter table public.orders
  add column if not exists coupon_code text,
  add column if not exists coupon_discount_amount integer not null default 0 check (coupon_discount_amount >= 0),
  add column if not exists order_bump_product_id uuid references public.products (id) on delete set null,
  add column if not exists order_bump_discount_amount integer not null default 0 check (order_bump_discount_amount >= 0);

create index if not exists orders_coupon_code_idx
on public.orders (coupon_code)
where coupon_code is not null;

create index if not exists orders_order_bump_product_id_idx
on public.orders (order_bump_product_id)
where order_bump_product_id is not null;

create table if not exists public.coupon_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  label text not null default '',
  percent_off integer not null check (percent_off between 1 and 95),
  starts_at timestamptz,
  expires_at timestamptz,
  max_redemptions integer check (max_redemptions is null or max_redemptions > 0),
  redemption_count integer not null default 0 check (redemption_count >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint coupon_codes_code_uppercase check (code = upper(code))
);

drop trigger if exists set_coupon_codes_updated_at on public.coupon_codes;
create trigger set_coupon_codes_updated_at
before update on public.coupon_codes
for each row
execute procedure public.set_updated_at();

create table if not exists public.coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupon_codes (id) on delete cascade,
  order_id uuid not null references public.orders (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  stripe_checkout_session_id text not null unique,
  discount_amount integer not null default 0 check (discount_amount >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  unique (coupon_id, order_id)
);

create index if not exists coupon_redemptions_coupon_id_idx
on public.coupon_redemptions (coupon_id);

create index if not exists coupon_redemptions_user_id_idx
on public.coupon_redemptions (user_id);

alter table public.coupon_codes enable row level security;
alter table public.coupon_redemptions enable row level security;

drop policy if exists "coupon_codes_admin_all" on public.coupon_codes;
create policy "coupon_codes_admin_all"
on public.coupon_codes
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "coupon_redemptions_admin_select" on public.coupon_redemptions;
create policy "coupon_redemptions_admin_select"
on public.coupon_redemptions
for select
to authenticated
using (public.is_admin());

-- Redemptions are written by server-side fulfillment through the service role.
-- There is intentionally no client insert/update/delete policy.

insert into public.coupon_codes (code, label, percent_off, is_active)
values
  ('TEMPLIFY15', 'Wiosenny rabat -15%', 15, true),
  ('WELCOME10', 'Powitalne -10%', 10, true),
  ('STREAK10', 'Nagroda za streak -10%', 10, true)
on conflict (code) do update
set
  label = excluded.label,
  percent_off = excluded.percent_off,
  is_active = excluded.is_active;

insert into public.site_settings (key, value)
values
  ('order_bump_enabled', 'true'),
  ('order_bump_product_id', ''),
  ('order_bump_percent_off', '20')
on conflict (key) do nothing;
