export default function LibraryLoading() {
  return (
    <div className="shell section-space space-y-6">
      <section className="surface-panel overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="h-3 w-24 animate-pulse rounded-full bg-primary/20" />
            <div className="h-10 w-72 animate-pulse rounded-full bg-primary/10" />
            <div className="h-4 w-96 animate-pulse rounded-full bg-primary/5" />
          </div>
          <div className="flex gap-3">
            <div className="h-11 w-32 animate-pulse rounded-full bg-primary/10" />
            <div className="h-11 w-40 animate-pulse rounded-full bg-primary/10" />
          </div>
        </div>
      </section>

      <div className="grid gap-5">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="surface-panel overflow-hidden border-border/70 bg-background/70"
          >
            <div className="grid gap-0 lg:grid-cols-[240px_minmax(0,1fr)]">
              <div className="min-h-[190px] animate-pulse bg-primary/10 sm:min-h-[220px]" />
              <div className="space-y-4 p-5 sm:p-6">
                <div className="h-3 w-24 animate-pulse rounded-full bg-primary/20" />
                <div className="h-8 w-3/4 animate-pulse rounded-full bg-primary/10" />
                <div className="h-4 w-full animate-pulse rounded-full bg-primary/5" />
                <div className="grid gap-3 sm:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-20 animate-pulse rounded-[1.2rem] border border-border/70 bg-background/60"
                    />
                  ))}
                </div>
                <div className="flex gap-3">
                  <div className="h-12 w-44 animate-pulse rounded-full bg-primary/30" />
                  <div className="h-12 w-32 animate-pulse rounded-full bg-primary/10" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
