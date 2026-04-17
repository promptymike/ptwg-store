import {
  type AdminOrderPreview,
  type Bundle,
  CATEGORY_OPTIONS,
  type CategoryHighlight,
  type Product,
  type StoreStat,
  type Testimonial,
} from "@/types/store";

export const products: Product[] = [
  {
    id: "planner-01",
    slug: "planner-zlota-rutyna",
    name: "Planner Złota Rutyna",
    category: "Planery",
    shortDescription: "Codzienny system planowania premium dla osób, które chcą działać spokojniej i skuteczniej.",
    description:
      "Elegancki planner PDF z tygodniowymi i miesięcznymi układami, trackerami nawyków oraz sekcjami refleksji. Zaprojektowany tak, by łączyć wysoką estetykę z realnym porządkiem dnia.",
    price: 79,
    compareAtPrice: 109,
    format: "PDF + GoodNotes",
    pages: 86,
    tags: ["organizacja", "nawyki", "goodnotes"],
    rating: 4.9,
    salesLabel: "Najczęściej wybierany przez klientki premium",
    accent: "from-amber-300/70 via-yellow-500/40 to-orange-300/20",
    coverGradient: "from-stone-950 via-amber-950/70 to-stone-900",
    includes: [
      "plan miesięczny i tygodniowy",
      "trackery nawyków i energii",
      "sekcję priorytetów i refleksji",
    ],
    heroNote: "Dla osób, które chcą planować bez chaosu.",
    bestseller: true,
    featured: true,
  },
  {
    id: "planner-02",
    slug: "planner-biznesowy-noir",
    name: "Planner Biznesowy Noir",
    category: "Planery",
    shortDescription: "System celów, zadań i analiz dla marek osobistych, konsultantek i właścicielek biznesów.",
    description:
      "Rozbudowany planner z podziałem na kampanie, cele kwartalne, KPI oraz szablony planowania contentu. Idealny do prowadzenia nowoczesnego biznesu cyfrowego.",
    price: 99,
    compareAtPrice: 139,
    format: "PDF",
    pages: 104,
    tags: ["biznes", "cele", "content"],
    rating: 4.8,
    salesLabel: "Ulubiony wybór twórczyń cyfrowych",
    accent: "from-yellow-200/70 via-amber-400/40 to-yellow-600/20",
    coverGradient: "from-neutral-950 via-zinc-900 to-neutral-800",
    includes: [
      "dashboard kwartalny",
      "plan kampanii i lejka sprzedaży",
      "arkusze celów i KPI",
    ],
    heroNote: "Planowanie pod markę, sprzedaż i regularność.",
    featured: true,
  },
  {
    id: "recipe-01",
    slug: "ebook-fit-kuchnia-15-minut",
    name: "E-book Fit Kuchnia 15 Minut",
    category: "Przepisy",
    shortDescription: "Szybkie przepisy na codzienny rytm bez liczenia każdego składnika.",
    description:
      "Kolekcja prostych, efektownych przepisów z listami zakupów i zamiennikami. Skierowana do osób, które chcą jeść dobrze, ale nie mają czasu na skomplikowane gotowanie.",
    price: 59,
    compareAtPrice: 89,
    format: "PDF",
    pages: 58,
    tags: ["fit", "meal prep", "szybkie przepisy"],
    rating: 4.7,
    salesLabel: "Świetny start dla zabieganych",
    accent: "from-yellow-100/80 via-amber-300/40 to-lime-200/20",
    coverGradient: "from-stone-950 via-yellow-950/60 to-emerald-950/50",
    includes: [
      "45 szybkich przepisów",
      "listy zakupów",
      "zamienniki i wskazówki meal prep",
    ],
    heroNote: "Jedzenie, które wspiera tempo życia, nie spowalnia go.",
    bestseller: true,
  },
  {
    id: "recipe-02",
    slug: "ebook-luksusowe-desery-zero-chaosu",
    name: "Luksusowe Desery Zero Chaosu",
    category: "Przepisy",
    shortDescription: "Estetyczne desery premium w domowej, uproszczonej wersji.",
    description:
      "Przepisy inspirowane cukierniczym stylem premium, ale stworzone z myślą o codziennej kuchni. Każdy deser zawiera wariant podstawowy i efektowną wersję na specjalne okazje.",
    price: 69,
    compareAtPrice: 99,
    format: "PDF",
    pages: 46,
    tags: ["desery", "premium", "estetyka"],
    rating: 4.8,
    salesLabel: "Najbardziej instagramowy produkt w katalogu",
    accent: "from-amber-100/80 via-orange-300/40 to-rose-200/20",
    coverGradient: "from-zinc-950 via-stone-900 to-orange-950/40",
    includes: [
      "24 desery krok po kroku",
      "warianty podstawowe i premium",
      "wskazówki do stylizacji pod zdjęcia",
    ],
    heroNote: "Dla klientów, którzy kochają smak i prezentację.",
  },
  {
    id: "fitness-01",
    slug: "plan-treningowy-sylwetka-premium",
    name: "Plan Treningowy Sylwetka Premium",
    category: "Plany treningowe",
    shortDescription: "12-tygodniowy plan treningowy do domu lub na siłownię, z naciskiem na proporcje i konsekwencję.",
    description:
      "Kompletny plan progresji, checklisty techniczne i harmonogram regeneracji. Zaprojektowany dla osób, które chcą rezultatów bez przypadkowych treningów.",
    price: 89,
    compareAtPrice: 129,
    format: "PDF + tracker",
    pages: 72,
    tags: ["trening", "sylwetka", "12 tygodni"],
    rating: 4.9,
    salesLabel: "Top wybór w kategorii trening",
    accent: "from-yellow-100/80 via-amber-400/40 to-red-300/20",
    coverGradient: "from-black via-stone-900 to-red-950/50",
    includes: [
      "plan 3 i 4 dniowy",
      "trackery postępów",
      "sekcję regeneracji i mobilności",
    ],
    heroNote: "Konkretny plan, który porządkuje cały proces.",
    bestseller: true,
    featured: true,
  },
  {
    id: "fitness-02",
    slug: "plan-home-body-balance",
    name: "Home Body Balance",
    category: "Plany treningowe",
    shortDescription: "Kobiecy plan domowy z gumami i hantlami, nastawiony na rytm i regularność.",
    description:
      "Plan dla osób, które trenują w domu i chcą czuć prowadzenie krok po kroku. Zawiera modyfikacje poziomu, plan tygodnia i mini-sekcję mobility.",
    price: 69,
    compareAtPrice: 99,
    format: "PDF",
    pages: 54,
    tags: ["dom", "regularność", "mobilność"],
    rating: 4.7,
    salesLabel: "Idealny wybór na start",
    accent: "from-yellow-100/70 via-amber-300/40 to-pink-300/20",
    coverGradient: "from-neutral-950 via-stone-900 to-pink-950/40",
    includes: [
      "plan 4-tygodniowy",
      "wersje light i standard",
      "trackery energii i motywacji",
    ],
    heroNote: "Lekkość formy, konsekwencja w efektach.",
  },
  {
    id: "finance-01",
    slug: "budzet-domowy-z-klasa",
    name: "Budżet Domowy z Klasą",
    category: "Finanse",
    shortDescription: "Arkusz i przewodnik do zarządzania budżetem w nowoczesnym, luksusowym stylu.",
    description:
      "Zestaw templatek do kontroli wydatków, budowy poduszki finansowej i planowania większych celów. Przygotowany dla osób, które chcą uporządkować finanse bez uczucia ograniczenia.",
    price: 79,
    compareAtPrice: 119,
    format: "PDF + arkusz",
    pages: 63,
    tags: ["budżet", "arkusz", "planowanie"],
    rating: 4.8,
    salesLabel: "Bestseller w finansach osobistych",
    accent: "from-yellow-100/80 via-amber-400/45 to-emerald-300/20",
    coverGradient: "from-stone-950 via-emerald-950/40 to-zinc-900",
    includes: [
      "dashboard wydatków",
      "szablon celów finansowych",
      "plan poduszki i oszczędności",
    ],
    heroNote: "Porządek w finansach bez surowego excela.",
    bestseller: true,
    featured: true,
  },
  {
    id: "finance-02",
    slug: "mini-kurs-cena-spokoj-finansowy",
    name: "Mini Kurs Cena Spokój Finansowy",
    category: "Finanse",
    shortDescription: "Lekki kurs PDF o nawykach, priorytetach i budowaniu zdrowych decyzji finansowych.",
    description:
      "Produkt dla osób, które chcą nie tylko zapisywać liczby, ale rozumieć swoje decyzje zakupowe i budować większe poczucie bezpieczeństwa.",
    price: 49,
    compareAtPrice: 79,
    format: "PDF",
    pages: 39,
    tags: ["mindset", "finanse", "nawyki"],
    rating: 4.6,
    salesLabel: "Najbardziej przystępny produkt startowy",
    accent: "from-amber-100/80 via-yellow-300/40 to-cyan-200/20",
    coverGradient: "from-neutral-950 via-slate-950 to-cyan-950/40",
    includes: [
      "ćwiczenia refleksyjne",
      "mapę priorytetów",
      "mikro-plan 30 dni",
    ],
    heroNote: "Finanse jako spokój, nie presja.",
  },
  {
    id: "growth-01",
    slug: "dziennik-pewnosci-siebie",
    name: "Dziennik Pewności Siebie",
    category: "Rozwój osobisty",
    shortDescription: "Elegancki workbook do budowania pewności, granic i sprawczości.",
    description:
      "Pytania coachingowe, ćwiczenia na przekonania i tygodniowy rytuał domykania myśli. Stworzony dla osób, które chcą rozwijać pewność siebie w praktyce, nie tylko w teorii.",
    price: 69,
    compareAtPrice: 99,
    format: "PDF",
    pages: 64,
    tags: ["mindset", "workbook", "pewność siebie"],
    rating: 4.9,
    salesLabel: "Najwyżej oceniany workbook",
    accent: "from-yellow-100/70 via-amber-400/45 to-violet-300/15",
    coverGradient: "from-black via-zinc-900 to-violet-950/40",
    includes: [
      "30 promptów rozwojowych",
      "ćwiczenia granic i odwagi",
      "tygodniowy rytuał podsumowania",
    ],
    heroNote: "Rozwój osobisty bez banału i przesady.",
    featured: true,
  },
];

