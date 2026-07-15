-- Helpdesk inbox (created on prod 2026-07-06 via MCP during the kontakt/
-- support-form session; this file backfills the repo so migration history
-- matches the remote database — the schema below is reconstructed 1:1 from
-- the live table).

create table if not exists public.support_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid references auth.users (id) on delete set null,
  name text not null default '',
  email text not null,
  topic text not null default 'pytanie',
  order_ref text,
  message text not null,
  status text not null default 'new',
  handled_at timestamptz
);

alter table public.support_requests enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'support_requests'
      and policyname = 'Admins read support requests'
  ) then
    create policy "Admins read support requests" on public.support_requests
      for select to authenticated
      using (
        exists (
          select 1 from profiles p
          where p.id = (select auth.uid()) and p.role = 'admin'::user_role
        )
      );
  end if;
end $$;
