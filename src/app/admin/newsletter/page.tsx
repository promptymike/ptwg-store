import Link from "next/link";
import { Download, Mail } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { formatAdminDate } from "@/lib/format";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export default async function AdminNewsletterPage() {
  const supabase = createSupabaseAdminClient();
  let subscribers: Array<{
    id: string;
    email: string;
    source: string;
    created_at: string;
    unsubscribed_at: string | null;
    consent: boolean;
  }> = [];
  let activeCount = 0;
  let unsubscribedCount = 0;

  if (supabase) {
    const { data } = await supabase
      .from("newsletter_subscribers")
      .select("id, email, source, created_at, unsubscribed_at, consent")
      .order("created_at", { ascending: false })
      .limit(500);
    subscribers = data ?? [];
    activeCount = subscribers.filter((s) => !s.unsubscribed_at).length;
    unsubscribedCount = subscribers.length - activeCount;
  }

  return (
    <div className="space-y-6">
      <div className="surface-panel space-y-4 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl text-foreground">Newsletter</h2>
            <p className="text-sm text-muted-foreground">
              Lista zapisanych adresów + kanał pozyskania (np. footer, hero,
              próbka). Aktywni subskrybenci dostają welcome email
              automatycznie. Możesz wyeksportować całą listę do CSV i wrzucić
              do dowolnego ESP.
            </p>
          </div>
          <Button render={<Link href="/api/admin/subscribers/export" />}>
            <Download className="size-4" />
            Eksport CSV
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-primary/75">
              Aktywni
            </p>
            <p className="mt-2 text-2xl text-foreground tabular-nums">
              {activeCount}
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-primary/75">
              Wypisani
            </p>
            <p className="mt-2 text-2xl text-foreground tabular-nums">
              {unsubscribedCount}
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-primary/75">
              Łącznie
            </p>
            <p className="mt-2 text-2xl text-foreground tabular-nums">
              {subscribers.length}
            </p>
          </div>
        </div>
      </div>

      {subscribers.length === 0 ? (
        <EmptyState
          icon={Mail}
          badge="Newsletter"
          title="Jeszcze nikt się nie zapisał"
          description="Formularz jest aktywny w stopce + na home (sekcja newslettera). Pierwsze adresy pojawią się tu od razu po zapisie."
          action={{ href: "/", label: "Zobacz formularz na stronie" }}
        />
      ) : (
        <div className="surface-panel overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-background/60 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Źródło</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Zapisano</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((sub) => (
                <tr
                  key={sub.id}
                  className="border-t border-border/60 align-top"
                >
                  <td className="break-all px-4 py-3 text-foreground">
                    {sub.email}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {sub.source}
                  </td>
                  <td className="px-4 py-3">
                    {sub.unsubscribed_at ? (
                      <span className="rounded-full border border-border/70 bg-secondary/40 px-2.5 py-0.5 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                        Wypisany
                      </span>
                    ) : (
                      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400">
                        Aktywny
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatAdminDate(sub.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
