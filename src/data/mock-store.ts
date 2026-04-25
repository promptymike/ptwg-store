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
    slug: "budzet-domowy-dla-poczatkujacych",
    name: "Budżet Domowy dla Początkujących",
    category: "Finanse osobiste",
    shortDescription:
      "Praktyczny system budżetowania dla osób, które żyją od wypłaty do wypłaty. Bez Excela i bez wyrzeczeń.",
    description:
      "Krok po kroku przez podstawy zarządzania budżetem domowym. Pokazujemy, jak namierzyć subskrypcje i ukryte koszty, zaplanować wydatki na cały miesiąc i zbudować poduszkę finansową bez głodzenia się. 35 sekcji, format dopasowany do mobile — przeczytasz w 1-2 wieczory.",
    price: 49,
    compareAtPrice: 79,
    format: "HTML",
    pages: 35,
    tags: ["budżet", "oszczędzanie", "finanse", "początkujący"],
    rating: 4.9,
    salesLabel: "Najczęściej kupowany start",
    accent: "from-stone-900 via-amber-200 to-orange-100",
    coverGradient: "from-[#f7f4ea] via-[#ece3c9] to-[#ddd1ab]",
    includes: [
      "Plan tygodnia finansowego",
      "Lista 30 najczęstszych ukrytych kosztów",
      "Szablon śledzenia wydatków",
      "Checklisty oszczędnościowe",
    ],
    heroNote: "Pieniądze pod kontrolą w 30 dni",
    badge: "bestseller",
    bestseller: true,
    featured: true,
  },
  {
    id: "template-02",
    slug: "macierzynstwo-od-a-do-z",
    name: "Macierzyństwo od A do Z",
    category: "Macierzyństwo i rodzina",
    shortDescription:
      "Pełny przewodnik dla mam — od planowania ciąży, przez wszystkie trymestry, po pierwsze tygodnie po porodzie.",
    description:
      "Ten przewodnik prowadzi przez najważniejszy okres w życiu kobiety. Każdy trymestr, badania, suplementacja, aktywność fizyczna, zdrowie emocjonalne, poród i połóg — opisane praktycznie, z empatią i bez moralizowania. Powstał na bazie wiedzy medycznej i historii kilkudziesięciu mam.",
    price: 79,
    compareAtPrice: 119,
    format: "HTML",
    pages: 17,
    tags: ["macierzyństwo", "ciąża", "poród", "mama", "połóg"],
    rating: 5,
    salesLabel: "Wybór mam i przyszłych mam",
    accent: "from-neutral-900 via-rose-200 to-white",
    coverGradient: "from-[#fbf1ee] via-[#efd8d1] to-[#dcc2b9]",
    includes: [
      "Plan badań w każdym trymestrze",
      "Lista wyprawki noworodkowej",
      "Sprawdzone zalecenia żywieniowe",
      "Sekcja zdrowia emocjonalnego",
      "Karmienie piersią — praktyczny przewodnik",
    ],
    heroNote: "Ciąża, poród, połóg — wszystko w jednym miejscu",
    badge: "featured",
    bestseller: true,
    featured: true,
  },
  {
    id: "template-03",
    slug: "jak-dziala-gospodarka-podstawy-finansow",
    name: "Jak działa gospodarka? Podstawy finansów dla każdego",
    category: "Finanse osobiste",
    shortDescription:
      "Inflacja, kredyty, podatki, IKE i IKZE — zrozum zasady, które rządzą Twoimi pieniędzmi.",
    description:
      "Ten ebook tłumaczy, jak naprawdę działa gospodarka — bez żargonu i bez wykładów. Czym jest rynek, skąd biorą się ceny, dlaczego inflacja zjada oszczędności, jak banki tworzą pieniądz, po co są podatki i jak zaplanować emeryturę. Z przykładami z polskich realiów.",
    price: 39,
    compareAtPrice: 59,
    format: "HTML",
    pages: 13,
    tags: ["finanse", "ekonomia", "inflacja", "kredyty", "emerytura"],
    rating: 4.9,
    salesLabel: "Niezbędna baza wiedzy",
    accent: "from-stone-900 via-amber-200 to-white",
    coverGradient: "from-[#f9f3eb] via-[#eadbc8] to-[#dcc4a8]",
    includes: [
      "Słownik ekonomiczny bez żargonu",
      "Przykłady z polskich realiów",
      "Plan IKE / IKZE dla początkujących",
      "Strategie ochrony przed inflacją",
    ],
    heroNote: "Bez żargonu, z przykładami, praktycznie",
    badge: "new",
    featured: true,
  },
  {
    id: "template-04",
    slug: "adhd-planner-dla-doroslych",
    name: "ADHD Planner dla Dorosłych",
    category: "Produktywność i czas",
    shortDescription:
      "6 tygodni planera dla osób z ADHD. Bez sztywnych godzin, z miejscem na brain dump i celebrację małych zwycięstw.",
    description:
      "Większość plannerów zakłada, że masz dyscyplinę i koncentrację. Ten zakłada coś przeciwnego. Jedna decyzja dziennie, brain dump przed startem, brak sztywnych godzin, świętowanie tego, co zrobiłeś. 6 tygodni plus sekcje na cele kwartalne i notatki.",
    price: 59,
    compareAtPrice: 89,
    format: "HTML",
    pages: 10,
    tags: ["adhd", "planer", "koncentracja", "dorośli", "neuroróżnorodność"],
    rating: 4.9,
    salesLabel: "Bestseller wśród planerów",
    accent: "from-neutral-900 via-emerald-200 to-white",
    coverGradient: "from-[#f8f5f0] via-[#e8dfd2] to-[#d9cebf]",
    includes: [
      "6 tygodni dziennych planerów",
      "Brain dump templates",
      "Cele kwartalne i miesięczne",
      "Plan rytmu dnia bez sztywnych godzin",
      "Sekcja celebracji małych zwycięstw",
    ],
    heroNote: "Planner zaprojektowany pod ADHD — bez pułapek",
    badge: "bestseller",
    bestseller: true,
    featured: true,
  },
  {
    id: "template-05",
    slug: "mistrz-czasu",
    name: "Mistrz Czasu — Kompletny Przewodnik",
    category: "Produktywność i czas",
    shortDescription:
      "Kompendium o zarządzaniu czasem dla pracujących ludzi. 12 rozdziałów o priorytetach, pracy głębokiej i rutynach.",
    description:
      "Czas to Twój najcenniejszy zasób — ten przewodnik pokazuje, jak go odzyskać. Psychologia prokrastynacji, audyt czasu, priorytety, praca głęboka, detoks technologiczny, energia i regeneracja, rutyny, delegowanie, planowanie strategiczne. Praktyka, nie teoria.",
    price: 79,
    compareAtPrice: 129,
    format: "HTML",
    pages: 19,
    tags: ["czas", "produktywność", "skupienie", "rutyny"],
    rating: 4.8,
    salesLabel: "Najczęściej polecany na prezent",
    accent: "from-stone-900 via-violet-200 to-white",
    coverGradient: "from-[#f6f2f9] via-[#e8dff5] to-[#d5c6ef]",
    includes: [
      "Audyt czasu w 7 dni",
      "Framework priorytetów",
      "Plan pracy głębokiej",
      "Rutyny poranne i wieczorne",
      "Strategie delegowania i asertywności",
    ],
    heroNote: "Czas to Twój najcenniejszy zasób",
    badge: "featured",
    bestseller: true,
  },
  {
    id: "template-06",
    slug: "jak-schudnac-kompendium-dla-kobiet",
    name: "Jak Schudnąć — Kompendium dla Kobiet",
    category: "Zdrowie i dieta",
    shortDescription:
      "Naukowe podstawy odchudzania uwzględniające hormony, cykl menstruacyjny i rytm dnia. Bez głodzenia.",
    description:
      "Większość poradników odchudzania ignoruje fakt, że kobieca fizjologia jest inna. Ten ebook bierze pod uwagę estrogen, insulinę, kortyzol, leptynę i grelinę. Pokazuje fazy cyklu, NEAT, mit wolnego metabolizmu i co naprawdę działa. Bez restrykcyjnych diet i wyrzeczeń.",
    price: 69,
    compareAtPrice: 99,
    format: "HTML",
    pages: 68,
    tags: ["odchudzanie", "kobiety", "hormony", "metabolizm"],
    rating: 4.9,
    salesLabel: "Bestseller w kategorii dieta",
    accent: "from-rose-900 via-rose-200 to-white",
    coverGradient: "from-[#fdf0ec] via-[#efd9d2] to-[#e3c6bd]",
    includes: [
      "Profile dla każdej fazy życia",
      "Plan żywieniowy bez restrykcji",
      "Tabele kaloryczności",
      "Trening dopasowany do cyklu",
      "Strategie zarządzania stresem",
    ],
    heroNote: "Schudnij bez jojo — opracowane przez kobiety dla kobiet",
    badge: "featured",
    featured: true,
  },
  {
    id: "template-07",
    slug: "trening-w-domu",
    name: "Trening w Domu — Kompletny Przewodnik",
    category: "Fitness i ruch",
    shortDescription:
      "Kompletny program treningowy bez sprzętu. Schudnij, zbuduj mięśnie, wyrób nawyk — w salonie, kuchni, na tarasie.",
    description:
      "Twój dom to najlepsza siłownia. 7 wzorców ruchu, programy na odchudzanie i budowanie mięśni, plany tygodniowe, ćwiczenia z meblami i przedmiotami codziennymi. Trening dla całego ciała: górne, dolne partie, core. Praktycznie, bez ściemy.",
    price: 59,
    compareAtPrice: 89,
    format: "HTML",
    pages: 27,
    tags: ["fitness", "trening", "dom", "bez sprzętu"],
    rating: 4.8,
    salesLabel: "Najczęściej kupowany w styczniu",
    accent: "from-zinc-900 via-lime-200 to-stone-50",
    coverGradient: "from-[#f4f6ee] via-[#dde3c7] to-[#bccfa6]",
    includes: [
      "7 fundamentalnych wzorców ruchu",
      "Plan na odchudzanie",
      "Plan na budowanie mięśni",
      "Tygodniowe rozpiski treningowe",
      "Trening core i brzuszkami",
    ],
    heroNote: "Twój dom to najlepsza siłownia",
    badge: "new",
    featured: true,
  },
  {
    id: "template-08",
    slug: "kompendium-pracownika-uop-zlecenie",
    name: "Kompendium Pracownika — UoP vs Umowa Zlecenia",
    category: "Praca i kariera",
    shortDescription:
      "UoP, zlecenie, prawa, obowiązki, urlopy, wynagrodzenia. Wiedza, której nie uczą w szkole, a której potrzebujesz w pracy.",
    description:
      "37 sekcji o tym, co naprawdę warto wiedzieć o swojej umowie. Czym różni się UoP od zlecenia, kiedy zlecenie staje się umową o pracę, jakie masz prawa, kiedy pracodawca przesadza, jak liczyć urlop i wynagrodzenie. Bez prawniczego żargonu — z konkretem.",
    price: 49,
    compareAtPrice: 79,
    format: "HTML",
    pages: 37,
    tags: ["praca", "umowa", "uop", "zlecenie", "prawa"],
    rating: 4.7,
    salesLabel: "Niezbędne dla każdego pracującego",
    accent: "from-slate-900 via-sky-200 to-white",
    coverGradient: "from-[#eef4f6] via-[#cde0e6] to-[#a4c5cf]",
    includes: [
      "Porównanie UoP vs zlecenia",
      "Prawa pracownika krok po kroku",
      "Wynagrodzenie i potrącenia",
      "Czas pracy, urlopy, nadgodziny",
      "Kiedy zlecenie to ukryta UoP",
    ],
    heroNote: "Co naprawdę warto wiedzieć o swojej umowie",
    badge: "pack",
  },
];

