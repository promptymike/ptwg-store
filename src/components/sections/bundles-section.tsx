/* eslint-disable @next/next/no-img-element */
import { CheckCircle2 } from "lucide-react";

import { BundleCheckoutButton } from "@/components/cart/bundle-checkout-button";
import { formatCurrency } from "@/lib/format";
import type { Bundle } from "@/types/store";

type BundlesSectionProps = {
  bundles: Bundle[];
  recommendedBundle?: Bundle | null;
  ownedProductIds?: Set<string>;
};

// Decorative bookshelf: shows the first three covers of products that ship
// with the pakiet, fanned out like books on a shelf. Replaces the previous
// "empty gradient blob" placeholder which communicated nothing about what
// was inside the bundle and looked unfinished against the real covers
// rendered on storefront cards.
function BundleBookshelf({ products }: { products: Bundle["products"] }) {
  const shelfProducts = products.slice(0, 3);
  if (shelfProducts.length === 0) {
    return null;
  }

  return (
    <div
      className="relative isolate h-40"
      aria-hidden
    >
      {/* Soft shelf shadow on the floor — anchors the "books" so they don't
          float above the card background. */}
      <div className="absolute inset-x-6 bottom-0 h-3 rounded-full bg-stone-950/20 blur-md" />

      <div className="absolute inset-x-0 bottom-2 flex items-end justify-center gap-2 sm:gap-3">
        {shelfProducts.map((product, index) => {
          const offset = index - (shelfProducts.length - 1) / 2;
          const rotation = offset * 6;
          const translateY = Math.abs(offset) * 4;
          return (
            <div
              key={product.id}
              className="relative aspect-[3/4] h-32 shrink-0 overflow-hidden rounded-xl border border-white/35 bg-stone-100 shadow-[0_18px_36px_-18px_rgba(0,0,0,0.55)] transition duration-500 ease-out group-hover:-translate-y-1 sm:h-36"
              style={{
                transform: `rotate(${rotation}deg) translateY(${translateY}px)`,
                zIndex: shelfProducts.length - Math.abs(offset),
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
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-stone-200 to-stone-300 p-3 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-700">
                  {product.name}
                </div>
              )}
              {/* Subtle inner glow so the spine reads even on light covers. */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-stone-950/15" />
            </div>
          );
        })}
      </div>
    </div>
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
    <section id="bundles" className="shell section-space">
      <div className="relative isolate overflow-hidden rounded-[2.8rem] bg-[#15130f] px-5 py-10 text-white shadow-[0_40px_120px_-60px_rgba(0,0,0,.9)] sm:px-8 lg:px-10 lg:py-12">
        <div className="pointer-events-none absolute -right-32 -top-40 size-96 rounded-full bg-amber-300/10 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-52 -left-28 size-[28rem] rounded-full bg-violet-500/10 blur-[120px]" />
        <div className="relative space-y-8">
          <div className="max-w-3xl space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300/80">Pakiety</p>
            <h2 className="text-4xl sm:text-5xl" style={{ color: "#fff" }}>Cały system. Jedna decyzja. Lepsza cena.</h2>
            <p className="max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
              Dobieramy e-booki i planery, które wspólnie rozwiązują jeden konkretny problem. Kupujesz raz, a cały zestaw trafia od razu do biblioteki.
            </p>
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
                className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#211e18] shadow-[0_24px_80px_-45px_rgba(0,0,0,.95)]"
              >
                <div className={`relative overflow-hidden bg-gradient-to-br ${bundle.accent} px-5 pt-5`}>
                  <div className="absolute left-5 top-5 z-20 rounded-full border border-white/35 bg-stone-950/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-sm">
                    {isRecommended ? "Najczęściej wybierany" : "Pakiet premium"}
                  </div>
                  <BundleBookshelf products={bundle.products} />
                </div>

                <div className="flex flex-1 flex-col gap-5 p-6">
                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="break-words text-3xl" style={{ color: "#fff" }}>{bundle.name}</h3>
                      <p className="shrink-0 text-xl font-semibold text-amber-300">
                        {formatCurrency(bundle.price)}
                      </p>
                    </div>
                    <p className="mt-3 break-words text-sm leading-6 text-white/60">{bundle.description}</p>
                  </div>

                  <div className="space-y-2">
                    {bundle.products.map((product) => {
                      const isOwned = ownedProductIds?.has(product.id) ?? false;
                      return (
                        <div key={product.id} className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/[0.04] px-3 py-2.5">
                          <CheckCircle2 className={`mt-0.5 size-4 shrink-0 ${isOwned ? "text-emerald-300" : "text-amber-300"}`} />
                          <div className="min-w-0">
                            <p className="line-clamp-2 text-sm" style={{ color: "rgba(255,255,255,.9)" }}>{product.name}</p>
                            <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-white/40">
                              {isOwned ? "Masz w bibliotece" : product.category}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <ul className="space-y-2 text-sm text-white/55">
                    {bundle.perks.slice(0, 4).map((perk) => (
                      <li key={perk} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-amber-300/80" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto space-y-3 pt-2">
                    {ownedProductIds && ownedCount > 0 && !allOwned ? (
                      <p className="text-xs text-emerald-300">Masz już {ownedCount} z {bundle.products.length} pozycji.</p>
                    ) : null}
                    <BundleCheckoutButton
                      bundleId={bundle.id}
                      bundleName={bundle.name}
                      price={bundle.price}
                      allOwned={allOwned}
                    />
                    <p className="text-center text-[11px] text-white/35">Jednorazowy zakup · dostęp bezterminowy</p>
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
