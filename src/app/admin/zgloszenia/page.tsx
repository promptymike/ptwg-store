import Link from "next/link";

import { updateSupportTicketAction } from "@/app/admin/zgloszenia/actions";
import { TicketStatusBadge } from "@/components/support/ticket-status-badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  SUPPORT_STATUSES,
  supportStatusLabel,
  supportTopicLabel,
} from "@/lib/email/support-templates";
import { buildSupportTrackingUrl } from "@/lib/support/tracking";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

type TicketRow = {
  id: string;
  ticket_number: string;
  public_token: string;
  status: string;
  topic: string;
  name: string;
  email: string;
  order_ref: string | null;
  message: string;
  created_at: string;
  updated_at: string | null;
};

type TicketEventRow = {
  id: string;
  request_id: string;
  created_at: string;
  author: string;
  kind: string;
  body: string | null;
  old_status: string | null;
  new_status: string | null;
};

const FILTERS = [
  { value: "wszystkie", label: "Wszystkie" },
  ...SUPPORT_STATUSES.map((status) => ({ value: status.value, label: status.label })),
];

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

type AdminTicketsPageProps = {
  searchParams: Promise<{ status?: string }>;
};

export default async function AdminTicketsPage({ searchParams }: AdminTicketsPageProps) {
  const { status: statusFilter } = await searchParams;
  const admin = createSupabaseAdminClient();

  let query = admin
    ?.from("support_requests")
    .select(
      "id, ticket_number, public_token, status, topic, name, email, order_ref, message, created_at, updated_at",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (query && statusFilter && statusFilter !== "wszystkie") {
    query = query.eq("status", statusFilter);
  }

  const { data } = query ? await query : { data: [] };
  const tickets = (data ?? []) as TicketRow[];

  const ticketIds = tickets.map((ticket) => ticket.id);
  const { data: eventsData } =
    admin && ticketIds.length > 0
      ? await admin
          .from("support_request_events")
          .select("id, request_id, created_at, author, kind, body, old_status, new_status")
          .in("request_id", ticketIds)
          .order("created_at", { ascending: true })
      : { data: [] };

  const eventsByRequest = new Map<string, TicketEventRow[]>();
  for (const event of (eventsData ?? []) as TicketEventRow[]) {
    const list = eventsByRequest.get(event.request_id) ?? [];
    list.push(event);
    eventsByRequest.set(event.request_id, list);
  }

  const openCount = tickets.filter(
    (ticket) => ticket.status === "new" || ticket.status === "in_progress",
  ).length;

  return (
    <div className="space-y-8">
      <div>
        <span className="eyebrow">Helpdesk</span>
        <h1 className="mt-4 text-4xl text-foreground sm:text-5xl">Zgłoszenia klientów</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Reklamacje i pozostałe zgłoszenia z formularza Pomocy. Zmiana statusu
          i odpowiedź wysyłają klientowi maila oraz aktualizują jego stronę
          statusu. Reklamacje wymagają odpowiedzi w ciągu 14 dni.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((filter) => {
          const isActive =
            (statusFilter ?? "wszystkie") === filter.value;
          return (
            <Link
              key={filter.value}
              href={
                filter.value === "wszystkie"
                  ? "/admin/zgloszenia"
                  : `/admin/zgloszenia?status=${filter.value}`
              }
              className={`rounded-full border px-4 py-2 text-sm transition ${
                isActive
                  ? "border-primary/50 bg-primary/10 text-foreground"
                  : "border-border/70 bg-background/60 text-muted-foreground hover:border-primary/30 hover:text-foreground"
              }`}
            >
              {filter.label}
            </Link>
          );
        })}
        <span className="ml-auto text-sm text-muted-foreground">
          Otwarte na liście: {openCount}
        </span>
      </div>

      {tickets.length === 0 ? (
        <div className="surface-panel p-8 text-muted-foreground">
          Brak zgłoszeń dla wybranego filtra.
        </div>
      ) : (
        <div className="space-y-5">
          {tickets.map((ticket) => {
            const events = eventsByRequest.get(ticket.id) ?? [];
            return (
              <article key={ticket.id} className="surface-panel space-y-4 p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-sm font-semibold text-primary">
                    {ticket.ticket_number}
                  </span>
                  <TicketStatusBadge status={ticket.status} />
                  <span className="text-sm text-muted-foreground">
                    {supportTopicLabel(ticket.topic)}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {formatDateTime(ticket.created_at)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                  <span>
                    <span className="font-medium text-foreground">{ticket.name}</span>{" "}
                    &lt;{ticket.email}&gt;
                  </span>
                  {ticket.order_ref ? <span>Zamówienie: {ticket.order_ref}</span> : null}
                  <a
                    href={buildSupportTrackingUrl(ticket.public_token)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline underline-offset-2"
                  >
                    Strona statusu klienta
                  </a>
                </div>

                <p className="whitespace-pre-wrap rounded-xl border border-border/60 bg-secondary/25 p-4 text-sm leading-6 text-foreground">
                  {ticket.message}
                </p>

                {events.length > 0 ? (
                  <details className="rounded-xl border border-border/60 bg-background/50 p-4">
                    <summary className="cursor-pointer text-sm font-medium text-foreground">
                      Historia ({events.length})
                    </summary>
                    <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                      {events.map((event) => (
                        <li key={event.id} className="border-l-2 border-border/70 pl-3">
                          <span className="text-xs">{formatDateTime(event.created_at)}</span>{" "}
                          {event.kind === "status_change" ? (
                            <span>
                              — status {supportStatusLabel(event.old_status ?? "new")} →{" "}
                              <strong className="text-foreground">
                                {supportStatusLabel(event.new_status ?? "")}
                              </strong>
                            </span>
                          ) : event.kind === "note" ? (
                            <span>
                              — <em>notatka wewnętrzna:</em>{" "}
                              <span className="whitespace-pre-wrap">{event.body}</span>
                            </span>
                          ) : (
                            <span>
                              — odpowiedź do klienta:{" "}
                              <span className="whitespace-pre-wrap text-foreground">
                                {event.body}
                              </span>
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : null}

                <form action={updateSupportTicketAction} className="space-y-3">
                  <input type="hidden" name="requestId" value={ticket.id} />
                  <div className="grid gap-3 lg:grid-cols-2">
                    <div className="space-y-1.5">
                      <label
                        htmlFor={`reply-${ticket.id}`}
                        className="text-sm font-medium text-foreground"
                      >
                        Odpowiedź do klienta{" "}
                        <span className="text-muted-foreground">(wyśle maila)</span>
                      </label>
                      <Textarea
                        id={`reply-${ticket.id}`}
                        name="reply"
                        rows={3}
                        placeholder="Treść odpowiedzi — trafi na maila klienta i na stronę statusu."
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label
                        htmlFor={`note-${ticket.id}`}
                        className="text-sm font-medium text-foreground"
                      >
                        Notatka wewnętrzna{" "}
                        <span className="text-muted-foreground">(niewidoczna dla klienta)</span>
                      </label>
                      <Textarea
                        id={`note-${ticket.id}`}
                        name="internalNote"
                        rows={3}
                        placeholder="Np. ustalenia, kroki, kontekst dla przyszłego siebie."
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <label htmlFor={`status-${ticket.id}`} className="text-sm text-muted-foreground">
                      Status:
                    </label>
                    <select
                      id={`status-${ticket.id}`}
                      name="newStatus"
                      defaultValue={ticket.status}
                      className="h-10 rounded-xl border border-border/80 bg-background/70 px-3 text-sm text-foreground outline-none transition focus-visible:border-primary/50"
                    >
                      {SUPPORT_STATUSES.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                    <Button type="submit" size="sm">
                      Zapisz / wyślij
                    </Button>
                  </div>
                </form>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
