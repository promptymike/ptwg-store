// Soft-launch helper: inspect current Supabase data and prepare a plan.
// Run with: node scripts/softlaunch.mjs

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const eq = line.indexOf("=");
      return [line.slice(0, eq).trim(), line.slice(eq + 1).trim()];
    }),
);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const [, , command] = process.argv;

async function inspect() {
  const { data: cats } = await supabase
    .from("categories")
    .select("id, name, slug, is_active, sort_order")
    .order("sort_order");
  console.log("\n=== Categories ===");
  for (const c of cats) {
    console.log(
      `[${c.is_active ? "✓" : "x"}] sort=${c.sort_order} ${c.name} (${c.slug}) id=${c.id.slice(0, 8)}`,
    );
  }

  const { data: prods } = await supabase
    .from("products")
    .select("id, slug, name, status, is_active, category_id")
    .order("created_at", { ascending: false });
  console.log("\n=== Products ===");
  for (const p of prods) {
    const cat = cats.find((c) => c.id === p.category_id);
    console.log(
      `[${p.status}/${p.is_active ? "active" : "inactive"}] ${p.slug.slice(0, 50)} → ${cat?.name ?? "??"}`,
    );
  }

  const { data: orders } = await supabase
    .from("orders")
    .select("id, total, status, created_at, user_id")
    .order("created_at", { ascending: false })
    .limit(5);
  console.log("\n=== Recent orders ===");
  for (const o of orders) {
    console.log(
      `[${o.status}] ${o.id.slice(0, 8)} ${o.total / 100} zł ${o.created_at.slice(0, 10)}`,
    );
  }

  const { data: lib } = await supabase
    .from("library_items")
    .select("id, user_id, product_id");
  console.log(`\nLibrary items: ${lib?.length ?? 0}`);
}

// New lifestyle categories aligned with the real PTWG ebooks in Drive.
const NEW_CATEGORIES = [
  {
    name: "Finanse osobiste",
    slug: "finanse-osobiste",
    description:
      "Budżet, oszczędzanie, długi, podstawy ekonomii. Ogarnij pieniądze bez Excela i bez wyrzeczeń.",
    sort_order: 10,
  },
  {
    name: "Zdrowie i dieta",
    slug: "zdrowie-dieta",
    description:
      "Odchudzanie, hormony, jedzenie. Zdrowie na co dzień bez restrykcyjnych planów.",
    sort_order: 20,
  },
  {
    name: "Fitness i ruch",
    slug: "fitness-ruch",
    description:
      "Treningi w domu, plany ćwiczeń bez sprzętu, budowa nawyku ruchu.",
    sort_order: 30,
  },
  {
    name: "Macierzyństwo i rodzina",
    slug: "macierzynstwo-rodzina",
    description:
      "Ciąża, poród, połóg, pierwsze lata dziecka. Wsparcie dla mam i rodziców.",
    sort_order: 40,
  },
  {
    name: "Produktywność i czas",
    slug: "produktywnosc-czas",
    description:
      "Zarządzanie czasem, planery, koncentracja. Także dla osób z ADHD.",
    sort_order: 50,
  },
  {
    name: "Mindset i rozwój osobisty",
    slug: "mindset-rozwoj",
    description:
      "Szczęście, emocje, psychologia wpływu. Rozwój wewnętrzny w realnym życiu.",
    sort_order: 60,
  },
  {
    name: "Praca i kariera",
    slug: "praca-kariera",
    description:
      "Umowy o pracę, prawa pracownika, zakładanie firmy. Wiedza, której nie uczą w szkole.",
    sort_order: 70,
  },
  {
    name: "Podróże i lifestyle",
    slug: "podroze-lifestyle",
    description:
      "Plany podróży, mądre wyjazdy, lekkie życie codzienne.",
    sort_order: 80,
  },
];

