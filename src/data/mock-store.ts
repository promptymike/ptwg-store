import {
  type AdminOrderPreview,
  type Bundle,
  CATEGORY_OPTIONS,
  type CategoryHighlight,
  type ContentPage,
  type FaqItem,
  type Product,
  type SiteSectionContent,
  type StoreStat,
  type Testimonial,
} from "@/types/store";

export const products: Product[] = [
  {
    id: "template-01",
    slug: "notion-ceo-week",
    name: "Notion CEO Week",
    category: "Planowanie i Notion",
    shortDescription:
      "Tygodniowy system pracy dla założycieli, którzy chcą więcej spokoju, wyraźnych priorytetów i lepszych decyzji.",
    description:
      "Premium workspace w Notion do planowania tygodnia, śledzenia decyzji, prowadzenia notatek ze spotkań i spokojniejszej realizacji. Dla osób, które chcą mniej chaosu i więcej sygnału w codziennej pracy.",
    price: 129,
    compareAtPrice: 189,
    format: "Notion + PDF",
    pages: 42,
    tags: ["notion", "planowanie", "założyciel"],
    rating: 4.9,
    salesLabel: "Ulubione wśród założycieli",
    accent: "from-stone-900 via-amber-200 to-orange-100",
    coverGradient: "from-[#f6efe6] via-[#f4e5d3] to-[#e7d5be]",
    includes: [
      "tygodniowy dashboard priorytetów",
      "planer kluczowych decyzji",
      "log spotkań i ustaleń",
    ],
    heroNote: "Przejmij tydzień, zanim on przejmie Ciebie.",
    badge: "featured",
    bestseller: true,
    featured: true,
  },
  {
    id: "template-02",
    slug: "client-onboarding-suite",
    name: "Pakiet Onboardingu Klienta",
    category: "Sprzedaż i oferty",
    shortDescription:
      "Gotowe ścieżki wdrożenia klienta, ankiety i materiały dla studiów i agencji usługowych.",
    description:
      "Dopracowany system onboardingu z formularzami briefu, pakietem kickoff i checklistami dostarczania. Idealny dla studiów, freelancerów i marek premium w modelu usługowym.",
    price: 149,
    compareAtPrice: 219,
    format: "Docs + PDF + checklisty",
    pages: 58,
    tags: ["onboarding", "obsługa-klienta", "usługi"],
    rating: 5,
    salesLabel: "Najlepsze dla usług premium",
    accent: "from-neutral-900 via-emerald-200 to-white",
    coverGradient: "from-[#f7f4ef] via-[#ece6dc] to-[#ddd5c7]",
    includes: [
      "formularz briefu i discovery",
      "pakiet kickoff ze wzorami maili",
      "szablony komunikacji z klientem",
    ],
    heroNote: "Wyglądaj profesjonalnie jeszcze przed pierwszą rozmową.",
    badge: "bestseller",
    bestseller: true,
    featured: true,
  },
  {
    id: "template-03",
    slug: "launch-offer-kit",
    name: "Zestaw do Launchu Oferty",
    category: "Sprzedaż i oferty",
    shortDescription:
      "Szablony stron sprzedażowych, checklista launchu i copy oferty dla produktów cyfrowych.",
    description:
      "Zorientowany na konwersję pakiet do launchu dla twórców i marek cyfrowych, którzy chcą czytelniejszej komunikacji, szybszego tworzenia strony i spokojniejszego tygodnia premiery.",
    price: 119,
    compareAtPrice: 169,
    format: "PDF + gotowe copy",
    pages: 48,
    tags: ["launch", "sprzedaz", "oferta"],
    rating: 4.8,
    salesLabel: "Najszybsza droga do launchu",
    accent: "from-stone-900 via-rose-200 to-amber-50",
    coverGradient: "from-[#fbf0ec] via-[#f3dfd9] to-[#e8c9bf]",
    includes: [
      "checklista launchu dzień po dniu",
      "gotowe formuły copy dla oferty",
      "bloki CTA i sekcje strony sprzedażowej",
    ],
    heroNote: "Sprzedawaj efekt, a nie pracę.",
    badge: "new",
    featured: true,
  },
  {
    id: "template-04",
    slug: "content-engine-90",
    name: "Silnik Contentu 90",
    category: "Content i marketing",
    shortDescription:
      "Premium system planowania contentu, który zamienia strategię w 90 dni konkretnej realizacji.",
    description:
      "Szablony do planowania kampanii, repurposingu i tygodniowej publikacji. Zbudowane, by małe zespoły mogły publikować konsekwentniej i z lepszą redakcyjną decyzyjnością.",
    price: 139,
    compareAtPrice: 199,
    format: "Notion + PDF",
    pages: 54,
    tags: ["content", "marketing", "repurposing"],
    rating: 4.9,
    salesLabel: "Bestseller do planowania contentu",
    accent: "from-slate-900 via-sky-200 to-white",
    coverGradient: "from-[#f4f3ef] via-[#e3e6e7] to-[#d8dde3]",
    includes: [
      "mapa contentu na 90 dni",
      "planer repurposingu wielokanałowego",
      "tablica tygodniowej realizacji",
    ],
    heroNote: "Zamień strategię w realne publikacje.",
    badge: "featured",
    bestseller: true,
    featured: true,
  },
  {
    id: "template-05",
    slug: "invoice-cashflow-pack",
    name: "Pakiet Faktur i Cashflow",
    category: "Finanse i operacje",
    shortDescription:
      "Szablony faktur, wyceny, śledzenia cashflow i rytuałów finansowych bez chaosu w arkuszach.",
    description:
      "Operacyjny pakiet finansowy dla twórców i butikowych biznesów, którzy chcą czystych liczb, spokojniejszych przeglądów i większej pewności w decyzjach cenowych.",
    price: 109,
    compareAtPrice: 149,
    format: "Arkusz + PDF",
    pages: 36,
    tags: ["finanse", "faktury", "cashflow"],
    rating: 4.8,
    salesLabel: "Must-have operacyjny",
    accent: "from-zinc-900 via-lime-200 to-stone-50",
    coverGradient: "from-[#f8f5ea] via-[#ece4c8] to-[#ddd2ad]",
    includes: [
      "workflow wystawiania faktur",
      "tracker cashflow miesiąc po miesiącu",
      "planer strategii cenowej",
    ],
    heroNote: "Zachowaj spokój w biznesowym zapleczu.",
    badge: "pack",
    bestseller: true,
  },
  {
    id: "template-06",
    slug: "crm-pipeline-template",
    name: "Pipeline CRM",
    category: "Sprzedaż i oferty",
    shortDescription:
      "Dopracowany pipeline sprzedażowy dla freelancerów, studiów i butikowych agencji.",
    description:
      "Prowadź leady, follow-upy i propozycje w jednym przejrzystym workflow, który zwiększa widoczność bez zmiany w administracyjny kołowrotek.",
    price: 129,
    compareAtPrice: 179,
    format: "Notion + tablica CRM",
    pages: 44,
    tags: ["crm", "sprzedaz", "pipeline"],
    rating: 4.7,
    salesLabel: "Upgrade widoczności sprzedaży",
    accent: "from-stone-900 via-violet-200 to-white",
    coverGradient: "from-[#f6f2f9] via-[#e8dff5] to-[#d5c6ef]",
    includes: [
      "etapy leadów i kwalifikacja",
      "szablony follow-upów e-mail",
      "tracker propozycji i decyzji",
    ],
    heroNote: "Zobacz co się porusza, a co utknęło.",
    badge: "featured",
  },
  {
    id: "template-07",
    slug: "focus-desk-planner",
    name: "Planner Focus Desk",
    category: "Produktywność osobista",
    shortDescription:
      "Lekki, edytorski planner do głębokiej pracy, tygodniowych priorytetów i realizacji bez rozpraszaczy.",
    description:
      "Zaprojektowany dla osób, które chcą bardziej świadomego dnia pracy — z mniejszą liczbą otwartych kart mentalnie i operacyjnie.",
    price: 89,
    compareAtPrice: 129,
    format: "PDF do druku i iPada",
    pages: 52,
    tags: ["focus", "produktywnosc", "planowanie"],
    rating: 4.8,
    salesLabel: "Najczęściej kupowany na prezent",
    accent: "from-neutral-900 via-yellow-100 to-white",
    coverGradient: "from-[#f7f3ee] via-[#ece3d5] to-[#ddd1c0]",
    includes: [
      "planer głębokiej pracy",
      "tygodniowy reset i przegląd",
      "strony dnia bez rozpraszaczy",
    ],
    heroNote: "Czystszy dzień zaczyna się od lepszego systemu.",
    badge: "new",
    featured: true,
  },
  {
    id: "template-08",
    slug: "brand-brief-workbook",
    name: "Workbook Briefu Marki",
    category: "Content i marketing",
    shortDescription:
      "Ustrukturyzowany warsztat do ułożenia strategii marki przed projektowaniem, copy i launchem.",
    description:
      "Spokojny, profesjonalny workbook do doprecyzowania pozycjonowania, grupy odbiorców i kierunku kreatywnego, zanim zaczniesz jakiekolwiek prace projektowe.",
    price: 99,
    compareAtPrice: 149,
    format: "PDF workbook",
    pages: 40,
    tags: ["marka", "workbook", "strategia"],
    rating: 4.9,
    salesLabel: "Idealny warsztat przed projektem",
    accent: "from-slate-900 via-pink-200 to-white",
    coverGradient: "from-[#fbf2f4] via-[#eedde4] to-[#dfc7d1]",
    includes: [
      "pytania pozycjonujące markę",
      "arkusze pracy nad grupą docelową",
      "notatki kierunku kreatywnego",
    ],
    heroNote: "Klarowność przed projektem oszczędza tygodnie później.",
    badge: "bestseller",
  },
  {
    id: "template-09",
    slug: "proposal-template-library",
    name: "Biblioteka Propozycji",
    category: "Sprzedaż i oferty",
    shortDescription:
      "Szablony propozycji, zakresu i wyceny, które pomagają zamykać projekty z większą pewnością.",
    description:
      "Premium system propozycji dla usług produktyzowanych i butikowych współprac. Używaj, by skrócić czas odpowiedzi bez obniżania postrzeganej wartości.",
    price: 119,
    compareAtPrice: 179,
    format: "Docs + PDF",
    pages: 47,
    tags: ["propozycja", "wycena", "sprzedaz"],
    rating: 4.8,
    salesLabel: "Start do zamykania większych projektów",
    accent: "from-zinc-900 via-amber-200 to-white",
    coverGradient: "from-[#f9f3eb] via-[#eadbc8] to-[#dcc4a8]",
    includes: [
      "szablony propozycji handlowych",
      "scenariusze cenowe i pakietowania",
      "framework zakresu współpracy",
    ],
    heroNote: "Zamykaj projekty premium z większą pewnością.",
    badge: "pack",
  },
];