export const bundles: Bundle[] = [
  {
    id: "bundle-01",
    name: "Pakiet Finansów Domowych",
    description:
      "Wszystko, co potrzebujesz, by ogarnąć pieniądze raz na zawsze. Budżet domowy + podstawy ekonomii w jednym zestawie.",
    price: 79,
    compareAtPrice: 88,
    accent: "from-stone-900 via-amber-200 to-white",
    productIds: ["template-01", "template-03"],
    perks: [
      "Praktyczny budżet i wiedza ekonomiczna w jednym pakiecie",
      "Idealne dla osób, które zaczynają porządki w finansach",
      "Materiały dopasowane do polskich realiów",
    ],
  },
  {
    id: "bundle-02",
    name: "Pakiet Produktywności i Czasu",
    description:
      "Ogarnij swój dzień, tydzień i miesiąc. Mistrz Czasu + ADHD Planner — dwa narzędzia, które realnie zmieniają codzienność.",
    price: 119,
    compareAtPrice: 138,
    accent: "from-slate-900 via-emerald-200 to-white",
    productIds: ["template-04", "template-05"],
    perks: [
      "Mniej chaosu, więcej zrobionego",
      "Działa też przy ADHD i trudnościach z koncentracją",
      "Praktyczne planery, nie tylko teoria",
    ],
  },
];

