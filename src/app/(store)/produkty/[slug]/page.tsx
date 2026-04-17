import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Star } from "lucide-react";

import { AddToCartButton } from "@/components/products/add-to-cart-button";
import { ProductCard } from "@/components/products/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getProductBySlug, getRelatedProducts } from "@/data/mock-store";
import { formatCurrency } from "@/lib/format";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return {
      title: "Produkt nie istnieje",
    };
  }

  return {
    title: product.name,
    description: product.shortDescription,
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = getRelatedProducts(product);

  return (
    <div className="shell section-space space-y-10">
      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div
          className={`surface-panel gold-frame relative min-h-[420px] overflow-hidden bg-gradient-to-br ${product.coverGradient} p-8`}
        >
          <div className="hero-orb right-10 top-8 size-28 bg-primary/24" />
          <div className="hero-orb bottom-8 left-10 size-24 bg-white/12" />

          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-center justify-between gap-3">
              <Badge className={`border-0 bg-gradient-to-r ${product.accent} text-brand-foreground`}>
                {product.category}
              </Badge>
              <Badge variant="outline" className="border-primary/25 text-white">
                {product.format}
              </Badge>
            </div>

            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.28em] text-primary/75">
                {product.heroNote}
              </p>
              <h1 className="max-w-xl text-5xl text-white sm:text-6xl">
                {product.name}
              </h1>
            </div>
          </div>
        </div>

        <div className="surface-panel gold-frame space-y-6 p-6 sm:p-8">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-secondary/40 px-3 py-1 text-white">
                <Star className="size-4 fill-primary text-primary" />
                {product.rating.toFixed(1)}
              </span>
              <span className="rounded-full border border-border/70 bg-secondary/40 px-3 py-1 text-muted-foreground">
                {product.pages} stron
              </span>
              <span className="rounded-full border border-border/70 bg-secondary/40 px-3 py-1 text-muted-foreground">
                {product.salesLabel}
              </span>
            </div>

            <p className="text-lg leading-8 text-muted-foreground">
              {product.description}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {product.includes.map((item) => (
              <div
                key={item}
                className="rounded-[1.4rem] border border-border/70 bg-secondary/45 px-4 py-4 text-sm text-muted-foreground"
              >
                <span className="inline-flex items-center gap-2 text-white">
                  <CheckCircle2 className="size-4 text-primary" />
                  {item}
                </span>
              </div>
            ))}
          </div>

          <div className="rounded-[1.7rem] border border-primary/18 bg-primary/8 p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-4xl text-white">{formatCurrency(product.price)}</p>
                {product.compareAtPrice ? (
                  <p className="text-sm text-muted-foreground line-through">
                    {formatCurrency(product.compareAtPrice)}
                  </p>
                ) : null}
              </div>
              <p className="max-w-xs text-sm text-muted-foreground">
                Produkt cyfrowy do pobrania. Po integracji ze Stripe i Supabase
                zakup trafi automatycznie do biblioteki użytkownika.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <AddToCartButton productId={product.id} fullWidth />
            <Button
              variant="outline"
              size="lg"
              className="border-primary/25 bg-secondary/45 text-white"
              render={<Link href="/produkty" />}
            >
              Wróć do katalogu
            </Button>
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 ? (
        <section className="space-y-6">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.24em] text-primary/75">
              Podobne produkty
            </p>
            <h2 className="text-4xl text-white">Zobacz też w tej kategorii</h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
