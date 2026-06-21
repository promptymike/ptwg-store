create table if not exists bundles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  price integer not null check (price >= 0),
  compare_at_price integer,
  accent text not null default 'from-[#fbf5ea] via-[#f4ead9] to-[#e4c58d]',
  perks text[] not null default '{}',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists bundle_products (
  bundle_id uuid not null references bundles(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  position integer not null default 0,
  primary key (bundle_id, product_id)
);

create index if not exists bundle_products_bundle_idx on bundle_products(bundle_id);
create index if not exists bundle_products_product_idx on bundle_products(product_id);

alter table bundles enable row level security;
alter table bundle_products enable row level security;

drop policy if exists "Bundles readable by everyone" on bundles;
create policy "Bundles readable by everyone" on bundles
  for select using (is_active = true);

drop policy if exists "Bundle products readable by everyone" on bundle_products;
create policy "Bundle products readable by everyone" on bundle_products
  for select using (
    exists (select 1 from bundles where bundles.id = bundle_products.bundle_id and bundles.is_active = true)
  );

-- Service role bypasses RLS so admin / fulfillment paths keep working.
;
