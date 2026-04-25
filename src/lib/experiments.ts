// Lightweight A/B testing harness. Variants are sticky per browser via
// a single visitor id (cookie-survivable would be nicer, but
// localStorage avoids the privacy / consent dance and works for our
// short-lived experiments). Impressions + conversions are forwarded
// through the existing analytics provider so they show up alongside
// page_view / add_to_cart events.
//
// Add new experiments by appending to EXPERIMENTS — the type narrows
// the variants on every consumer.

export type Experiment<TVariant extends string = string> = {
  /** Stable id used as both localStorage key suffix and analytics property. */
  key: string;
  variants: readonly TVariant[];
  /** Optional human-friendly description for the admin / analytics view. */
  description?: string;
};

export const HERO_CTA_EXPERIMENT = {
  key: "hero_cta_v1",
  variants: ["browse", "free_sample", "build_better_life"] as const,
  description: "Główny CTA w hero — kontroler vs lead-magnet vs aspiracyjny",
} satisfies Experiment;

export type HeroCtaVariant = (typeof HERO_CTA_EXPERIMENT.variants)[number];

export const HERO_CTA_COPY: Record<HeroCtaVariant, string> = {
  browse: "Przeglądaj ebooki",
  free_sample: "Zacznij od bezpłatnej próbki",
  build_better_life: "Zacznij budować lepsze życie",
};

export const BUNDLE_CTA_EXPERIMENT = {
  key: "bundle_cta_v1",
  variants: ["buy", "save", "complete"] as const,
  description: "CTA pakietu — neutralny vs oszczędność vs kompletny system",
} satisfies Experiment;

export type BundleCtaVariant = (typeof BUNDLE_CTA_EXPERIMENT.variants)[number];

export const BUNDLE_CTA_COPY: Record<BundleCtaVariant, string> = {
  buy: "Kup pakiet",
  save: "Zaoszczędź na całym zestawie",
  complete: "Weź cały system",
};

const VISITOR_ID_KEY = "templify:visitor-id";
const VARIANT_PREFIX = "templify:experiment:";

function getVisitorId(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    let id = window.localStorage.getItem(VISITOR_ID_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `v_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      window.localStorage.setItem(VISITOR_ID_KEY, id);
    }
    return id;
  } catch {
    return "anon";
  }
}

function hashString(value: string): number {
  let hash = 5381;
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) + hash + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/**
 * Returns the assigned variant for the current visitor + experiment.
 * Pure function of (visitor_id, experiment.key) so the value is stable
 * across reloads without writing on every read. Forced override via
 * `?variant=<name>` query param helps QA without touching localStorage.
 */
export function pickVariant<T extends string>(
  experiment: Experiment<T>,
): T {
  if (typeof window === "undefined") return experiment.variants[0];

  const params = new URLSearchParams(window.location.search);
  const forced = params.get(`exp_${experiment.key}`) as T | null;
  if (forced && experiment.variants.includes(forced)) return forced;

  // Persisted assignment so a single visitor doesn't hop between variants
  // mid-experiment if we tweak weights or add a new variant.
  const storageKey = `${VARIANT_PREFIX}${experiment.key}`;
  try {
    const saved = window.localStorage.getItem(storageKey) as T | null;
    if (saved && experiment.variants.includes(saved)) return saved;
  } catch {
    // ignore
  }

  const id = getVisitorId();
  const idx = hashString(`${id}::${experiment.key}`) % experiment.variants.length;
  const variant = experiment.variants[idx];
  try {
    window.localStorage.setItem(storageKey, variant);
  } catch {
    // ignore
  }
  return variant;
}
