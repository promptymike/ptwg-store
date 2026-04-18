// TIPI — Ten-Item Personality Inventory
// Gosling, S. D., Rentfrow, P. J., & Swann, W. B. Jr. (2003)
// "A very brief measure of the Big-Five personality domains."
// Journal of Research in Personality, 37, 504-528. Public domain.
// Polish translation adapted for consumer-friendly wording.

export type TraitKey =
  | "openness"
  | "conscientiousness"
  | "extraversion"
  | "agreeableness"
  | "emotionalStability";

export type TipiItem = {
  id: number;
  statement: string;
  trait: TraitKey;
  reversed: boolean;
};

export const TIPI_ITEMS: TipiItem[] = [
  { id: 1, statement: "Ekstrawertyczna, pełna entuzjazmu", trait: "extraversion", reversed: false },
  { id: 2, statement: "Krytyczna, skłonna do sporów", trait: "agreeableness", reversed: true },
  { id: 3, statement: "Zdyscyplinowana, samokontrolująca się", trait: "conscientiousness", reversed: false },
  { id: 4, statement: "Niespokojna, łatwo się denerwuje", trait: "emotionalStability", reversed: true },
  { id: 5, statement: "Otwarta na nowe doświadczenia, złożona", trait: "openness", reversed: false },
  { id: 6, statement: "Wycofana, cicha", trait: "extraversion", reversed: true },
  { id: 7, statement: "Sympatyczna, ciepła", trait: "agreeableness", reversed: false },
  { id: 8, statement: "Niezorganizowana, niedbała", trait: "conscientiousness", reversed: true },
  { id: 9, statement: "Spokojna, stabilna emocjonalnie", trait: "emotionalStability", reversed: false },
  { id: 10, statement: "Konwencjonalna, mało kreatywna", trait: "openness", reversed: true },
];

export const LIKERT_OPTIONS = [
  { value: 1, label: "Zdecydowanie się nie zgadzam" },
  { value: 2, label: "Nie zgadzam się" },
  { value: 3, label: "Raczej się nie zgadzam" },
  { value: 4, label: "Nie mam zdania" },
  { value: 5, label: "Raczej się zgadzam" },
  { value: 6, label: "Zgadzam się" },
  { value: 7, label: "Zdecydowanie się zgadzam" },
] as const;

export type TraitScores = Record<TraitKey, number>;

export function scoreTipi(answers: Record<number, number>): TraitScores {
  const totals: Record<TraitKey, { sum: number; count: number }> = {
    openness: { sum: 0, count: 0 },
    conscientiousness: { sum: 0, count: 0 },
    extraversion: { sum: 0, count: 0 },
    agreeableness: { sum: 0, count: 0 },
    emotionalStability: { sum: 0, count: 0 },
  };

  for (const item of TIPI_ITEMS) {
    const raw = answers[item.id];
    if (typeof raw !== "number") continue;
    const value = item.reversed ? 8 - raw : raw;
    totals[item.trait].sum += value;
    totals[item.trait].count += 1;
  }

  return {
    openness: totals.openness.count ? totals.openness.sum / totals.openness.count : 0,
    conscientiousness: totals.conscientiousness.count
      ? totals.conscientiousness.sum / totals.conscientiousness.count
      : 0,
    extraversion: totals.extraversion.count
      ? totals.extraversion.sum / totals.extraversion.count
      : 0,
    agreeableness: totals.agreeableness.count
      ? totals.agreeableness.sum / totals.agreeableness.count
      : 0,
    emotionalStability: totals.emotionalStability.count
      ? totals.emotionalStability.sum / totals.emotionalStability.count
      : 0,
  };
}

export const TRAIT_LABELS: Record<TraitKey, { name: string; short: string }> = {
  openness: { name: "Otwartość na doświadczenia", short: "Otwartość" },
  conscientiousness: { name: "Sumienność", short: "Sumienność" },
  extraversion: { name: "Ekstrawersja", short: "Ekstrawersja" },
  agreeableness: { name: "Ugodowość", short: "Ugodowość" },
  emotionalStability: { name: "Stabilność emocjonalna", short: "Stabilność" },
};

export type TraitInsight = {
  strength: string;
  watch: string;
};