export const bundles: Bundle[] = [
  {
    id: "bundle-01",
    name: "Pakiet Operacyjny Założyciela",
    description:
      "Premium pakiet startowy do planowania, realizacji contentu i czystszych tygodniowych operacji.",
    price: 299,
    compareAtPrice: 357,
    accent: "from-stone-900 via-amber-200 to-white",
    productIds: ["template-01", "template-04", "template-07"],
    perks: [
      "systemy do planowania, publikowania i tygodniowego resetu",
      "najlepszy punkt startu dla solo founderów i konsultantów",
      "jedna estetyka w każdym punkcie operacyjnym",
    ],
  },
  {
    id: "bundle-02",
    name: "Pakiet Sprzedaży i Dostarczania Studio",
    description:
      "Wszystko, czego potrzebujesz, by sprzedawać, wdrażać i prowadzić klientów jak dojrzała marka.",
    price: 329,
    compareAtPrice: 397,
    accent: "from-slate-900 via-emerald-200 to-white",
    productIds: ["template-02", "template-06", "template-09"],
    perks: [
      "czystszy pipeline sprzedaży i szybszy onboarding",
      "idealne dla studiów i freelancerów premium",
      "mniej powtarzalnej pracy przy każdym nowym kliencie",
    ],
  },
];

export const storeStats: StoreStat[] = [
  {
    id: "stat-01",
    label: "Natychmiastowy dostęp",
    value: "24/7",
    detail: "Produkty trafiają do biblioteki tuż po płatności.",
  },
  {
    id: "stat-02",
    label: "Kurator katalogu",
    value: "9",
    detail: "Szablonów zaprojektowanych wokół konkretnych procesów.",
  },
  {
    id: "stat-03",
    label: "Średnia ocena",
    value: "4.9/5",
    detail: "Spójna jakość potwierdzona przez klientów.",
  },
  {
    id: "stat-04",
    label: "Główne obszary",
    value: String(CATEGORY_OPTIONS.length),
    detail: "Od planowania i contentu po oferty i finanse.",
  },
];