export const bundles: Bundle[] = [
  {
    id: "bundle-01",
    name: "Pakiet Premium Start",
    description: "Połączenie planowania, finansów i nawyków w jednym zestawie wejściowym.",
    price: 179,
    compareAtPrice: 257,
    accent: "from-yellow-100/70 via-amber-400/35 to-emerald-300/20",
    productIds: ["planner-01", "finance-01", "growth-01"],
    perks: [
      "oszczędność 78 zł względem zakupu pojedynczo",
      "najlepszy zestaw na start nowego miesiąca",
      "spójne materiały w jednym stylu wizualnym",
    ],
  },
  {
    id: "bundle-02",
    name: "Pakiet Forma i Focus",
    description: "Dla klientek, które chcą zadbać o sylwetkę, jedzenie i regularność bez chaosu.",
    price: 159,
    compareAtPrice: 217,
    accent: "from-yellow-100/70 via-orange-400/35 to-rose-300/20",
    productIds: ["fitness-01", "recipe-01", "planner-01"],
    perks: [
      "kompletny rytm tygodnia: plan, trening i jedzenie",
      "praktyczny zestaw do używania od razu",
      "premium wygląd i bardzo czytelne materiały",
    ],
  },
];

export const storeStats: StoreStat[] = [
  {
    id: "stat-01",
    label: "Format premium",
    value: "100%",
    detail: "produkty przygotowane mobilnie i desktopowo",
  },
  {
    id: "stat-02",
    label: "Średnia ocen",
    value: "4.8/5",
    detail: "na podstawie opinii demo w katalogu",
  },
  {
    id: "stat-03",
    label: "Produkty cyfrowe",
    value: "9",
    detail: "gotowe do pobrania po zakupie",
  },
  {
    id: "stat-04",
    label: "Kategorie",
    value: String(CATEGORY_OPTIONS.length),
    detail: "od planowania po rozwój osobisty",
  },
];

