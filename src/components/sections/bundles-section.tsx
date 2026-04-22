import { CheckCircle2 } from "lucide-react";

import { bundles, getProductById } from "@/data/mock-store";
import { formatCurrency } from "@/lib/format";
import { SectionHeading } from "@/components/shared/section-heading";
import type { Bundle } from "@/types/store";

type BundlesSectionProps = {
  recommendedBundle?: Bundle | null;
};

function getDiscountPercent(price: number, compareAt?: number) {
  if (!compareAt || compareAt <= price) {
    return null;
  }

  return Math.round(((compareAt - price) / compareAt) * 100);
}

export function BundlesSection({ recommendedBundle }: BundlesSectionProps) {
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
          title="Zestawy, które od razu dają kompletny system pracy"
          description="Pakiety łączą produkty wokół jednego celu. Kupujesz mniej, wdrażasz szybciej i oszczędzasz w stosunku do pojedynczych zakupów."
        />

        <div className="grid gap-5 lg:grid-cols-2">
          {orderedBundles.map((bundle, index) => {
            const discount = getDiscountPercent(bundle.price, bundle.compareAtPrice);
            const isRecommended =
              index === 0 && recommendedBundle?.id === bundle.id;

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
                      <h3 className="mt-2 break-words text-4xl text-foreground">{bundle.name}</h3>
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
                        {bundle.compareAtPrice ? (
                          <p className="text-sm text-muted-foreground line-through">
                            {formatCurrency(bundle.compareAtPrice)}
                          </p>
                        ) : null}
                        {discount ? (
                          <span className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary">
                            −{discount}%
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Jednorazowy zakup. Dostęp bezterminowy.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm font-medium text-foreground">W zestawie znajdziesz</p>
                      {bundle.productIds.map((productId) => {
                        const product = getProductById(productId);

                        if (!product) {
                          return null;
                        }

                        return (
                          <div
                            key={productId}
                            className="rounded-[1.2rem] border border-border/70 bg-background/70 px-4 py-3 text-sm text-muted-foreground"
                          >
                            <span className="block break-words text-foreground">
                              {product.name}
                            </span>
                            <span className="mt-0.5 block text-xs uppercase tracking-[0.18em] text-primary/75">
                              {product.category}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {bundle.perks.map((perk) => (
                        <li key={perk} className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 size-4 text-primary" />
                          <span>{perk}</span>
                        </li>
                      ))}
                    </ul>
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
