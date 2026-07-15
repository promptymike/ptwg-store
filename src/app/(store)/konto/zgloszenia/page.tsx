import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LifeBuoy } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { TicketStatusBadge } from "@/components/support/ticket-status-badge";
import { supportTopicLabel } from "@/lib/email/support-templates";
import { getCurrentUser } from "@/lib/session";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Twoje zgłoszenia",
  robots: {
    index: false,
    follow: false,
  },
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

// Account view of the helpdesk: every ticket tied to the signed-in user
// (by user_id, plus guest tickets submitted with the same e-mail).
export default async function AccountTicketsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/logowanie?next=/konto/zgloszenia");
  }

  const supabase = createSupabaseAdminClient();
  const { data } = supabase
    ? await supabase
        .from("support_requests")
        .select(
          "id, ticket_number, public_token, status, topic, order_ref, created_at, updated_at",
        )
        .or(
          `user_id.eq.${user.id}${user.email ? `,email.eq.${user.email.toLowerCase()}` : ""}`,
        )
        .order("created_at", { ascending: false })
        .limit(50)
    : { data: [] };

  const tickets = data ?? [];

  return (
    <div className="shell section-space">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow">Konto</span>
            <h1 className="mt-4 text-4xl text-foreground sm:text-5xl">Twoje zgłoszenia</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              Historia kontaktów z obsługą klienta — reklamacje, pytania i inne
              sprawy, razem z aktualnym statusem każdego zgłoszenia.
            </p>
          </div>
          <Link
            href="/pomoc#formularz"
            className="rounded-full border border-border/70 px-4 py-2 text-sm text-foreground transition hover:border-primary/30"
          >
            Nowe zgłoszenie
          </Link>
        </div>

        {tickets.length === 0 ? (
          <EmptyState
            icon={LifeBuoy}
            badge="Zgłoszenia"
            title="Nie masz jeszcze żadnych zgłoszeń"
            description="Gdy wyślesz zgłoszenie przez formularz w sekcji Pomoc, zobaczysz je tutaj razem z numerem i statusem."
            action={{ href: "/pomoc", label: "Przejdź do Pomocy" }}
          />
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/pomoc/zgloszenie/${ticket.public_token}`}
                className="surface-panel block p-5 transition hover:border-primary/30"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-sm font-semibold text-primary">
                    {ticket.ticket_number}
                  </span>
                  <TicketStatusBadge status={ticket.status} />
                  <span className="ml-auto text-xs text-muted-foreground">
                    {formatDateTime(ticket.updated_at ?? ticket.created_at)}
                  </span>
                </div>
                <p className="mt-2 text-sm font-medium text-foreground">
                  {supportTopicLabel(ticket.topic)}
                  {ticket.order_ref ? (
                    <span className="text-muted-foreground"> · zamówienie {ticket.order_ref}</span>
                  ) : null}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
