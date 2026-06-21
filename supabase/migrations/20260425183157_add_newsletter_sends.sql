create table if not exists newsletter_sends (
  id bigserial primary key,
  subscriber_id uuid not null references newsletter_subscribers(id) on delete cascade,
  campaign text not null,
  sent_at timestamp with time zone not null default now(),
  resend_message_id text,
  unique (subscriber_id, campaign)
);

create index if not exists newsletter_sends_subscriber_idx on newsletter_sends(subscriber_id);
create index if not exists newsletter_sends_campaign_idx on newsletter_sends(campaign, sent_at desc);

alter table newsletter_sends enable row level security;
-- no public RLS policies — service role only
;