async function migrateCategories() {
  console.log("\n=== Migrating categories ===");

  // 1. Insert new ones (idempotent — upsert by slug)
  for (const cat of NEW_CATEGORIES) {
    const { data: existing } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", cat.slug)
      .maybeSingle();
    if (existing) {
      console.log(`  ✓ exists: ${cat.name}`);
      continue;
    }
    const { error } = await supabase.from("categories").insert({
      ...cat,
      is_active: true,
    });
    if (error) {
      console.log(`  ✗ failed ${cat.name}: ${error.message}`);
    } else {
      console.log(`  + added: ${cat.name}`);
    }
  }

  // 2. Get id of new "Macierzyństwo" to reassign existing ebook
  const { data: macierzynstwoCat } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", "macierzynstwo-rodzina")
    .single();

  // 3. Reassign ebook-macierzynski (real product we keep)
  const { error: reassignError } = await supabase
    .from("products")
    .update({ category_id: macierzynstwoCat.id })
    .eq("slug", "ebook-macierzynski");
  if (reassignError) {
    console.log(`  ✗ reassign ebook-macierzynski: ${reassignError.message}`);
  } else {
    console.log(`  → reassigned ebook-macierzynski to Macierzyństwo i rodzina`);
  }

  // 4. Archive old products that don't fit the new positioning.
  //    We keep them in DB so existing library entries / orders stay intact,
  //    but flip is_active=false so they vanish from the storefront.
  const archive = [
    "testowy-pakiet-operacyjny", // QA artifact
    "proposal-template-library", // B2B template, doesn't fit lifestyle
  ];
  for (const slug of archive) {
    const { error } = await supabase
      .from("products")
      .update({ is_active: false, status: "archived" })
      .eq("slug", slug);
    if (error) console.log(`  ✗ archive ${slug}: ${error.message}`);
    else console.log(`  ⊘ archived: ${slug}`);
  }

  // 5. Junk product: just deactivate (FK from library_items prevents delete).
  const { data: junkProducts } = await supabase
    .from("products")
    .select("id, slug")
    .like("slug", "sadaaaa%");
  for (const p of junkProducts ?? []) {
    const { error } = await supabase
      .from("products")
      .update({ is_active: false, status: "archived" })
      .eq("id", p.id);
    if (error) console.log(`  ✗ junk ${p.slug.slice(0, 30)}: ${error.message}`);
    else console.log(`  ⊘ archived junk: ${p.slug.slice(0, 30)}`);
  }

  // 6. Deactivate old categories (they remain for FK consistency on
  //    archived products, but won't appear in the filter bar).
  const oldSlugs = [
    "planowanie-i-notion",
    "content-i-marketing",
    "sprzedaz-i-oferty",
    "finanse-i-operacje",
    "produktywnosc-osobista",
  ];
  for (const slug of oldSlugs) {
    const { error } = await supabase
      .from("categories")
      .update({ is_active: false })
      .eq("slug", slug);
    if (error) console.log(`  ✗ deactivate ${slug}: ${error.message}`);
    else console.log(`  ⊘ deactivated old category: ${slug}`);
  }
}

