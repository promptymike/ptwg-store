/* eslint-disable @next/next/no-img-element */
import { Maximize2, X } from "lucide-react";

type ProductPreview = {
  id: string;
  imageUrl: string | null;
  altText: string;
};

type ProductPreviewGalleryProps = {
  previews: ProductPreview[];
};

function previewTargetId(preview: ProductPreview, index: number) {
  const safeId = preview.id.replace(/[^a-zA-Z0-9_-]/g, "");
  return `preview-${index + 1}-${safeId || "image"}`;
}

export function ProductPreviewGallery({ previews }: ProductPreviewGalleryProps) {
  const availablePreviews = previews.filter((preview) => preview.imageUrl);

  if (previews.length === 0) {
    return null;
  }

  return (
    <section id="product-preview-gallery" className="space-y-6 scroll-mt-28">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.24em] text-primary/75">
            Preview
          </p>
          <h2 className="text-4xl text-foreground">Zobacz wnętrze produktu</h2>
        </div>
        <p className="max-w-md text-sm leading-6 text-muted-foreground">
          Nie pokazujemy tylko okładki. Kliknij kartę i zobacz realny układ
          środka: spis treści, przykładową stronę oraz część ćwiczeniową.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {previews.map((preview, index) => {
          const hasImage = Boolean(preview.imageUrl);
          const targetId = previewTargetId(preview, index);

          return (
            <a
              key={preview.id}
              href={hasImage ? `#${targetId}` : undefined}
              data-testid="product-preview-card"
              aria-disabled={!hasImage}
              className="group overflow-hidden rounded-[1.7rem] border border-border/70 bg-card/80 text-left shadow-[0_24px_70px_-48px_rgba(0,0,0,.65)] transition hover:-translate-y-1 hover:border-primary/40 aria-disabled:pointer-events-none aria-disabled:opacity-70"
            >
              {preview.imageUrl ? (
                <div className="relative aspect-[3/2] overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(226,188,114,.28),transparent_42%),linear-gradient(135deg,#f7efe5,#efe6d9)] p-3 sm:p-4">
                  <img
                    src={preview.imageUrl}
                    alt={preview.altText}
                    className="h-full w-full rounded-xl object-cover shadow-[0_18px_45px_-24px_rgba(0,0,0,.7)] ring-1 ring-black/5 transition duration-500 group-hover:scale-[1.025]"
                  />
                  <span className="absolute left-6 top-6 rounded-full bg-stone-950/85 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.18em] text-white backdrop-blur">
                    Podgląd {index + 1}/{previews.length}
                  </span>
                  <span className="absolute right-6 top-6 inline-flex size-10 items-center justify-center rounded-full bg-white/90 text-stone-950 shadow-lg transition group-hover:scale-105">
                    <Maximize2 className="size-4" />
                  </span>
                </div>
              ) : (
                <div className="aspect-[3/2] w-full bg-secondary" />
              )}
              <div className="flex items-center justify-between gap-3 p-5">
                <div>
                  <p className="font-semibold text-foreground">{preview.altText}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Kliknij, aby otworzyć duży podgląd
                  </p>
                </div>
                <span className="text-xl text-primary transition group-hover:translate-x-1">
                  ↗
                </span>
              </div>
            </a>
          );
        })}
      </div>

      {availablePreviews.map((preview, index) => {
        const targetId = previewTargetId(preview, index);
        const previousPreview =
          availablePreviews[
            (index - 1 + availablePreviews.length) % availablePreviews.length
          ];
        const nextPreview =
          availablePreviews[(index + 1) % availablePreviews.length];
        const previousIndex = availablePreviews.findIndex(
          (item) => item.id === previousPreview?.id,
        );
        const nextIndex = availablePreviews.findIndex(
          (item) => item.id === nextPreview?.id,
        );

        return (
          <div
            key={targetId}
            id={targetId}
            className="fixed inset-0 z-[9999] hidden items-center justify-center bg-stone-950/95 p-4 backdrop-blur-md [&:target]:flex"
            style={{ width: "100vw", height: "100vh", zIndex: 9999 }}
            role="dialog"
            aria-modal="true"
            data-testid="product-preview-lightbox"
            aria-label={`Podgląd produktu: ${preview.altText}`}
          >
            <a
              href="#product-preview-gallery"
              aria-label="Zamknij podgląd"
              className="absolute inset-0"
            />
            <div className="relative flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-white/15 bg-[#f8f1e8] shadow-2xl">
              <div className="flex items-center justify-between gap-4 border-b border-black/10 px-5 py-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
                    Podgląd e-booka
                  </p>
                  <h3 className="text-lg font-semibold text-stone-950">
                    {preview.altText}
                  </h3>
                </div>
                <a
                  href="#product-preview-gallery"
                  className="inline-flex size-11 items-center justify-center rounded-full border border-black/10 bg-white text-stone-950 transition hover:bg-stone-100"
                  aria-label="Zamknij podgląd"
                >
                  <X className="size-5" />
                </a>
              </div>

              <div className="min-h-0 overflow-auto p-3 sm:p-6">
                <img
                  src={preview.imageUrl ?? ""}
                  alt={preview.altText}
                  className="mx-auto max-h-[74vh] w-auto max-w-full rounded-2xl bg-white object-contain shadow-[0_30px_90px_-50px_rgba(0,0,0,.9)]"
                />
              </div>

              {availablePreviews.length > 1 ? (
                <div className="flex items-center justify-between gap-3 border-t border-black/10 px-5 py-4 text-sm">
                  <a
                    href={`#${previewTargetId(previousPreview!, previousIndex)}`}
                    className="rounded-full border border-black/10 bg-white px-4 py-2 font-semibold text-stone-950 transition hover:bg-stone-100"
                  >
                    Poprzedni
                  </a>
                  <p className="text-muted-foreground">
                    {index + 1} / {availablePreviews.length}
                  </p>
                  <a
                    href={`#${previewTargetId(nextPreview!, nextIndex)}`}
                    className="rounded-full border border-black/10 bg-white px-4 py-2 font-semibold text-stone-950 transition hover:bg-stone-100"
                  >
                    Następny
                  </a>
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </section>
  );
}
