import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageSquareText, RefreshCcw, Send } from "lucide-react";

import { TicketStatusBadge } from "@/components/support/ticket-status-badge";
import {
  supportStatusDescription,
  supportStatusLabel,
  supportTopicLabel,
} from "@/lib/email/support-templates";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Status zgłoszenia",
  robots: {
    index: false,
    follow: false,
  },
};

type TicketPageProps = {
  params: Promise<{ token: string }>;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

// Token-scoped ticket status page. The token is an unguessable capability
// (uuid) delivered by e-mail — it grants read access to this single ticket's
// customer-visible history (internal notes are filtered out).
export default async function TicketStatusPage({ params }: TicketPageProps) {
  const { token } = await params;
  if (!UUID_RE.test(token)) notFound();

  const supabase = createSupabaseAdminClient();
  if (!supabase) notFound();

  const { data: request } = await supabase
    .from("support_requests")
    .select(
      "id, ticket_number, status, topic, order_ref, message, created_at, updated_at, name",
    )
    .eq("public_token", token)
    .maybeSingle();

  if (!request) notFound();

  const { data: eventsData } = await supabase
    .from("support_request_events")
    .select("id, created_at, author, kind, body, old_status, new_status")
    .eq("request_id", request.id)
    .in("kind", ["message", "status_change"])
    .order("created_at", { ascending: true });

  const events = eventsData ?? [];

  return (
    <div className="shell section-space">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <span className="eyebrow">Obsługa klienta</span>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl text-foreground sm:text-4xl">
              Zgłoszenie{" "}
              <span className="font-mono text-primary">{request.ticket_number}</span>
            </h1>
            <TicketStatusBadge status={request.status} />
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {supportStatusDescription(request.status)}
          </p>
        </div>

        <section className="surface-panel space-y-4 p-6 sm:p-8" aria-label="Szczegóły zgłoszenia">
          <dl className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Temat</dt>
              <dd className="mt-0.5 font-medium text-foreground">
                {supportTopicLabel(request.topic)}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Złożone</dt>
              <dd className="mt-0.5 font-medium text-foreground">
                {formatDateTime(request.created_at)}
              </dd>
            </div>
            {request.order_ref ? (
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                  Numer zamówienia
                </dt>
                <dd className="mt-0.5 font-medium text-foreground">{request.order_ref}</dd>
              </div>
            ) : null}
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                Ostatnia aktualizacja
              </dt>
              <dd className="mt-0.5 font-medium text-foreground">
                {formatDateTime(request.updated_at ?? request.created_at)}
              </dd>
            </div>
          </dl>
        </section>

        <section className="surface-panel p-6 sm:p-8" aria-label="Historia zgłoszenia">
          <h2 className="text-lg font-semibold text-foreground">Historia zgłoszenia</h2>
          <ol className="mt-5 space-y-5 border-l border-border/70 pl-5">
            <li className="relative">
              <span className="absolute -left-[27px] top-1 flex size-4 items-center justify-center rounded-full border border-primary/40 bg-primary/15">
                <Send className="size-2.5 text-primary" />
              </span>
              <p className="text-xs text-muted-foreground">{formatDateTime(request.created_at)}</p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                Zgłoszenie przyjęte
              </p>
              <p className="mt-1.5 whitespace-pre-wrap rounded-xl border border-border/60 bg-secondary/25 p-3 text-sm leading-6 text-muted-foreground">
                {request.message}
              </p>
            </li>

            {events.map((event) => (
              <li key={event.id} className="relative">
                <span className="absolute -left-[27px] top-1 flex size-4 items-center justify-center rounded-full border border-primary/40 bg-primary/15">
                  {event.kind === "message" ? (
                    <MessageSquareText className="size-2.5 text-primary" />
                  ) : (
                    <RefreshCcw className="size-2.5 text-primary" />
                  )}
                </span>
                <p className="text-xs text-muted-foreground">{formatDateTime(event.created_at)}</p>
                {event.kind === "status_change" ? (
                  <p className="mt-1 text-sm text-foreground">
                    Zmiana statusu:{" "}
                    <span className="font-semibold">
                      {supportStatusLabel(event.old_status ?? "new")}
                    </span>{" "}
                    →{" "}
                    <span className="font-semibold">
                      {supportStatusLabel(event.new_status ?? request.status)}
                    </span>
                  </p>
                ) : (
                  <>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      Odpowiedź zespołu Templify
                    </p>
                    {event.body ? (
                      <p className="mt-1.5 whitespace-pre-wrap rounded-xl border border-border/60 bg-secondary/25 p-3 text-sm leading-6 text-muted-foreground">
                        {event.body}
                      </p>
                    ) : null}
                  </>
                )}
              </li>
            ))}
          </ol>
        </section>

        <p className="text-sm leading-6 text-muted-foreground">
          Chcesz coś dodać do zgłoszenia? Odpowiedz na e-mail z potwierdzeniem
          (podając numer {request.ticket_number}) albo napisz na{" "}
          <a
            href="mailto:ptwgadmin@gmail.com"
            className="font-medium text-primary underline underline-offset-2"
          >
            ptwgadmin@gmail.com
          </a>
          . Wszystkie zasady rozpatrywania reklamacji znajdziesz w{" "}
          <Link href="/regulamin#s7" className="font-medium text-primary underline underline-offset-2">
            §7 Regulaminu
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