export const categoryHighlights: CategoryHighlight[] = [
  {
    slug: "planowanie-i-notion",
    title: "Planowanie i Notion",
    description:
      "Tygodniowe systemy pracy, dashboardy założycielskie i spokojne szablony realizacji.",
    accent: "from-[#f9f3ea] via-[#eadcc8] to-[#dfc7ae]",
  },
  {
    slug: "content-i-marketing",
    title: "Content i marketing",
    description:
      "Redakcyjne workflow, workbooki marki i systemy, które zmniejszają zmęczenie contentem.",
    accent: "from-[#f7f1f7] via-[#e5deef] to-[#d7d1e4]",
  },
  {
    slug: "sprzedaz-i-oferty",
    title: "Sprzedaż i oferty",
    description:
      "Zestawy do launchu, biblioteki propozycji i materiały sprzedażowe do pozycjonowania premium.",
    accent: "from-[#fdf0ec] via-[#efd9d2] to-[#e3c6bd]",
  },
  {
    slug: "finanse-i-operacje",
    title: "Finanse i operacje",
    description:
      "Systemy cennikowe, fakturowanie i cashflow dla spokojniejszego zaplecza biznesu.",
    accent: "from-[#f7f4ea] via-[#ece3c9] to-[#ddd1ab]",
  },
  {
    slug: "produktywnosc-osobista",
    title: "Produktywność osobista",
    description:
      "Lekkie, edytorskie plannery, które pomagają chronić uwagę i energię każdego dnia.",
    accent: "from-[#f8f5f0] via-[#e8dfd2] to-[#d9cebf]",
  },
];

