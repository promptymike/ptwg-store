-- Stage 3 Product Master import: SEO fields used by CSV / Google Sheets imports.

alter table public.products
  add column if not exists seo_title text,
  add column if not exists seo_description text;
