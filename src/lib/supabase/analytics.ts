import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/server";

export type ExperimentVariantStats = {
  variant: string;
  impressions: number;
  uniqueImpressionVisitors: number;
  clicks: number;
  uniqueClickVisitors: number;
  /** clicks ÷ impressions, 0 when no impressions yet. */
  clickThroughRate: number;
  /** unique clicker / unique impression visitor — more reliable for low traffic. */
  visitorClickRate: number;
};

export type ExperimentSummary = {
  key: string;
  totalImpressions: number;
  totalClicks: number;
  variants: ExperimentVariantStats[];
};

type EventRow = {
  visitor_id: string;
  surface: string | null;
  variant: string | null;
};

export async function getExperimentSummaries(): Promise<ExperimentSummary[]> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("analytics_events")
    .select("visitor_id, experiment_key, variant, surface")
    .not("experiment_key", "is", null)
    .gte(
      "created_at",
      new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    )
    .limit(50_000);

  if (error || !data) return [];

  type Row = {
    visitor_id: string;
    experiment_key: string | null;
    variant: string | null;
    surface: string | null;
  };

  const byExperiment = new Map<string, Map<string, EventRow[]>>();
  for (const row of data as Row[]) {
    if (!row.experiment_key || !row.variant) continue;
    let map = byExperiment.get(row.experiment_key);
    if (!map) {
      map = new Map();
      byExperiment.set(row.experiment_key, map);
    }
    let bucket = map.get(row.variant);
    if (!bucket) {
      bucket = [];
      map.set(row.variant, bucket);
    }
    bucket.push({
      visitor_id: row.visitor_id,
      surface: row.surface,
      variant: row.variant,
    });
  }

  const summaries: ExperimentSummary[] = [];

  for (const [experimentKey, variantMap] of byExperiment) {
    const variants: ExperimentVariantStats[] = [];
    let totalImpressions = 0;
    let totalClicks = 0;

    for (const [variant, events] of variantMap) {
      const impressionEvents = events.filter((e) => isImpression(e.surface));
      const clickEvents = events.filter((e) => isClick(e.surface));
      const impressions = impressionEvents.length;
      const clicks = clickEvents.length;
      const uniqueImpressionVisitors = new Set(
        impressionEvents.map((e) => e.visitor_id),
      ).size;
      const uniqueClickVisitors = new Set(
        clickEvents.map((e) => e.visitor_id),
      ).size;
      totalImpressions += impressions;
      totalClicks += clicks;
      variants.push({
        variant,
        impressions,
        uniqueImpressionVisitors,
        clicks,
        uniqueClickVisitors,
        clickThroughRate: impressions > 0 ? clicks / impressions : 0,
        visitorClickRate:
          uniqueImpressionVisitors > 0
            ? uniqueClickVisitors / uniqueImpressionVisitors
            : 0,
      });
    }

    variants.sort((a, b) => a.variant.localeCompare(b.variant));
    summaries.push({
      key: experimentKey,
      totalImpressions,
      totalClicks,
      variants,
    });
  }

  return summaries.sort((a, b) => a.key.localeCompare(b.key));
}

function isImpression(surface: string | null) {
  return Boolean(surface && /impression$/i.test(surface));
}

function isClick(surface: string | null) {
  return Boolean(surface && /click$/i.test(surface));
}
