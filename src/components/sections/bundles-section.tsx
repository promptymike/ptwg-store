import { bundles, getProductById } from "@/data/mock-store";
import { formatCurrency } from "@/lib/format";
import { SectionHeading } from "@/components/shared/section-heading";
import type { Bundle } from "@/types/store";

type BundlesSectionProps = {
  recommendedBundle?: Bundle | null;
};

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
          badge="Bundles"
          title="Higher-ticket packs for teams that want a full operating layer"
          description="Pakiety pomagają zwiększyć wartość koszyka i od razu sprzedają szerszy rezultat: system, a nie pojedynczy plik."
        />

        <div className="grid gap-5 lg:grid-cols-2">
          {orderedBundles.map((bundle, index) => (
            <article key={bundle.id} className="surface-panel p-6 sm:p-8">
              <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-4">
                  <div
                    className={`h-36 rounded-[1.8rem] border border-border/70 bg-gradient-to-br ${bundle.accent}`}
                  />
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-primary/75">
                      {index === 0 && recommendedBundle?.id === bundle.id
                        ? "Recommended bundle"
                        : "Premium bundle"}
                    </p>
                    <h3 className="mt-2 text-4xl text-foreground">{bundle.name}</h3>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                      {bundle.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-[1.5rem] border border-border/70 bg-background/70 p-5">
                    <p className="text-3xl text-foreground">{formatCurrency(bundle.price)}</p>
                    <p className="text-sm text-muted-foreground line-through">
                      {formatCurrency(bundle.compareAtPrice)}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-medium text-foreground">W zestawie</p>
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
                          <span className="text-foreground">{product.name}</span>
                          <span className="block text-xs uppercase tracking-[0.18em] text-primary/75">
                            {product.category}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    {bundle.perks.map((perk) => (
                      <p key={perk}>• {perk}</p>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
