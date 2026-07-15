import { ImageResponse } from "next/og";

import { getCoverArt } from "@/lib/product-cover-art";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getStoreProductBySlug } from "@/lib/supabase/store";

export const runtime = "nodejs";

const SIZE = { width: 1200, height: 800 } as const;

type Props = {
  params: Promise<{ slug: string; index: string }>;
};

const PAPER = "#faf6f0";
const INK = "#1a1612";
const MUTED = "rgba(26,22,18,0.55)";
const RULE = "rgba(26,22,18,0.12)";

function tocChapters(category: string): string[] {
  if (category === "Finanse osobiste")
    return [
      "Wstęp — pieniądze bez stresu",
      "Twój bilans — od czego zacząć",
      "Budżet 50/30/20 w praktyce",
      "Poduszka finansowa krok po kroku",
      "Plan wyjścia z długów",
      "Pierwsze inwestycje bez ryzyka",
      "Checklisty miesięczne",
    ];
  if (category === "Zdrowie i dieta")
    return [
      "Wstęp — co naprawdę działa",
      "Talerz, który syci",
      "Lista zakupów na 7 dni",
      "Przepisy do pracy w 15 min",
      "Nawodnienie i sen",
      "Kiedy ważyć i jak mierzyć postęp",
      "Plan na miesiąc",
    ];
  if (category === "Fitness i ruch")
    return [
      "Wstęp — od kanapy do progresu",
      "Test wyjściowy",
      "Plan treningowy 4×tydz.",
      "Trening w domu bez sprzętu",
      "Jak nie odpaść po 2 tygodniach",
      "Regeneracja, sen, mobilność",
      "Plan miesiąca",
    ];
  if (category === "Macierzyństwo i rodzina")
    return [
      "Wstęp — pierwszy oddech",
      "Wyprawka bez chaosu",
      "Karmienie — co działa",
      "Sen i rytm dnia",
      "Pierwsze miesiące krok po kroku",
      "Twoja zdrowie i głowa",
      "Praktyczne checklisty",
    ];
  if (category === "Produktywność i czas")
    return [
      "Wstęp — czas to wybór",
      "Audyt tygodnia",
      "Planowanie 1-2-3",
      "Bloki czasu i głęboka praca",
      "Mikronawyki",
      "Walka z prokrastynacją",
      "Twój system tygodniowy",
    ];
  if (category === "Mindset i rozwój osobisty")
    return [
      "Wstęp — kim chcesz być",
      "Przekonania, które blokują",
      "Praca z myślami",
      "Codzienne rytuały",
      "Granice i odwaga",
      "Plan rozwoju 90 dni",
      "Workbook końcowy",
    ];
  if (category === "Praca i kariera")
    return [
      "Wstęp — Twój zawodowy start",
      "Wybór formy zatrudnienia",
      "Umowa krok po kroku",
      "Twoje prawa i obowiązki",
      "Wynagrodzenie netto / brutto",
      "Rozwój i awans",
      "Checklisty i wzory",
    ];
  return [
    "Wstęp",
    "Kluczowe pojęcia",
    "Pierwsze kroki",
    "Praktyczne ćwiczenia",
    "Najczęstsze błędy",
    "Plan działania",
    "Podsumowanie",
  ];
}

