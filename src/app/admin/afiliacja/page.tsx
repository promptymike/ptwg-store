import { Plus } from "lucide-react";

import { AdminAffiliatesTable } from "@/components/admin/admin-affiliates-table";
import { AdminAffiliateForm } from "@/components/admin/admin-affiliate-form";
import { formatAdminDate, formatCurrency } from "@/lib/format";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export default async function AdminAffiliatesPage() {
  const supabase = createSupabaseAdminClient();

  type AffiliateRow = {
    id: string;
    code: string;
    name: string;
    email: string | null;
    percent_commission: number;
    is_active: boolean;
    notes: string;
    created_at: string;
  };
  type ReferralRow = {
    affiliate_id: string;
    customer_email: string;
    gross_amount: number;
    commission: number;
    status: string;
    created_at: string;
  };

  let affiliates: AffiliateRow[] = [];
  let referrals: ReferralRow[] = [];

  if (supabase) {
    const [affRes, refRes] = await Promise.all([
      supabase
        .from("affiliates")
        .select("id, code, name, email, percent_commission, is_active, notes, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("affiliate_referrals")
        .select("affiliate_id, customer_email, gross_amount, commission, status, created_at")
        .order("created_at", { ascending: false })
        .limit(200),
    ]);
    affiliates = (affRes.data ?? []) as AffiliateRow[];
    referrals = (refRes.data ?? []) as ReferralRow[];
  }

  const totalsByAffiliate = new Map<
    string,
    { count: number; gross: number; commission: number }
  >();
  for (const ref of referrals) {
    const existing = totalsByAffiliate.get(ref.affiliate_id) ?? {
      count: 0,
      gross: 0,
      commission: 0,
    };
    existing.count += 1;
    existing.gross += ref.gross_amount;
    existing.commission += ref.commission;
    totalsByAffiliate.set(ref.affiliate_id, existing);
  }

  const programTotals = referrals.reduce(
    (sum, ref) => ({
      count: sum.count + 1,
      gross: sum.gross + ref.gross_amount,
      commission: sum.commission + ref.commission,
    }),
    { count: 0, gross: 0, commission: 0 },
  );

  return (
    <div className="space-y-6">
      <div className="surface-panel space-y-4 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl text-foreground">Afiliacja</h2>
            <p className="text-sm text-muted-foreground">
              Każdy partner dostaje swój kod (np. <code>ANIA20</code>). Link do
              sklepu z <code>?ref=ANIA20</code> przypisuje wizytę na 30 dni.
              Zakup w tym oknie liczy się jako referral i naliczamy prowizję.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-primary/75">
              Aktywni partnerzy
            </p>
            <p className="mt-2 text-2xl text-foreground tabular-nums">
              {affiliates.filter((a) => a.is_active).length}
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-primary/75">
              Referrals (200 ostatnich)
            </p>
            <p className="mt-2 text-2xl text-foreground tabular-nums">
              {programTotals.count}
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-primary/75">
              Łączna prowizja
            </p>
            <p className="mt-2 text-2xl text-foreground tabular-nums">
              {formatCurrency(programTotals.commission)}
            </p>
          </div>
        </div>
      </div>

      <details className="surface-panel space-y-4 p-6 open:space-y-4">
        <summary className="flex cursor-pointer items-center justify-between gap-2 text-base font-semibold text-foreground">
          <span className="flex items-center gap-2">
            <Plus className="size-4 text-primary" />
            Dodaj nowego partnera
          </span>
          <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Rozwiń
          </span>
        </summary>
        <div className="pt-2">
          <AdminAffiliateForm />
        </div>
      </details>

      <AdminAffiliatesTable
        affiliates={affiliates.map((a) => ({
          id: a.id,
          code: a.code,
          name: a.name,
          email: a.email,
          percentCommission: a.percent_commission,
          isActive: a.is_active,
          notes: a.notes,
          createdAt: a.created_at,
          totals: totalsByAffiliate.get(a.id) ?? {
            count: 0,
            gross: 0,
            commission: 0,
          },
        }))}
      />

      <section className="surface-panel space-y-4 p-6">
        <div className="space-y-1">
          <h2 className="text-xl text-foreground">Ostatnie referrals</h2>
          <p className="text-sm text-muted-foreground">
            Lista zamówień z przypisanym kodem afiliacyjnym, ostatnie 200.
          </p>
        </div>
        {referrals.length === 0 ? (
          <p className="rounded-2xl border border-border/70 bg-background/60 p-4 text-sm text-muted-foreground">
            Jeszcze brak. Pierwsza prowizja naliczy się natychmiast po zakupie z
            Twoim kodem.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-background/60 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Email klienta</th>
                  <th className="px-4 py-3 text-right">Brutto</th>
                  <th className="px-4 py-3 text-right">Prowizja</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Kiedy</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((ref, idx) => {
                  const aff = affiliates.find((a) => a.id === ref.affiliate_id);
                  return (
                    <tr key={idx} className="border-t border-border/60">
                      <td className="break-all px-4 py-3 text-foreground">
                        {ref.customer_email}
                        {aff ? (
                          <span className="ml-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                            via {aff.code}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                        {formatCurrency(ref.gross_amount)}
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
                        {formatAdminDate(ref.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