export const siteSections: SiteSectionContent[] = [
  {
    key: "hero",
    eyebrow: "Premium szablony cyfrowe",
    title:
      "Szablony i systemy dla marek, które chcą wyglądać spokojnie, wiarygodnie i premium.",
    description:
      "Sprzedajemy efekt, nie plik. W Templify znajdziesz gotowe systemy pracy, plannery i materiały launchowe zbudowane pod zaufanie i konwersję.",
    body:
      "Dla założycieli, studiów, konsultantów i marek cyfrowych, które chcą eleganckich systemów zamiast przypadkowych plików do pobrania.",
    ctaLabel: "Przeglądaj katalog",
    ctaHref: "/produkty",
  },
  {
    key: "featured",
    eyebrow: "Wybrane produkty",
    title:
      "Zacznij od szablonów, które klienci kupują, gdy chcą szybko odzyskać tempo.",
    description:
      "Każdy wyróżniony produkt jest wybrany pod kątem jasnej transformacji, premium prezentacji i wdrożenia już pierwszego dnia.",
    body:
      "Użyj ich jako pierwszej warstwy mocniejszej oferty, lepszego onboardingu albo czystszych tygodniowych operacji.",
    ctaLabel: "Zobacz cały katalog",
    ctaHref: "/produkty",
  },
  {
    key: "use-cases",
    eyebrow: "Wybierz po efekcie",
    title:
      "Wybierz system dla dokładnie tej części biznesu, którą chcesz uporządkować jako następną.",
    description:
      "Templify grupuje szablony wokół realnych procesów: planowania, contentu, sprzedaży, finansów i spokojniejszej pracy operacyjnej.",
    body:
      "Dzięki temu nawigujesz po efekcie, a nie po typie pliku.",
  },
  {
    key: "why-templify",
    eyebrow: "Dlaczego Templify",
    title:
      "Eleganckie na tyle, by wyglądać premium. Praktyczne na tyle, by realnie zmienić sposób pracy.",
    description:
      "Każdy produkt jest zbudowany wokół zaufania, szybkości i wdrożenia. Marka wygląda premium, bo doświadczenie jest zaprojektowane od końca do końca.",
    body:
      "Od strony głównej po bibliotekę plików — całe doświadczenie zmniejsza tarcie i zwiększa pewność na każdym kroku.",
  },
  {
    key: "how-it-works",
    eyebrow: "Jak to działa",
    title:
      "Wybierz, zapłać raz, pobierz natychmiast i od razu wdróż system w pracę.",
    description:
      "Flow jest prosty: dodaj do koszyka, opłać bezpiecznie online, wejdź do swojej biblioteki i zacznij używać szablonów od razu.",
    body:
      "Bez czekania na ręczną wysyłkę, bez ukrytych kroków, bez niejasnych terminów dostawy.",
  },
  {
    key: "faq",
    eyebrow: "Najczęstsze pytania",
    title:
      "Odpowiedzi, które rozwiewają ostatnie wątpliwości przed zakupem.",
    description:
      "FAQ ma wyjaśnić dostawę, prawa użytkowania, formaty i wsparcie bez zakłócania spokojnego rytmu strony.",
    body:
      "Krótkie odpowiedzi. Spokojny ton. Zero nerwowego prawniczego żargonu.",
  },
];

