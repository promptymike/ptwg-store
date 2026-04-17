do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'product_status'
  ) then
    create type public.product_status as enum ('draft', 'published', 'archived');
  end if;
end
$$;

alter table public.products
add column if not exists badge text,
add column if not exists status public.product_status not null default 'published',
add column if not exists sort_order integer not null default 0,
add column if not exists featured_order integer not null default 0;

create table if not exists public.admin_allowlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  note text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.product_previews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  storage_path text not null,
  alt_text text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.site_sections (
  id uuid primary key default gen_random_uuid(),
  section_key text not null unique,
  eyebrow text not null default '',
  title text not null,
  description text not null default '',
  body text not null default '',
  cta_label text,
  cta_href text,
  is_published boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.content_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  body text not null default '',
  is_published boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.faq_items (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  author text not null,
  role text not null default '',
  quote text not null,
  score numeric(2, 1) not null default 5.0 check (score >= 0 and score <= 5),
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists product_previews_product_id_idx
on public.product_previews (product_id, sort_order);

create index if not exists products_status_idx
on public.products (status, sort_order, featured_order);

drop trigger if exists set_site_sections_updated_at on public.site_sections;
create trigger set_site_sections_updated_at
before update on public.site_sections
for each row
execute procedure public.set_updated_at();

drop trigger if exists set_content_pages_updated_at on public.content_pages;
create trigger set_content_pages_updated_at
before update on public.content_pages
for each row
execute procedure public.set_updated_at();

drop trigger if exists set_faq_items_updated_at on public.faq_items;
create trigger set_faq_items_updated_at
before update on public.faq_items
for each row
execute procedure public.set_updated_at();

drop trigger if exists set_testimonials_updated_at on public.testimonials;
create trigger set_testimonials_updated_at
before update on public.testimonials
for each row
execute procedure public.set_updated_at();

alter table public.admin_allowlist enable row level security;
alter table public.product_previews enable row level security;
alter table public.site_sections enable row level security;
alter table public.content_pages enable row level security;
alter table public.faq_items enable row level security;
alter table public.testimonials enable row level security;

drop policy if exists "admin_allowlist_admin_all" on public.admin_allowlist;
create policy "admin_allowlist_admin_all"
on public.admin_allowlist
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "product_previews_public_read_when_product_visible" on public.product_previews;
create policy "product_previews_public_read_when_product_visible"
on public.product_previews
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.products
    where products.id = product_previews.product_id
      and (products.status = 'published' or public.is_admin())
  )
);

drop policy if exists "product_previews_admin_all" on public.product_previews;
create policy "product_previews_admin_all"
on public.product_previews
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "site_sections_public_read" on public.site_sections;
create policy "site_sections_public_read"
on public.site_sections
for select
to anon, authenticated
using (is_published or public.is_admin());

drop policy if exists "site_sections_admin_all" on public.site_sections;
create policy "site_sections_admin_all"
on public.site_sections
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "content_pages_public_read" on public.content_pages;
create policy "content_pages_public_read"
on public.content_pages
for select
to anon, authenticated
using (is_published or public.is_admin());

drop policy if exists "content_pages_admin_all" on public.content_pages;
create policy "content_pages_admin_all"
on public.content_pages
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "faq_items_public_read" on public.faq_items;
create policy "faq_items_public_read"
on public.faq_items
for select
to anon, authenticated
using (is_published or public.is_admin());

drop policy if exists "faq_items_admin_all" on public.faq_items;
create policy "faq_items_admin_all"
on public.faq_items
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "testimonials_public_read" on public.testimonials;
create policy "testimonials_public_read"
on public.testimonials
for select
to anon, authenticated
using (is_published or public.is_admin());

drop policy if exists "testimonials_admin_all" on public.testimonials;
create policy "testimonials_admin_all"
on public.testimonials
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create or replace function public.handle_auth_user_changed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  next_role public.user_role;
begin
  next_role := case
    when exists (
      select 1
      from public.admin_allowlist
      where lower(email) = lower(new.email)
        and is_active = true
    ) then 'admin'::public.user_role
    else 'user'::public.user_role
  end;

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    next_role
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.profiles.full_name),
        role = next_role;

  return new;
end;
$$;

create or replace function public.sync_roles_from_allowlist()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set role = case
    when exists (
      select 1
      from public.admin_allowlist
      where lower(email) = lower(profiles.email)
        and is_active = true
    ) then 'admin'::public.user_role
    else 'user'::public.user_role
  end
  where lower(profiles.email) = lower(coalesce(new.email, old.email));

  return coalesce(new, old);
