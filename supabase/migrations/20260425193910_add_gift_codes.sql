create type gift_code_status as enum ('pending', 'issued', 'redeemed', 'refunded', 'expired');

create table if not exists gift_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  amount_minor integer not null check (amount_minor > 0),
  currency text not null default 'pln',
  status gift_code_status not null default 'pending',
  purchaser_email text not null,
  recipient_email text,
  recipient_name text,
  message text,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  redeemed_at timestamp with time zone,
  redeemed_by_user_id uuid references auth.users(id) on delete set null,
  redeemed_order_id uuid references orders(id) on delete set null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  expires_at timestamp with time zone
);

create index if not exists gift_codes_status_idx on gift_codes(status, created_at desc);
create index if not exists gift_codes_recipient_idx on gift_codes(recipient_email);
create index if not exists gift_codes_redeemed_user_idx on gift_codes(redeemed_by_user_id);

alter table gift_codes enable row level security;

-- Buyers can read their own gifts (by purchaser_email match against
-- their session email). Recipients see them via the redemption flow,
-- which we run server-side with the service role.
drop policy if exists "Gift codes — purchaser self-read" on gift_codes;
create policy "Gift codes — purchaser self-read" on gift_codes
  for select using (
    purchaser_email = (
      select email from profiles where id = auth.uid()
    )
  );
;
