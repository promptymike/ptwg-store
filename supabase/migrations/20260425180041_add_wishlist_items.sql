create table if not exists wishlist_items (
  user_id uuid not null references profiles(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  added_at timestamp with time zone not null default now(),
  primary key (user_id, product_id)
);

create index if not exists wishlist_items_user_idx on wishlist_items(user_id, added_at desc);

alter table wishlist_items enable row level security;

drop policy if exists "Users read their own wishlist" on wishlist_items;
create policy "Users read their own wishlist" on wishlist_items
  for select using (auth.uid() = user_id);

drop policy if exists "Users add to their own wishlist" on wishlist_items;
create policy "Users add to their own wishlist" on wishlist_items
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users remove their own wishlist" on wishlist_items;
create policy "Users remove their own wishlist" on wishlist_items
  for delete using (auth.uid() = user_id);
;