// Soft-launch product catalog. Each entry maps a real ebook from
// PTWG / Filar 1 - E - produkty (Drive) to a Supabase product row.
// File paths point to ebook-staging/, where we put the downloaded
// .html files. Cover image is left null — we use cover_gradient
// only for the soft launch (proper covers come in wave 2).
const SOFT_LAUNCH_PRODUCTS = [
  {
    file: "ebook-staging/budzet-domowy.zip",
    slug: "budzet-domowy-dla-poczatkujacych",
    name: "Budżet Domowy dla Początkujących",
    categorySlug: "finanse-osobiste",
    price: 49,
    compareAtPrice: 79,
    pages: 35,
    format: "ZIP (HTML)",
    salesLabel: "Najczęściej kupowany start",
    heroNote: "Pieniądze pod kontrolą w 30 dni",
    badge: "bestseller",
    bestseller: true,
    featured: true,
    coverGradient: "from-[#f7f4ea] via-[#ece3c9] to-[#ddd1ab]",
    accent: "from-stone-900 via-amber-200 to-orange-100",
    shortDescription:
      "Praktyczny system budżetowania dla osób, które żyją od wypłaty do wypłaty. Bez Excela i bez wyrzeczeń.",
    description:
      "Krok po kroku przez podstawy zarządzania budżetem domowym. Pokazujemy, jak namierzyć subskrypcje i ukryte koszty, zaplanować wydatki na cały miesiąc i zbudować poduszkę finansową bez głodzenia się. 35 sekcji, format dopasowany do mobile — przeczytasz w 1-2 wieczory.",
    includes: [
      "Plan tygodnia finansowego",
      "Lista 30 najczęstszych ukrytych kosztów",
      "Szablon śledzenia wydatków",
      "Checklisty oszczędnościowe",
    ],
    tags: ["budżet", "oszczędzanie", "finanse", "początkujący"],
    sortOrder: 10,
    featuredOrder: 10,
  },
  {
    file: "ebook-staging/macierzynstwo.zip",
    slug: "macierzynstwo-od-a-do-z",
    name: "Macierzyństwo od A do Z",
    categorySlug: "macierzynstwo-rodzina",
    price: 79,
    compareAtPrice: 119,
    pages: 17,
    format: "ZIP (HTML)",
    salesLabel: "Wybór mam i przyszłych mam",
    heroNote: "Ciąża, poród, połóg — wszystko w jednym miejscu",
    badge: "featured",
    bestseller: true,
    featured: true,
    coverGradient: "from-[#fbf1ee] via-[#efd8d1] to-[#dcc2b9]",
    accent: "from-neutral-900 via-rose-200 to-white",
    shortDescription:
      "Pełny przewodnik dla mam — od planowania ciąży, przez wszystkie trymestry, po pierwsze tygodnie po porodzie.",
    description:
      "Ten przewodnik prowadzi przez najważniejszy okres w życiu kobiety. Każdy trymestr, badania, suplementacja, aktywność fizyczna, zdrowie emocjonalne, poród i połóg — opisane praktycznie, z empatią i bez moralizowania. Powstał na bazie wiedzy medycznej i historii kilkudziesięciu mam.",
    includes: [
      "Plan badań w każdym trymestrze",
      "Lista wyprawki noworodkowej",
      "Sprawdzone zalecenia żywieniowe",
      "Sekcja zdrowia emocjonalnego",
      "Karmienie piersią — praktyczny przewodnik",
    ],
    tags: ["macierzyństwo", "ciąża", "poród", "mama", "połóg"],
    sortOrder: 20,
    featuredOrder: 20,
  },
  {
    file: "ebook-staging/podstawy-finansow.zip",
    slug: "jak-dziala-gospodarka-podstawy-finansow",
    name: "Jak działa gospodarka? Podstawy finansów dla każdego",
    categorySlug: "finanse-osobiste",
    price: 39,
    compareAtPrice: 59,
    pages: 13,
    format: "ZIP (HTML)",
    salesLabel: "Niezbędna baza wiedzy",
    heroNote: "Bez żargonu, z przykładami, praktycznie",
    badge: "new",
    bestseller: false,
    featured: true,
    coverGradient: "from-[#f9f3eb] via-[#eadbc8] to-[#dcc4a8]",
    accent: "from-stone-900 via-amber-200 to-white",
    shortDescription:
      "Inflacja, kredyty, podatki, IKE i IKZE — zrozum zasady, które rządzą Twoimi pieniędzmi.",
    description:
      "Ten ebook tłumaczy, jak naprawdę działa gospodarka — bez żargonu i bez wykładów. Czym jest rynek, skąd biorą się ceny, dlaczego inflacja zjada oszczędności, jak banki tworzą pieniądz, po co są podatki i jak zaplanować emeryturę. Z przykładami z polskich realiów.",
    includes: [
      "Słownik ekonomiczny bez żargonu",
      "Przykłady z polskich realiów",
      "Plan IKE / IKZE dla początkujących",
      "Strategie ochrony przed inflacją",
    ],
    tags: ["finanse", "ekonomia", "inflacja", "kredyty", "emerytura"],
    sortOrder: 30,
    featuredOrder: 30,
  },
  {
    file: "ebook-staging/adhd-planner.zip",
    slug: "adhd-planner-dla-doroslych",
    name: "ADHD Planner dla Dorosłych",
    categorySlug: "produktywnosc-czas",
    price: 59,
    compareAtPrice: 89,
    pages: 10,
    format: "ZIP (HTML)",
    salesLabel: "Bestseller wśród planerów",
    heroNote: "Planner zaprojektowany pod ADHD — bez pułapek",
    badge: "bestseller",
    bestseller: true,
    featured: true,
    coverGradient: "from-[#f8f5f0] via-[#e8dfd2] to-[#d9cebf]",
    accent: "from-neutral-900 via-emerald-200 to-white",
    shortDescription:
      "6 tygodni planera dla osób z ADHD. Bez sztywnych godzin, z miejscem na brain dump i celebrację małych zwycięstw.",
    description:
      "Większość plannerów zakłada, że masz dyscyplinę i koncentrację. Ten zakłada coś przeciwnego. Jedna decyzja dziennie, brain dump przed startem, brak sztywnych godzin, świętowanie tego, co zrobiłeś. 6 tygodni plus sekcje na cele kwartalne i notatki.",
    includes: [
      "6 tygodni dziennych planerów",
      "Brain dump templates",
      "Cele kwartalne i miesięczne",
      "Plan rytmu dnia bez sztywnych godzin",
      "Sekcja celebracji małych zwycięstw",
    ],
    tags: ["adhd", "planer", "koncentracja", "dorośli", "neuroróżnorodność"],
    sortOrder: 40,
    featuredOrder: 40,
  },
  {
    file: "ebook-staging/mistrz-czasu.zip",
    slug: "mistrz-czasu",
    name: "Mistrz Czasu — Kompletny Przewodnik",
    categorySlug: "produktywnosc-czas",
    price: 79,
    compareAtPrice: 129,
    pages: 19,
    format: "ZIP (HTML)",
    salesLabel: "Najczęściej polecany na prezent",
    heroNote: "Czas to Twój najcenniejszy zasób",
    badge: "featured",
    bestseller: true,
    featured: false,
    coverGradient: "from-[#f6f2f9] via-[#e8dff5] to-[#d5c6ef]",
    accent: "from-stone-900 via-violet-200 to-white",
    shortDescription:
      "Kompendium o zarządzaniu czasem dla pracujących ludzi. 12 rozdziałów o priorytetach, pracy głębokiej i rutynach.",
    description:
      "Czas to Twój najcenniejszy zasób — ten przewodnik pokazuje, jak go odzyskać. Psychologia prokrastynacji, audyt czasu, priorytety, praca głęboka, detoks technologiczny, energia i regeneracja, rutyny, delegowanie, planowanie strategiczne. Praktyka, nie teoria.",
    includes: [
      "Audyt czasu w 7 dni",
      "Framework priorytetów",
      "Plan pracy głębokiej",
      "Rutyny poranne i wieczorne",
      "Strategie delegowania i asertywności",
    ],
    tags: ["czas", "produktywność", "skupienie", "rutyny"],
    sortOrder: 50,
    featuredOrder: 50,
  },
  {
    file: "ebook-staging/jak-schudnac.zip",
    slug: "jak-schudnac-kompendium-dla-kobiet",
    name: "Jak Schudnąć — Kompendium dla Kobiet",
    categorySlug: "zdrowie-dieta",
    price: 69,
    compareAtPrice: 99,
    pages: 68,
    format: "ZIP (HTML)",
    salesLabel: "Bestseller w kategorii dieta",
    heroNote: "Schudnij bez jojo — opracowane przez kobiety dla kobiet",
    badge: "featured",
    bestseller: false,
    featured: true,
    coverGradient: "from-[#fdf0ec] via-[#efd9d2] to-[#e3c6bd]",
    accent: "from-rose-900 via-rose-200 to-white",
    shortDescription:
      "Naukowe podstawy odchudzania uwzględniające hormony, cykl menstruacyjny i rytm dnia. Bez głodzenia.",
    description:
      "Większość poradników odchudzania ignoruje fakt, że kobieca fizjologia jest inna. Ten ebook bierze pod uwagę estrogen, insulinę, kortyzol, leptynę i grelinę. Pokazuje fazy cyklu, NEAT, mit wolnego metabolizmu i co naprawdę działa. Bez restrykcyjnych diet i wyrzeczeń.",
    includes: [
      "Profile dla każdej fazy życia",
      "Plan żywieniowy bez restrykcji",
      "Tabele kaloryczności",
      "Trening dopasowany do cyklu",
      "Strategie zarządzania stresem",
    ],
    tags: ["odchudzanie", "kobiety", "hormony", "metabolizm"],
    sortOrder: 60,
    featuredOrder: 60,
  },
  {
    file: "ebook-staging/trening-w-domu.zip",
    slug: "trening-w-domu",
    name: "Trening w Domu — Kompletny Przewodnik",
    categorySlug: "fitness-ruch",
    price: 59,
    compareAtPrice: 89,
    pages: 27,
    format: "ZIP (HTML)",
    salesLabel: "Najczęściej kupowany w styczniu",
    heroNote: "Twój dom to najlepsza siłownia",
    badge: "new",
    bestseller: false,
    featured: true,
    coverGradient: "from-[#f4f6ee] via-[#dde3c7] to-[#bccfa6]",
    accent: "from-zinc-900 via-lime-200 to-stone-50",
    shortDescription:
      "Kompletny program treningowy bez sprzętu. Schudnij, zbuduj mięśnie, wyrób nawyk — w salonie, kuchni, na tarasie.",
    description:
      "Twój dom to najlepsza siłownia. 7 wzorców ruchu, programy na odchudzanie i budowanie mięśni, plany tygodniowe, ćwiczenia z meblami i przedmiotami codziennymi. Trening dla całego ciała: górne, dolne partie, core. Praktycznie, bez ściemy.",
    includes: [
      "7 fundamentalnych wzorców ruchu",
      "Plan na odchudzanie",
      "Plan na budowanie mięśni",
      "Tygodniowe rozpiski treningowe",
      "Trening core i brzuszkami",
    ],
    tags: ["fitness", "trening", "dom", "bez sprzętu"],
    sortOrder: 70,
    featuredOrder: 70,
  },
  {
    file: "ebook-staging/kompendium-pracownika.zip",
    slug: "kompendium-pracownika-uop-zlecenie",
    name: "Kompendium Pracownika — UoP vs Umowa Zlecenia",
    categorySlug: "praca-kariera",
    price: 49,
    compareAtPrice: 79,
    pages: 37,
    format: "ZIP (HTML)",
    salesLabel: "Niezbędne dla każdego pracującego",
    heroNote: "Co naprawdę warto wiedzieć o swojej umowie",
    badge: "pack",
    bestseller: false,
    featured: false,
    coverGradient: "from-[#eef4f6] via-[#cde0e6] to-[#a4c5cf]",
    accent: "from-slate-900 via-sky-200 to-white",
    shortDescription:
      "UoP, zlecenie, prawa, obowiązki, urlopy, wynagrodzenia. Wiedza, której nie uczą w szkole, a której potrzebujesz w pracy.",
    description:
      "37 sekcji o tym, co naprawdę warto wiedzieć o swojej umowie. Czym różni się UoP od zlecenia, kiedy zlecenie staje się umową o pracę, jakie masz prawa, kiedy pracodawca przesadza, jak liczyć urlop i wynagrodzenie. Bez prawniczego żargonu — z konkretem.",
    includes: [
      "Porównanie UoP vs zlecenia",
      "Prawa pracownika krok po kroku",
      "Wynagrodzenie i potrącenia",
      "Czas pracy, urlopy, nadgodziny",
      "Kiedy zlecenie to ukryta UoP",
    ],
    tags: ["praca", "umowa", "uop", "zlecenie", "prawa"],
    sortOrder: 80,
    featuredOrder: 80,
  },
];

