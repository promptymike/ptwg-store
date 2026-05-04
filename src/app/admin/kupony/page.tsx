import { Percent } from "lucide-react";

import {
  toggleCouponAction,
  upsertCouponAction,
} from "@/app/admin/actions";
import { AdminStatusNotice } from "@/components/admin/admin-status-notice";
import { AdminSubmitButton } from "@/components/admin/admin-submit-button";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAdminCouponsSnapshot } from "@/lib/supabase/store";

type AdminCouponsPageProps = {
  searchParams: Promise<{
    type?: string;
    message?: string;
  }>;
};

function formatDateTimeLocal(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

export default async function AdminCouponsPage({
  searchParams,
}: AdminCouponsPageProps) {
  const [snapshot, status] = await Promise.all([
    getAdminCouponsSnapshot(),
    searchParams,
  ]);

  return (
    <div className="space-y-6">
      <AdminStatusNotice type={status.type} message={status.message} />

      <section className="surface-panel space-y-5 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <span className="eyebrow">Conversion mechanics</span>
            <h2 className="text-3xl text-foreground">Kupony rabatowe</h2>
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
              Kody z tej listy są walidowane po stronie serwera i zapisywane
              przy orderze. Checkout nie zależy od nich: jeśli kod jest pusty
              albo wygasł, zakup nadal działa normalnie.
            </p>
          </div>
          <div className="rounded-full border border-border/70 bg-background/70 px-4 py-2 text-sm text-muted-foreground">
            Aktywne: {snapshot.coupons.filter((coupon) => coupon.isActive).length}
          </div>
        </div>

        <form
          action={upsertCouponAction}
          className="grid gap-3 rounded-[1.5rem] border border-border/70 bg-background/60 p-5 lg:grid-cols-[1fr_1.5fr_0.7fr_0.8fr_1fr_auto]"
        >
          <label className="space-y-1.5">
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Kod
            </span>
            <Input name="code" required placeholder="WELCOME10" />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Etykieta
            </span>
            <Input name="label" required placeholder="Powitalne -10%" />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Rabat %
            </span>
            <Input name="percentOff" type="number" min="1" max="95" required />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Limit użyć
            </span>
            <Input name="maxRedemptions" type="number" min="1" placeholder="brak" />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Wygasa
            </span>
            <Input name="expiresAt" type="datetime-local" />
          </label>
          <div className="flex items-end gap-3">
            <label className="flex items-center gap-2 rounded-2xl border border-border/70 bg-background/70 px-3 py-2 text-sm">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked
                className="size-4 accent-[var(--color-foreground)]"
              />
              Aktywny
            </label>
            <AdminSubmitButton idleLabel="Dodaj" pendingLabel="..." />
          </div>
        </form>

        {snapshot.error ? (
          <div className="rounded-[1.5rem] border border-destructive/30 bg-destructive/10 p-5 text-sm text-foreground">
            {snapshot.error}
          </div>
        ) : null}
      </section>

      {snapshot.coupons.length === 0 ? (
        <EmptyState
          badge="Kupony"
          title="Nie ma jeszcze żadnych kodów"
          description="Dodaj pierwszy kod promocyjny, np. WELCOME10. Kody statyczne nadal działają jako fallback, ale panel daje kontrolę nad aktywnością i limitami."
        />
      ) : (
        <section className="grid gap-3">
          {snapshot.coupons.map((coupon) => {
            const exhausted =
              coupon.maxRedemptions !== null &&
              coupon.redemptionCount >= coupon.maxRedemptions;
            const inactive = !coupon.isActive || exhausted;

            return (
              <article key={coupon.id} className="surface-panel space-y-4 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                        {coupon.code}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                          inactive
                            ? "bg-muted text-muted-foreground"
                            : "bg-emerald-500/10 text-emerald-500"
                        }`}
                      >
                        {inactive ? "Nieaktywny" : "Aktywny"}
                      </span>
                    </div>
                    <h3 className="text-xl text-foreground">{coupon.label}</h3>
                    <p className="text-sm text-muted-foreground">
                      Użycia: {coupon.redemptionCount}
                      {coupon.maxRedemptions
                        ? ` / ${coupon.maxRedemptions}`
                        : " / bez limitu"}{" "}
                      {coupon.expiresAt
                        ? `· wygasa ${new Date(coupon.expiresAt).toLocaleString("pl-PL")}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-background/70 px-4 py-2 text-sm font-semibold text-foreground">
                    <Percent className="size-4 text-primary" />
                    -{coupon.percentOff}%
                  </div>
                </div>

                <form
                  action={upsertCouponAction}
                  className="grid gap-3 rounded-[1.3rem] border border-border/70 bg-background/60 p-4 lg:grid-cols-[1fr_1.5fr_0.7fr_0.8fr_1fr_auto]"
                >
                  <input type="hidden" name="couponId" value={coupon.id} />
                  <Input name="code" defaultValue={coupon.code} required />
                  <Input name="label" defaultValue={coupon.label} required />
                  <Input
                    name="percentOff"
                    type="number"
                    min="1"
                    max="95"
                    defaultValue={coupon.percentOff}
                    required
                  />
                  <Input
                    name="maxRedemptions"
                    type="number"
                    min="1"
                    defaultValue={coupon.maxRedemptions ?? ""}
                    placeholder="brak"
                  />
                  <Input
                    name="expiresAt"
                    type="datetime-local"
                    defaultValue={formatDateTimeLocal(coupon.expiresAt)}
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="flex items-center gap-2 rounded-2xl border border-border/70 bg-background/70 px-3 py-2 text-sm">
                      <input
                        type="checkbox"
                        name="isActive"
                        defaultChecked={coupon.isActive}
                        className="size-4 accent-[var(--color-foreground)]"
                      />
                      Aktywny
                    </label>
                    <AdminSubmitButton idleLabel="Zapisz" pendingLabel="..." />
                  </div>
                </form>

                <form action={toggleCouponAction} className="flex justify-end">
                  <input type="hidden" name="couponId" value={coupon.id} />
                  <input
                    type="hidden"
                    name="isActive"
                    value={coupon.isActive ? "false" : "true"}
                  />
                  <Button type="submit" variant="ghost">
                    {coupon.isActive ? "Wyłącz kod" : "Włącz kod"}
                  </Button>
                </form>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