export const storeStats: StoreStat[] = [
  {
    id: "stat-01",
    label: "Natychmiastowy dostęp",
    value: "24/7",
    detail: "Pliki trafiają do Twojej biblioteki zaraz po płatności.",
  },
  {
    id: "stat-02",
    label: "Kurator katalogu",
    value: "8+",
    detail: "Ebooków napisanych przez praktyków, nie copywriterów.",
  },
  {
    id: "stat-03",
    label: "Średnia ocena",
    value: "4.9/5",
    detail: "Spójna jakość potwierdzona przez czytelniczki i czytelników.",
  },
  {
    id: "stat-04",
    label: "Obszary życia",
    value: String(CATEGORY_OPTIONS.length),
    detail: "Od finansów i zdrowia po macierzyństwo i kariera.",
  },
];

export const categoryHighlights: CategoryHighlight[] = [
  {
    slug: "finanse-osobiste",
    title: "Finanse osobiste",
    description:
      "Budżet, oszczędzanie, długi i podstawy ekonomii. Bez Excela i bez wyrzeczeń.",
    accent: "from-[#f7f4ea] via-[#ece3c9] to-[#ddd1ab]",
  },
  {
    slug: "zdrowie-dieta",
    title: "Zdrowie i dieta",
    description:
      "Odchudzanie z głową, hormony i jedzenie. Zdrowie na co dzień, bez restrykcji.",
    accent: "from-[#f4f6ee] via-[#dde3c7] to-[#bccfa6]",
  },
  {
    slug: "fitness-ruch",
    title: "Fitness i ruch",
    description:
      "Treningi w domu, plany ćwiczeń bez sprzętu, budowanie nawyku ruchu.",
    accent: "from-[#fdf0ec] via-[#efd9d2] to-[#e3c6bd]",
  },
  {
    slug: "macierzynstwo-rodzina",
    title: "Macierzyństwo i rodzina",
    description:
      "Ciąża, poród, połóg i pierwsze lata dziecka. Wsparcie dla mam i rodziców.",
    accent: "from-[#fbf1ee] via-[#efd8d1] to-[#dcc2b9]",
  },
  {
    slug: "produktywnosc-czas",
    title: "Produktywność i czas",
    description:
      "Zarządzanie czasem, planery i koncentracja. Także dla osób z ADHD.",
    accent: "from-[#f8f5f0] via-[#e8dfd2] to-[#d9cebf]",
  },
  {
    slug: "mindset-rozwoj",
    title: "Mindset i rozwój osobisty",
    description:
      "Szczęście, emocje i psychologia wpływu. Rozwój wewnętrzny w realnym życiu.",
    accent: "from-[#f7f1f7] via-[#e5deef] to-[#d7d1e4]",
  },
  {
    slug: "praca-kariera",
    title: "Praca i kariera",
    description:
      "Umowy, prawa pracownika, zakładanie firmy. Wiedza, której nie uczą w szkole.",
    accent: "from-[#f9f3ea] via-[#eadcc8] to-[#dfc7ae]",
  },
  {
    slug: "podroze-lifestyle",
    title: "Podróże i lifestyle",
    description:
      "Plany podróży, mądre wyjazdy i lekkie życie codzienne.",
    accent: "from-[#eef4f6] via-[#cde0e6] to-[#a4c5cf]",
  },
];

