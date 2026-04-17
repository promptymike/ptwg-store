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
      "Weekly operating system for founders who want visibility, focus and cleaner decisions.",
    description:
      "A premium planning workspace for weekly priorities, decision tracking, meeting notes and calmer execution. Built for people who want more signal and less operational noise.",
    price: 129,
    compareAtPrice: 189,
    format: "Notion + PDF guide",
    pages: 42,
    tags: ["notion", "planning", "founder"],
    rating: 4.9,
    salesLabel: "Founder favourite",
    accent: "from-stone-900 via-amber-200 to-orange-100",
    coverGradient: "from-[#f6efe6] via-[#f4e5d3] to-[#e7d5be]",
    includes: ["weekly dashboard", "priority planner", "meeting and decision log"],
    heroNote: "Run the week before it runs you.",
    badge: "featured",
    bestseller: true,
    featured: true,
  },
  {
    id: "template-02",
    slug: "client-onboarding-suite",
    name: "Client Onboarding Suite",
    category: "Sprzedaż i oferty",
    shortDescription:
      "Ready-made onboarding flows, questionnaires and client-facing assets for service businesses.",
    description:
      "A polished onboarding system with discovery forms, kickoff copy and delivery checklists. Ideal for studios, freelancers and premium service brands.",
    price: 149,
    compareAtPrice: 219,
    format: "Docs + PDF + checklist",
    pages: 58,
    tags: ["onboarding", "client-experience", "service-business"],
    rating: 5,
    salesLabel: "Best for premium services",
    accent: "from-neutral-900 via-emerald-200 to-white",
    coverGradient: "from-[#f7f4ef] via-[#ece6dc] to-[#ddd5c7]",
    includes: ["discovery form", "kickoff pack", "client communication templates"],
    heroNote: "Look organised before the first call.",
    badge: "bestseller",
    bestseller: true,
    featured: true,
  },
  {
    id: "template-03",
    slug: "launch-offer-kit",
    name: "Launch Offer Kit",
    category: "Sprzedaż i oferty",
    shortDescription:
      "Sales-page prompts, launch checklist and offer messaging templates for digital products.",
    description:
      "A conversion-first launch pack for creators and digital brands that want clearer messaging, faster page creation and a calmer launch week.",
    price: 119,
    compareAtPrice: 169,
    format: "PDF + swipe files",
    pages: 48,
    tags: ["launch", "sales-page", "offer"],
    rating: 4.8,
    salesLabel: "Fastest route to launch clarity",
    accent: "from-stone-900 via-rose-200 to-amber-50",
    coverGradient: "from-[#fbf0ec] via-[#f3dfd9] to-[#e8c9bf]",
    includes: ["launch checklist", "offer messaging prompts", "CTA and sales page blocks"],
    heroNote: "Sell the outcome, not the workload.",
    badge: "new",
    featured: true,
  },
  {
    id: "template-04",
    slug: "content-engine-90",
    name: "Content Engine 90",
    category: "Content i marketing",
    shortDescription:
      "A premium content planning system that turns strategy into 90 days of reusable execution.",
    description:
      "Content planning templates for campaigns, repurposing and weekly publishing. Built to help small teams ship more consistently with better editorial judgement.",
    price: 139,
    compareAtPrice: 199,
    format: "Notion + PDF",
    pages: 54,
    tags: ["content", "marketing", "repurposing"],
    rating: 4.9,
    salesLabel: "Editorial planning bestseller",
    accent: "from-slate-900 via-sky-200 to-white",
    coverGradient: "from-[#f4f3ef] via-[#e3e6e7] to-[#d8dde3]",
    includes: ["90-day content map", "repurposing planner", "weekly execution board"],
    heroNote: "Turn strategy into publishable momentum.",
    badge: "featured",
    bestseller: true,
    featured: true,
  },
  {
    id: "template-05",
    slug: "invoice-cashflow-pack",
    name: "Invoice & Cashflow Pack",
    category: "Finanse i operacje",
    shortDescription:
      "Templates for invoices, pricing, cashflow tracking and finance rituals without spreadsheet chaos.",
    description:
      "A finance operating pack for creators and boutique businesses who want cleaner numbers, calmer reviews and more confidence in pricing decisions.",
    price: 109,
    compareAtPrice: 149,
    format: "Sheet + PDF",
    pages: 36,
    tags: ["finance", "invoices", "cashflow"],
    rating: 4.8,
    salesLabel: "Operations essential",
    accent: "from-zinc-900 via-lime-200 to-stone-50",
    coverGradient: "from-[#f8f5ea] via-[#ece4c8] to-[#ddd2ad]",
    includes: ["invoice workflow", "cashflow tracker", "pricing planner"],
    heroNote: "Keep the business calm behind the scenes.",
    badge: "pack",
    bestseller: true,
  },
  {
    id: "template-06",
    slug: "crm-pipeline-template",
    name: "CRM Pipeline Template",
    category: "Sprzedaż i oferty",
    shortDescription:
      "A polished deal pipeline template for freelancers, studios and boutique agencies.",
    description:
      "Track leads, follow-ups and proposals in one clean workflow that improves visibility without turning into admin overload.",
    price: 129,
    compareAtPrice: 179,
    format: "Notion + CRM board",
    pages: 44,
    tags: ["crm", "sales", "pipeline"],
    rating: 4.7,
    salesLabel: "Sales visibility upgrade",
    accent: "from-stone-900 via-violet-200 to-white",
    coverGradient: "from-[#f6f2f9] via-[#e8dff5] to-[#d5c6ef]",
    includes: ["lead stages", "follow-up templates", "proposal tracker"],
    heroNote: "See what is moving and what is stuck.",
    badge: "featured",
  },
  {
    id: "template-07",
    slug: "focus-desk-planner",
    name: "Focus Desk Planner",
    category: "Produktywność osobista",
    shortDescription:
      "A light editorial planner for deep work, weekly priorities and distraction-free execution.",
    description:
      "Designed for people who want a more intentional working day with fewer tabs open mentally and operationally.",
    price: 89,
    compareAtPrice: 129,
    format: "PDF",
    pages: 52,
    tags: ["focus", "productivity", "planning"],
    rating: 4.8,
    salesLabel: "Most giftable productivity template",
    accent: "from-neutral-900 via-yellow-100 to-white",
    coverGradient: "from-[#f7f3ee] via-[#ece3d5] to-[#ddd1c0]",
    includes: ["deep work planner", "weekly reset", "distraction-free daily pages"],
    heroNote: "A cleaner day starts with a better system.",
    badge: "new",
    featured: true,
  },
  {
    id: "template-08",
    slug: "brand-brief-workbook",
    name: "Brand Brief Workbook",
    category: "Content i marketing",
    shortDescription:
      "Structured workshop template to align brand strategy before design, copy and launch.",
    description:
      "A calm, professional workbook for clarifying positioning, audience and creative direction before any design work begins.",
    price: 99,
    compareAtPrice: 149,
    format: "PDF workbook",
    pages: 40,
    tags: ["brand", "workbook", "strategy"],
    rating: 4.9,
    salesLabel: "Perfect pre-design workshop",
    accent: "from-slate-900 via-pink-200 to-white",
    coverGradient: "from-[#fbf2f4] via-[#eedde4] to-[#dfc7d1]",
    includes: ["brand positioning prompts", "audience clarity worksheets", "creative direction notes"],
    heroNote: "Clarity before design saves weeks later.",
    badge: "bestseller",
  },
  {
    id: "template-09",
    slug: "proposal-template-library",
    name: "Proposal Template Library",
    category: "Sprzedaż i oferty",
    shortDescription:
      "Proposal, scope and pricing templates that help close projects with more clarity and confidence.",
    description:
      "A premium proposal system for productised services and boutique engagements. Use it to shorten turnaround time without lowering perceived value.",
    price: 119,
    compareAtPrice: 179,
    format: "Docs + PDF",
    pages: 47,
    tags: ["proposal", "pricing", "sales"],
    rating: 4.8,
    salesLabel: "Closing system starter",
    accent: "from-zinc-900 via-amber-200 to-white",
    coverGradient: "from-[#f9f3eb] via-[#eadbc8] to-[#dcc4a8]",
    includes: ["proposal templates", "pricing scenarios", "scope framework"],
    heroNote: "Close premium projects with more confidence.",
    badge: "pack",
  },
];

