/* eslint-disable @next/next/no-img-element */
import { CheckCircle2, Layers3, Sparkles, Zap } from "lucide-react";

import { BundleCheckoutButton } from "@/components/cart/bundle-checkout-button";
import { formatCurrency } from "@/lib/format";
import type { Bundle } from "@/types/store";

type BundlesSectionProps = {
  bundles: Bundle[];
  recommendedBundle?: Bundle | null;
  ownedProductIds?: Set<string>;
};

function BundleStack({ products }: { products: Bundle["products"] }) {
  const stackProducts = products.slice(0, 3);

  if (stackProducts.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-[2rem] border border-stone-950/10 bg-stone-100 text-sm text-muted-foreground">
        Produkty w pakiecie
      </div>
    );
  }

  return (
    <div className="relative isolate h-64 overflow-visible" aria-hidden>
      <div className="absolute inset-x-8 bottom-8 h-8 rounded-full bg-stone-950/15 blur-2xl transition duration-500 group-hover:scale-110" />
      <div className="absolute inset-x-4 bottom-0 h-24 rounded-[2rem] border border-stone-950/10 bg-white/[0.55] shadow-inner backdrop-blur-sm" />

      {stackProducts.map((product, index) => {
        const offset = index - (stackProducts.length - 1) / 2;
        const isCenter = Math.abs(offset) < 0.1;
        const rotation = offset * 9;
        const x = offset * 72;
        const y = isCenter ? 0 : 18;

        return (
          <div
            key={product.id}
            className="absolute left-1/2 top-7 aspect-[3/4] h-44 origin-bottom overflow-hidden rounded-[1.35rem] border border-white/80 bg-stone-100 shadow-[0_30px_65px_-35px_rgba(20,16,10,.75)] ring-1 ring-stone-950/5 transition duration-700 ease-out group-hover:-translate-y-6 group-hover:scale-[1.04] sm:h-48"
            style={{
              transform: `translateX(calc(-50% + ${x}px)) translateY(${y}px) rotate(${rotation}deg)`,
              zIndex: 20 - Math.abs(offset),
            }}
          >
            {product.coverImageUrl ? (
              <img
                src={product.coverImageUrl}
                alt={product.name}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-stone-100 via-white to-stone-200 p-4 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-stone-700">
                {product.name}
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-stone-950/20" />
          </div>
        );
      })}

      <div className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full border border-stone-950/10 bg-white/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-700 shadow-sm backdrop-blur">
        {stackProducts.length} w zestawie
      </div>
    </div>
  );
}

function BundleValueBadge({
  price,
  compareAtPrice,
}: {
  price: number;
  compareAtPrice: number;
}) {
  const saving = Math.max(0, compareAtPrice - price);

  if (saving <= 0) {
    return (
      <span className="rounded-full border border-stone-950/10 bg-white/70 px-3 py-1 text-xs font-semibold text-stone-700">
        Lepsza cena w zestawie
      </span>
    );
  }

  return (
    <span className="rounded-full border border-emerald-700/15 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
      Oszczędzasz {formatCurrency(saving)}
    </span>
  );
}

export function BundlesSection({
  bundles,
  recommendedBundle,
  ownedProductIds,
}: BundlesSectionProps) {
  if (bundles.length === 0) return null;

  const orderedBundles = recommendedBundle
    ? [
        recommendedBundle,
        ...bundles.filter((bundle) => bundle.id !== recommendedBundle.id),
      ]
    : bundles;

  return (
    <section id="bundles" className="shell section-space scroll-mt-36">
      <div className="relative isolate overflow-hidden rounded-[3rem] border border-stone-950/10 bg-[linear-gradient(135deg,#fbf6ed_0%,#f2eadf_48%,#fbf8f1_100%)] px-5 py-10 shadow-[0_36px_100px_-70px_rgba(35,28,18,.65)] sm:px-8 lg:px-10 lg:py-12">
        <div className="pointer-events-none absolute -left-24 top-12 size-80 rounded-full bg-amber-300/25 blur-[100px]" />
        <div className="pointer-events-none absolute -right-28 -top-24 size-96 rounded-full bg-violet-300/20 blur-[110px]" />
        <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />

        <div className="relative space-y-10">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div className="max-w-3xl space-y-4">
              <p className="inline-flex items-center gap-2 rounded-full border border-stone-950/10 bg-white/70 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-stone-700 shadow-sm backdrop-blur">
                <Layers3 className="size-3.5 text-amber-700" />
                Pakiety
              </p>
              <h2 className="text-4xl text-stone-950 sm:text-5xl">
                Zestawy, które rozwiązują cały problem — nie tylko jedną część.
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-stone-600 sm:text-base">
                Łączymy e-booki i planery w gotowe ścieżki: finanse, czas,
                zdrowie albo macierzyństwo. Kupujesz raz, dostajesz komplet w
                bibliotece i płacisz mniej niż za produkty osobno.
              </p>
            </div>

            <div className="grid gap-3 rounded-[2rem] border border-stone-950/10 bg-white/65 p-4 text-sm text-stone-700 shadow-sm backdrop-blur">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800">
                  <Sparkles className="size-4" />
                </span>
                <p>
                  <span className="font-semibold text-stone-950">Mniej decyzji.</span>{" "}
                  Dobieramy produkty tak, żeby tworzyły jeden system.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-stone-950 text-white">
                  <Zap className="size-4" />
                </span>
                <p>
                  <span className="font-semibold text-stone-950">Natychmiastowy dostęp.</span>{" "}
                  Wszystko trafia do biblioteki po zakupie.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {orderedBundles.map((bundle, index) => {
              const isRecommended =
                index === 0 && recommendedBundle?.id === bundle.id;
              const ownedCount = ownedProductIds
                ? bundle.products.filter((p) => ownedProductIds.has(p.id)).length
                : 0;
              const allOwned = ownedCount === bundle.products.length;

              return (
                <article
                  key={bundle.id}
                  className={`group relative flex h-full min-w-0 flex-col overflow-hidden rounded-[2.4rem] border bg-white/[0.82] shadow-[0_28px_90px_-55px_rgba(34,28,20,.7)] ring-1 ring-white/70 backdrop-blur transition duration-500 hover:-translate-y-2 hover:shadow-[0_42px_110px_-60px_rgba(34,28,20,.85)] ${
                    isRecommended
                      ? "border-amber-500/35"
                      : "border-stone-950/10"
                  }`}
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white via-white/45 to-transparent" />
                  <div className={`relative bg-gradient-to-br ${bundle.accent} px-5 pt-5`}>
                    <div className="absolute left-5 top-5 z-30 flex flex-wrap gap-2">
                      <span className="rounded-full border border-white/60 bg-white/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-stone-800 shadow-sm backdrop-blur">
                        {isRecommended ? "Najczęściej wybierany" : "Gotowy zestaw"}
                      </span>
                      <BundleValueBadge
                        price={bundle.price}
                        compareAtPrice={bundle.compareAtPrice}
                      />
                    </div>
                    <BundleStack products={bundle.products} />
                  </div>

                  <div className="flex flex-1 flex-col gap-5 p-6">
                    <div className="min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="break-words text-3xl text-stone-950">
                          {bundle.name}
                        </h3>
                        <div className="shrink-0 text-right">
                          {bundle.compareAtPrice > bundle.price ? (
                            <p className="text-xs font-semibold text-stone-400 line-through">
                              {formatCurrency(bundle.compareAtPrice)}
                            </p>
                          ) : null}
                          <p className="text-2xl font-semibold text-stone-950">
                            {formatCurrency(bundle.price)}
                          </p>
                        </div>
                      </div>
                      <p className="mt-3 break-words text-sm leading-6 text-stone-600">
                        {bundle.description}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-stone-400">
                        W zestawie
                      </p>
                      {bundle.products.map((product) => {
                        const isOwned = ownedProductIds?.has(product.id) ?? false;
                        return (
                          <div
                            key={product.id}
                            className="flex items-start gap-3 rounded-[1.2rem] border border-stone-950/10 bg-stone-50/80 px-3 py-2.5 transition group-hover:bg-white"
                          >
                            <CheckCircle2
                              className={`mt-0.5 size-4 shrink-0 ${
                                isOwned ? "text-emerald-700" : "text-amber-700"
                              }`}
                            />
                            <div className="min-w-0">
                              <p className="line-clamp-2 text-sm font-semibold text-stone-900">
                                {product.name}
                              </p>
                              <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-stone-400">
                                {isOwned ? "Masz w bibliotece" : product.category}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <ul className="grid gap-2 text-sm text-stone-600">
                      {bundle.perks.slice(0, 4).map((perk) => (
                        <li key={perk} className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-stone-900" />
                          <span>{perk}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto space-y-3 pt-2">
                      {ownedProductIds && ownedCount > 0 && !allOwned ? (
                        <p className="text-xs font-semibold text-emerald-700">
                          Masz już {ownedCount} z {bundle.products.length} pozycji.
                        </p>
                      ) : null}
                      <BundleCheckoutButton
                        bundleId={bundle.id}
                        bundleName={bundle.name}
                        price={bundle.price}
                        allOwned={allOwned}
                      />
                      <p className="text-center text-[11px] text-stone-400">
                        Jednorazowy zakup · dostęp bezterminowy
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
