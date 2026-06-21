alter table products
  add column if not exists last_push_announcement_at timestamp with time zone;
;
