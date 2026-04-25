import { Bell, ShieldAlert } from "lucide-react";

import { AdminPushBroadcast } from "@/components/admin/admin-push-broadcast";
import { env } from "@/lib/env";
import { isPushConfigured } from "@/lib/push";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export default async function AdminPushPage() {
  const configured = isPushConfigured();

  let subscriberCount = 0;
  if (configured) {
    const supabase = createSupabaseAdminClient();
    if (supabase) {
      const { count } = await supabase
        .from("push_subscriptions")
        .select("id", { count: "exact", head: true });
      subscriberCount = count ?? 0;
    }
  }

  return (
    <div className="space-y-6">
      <div className="surface-panel space-y-4 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl text-foreground">Powiadomienia push</h2>
            <p className="text-sm text-muted-foreground">
              Wyślij krótki komunikat do wszystkich osób, które włączyły
              powiadomienia (na telefonie i desktopie). Trafia w 1-2 sekundy
              od wysłania.
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-background/60 px-4 py-3 text-right">
            <p className="text-[11px] uppercase tracking-[0.22em] text-primary/75">
              Subskrybenci
            </p>
            <p className="mt-1 text-2xl text-foreground tabular-nums">
              {subscriberCount}
            </p>
          </div>
        </div>

        {!configured ? (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-200">
            <p className="flex items-center gap-2 font-semibold">
              <ShieldAlert className="size-4" />
              Brakuje kluczy VAPID
            </p>
            <p className="mt-1">
              Wygeneruj raz lokalnie: <code>npx web-push generate-vapid-keys</code>,
              następnie dodaj do Vercel:
            </p>
            <ul className="mt-2 list-inside list-disc text-xs">
              <li>
                <code>NEXT_PUBLIC_VAPID_PUBLIC_KEY</code> — klucz publiczny,
              </li>
              <li>
                <code>VAPID_PRIVATE_KEY</code> — klucz prywatny,
              </li>
              <li>
                <code>VAPID_SUBJECT</code> — np.{" "}
                <code>{env.vapidSubject}</code>.
              </li>
            </ul>
          </div>
        ) : null}
      </div>

      <div className="surface-panel space-y-4 p-6">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-9 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Bell className="size-4" />
          </span>
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Nowy broadcast
            </h3>
            <p className="text-xs text-muted-foreground">
              Wygasłe subskrypcje są automatycznie czyszczone po próbie wysyłki.
            </p>
          </div>
        </div>
        <AdminPushBroadcast />
      </div>
    </div>
  );
}
