import Link from "next/link";
import { Plus } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { getBundlesSnapshot } from "@/lib/supabase/store";

export default async function AdminBundlesPage() {
  const bundles = await getBundlesSnapshot();

  return (
    <div className="space-y-6">
      <div className="surface-panel space-y-4 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl text-foreground">Pakiety</h2>
            <p className="text-sm text-muted-foreground">
              Każdy pakiet to wybrane produkty sprzedawane razem za jedną
              ceną. Po zakupie wszystkie produkty z pakietu trafiają do
              biblioteki kupującego.
            </p>
          </div>
          <Button render={<Link href="/admin/pakiety/nowy" />}>
            <Plus className="size-4" />
            Nowy pakiet
          </Button>
        </div>
      </div>

      {bundles.length === 0 ? (
        <EmptyState
          badge="Pakiety"
          title="Nie masz jeszcze żadnego pakietu"
          description="Pakiet to świetny sposób, żeby podnieść AOV o 30-50%. Zacznij od jednego pakietu po niższej cenie niż suma — daj klientom oczywisty wybór."
          action={{ href: "/admin/pakiety/nowy", label: "Dodaj pierwszy pakiet" }}
        />
      ) : (
        <div className="grid gap-3">
          {bundles.map((bundle) => (
            <Link
              key={bundle.id}
              href={`/admin/pakiety/${bundle.slug}`}
              className="surface-panel flex flex-col gap-3 p-5 transition hover:border-primary/30 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 space-y-1">
                <p className="text-base font-semibold text-foreground">
                  {bundle.name}
                </p>
                <p className="text-xs uppercase tracking-[0.18em] text-primary/75">
                  /pakiet/{bundle.slug}
                </p>
                <p className="line-clamp-2 break-words text-sm text-muted-foreground">
                  {bundle.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  Produkty: {bundle.products.map((p) => p.name).join(", ")}
                </p>
              </div>
              <div className="shrink-0 text-right text-sm">
                <p className="text-lg font-semibold text-foreground">
                  {formatCurrency(bundle.price)}
                </p>
                {bundle.compareAtPrice && bundle.compareAtPrice > bundle.price ? (
                  <p className="text-xs text-muted-foreground line-through">
                    {formatCurrency(bundle.compareAtPrice)}
                  </p>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
