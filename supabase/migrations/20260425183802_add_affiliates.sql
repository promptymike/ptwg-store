create table if not exists affiliates (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  email text,
  percent_commission numeric(5,2) not null default 20.0 check (percent_commission >= 0 and percent_commission <= 90),
  is_active boolean not null default true,
  notes text not null default '',
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create index if not exists affiliates_code_idx on affiliates(code) where is_active;

create table if not exists affiliate_referrals (
  id bigserial primary key,
  affiliate_id uuid not null references affiliates(id) on delete cascade,
  order_id uuid references orders(id) on delete set null,
  customer_email text not null,
  gross_amount integer not null,
  commission integer not null,
  status text not null default 'pending',
  created_at timestamp with time zone not null default now()
);

create index if not exists affiliate_referrals_aff_idx on affiliate_referrals(affiliate_id, created_at desc);
create index if not exists affiliate_referrals_order_idx on affiliate_referrals(order_id) where order_id is not null;

alter table affiliates enable row level security;
alter table affiliate_referrals enable row level security;
-- service-role only writes; no public RLS policies
;
