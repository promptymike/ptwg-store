"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Library,
  RefreshCw,
  Share2,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

import {
  type CartProductSnapshot,
  useCart,
} from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { getCoverImageOverlayOpacity } from "@/lib/product";
import {
  TIPI_ITEMS,
  LIKERT_OPTIONS,
  TRAIT_LABELS,
  TRAIT_INSIGHTS,
  classifyLevel,
  getTopTraits,
  percentFromScore,
  pickRecommendation,
  scoreTipi,
  type TraitKey,
} from "@/lib/personality-test";

type Phase = "intro" | "quiz" | "result";

type TestProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  shortDescription: string;
  price: number;
  coverGradient: string;
  coverImageUrl?: string | null;
  coverImageOpacity?: number | null;
};

type PersonalityTestProps = {
  products: TestProduct[];
  ownedProductIds: string[];
};

const INTRO_SUBTITLE =
  "10 krótkich pytań · ok. 2 minuty · TIPI (Gosling, Rentfrow & Swann, 2003)";

const RECOMMENDATION_LIMIT = 3;

export function PersonalityTest({
  products,
  ownedProductIds,
}: PersonalityTestProps) {
  const ownedSet = useMemo(
    () => new Set(ownedProductIds),
    [ownedProductIds],
  );
  const { addItem } = useCart();
  const [bulkAdded, setBulkAdded] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [phase, setPhase] = useState<Phase>("intro");
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const totalSteps = TIPI_ITEMS.length;
  const currentItem = TIPI_ITEMS[stepIndex];

  const scores = useMemo(() => scoreTipi(answers), [answers]);
  const recommendation = useMemo(() => pickRecommendation(scores), [scores]);
  const topTraits = useMemo(() => getTopTraits(scores, 2), [scores]);

  // Pull product cards that match the recommended category, drop anything
  // the user already owns, and cap at three so the result feels curated
  // rather than dumping the whole catalog.
  const recommendedProducts = useMemo(() => {
    const inCategory = products.filter(
      (p) =>
        p.category === recommendation.categoryTitle && !ownedSet.has(p.id),
    );
    if (inCategory.length >= RECOMMENDATION_LIMIT) {
      return inCategory.slice(0, RECOMMENDATION_LIMIT);
    }
    // Fill the gap with the cheapest non-owned product from the runner-up
    // trait so results never look empty even for narrow categories.
    const seen = new Set(inCategory.map((p) => p.id));
    const filler = products
      .filter((p) => !ownedSet.has(p.id) && !seen.has(p.id))
      .sort((a, b) => a.price - b.price);
    return [...inCategory, ...filler].slice(0, RECOMMENDATION_LIMIT);
  }, [products, ownedSet, recommendation.categoryTitle]);

  function toCartSnapshot(product: TestProduct): CartProductSnapshot {
    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      category: product.category,
      shortDescription: product.shortDescription,
      price: product.price,
      coverGradient: product.coverGradient,
    };
  }

  function handleAddAll() {
    for (const product of recommendedProducts) {
      addItem(toCartSnapshot(product));
    }
    setBulkAdded(true);
    window.setTimeout(() => setBulkAdded(false), 2200);
  }

  async function handleShare() {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    const shareText = `Mój styl pracy: ${describeStyle(topTraits)}. Sprawdź swój za 2 minuty: `;
    const nav = (typeof window !== "undefined" ? window.navigator : null) as
      | (Navigator & { share?: (data: ShareData) => Promise<void> })
      | null;
    if (nav?.share) {
      try {
        await nav.share({ title: "Mój styl pracy", text: shareText, url: shareUrl });
        return;
      } catch {
        // Native share cancelled — fall through to clipboard.
      }
    }
    try {
      await navigator.clipboard.writeText(`${shareText}${shareUrl}`);
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 2000);
    } catch {
      // Clipboard unavailable — silent.
    }
  }

  function handleSelect(value: number) {
    setAnswers((current) => ({ ...current, [currentItem.id]: value }));
  }

  function handleNext() {
    if (stepIndex < totalSteps - 1) {
      setStepIndex((value) => value + 1);
      return;
    }
    setPhase("result");
  }

  function handlePrev() {
    if (stepIndex === 0) {
      setPhase("intro");
      return;
    }
    setStepIndex((value) => value - 1);
  }

  function handleRestart() {
    setAnswers({});
    setStepIndex(0);
    setPhase("intro");
  }

  if (phase === "intro") {
    return (
      <div className="surface-panel gold-frame space-y-8 p-8 sm:p-12">
        <div className="space-y-4">
          <span className="eyebrow">
            <Sparkles className="size-3.5" />
            Bezpłatny test
          </span>
          <h1 className="text-4xl text-foreground sm:text-5xl">
            Poznaj swój styl pracy w 2 minuty
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            Krótki, naukowy kwestionariusz osobowości Big Five w wersji TIPI. Po odpowiedzi
            dostaniesz profil Twoich pięciu cech, mocne strony, obszary do pilnowania oraz
            kategorię szablonów najlepiej dopasowaną do Ciebie.
          </p>
          <p className="text-xs uppercase tracking-[0.24em] text-primary/75">
            {INTRO_SUBTITLE}
          </p>
        </div>

        <ul className="grid gap-3 sm:grid-cols-3">
          {[
            {
              label: "Big Five",
              value: "Naukowy model",
              description: "Najczęściej cytowany model osobowości w psychologii.",
            },
            {
              label: "Prywatność",
              value: "Zero zapisów",
              description: "Odpowiedzi pozostają na Twoim urządzeniu.",
            },
            {
              label: "Wynik",
              value: "Natychmiast",
              description: "Profil i rekomendacja szablonów pojawiają się od razu.",
            },
          ].map((item) => (
            <li
              key={item.label}
              className="rounded-2xl border border-border/70 bg-background/60 p-4"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-primary/75">{item.label}</p>
              <p className="mt-1 text-lg text-foreground">{item.value}</p>
              <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            size="lg"
            onClick={() => {
              setPhase("quiz");
              setStepIndex(0);
            }}
          >
            Zacznij test
            <ArrowRight className="size-4" />
          </Button>
          <Button variant="outline" size="lg" render={<Link href="/produkty" />}>
            Wolę obejrzeć katalog
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "quiz") {
    const selected = answers[currentItem.id];
    const progressPercent = ((stepIndex + (selected ? 1 : 0)) / totalSteps) * 100;

    return (
      <div className="surface-panel gold-frame space-y-8 p-8 sm:p-12">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.24em] text-muted-foreground">
            <span>
              Pytanie {stepIndex + 1} z {totalSteps}
            </span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-border/50">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary transition-[width] duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Widzę siebie jako osobę, która jest:</p>
          <h2 className="font-heading text-3xl text-foreground sm:text-4xl">
            „{currentItem.statement}”
          </h2>
          <p className="text-sm text-muted-foreground">
            Jak bardzo ten opis pasuje do Ciebie w kontekście pracy i codziennych decyzji?
          </p>
        </div>

        <div className="grid gap-2">
          {LIKERT_OPTIONS.map((option) => {
            const isActive = selected === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`flex items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-left text-sm transition ${
                  isActive
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border/70 bg-background/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                <span className="font-medium">{option.label}</span>
                <span
                  className={`inline-flex size-8 items-center justify-center rounded-full text-xs font-semibold ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/80 text-foreground"
                  }`}
                >
                  {option.value}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Button variant="ghost" onClick={handlePrev}>
            <ArrowLeft className="size-4" />
            {stepIndex === 0 ? "Wróć do intro" : "Poprzednie"}
          </Button>
          <Button onClick={handleNext} disabled={!selected}>
            {stepIndex === totalSteps - 1 ? "Zobacz wynik" : "Następne"}
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="surface-panel gold-frame space-y-8 p-8 sm:p-12">
        <div className="space-y-3">
          <span className="eyebrow">
            <CheckCircle2 className="size-3.5" />
            Twój profil
          </span>
          <h2 className="text-4xl text-foreground sm:text-5xl">
            {describeStyle(topTraits)}
          </h2>
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
            Wynik oparty o TIPI (Gosling, Rentfrow & Swann, 2003). Pokazujemy Twoje 5 cech Big
            Five jako profil roboczy. Nie diagnozujemy — dajemy punkt wyjścia do wyboru
            szablonów, które realnie wesprą Twoją pracę.
          </p>
        </div>

        <div className="space-y-3">
          {(Object.keys(TRAIT_LABELS) as TraitKey[]).map((trait) => {
            const score = scores[trait];
            const percent = percentFromScore(score);
            const level = classifyLevel(score);
            return (
              <div
                key={trait}
                className="rounded-2xl border border-border/70 bg-background/60 p-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    {TRAIT_LABELS[trait].name}
                  </p>
                  <p className="text-xs uppercase tracking-[0.22em] text-primary/80">
                    {level === "high" ? "wysoka" : level === "low" ? "niska" : "przeciętna"} ·{" "}
                    {score.toFixed(1)} / 7
                  </p>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-border/50">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary/50 to-primary transition-[width] duration-700"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="surface-panel space-y-4 p-6 sm:p-8">
          <p className="eyebrow">Co wychodzi Ci dobrze</p>
          <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
            {topTraits.map((trait) => (
              <li key={trait} className="flex gap-3">
                <span className="mt-1 inline-flex size-1.5 shrink-0 rounded-full bg-primary" />
                <div>
                  <p className="font-semibold text-foreground">{TRAIT_LABELS[trait].name}</p>
                  <p>{TRAIT_INSIGHTS[trait].strength}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="surface-panel space-y-4 p-6 sm:p-8">
          <p className="eyebrow">Na co uważać</p>
          <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
            {topTraits.map((trait) => (
              <li key={trait} className="flex gap-3">
                <span className="mt-1 inline-flex size-1.5 shrink-0 rounded-full bg-destructive/70" />
                <div>
                  <p className="font-semibold text-foreground">{TRAIT_LABELS[trait].name}</p>
                  <p>{TRAIT_INSIGHTS[trait].watch}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="surface-panel relative overflow-hidden p-6 sm:p-8">
        <div
          aria-hidden
          className="absolute -right-20 -top-20 size-60 rounded-full bg-gradient-to-br from-primary/30 to-transparent blur-3xl"
        />
        <div className="relative space-y-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="eyebrow">Twój dopasowany zestaw</p>
              <h3 className="text-3xl text-foreground sm:text-4xl">
                {recommendation.headline}
              </h3>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                {recommendation.reason}
              </p>
              <p className="text-xs uppercase tracking-[0.22em] text-primary/80">
                Kategoria: {recommendation.categoryTitle}
              </p>
            </div>
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="size-4" />
              {shareCopied ? "Skopiowano link!" : "Podziel się wynikiem"}
            </Button>
          </div>

          {recommendedProducts.length > 0 ? (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recommendedProducts.map((product) => {
                const overlay = getCoverImageOverlayOpacity({
                  coverImageOpacity: product.coverImageOpacity ?? undefined,
                });
                return (
                  <li
                    key={product.id}
                    className="surface-panel group flex h-full flex-col overflow-hidden border-border/70 bg-background/70 transition hover:-translate-y-0.5 hover:border-primary/40"
                  >
                    <Link
                      href={`/produkty/${product.slug}`}
                      aria-label={`Otwórz: ${product.name}`}
                      className={`relative aspect-[16/10] overflow-hidden bg-gradient-to-br ${product.coverGradient}`}
                    >
                      {product.coverImageUrl && overlay > 0 ? (
                        <div
                          aria-hidden
                          className="pointer-events-none absolute inset-0 transition-transform duration-700 group-hover:scale-105"
                          style={{
                            backgroundImage: `url(${product.coverImageUrl})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            opacity: overlay,
                          }}
                        />
                      ) : null}
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-stone-950/45 via-stone-950/10 to-transparent"
                      />
                      <div className="relative flex h-full flex-col justify-between p-4">
                        <span className="self-start rounded-full bg-stone-950/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-50">
                          {product.category}
                        </span>
                        <p className="line-clamp-2 break-words font-heading text-xl font-semibold text-stone-950 [text-shadow:0_1px_0_rgba(255,255,255,0.5)]">
                          {product.name}
                        </p>
                      </div>
                    </Link>
                    <div className="flex flex-1 flex-col gap-3 p-4">
                      <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">
                        {product.shortDescription}
                      </p>
                      <div className="mt-auto flex items-center justify-between gap-3">
                        <p className="text-base font-semibold text-foreground">
                          {formatCurrency(product.price)}
                        </p>
                        <button
                          type="button"
                          onClick={() => addItem(toCartSnapshot(product))}
                          className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground"
                          aria-label={`Dodaj ${product.name} do koszyka`}
                        >
                          <ShoppingBag className="size-3.5" />
                          Dodaj
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="rounded-2xl border border-border/70 bg-background/60 p-4 text-sm text-muted-foreground">
              Wygląda na to, że masz już wszystko z tej kategorii w bibliotece.
              Zajrzyj do swojej{" "}
              <Link
                href="/biblioteka"
                className="font-semibold text-primary hover:underline"
              >
                biblioteki
              </Link>{" "}
              albo przeglądnij{" "}
              <Link
                href="/produkty"
                className="font-semibold text-primary hover:underline"
              >
                cały katalog
              </Link>
              .
            </p>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {recommendedProducts.length > 0 ? (
              <Button size="lg" onClick={handleAddAll}>
                {bulkAdded ? (
                  <>
                    <Check className="size-4" />
                    Dodano do koszyka
                  </>
                ) : (
                  <>
                    <ShoppingBag className="size-4" />
                    Dodaj cały zestaw do koszyka
                    <span className="ml-1 rounded-full bg-primary-foreground/15 px-2 py-0.5 text-xs font-semibold">
                      {recommendedProducts.length}
                    </span>
                  </>
                )}
              </Button>
            ) : null}
            <Button size="lg" variant="outline" render={<Link href={recommendation.href} />}>
              <Library className="size-4" />
              Cała kategoria
              <ArrowUpRight className="size-4" />
            </Button>
            <Button size="lg" variant="ghost" onClick={handleRestart}>
              <RefreshCw className="size-4" />
              Zrób test ponownie
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function describeStyle(top: TraitKey[]): string {
  const labels = top.map((trait) => TRAIT_LABELS[trait].short.toLowerCase());
  if (labels.length === 0) return "Twój styl pracy";
  if (labels.length === 1) return `Twój styl opiera się na ${labels[0]}`;
  return `Twój styl: ${labels[0]} + ${labels[1]}`;
}
