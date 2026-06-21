create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamp with time zone default now() not null,
  last_seen_at timestamp with time zone default now() not null
);

create index if not exists push_subscriptions_user_id_idx on push_subscriptions(user_id);

alter table push_subscriptions enable row level security;

-- Users can manage only their own subscription rows. Service role bypasses
-- RLS so the broadcast endpoint sees every subscription.
drop policy if exists "Push subscriptions are user-owned" on push_subscriptions;
create policy "Push subscriptions are user-owned" on push_subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
;
