import { storeStats } from "@/data/mock-store";

export function StatsSection() {
  return (
    <section className="shell">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {storeStats.map((stat) => (
          <article key={stat.id} className="surface-panel gold-frame p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-primary/70">
              {stat.label}
            </p>
            <p className="mt-3 text-4xl text-white">{stat.value}</p>
            <p className="mt-2 text-sm text-muted-foreground">{stat.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
