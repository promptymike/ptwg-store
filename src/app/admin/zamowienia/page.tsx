import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency, formatOrderStatus } from "@/lib/format";
import { getAdminOrdersSnapshot } from "@/lib/supabase/store";

export default async function AdminOrdersPage() {
  const adminOrders = await getAdminOrdersSnapshot();

  if (adminOrders.length === 0) {
    return (
      <EmptyState
        badge="Zamówienia"
        title="Brak zamówień do wyświetlenia"
        description="Tabela `orders` jest gotowa. Po zapisaniu pierwszych zamówień pojawią się tutaj realne rekordy."
      />
    );
  }

  return (
    <section className="surface-panel gold-frame space-y-5 p-6">
      <div className="space-y-2">
        <h2 className="text-2xl text-white">Lista zamówień</h2>
        <p className="text-sm text-muted-foreground">
          Widok pobiera dane z `orders`, `order_items` oraz `profiles`.
        </p>
      </div>

      <div className="grid gap-3">
        {adminOrders.map((order) => (
          <article
            key={order.id}
            className="rounded-[1.4rem] border border-border/70 bg-secondary/45 px-4 py-4"
          >
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-lg text-white">{order.customer}</p>
                <p className="text-sm text-muted-foreground">
                  {order.email} • {order.date}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {order.items.join(", ")}
                </p>
              </div>
              <div className="text-sm">
                <p className="text-white">{formatCurrency(order.amount)}</p>
                <p className="text-primary">{formatOrderStatus(order.status)}</p>
                <p className="text-muted-foreground">
                  {new Date(order.date).toLocaleDateString("pl-PL")} • {order.id}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
