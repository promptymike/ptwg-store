import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BookOpen, NotebookText, SearchX } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeading } from "@/components/shared/section-heading";
import { formatCurrency } from "@/lib/format";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Wyniki wyszukiwania",
  robots: { index: false, follow: false },
};

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  price: number;
  categories: { name: string } | { name: string }[] | null;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  if (query.length < 2) {
    return (
      <div className="shell section-space">
        <EmptyState
          icon={SearchX}
          badge="Szukaj"
          title="Wpisz minimum 2 znaki"
          description="Użyj ikony szukania w nagłówku albo wpisz frazę w adresie ?q="
          action={{ href: "/produkty", label: "Wróć do katalogu" }}
        />
      </div>
    );
  }

  const supabase = await createSupabaseServerClient();
  const safe = query.replace(/[%_]/g, "\\$&");
  const pattern = `%${safe}%`;

  const [productsRes, blogRes] = supabase
    ? await Promise.all([
        supabase
          .from("products")
          .select(
            "id, slug, name, short_description, price, categories(name)",
          )
          .eq("status", "published")
          .or(
            `name.ilike.${pattern},short_description.ilike.${pattern},description.ilike.${pattern}`,
          )
          .limit(40),
        supabase
          .from("blog_posts")
          .select("id, slug, title, excerpt, published_at, reading_minutes")
          .eq("status", "published")
          .or(
            `title.ilike.${pattern},excerpt.ilike.${pattern},body.ilike.${pattern}`,
          )
          .limit(20),
      ])
    : [{ data: [] }, { data: [] }];

  const products = (productsRes.data as ProductRow[] | null) ?? [];
  const posts = blogRes.data ?? [];
  const total = products.length + posts.length;

  return (
    <div className="shell section-space space-y-8">
      <SectionHeading
        badge="Wyniki wyszukiwania"
        title={`„${query}" — ${total} ${total === 1 ? "wynik" : "wyników"}`}
        description="Szukamy w nazwach i opisach produktów oraz w treści wpisów na blogu."
      />

      {total === 0 ? (
        <EmptyState
          icon={SearchX}
          badge="Brak wyników"
          title={`Nic dla „${query}"`}
          description="Spróbuj krótszej frazy albo przeglądnij katalog ręcznie."
          action={{ href: "/produkty", label: "Otwórz katalog" }}
          secondaryAction={{ href: "/blog", label: "Otwórz blog" }}
        />
      ) : (
        <div className="space-y-10">
          {products.length > 0 ? (
            <section className="space-y-4">
              <h2 className="text-2xl text-foreground">
                Produkty ({products.length})
              </h2>
              <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => {
                  const cat = Array.isArray(product.categories)
                    ? product.categories[0]
                    : product.categories;
                  return (
                    <li key={product.id}>
                      <Link
                        href={`/produkty/${product.slug}`}
                        className="surface-panel group flex h-full flex-col gap-3 p-5 transition hover:-translate-y-0.5 hover:border-primary/40"
                      >
                        <div className="flex items-center gap-3">
                          <span className="inline-flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <BookOpen className="size-4" />
                          </span>
                          <span className="text-[11px] uppercase tracking-[0.18em] text-primary/75">
                            {cat?.name ?? "Produkt"}
                          </span>
                        </div>
                        <p className="text-lg font-semibold text-foreground">
                          {product.name}
                        </p>
                        {product.short_description ? (
                          <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                            {product.short_description}
                          </p>
                        ) : null}
                        <div className="mt-auto flex items-center justify-between text-sm">
                          <span className="font-semibold text-foreground">
                            {formatCurrency(product.price)}
                          </span>
                          <span className="inline-flex items-center gap-1 text-primary transition group-hover:gap-1.5">
                            Otwórz
                            <ArrowUpRight className="size-3.5" />
                          </span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}

          {posts.length > 0 ? (
            <section className="space-y-4">
              <h2 className="text-2xl text-foreground">
                Blog ({posts.length})
              </h2>
              <ul className="grid gap-3 md:grid-cols-2">
                {posts.map((post) => (
                  <li key={post.id}>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="surface-panel group flex h-full flex-col gap-3 p-5 transition hover:-translate-y-0.5 hover:border-primary/40"
                    >
                      <div className="flex items-center gap-3">
                        <span className="inline-flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <NotebookText className="size-4" />
                        </span>
                        <span className="text-[11px] uppercase tracking-[0.18em] text-primary/75">
                          Wpis · {post.reading_minutes} min
                        </span>
                      </div>
                      <p className="text-lg font-semibold text-foreground">
                        {post.title}
                      </p>
                      {post.excerpt ? (
                        <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                          {post.excerpt}
                        </p>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}
