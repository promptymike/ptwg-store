/**
 * Skeleton for /produkty/[slug]. Mirrors the two-column hero (cover +
 * info panel) plus FAQ/related strips below, so the layout stays
 * stable while the product loads.
 */
export default function ProduktDetailLoading() {
  return (
    <div className="shell space-y-8 py-10 pb-28 sm:py-12 sm:pb-0 lg:py-16">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="surface-panel min-h-[340px] animate-pulse border-border/70 bg-primary/8 sm:min-h-[400px]" />
        <div className="surface-panel space-y-6 p-6 sm:p-8">
          <div className="space-y-3">
            <div className="h-3 w-24 animate-pulse rounded-full bg-primary/20" />
            <div className="h-10 w-3/4 animate-pulse rounded-full bg-primary/10" />
            <div className="h-4 w-full animate-pulse rounded-full bg-primary/5" />
            <div className="h-4 w-5/6 animate-pulse rounded-full bg-primary/5" />
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-20 animate-pulse rounded-2xl border border-border/70 bg-background/65"
              />
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-14 animate-pulse rounded-[1.4rem] border border-border/70 bg-background/70"
              />
            ))}
          </div>
          <div className="h-24 animate-pulse rounded-[1.7rem] border border-primary/18 bg-primary/8" />
          <div className="flex gap-3">
            <div className="h-12 w-44 animate-pulse rounded-full bg-primary/30" />
            <div className="h-12 w-44 animate-pulse rounded-full bg-primary/10" />
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="space-y-2">
          <div className="h-3 w-16 animate-pulse rounded-full bg-primary/20" />
          <div className="h-9 w-2/3 animate-pulse rounded-full bg-primary/10" />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-3xl border border-border/70 bg-primary/5"
            />
          ))}
        </div>
      </section>
    </div>
  );
}
