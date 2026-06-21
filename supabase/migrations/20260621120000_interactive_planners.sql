create table if not exists public.planner_instances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
  version bigint not null default 1 check (version > 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, product_id)
);

create index if not exists planner_instances_user_updated_idx
on public.planner_instances (user_id, updated_at desc);

drop trigger if exists set_planner_instances_updated_at on public.planner_instances;
create trigger set_planner_instances_updated_at
before update on public.planner_instances
for each row execute procedure public.set_updated_at();

alter table public.planner_instances enable row level security;

drop policy if exists "planner_instances_select_own" on public.planner_instances;
create policy "planner_instances_select_own" on public.planner_instances
for select to authenticated using (auth.uid() = user_id or public.is_admin());

drop policy if exists "planner_instances_insert_own" on public.planner_instances;
create policy "planner_instances_insert_own" on public.planner_instances
for insert to authenticated with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.library_items
    where library_items.user_id = auth.uid()
      and library_items.product_id = planner_instances.product_id
  )
);

drop policy if exists "planner_instances_update_own" on public.planner_instances;
create policy "planner_instances_update_own" on public.planner_instances
for update to authenticated using (auth.uid() = user_id or public.is_admin())
with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "planner_instances_delete_own" on public.planner_instances;
create policy "planner_instances_delete_own" on public.planner_instances
for delete to authenticated using (auth.uid() = user_id or public.is_admin());

with planner_products (
  id, slug, category_name, name, short_description, description, price,
  accent, cover_gradient, includes, hero_note, sort_order
) as (
  values
    ('a1100001-2026-4000-8000-000000000001'::uuid, 'planer-finansow', 'Finanse osobiste', 'Planer Finansów', 'Budżet, wydatki i cele pod kontrolą — bez Excela.', 'Interaktywny planer finansów z automatycznym zapisem i dostępem z telefonu.', 69, 'emerald', 'from-emerald-400 via-teal-500 to-slate-950', array['Budżet miesięczny','Kategorie wydatków','Cele oszczędnościowe','Raporty'], 'Wszystkie pieniądze pod kontrolą — bez Excela.', 101),
    ('a1100002-2026-4000-8000-000000000002'::uuid, 'adhd-flow', 'Produktywność i czas', 'ADHD Flow', 'Plan dnia, który współpracuje z Twoim mózgiem.', 'Interaktywny planer koncentracji, energii i zadań dla osób z ADHD.', 69, 'violet', 'from-violet-400 via-fuchsia-500 to-indigo-950', array['Planowanie energią','Focus timer','Brain dump','Priorytety'], 'Mniej przeciążenia, więcej spokojnie domkniętych spraw.', 102),
    ('a1100003-2026-4000-8000-000000000003'::uuid, 'planer-rodzinny', 'Macierzyństwo i rodzina', 'Planer Rodzinny', 'Jedno miejsce dla całej rodzinnej logistyki.', 'Kalendarz, szkoła, zajęcia, obowiązki i ważne sprawy domowe w jednym systemie.', 69, 'sky', 'from-sky-300 via-blue-500 to-indigo-950', array['Kalendarz rodzinny','Plan lekcji','Obowiązki','Ważne kontakty'], 'Koniec z rodzinną logistyką na karteczkach.', 103),
    ('a1100004-2026-4000-8000-000000000004'::uuid, 'mealmind', 'Zdrowie i dieta', 'MealMind', 'Plan posiłków i lista zakupów na spokojniejszy tydzień.', 'Interaktywny planer menu, zakupów i domowej spiżarni.', 69, 'lime', 'from-lime-300 via-emerald-500 to-green-950', array['Menu tygodniowe','Lista zakupów','Spiżarnia','Pomysły na posiłki'], 'Mniej marnowania jedzenia i przypadkowych zakupów.', 104),
    ('a1100005-2026-4000-8000-000000000005'::uuid, 'planer-podrozy', 'Podróże i lifestyle', 'Planer Podróży', 'Cała podróż od pomysłu do powrotu w jednym miejscu.', 'Trasy, rezerwacje, budżet, atrakcje i pakowanie dostępne z telefonu.', 69, 'cyan', 'from-cyan-300 via-sky-500 to-blue-950', array['Plan trasy','Budżet wyjazdu','Rezerwacje','Lista pakowania'], 'Podróżuj z planem, ale bez planistycznego stresu.', 105),
    ('a1100006-2026-4000-8000-000000000006'::uuid, 'planer-uroczystosci', 'Macierzyństwo i rodzina', 'Planer Uroczystości', 'Budżet, goście i harmonogram bez chaosu.', 'Kompletny system do planowania wesela, urodzin i większych wydarzeń.', 79, 'rose', 'from-rose-300 via-pink-500 to-rose-950', array['Lista gości','Budżet','Dostawcy','Harmonogram'], 'Kontroluj detale i nadal ciesz się wydarzeniem.', 106),
    ('a1100007-2026-4000-8000-000000000007'::uuid, 'grafik-pracy', 'Praca i kariera', 'GrafAI — Grafik Pracy', 'Układaj grafik szybciej. Zarządzaj zespołem mądrzej.', 'Zmiany, dostępność i kontrola obsady dla właściciela oraz managera.', 129, 'amber', 'from-amber-300 via-orange-500 to-slate-950', array['Grafik zmianowy','Dostępność zespołu','Kontrola obsady','Archiwum'], 'Koniec z ósmą wersją arkusza wysyłaną zespołowi.', 107),
    ('a1100008-2026-4000-8000-000000000008'::uuid, 'beauty-pro', 'Praca i kariera', 'Beauty Pro', 'Klientki, wizyty i salon pod kontrolą z telefonu.', 'Lekki manager salonu dla kosmetyczek, stylistek i małych zespołów beauty.', 129, 'pink', 'from-pink-300 via-rose-500 to-fuchsia-950', array['Kalendarz wizyt','Baza klientek','Usługi i zespół','Magazyn'], 'Mniej administracji, więcej czasu dla klientek.', 108),
    ('a1100009-2026-4000-8000-000000000009'::uuid, 'planer-budowy', 'Praca i kariera', 'BudowaPlaner', 'Budżet, etapy i wykonawcy — bez kolejnego arkusza.', 'Centrum dowodzenia inwestycją dla budujących dom, ekip i koordynatorów.', 149, 'yellow', 'from-yellow-300 via-amber-500 to-zinc-950', array['Etapy inwestycji','Budżet budowy','Wykonawcy','Dokumenty'], 'Wiesz, co zrobiono, ile kosztuje i co blokuje kolejny etap.', 109)
)
insert into public.products (
  id, slug, category_id, name, short_description, description, price, format,
  pages, tags, rating, sales_label, accent, cover_gradient, includes, hero_note,
  badge, status, pipeline_status, bestseller, featured, is_active, sort_order
)
select
  p.id, p.slug,
  coalesce((select c.id from public.categories c where c.name = p.category_name limit 1), (select c.id from public.categories c order by c.sort_order, c.created_at limit 1)),
  p.name, p.short_description, p.description, p.price, 'Interaktywny planer',
  0, array['interaktywny planer','autosave','mobile'], 5.0, 'Planer nowej generacji',
  p.accent, p.cover_gradient, p.includes, p.hero_note, 'new', 'published', 'published',
  false, p.sort_order <= 103, true, p.sort_order
