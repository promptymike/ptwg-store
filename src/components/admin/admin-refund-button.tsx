"use client";

import { useActionState, useEffect, useState } from "react";
import { CheckCircle2, Loader2, RotateCcw, X } from "lucide-react";

import {
  type RefundOrderState,
  refundOrderAction,
} from "@/app/actions/refunds";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/format";

type AdminRefundButtonProps = {
  orderId: string;
  total: number;
  alreadyRefunded?: boolean;
};

export function AdminRefundButton({
  orderId,
  total,
  alreadyRefunded,
}: AdminRefundButtonProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState<
    RefundOrderState,
    FormData
  >(refundOrderAction, { status: "idle" });

  useEffect(() => {
    if (state.status === "ok") {
      const t = window.setTimeout(() => setOpen(false), 1500);
      return () => window.clearTimeout(t);
    }
  }, [state.status]);

  if (alreadyRefunded) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-700 dark:text-rose-400">
        Refundowane
      </span>
    );
  }

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen(true);
        }}
      >
        <RotateCcw className="size-3.5" />
        Refund
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <button
            type="button"
            aria-label="Zamknij"
            onClick={() => setOpen(false)}
            className="absolute inset-0 cursor-default bg-stone-950/55 backdrop-blur-sm animate-in fade-in duration-150"
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border/80 bg-card shadow-[0_40px_100px_-30px_rgba(0,0,0,0.55)] animate-in fade-in slide-in-from-bottom-3 duration-200 sm:slide-in-from-bottom-1">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Zamknij"
              className="absolute right-3 top-3 inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            >
              <X className="size-4" />
            </button>

            <form action={formAction} className="space-y-4 p-6 pt-9 sm:p-8 sm:pt-10">
              <input type="hidden" name="orderId" value={orderId} />

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-primary/75">
                  Refund pełnej kwoty
                </p>
                <h2 className="text-2xl font-semibold text-foreground">
                  Zwrócić {formatCurrency(total)}?
                </h2>
                <p className="text-sm text-muted-foreground">
                  Pieniądze wrócą na kartę klienta w 5-10 dni roboczych
                  (zależnie od banku). Akcja jest nieodwracalna.
                </p>
              </div>

              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-foreground">Powód</span>
                <select
                  name="reason"
                  defaultValue="requested_by_customer"
                  className="h-12 w-full rounded-2xl border border-input bg-input px-4 text-sm text-foreground"
                >
                  <option value="requested_by_customer">Klient poprosił</option>
                  <option value="duplicate">Duplikat zamówienia</option>
                  <option value="fraudulent">Podejrzenie oszustwa</option>
                  <option value="other">Inne</option>
                </select>
              </label>

              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-foreground">
                  Notatka wewnętrzna (opcjonalna)
                </span>
                <Textarea
                  name="note"
                  rows={2}
                  maxLength={500}
                  placeholder="np. plik nie otwierał się na iOS"
                />
              </label>

              <label className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background/60 p-3 text-sm">
                <input
                  type="checkbox"
                  name="revokeLibrary"
                  defaultChecked
                  className="mt-1 size-4 shrink-0 accent-[var(--color-foreground)]"
                />
                <span>
                  <span className="block font-medium text-foreground">
                    Odbierz dostęp w bibliotece
                  </span>
                  <span className="text-muted-foreground">
                    Zalecane przy refundzie. Klient nadal ma kopię pliku, ale
                    nie zobaczy go w sklepie.
                  </span>
                </span>
              </label>

              <div className="flex items-center gap-3 pt-1">
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Refund w toku…
                    </>
                  ) : (
                    <>
                      <RotateCcw className="size-4" />
                      Wykonaj refund
                    </>
                  )}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                  Anuluj
                </Button>
              </div>

              {state.status === "ok" ? (
                <p
                  role="status"
                  className="inline-flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400"
                >
                  <CheckCircle2 className="size-4" />
                  {state.message}
                </p>
              ) : null}
              {state.status === "error" ? (
                <p role="alert" className="text-sm text-destructive">
                  {state.message}
                </p>
              ) : null}
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
