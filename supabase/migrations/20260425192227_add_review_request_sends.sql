create table if not exists review_request_sends (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  product_id uuid references products(id) on delete cascade not null,
  email text not null,
  sent_at timestamp with time zone default now() not null,
  unique (user_id, product_id)
);

create index if not exists review_request_sends_user_idx
  on review_request_sends(user_id, sent_at desc);

alter table review_request_sends enable row level security;
-- No policies — only service role reads/writes via the cron.
;
