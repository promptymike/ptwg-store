import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { AdminBundleForm } from "@/components/admin/admin-bundle-form";
import {
  getBundlesSnapshot,
  getStoreProducts,
} from "@/lib/supabase/store";

type AdminBundleEditProps = {
  params: Promise<{ slug: string }>;
};

export default async function AdminBundleEditPage({
  params,
}: AdminBundleEditProps) {
  const { slug } = await params;
  const [bundles, products] = await Promise.all([
    getBundlesSnapshot(),
    getStoreProducts(),
  ]);
  const bundle = bundles.find((b) => b.slug === slug);
  if (!bundle) notFound();

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
          <h2 className="text-2xl text-foreground">Edycja: {bundle.name}</h2>
          <p className="text-sm text-muted-foreground">
            Zmiany zapisują się od razu i invalidują cache na stronie głównej.
          </p>
        </div>
        <AdminBundleForm
          bundle={bundle}
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