const PRODUCT_FILES_BUCKET = "product-files";

import { readFile } from "node:fs/promises";

async function importProducts() {
  console.log("\n=== Importing soft-launch products ===");

  // Map slug → category id
  const { data: cats } = await supabase
    .from("categories")
    .select("id, slug");
  const catBySlug = new Map(cats.map((c) => [c.slug, c.id]));

  for (const product of SOFT_LAUNCH_PRODUCTS) {
    const categoryId = catBySlug.get(product.categorySlug);
    if (!categoryId) {
      console.log(`  ✗ ${product.slug}: category ${product.categorySlug} not found`);
      continue;
    }

    // 1. Check if product already exists
    const { data: existing } = await supabase
      .from("products")
      .select("id, file_path")
      .eq("slug", product.slug)
      .maybeSingle();

    let productId = existing?.id;
    let filePath = existing?.file_path;

    if (!existing) {
      // Insert new product
      const { data: created, error } = await supabase
        .from("products")
        .insert({
          slug: product.slug,
          name: product.name,
          category_id: categoryId,
          price: product.price,
          compare_at_price: product.compareAtPrice,
          short_description: product.shortDescription,
          description: product.description,
          format: product.format,
          pages: product.pages,
          sales_label: product.salesLabel,
          hero_note: product.heroNote,
          accent: product.accent,
          cover_gradient: product.coverGradient,
          badge: product.badge,
          status: "draft", // start as draft
          pipeline_status: "ready",
          sort_order: product.sortOrder,
          featured_order: product.featuredOrder,
          tags: product.tags,
          includes: product.includes,
          bestseller: product.bestseller,
          featured: product.featured,
          is_active: false, // not visible until file uploaded
        })
        .select("id")
        .single();
      if (error) {
        console.log(`  ✗ insert ${product.slug}: ${error.message}`);
        continue;
      }
      productId = created.id;
      console.log(`  + created: ${product.slug} (${productId.slice(0, 8)})`);
    } else {
      console.log(`  ○ exists: ${product.slug} (${productId.slice(0, 8)})`);
    }

    // 2. Upload file if not yet uploaded
    if (!filePath) {
      const buf = await readFile(product.file);
      const fileName = product.file.split("/").pop();
      const storagePath = `products/${productId}/files/${Date.now()}-${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from(PRODUCT_FILES_BUCKET)
        .upload(storagePath, buf, {
          contentType: "application/zip",
          upsert: false,
        });
      if (uploadError) {
        console.log(`  ✗ upload ${product.slug}: ${uploadError.message}`);
        continue;
      }
      filePath = storagePath;
      console.log(`  ↑ uploaded: ${storagePath}`);

      // 3. Update product with file_path and activate
      const { error: updateError } = await supabase
        .from("products")
        .update({
          file_path: filePath,
          status: "published",
          pipeline_status: "published",
          is_active: true,
        })
        .eq("id", productId);
      if (updateError) {
        console.log(`  ✗ activate ${product.slug}: ${updateError.message}`);
      } else {
        console.log(`  ✓ published: ${product.slug}`);
      }
    } else {
      console.log(`  ~ already has file_path: ${filePath.slice(0, 60)}…`);
    }
  }
}

if (command === "inspect") {
  await inspect();
}
if (command === "migrate-categories") {
  await migrateCategories();
  await inspect();
}
if (command === "import-products") {
  await importProducts();
  await inspect();
}