export const bundles: Bundle[] = [
  {
    id: "bundle-01",
    name: "Founder's Operating Stack",
    description:
      "A premium starter bundle for planning, content execution and cleaner weekly operations.",
    price: 299,
    compareAtPrice: 357,
    accent: "from-stone-900 via-amber-200 to-white",
    productIds: ["template-01", "template-04", "template-07"],
    perks: [
      "systems for planning, shipping and weekly reset",
      "best starting point for solo founders and consultants",
      "one aesthetic across every operational touchpoint",
    ],
  },
  {
    id: "bundle-02",
    name: "Studio Sales & Delivery Pack",
    description:
      "Everything needed to pitch, onboard and manage clients like a more mature brand.",
    price: 329,
    compareAtPrice: 397,
    accent: "from-slate-900 via-emerald-200 to-white",
    productIds: ["template-02", "template-06", "template-09"],
    perks: [
      "cleaner sales pipeline and faster onboarding",
      "ideal for boutique studios and premium freelancers",
      "reduces repeated setup work across every new client",
    ],
  },
];

export const storeStats: StoreStat[] = [
  {
    id: "stat-01",
    label: "Instant delivery",
    value: "24/7",
    detail: "products land in the library right after payment",
  },
  {
    id: "stat-02",
    label: "Curated systems",
    value: "9",
    detail: "templates designed around workflows, not file dumps",
  },
  {
    id: "stat-03",
    label: "Average rating",
    value: "4.9/5",
    detail: "premium positioning backed by practical usability",
  },
  {
    id: "stat-04",
    label: "Core categories",
    value: String(CATEGORY_OPTIONS.length),
    detail: "from planning and content to offers and finance ops",
  },
];

