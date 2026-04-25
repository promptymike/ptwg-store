import Link from "next/link";
import { ArrowUpRight, Download, PackageOpen, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatAdminDate } from "@/lib/format";
import { getCoverImageOverlayOpacity } from "@/lib/product";
import type { LibraryItemSnapshot } from "@/lib/supabase/store";

type LibraryGridProps = {
  items: LibraryItemSnapshot[];
};

export function LibraryGrid({ items }: LibraryGridProps) {
  return (
    <div className="grid gap-5">
      {items.map((item) => {
        const coverOverlayOpacity = getCoverImageOverlayOpacity(item);

        return (
        <article
          key={item.id}
          className="surface-panel overflow-hidden border-border/70 bg-background/70"
        >
          <div className="grid gap-0 lg:grid-cols-[240px_minmax(0,1fr)]">
            <Link
              href={`/produkty/${item.slug}`}
              className={`relative min-h-[190px] overflow-hidden bg-gradient-to-br ${item.coverGradient} p-5 transition hover:brightness-105 sm:min-h-[220px]`}
            >
              <div className="hero-orb right-4 top-4 size-16 bg-white/35" />
              <div className="hero-orb bottom-4 left-4 size-14 bg-primary/18" />

              {item.coverImageUrl && coverOverlayOpacity > 0 ? (
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    backgroundImage: `url(${item.coverImageUrl})`,
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                    opacity: coverOverlayOpacity,
                  }}
                />
              ) : null}

              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-center justify-between gap-3">
                  <Badge className="border-0 bg-background/75 text-foreground">
                    {item.category}
                  </Badge>
                  {item.updateLabel ? (
                    <Badge variant="outline" className="border-foreground/15 bg-background/75 text-foreground">
                      {item.updateLabel}
                    </Badge>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.24em] text-foreground/65">
                    {item.format}
                  </p>
                  <p className="line-clamp-3 max-w-[11rem] break-words text-2xl text-foreground">
                    {item.name}
                  </p>
                </div>
              </div>
            </Link>

            <div className="flex min-w-0 flex-col justify-between gap-6 p-5 sm:p-6">
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                      Kupione
                    </Badge>
                    <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      zakup {formatAdminDate(item.createdAt)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/produkty/${item.slug}`}
                      className="flex items-start gap-2 text-2xl text-foreground transition hover:text-primary"
                    >
                      <span className="line-clamp-2 min-w-0 break-words">{item.name}</span>
                      <ArrowUpRight className="size-4 shrink-0 translate-y-1.5" />
                    </Link>
                    <p className="mt-3 line-clamp-3 max-w-3xl break-words text-sm leading-7 text-muted-foreground">
                      {item.shortDescription}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[1.2rem] border border-border/70 bg-background/60 px-4 py-4">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-primary/75">
                      Format
                    </p>
                    <p className="mt-2 text-sm text-foreground">{item.format}</p>
                  </div>
                  <div className="rounded-[1.2rem] border border-border/70 bg-background/60 px-4 py-4">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-primary/75">
                      Pobrania
                    </p>
                    <p className="mt-2 text-sm text-foreground">{item.downloadCount}</p>
                  </div>
                  <div className="rounded-[1.2rem] border border-border/70 bg-background/60 px-4 py-4">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-primary/75">
                      Ostatnia aktywność
                    </p>
                    <p className="mt-2 text-sm text-foreground">
                      {item.lastDownloadedAt
                        ? formatAdminDate(item.lastDownloadedAt)
                        : "Jeszcze nie pobrano"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button
                  size="lg"
                  className="w-full sm:w-auto"
                  render={<Link href={`/produkty/${item.slug}`} />}
                >
                  <PackageOpen className="size-4" />
                  Otwórz produkt
                </Button>
                {item.filePath ? (
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto"
                    render={<Link href={`/api/library/${item.productId}/download`} />}
                  >
                    <Download className="size-4" />
                    Pobierz plik
                  </Button>
                ) : (
                  <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-5 py-3 text-sm font-semibold text-muted-foreground">
                    <Sparkles className="size-4" />
                    Plik będzie dostępny wkrótce
                  </span>
                )}
              </div>
            </div>
          </div>
        </article>
        );
      })}
    </div>
  );
}