function samplePageBlocks(category: string): { heading: string; lines: string[] } {
  if (category === "Finanse osobiste")
    return {
      heading: "Budżet 50/30/20 — co siedzi w każdej kopercie",
      lines: [
        "Najprostszy podział wypłaty, który działa nawet przy zmiennych dochodach.",
        "50% — potrzeby. Tu mieszczą się czynsz, raty, prąd, jedzenie, dojazdy.",
        "30% — przyjemności. Wyjścia, prezenty, hobby, drobne zachcianki.",
        "20% — Ty z przyszłości. Poduszka, długi, inwestycje, fundusz na cele.",
        "Reguła nie służy do karania się — to siatka bezpieczeństwa.",
      ],
    };
  if (category === "Zdrowie i dieta")
    return {
      heading: "Talerz, który syci — bez liczenia kalorii",
      lines: [
        "Połowa talerza — warzywa lub owoce. Im więcej kolorów, tym lepiej.",
        "Ćwiartka — białko: mięso, ryba, jajko, strączki, nabiał.",
        "Ćwiartka — węglowodany złożone: kasze, pełne ziarno, ziemniaki.",
        "Łyżka tłuszczu: olej, masło, awokado, orzechy.",
        "Pij wodę zamiast soków — oszczędzasz średnio 200 kcal dziennie.",
      ],
    };
  if (category === "Fitness i ruch")
    return {
      heading: "Pierwszy plan treningowy — 4 tygodnie",
      lines: [
        "Pon: trening całego ciała 35 min.",
        "Wt: spacer 30 min — regeneracja.",
        "Śr: górna część + brzuch.",
        "Czw: spacer lub joga.",
        "Pt: dolna część + brzuch.",
        "Wagi nie potrzebujesz — ciężar ciała wystarczy na pierwsze 4 tygodnie.",
      ],
    };
  if (category === "Macierzyństwo i rodzina")
    return {
      heading: "Pierwszy tydzień w domu — czego się spodziewać",
      lines: [
        "Karmienie co 2-3 godziny, również w nocy.",
        "Płacz to język — głód, sen, mokra pielucha, dotyk.",
        "Twoje zdrowie: śpij gdy ono śpi, jedz ciepło, pij dużo.",
        "Nie obsługujesz gości — obsługujesz dziecko.",
        "Wszystko, co wydaje się dramatem, przestaje być dramatem za 7 dni.",
      ],
    };
  if (category === "Produktywność i czas")
    return {
      heading: "Reguła trzech zadań",
      lines: [
        "Każdego ranka wybierasz tylko trzy rzeczy do zrobienia.",
        "Pierwsza — najtrudniejsza. Druga — średnia. Trzecia — szybka.",
        "Jeśli skończysz wszystkie trzy — koniec dnia. Bez wyrzutów.",
        "Nie 17 punktów na liście. Trzy.",
        "Po dwóch tygodniach Twój mózg sam zaczyna układać priorytety.",
      ],
    };
  if (category === "Mindset i rozwój osobisty")
    return {
      heading: "Przekonania, które blokują",
      lines: [
        '„Nie poradzę sobie" — pojawia się przed czymś nowym, nie podczas.',
        "Zapisz je dosłownie. Słowo po słowie.",
        "Zadaj sobie: skąd to wiem? Czy to fakt, czy hipoteza?",
        "Hipotezę można sprawdzić — fakt potwierdza historia.",
        "Większość blokujących myśli to hipotezy z dzieciństwa.",
      ],
    };
  if (category === "Praca i kariera")
    return {
      heading: "Umowa o pracę vs umowa zlecenia",
      lines: [
        "Etat = pełne ZUS, urlop, chorobowe, ochrona przed wypowiedzeniem.",
        "Zlecenie = elastyczność, ale brak urlopu i ochrony przed wypowiedzeniem.",
        "Stawka brutto na zleceniu zwykle 15-25% wyższa niż na etacie.",
        "Etat preferuj gdy: stabilność, kredyt, choroby przewlekłe.",
        "Zlecenie preferuj gdy: kilku klientów, projekty, elastyczne godziny.",
      ],
    };
  return {
    heading: "Najważniejsze, co zabierzesz po przeczytaniu",
    lines: [
      "Krótka diagnoza, gdzie jesteś teraz.",
      "Trzy zmiany, które działają od pierwszego tygodnia.",
      "Plan na 30 dni, dopasowany do realnego życia.",
      "Praktyczne checklisty — drukujesz i odhaczasz.",
      "Workbook końcowy — Twój własny plan, czarno na białym.",
    ],
  };
}

