import { EmptyState } from "@/components/shared/empty-state";
import { adminOrders } from "@/data/mock-store";
import { formatCurrency } from "@/lib/format";

export default function AdminOrdersPage() {
  if (adminOrders.length === 0) {
    return (
      <EmptyState
        badge="Zamówienia"
        title="Brak zamówień do wyświetlenia"
        description="To miejsce jest przygotowane pod tabelę z Supabase i webhookami Stripe."
      />
    );
  }

  return (
    <section className="surface-panel gold-frame space-y-5 p-6">
      <div className="space-y-2">
        <h2 className="text-2xl text-white">Lista zamówień</h2>
        <p className="text-sm text-muted-foreground">
          Placeholder danych administracyjnych pod przyszłą synchronizację płatności.
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
                <p className="text-primary">{order.status}</p>
                <p className="text-muted-foreground">{order.id}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