export const categoryHighlights: CategoryHighlight[] = [
  {
    slug: "planery",
    title: "Planery",
    description: "Szablony do planowania dnia, tygodnia, pracy i rytuałów w eleganckiej formie.",
    accent: "from-yellow-100/80 via-amber-300/35 to-stone-200/10",
  },
  {
    slug: "przepisy",
    title: "Przepisy",
    description: "Praktyczne e-booki kulinarne, które łączą prostotę z bardzo dopracowaną estetyką.",
    accent: "from-yellow-100/80 via-orange-300/35 to-lime-200/10",
  },
  {
    slug: "plany-treningowe",
    title: "Plany treningowe",
    description: "Konkretny progres, czytelny rytm tygodnia i materiały, do których chce się wracać.",
    accent: "from-yellow-100/80 via-amber-400/35 to-red-200/10",
  },
  {
    slug: "finanse",
    title: "Finanse",
    description: "Nowoczesne narzędzia do porządkowania budżetu, celów i decyzji finansowych.",
    accent: "from-yellow-100/80 via-emerald-300/35 to-teal-200/10",
  },
  {
    slug: "rozwoj-osobisty",
    title: "Rozwój osobisty",
    description: "Workbooki i dzienniki wspierające pewność siebie, refleksję i świadomy rozwój.",
    accent: "from-yellow-100/80 via-violet-300/35 to-rose-200/10",
  },
];