export const TRAIT_INSIGHTS: Record<TraitKey, TraitInsight> = {
  openness: {
    strength:
      "Łatwo dostrzegasz nowe możliwości, łączysz odległe pomysły i pracujesz dobrze w niejednoznacznych kontekstach kreatywnych.",
    watch:
      "Przy natłoku pomysłów tracisz skupienie — ułatw sobie życie systemem zamieniającym koncepcje w konkretne kroki.",
  },
  conscientiousness: {
    strength:
      "Doprowadzasz rzeczy do końca. Jesteś konsekwentna/y, dobrze planujesz i ludzie wokół mogą na Tobie polegać.",
    watch:
      "Pod presją łatwo wchodzisz w tryb mikrozarządzania — warto pracować na szablonach, które odciążają rutynę.",
  },
  extraversion: {
    strength:
      "Energia ludzi Cię napędza. Dobrze sprzedajesz, negocjujesz i prowadzisz zespół przez zmianę.",
    watch:
      "Bez czasu na cichą pracę robisz za dużo jednocześnie — potrzebujesz ram, które chronią głęboki focus.",
  },
  agreeableness: {
    strength:
      "Budujesz zaufanie. Klienci czują się przy Tobie słyszani, a zespoły dobrze z Tobą współpracują.",
    watch:
      "Możesz brać na siebie cudze zadania — wspieraj się procesami onboardingu i jasnymi zakresami współpracy.",
  },
  emotionalStability: {
    strength:
      "Zachowujesz spokój w turbulencjach. Dobrze podejmujesz decyzje finansowe i operacyjne pod presją.",
    watch:
      "Możesz odkładać niewygodne rozmowy, bo nie wybijają Cię z równowagi — pilnuj regularnych przeglądów.",
  },
};

export type TraitLevel = "low" | "moderate" | "high";

export function classifyLevel(score: number): TraitLevel {
  if (score >= 5.5) return "high";
  if (score <= 3.5) return "low";
  return "moderate";
}

export function percentFromScore(score: number) {
  const clamped = Math.max(1, Math.min(7, score));
  return Math.round(((clamped - 1) / 6) * 100);
}

export type CategoryRecommendation = {
  trait: TraitKey;
  categorySlug: string;
  categoryTitle: string;
  href: string;
  headline: string;
  reason: string;
};

const TRAIT_TO_CATEGORY: Record<TraitKey, Omit<CategoryRecommendation, "trait">> = {
  conscientiousness: {
    categorySlug: "planowanie-i-notion",
    categoryTitle: "Planowanie i Notion",
    href: "/produkty?kategoria=Planowanie+i+Notion",
    headline: "Systemy planowania pod Twoją konsekwencję",
    reason:
      "Twój styl pracy zyskuje na strukturze. Szablony tygodniowe, dashboardy i checklisty domkną to, co już robisz dobrze.",
  },
  openness: {
    categorySlug: "content-i-marketing",
    categoryTitle: "Content i marketing",
    href: "/produkty?kategoria=Content+i+marketing",
    headline: "Rytm dla Twojej kreatywności",
    reason:
      "Masz pomysły — potrzebujesz rytmu, który zamienia je w publikacje. Workbooki marki i planer contentu są dla Ciebie.",
  },
  extraversion: {
    categorySlug: "sprzedaz-i-oferty",
    categoryTitle: "Sprzedaż i oferty",
    href: "/produkty?kategoria=Sprzedaż+i+oferty",
    headline: "Szablony dla ludzi, którzy lubią rozmawiać z klientem",
    reason:
      "Naturalnie sprzedajesz i wchodzisz w relacje — dołóż dopracowane propozycje, pipeline i zestaw do launchu.",
  },
  agreeableness: {
    categorySlug: "sprzedaz-i-oferty",
    categoryTitle: "Sprzedaż i oferty",
    href: "/produkty?kategoria=Sprzedaż+i+oferty",
    headline: "Spokojny, powtarzalny onboarding klienta",
    reason:
      "Klienci czują się przy Tobie dobrze — zadbaj o to, by proces onboardingu był równie premium jak rozmowy z Tobą.",
  },
  emotionalStability: {
    categorySlug: "finanse-i-operacje",
    categoryTitle: "Finanse i operacje",
    href: "/produkty?kategoria=Finanse+i+operacje",
    headline: "Finansowy spokój oparty na systemie",
    reason:
      "Zachowujesz równowagę — zamień ją w stały rytm finansowy: fakturowanie, cashflow i miesięczne przeglądy.",
  },
};

export function pickRecommendation(scores: TraitScores): CategoryRecommendation {
  const entries = (Object.keys(scores) as TraitKey[]).map((key) => ({
    trait: key,
    score: scores[key],
  }));
  entries.sort((a, b) => b.score - a.score);
  const top = entries[0];
  const mapping = TRAIT_TO_CATEGORY[top.trait];
  return { trait: top.trait, ...mapping };
}

export function getTopTraits(scores: TraitScores, limit = 2): TraitKey[] {
  const entries = (Object.keys(scores) as TraitKey[]).map((key) => ({
    trait: key,
    score: scores[key],
  }));
  entries.sort((a, b) => b.score - a.score);
  return entries.slice(0, limit).map((entry) => entry.trait);
}
