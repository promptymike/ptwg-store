create table if not exists cart_abandonment_sends (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  email text not null,
  channel text not null check (channel in ('email', 'push')),
  sent_at timestamp with time zone default now() not null
);

create index if not exists cart_abandonment_sends_user_idx
  on cart_abandonment_sends(user_id, sent_at desc);

alter table cart_abandonment_sends enable row level security;
-- No policies — only service role reads/writes this from the cron.
;
