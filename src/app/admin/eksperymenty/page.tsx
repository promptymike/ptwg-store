import { Activity, Sparkles } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { getExperimentSummaries } from "@/lib/supabase/analytics";

function formatPercent(value: number) {
  if (!Number.isFinite(value) || value === 0) return "0%";
  return `${(value * 100).toFixed(1)}%`;
}

export default async function AdminExperimentsPage() {
  const experiments = await getExperimentSummaries();

  return (
    <div className="space-y-6">
      <div className="surface-panel space-y-3 p-6">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="size-4" />
          </span>
          <div>
            <h2 className="text-2xl text-foreground">A/B testy</h2>
            <p className="text-sm text-muted-foreground">
              Zliczamy impressions ({"surface kończy się na"} <code>impression</code>)
              i kliknięcia ({"surface"} <code>click</code>) per eksperyment × variant.
              Dane z ostatnich 60 dni.
            </p>
          </div>
        </div>
      </div>

      {experiments.length === 0 ? (
        <EmptyState
          icon={Activity}
          badge="Brak danych"
          title="Jeszcze nikt nie zobaczył żadnego eksperymentu"
          description="Eksperymenty pojawią się tu po pierwszych odsłonach. Zaloguj się anonimowo i zerknij na home — variant pierwszego CTA przypisuje się automatycznie."
        />
      ) : (
        <div className="space-y-6">
          {experiments.map((experiment) => {
            const totalUniqueImpressions = experiment.variants.reduce(
              (sum, v) => sum + v.uniqueImpressionVisitors,
              0,
            );
            const winner =
              experiment.variants.length > 1
                ? experiment.variants.reduce((best, current) =>
                    current.visitorClickRate > best.visitorClickRate ? current : best,
                  )
                : null;

            return (
              <section
                key={experiment.key}
                className="surface-panel space-y-4 p-6"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-primary/75">
                      Eksperyment
                    </p>
                    <h3 className="mt-1 break-all text-xl font-semibold text-foreground">
                      {experiment.key}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span>
                      <span className="font-semibold text-foreground tabular-nums">
                        {experiment.totalImpressions}
                      </span>{" "}
                      impressions
                    </span>
                    <span>
                      <span className="font-semibold text-foreground tabular-nums">
                        {experiment.totalClicks}
                      </span>{" "}
                      kliknięć
                    </span>
                    <span>
                      <span className="font-semibold text-foreground tabular-nums">
                        {totalUniqueImpressions}
                      </span>{" "}
                      unikalnych visitorów
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-background/60 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3 text-left">Variant</th>
                        <th className="px-4 py-3 text-right">Impressions</th>
                        <th className="px-4 py-3 text-right">Unikalni</th>
                        <th className="px-4 py-3 text-right">Kliknięcia</th>
                        <th className="px-4 py-3 text-right">CTR</th>
                        <th className="px-4 py-3 text-right">Visitor CR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {experiment.variants.map((variant) => {
                        const isWinner =
                          winner &&
                          variant.variant === winner.variant &&
                          variant.uniqueImpressionVisitors > 5;
                        return (
                          <tr
                            key={variant.variant}
                            className="border-t border-border/60"
                          >
                            <td className="break-all px-4 py-3 text-foreground">
                              <span className="font-medium">
                                {variant.variant}
                              </span>
                              {isWinner ? (
                                <span className="ml-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400">
                                  Lider
                                </span>
                              ) : null}
                            </td>
                            <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                              {variant.impressions}
                            </td>
                            <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                              {variant.uniqueImpressionVisitors}
                            </td>
                            <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                              {variant.clicks}
                            </td>
                            <td className="px-4 py-3 text-right tabular-nums text-foreground">
                              {formatPercent(variant.clickThroughRate)}
                            </td>
                            <td className="px-4 py-3 text-right tabular-nums text-foreground">
                              {formatPercent(variant.visitorClickRate)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <p className="text-xs text-muted-foreground">
                  CTR = kliknięcia ÷ impressions (powtórki tego samego visitora liczone).
                  Visitor CR = unikalni klikający ÷ unikalni visitorzy
                  (mocniejszy sygnał na małych próbkach). &bdquo;Lider&rdquo; pojawia się
                  dopiero po 6+ unikalnych odsłonach.
                </p>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