export const categoryHighlights: CategoryHighlight[] = [
  {
    slug: "planowanie-i-notion",
    title: "Planowanie i Notion",
    description:
      "Weekly operating systems, founder dashboards and calm execution templates.",
    accent: "from-[#f9f3ea] via-[#eadcc8] to-[#dfc7ae]",
  },
  {
    slug: "content-i-marketing",
    title: "Content i marketing",
    description:
      "Editorial workflows, brand workbooks and systems that reduce content fatigue.",
    accent: "from-[#f7f1f7] via-[#e5deef] to-[#d7d1e4]",
  },
  {
    slug: "sprzedaz-i-oferty",
    title: "Sprzedaż i oferty",
    description:
      "Launch kits, proposal libraries and sales assets built for premium positioning.",
    accent: "from-[#fdf0ec] via-[#efd9d2] to-[#e3c6bd]",
  },
  {
    slug: "finanse-i-operacje",
    title: "Finanse i operacje",
    description:
      "Pricing, invoices and cashflow systems for a calmer back office.",
    accent: "from-[#f7f4ea] via-[#ece3c9] to-[#ddd1ab]",
  },
  {
    slug: "produktywnosc-osobista",
    title: "Produktywność osobista",
    description:
      "Light editorial planners that help you protect attention and energy.",
    accent: "from-[#f8f5f0] via-[#e8dfd2] to-[#d9cebf]",
  },
];

