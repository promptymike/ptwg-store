export default function Loading() {
  return (
    <div className="shell section-space">
      <div className="surface-panel gold-frame space-y-6 p-8">
        <div className="h-4 w-28 animate-pulse rounded-full bg-primary/20" />
        <div className="h-12 w-full max-w-2xl animate-pulse rounded-full bg-primary/10" />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-56 animate-pulse rounded-[1.75rem] border border-border/70 bg-primary/5"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
