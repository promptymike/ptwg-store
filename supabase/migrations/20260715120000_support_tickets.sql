-- Helpdesk → ticket system (HotPay compliance: customers must be able to
-- track what happens with their complaint).
--
-- support_requests gains a public ticket number (TPL-00123), a capability
-- token used in "check your ticket" links, and a constrained status. A new
-- support_request_events table records the full history (status changes,
-- admin replies, internal notes) that powers the customer-facing timeline.

create sequence if not exists public.support_ticket_number_seq start with 101;

alter table public.support_requests
  add column if not exists ticket_number text,
  add column if not exists public_token uuid not null default gen_random_uuid(),
  add column if not exists updated_at timestamptz not null default now();

update public.support_requests
set ticket_number = 'TPL-' || lpad(nextval('public.support_ticket_number_seq')::text, 5, '0')
where ticket_number is null;

alter table public.support_requests
  alter column ticket_number set not null,
  alter column ticket_number set default ('TPL-' || lpad(nextval('public.support_ticket_number_seq')::text, 5, '0'));

alter table public.support_requests
  add constraint support_requests_ticket_number_key unique (ticket_number),
  add constraint support_requests_public_token_key unique (public_token),
  add constraint support_requests_status_check
    check (status in ('new', 'in_progress', 'waiting_customer', 'resolved', 'closed'));

create table if not exists public.support_request_events (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.support_requests(id) on delete cascade,
  created_at timestamptz not null default now(),
  -- who produced the event; writes always go through the service role
  author text not null check (author in ('customer', 'admin', 'system')),
  -- 'message' = reply visible to the customer (admin replies are emailed),
  -- 'status_change' = visible on the customer timeline,
  -- 'note' = internal, never shown to the customer
  kind text not null check (kind in ('message', 'status_change', 'note')),
  body text,
  old_status text,
  new_status text
);

create index if not exists support_request_events_request_id_idx
  on public.support_request_events (request_id, created_at);

alter table public.support_request_events enable row level security;

-- Reads for admins only; customer-facing timeline is served by server
-- actions using the service role (token- or e-mail-verified), so no anon
-- policy is needed.
create policy "Admins read support events" on public.support_request_events
  for select to authenticated
  using (is_admin());
