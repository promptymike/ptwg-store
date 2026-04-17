import { bundles, getProductById } from "@/data/mock-store";
import { formatCurrency } from "@/lib/format";
import { SectionHeading } from "@/components/shared/section-heading";

export function BundlesSection() {
  return (
    <section id="pakiety" className="shell section-space">
      <div className="space-y-8">
        <SectionHeading
          badge="Pakiety"
          title="Zestawy, które naturalnie podnoszą wartość koszyka"
          description="Pakiety są przygotowane jako osobna warstwa contentowa, dzięki czemu późniejsze podpięcie cen dynamicznych lub kuponów będzie proste."
        />

        <div className="grid gap-5 lg:grid-cols-2">
          {bundles.map((bundle) => (
            <article key={bundle.id} className="surface-panel gold-frame p-6 sm:p-8">
              <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-4">
                  <div
                    className={`h-36 rounded-[1.8rem] border border-border/70 bg-gradient-to-br ${bundle.accent}`}
                  />
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-primary/75">
                      Pakiet premium
                    </p>
                    <h3 className="mt-2 text-4xl text-white">{bundle.name}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {bundle.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-[1.5rem] border border-border/70 bg-secondary/45 p-5">
                    <p className="text-3xl text-white">{formatCurrency(bundle.price)}</p>
                    <p className="text-sm text-muted-foreground line-through">
                      {formatCurrency(bundle.compareAtPrice)}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-medium text-white">W zestawie</p>
                    {bundle.productIds.map((productId) => {
                      const product = getProductById(productId);

                      if (!product) {
                        return null;
                      }

                      return (
                        <div
                          key={productId}
                          className="rounded-[1.2rem] border border-border/60 bg-secondary/40 px-4 py-3 text-sm text-muted-foreground"
                        >
                          <span className="text-white">{product.name}</span>
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
