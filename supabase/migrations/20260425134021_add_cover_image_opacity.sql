alter table public.products
  add column if not exists cover_image_opacity smallint not null default 40;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_cover_image_opacity_range'
      and conrelid = 'public.products'::regclass
  ) then
    alter table public.products
      add constraint products_cover_image_opacity_range
      check (cover_image_opacity between 0 and 100);
  end if;
end
$$;;
