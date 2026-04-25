import { Gift } from "lucide-react";

import { formatAdminDate, formatCurrency } from "@/lib/format";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

type GiftRow = {
  id: string;
  code: string;
  amount_minor: number;
  status: string;
  purchaser_email: string;
  recipient_email: string | null;
  recipient_name: string | null;
  created_at: string;
  redeemed_at: string | null;
  redeemed_by_user_id: string | null;
  redeemed_order_id: string | null;
  expires_at: string | null;
};

const STATUS_LABEL: Record<string, string> = {
  pending: "W trakcie płatności",
  issued: "Aktywny",
  redeemed: "Wykorzystany",
  refunded: "Zwrócony",
  expired: "Wygasły",
};

const STATUS_BADGE: Record<string, string> = {
  pending:
    "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  issued:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  redeemed:
    "border-primary/30 bg-primary/10 text-primary",
  refunded:
    "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400",
  expired:
    "border-stone-500/30 bg-stone-500/10 text-stone-700 dark:text-stone-300",
};

export default async function AdminGiftCodesPage() {
  const supabase = createSupabaseAdminClient();
  let rows: GiftRow[] = [];

  if (supabase) {
    const { data } = await supabase
      .from("gift_codes")
      .select(
        "id, code, amount_minor, status, purchaser_email, recipient_email, recipient_name, created_at, redeemed_at, redeemed_by_user_id, redeemed_order_id, expires_at",
      )
      .order("created_at", { ascending: false })
      .limit(200);
    rows = (data ?? []) as GiftRow[];
  }

  const totals = rows.reduce(
    (acc, row) => {
      const minor = row.amount_minor;
      acc.issuedCount += row.status === "issued" ? 1 : 0;
      acc.redeemedCount += row.status === "redeemed" ? 1 : 0;
      acc.outstandingMinor += row.status === "issued" ? minor : 0;
      acc.totalIssuedMinor += minor;
      return acc;
    },
    {
      issuedCount: 0,
      redeemedCount: 0,
      outstandingMinor: 0,
      totalIssuedMinor: 0,
    },
  );

  return (
    <div className="space-y-6">
      <div className="surface-panel space-y-4 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl text-foreground">Vouchery podarunkowe</h2>
            <p className="text-sm text-muted-foreground">
              Każdy zakup vouchera generuje unikalny kod GIFT-XXXX. Kod jest
              jednorazowy, ważny 12 miesięcy i przyjmowany na ekranie checkoutu.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-primary/75">
              Aktywne kody
            </p>
            <p className="mt-2 text-2xl text-foreground tabular-nums">
              {totals.issuedCount}
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-primary/75">
              Wykorzystane
            </p>
            <p className="mt-2 text-2xl text-foreground tabular-nums">
              {totals.redeemedCount}
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-primary/75">
              Saldo do realizacji
            </p>
            <p className="mt-2 text-2xl text-foreground tabular-nums">
              {formatCurrency(totals.outstandingMinor / 100)}
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-primary/75">
              Łączna sprzedaż voucherów
            </p>
            <p className="mt-2 text-2xl text-foreground tabular-nums">
              {formatCurrency(totals.totalIssuedMinor / 100)}
            </p>
          </div>
        </div>
      </div>

      <section className="surface-panel space-y-4 p-6">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-9 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Gift className="size-4" />
          </span>
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Ostatnie 200 voucherów
            </h3>
            <p className="text-xs text-muted-foreground">
              Sortowane od najnowszego.
            </p>
          </div>
        </div>

        {rows.length === 0 ? (
          <p className="rounded-2xl border border-border/70 bg-background/60 p-4 text-sm text-muted-foreground">
            Brak voucherów. Pierwszy zakup pojawi się tu w ciągu kilku minut po
            opłaceniu.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-background/60 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Kod</th>
                  <th className="px-4 py-3 text-right">Kwota</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Kupujący</th>
                  <th className="px-4 py-3 text-left">Odbiorca</th>
                  <th className="px-4 py-3 text-left">Wystawiony</th>
                  <th className="px-4 py-3 text-left">Wykorzystany</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-t border-border/60">
                    <td className="px-4 py-3 font-mono text-xs text-foreground">
                      {row.code}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-foreground">
                      {formatCurrency(row.amount_minor / 100)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[11px] uppercase tracking-[0.16em] ${
                          STATUS_BADGE[row.status] ??
                          "border-border/70 bg-background/60 text-muted-foreground"
                        }`}
                      >
                        {STATUS_LABEL[row.status] ?? row.status}
                      </span>
                    </td>
                    <td className="break-all px-4 py-3 text-xs text-muted-foreground">
                      {row.purchaser_email}
                    </td>
                    <td className="break-all px-4 py-3 text-xs text-muted-foreground">
                      {row.recipient_email ? (
                        <>
                          {row.recipient_email}
                          {row.recipient_name ? (
                            <span className="ml-1 text-foreground">
                              ({row.recipient_name})
                            </span>
                          ) : null}
                        </>
                      ) : (
                        <span className="text-muted-foreground/70">
                          do kupującego
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatAdminDate(row.created_at)}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {row.redeemed_at
                        ? formatAdminDate(row.redeemed_at)
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