export const siteSections: SiteSectionContent[] = [
  {
    key: "hero",
    eyebrow: "Templify",
    title: "Premium digital templates for brands that want to look calm, credible and expensive.",
    description:
      "Sell the result, not the file. Templify packages systems, templates and launch assets into a storefront designed for trust and conversion.",
    body:
      "Built for creators, boutique studios, consultants and digital businesses that want elegant systems instead of generic downloads.",
    ctaLabel: "Browse templates",
    ctaHref: "/produkty",
  },
  {
    key: "featured",
    eyebrow: "Featured products",
    title: "Start with the templates teams buy when they want momentum fast.",
    description:
      "Every featured product is selected for clear transformation, premium presentation and practical day-one implementation.",
    body:
      "Use these as the first layer of a stronger offer stack, better onboarding or cleaner weekly operations.",
  },
  {
    key: "use-cases",
    eyebrow: "Use cases",
    title: "Choose the system for the exact part of the business you want to clean up next.",
    description:
      "Templify groups templates around real workflows: planning, content, sales, finance and operational calm.",
    body:
      "That means customers navigate by outcome, not by abstract file type.",
  },
  {
    key: "why-templify",
    eyebrow: "Why Templify",
    title: "Elegant enough to feel premium. Practical enough to change the way work gets done.",
    description:
      "Every product is framed around trust, speed and implementation. The brand feels expensive because the experience is structured.",
    body:
      "From landing page to library, the product layer is designed to remove friction and increase confidence at every step.",
  },
  {
    key: "how-it-works",
    eyebrow: "How it works",
    title: "Choose, pay once, download instantly and put the system to work.",
    description:
      "The flow is built for simplicity: add to cart, complete Stripe checkout, access the files from your library and use them straight away.",
    body:
      "No waiting for manual fulfilment, no hidden steps, no vague delivery expectations.",
  },
  {
    key: "faq",
    eyebrow: "FAQ",
    title: "Answer the last objections before they slow down checkout.",
    description:
      "Use the FAQ block to clarify delivery, usage rights, formats and support without breaking the premium rhythm of the page.",
    body:
      "Short answers. Calm tone. Zero legal panic on the storefront.",
  },
];

export const testimonials: Testimonial[] = [
  {
    id: "review-01",
    author: "Marta",
    role: "studio brandingowe",
    quote:
      "Client Onboarding Suite sprawił, że od pierwszego kontaktu wyglądamy dużo bardziej premium i nie gubimy już etapów współpracy.",
    score: "5.0",
  },
  {
    id: "review-02",
    author: "Kasia",
    role: "twórczyni kursów online",
    quote:
      "Launch Offer Kit pomógł mi skrócić przygotowanie kampanii o kilka dni. Wszystko było gotowe, eleganckie i spójne.",
    score: "4.9",
  },
  {
    id: "review-03",
    author: "Piotr",
    role: "freelance consultant",
    quote:
      "Invoice & Cashflow Pack dał mi prosty rytm finansowy bez przeprojektowywania całego zaplecza biznesu.",
    score: "4.8",
  },
];

export const faqItems: FaqItem[] = [
  {
    id: "faq-01",
    question: "W jakim formacie dostanę produkt?",
    answer:
      "W zależności od produktu otrzymasz PDF, workspace Notion, arkusz lub pakiet materiałów pomocniczych. Format jest zawsze opisany na stronie produktu.",
  },
  {
    id: "faq-02",
    question: "Jak szybko pojawi się dostęp po zakupie?",
    answer:
      "Po potwierdzeniu płatności Stripe produkt trafia automatycznie do biblioteki użytkownika.",
  },
  {
    id: "faq-03",
    question: "Czy mogę używać templatek komercyjnie?",
    answer:
      "Tak, w ramach własnej pracy lub biznesu. Nie możesz jednak odsprzedawać tych materiałów jako własnych.",
  },
  {
    id: "faq-04",
    question: "Czy checkout wymaga konta?",
    answer:
      "Tak. Konto pozwala bezpiecznie przypisać zakupy do biblioteki i później pobierać pliki z jednego miejsca.",
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
      "Produkty oferowane przez Templify mają charakter cyfrowy i są udostępniane po skutecznym opłaceniu zamówienia.",
  },
  {
    slug: "kontakt",
    title: "Kontakt",
    description: "Skontaktuj się z zespołem Templify.",
    body:
      "Masz pytania dotyczące zamówień, dostępu do biblioteki albo współpracy? Napisz do nas na adres kontakt@templify.store.",
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
    items: ["Founder's Operating Stack"],
  },
  {
    id: "TMPL-2026-1002",
    customer: "Kasia Digital",
    email: "kasia@example.com",
    amount: 149,
    status: "Nowe",
    date: "2026-04-16",
    items: ["Client Onboarding Suite"],
  },
  {
    id: "TMPL-2026-1003",
    customer: "Piotr Consulting",
    email: "piotr@example.com",
    amount: 329,
    status: "Zrealizowane",
    date: "2026-04-17",
    items: ["Studio Sales & Delivery Pack"],
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

export function getLegalPage(slug: string) {
  return legalPages.find((page) => page.slug === slug);
}
