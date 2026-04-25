import type { Metadata } from "next";
import Link from "next/link";
import { Clock, NotebookText } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeading } from "@/components/shared/section-heading";
import { formatAdminDate } from "@/lib/format";
import { buildCanonicalMetadata } from "@/lib/seo";
import { getPublishedBlogPosts } from "@/lib/supabase/blog";

export const metadata: Metadata = buildCanonicalMetadata({
  title: "Blog Templify",
  description:
    "Poradniki i wskazówki o finansach, zdrowiu, macierzyństwie i produktywności. Praktyczne treści z naszych ebooków.",
  path: "/blog",
});

export default async function BlogIndexPage() {
  const posts = await getPublishedBlogPosts();

  return (
    <div className="shell section-space space-y-8">
      <SectionHeading
        badge="Blog"
        title="Praktyczne wskazówki, które naprawdę działają"
        description="Krótkie poradniki o pieniądzach, ciele, czasie i bliskich. Tematy bezpośrednio powiązane z naszymi ebookami — żebyś mógł testować pomysły zanim kupisz."
      />

      {posts.length === 0 ? (
        <EmptyState
          icon={NotebookText}
          badge="Wkrótce"
          title="Pierwsze wpisy są w drodze"
          description="Trwa pierwszy etap publikacji bloga. Zapisz się na newsletter, a powiadomimy Cię o pierwszych artykułach."
          action={{ href: "/produkty", label: "Przeglądaj ebooki" }}
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.id}
              className="surface-panel group flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_24px_70px_-30px_rgba(0,0,0,0.45)]"
            >
              <Link
                href={`/blog/${post.slug}`}
                className="block aspect-[16/9] overflow-hidden bg-gradient-to-br from-primary/15 via-secondary/40 to-background/80"
              >
                {post.coverImageUrl ? (
                  <div
                    aria-hidden
                    className="size-full transition-transform duration-700 group-hover:scale-105"
                    style={{
                      backgroundImage: `url(${post.coverImageUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-primary/40">
                    <NotebookText className="size-12" />
                  </div>
                )}
              </Link>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  {post.publishedAt ? (
                    <time dateTime={post.publishedAt}>
                      {formatAdminDate(post.publishedAt)}
                    </time>
                  ) : null}
                  <span aria-hidden>·</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3" />
                    {post.readingMinutes} min
                  </span>
                </div>
                <Link
                  href={`/blog/${post.slug}`}
                  className="block break-words text-xl font-semibold text-foreground transition group-hover:text-primary"
                >
                  {post.title}
                </Link>
                {post.excerpt ? (
                  <p className="line-clamp-3 break-words text-sm leading-6 text-muted-foreground">
                    {post.excerpt}
                  </p>
                ) : null}
                {post.tags.length > 0 ? (
                  <div className="mt-auto flex flex-wrap gap-2 pt-2">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-border/70 bg-background/60 px-2.5 py-0.5 text-[11px] text-muted-foreground"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
