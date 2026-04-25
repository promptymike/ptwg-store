import { TrendingUp } from "lucide-react";

import { formatCurrency } from "@/lib/format";
import type {
  RevenuePoint,
  TopProductRow,
} from "@/lib/supabase/store";

type AdminTrendsProps = {
  daily: RevenuePoint[];
  topProducts: TopProductRow[];
};

const CHART_WIDTH = 720;
const CHART_HEIGHT = 180;
const CHART_PAD = 12;

function buildPath(values: number[], maxValue: number): string {
  if (values.length === 0) return "";
  const range = Math.max(maxValue, 1);
  const innerWidth = CHART_WIDTH - CHART_PAD * 2;
  const innerHeight = CHART_HEIGHT - CHART_PAD * 2;
  const stepX = values.length > 1 ? innerWidth / (values.length - 1) : 0;
  return values
    .map((value, idx) => {
      const x = CHART_PAD + idx * stepX;
      const y = CHART_PAD + innerHeight - (value / range) * innerHeight;
      return `${idx === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function buildAreaPath(values: number[], maxValue: number): string {
  const line = buildPath(values, maxValue);
  if (!line) return "";
  const lastX = CHART_PAD + (CHART_WIDTH - CHART_PAD * 2);
  const baseY = CHART_HEIGHT - CHART_PAD;
  return `${line} L${lastX.toFixed(1)},${baseY.toFixed(1)} L${CHART_PAD.toFixed(1)},${baseY.toFixed(1)} Z`;
}

export function AdminTrends({ daily, topProducts }: AdminTrendsProps) {
  const revenueValues = daily.map((d) => d.revenue);
  const orderValues = daily.map((d) => d.orders);
  const totalRevenue = revenueValues.reduce((sum, v) => sum + v, 0);
  const totalOrders = orderValues.reduce((sum, v) => sum + v, 0);
  const peakRevenue = Math.max(...revenueValues, 1);
  const recentDate = daily[daily.length - 1]?.date;
  const earliestDate = daily[0]?.date;

  return (
    <section className="space-y-4">
      <div className="surface-panel space-y-4 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.22em] text-primary/75">
              Sprzedaż — ostatnie {daily.length} dni
            </p>
            <h2 className="text-2xl text-foreground">
              {formatCurrency(totalRevenue)}{" "}
              <span className="text-base font-normal text-muted-foreground">
                · {totalOrders} {totalOrders === 1 ? "zamówienie" : "zamówień"}
              </span>
            </h2>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-border/70 bg-background/60 px-3 py-1.5 text-xs text-muted-foreground">
            <TrendingUp className="size-3.5 text-primary" />
            {earliestDate} → {recentDate}
          </div>
        </div>

        {totalRevenue === 0 ? (
          <p className="rounded-2xl border border-border/70 bg-background/60 p-4 text-sm text-muted-foreground">
            W ostatnich {daily.length} dniach jeszcze nie ma zamówień. Wykres pojawi się od razu po pierwszym zakupie.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <svg
              viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
              role="img"
              aria-label="Przychód w ostatnich dniach"
              className="w-full"
            >
              <defs>
                <linearGradient id="revenueArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(226,188,114,0.45)" />
                  <stop offset="100%" stopColor="rgba(226,188,114,0)" />
                </linearGradient>
              </defs>
              {/* Y-axis baseline */}
              <line
                x1={CHART_PAD}
                x2={CHART_WIDTH - CHART_PAD}
                y1={CHART_HEIGHT - CHART_PAD}
                y2={CHART_HEIGHT - CHART_PAD}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth={1}
              />
              <path d={buildAreaPath(revenueValues, peakRevenue)} fill="url(#revenueArea)" />
              <path
                d={buildPath(revenueValues, peakRevenue)}
                fill="none"
                stroke="#e2bc72"
                strokeWidth={2.5}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
          </div>
        )}
      </div>

      <div className="surface-panel space-y-4 p-6">
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.22em] text-primary/75">
            Top produkty
          </p>
          <h2 className="text-2xl text-foreground">
            Najlepiej sprzedające się
          </h2>
        </div>

        {topProducts.length === 0 ? (
          <p className="rounded-2xl border border-border/70 bg-background/60 p-4 text-sm text-muted-foreground">
            Po pierwszych zakupach pojawi się tu ranking produktów.
          </p>
        ) : (
          <ul className="space-y-2">
            {topProducts.map((product, idx) => {
              const max = topProducts[0].revenue || 1;
              const percent = (product.revenue / max) * 100;
              return (
                <li
                  key={product.productId}
                  className="rounded-2xl border border-border/70 bg-background/60 p-4"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="break-words text-sm font-semibold text-foreground">
                      {idx + 1}. {product.name}
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-foreground tabular-nums">
                      {formatCurrency(product.revenue)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border/40">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {product.unitsSold} szt.
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