export const testimonials: Testimonial[] = [
  {
    id: "review-01",
    author: "Marta K.",
    role: "Założycielka studia brandingowego",
    quote:
      "Pakiet Onboardingu Klienta sprawił, że od pierwszego kontaktu wyglądamy dużo bardziej premium i nie gubimy już etapów współpracy.",
    score: "5.0",
  },
  {
    id: "review-02",
    author: "Kasia W.",
    role: "Twórczyni kursów online",
    quote:
      "Zestaw do Launchu skrócił mi przygotowanie kampanii o kilka dni. Wszystko było spójne, eleganckie i gotowe do publikacji.",
    score: "4.9",
  },
  {
    id: "review-03",
    author: "Piotr Z.",
    role: "Konsultant strategiczny",
    quote:
      "Pakiet Faktur i Cashflow dał mi prosty, powtarzalny rytm finansowy bez przeprojektowywania całego zaplecza biznesu.",
    score: "4.8",
  },
];

export const faqItems: FaqItem[] = [
  {
    id: "faq-01",
    question: "W jakim formacie otrzymam produkt?",
    answer:
      "W zależności od produktu otrzymasz PDF, workspace Notion, arkusz lub pakiet materiałów pomocniczych. Format jest zawsze opisany na stronie produktu.",
  },
  {
    id: "faq-02",
    question: "Jak szybko pojawi się dostęp po zakupie?",
    answer:
      "Dostęp otrzymujesz natychmiast po opłaceniu zamówienia. Produkt pojawia się automatycznie w Twojej bibliotece w Templify.",
  },
  {
    id: "faq-03",
    question: "Czy mogę używać szablonów komercyjnie?",
    answer:
      "Tak — w ramach własnej pracy lub biznesu. Nie możesz jednak odsprzedawać tych materiałów jako własnych ani udostępniać ich dalej.",
  },
  {
    id: "faq-04",
    question: "Czy dostęp do plików jest bezterminowy?",
    answer:
      "Tak. Po zakupie produkt pozostaje w Twojej bibliotece bezterminowo — możesz go pobrać kiedykolwiek, bez limitów.",
  },
  {
    id: "faq-05",
    question: "Czy mogę edytować szablony pod siebie?",
    answer:
      "Tak. Wszystkie szablony są w pełni edytowalne — w Notion, Dokumentach Google, PDF do druku lub w arkuszach. Dostajesz pełną swobodę dostosowania.",
  },
  {
    id: "faq-06",
    question: "Czy wystawiacie fakturę VAT?",
    answer:
      "Tak. Fakturę VAT wystawiamy automatycznie po zakupie. W formularzu zamówienia możesz podać dane firmy i numer NIP.",
  },
  {
    id: "faq-07",
    question: "Jak wygląda zwrot zakupu?",
    answer:
      "Masz 14 dni na zwrot bez podania przyczyny. Napisz do nas na kontakt@templify.store, a zwrócimy pełną kwotę i dezaktywujemy dostęp w bibliotece.",
  },
  {
    id: "faq-08",
    question: "Czy potrzebuję konta, żeby kupić?",
    answer:
      "Tak — konto pozwala bezpiecznie przypisać zakupy do Twojej biblioteki i w każdej chwili pobrać plik z jednego miejsca. Zakładanie trwa kilka sekund.",
  },
];

