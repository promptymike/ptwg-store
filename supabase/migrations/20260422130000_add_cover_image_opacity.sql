-- Storefront product cards used to render only the gradient, ignoring the
-- uploaded cover image entirely. The product detail page, on the other hand,
-- layered the cover image at a fixed opacity of 20% on top of the gradient.
-- The result: buyers saw a rich cover only after clicking into a product.
--
-- Let admins control this blend per product. A single smallint column encodes
-- the cover image opacity as a percentage (0 = gradient-only, 100 = cover-only,
-- anything between = blended). The same value is consumed by ProductCard,
-- the product detail hero, the library tile and the admin preview so the
-- editor sees the exact output that storefront visitors will see.
--
-- Default of 40 keeps existing rows looking similar to the old product detail
-- blend while making the cover image properly visible on the homepage grid.
-- Apps that haven't applied this migration yet keep working: the mapper in
-- src/lib/supabase/store.ts falls back to 40 when the column is absent.

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
$$;