export const testimonials: Testimonial[] = [
  {
    id: "review-01",
    author: "Magda",
    role: "twórczyni online",
    quote:
      "Ten sklep wygląda premium, ale najważniejsze jest to, że produkty faktycznie porządkują codzienność. Planner i budżet wracają do mnie co tydzień.",
    score: "5.0",
  },
  {
    id: "review-02",
    author: "Karolina",
    role: "właścicielka studia beauty",
    quote:
      "Pakiet startowy dał mi poczucie, że wreszcie mam system zamiast kolejnych ładnych PDF-ów bez zastosowania. Bardzo dopracowany klimat.",
    score: "4.9",
  },
  {
    id: "review-03",
    author: "Natalia",
    role: "klientka kategorii fit",
    quote:
      "Plan treningowy i przepisy są proste, ale nie banalne. Czuć, że ktoś zaprojektował to pod realne życie, a nie tylko pod ładne makiety.",
    score: "4.8",
  },
];

export const adminOrders: AdminOrderPreview[] = [
  {
    id: "PTWG-2026-1001",
    customer: "Anna Wójcik",
    email: "anna@example.com",
    amount: 179,
    status: "Opłacone",
    date: "2026-04-15",
    items: ["Pakiet Premium Start"],
  },
  {
    id: "PTWG-2026-1002",
    customer: "Julia Kaczmarek",
    email: "julia@example.com",
    amount: 79,
    status: "Nowe",
    date: "2026-04-16",
    items: ["Budżet Domowy z Klasą"],
  },
  {
    id: "PTWG-2026-1003",
    customer: "Oliwia Lis",
    email: "oliwia@example.com",
    amount: 159,
    status: "W realizacji",
    date: "2026-04-17",
    items: ["Pakiet Forma i Focus"],
  },
];

export const homeFeaturedProducts = products.filter((product) => product.featured);
export const bestsellerProducts = products.filter((product) => product.bestseller);

export const storeSeed = {
  categories: CATEGORY_OPTIONS,
  products,
  bundles,
};

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getProductById(productId: string) {
  return products.find((product) => product.id === productId);
}

export function getProductsByCategory(category?: string) {
  if (!category) {
    return products;
  }

  return products.filter((product) => product.category === category);
}

export function getRelatedProducts(product: Product, limit = 3) {
  return products
    .filter(
      (candidate) =>
        candidate.category === product.category && candidate.id !== product.id,
    )
    .slice(0, limit);
}
