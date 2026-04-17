import type { StoreStat } from "@/types/store";

type StatsSectionProps = {
  stats: StoreStat[];
};

export function StatsSection({ stats }: StatsSectionProps) {
  return (
    <section className="shell">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article key={stat.id} className="surface-panel p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-primary/75">
              {stat.label}
            </p>
            <p className="mt-3 text-4xl text-foreground">{stat.value}</p>
            <p className="mt-2 text-sm text-muted-foreground">{stat.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
