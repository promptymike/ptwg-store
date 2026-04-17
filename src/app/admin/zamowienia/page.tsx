import { AdminStatusNotice } from "@/components/admin/admin-status-notice";
import { EmptyState } from "@/components/shared/empty-state";
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
          description="Widok jest już podpięty pod prawdziwe tabele `orders`, `order_items` i `profiles`, ale Supabase zwrócił błąd."
        />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        badge="Zamówienia"
        title="Brak zamówień do wyświetlenia"
        description="Tabela `orders` jest gotowa. Po zapisaniu pierwszych zamówień pojawią się tutaj realne rekordy wraz z pozycjami koszyka."
      />
    );
  }

  return (
    <div className="space-y-6">
      <AdminStatusNotice type={error ? "error" : undefined} message={error ?? undefined} />

      <section className="surface-panel gold-frame space-y-5 p-6">
        <div className="space-y-2">
          <h2 className="text-2xl text-white">Lista zamówień</h2>
          <p className="text-sm text-muted-foreground">
            Widok pobiera dane z `orders`, `order_items` oraz `profiles`.
          </p>
        </div>

        <div className="grid gap-3">
          {orders.map((order) => (
            <article
              key={order.id}
              className="rounded-[1.4rem] border border-border/70 bg-secondary/45 px-4 py-4"
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="space-y-2">
                  <div>
                    <p className="text-lg text-white">{order.customer}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.email} • {new Date(order.date).toLocaleDateString("pl-PL")}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {order.items.length > 0
                      ? order.items.join(", ")
                      : "Brak pozycji przypisanych do zamówienia."}
                  </p>
                </div>

                <div className="text-sm xl:text-right">
                  <p className="text-white">{formatCurrency(order.amount)}</p>
                  <p className="text-primary">{formatOrderStatus(order.status)}</p>
                  <p className="text-muted-foreground">{order.id}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
