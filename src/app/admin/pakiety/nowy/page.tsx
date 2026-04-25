import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AdminBundleForm } from "@/components/admin/admin-bundle-form";
import { getStoreProducts } from "@/lib/supabase/store";

export default async function AdminBundleNewPage() {
  const products = await getStoreProducts();

  return (
    <div className="space-y-6">
      <Link
        href="/admin/pakiety"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Wszystkie pakiety
      </Link>
      <div className="surface-panel space-y-6 p-6 sm:p-8">
        <div className="space-y-1">
          <h2 className="text-2xl text-foreground">Nowy pakiet</h2>
          <p className="text-sm text-muted-foreground">
            Wybierz produkty i ustaw cenę. Pakiet pojawia się w sekcji
            &bdquo;Pakiety&rdquo; na stronie głównej i kupujący przechodzi przez
            normalne Stripe Checkout.
          </p>
        </div>
        <AdminBundleForm
          products={products.map((p) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            category: p.category,
          }))}
        />
      </div>
    </div>
  );
}
