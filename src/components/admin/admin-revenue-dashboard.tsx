import Link from "next/link";
import {
  BarChart3,
  CircleDollarSign,
  MousePointerClick,
  Receipt,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";

import { formatCurrency } from "@/lib/format";
import type { AdminRevenueSnapshot } from "@/lib/supabase/store";

type AdminRevenueDashboardProps = {
  snapshot: AdminRevenueSnapshot;
};

function formatPercent(value: number | null) {
  if (value === null || !Number.isFinite(value)) return "Brak danych";
  return `${new Intl.NumberFormat("pl-PL", {
    maximumFractionDigits: 1,
  }).format(value * 100)}%`;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("pl-PL").format(value);
}

export function AdminRevenueDashboard({ snapshot }: AdminRevenueDashboardProps) {
  const cards = [
    {
      label: "Przychód",
      value: formatCurrency(snapshot.totalRevenue),
      detail: `Ostatnie ${snapshot.days} dni`,
      Icon: CircleDollarSign,
    },
    {
      label: "Zamówienia",
      value: formatNumber(snapshot.orderCount),
      detail: `${formatNumber(snapshot.purchaseCount)} kupionych pozycji`,
      Icon: Receipt,
    },
    {
      label: "AOV",
      value: formatCurrency(snapshot.aov),
      detail: "Średnia wartość zamówienia",
      Icon: ShoppingBag,
    },
    {
      label: "Refund rate",
      value: formatPercent(snapshot.refundRate),
      detail: `${formatNumber(snapshot.refundCount)} refundów`,
      Icon: TrendingUp,
    },
  ];

  const maxFunnelVisitors = Math.max(
    ...snapshot.funnel.map((metric) => metric.uniqueVisitors),
    1,
  );

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.22em] text-primary/75">
            Revenue dashboard
          </p>
          <h2 className="text-2xl text-foreground">
            Sprzedaż, konwersja i atrybucja
          </h2>
        </div>
        <span className="rounded-full border border-border/70 bg-background/60 px-3 py-1.5 text-xs text-muted-foreground">
          Dane z orders + consent-aware analytics
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.Icon;
          return (
            <div key={card.label} className="surface-panel p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </span>
                <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {card.label}
                </span>
              </div>
              <p className="mt-4 text-3xl font-semibold text-foreground tabular-nums">
                {card.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{card.detail}</p>
            </div>
          );
        })}
      </div>

      {snapshot.notes.length > 0 ? (
        <div className="rounded-[1.2rem] border border-amber-500/25 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-100">
          {snapshot.notes.join(" ")}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="surface-panel space-y-4 p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-primary/75">
                Lejek
              </p>
              <h3 className="text-xl text-foreground">
                page_view {"->"} purchase
              </h3>
            </div>
            <BarChart3 className="size-5 text-primary" />
          </div>

          {snapshot.analyticsAvailable ? (
            <div className="space-y-3">
              {snapshot.funnel.map((metric) => {
                const width = (metric.uniqueVisitors / maxFunnelVisitors) * 100;
                return (
                  <div key={metric.eventName} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-foreground">{metric.label}</span>
                      <span className="text-muted-foreground tabular-nums">
                        {formatNumber(metric.uniqueVisitors)} users /{" "}
                        {formatNumber(metric.events)} events
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-border/40">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary/55 to-primary"
                        style={{ width: `${Math.max(width, 4)}%` }}
                      />
                    </div>
                    <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                      Konwersja z poprzedniego kroku:{" "}
                      {formatPercent(metric.conversionFromPrevious)}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="rounded-2xl border border-border/70 bg-background/60 p-4 text-sm text-muted-foreground">
              Brak tabeli lub danych analytics_events. Po uruchomieniu migracji i
              pierwszych zgodach analytics lejek zacznie się wypełniać.
            </p>
          )}
        </div>

        <div className="surface-panel space-y-4 p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-primary/75">
                Top produkty
              </p>
              <h3 className="text-xl text-foreground">Przychód po produkcie</h3>
            </div>
            <MousePointerClick className="size-5 text-primary" />
          </div>

          {snapshot.topProducts.length === 0 ? (
            <p className="rounded-2xl border border-border/70 bg-background/60 p-4 text-sm text-muted-foreground">
              Ranking pojawi się po pierwszych zamówieniach.
            </p>
          ) : (
            <ul className="space-y-2">
              {snapshot.topProducts.map((product, idx) => (
                <li
                  key={product.productId}
                  className="rounded-2xl border border-border/70 bg-background/60 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words text-sm font-semibold text-foreground">
                        {idx + 1}. {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatNumber(product.unitsSold)} szt. {" / "}
                        {formatNumber(product.views)} widoków {" / "} CVR{" "}
                        {formatPercent(product.conversionRate)}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-foreground tabular-nums">
                      {formatCurrency(product.revenue)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="surface-panel space-y-4 p-6">
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.22em] text-primary/75">
              Widoki bez zakupów
            </p>
            <h3 className="text-xl text-foreground">Produkty do poprawy</h3>
          </div>

          {snapshot.productsWithViewsNoPurchases.length === 0 ? (
            <p className="rounded-2xl border border-border/70 bg-background/60 p-4 text-sm text-muted-foreground">
              Brak sygnału albo produkty z widokami już konwertują. Ta sekcja
              wymaga eventów view_product i purchase.
            </p>
          ) : (
            <ul className="space-y-2">
              {snapshot.productsWithViewsNoPurchases.map((product) => (
                <li
                  key={product.productId}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background/60 p-4"
                >
                  <div className="min-w-0">
                    <p className="break-words text-sm font-semibold text-foreground">
                      {product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatNumber(product.views)} widoków {" / "}
                      {formatNumber(product.addToCart)} dodań do koszyka
                    </p>
                  </div>
                  {product.slug ? (
                    <Link
                      href={`/produkty/${product.slug}`}
                      className="shrink-0 text-xs font-semibold text-primary"
                    >
                      Otwórz
                    </Link>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="surface-panel space-y-4 p-6">
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.22em] text-primary/75">
              Kampanie
            </p>
            <h3 className="text-xl text-foreground">Przychód po source / campaign</h3>
          </div>

          {snapshot.revenueByCampaign.length === 0 ? (
            <p className="rounded-2xl border border-border/70 bg-background/60 p-4 text-sm text-muted-foreground">
              Brak zapisanych UTM/referrer na zamówieniach. Dodaj parametry UTM
              do linków kampanii i uruchom migrację attribution.
            </p>
          ) : (
            <ul className="space-y-2">
              {snapshot.revenueByCampaign.map((campaign) => (
                <li
                  key={`${campaign.source}-${campaign.medium ?? ""}-${campaign.campaign ?? ""}`}
                  className="rounded-2xl border border-border/70 bg-background/60 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words text-sm font-semibold text-foreground">
                        {campaign.source}
                        {campaign.campaign ? ` / ${campaign.campaign}` : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {campaign.medium ?? "medium: brak"} {" / "}
                        {formatNumber(campaign.orders)} zam. {" / "} AOV{" "}
                        {formatCurrency(campaign.aov)}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-foreground tabular-nums">
                      {formatCurrency(campaign.revenue)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