function workbookItems(category: string): string[] {
  if (category === "Finanse osobiste")
    return [
      "Spisałem(am) wszystkie stałe wydatki",
      "Mam aktualny stan kont i długów",
      "Ustaliłem(am) wysokość poduszki",
      "Zaplanowałem(am) 3 cele finansowe na rok",
      "Wyłączyłem(am) jedną zbędną subskrypcję",
      "Sprawdziłem(am) opłaty bankowe",
    ];
  if (category === "Fitness i ruch")
    return [
      "Zrobiłem(am) test wyjściowy",
      "Zaplanowałem(am) tydzień treningowy",
      "Zrobiłem(am) zdjęcie wyjściowe",
      "Mam buty i strój gotowy",
      "Wybrałem(am) konkretną godzinę treningu",
      "Powiadomiłem(am) bliskich o planie",
    ];
  if (category === "Zdrowie i dieta")
    return [
      "Zrobiłem(am) listę zakupów na tydzień",
      "Zaplanowałem(am) 5 posiłków pracy",
      "Wyrzuciłem(am) słodzone napoje",
      "Mam butelkę na wodę pod ręką",
      "Zaplanowałem(am) ważenie raz w tygodniu",
      "Spisałem(am) cel na 30 dni",
    ];
  if (category === "Produktywność i czas")
    return [
      "Spisałem(am) audyt tygodnia",
      "Mam 3 zadania na jutro",
      "Wyciszyłem(am) powiadomienia",
      "Zaplanowałem(am) bloki głębokiej pracy",
      "Wybrałem(am) jeden mikronawyk",
      "Mam zaplanowany odpoczynek",
    ];
  if (category === "Macierzyństwo i rodzina")
    return [
      "Wyprawka — sprawdzona",
      "Plan na pierwsze 7 dni",
      "Lista kontaktów alarmowych",
      "Podział obowiązków z partnerem",
      "Lista wsparcia (rodzina, znajomi)",
      "Mój plan regeneracji",
    ];
  if (category === "Mindset i rozwój osobisty")
    return [
      "Spisałem(am) 3 blokujące przekonania",
      "Wybrałem(am) jedną codzienną praktykę",
      "Mam plan na 30 dni",
      "Zapisałem(am) cel długoterminowy",
      "Określiłem(am) wartości",
      "Zaplanowałem(am) cotygodniowy review",
    ];
  if (category === "Praca i kariera")
    return [
      "Sprawdziłem(am) typ swojej umowy",
      "Mam aktualne CV",
      "Spisałem(am) cele zawodowe na rok",
      "Mam listę kompetencji do rozwoju",
      "Sprawdziłem(am) widełki płacowe na rynku",
      "Plan rozmowy o podwyżce / awansie",
    ];
  return [
    "Pierwszy krok — wykonany",
    "Plan tygodnia — gotowy",
    "Cel na 30 dni — zapisany",
    "Mam jasne 3 priorytety",
    "Wybrałem(am) jedno działanie dziś",
    "Wracam tu raz w tygodniu",
  ];
}

function PaperFrame({ children, category }: { children: React.ReactNode; category: string }) {
  const art = getCoverArt(category);
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: `linear-gradient(135deg, ${PAPER} 0%, ${art.from} 62%, ${art.to} 100%)`,
        display: "flex",
        flexDirection: "column",
        padding: "54px 72px 54px 92px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: INK,
        position: "relative",
      }}
    >
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 22, background: art.accent, display: "flex" }} />
      <div style={{ position: "absolute", right: -90, top: -120, width: 360, height: 360, borderRadius: 9999, background: art.shape, display: "flex" }} />
      {children}
    </div>
  );
}

function PageHeader({ category, label }: { category: string; label: string }) {
  const art = getCoverArt(category);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingBottom: 24,
        borderBottom: `1px solid ${RULE}`,
        marginBottom: 36,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 9999,
            background: art.accent,
            color: "#fff",
            fontSize: 15,
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          T
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: INK, display: "flex" }}>
          Templify
        </div>
      </div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 3,
          textTransform: "uppercase",
          color: MUTED,
          display: "flex",
        }}
      >
        {label}
      </div>
    </div>
  );
}

function TocPreview({ product }: { product: { name: string; category: string } }) {
  const chapters = tocChapters(product.category);
  const art = getCoverArt(product.category);
  return (
    <PaperFrame category={product.category}>
      <PageHeader category={product.category} label="Spis treści" />
      <div
        style={{
          fontSize: 36,
          fontWeight: 800,
          letterSpacing: -0.5,
          color: INK,
          marginBottom: 28,
          display: "flex",
        }}
      >
        {product.name}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
        {chapters.map((title, idx) => (
          <div
            key={title}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              fontSize: 22,
              color: INK,
            }}
          >
            <div
              style={{
                width: 44,
                height: 34,
                fontSize: 18,
                fontWeight: 700,
                color: idx === 0 ? "#fff" : art.text,
                background: idx === 0 ? art.accent : "rgba(255,255,255,.65)",
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {String(idx + 1).padStart(2, "0")}
            </div>
            <div style={{ flex: 1, display: "flex" }}>{title}</div>
            <div style={{ fontSize: 18, color: MUTED, display: "flex" }}>
              {String((idx + 1) * 7).padStart(2, "0")}
            </div>
          </div>
        ))}
      </div>
    </PaperFrame>
  );
}

