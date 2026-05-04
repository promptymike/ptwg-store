/**
 * Per-category palette for the dynamically generated product covers and
 * inside-the-book preview thumbnails. Keeps the same visual identity across:
 *   - storefront catalog cards,
 *   - product hero block,
 *   - "Zobacz wnętrze produktu" preview grid,
 *   - library tiles.
 *
 * Tones are intentionally muted/pastel to match the hand-tuned palettes the
 * brand already uses for real (admin-uploaded) covers — saturated Tailwind
 * 200→600 gradients clash with the rest of the storefront aesthetic.
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
    from: "#f7faec",
    to: "#c8dca6",
    accent: "#5b7837",
    text: "#1f2a10",
    textSecondary: "rgba(31,42,16,0.6)",
    icon: "💰",
    shape: "rgba(255,255,255,0.45)",
  },
  "Zdrowie i dieta": {
    from: "#fdf0ec",
    to: "#e3c6bd",
    accent: "#9a4f3f",
    text: "#3b1410",
    textSecondary: "rgba(59,20,16,0.6)",
    icon: "🍎",
    shape: "rgba(255,255,255,0.45)",
  },
  "Fitness i ruch": {
    from: "#f4f6ee",
    to: "#bccfa6",
    accent: "#5f7a3d",
    text: "#22301a",
    textSecondary: "rgba(34,48,26,0.6)",
    icon: "💪",
    shape: "rgba(255,255,255,0.45)",
  },
  "Macierzyństwo i rodzina": {
    from: "#fbf1ee",
    to: "#dcc2b9",
    accent: "#955b54",
    text: "#36161a",
    textSecondary: "rgba(54,22,26,0.6)",
    icon: "👶",
    shape: "rgba(255,255,255,0.45)",
  },
  "Produktywność i czas": {
    from: "#f3f0fa",
    to: "#c5bcec",
    accent: "#5f4fa1",
    text: "#1d1844",
    textSecondary: "rgba(29,24,68,0.6)",
    icon: "⏰",
    shape: "rgba(255,255,255,0.45)",
  },
  "Mindset i rozwój osobisty": {
    from: "#fbf5ea",
    to: "#e4c58d",
    accent: "#8a6321",
    text: "#2a1d05",
    textSecondary: "rgba(42,29,5,0.6)",
    icon: "🌱",
    shape: "rgba(255,255,255,0.45)",
  },
  "Praca i kariera": {
    from: "#eef4f6",
    to: "#a4c5cf",
    accent: "#3d6975",
    text: "#0f2026",
    textSecondary: "rgba(15,32,38,0.6)",
    icon: "💼",
    shape: "rgba(255,255,255,0.45)",
  },
  "Podróże i lifestyle": {
    from: "#ecf6f0",
    to: "#95cba9",
    accent: "#3a6b4c",
    text: "#0f2418",
    textSecondary: "rgba(15,36,24,0.6)",
    icon: "✈️",
    shape: "rgba(255,255,255,0.45)",
  },
};

const FALLBACK: CoverArt = COVER_ART_BY_CATEGORY["Mindset i rozwój osobisty"];

export function getCoverArt(category: string | null | undefined): CoverArt {
  if (!category) return FALLBACK;
  return COVER_ART_BY_CATEGORY[category] ?? FALLBACK;
}

export const PREVIEW_LABELS = [
  "Spis treści",
  "Przykładowa strona",
  "Workbook / planer",
] as const;
