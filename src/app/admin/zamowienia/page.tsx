import Link from "next/link";
import { Download } from "lucide-react";

import { AdminRefundButton } from "@/components/admin/admin-refund-button";
import { AdminStatusNotice } from "@/components/admin/admin-status-notice";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatOrderStatus } from "@/lib/format";
import { getAdminOrdersSnapshot } from "@/lib/supabase/store";

export default async function AdminOrdersPage() {
  const { orders, error } = await getAdminOrdersSnapshot();

  if (error && orders.length === 0) {
    return (
      <div className="space-y-6">
        <AdminStatusNotice type="error" message={error} />
        <EmptyState
          badge="Zamówienia"
          title="Nie udało się pobrać listy zamówień"
          description="Widok korzysta z tabel `orders`, `order_items` i `profiles`, ale Supabase zwrócił błąd."
        />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        badge="Zamówienia"
        title="Brak zamówień do wyświetlenia"
        description="Po pierwszych checkoutach Stripe pojawią się tutaj realne rekordy wraz z pozycjami koszyka."
      />
    );
  }

  return (
    <div className="space-y-6">
      <AdminStatusNotice type={error ? "error" : undefined} message={error ?? undefined} />

      <section className="surface-panel space-y-5 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl text-foreground">Zamówienia</h2>
            <p className="text-sm text-muted-foreground">
              Realne dane po Stripe Checkout i fulfillment do biblioteki użytkownika.
            </p>
          </div>
          <Button render={<Link href="/api/admin/orders/export" />}>
            <Download className="size-4" />
            Eksport CSV
          </Button>
        </div>

        <div className="grid gap-3">
          {orders.map((order) => (
            <article
              key={order.id}
              className="rounded-[1.4rem] border border-border/70 bg-background/60 px-4 py-4"
            >
              <div className="flex min-w-0 flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0 space-y-2">
                  <div className="min-w-0">
                    <p className="break-words text-lg text-foreground">
                      {order.customer}
                    </p>
                    <p className="break-words text-sm text-muted-foreground [overflow-wrap:anywhere]">
                      {order.email} • {new Date(order.date).toLocaleDateString("pl-PL")}
                    </p>
                  </div>
                  <p className="line-clamp-2 break-words text-sm text-muted-foreground [overflow-wrap:anywhere]">
                    {order.items.length > 0
                      ? order.items.join(", ")
                      : "Brak pozycji przypisanych do zamówienia."}
                  </p>
                </div>

                <div className="flex min-w-0 shrink-0 flex-col gap-2 text-sm xl:items-end xl:text-right">
                  <p className="text-foreground">{formatCurrency(order.amount)}</p>
                  <p className="text-primary">{formatOrderStatus(order.status)}</p>
                  <p className="break-all text-muted-foreground">{order.id}</p>
                  <AdminRefundButton
                    orderId={order.id}
                    total={order.amount}
                    alreadyRefunded={order.status === "refunded"}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
