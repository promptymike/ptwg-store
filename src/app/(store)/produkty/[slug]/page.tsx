/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Download, LibraryBig, ShieldCheck, Sparkles, Zap } from "lucide-react";

import { AnalyticsProductView } from "@/components/analytics/analytics-product-view";
import { AddToCartButton } from "@/components/products/add-to-cart-button";
import { ProductCard } from "@/components/products/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { getCurrentUser } from "@/lib/session";
import { getCoverImageOverlayOpacity } from "@/lib/product";
import { getCanonicalUrl } from "@/lib/seo";
import {
  getFaqSnapshot,
  getOwnedProductAccess,
  getOwnedProductBySlug,
  getRelatedStoreProducts,
  getStoreProductBySlug,
} from "@/lib/supabase/store";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const trustItems = [
  {
    icon: Zap,
    title: "Natychmiastowy dostęp",
    description: "Pliki pojawiają się w bibliotece od razu po opłaceniu zamówienia.",
  },
  {
    icon: ShieldCheck,
    title: "14 dni na zwrot",
    description: "Jeśli produkt nie pasuje do Twojego procesu, napisz do nas po zakupie.",
  },
  {
    icon: Sparkles,
    title: "Licencja do pracy",
    description: "Szablon wdrażasz we własnym biznesie i wracasz do niego, kiedy chcesz.",
  },
];

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getStoreProductBySlug(slug);

  if (!product) {
    return {
      title: "Produkt nie istnieje",
    };
  }

  return {
    title: product.name,
    description: product.shortDescription,
    alternates: {
      canonical: getCanonicalUrl(`/produkty/${product.slug}`),
    },
    openGraph: {
      title: `${product.name} | Templify`,
      description: product.shortDescription,
      url: getCanonicalUrl(`/produkty/${product.slug}`),
      siteName: "Templify",
      type: "website",
      images: product.coverImageUrl
        ? [
            {
              url: product.coverImageUrl,
            },
          ]
        : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const user = await getCurrentUser();

  const publicProduct = await getStoreProductBySlug(slug);
  const ownedFallback =
    !publicProduct && user ? await getOwnedProductBySlug(user.id, slug) : null;
  const product = publicProduct ?? ownedFallback;

  if (!product) {
    notFound();
  }

  const [relatedProducts, faqs, ownedAccess] = await Promise.all([
    getRelatedStoreProducts(product),
    getFaqSnapshot(),
    user ? getOwnedProductAccess(user.id, product.id) : Promise.resolve(null),
  ]);
  const hasOwnedAccess = Boolean(ownedAccess);
  const ownedDownloadHref =
    hasOwnedAccess && ownedAccess?.filePath
      ? `/api/library/${product.id}/download`
      : null;

  const productStructuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    category: product.category,
    image: product.coverImageUrl ? [product.coverImageUrl] : undefined,
    brand: {
      "@type": "Brand",
      name: "Templify",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "PLN",
      price: String(product.price),
      availability: "https://schema.org/InStock",
      url: getCanonicalUrl(`/produkty/${product.slug}`),
    },
  };

  return (
    <div className="shell section-space space-y-10 pb-28 sm:pb-0">
      <AnalyticsProductView
        id={product.id}
        slug={product.slug}
        name={product.name}
        category={product.category}
        price={product.price}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productStructuredData),
        }}
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div
          className={`surface-panel relative min-h-[420px] overflow-hidden bg-gradient-to-br ${product.coverGradient} p-8`}
        >
          <div className="hero-orb right-10 top-8 size-28 bg-white/35" />
          <div className="hero-orb bottom-8 left-10 size-24 bg-primary/24" />

          {product.coverImageUrl && getCoverImageOverlayOpacity(product) > 0 ? (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage: `url(${product.coverImageUrl})`,
                backgroundPosition: "center",
                backgroundSize: "cover",
                opacity: getCoverImageOverlayOpacity(product),
              }}
            />
          ) : null}

          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-center justify-between gap-3">
              <Badge
                className={`border-0 bg-gradient-to-r ${product.accent} text-brand-foreground`}
              >
                {product.category}
              </Badge>
              <div className="flex items-center gap-2">
                {hasOwnedAccess ? (
                  <Badge variant="outline" className="border-primary/20 bg-primary/12 text-primary">
                    Kupione
                  </Badge>
                ) : null}
                <Badge variant="outline" className="border-foreground/15 bg-background/70 text-foreground">
                  {product.format}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.28em] text-foreground/65">
                {product.heroNote}
              </p>
              <h1 className="max-w-xl text-balance break-words text-5xl text-foreground sm:text-6xl">
                {product.name}
              </h1>
            </div>
          </div>
        </div>

        <div className="surface-panel space-y-6 p-6 sm:p-8">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="rounded-full border border-border/70 bg-background/70 px-3 py-1 text-muted-foreground">
                {product.format}
              </span>
              <span className="rounded-full border border-border/70 bg-background/70 px-3 py-1 text-muted-foreground">
                {product.pages} stron
              </span>
              {product.badge ? (
                <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-primary">
                  {product.badge}
                </span>
              ) : null}
              {ownedAccess?.updateLabel ? (
                <span className="rounded-full border border-border/70 bg-background/70 px-3 py-1 text-foreground">
                  {ownedAccess.updateLabel}
                </span>
              ) : null}
            </div>

            <p className="text-lg leading-8 text-muted-foreground">{product.description}</p>
          </div>

          {hasOwnedAccess ? (
            <div className="rounded-[1.7rem] border border-primary/20 bg-primary/10 p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="border-primary/20 bg-background/70 text-primary">
                      Kupione
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Masz już ten produkt na swoim koncie.
                    </span>
                  </div>
                  <p className="max-w-xl text-sm leading-7 text-muted-foreground">
                    Produkt jest przypisany do Twojej biblioteki. Możesz pobrać plik od razu albo
                    wrócić do biblioteki i otworzyć pozostałe zakupy.
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Pobrań: {ownedAccess?.downloadCount ?? 0}</p>
                  <p>
                    {ownedAccess?.lastDownloadedAt
                      ? `Ostatnio pobrano ${new Date(ownedAccess.lastDownloadedAt).toLocaleDateString("pl-PL")}`
                      : "Jeszcze nie pobrano"}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-3">
            {trustItems.map((item) => (
              <article
                key={item.title}
                className="rounded-[1.4rem] border border-border/70 bg-background/70 p-4"
              >
                <item.icon className="size-5 text-primary" />
                <p className="mt-3 text-sm font-medium text-foreground">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
              </article>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {product.includes.map((item) => (
              <div
                key={item}
                className="rounded-[1.4rem] border border-border/70 bg-background/70 px-4 py-4 text-sm text-muted-foreground"
              >
                <span className="inline-flex items-center gap-2 text-foreground">
                  <CheckCircle2 className="size-4 text-primary" />
                  {item}
                </span>
              </div>
            ))}
          </div>

          <div className="rounded-[1.7rem] border border-primary/18 bg-primary/8 p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-4xl text-foreground">{formatCurrency(product.price)}</p>
                {product.compareAtPrice ? (
                  <p className="text-sm text-muted-foreground line-through">
                    {formatCurrency(product.compareAtPrice)}
                  </p>
                ) : null}
              </div>
              <p className="max-w-xs text-sm text-muted-foreground">
                {hasOwnedAccess
                  ? "Zakup jest już przypisany do Twojego konta. Pobieranie działa tylko dla zalogowanego właściciela produktu."
                  : "Produkt cyfrowy. Po zakupie pliki pojawią się w Twojej bibliotece natychmiast, bez czekania i bez wysyłki."}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {hasOwnedAccess ? (
              <>
                {ownedDownloadHref ? (
                  <Button
                    size="lg"
                    render={<Link href={ownedDownloadHref} />}
                  >
                    <Download className="size-4" />
                    Pobierz teraz
                  </Button>
                ) : null}
                <Button size="lg" variant="outline" render={<Link href="/biblioteka" />}>
                  <LibraryBig className="size-4" />
                  Otwórz w bibliotece
                </Button>
              </>
            ) : (
              <AddToCartButton
                product={{
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  category: product.category,
                  shortDescription: product.shortDescription,
                  price: product.price,
                  coverGradient: product.coverGradient,
                }}
                fullWidth
              />
            )}
            <Button variant="outline" size="lg" render={<Link href="/produkty" />}>
              Wróć do katalogu
            </Button>
          </div>
        </div>
      </section>

      {product.previews && product.previews.length > 0 ? (
        <section className="space-y-6">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.24em] text-primary/75">Preview</p>
            <h2 className="text-4xl text-foreground">Zobacz wnętrze produktu</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {product.previews.map((preview) => (
              <div key={preview.id} className="surface-panel overflow-hidden">
                {preview.imageUrl ? (
                  <img
                    src={preview.imageUrl}
                    alt={preview.altText}
                    className="h-72 w-full object-cover"
                  />
                ) : (
                  <div className="h-72 w-full bg-secondary" />
                )}
                <div className="p-4 text-sm text-muted-foreground">{preview.altText}</div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {faqs.length > 0 ? (
        <section className="space-y-6">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.24em] text-primary/75">FAQ</p>
            <h2 className="text-4xl text-foreground">Najczęstsze pytania przed zakupem</h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {faqs.slice(0, 4).map((faq) => (
              <article key={faq.id} className="surface-panel p-6">
                <h3 className="text-xl text-foreground">{faq.question}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {relatedProducts.length > 0 ? (
        <section className="space-y-6">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.24em] text-primary/75">
              Podobne produkty
            </p>
            <h2 className="text-4xl text-foreground">Zobacz też w tej kategorii</h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </section>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-background/95 p-4 backdrop-blur sm:hidden">
        <div className="shell flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-muted-foreground">{product.name}</p>
            <p className="text-lg font-semibold text-foreground">{formatCurrency(product.price)}</p>
          </div>
          <div className="w-[220px]">
            {hasOwnedAccess ? (
              ownedDownloadHref ? (
                <Button
                  className="w-full"
                  render={<Link href={ownedDownloadHref} />}
                >
                  <Download className="size-4" />
                  Pobierz teraz
                </Button>
              ) : (
                <Button className="w-full" variant="outline" render={<Link href="/biblioteka" />}>
                  <LibraryBig className="size-4" />
                  Biblioteka
                </Button>
              )
            ) : (
              <AddToCartButton
                product={{
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  category: product.category,
                  shortDescription: product.shortDescription,
                  price: product.price,
                  coverGradient: product.coverGradient,
                }}
                fullWidth
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
