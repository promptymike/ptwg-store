create table if not exists analytics_events (
  id bigserial primary key,
  event_name text not null,
  visitor_id text not null,
  user_id uuid references profiles(id) on delete set null,
  experiment_key text,
  variant text,
  surface text,
  product_id uuid references products(id) on delete set null,
  path text,
  referrer text,
  user_agent text,
  amount integer,
  properties jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone not null default now()
);

create index if not exists analytics_events_name_idx on analytics_events(event_name, created_at desc);
create index if not exists analytics_events_experiment_idx on analytics_events(experiment_key, variant) where experiment_key is not null;
create index if not exists analytics_events_visitor_idx on analytics_events(visitor_id, created_at desc);
create index if not exists analytics_events_user_idx on analytics_events(user_id, created_at desc) where user_id is not null;

alter table analytics_events enable row level security;
-- Writes go through the public endpoint with service-role key so we
-- can rate-limit and sanitise. No public read or write policies.
;