function SamplePagePreview({
  product,
}: {
  product: { name: string; category: string };
}) {
  const block = samplePageBlocks(product.category);
  const art = getCoverArt(product.category);
  return (
    <PaperFrame category={product.category}>
      <PageHeader category={product.category} label="Przykładowa strona" />
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: 3,
          textTransform: "uppercase",
          color: art.accent,
          marginBottom: 14,
          display: "flex",
        }}
      >
        Rozdział 2
      </div>
      <div
        style={{
          fontSize: 38,
          fontWeight: 800,
          letterSpacing: -0.6,
          lineHeight: 1.1,
          color: INK,
          marginBottom: 30,
          display: "flex",
          maxWidth: 940,
        }}
      >
        {block.heading}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18, flex: 1 }}>
        {block.lines.map((line, idx) => (
          <div
            key={idx}
            style={{
              fontSize: idx === 0 ? 23 : 20,
              lineHeight: 1.45,
              color: idx === 0 ? "#fff" : "rgba(26,22,18,0.78)",
              background: idx === 0 ? art.accent : "rgba(255,255,255,.58)",
              padding: idx === 0 ? "18px 22px" : "13px 18px",
              borderRadius: 14,
              display: "flex",
            }}
          >
            {line}
          </div>
        ))}
      </div>
    </PaperFrame>
  );
}

function WorkbookPreview({
  product,
}: {
  product: { name: string; category: string };
}) {
  const items = workbookItems(product.category);
  const art = getCoverArt(product.category);
  return (
    <PaperFrame category={product.category}>
      <PageHeader category={product.category} label="Workbook" />
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: 3,
          textTransform: "uppercase",
          color: art.accent,
          marginBottom: 14,
          display: "flex",
        }}
      >
        Twoja checklista
      </div>
      <div
        style={{
          fontSize: 38,
          fontWeight: 800,
          letterSpacing: -0.6,
          color: INK,
          marginBottom: 32,
          display: "flex",
        }}
      >
        Pierwsze 30 dni
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 24 }}>
        <div style={{ display: "flex", fontSize: 16, fontWeight: 700, color: art.accent }}>Postęp 50%</div>
        <div style={{ display: "flex", flex: 1, height: 12, borderRadius: 99, background: "rgba(255,255,255,.72)", overflow: "hidden" }}>
          <div style={{ display: "flex", width: "50%", background: art.accent }} />
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18, flex: 1 }}>
        {items.map((item, idx) => (
          <div
            key={item}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              fontSize: 20,
              color: INK,
              background: "rgba(255,255,255,.62)",
              padding: "12px 16px",
              borderRadius: 14,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                border: `2px solid ${art.accent}`,
                background: idx % 2 === 0 ? art.accent : "transparent",
                color: "#fff",
                fontSize: 18,
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {idx % 2 === 0 ? (
                <div
                  style={{
                    width: 12,
                    height: 7,
                    borderLeft: "3px solid #fff",
                    borderBottom: "3px solid #fff",
                    transform: "rotate(-45deg)",
                    marginTop: -3,
                    display: "flex",
                  }}
                />
              ) : null}
            </div>
            <div style={{ flex: 1, display: "flex" }}>{item}</div>
          </div>
        ))}
      </div>
    </PaperFrame>
  );
}

export async function GET(_request: Request, { params }: Props) {
  const { slug, index } = await params;
  const idx = Math.max(0, Math.min(2, Number.parseInt(index, 10) || 0));
  const admin = createSupabaseAdminClient();
  if (admin) {
    const { data: productRow } = await admin
      .from("products")
      .select("id")
      .eq("slug", slug)
      .eq("is_active", true)
      .eq("status", "published")
      .maybeSingle();
    if (productRow) {
      const { data: previews } = await admin
        .from("product_previews")
        .select("storage_path")
        .eq("product_id", productRow.id)
        .order("sort_order", { ascending: true });
      const storagePath = previews?.[idx]?.storage_path;
      if (storagePath) {
        const asset = /^https?:\/\//i.test(storagePath)
          ? await fetch(storagePath).then((response) =>
              response.ok ? response.blob() : null,
            )
          : await admin.storage
              .from("product-covers")
              .download(storagePath)
              .then(({ data }) => data);
        if (asset) {
          return new Response(await asset.arrayBuffer(), {
            headers: {
              "Content-Type": asset.type || "image/png",
              "Cache-Control":
                "public, max-age=86400, s-maxage=31536000, stale-while-revalidate=604800",
              "X-Robots-Tag": "index, follow",
            },
          });
        }
      }
    }
  }
  const product = await getStoreProductBySlug(slug).catch(() => null);
  const fallback = { name: "Templify", category: "" };
  const resolved = product
    ? { name: product.name, category: product.category }
    : fallback;

  let element: React.ReactElement;
  if (idx === 0) element = <TocPreview product={resolved} />;
  else if (idx === 1) element = <SamplePagePreview product={resolved} />;
  else element = <WorkbookPreview product={resolved} />;

  return new ImageResponse(element, {
    ...SIZE,
    headers: {
      "Cache-Control": "public, max-age=86400, s-maxage=31536000, stale-while-revalidate=604800",
      "X-Robots-Tag": "index, follow",
    },
  });
}