from planner_products p
on conflict (id) do update set
  name = excluded.name, short_description = excluded.short_description,
  description = excluded.description, price = excluded.price, format = excluded.format,
  includes = excluded.includes, hero_note = excluded.hero_note, status = excluded.status,
  pipeline_status = excluded.pipeline_status, is_active = excluded.is_active,
  sort_order = excluded.sort_order, updated_at = timezone('utc', now());

with planner_sources (product_id, drive_file_id, title) as (
  values
    ('a1100001-2026-4000-8000-000000000001'::uuid, '1c5cg9tTD3Ggt8soDHGKPjAb_-7HFEGiJ', 'finance-app-final.html'),
    ('a1100002-2026-4000-8000-000000000002'::uuid, '1YuhDtpya6JJr5nvqay6FVE9rwiT0FnOU', 'adhd-planer-final.html'),
    ('a1100003-2026-4000-8000-000000000003'::uuid, '1I3n4JexZCBpDAt78bE9C94EFcXWr6ofZ', 'planer rodzinny.html'),
    ('a1100004-2026-4000-8000-000000000004'::uuid, '1MRpaRtFvQ4SpVnLHCJCh0HhTNopAqy8d', 'mealmind-final.html'),
    ('a1100005-2026-4000-8000-000000000005'::uuid, '1lBRHe4NuuekggLT55_pYB6PWfT90bJLh', 'travel-guide-final.html'),
    ('a1100006-2026-4000-8000-000000000006'::uuid, '1_zuUVdKLutfkeO4nU6B-ftewR8oW-7Z_', 'planer-uroczystosci-final.html'),
    ('a1100007-2026-4000-8000-000000000007'::uuid, '1GXBvQKzcaSIUO6V_7xzEop1Uz_YUlLHB', 'Scheduler.html'),
    ('a1100008-2026-4000-8000-000000000008'::uuid, '1tV9CpLMJO_jkO5fuzLb5hiBvXDTjmJ1L', 'beauty-app-final.html'),
    ('a1100009-2026-4000-8000-000000000009'::uuid, '1ZRagl9lzpWfknIUJ68-sqctrozz6NTtk', 'planer budowlany.html')
)
insert into public.product_sources (drive_file_id, title, mime_type, drive_url, source_stage, product_id)
select s.drive_file_id, s.title, 'text/html', 'https://drive.google.com/file/d/' || s.drive_file_id || '/view', 'final', s.product_id
from planner_sources s
on conflict (drive_file_id) do update set
  title = excluded.title, source_stage = 'final', product_id = excluded.product_id,
  drive_url = excluded.drive_url, updated_at = timezone('utc', now());