export const siteSections: SiteSectionContent[] = [
  {
    key: "hero",
    eyebrow: "Praktyczne ebooki i planery",
    title:
      "Praktyczne przewodniki, które wprowadzają porządek w codziennym życiu.",
    description:
      "Finanse, zdrowie, macierzyństwo, produktywność, kariera. Konkretne ebooki i planery, które realnie zmieniają to, jak żyjesz na co dzień. Bez teorii, bez ściemy.",
    body:
      "Dla osób, które chcą ogarnąć swoje życie krok po kroku — niezależnie od tego, czy chodzi o budżet, dietę, dziecko, czy lepszy plan dnia.",
    ctaLabel: "Przeglądaj ebooki",
    ctaHref: "/produkty",
  },
  {
    key: "featured",
    eyebrow: "Najczęściej kupowane",
    title:
      "Zacznij od ebooków, które realnie zmieniają codzienność.",
    description:
      "Każdy z tych przewodników został napisany przez praktyków: dla mam, dla osób z ADHD, dla wszystkich, którzy chcą ogarnąć swoje pieniądze i czas.",
    body:
      "Pobierz, przeczytaj wieczorem, zacznij wdrażać następnego dnia.",
    ctaLabel: "Zobacz cały katalog",
    ctaHref: "/produkty",
  },
  {
    key: "use-cases",
    eyebrow: "Wybierz obszar życia",
    title:
      "Wybierz dziedzinę, którą chcesz uporządkować jako pierwszą.",
    description:
      "Templify grupuje ebooki wokół realnych obszarów życia: finansów, zdrowia, fitnessu, macierzyństwa, produktywności, mindset, pracy i podróży.",
    body:
      "Każdy ebook to praktyczny przewodnik, nie kolejna teoria. Wybierz to, co potrzebujesz dziś.",
  },
  {
    key: "why-templify",
    eyebrow: "Dlaczego Templify",
    title:
      "Praktyczne na tyle, by realnie zmienić życie. Eleganckie na tyle, by chciało się je czytać.",
    description:
      "Każdy ebook jest zbudowany wokół jednego konkretnego obszaru życia. Bez ściemy, bez wodolejstwa. Wiedza, którą można od razu zastosować.",
    body:
      "Od pierwszego kontaktu po pobranie pliku — całe doświadczenie ma być spokojne, jasne i premium.",
  },
  {
    key: "how-it-works",
    eyebrow: "Jak to działa",
    title:
      "Wybierz, zapłać raz, pobierz natychmiast i od razu zacznij czytać.",
    description:
      "Wybierz ebook, dodaj do koszyka, opłać bezpiecznie online. Twoja biblioteka pojawi się od razu — możesz pobrać i czytać na telefonie, tablecie lub w przeglądarce.",
    body:
      "Bez czekania, bez ukrytych kroków, bez niejasnych terminów dostawy.",
  },
  {
    key: "faq",
    eyebrow: "Najczęstsze pytania",
    title:
      "Odpowiedzi, które rozwiewają ostatnie wątpliwości przed zakupem.",
    description:
      "FAQ wyjaśnia dostawę, format plików, prawa użytkowania i wsparcie. Bez nerwowego żargonu.",
    body:
      "Krótkie odpowiedzi. Spokojny ton. Konkrety zamiast komplikacji.",
  },
];