end;
$$;

drop trigger if exists sync_roles_from_allowlist_trigger on public.admin_allowlist;
create trigger sync_roles_from_allowlist_trigger
after insert or update or delete on public.admin_allowlist
for each row
execute procedure public.sync_roles_from_allowlist();

update public.profiles
set role = case
  when exists (
    select 1
    from public.admin_allowlist
    where lower(admin_allowlist.email) = lower(profiles.email)
      and admin_allowlist.is_active = true
  ) then 'admin'::public.user_role
  else 'user'::public.user_role
end;

insert into public.admin_allowlist (email, note, is_active)
values
  ('kgodlewski04@gmail.com', 'Core admin', true),
  ('michwel7@gmail.com', 'Core admin', true),
  ('paweltokarski5@gmail.com', 'Core admin', true),
  ('podsiadlo.bartosz.bp@gmail.com', 'Core admin', true),
  ('ptwgadmin@gmail.com', 'Core admin', true)
on conflict (email) do update
set note = excluded.note,
    is_active = excluded.is_active;

update public.categories
set
  slug = case name
    when 'Planery' then 'planowanie-i-notion'
    when 'Przepisy' then 'content-i-marketing'
    when 'Plany treningowe' then 'sprzedaz-i-oferty'
    when 'Finanse' then 'finanse-i-operacje'
    when 'Rozwój osobisty' then 'produktywnosc-osobista'
    else slug
  end,
  name = case name
    when 'Planery' then 'Planowanie i Notion'
    when 'Przepisy' then 'Content i marketing'
    when 'Plany treningowe' then 'Sprzedaż i oferty'
    when 'Finanse' then 'Finanse i operacje'
    when 'Rozwój osobisty' then 'Produktywność osobista'
    else name
  end,
  description = case name
    when 'Planery' then 'Editorial templates do planowania tygodnia, zarządzania zadaniami i budowania operacyjnego spokoju.'
    when 'Przepisy' then 'Szablony contentowe, calendary publikacji i systemy, które skracają drogę od pomysłu do publikacji.'
    when 'Plany treningowe' then 'Gotowe launch kity, strony sprzedażowe i materiały ofertowe dla produktów cyfrowych.'
    when 'Finanse' then 'Nowoczesne arkusze i systemy do wycen, faktur, rentowności i porządkowania zaplecza biznesu.'
    when 'Rozwój osobisty' then 'Szablony do skupienia, planowania dnia i pracy deep work bez chaosu.'
    else description
  end;

