export type PlannerAudience = "Życie i dom" | "Firma i zespół";

export type PlannerPreviewStat = {
  /** Small uppercase label in the mock dashboard tile, e.g. "Budżet". */
  label: string;
  /** Big value in the tile, e.g. "82%" or "4/6". Keep it short. */
  value: string;
  /** Progress bar fill 0-100. */
  progress: number;
};

export type InteractivePlanner = {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  audience: PlannerAudience;
  category: string;
  price: number;
  tagline: string;
  description: string;
  promise: string;
  features: string[];
  accent: string;
  glow: string;
  /** Domain-flavoured numbers for the mock preview tile, so the grid of
      cards doesn't repeat the same "84%" placeholder nine times. */
  previewStat: PlannerPreviewStat;
  /** Real screenshot of the template (public path) used as card thumbnail.
      Regenerate with: node scripts/screenshot-planner-thumbs.mjs */
  thumbnail?: string;
  driveFileId: string;
  sourceFile: string;
};

export const interactivePlanners: InteractivePlanner[] = [
  {
    id: "a1100001-2026-4000-8000-000000000001",
    slug: "planer-finansow",
    name: "Planer Finansów",
    shortName: "Finanse",
    audience: "Życie i dom",
    category: "Finanse osobiste",
    price: 69,
    tagline: "Wszystkie pieniądze pod kontrolą — bez Excela.",
    description: "Budżet, wydatki, cele i zobowiązania w jednym przejrzystym panelu, który zawsze masz przy sobie.",
    promise: "Wiesz dokładnie, gdzie uciekają pieniądze i co możesz zrobić dalej.",
    features: ["Budżet miesięczny", "Kategorie wydatków", "Cele oszczędnościowe", "Raporty i podsumowania"],
    accent: "from-emerald-400 via-teal-500 to-slate-950",
    glow: "bg-emerald-400",
    previewStat: { label: "Budżet", value: "82%", progress: 82 },
    thumbnail: "/planery-thumbs/planer-finansow.jpg",
    driveFileId: "1c5cg9tTD3Ggt8soDHGKPjAb_-7HFEGiJ",
    sourceFile: "planer-finansow.html",
  },
  {
    id: "a1100002-2026-4000-8000-000000000002",
    slug: "adhd-flow",
    name: "ADHD Flow",
    shortName: "ADHD Flow",
    audience: "Życie i dom",
    category: "Produktywność",
    price: 69,
    tagline: "Plan dnia, który współpracuje z Twoim mózgiem.",
    description: "Lekki planer koncentracji, energii i zadań stworzony dla osób, którym klasyczne listy rzeczy do zrobienia po prostu nie służą.",
    promise: "Mniej przeciążenia, więcej spokojnie domkniętych spraw.",
    features: ["Planowanie energią", "Focus timer", "Brain dump", "Łagodne priorytety"],
    accent: "from-violet-400 via-fuchsia-500 to-indigo-950",
    glow: "bg-violet-400",
    previewStat: { label: "Fokus dziś", value: "3/5", progress: 60 },
    thumbnail: "/planery-thumbs/adhd-flow.jpg",
    driveFileId: "1YuhDtpya6JJr5nvqay6FVE9rwiT0FnOU",
    sourceFile: "adhd-flow.html",
  },
  {
    id: "a1100003-2026-4000-8000-000000000003",
    slug: "planer-rodzinny",
    name: "Planer Rodzinny",
    shortName: "Rodzina",
    audience: "Życie i dom",
    category: "Rodzina",
    price: 69,
    tagline: "Jedno miejsce dla całej rodzinnej logistyki.",
    description: "Kalendarz, szkoła, zajęcia, obowiązki, kontakty i ważne sprawy domowe bez karteczek na lodówce.",
    promise: "Każdy wie, co się dzieje — zanim zacznie się poranny chaos.",
    features: ["Kalendarz rodzinny", "Plan lekcji", "Obowiązki", "Ważne kontakty"],
    accent: "from-sky-300 via-blue-500 to-indigo-950",
    glow: "bg-sky-400",
    previewStat: { label: "Tydzień", value: "9/12", progress: 75 },
    thumbnail: "/planery-thumbs/planer-rodzinny.jpg",
    driveFileId: "1I3n4JexZCBpDAt78bE9C94EFcXWr6ofZ",
    sourceFile: "planer-rodzinny.html",
  },
  {
    id: "a1100004-2026-4000-8000-000000000004",
    slug: "mealmind",
    name: "MealMind",
    shortName: "Posiłki",
    audience: "Życie i dom",
    category: "Zdrowie i dieta",
    price: 69,
    tagline: "Plan posiłków, lista zakupów i spokój na cały tydzień.",
    description: "Zaplanuj menu, wykorzystaj to, co już masz, i przestań codziennie odpowiadać na pytanie: co dziś jemy?",
    promise: "Mniej marnowania jedzenia i mniej przypadkowych zakupów.",
    features: ["Menu tygodniowe", "Lista zakupów", "Spiżarnia", "Pomysły na posiłki"],
    accent: "from-lime-300 via-emerald-500 to-green-950",
    glow: "bg-lime-400",
    previewStat: { label: "Menu", value: "6/7", progress: 86 },
    thumbnail: "/planery-thumbs/mealmind.jpg",
    driveFileId: "1MRpaRtFvQ4SpVnLHCJCh0HhTNopAqy8d",
    sourceFile: "mealmind.html",
  },
  {
    id: "a1100005-2026-4000-8000-000000000005",
    slug: "planer-podrozy",
    name: "Planer Podróży",
    shortName: "Podróże",
    audience: "Życie i dom",
    category: "Podróże",
    price: 69,
    tagline: "Cała podróż od pomysłu do powrotu w jednym miejscu.",
    description: "Trasy, rezerwacje, budżet, atrakcje i pakowanie — uporządkowane i dostępne z telefonu także w drodze.",
    promise: "Podróżujesz z planem, ale bez planistycznego stresu.",
    features: ["Plan trasy", "Budżet wyjazdu", "Rezerwacje", "Lista pakowania"],
    accent: "from-cyan-300 via-sky-500 to-blue-950",
    glow: "bg-cyan-400",
    previewStat: { label: "Plan wyjazdu", value: "71%", progress: 71 },
    thumbnail: "/planery-thumbs/planer-podrozy.jpg",
    driveFileId: "1lBRHe4NuuekggLT55_pYB6PWfT90bJLh",
    sourceFile: "planer-podrozy.html",
  },
  {
    id: "a1100006-2026-4000-8000-000000000006",
    slug: "planer-uroczystosci",
    name: "Planer Uroczystości",
    shortName: "Uroczystości",
    audience: "Życie i dom",
    category: "Wydarzenia",
    price: 79,
    tagline: "Budżet, goście i harmonogram bez organizacyjnego chaosu.",
    description: "Kompletny system do planowania wesela, urodzin, komunii, konferencji i każdej większej uroczystości.",
    promise: "Masz kontrolę nad detalami i nadal cieszysz się wydarzeniem.",
    features: ["Lista gości", "Budżet", "Dostawcy", "Harmonogram wydarzenia"],
    accent: "from-rose-300 via-pink-500 to-rose-950",
    glow: "bg-rose-400",
    previewStat: { label: "Goście", value: "48/60", progress: 80 },
    thumbnail: "/planery-thumbs/planer-uroczystosci.jpg",
    driveFileId: "1_zuUVdKLutfkeO4nU6B-ftewR8oW-7Z_",
    sourceFile: "planer-uroczystosci.html",
  },
  {
    id: "a1100007-2026-4000-8000-000000000007",
    slug: "grafik-pracy",
    name: "GrafAI — Grafik Pracy",
    shortName: "Grafik pracy",
    audience: "Firma i zespół",
    category: "Zarządzanie zespołem",
    price: 129,
    tagline: "Układaj grafik szybciej. Zarządzaj zespołem mądrzej.",
    description: "Zmiany, dostępność, działy i kontrola obsady w jednym systemie dla właściciela i managera.",
    promise: "Koniec z grafikiem przesyłanym jako ósma wersja arkusza.",
    features: ["Grafik zmianowy", "Dostępność zespołu", "Kontrola obsady", "Archiwum grafików"],
    accent: "from-amber-300 via-orange-500 to-slate-950",
    glow: "bg-amber-400",
    previewStat: { label: "Obsada", value: "96%", progress: 96 },
    thumbnail: "/planery-thumbs/grafik-pracy.jpg",
    driveFileId: "1GXBvQKzcaSIUO6V_7xzEop1Uz_YUlLHB",
    sourceFile: "grafik-pracy.html",
  },
  {
    id: "a1100008-2026-4000-8000-000000000008",
    slug: "beauty-pro",
    name: "Beauty Pro",
    shortName: "Beauty Pro",
    audience: "Firma i zespół",
    category: "Salon beauty",
    price: 129,
    tagline: "Klientki, wizyty i salon pod kontrolą z telefonu.",
    description: "Lekki manager salonu dla kosmetyczek, stylistek i małych zespołów beauty bez ciężkiego systemu CRM.",
    promise: "Mniej administracji, więcej czasu dla klientek.",
    features: ["Kalendarz wizyt", "Baza klientek", "Usługi i zespół", "Magazyn produktów"],
    accent: "from-pink-300 via-rose-500 to-fuchsia-950",
    glow: "bg-pink-400",
    previewStat: { label: "Wizyty dziś", value: "8", progress: 66 },
    thumbnail: "/planery-thumbs/beauty-pro.jpg",
    driveFileId: "1tV9CpLMJO_jkO5fuzLb5hiBvXDTjmJ1L",
    sourceFile: "beauty-pro.html",
  },
  {
    id: "a1100009-2026-4000-8000-000000000009",
    slug: "planer-budowy",
    name: "BudowaPlaner",
    shortName: "Budowa",
    audience: "Firma i zespół",
    category: "Budowa i remont",
    price: 149,
    tagline: "Budżet, etapy i wykonawcy — bez kolejnego arkusza.",
    description: "Centrum dowodzenia inwestycją dla osób budujących dom, ekip remontowych i koordynatorów projektu.",
    promise: "Wiesz, co jest zrobione, ile kosztuje i co blokuje kolejny etap.",
    features: ["Etapy inwestycji", "Budżet budowy", "Wykonawcy", "Dokumenty i terminy"],
    accent: "from-yellow-300 via-amber-500 to-zinc-950",
    glow: "bg-yellow-400",
    previewStat: { label: "Etapy", value: "4/6", progress: 67 },
    thumbnail: "/planery-thumbs/planer-budowy.jpg",
    driveFileId: "1ZRagl9lzpWfknIUJ68-sqctrozz6NTtk",
    sourceFile: "planer-budowy.html",
  },
];

export function getInteractivePlanner(slug: string) {
  return interactivePlanners.find((planner) => planner.slug === slug) ?? null;
}

export function getProductHref(slug: string) {
  return getInteractivePlanner(slug) ? `/planery/${slug}` : `/produkty/${slug}`;
}

/** Small thumbnail for cart rows / compact lists: the planner screenshot when
    the product is an interactive planner, the cover endpoint otherwise. */
export function getProductThumbnailUrl(slug: string) {
  const planner = getInteractivePlanner(slug);
  return planner?.thumbnail ?? `/api/produkty/${slug}/cover`;
}
