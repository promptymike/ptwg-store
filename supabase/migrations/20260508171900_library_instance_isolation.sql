alter table public.library_items
  add column if not exists instance_path text;

comment on column public.library_items.instance_path is
  'Per-user copy of the master product file in the product-files bucket. When set, /api/library/[id]/read and /download serve this isolated copy instead of products.file_path so each customer has their own editable instance ("klatkę"). Null means the customer still reads the shared master file (legacy or unsupported file type).';;