with ranked_products as (
  select
    id,
    row_number() over (order by created_at, id) as product_rank
  from public.products
),
category_lookup as (
  select slug, id
  from public.categories
)
update public.products as products
set
  slug = case ranked_products.product_rank
    when 1 then 'notion-ceo-week'
    when 2 then 'client-onboarding-suite'
    when 3 then 'launch-offer-kit'
    when 4 then 'content-engine-90'
    when 5 then 'invoice-cashflow-pack'
    when 6 then 'crm-pipeline-template'
    when 7 then 'focus-desk-planner'
    when 8 then 'brand-brief-workbook'
    else 'proposal-template-library'
  end,
  name = case ranked_products.product_rank
    when 1 then 'Notion CEO Week'
    when 2 then 'Client Onboarding Suite'
    when 3 then 'Launch Offer Kit'
    when 4 then 'Content Engine 90'
    when 5 then 'Invoice & Cashflow Pack'
    when 6 then 'CRM Pipeline Template'
    when 7 then 'Focus Desk Planner'
    when 8 then 'Brand Brief Workbook'
    else 'Proposal Template Library'
  end,
  short_description = case ranked_products.product_rank
    when 1 then 'Weekly operating system for founders who want visibility, focus and cleaner decisions.'
    when 2 then 'Ready-made onboarding flows, questionnaires and client-facing assets for service businesses.'
    when 3 then 'Sales-page prompts, launch checklist and offer messaging templates for digital products.'
    when 4 then 'A premium content planning system that turns strategy into 90 days of reusable execution.'
    when 5 then 'Templates for invoices, pricing, cashflow tracking and finance rituals without spreadsheet chaos.'
    when 6 then 'A polished deal pipeline template for freelancers, studios and boutique agencies.'
    when 7 then 'A light editorial planner for deep work, weekly priorities and distraction-free execution.'
    when 8 then 'Structured workshop template to align brand strategy before design, copy and launch.'
    else 'Proposal, scope and pricing templates that help close projects with more clarity and confidence.'
  end,
  description = case ranked_products.product_rank
    when 1 then 'Templify flagship workspace for weekly planning, priorities, decision logs and executive visibility. Built for solo founders and small teams that want a calmer operating rhythm.'
    when 2 then 'A polished client experience pack with discovery form, kickoff agenda, onboarding email copy and delivery checklist. Designed to help premium service brands look organised from day one.'
    when 3 then 'A conversion-first launch system with offer positioning prompts, cart-open checklist, CTA blocks and launch page structure. Ideal for creators selling templates, guides and digital systems.'
    when 4 then 'Content planning templates for campaign themes, distribution, repurposing and weekly execution. Designed to reduce blank-page energy and increase consistency across channels.'
    when 5 then 'A clean financial operating pack with invoice workflows, budget planning, income targets and expense reviews. Made for creators and service businesses who want confidence without complexity.'
    when 6 then 'Pipeline board, lead stages, follow-up prompts and proposal tracking designed for boutique businesses. Helps move leads forward with less manual juggling and more visibility.'
    when 7 then 'Editorial-style planner for deep work blocks, strategic priorities, weekly reflection and recovery. Built for people who want a premium system instead of another generic planner.'
    when 8 then 'A workbook for defining positioning, audience, visual references and tone before any creative production starts. Perfect for studios, freelancers and product teams.'
    else 'A premium proposal library with scope templates, pricing options and approval flow copy. Helps turn discovery into a cleaner close without reinventing every offer.'
  end,
  category_id = case ranked_products.product_rank
    when 1 then (select id from category_lookup where slug = 'planowanie-i-notion')
    when 2 then (select id from category_lookup where slug = 'sprzedaz-i-oferty')
    when 3 then (select id from category_lookup where slug = 'sprzedaz-i-oferty')
    when 4 then (select id from category_lookup where slug = 'content-i-marketing')
    when 5 then (select id from category_lookup where slug = 'finanse-i-operacje')
    when 6 then (select id from category_lookup where slug = 'sprzedaz-i-oferty')
    when 7 then (select id from category_lookup where slug = 'produktywnosc-osobista')
    when 8 then (select id from category_lookup where slug = 'content-i-marketing')
    else (select id from category_lookup where slug = 'sprzedaz-i-oferty')
  end,
  price = case ranked_products.product_rank
    when 1 then 129
    when 2 then 149
    when 3 then 119
    when 4 then 139
    when 5 then 109
    when 6 then 129
    when 7 then 89
    when 8 then 99
    else 119
  end,
  compare_at_price = case ranked_products.product_rank
    when 1 then 189
    when 2 then 219
    when 3 then 169
    when 4 then 199
    when 5 then 149
    when 6 then 179
    when 7 then 129
    when 8 then 149
    else 179
  end,
  format = case ranked_products.product_rank
    when 1 then 'Notion + PDF guide'
    when 2 then 'Docs + PDF + checklist'
    when 3 then 'PDF + swipe files'
    when 4 then 'Notion + PDF'
    when 5 then 'Sheet + PDF'
    when 6 then 'Notion + CRM board'
    when 7 then 'PDF'
    when 8 then 'PDF workbook'
    else 'Docs + PDF'
  end,
  pages = case ranked_products.product_rank
    when 1 then 42
    when 2 then 58
    when 3 then 48
    when 4 then 54
    when 5 then 36
    when 6 then 44
    when 7 then 52
    when 8 then 40
    else 47
  end,
  tags = case ranked_products.product_rank
    when 1 then array['notion', 'planning', 'founder']
    when 2 then array['onboarding', 'client-experience', 'service-business']
    when 3 then array['launch', 'sales-page', 'offer']
    when 4 then array['content', 'marketing', 'repurposing']
    when 5 then array['finance', 'invoices', 'cashflow']
    when 6 then array['crm', 'sales', 'pipeline']
    when 7 then array['focus', 'productivity', 'planning']
    when 8 then array['brand', 'workbook', 'strategy']
    else array['proposal', 'pricing', 'sales']
  end,
  sales_label = case ranked_products.product_rank
    when 1 then 'Founder favourite'
    when 2 then 'Best for premium services'
    when 3 then 'Fastest route to launch clarity'
    when 4 then 'Editorial planning bestseller'
    when 5 then 'Operations essential'
    when 6 then 'Sales visibility upgrade'
    when 7 then 'Most giftable productivity template'
    when 8 then 'Perfect pre-design workshop'
    else 'Closing system starter'
  end,
  accent = case ranked_products.product_rank
    when 1 then 'from-stone-900 via-amber-200 to-orange-100'
    when 2 then 'from-neutral-900 via-emerald-200 to-white'
    when 3 then 'from-stone-900 via-rose-200 to-amber-50'
    when 4 then 'from-slate-900 via-sky-200 to-white'
    when 5 then 'from-zinc-900 via-lime-200 to-stone-50'
    when 6 then 'from-stone-900 via-violet-200 to-white'
    when 7 then 'from-neutral-900 via-yellow-100 to-white'
    when 8 then 'from-slate-900 via-pink-200 to-white'
    else 'from-zinc-900 via-amber-200 to-white'
  end,
  cover_gradient = case ranked_products.product_rank
    when 1 then 'from-[#f6efe6] via-[#f4e5d3] to-[#e7d5be]'
    when 2 then 'from-[#f7f4ef] via-[#ece6dc] to-[#ddd5c7]'
    when 3 then 'from-[#fbf0ec] via-[#f3dfd9] to-[#e8c9bf]'
    when 4 then 'from-[#f4f3ef] via-[#e3e6e7] to-[#d8dde3]'
    when 5 then 'from-[#f8f5ea] via-[#ece4c8] to-[#ddd2ad]'
    when 6 then 'from-[#f6f2f9] via-[#e8dff5] to-[#d5c6ef]'
    when 7 then 'from-[#f7f3ee] via-[#ece3d5] to-[#ddd1c0]'
    when 8 then 'from-[#fbf2f4] via-[#eedde4] to-[#dfc7d1]'
    else 'from-[#f9f3eb] via-[#eadbc8] to-[#dcc4a8]'
  end,
  includes = case ranked_products.product_rank
    when 1 then array['weekly dashboard', 'priority planner', 'meeting and decision log']
    when 2 then array['discovery form', 'kickoff pack', 'client communication templates']
    when 3 then array['launch checklist', 'offer messaging prompts', 'CTA and sales page blocks']
    when 4 then array['90-day content map', 'repurposing planner', 'weekly execution board']
    when 5 then array['invoice workflow', 'cashflow tracker', 'pricing planner']
    when 6 then array['lead stages', 'follow-up templates', 'proposal tracker']
    when 7 then array['deep work planner', 'weekly reset', 'distraction-free daily pages']
    when 8 then array['brand positioning prompts', 'audience clarity worksheets', 'creative direction notes']
    else array['proposal templates', 'pricing scenarios', 'scope framework']
  end,
  hero_note = case ranked_products.product_rank
    when 1 then 'Run the week before it runs you.'
    when 2 then 'Look organised before the first call.'
    when 3 then 'Sell the outcome, not the workload.'
    when 4 then 'Turn strategy into publishable momentum.'
    when 5 then 'Keep the business calm behind the scenes.'
    when 6 then 'See what is moving and what is stuck.'
    when 7 then 'A cleaner day starts with a better system.'
    when 8 then 'Clarity before design saves weeks later.'
    else 'Close premium projects with more confidence.'
  end,
  bestseller = ranked_products.product_rank in (1, 2, 4, 5),
  featured = ranked_products.product_rank in (1, 2, 3, 4, 7),
  badge = case ranked_products.product_rank
    when 1 then 'featured'
    when 2 then 'bestseller'
    when 3 then 'new'
    when 4 then 'featured'
    when 5 then 'pack'
    when 6 then 'featured'
    when 7 then 'new'
    when 8 then 'bestseller'
    else 'pack'
  end,
  status = 'published',
  is_active = true,
  sort_order = ranked_products.product_rank,
  featured_order = case when ranked_products.product_rank in (1,2,3,4,7) then ranked_products.product_rank else 0 end
