-- Per-customer instance isolation ("klatki") for purchased products.
--
-- Background: customers were all reading from the same master file_path on
-- products.file_path. For ebooks that's a non-issue (read-only signed URL),
-- but for templates / planners we want a per-account working copy that
-- the customer can edit, regenerate or annotate without ever touching the
-- master in product-files.
--
-- Implementation: add an optional storage path on library_items pointing at
-- the customer's isolated copy. If null (e.g., legacy purchases that
-- haven't been backfilled, or fulfillment that couldn't copy the master),
-- the read/download routes fall back to products.file_path. New
-- fulfillments call supabase.storage.from('product-files').copy(...) into
--   instances/{user_id}/{product_id}/{filename}
-- and store that path here.

alter table public.library_items
  add column if not exists instance_path text;

comment on column public.library_items.instance_path is
  'Per-user copy of the master product file in the product-files bucket.'
  ' When set, /api/library/[id]/read and /download serve this isolated copy'
  ' instead of products.file_path so each customer has their own editable'
  ' instance ("klatkę"). Null means the customer still reads the shared'
  ' master file (legacy or unsupported file type).';