export const testimonials: Testimonial[] = [
  {
    id: "review-01",
    author: "Marta K.",
    role: "Mama dwojga, Warszawa",
    quote:
      "Macierzyństwo od A do Z to był mój ratunek w pierwszej ciąży. Konkretne, bez moralizowania, z prawdziwymi historiami innych mam.",
    score: "5.0",
  },
  {
    id: "review-02",
    author: "Kasia W.",
    role: "Freelancerka, ADHD",
    quote:
      "ADHD Planner naprawdę rozumie, jak działa nasz mózg. Pierwszy planer, który nie sprawił, że poczułam się gorsza po tygodniu.",
    score: "4.9",
  },
  {
    id: "review-03",
    author: "Piotr Z.",
    role: "Tata, finanse",
    quote:
      "Budżet Domowy dla Początkujących pomógł nam z żoną dogadać się co do pieniędzy. Po raz pierwszy mamy poduszkę finansową.",
    score: "4.8",
  },
];

export const faqItems: FaqItem[] = [
  {
    id: "faq-01",
    question: "W jakim formacie otrzymam ebook?",
    answer:
      "Większość naszych ebooków to plik HTML, który otwierasz w dowolnej przeglądarce — działa na telefonie, tablecie i komputerze. Format jest zawsze opisany na stronie produktu.",
  },
  {
    id: "faq-02",
    question: "Jak szybko pojawi się dostęp po zakupie?",
    answer:
      "Dostęp otrzymujesz natychmiast po opłaceniu zamówienia. Produkt pojawia się automatycznie w Twojej bibliotece w Templify.",
  },
  {
    id: "faq-03",
    question: "Czy mogę dzielić się ebookiem z rodziną?",
    answer:
      "Licencja jest osobista — kupujesz dla siebie. Nie możesz odsprzedawać ani udostępniać dalej, ale w ramach swojego gospodarstwa domowego możesz korzystać razem.",
  },
  {
    id: "faq-04",
    question: "Czy dostęp do plików jest bezterminowy?",
    answer:
      "Tak. Po zakupie produkt pozostaje w Twojej bibliotece bezterminowo — możesz go pobrać kiedykolwiek, bez limitów.",
  },
  {
    id: "faq-05",
    question: "Czy ebook działa na telefonie?",
    answer:
      "Tak. Wszystkie nasze ebooki są zaprojektowane z myślą o czytaniu na telefonie i tablecie. Otwierasz w przeglądarce — bez instalacji żadnej aplikacji.",
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
