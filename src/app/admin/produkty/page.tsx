import { AdminProductForms } from "@/components/admin/admin-product-forms";
import { products } from "@/data/mock-store";
import { formatCurrency } from "@/lib/format";

export default function AdminProductsPage() {
  return (
    <div className="space-y-6">
      <section className="surface-panel gold-frame space-y-5 p-6">
        <div className="space-y-2">
          <h2 className="text-2xl text-white">Lista produktów</h2>
          <p className="text-sm text-muted-foreground">
            Dane pochodzą z mock seed i są gotowe do późniejszego przepięcia na bazę.
          </p>
        </div>

        <div className="grid gap-3">
          {products.map((product) => (
            <article
              key={product.id}
              className="rounded-[1.4rem] border border-border/70 bg-secondary/45 px-4 py-4"
            >
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-lg text-white">{product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {product.category} • {product.format} • {product.pages} stron
                  </p>
                </div>
                <p className="text-sm font-medium text-white">
                  {formatCurrency(product.price)}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <AdminProductForms />
    </div>
  );
}
