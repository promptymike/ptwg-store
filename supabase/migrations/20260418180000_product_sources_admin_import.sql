do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'product_pipeline_status'
  ) then
    create type public.product_pipeline_status as enum (
      'working',
      'refining',
      'ready',
      'published'
    );
  end if;
end
$$;

alter table public.products
add column if not exists pipeline_status public.product_pipeline_status not null default 'working';

update public.products
set pipeline_status = case
  when status = 'published' then 'published'::public.product_pipeline_status
  else 'working'::public.product_pipeline_status
end
where pipeline_status is null
   or pipeline_status = 'working'::public.product_pipeline_status;

create table if not exists public.product_sources (
  id uuid primary key default gen_random_uuid(),
  drive_file_id text not null unique,
  title text not null,
  mime_type text not null,
  drive_url text not null,
  source_stage text not null default 'in_progress'
    check (source_stage in ('in_progress', 'final', 'ideas', 'planning')),
  modified_at timestamptz,
  product_id uuid references public.products (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists products_pipeline_status_idx
on public.products (pipeline_status, status, is_active);

create index if not exists product_sources_stage_idx
on public.product_sources (source_stage, modified_at desc);

create index if not exists product_sources_product_id_idx
on public.product_sources (product_id);

drop trigger if exists set_product_sources_updated_at on public.product_sources;
create trigger set_product_sources_updated_at
before update on public.product_sources
for each row
execute procedure public.set_updated_at();

alter table public.product_sources enable row level security;

drop policy if exists "product_sources_admin_all" on public.product_sources;
create policy "product_sources_admin_all"
on public.product_sources
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

insert into public.product_sources (
  drive_file_id,
  title,
  mime_type,
  drive_url,
  source_stage,
  modified_at
)
values
  (
    '1wGGJe8o40dnIJepCoVqJAmx0tguk5Qn3',
    'ebook-jak-schudnac.html',
    'text/html',
    'https://drive.google.com/file/d/1wGGJe8o40dnIJepCoVqJAmx0tguk5Qn3/view?usp=drivesdk',
    'in_progress',
    '2026-04-18T10:49:56.000Z'
  ),
  (
    '1tn-oGfLuhK37awSrkZqW93_c86oUW8H_',
    'ebook-jak-zalozyc-firme.html',
    'text/html',
    'https://drive.google.com/file/d/1tn-oGfLuhK37awSrkZqW93_c86oUW8H_/view?usp=drivesdk',
    'in_progress',
    '2026-04-18T10:22:04.000Z'
  ),
  (
    '1Hg7s3CkMm94WDPkalTg_EvyZCzoQ0MSJ',
    'ebook-jak-byc-szczesliwym.html',
    'text/html',
    'https://drive.google.com/file/d/1Hg7s3CkMm94WDPkalTg_EvyZCzoQ0MSJ/view?usp=drivesdk',
    'in_progress',
    '2026-04-18T09:52:32.000Z'
  ),
  (
    '1x4x7afqM2jDMxvi4dIek-xWrW3EyA1Ur',
    'ebook-podstawy-finansow.html',
    'text/html',
    'https://drive.google.com/file/d/1x4x7afqM2jDMxvi4dIek-xWrW3EyA1Ur/view?usp=drivesdk',
    'in_progress',
    '2026-04-18T09:29:35.000Z'
  ),
  (
    '16ioaQB9ozFv0WH2rMekFzBdgazXtGgKC',
    'ebook-dieta-ketogeniczna.html',
    'text/html',
    'https://drive.google.com/file/d/16ioaQB9ozFv0WH2rMekFzBdgazXtGgKC/view?usp=drivesdk',
    'in_progress',
    '2026-04-17T21:04:44.000Z'
  ),
  (
    '1INItT2VdyZECwQn2RkIuSPNBJByp9KOo',
    'Budżet Domowy dla Początkujących.pdf',
    'application/pdf',
    'https://drive.google.com/file/d/1INItT2VdyZECwQn2RkIuSPNBJByp9KOo/view?usp=drivesdk',
    'in_progress',
    '2026-04-17T20:35:05.714Z'
  ),
  (
    '1Eus0nTAno752rKhKyDBQPwlHPPmQW3m1',
    'ebook-trening-w-domu.html',
    'text/html',
    'https://drive.google.com/file/d/1Eus0nTAno752rKhKyDBQPwlHPPmQW3m1/view?usp=drivesdk',
    'in_progress',
    '2026-04-17T20:28:31.000Z'
  ),
  (
    '1ng_gQyu_Lh3RI9kfEyLUk8B-FGA8-3wR',
    'finance-app -v1.rar',
    'application/x-rar',
    'https://drive.google.com/file/d/1ng_gQyu_Lh3RI9kfEyLUk8B-FGA8-3wR/view?usp=drivesdk',
    'ideas',
    '2026-04-15T13:18:09.000Z'
  )
on conflict (drive_file_id) do update
set
  title = excluded.title,
  mime_type = excluded.mime_type,
  drive_url = excluded.drive_url,
  source_stage = excluded.source_stage,
  modified_at = excluded.modified_at;
