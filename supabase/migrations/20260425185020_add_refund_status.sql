do $$ begin
  alter type order_status add value if not exists 'refunded';
exception
  when duplicate_object then null;
end $$;

-- Track refund metadata so admin sees who/when/why without polling Stripe.
alter table orders
  add column if not exists refunded_at timestamp with time zone,
  add column if not exists refund_amount integer,
  add column if not exists refund_reason text,
  add column if not exists stripe_refund_id text;
;
