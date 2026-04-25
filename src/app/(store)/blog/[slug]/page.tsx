import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { ProductCard } from "@/components/products/product-card";
import { formatAdminDate } from "@/lib/format";
import { buildCanonicalMetadata, getCanonicalUrl } from "@/lib/seo";
import { getCurrentUser } from "@/lib/session";
import {
  getAllBlogSlugs,
  getBlogPostBySlug,
} from "@/lib/supabase/blog";
import {
  getOwnedProductIds,
  getStoreProducts,
} from "@/lib/supabase/store";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: "Wpis nie istnieje" };
  return buildCanonicalMetadata({
    title: post.title,
    description: post.excerpt || post.title,
    path: `/blog/${post.slug}`,
    image: post.coverImageUrl ?? undefined,
  });
}

export async function generateStaticParams() {
  const slugs = await getAllBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const [allProducts, user] = await Promise.all([
    getStoreProducts(),
    getCurrentUser(),
  ]);
  const ownedIds = await getOwnedProductIds(user?.id ?? null);
  const relatedProducts = post.relatedProductIds
    .map((id) => allProducts.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const articleStructuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.coverImageUrl ? [post.coverImageUrl] : undefined,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    inLanguage: "pl-PL",
    author: post.authorName
      ? { "@type": "Person", name: post.authorName }
      : { "@type": "Organization", name: "Templify" },
    publisher: {
      "@type": "Organization",
      name: "Templify",
      url: getCanonicalUrl("/"),
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": getCanonicalUrl(`/blog/${post.slug}`),
    },
  };

  return (
    <article className="shell space-y-10 py-10 sm:py-12 lg:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />

      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Wszystkie wpisy
      </Link>

      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {post.publishedAt ? (
            <time dateTime={post.publishedAt}>
              {formatAdminDate(post.publishedAt)}
            </time>
          ) : null}
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3" />
            {post.readingMinutes} min czytania
          </span>
          {post.authorName ? (
            <>
              <span aria-hidden>·</span>
              <span>{post.authorName}</span>
            </>
          ) : null}
        </div>
        <h1 className="max-w-3xl text-balance break-words font-heading text-4xl font-semibold text-foreground sm:text-5xl">
          {post.title}
        </h1>
        {post.excerpt ? (
          <p className="max-w-3xl break-words text-base leading-7 text-muted-foreground sm:text-lg">
            {post.excerpt}
          </p>
        ) : null}
      </header>

      {post.coverImageUrl ? (
        <div
          className="surface-panel aspect-[16/9] overflow-hidden"
          style={{
            backgroundImage: `url(${post.coverImageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          aria-label={post.title}
          role="img"
        />
      ) : null}

      <div className="prose prose-stone mx-auto max-w-3xl break-words text-foreground prose-headings:font-heading prose-headings:font-semibold prose-headings:text-foreground prose-p:text-foreground/90 prose-p:leading-7 prose-a:text-primary prose-strong:text-foreground prose-li:text-foreground/90 prose-blockquote:border-primary/40 prose-blockquote:text-muted-foreground prose-img:rounded-2xl">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.body}</ReactMarkdown>
      </div>

      {relatedProducts.length > 0 ? (
        <section className="space-y-6">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.24em] text-primary/75">
              Zgłębisz temat dalej
            </p>
            <h2 className="text-3xl text-foreground sm:text-4xl">
              Powiązane ebooki
            </h2>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {relatedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isOwned={ownedIds.has(product.id)}
              />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
