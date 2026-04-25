"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2, LogIn, ShieldCheck } from "lucide-react";

import {
  type PartnerLookupState,
  lookupPartnerStatsAction,
} from "@/app/actions/partner-stats";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatAdminDate, formatCurrency } from "@/lib/format";

export function PartnerDashboard() {
  const [state, formAction, isPending] = useActionState<
    PartnerLookupState,
    FormData
  >(lookupPartnerStatsAction, { status: "idle" });

  return (
    <div className="space-y-8">
      <section className="surface-panel space-y-6 p-6 sm:p-8">
        <div className="space-y-2">
          <p className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.24em] text-primary/75">
            <ShieldCheck className="size-3.5" />
            Tylko dla partnerów
          </p>
          <h2 className="text-2xl text-foreground sm:text-3xl">
            Sprawdź swoje statystyki
          </h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Wpisz swój kod afiliacyjny i e-mail, który zostawiłaś/eś przy
            zgłoszeniu do programu. Zobaczysz aktualne wyniki i prowizję bez
            potrzeby zakładania osobnego konta.
          </p>
        </div>

        <form
          action={formAction}
          className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto]"
        >
          <label className="space-y-1.5">
            <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Twój kod
            </span>
            <Input
              name="code"
              placeholder="np. ANIA20"
              autoComplete="off"
              required
              maxLength={40}
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Twój e-mail
            </span>
            <Input
              name="email"
              type="email"
              placeholder="ty@example.com"
              autoComplete="email"
              required
            />
          </label>
          <div className="flex items-end">
            <Button
              type="submit"
              size="lg"
              disabled={isPending}
              className="w-full sm:w-auto"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Sprawdzam…
                </>
              ) : (
                <>
                  <LogIn className="size-4" />
                  Pokaż statystyki
                </>
              )}
            </Button>
          </div>
        </form>

        {state.status === "error" ? (
          <p role="alert" className="text-sm text-destructive">
            {state.message}
          </p>
        ) : null}

        {state.status === "ok" ? (
          <p
            role="status"
            className="inline-flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400"
          >
            <CheckCircle2 className="size-4" />
            Witaj{state.affiliate.name ? `, ${state.affiliate.name}` : ""}!
            Statystyki są aktualne na żywo.
          </p>
        ) : null}
      </section>

      {state.status === "ok" ? (
        <section className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Kod"
              value={state.affiliate.code}
              hint={`${state.affiliate.percentCommission}% prowizji od brutto`}
            />
            <StatCard
              label="Sprzedaże"
              value={String(state.totals.count)}
              hint="Liczba zakupów z Twoim kodem"
            />
            <StatCard
              label="Sprzedaż brutto"
              value={formatCurrency(state.totals.gross)}
              hint="Suma zamówień zaliczonych do programu"
            />
            <StatCard
              label="Twoja prowizja"
              value={formatCurrency(state.totals.commission)}
              hint="Naliczona, do wypłaty po zatwierdzeniu"
            />
          </div>

          <div className="surface-panel space-y-4 p-6">
            <div className="space-y-1">
              <h3 className="text-xl text-foreground">Ostatnie 50 zamówień</h3>
              <p className="text-sm text-muted-foreground">
                Adresy klientów są częściowo zamaskowane — chronimy ich
                prywatność, ale Ty widzisz, że Twoje polecenia działają.
              </p>
            </div>
            {state.referrals.length === 0 ? (
              <p className="rounded-2xl border border-border/70 bg-background/60 p-4 text-sm text-muted-foreground">
                Jeszcze brak referrali. Pierwszy zaliczony zakup z Twoim kodem
                pojawi się tu w ciągu kilku minut.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-background/60 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 text-left">Klient</th>
                      <th className="px-4 py-3 text-right">Brutto</th>
                      <th className="px-4 py-3 text-right">Twoja prowizja</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Kiedy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.referrals.map((ref, idx) => (
                      <tr key={idx} className="border-t border-border/60">
                        <td className="break-all px-4 py-3 text-foreground">
                          {ref.customerEmail}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                          {formatCurrency(ref.grossAmount)}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-foreground">
                          {formatCurrency(ref.commission)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] uppercase tracking-[0.16em] text-amber-700 dark:text-amber-400">
                            {ref.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {formatAdminDate(ref.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/60 p-5">
      <p className="text-[11px] uppercase tracking-[0.22em] text-primary/75">
        {label}
      </p>
      <p className="mt-2 text-2xl text-foreground tabular-nums">{value}</p>
      <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
