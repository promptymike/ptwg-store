import { CheckCircle2 } from "lucide-react";

import { BundleCheckoutButton } from "@/components/cart/bundle-checkout-button";
import { SectionHeading } from "@/components/shared/section-heading";
import { formatCurrency } from "@/lib/format";
import type { Bundle } from "@/types/store";

type BundlesSectionProps = {
  bundles: Bundle[];
  recommendedBundle?: Bundle | null;
  ownedProductIds?: Set<string>;
};

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
      <div className="space-y-8">
        <SectionHeading
          badge="Pakiety"
          title="Zestawy z lepszą ceną niż pojedyncze ebooki"
          description="Pakiety łączą produkty wokół jednego celu. Dorzucasz drugi temat z rabatem, a wszystkie pliki lądują w jednej bibliotece od razu po zakupie."
        />

        <div className="grid gap-5 lg:grid-cols-2">
          {orderedBundles.map((bundle, index) => {
            const isRecommended =
              index === 0 && recommendedBundle?.id === bundle.id;
            const ownedCount = ownedProductIds
              ? bundle.products.filter((p) => ownedProductIds.has(p.id)).length
              : 0;
            const allOwned = ownedCount === bundle.products.length;

            return (
              <article key={bundle.id} className="surface-panel p-6 sm:p-8">
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                  <div className="space-y-4">
                    <div
                      className={`h-36 rounded-[1.8rem] border border-border/70 bg-gradient-to-br ${bundle.accent}`}
                    />
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-[0.24em] text-primary/75">
                        {isRecommended ? "Polecany pakiet" : "Pakiet premium"}
                      </p>
                      <h3 className="mt-2 break-words text-4xl text-foreground">
                        {bundle.name}
                      </h3>
                      <p className="mt-3 break-words text-sm leading-7 text-muted-foreground">
                        {bundle.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-[1.5rem] border border-border/70 bg-background/70 p-5">
                      <div className="flex items-baseline gap-3">
                        <p className="text-3xl text-foreground">
                          {formatCurrency(bundle.price)}
                        </p>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Jednorazowy zakup. Dostęp bezterminowy.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm font-medium text-foreground">
                        W zestawie znajdziesz
                      </p>
                      {bundle.products.map((product) => {
                        const isOwned =
                          ownedProductIds?.has(product.id) ?? false;
                        return (
                          <div
                            key={product.id}
                            className={`rounded-[1.2rem] border px-4 py-3 text-sm transition ${
                              isOwned
                                ? "border-emerald-500/30 bg-emerald-500/5 text-muted-foreground"
                                : "border-border/70 bg-background/70 text-muted-foreground"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="block break-words text-foreground">
                                {product.name}
                              </span>
                              {isOwned ? (
                                <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
                                  W bibliotece
                                </span>
                              ) : null}
                            </div>
                            <span className="mt-0.5 block text-xs uppercase tracking-[0.18em] text-primary/75">
                              {product.category}
                            </span>
                          </div>
                        );
                      })}
                      {ownedProductIds && ownedCount > 0 && !allOwned ? (
                        <p className="text-xs text-emerald-700 dark:text-emerald-400">
                          Masz już {ownedCount} z {bundle.products.length} pozycji.
                          Kupując pakiet dostajesz pozostałe w lepszej cenie.
                        </p>
                      ) : null}
                    </div>

                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {bundle.perks.map((perk) => (
                        <li key={perk} className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 size-4 text-primary" />
                          <span>{perk}</span>
                        </li>
                      ))}
                    </ul>

                    <BundleCheckoutButton
                      bundleId={bundle.id}
                      bundleName={bundle.name}
                      price={bundle.price}
                      allOwned={allOwned}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
