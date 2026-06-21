alter table products
  add column if not exists last_price_drop_push_at timestamp with time zone;
;
