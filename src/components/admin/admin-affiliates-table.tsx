"use client";

import { useState } from "react";
import { Check, Copy, Edit3, Trash2 } from "lucide-react";

import { deleteAffiliateAction } from "@/app/actions/affiliates";
import { AdminAffiliateForm } from "@/components/admin/admin-affiliate-form";
import { Button } from "@/components/ui/button";
import { formatAdminDate, formatCurrency } from "@/lib/format";

type Affiliate = {
  id: string;
  code: string;
  name: string;
  email: string | null;
  percentCommission: number;
  isActive: boolean;
  notes: string;
  createdAt: string;
  totals: { count: number; gross: number; commission: number };
};

type AdminAffiliatesTableProps = {
  affiliates: Affiliate[];
};

export function AdminAffiliatesTable({ affiliates }: AdminAffiliatesTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (affiliates.length === 0) {
    return (
      <div className="surface-panel p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Jeszcze nie masz żadnego partnera. Rozwiń sekcję powyżej i dodaj pierwszego.
        </p>
      </div>
    );
  }

  return (
    <section className="surface-panel space-y-4 p-6">
      <h2 className="text-xl text-foreground">Partnerzy</h2>
      <ul className="space-y-3">
        {affiliates.map((aff) => {
          const shareUrl = `https://templify.pl/?ref=${encodeURIComponent(aff.code)}`;
          return (
            <li
              key={aff.id}
              className="rounded-2xl border border-border/70 bg-background/60 p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                        aff.isActive
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                          : "border-border/70 bg-secondary/40 text-muted-foreground"
                      }`}
                    >
                      {aff.isActive ? "Aktywny" : "Wyłączony"}
                    </span>
                    <code className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-bold tracking-[0.16em] text-foreground">
                      {aff.code}
                    </code>
                    <span className="text-sm font-semibold text-foreground">
                      {aff.name}
                    </span>
                    {aff.email ? (
                      <span className="text-xs text-muted-foreground">
                        {aff.email}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>
                      Prowizja:{" "}
                      <span className="font-semibold text-foreground tabular-nums">
                        {aff.percentCommission}%
                      </span>
                    </span>
                    <span>
                      Referrals:{" "}
                      <span className="font-semibold text-foreground tabular-nums">
                        {aff.totals.count}
                      </span>
                    </span>
                    <span>
                      Brutto:{" "}
                      <span className="font-semibold text-foreground tabular-nums">
                        {formatCurrency(aff.totals.gross)}
                      </span>
                    </span>
                    <span>
                      Wypłata:{" "}
                      <span className="font-semibold text-foreground tabular-nums">
                        {formatCurrency(aff.totals.commission)}
                      </span>
                    </span>
                    <span>· dodany {formatAdminDate(aff.createdAt)}</span>
                  </div>
                  {aff.notes ? (
                    <p className="text-xs text-muted-foreground">
                      {aff.notes}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(shareUrl);
                        setCopiedId(aff.id);
                        window.setTimeout(() => setCopiedId(null), 1800);
                      } catch {
                        // ignore
                      }
                    }}
                  >
                    {copiedId === aff.id ? (
                      <>
                        <Check className="size-3.5" />
                        Skopiowano link
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5" />
                        Kopiuj link
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setEditingId((current) => (current === aff.id ? null : aff.id))
                    }
                  >
                    <Edit3 className="size-3.5" />
                    {editingId === aff.id ? "Schowaj" : "Edytuj"}
                  </Button>
                  <form action={deleteAffiliateAction}>
                    <input type="hidden" name="id" value={aff.id} />
                    <Button
                      type="submit"
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={(e) => {
                        if (
                          !window.confirm(
                            `Usunąć partnera ${aff.code}? Historia referrals zniknie razem z nim.`,
                          )
                        ) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </form>
                </div>
              </div>

              {editingId === aff.id ? (
                <div className="mt-4 border-t border-border/60 pt-4">
                  <AdminAffiliateForm affiliate={aff} />
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
