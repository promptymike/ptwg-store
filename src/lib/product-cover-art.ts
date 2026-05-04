/**
 * Per-category palette for the dynamically generated product covers and
 * inside-the-book preview thumbnails. Keeps the same visual identity across:
 *   - storefront catalog cards,
 *   - product hero block,
 *   - "Zobacz wnętrze produktu" preview grid,
 *   - library tiles.
 *
 * If a product's category isn't in the map (because an admin renamed one in
 * Supabase), we fall back to the Mindset palette — neutral enough that the
 * cover never looks broken even for unexpected categories.
 */
export type CoverArt = {
  from: string;
  to: string;
  accent: string;
  text: string;
  textSecondary: string;
  icon: string;
  shape: string;
};

export const COVER_ART_BY_CATEGORY: Record<string, CoverArt> = {
  "Finanse osobiste": {
    from: "#bbf7d0",
    to: "#16a34a",
    accent: "#15803d",
    text: "#052e16",
    textSecondary: "rgba(5,46,22,0.7)",
    icon: "💰",
    shape: "rgba(255,255,255,0.55)",
  },
  "Zdrowie i dieta": {
    from: "#fecaca",
    to: "#dc2626",
    accent: "#b91c1c",
    text: "#450a0a",
    textSecondary: "rgba(69,10,10,0.7)",
    icon: "🍎",
    shape: "rgba(255,255,255,0.55)",
  },
  "Fitness i ruch": {
    from: "#fed7aa",
    to: "#ea580c",
    accent: "#c2410c",
    text: "#431407",
    textSecondary: "rgba(67,20,7,0.7)",
    icon: "💪",
    shape: "rgba(255,255,255,0.55)",
  },
  "Macierzyństwo i rodzina": {
    from: "#fbcfe8",
    to: "#db2777",
    accent: "#be185d",
    text: "#500724",
    textSecondary: "rgba(80,7,36,0.7)",
    icon: "👶",
    shape: "rgba(255,255,255,0.55)",
  },
  "Produktywność i czas": {
    from: "#bfdbfe",
    to: "#2563eb",
    accent: "#1d4ed8",
    text: "#0c1f4d",
    textSecondary: "rgba(12,31,77,0.7)",
    icon: "⏰",
    shape: "rgba(255,255,255,0.55)",
  },
  "Mindset i rozwój osobisty": {
    from: "#ddd6fe",
    to: "#7c3aed",
    accent: "#6d28d9",
    text: "#2e1065",
    textSecondary: "rgba(46,16,101,0.7)",
    icon: "🌱",
    shape: "rgba(255,255,255,0.55)",
  },
  "Praca i kariera": {
    from: "#fde68a",
    to: "#f59e0b",
    accent: "#b45309",
    text: "#451a03",
    textSecondary: "rgba(69,26,3,0.7)",
    icon: "💼",
    shape: "rgba(255,255,255,0.55)",
  },
  "Podróże i lifestyle": {
    from: "#a7f3d0",
    to: "#059669",
    accent: "#047857",
    text: "#022c22",
    textSecondary: "rgba(2,44,34,0.7)",
    icon: "✈️",
    shape: "rgba(255,255,255,0.55)",
  },
};

const FALLBACK: CoverArt = COVER_ART_BY_CATEGORY["Mindset i rozwój osobisty"];

export function getCoverArt(category: string | null | undefined): CoverArt {
  if (!category) return FALLBACK;
  return COVER_ART_BY_CATEGORY[category] ?? FALLBACK;
}

/**
 * Title font sizes are hand-tuned because Satori (the engine behind
 * `next/og` ImageResponse) does NOT shrink text to fit — long titles will
 * just overflow the card unless we step the font down ourselves.
 */
export function getTitleFontSize(title: string): number {
  const len = title.length;
  if (len <= 18) return 96;
  if (len <= 28) return 78;
  if (len <= 42) return 64;
  if (len <= 60) return 52;
  return 44;
}

export const PREVIEW_LABELS = [
  "Spis treści",
  "Przykładowa strona",
  "Workbook / planer",
] as const;