export const legalPages: ContentPage[] = [
  {
    slug: "polityka-prywatnosci",
    title: "Polityka prywatności",
    description: "Zasady przetwarzania danych osobowych w sklepie Templify.",
    body:
      "Templify przetwarza dane osobowe wyłącznie w zakresie niezbędnym do realizacji zamówień, obsługi konta użytkownika, płatności i kontaktu z klientem.",
  },
  {
    slug: "polityka-cookies",
    title: "Polityka cookies",
    description: "Informacje o wykorzystaniu plików cookies i zgód użytkownika.",
    body:
      "W serwisie używamy plików niezbędnych do działania sklepu oraz opcjonalnych kategorii, takich jak analityczne i marketingowe.",
  },
  {
    slug: "regulamin",
    title: "Regulamin",
    description: "Warunki korzystania ze sklepu i zakupu produktów cyfrowych.",
    body:
      "Produkty oferowane przez Templify mają charakter cyfrowy i są udostępniane po skutecznym opłaceniu zamówienia. Klient ma prawo do zwrotu w ciągu 14 dni od zakupu zgodnie z regulaminem.",
  },
  {
    slug: "kontakt",
    title: "Kontakt",
    description: "Skontaktuj się z zespołem Templify.",
    body:
      "Masz pytania dotyczące zamówień, dostępu do biblioteki albo współpracy? Napisz do nas na adres kontakt@templify.store — odpisujemy w ciągu jednego dnia roboczego.",
  },
];

export const adminOrders: AdminOrderPreview[] = [
  {
    id: "TMPL-2026-1001",
    customer: "Marta Studio",
    email: "marta@example.com",
    amount: 299,
    status: "Opłacone",
    date: "2026-04-15",
    items: ["Pakiet Operacyjny Założyciela"],
  },
  {
    id: "TMPL-2026-1002",
    customer: "Kasia Digital",
    email: "kasia@example.com",
    amount: 149,
    status: "Nowe",
    date: "2026-04-16",
    items: ["Pakiet Onboardingu Klienta"],
  },
  {
    id: "TMPL-2026-1003",
    customer: "Piotr Consulting",
    email: "piotr@example.com",
    amount: 329,
    status: "Zrealizowane",
    date: "2026-04-17",
    items: ["Pakiet Sprzedaży i Dostarczania Studio"],
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

export function getBundleById(bundleId: string) {
  return bundles.find((bundle) => bundle.id === bundleId);
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

export function getLegalPage(slug: string) {
  return legalPages.find((page) => page.slug === slug);
}