from ranked_products
where products.id = ranked_products.id;

insert into public.site_sections (section_key, eyebrow, title, description, body, cta_label, cta_href, is_published)
values
  ('hero', 'Templify', 'Premium digital templates for brands that want to look calm, credible and expensive.', 'Sell the result, not the file. Templify packages systems, templates and launch assets into a storefront designed for trust and conversion.', 'Built for creators, boutique studios, consultants and digital businesses that want elegant systems instead of generic downloads.', 'Browse templates', '/produkty', true),
  ('featured', 'Featured products', 'Start with the templates teams buy when they want momentum fast.', 'Each product is designed to reduce friction, save hours and help the buyer ship sooner with more confidence.', '', 'See all products', '/produkty', true),
  ('use-cases', 'Use cases', 'Choose a system for the exact part of the business you want to clean up next.', 'From Notion planning and client onboarding to launch kits, finance ops and premium productivity tools.', '', 'Explore categories', '/produkty', true),
  ('why-templify', 'Why Templify', 'Elegant enough to feel premium. Practical enough to change the way work gets done.', 'The storefront is built around clarity, trust and implementation speed. Every template is positioned as a business outcome, not another folder of files.', 'Premium presentation matters, but only when it supports action. Templify keeps both.', null, null, true),
  ('how-it-works', 'How it works', 'Choose, pay once, download instantly and put the system to work.', 'The purchase flow is lightweight, the library is immediate and the structure is ready to scale across categories, bundles and campaigns.', '', null, null, true),
  ('faq', 'FAQ', 'Answer the last objections before they slow down checkout.', 'Use this section to clarify format, delivery, usage rights and support in one editorial block.', '', null, null, true)
