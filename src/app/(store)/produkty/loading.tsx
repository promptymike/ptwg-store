/**
 * Skeleton for /produkty navigation. Matches the real catalog layout
 * (heading + filter bar + product grid) so the page does not "jump"
 * when the server-rendered content swaps in.
 */
export default function ProduktyLoading() {
  return (
    <div className="shell section-space space-y-8">
      <div className="space-y-4">
        <div className="h-4 w-24 animate-pulse rounded-full bg-primary/20" />
        <div className="h-12 w-full max-w-2xl animate-pulse rounded-full bg-primary/10" />
        <div className="h-4 w-full max-w-xl animate-pulse rounded-full bg-primary/5" />
      </div>

      <div className="surface-panel space-y-6 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-9 w-32 animate-pulse rounded-full bg-primary/10"
              />
            ))}
          </div>
          <div className="h-4 w-24 animate-pulse rounded-full bg-primary/5" />
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="surface-panel h-[420px] animate-pulse border-border/70 bg-primary/5"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
