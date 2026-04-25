import Link from "next/link";
import { Plus } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { formatAdminDate } from "@/lib/format";
import { getAdminBlogPosts } from "@/lib/supabase/blog";

export default async function AdminBlogPage() {
  const posts = await getAdminBlogPosts();

  return (
    <div className="space-y-6">
      <div className="surface-panel space-y-4 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl text-foreground">Blog</h2>
            <p className="text-sm text-muted-foreground">
              Wpisy, które publikujesz tutaj, lądują od razu na /blog. Dodawaj
              jeden artykuł na 2 tygodnie pod konkretne hasła Google — ruch
              kompounduje się przez miesiące.
            </p>
          </div>
          <Button render={<Link href="/admin/blog/nowy" />}>
            <Plus className="size-4" />
            Nowy wpis
          </Button>
        </div>
      </div>

      {posts.length === 0 ? (
        <EmptyState
          badge="Wpisy"
          title="Jeszcze nie masz żadnego wpisu"
          description="Zacznij od jednego krótkiego artykułu (~1000 słów) na temat, który Twoi klienci wpisują w Google. Linkuj do produktu i obserwuj ruch."
          action={{ href: "/admin/blog/nowy", label: "Dodaj pierwszy wpis" }}
        />
      ) : (
        <div className="grid gap-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/admin/blog/${post.slug}`}
              className="surface-panel flex flex-col gap-3 p-5 transition hover:border-primary/30 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                      post.status === "published"
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                        : post.status === "archived"
                          ? "border-border/70 bg-secondary/40 text-muted-foreground"
                          : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                    }`}
                  >
                    {post.status === "published"
                      ? "Opublikowany"
                      : post.status === "archived"
                        ? "Archiwum"
                        : "Draft"}
                  </span>
                  <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    {post.publishedAt
                      ? `pub. ${formatAdminDate(post.publishedAt)}`
                      : "nieopublikowany"}
                  </span>
                </div>
                <p className="break-words text-base font-semibold text-foreground">
                  {post.title}
                </p>
                {post.excerpt ? (
                  <p className="line-clamp-2 break-words text-sm text-muted-foreground">
                    {post.excerpt}
                  </p>
                ) : null}
                <p className="text-xs text-muted-foreground">/blog/{post.slug}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
