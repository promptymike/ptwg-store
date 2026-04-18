create table if not exists public.site_settings (
  key text primary key,
  value text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists set_site_settings_updated_at on public.site_settings;
create trigger set_site_settings_updated_at
before update on public.site_settings
for each row
execute procedure public.set_updated_at();

alter table public.site_settings enable row level security;

drop policy if exists "site_settings_public_read" on public.site_settings;
create policy "site_settings_public_read"
on public.site_settings
for select
to anon, authenticated
using (true);

drop policy if exists "site_settings_admin_all" on public.site_settings;
create policy "site_settings_admin_all"
on public.site_settings
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

insert into public.site_settings (key, value)
values
  ('recommended_bundle_id', 'bundle-01'),
  ('homepage_featured_limit', '4')
on conflict (key) do update
set value = excluded.value;

drop policy if exists "profiles_insert_own_or_admin" on public.profiles;
create policy "profiles_insert_admin_only"
on public.profiles
for insert
to authenticated
with check (public.is_admin());

create or replace function public.protect_profile_privileged_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    new.email = old.email;
    new.role = old.role;
  end if;

  return new;
end;
$$;

drop trigger if exists protect_profile_privileged_fields_trigger on public.profiles;
create trigger protect_profile_privileged_fields_trigger
before update on public.profiles
for each row
execute procedure public.protect_profile_privileged_fields();

drop policy if exists "products_public_read_active" on public.products;
create policy "products_public_read_published"
on public.products
for select
to anon, authenticated
using (public.is_admin() or (is_active = true and status = 'published'));

drop policy if exists "orders_insert_own_or_admin" on public.orders;
create policy "orders_insert_admin_only"
on public.orders
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "order_items_insert_own_or_admin" on public.order_items;
create policy "order_items_insert_admin_only"
on public.order_items
for insert
to authenticated
with check (public.is_admin());

update storage.buckets
set
  file_size_limit = case
    when id = 'product-files' then 52428800
    when id = 'product-covers' then 8388608
    else file_size_limit
  end,
  allowed_mime_types = case
    when id = 'product-files' then array[
      'application/pdf',
      'application/zip',
      'application/x-zip-compressed'
    ]::text[]
    when id = 'product-covers' then array[
      'image/png',
      'image/jpeg',
      'image/webp'
    ]::text[]
    else allowed_mime_types
  end
where id in ('product-files', 'product-covers');