on conflict (section_key) do update
set eyebrow = excluded.eyebrow,
    title = excluded.title,
    description = excluded.description,
    body = excluded.body,
    cta_label = excluded.cta_label,
    cta_href = excluded.cta_href,
    is_published = excluded.is_published;

insert into public.content_pages (slug, title, description, body, is_published)
values
  ('polityka-prywatnosci', 'Polityka prywatności', 'Zasady przetwarzania danych osobowych w sklepie Templify.', 'Templify przetwarza dane osobowe wyłącznie w zakresie niezbędnym do realizacji zamówień, obsługi konta użytkownika, płatności i kontaktu z klientem. Administratorem danych jest Templify. W każdej chwili możesz skontaktować się w sprawie dostępu do danych, ich sprostowania lub usunięcia.', true),
  ('polityka-cookies', 'Polityka cookies', 'Informacje o wykorzystaniu plików cookies i zgód użytkownika.', 'W serwisie używamy plików niezbędnych do działania sklepu oraz opcjonalnych kategorii, takich jak analityczne i marketingowe. Baner zgód pozwala zaakceptować, odrzucić lub skonfigurować preferencje. Ustawienia można w przyszłości rozszerzyć o konkretne narzędzia analityczne i reklamowe.', true),
  ('regulamin', 'Regulamin', 'Warunki korzystania ze sklepu i zakupu produktów cyfrowych.', 'Produkty oferowane przez Templify mają charakter cyfrowy i są udostępniane po skutecznym opłaceniu zamówienia. Zakup daje dostęp do pobrania produktu w ramach konta użytkownika. Dalsza odsprzedaż lub nieuprawniona dystrybucja materiałów jest zabroniona.', true),
  ('kontakt', 'Kontakt', 'Skontaktuj się z zespołem Templify.', 'Masz pytania dotyczące zamówień, dostępu do biblioteki albo współpracy? Napisz do nas na adres kontakt@templify.store. Panel administracyjny pozwala w każdej chwili zaktualizować tę treść.', true)
on conflict (slug) do update
set title = excluded.title,
    description = excluded.description,
    body = excluded.body,
    is_published = excluded.is_published;

insert into public.faq_items (question, answer, sort_order, is_published)
values
  ('W jakim formacie dostanę produkt?', 'W zależności od produktu otrzymasz plik PDF, workspace Notion, arkusz lub paczkę materiałów pomocniczych. Format jest zawsze opisany na karcie produktu.', 1, true),
  ('Czy mogę używać templatek komercyjnie?', 'Tak, o ile opis produktu nie stanowi inaczej. Templatek możesz używać w swojej pracy lub biznesie, ale nie możesz ich odsprzedawać jako własnych.', 2, true),
  ('Jak szybko dostanę dostęp po zakupie?', 'Dostęp pojawia się automatycznie po potwierdzeniu płatności Stripe. Produkt trafia od razu do biblioteki użytkownika.', 3, true),
  ('Czy mogę kupić produkt bez zakładania konta?', 'Checkout wymaga zalogowanego konta, bo dzięki temu wszystkie zakupy i pobrania są bezpiecznie przypisane do jednej biblioteki.', 4, true)
on conflict do nothing;

insert into public.testimonials (author, role, quote, score, sort_order, is_published)
values
  ('Marta', 'studio brandingowe', 'Client Onboarding Suite sprawił, że od pierwszego kontaktu wyglądamy dużo bardziej premium i nie gubimy już etapów współpracy.', 5.0, 1, true),
  ('Kasia', 'twórczyni kursów online', 'Launch Offer Kit pomógł mi skrócić przygotowanie kampanii o kilka dni. Wszystko było gotowe, eleganckie i spójne.', 4.9, 2, true),
  ('Piotr', 'freelance consultant', 'Invoice & Cashflow Pack dał mi prosty rytm finansowy bez przeprojektowywania całego zaplecza biznesu.', 4.8, 3, true)
on conflict do nothing;
