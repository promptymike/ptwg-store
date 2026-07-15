import type { ReactNode } from "react";

// Building blocks for the code-owned legal documents (regulamin, polityka
// prywatności). These pages are the legally binding versions reviewed by the
// payment operator, so their content lives in git — not in content_pages —
// and renders deterministically.

export function LegalShell({
  eyebrow,
  title,
  lead,
  effectiveDate,
  children,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  effectiveDate: string;
  children: ReactNode;
}) {
  return (
    <div className="shell section-space">
      <article className="surface-panel mx-auto max-w-4xl space-y-8 p-6 sm:p-10">
        <header className="space-y-3">
          <span className="eyebrow">{eyebrow}</span>
          <h1 className="text-4xl text-foreground sm:text-5xl">{title}</h1>
          <p className="text-sm leading-7 text-muted-foreground sm:text-base">{lead}</p>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Obowiązuje od: {effectiveDate}
          </p>
        </header>
        {children}
      </article>
    </div>
  );
}

export function LegalToc({
  items,
}: {
  items: Array<{ href: string; num: string; label: string }>;
}) {
  return (
    <nav
      aria-label="Spis treści"
      className="rounded-2xl border border-border/70 bg-secondary/30 p-5 sm:p-6"
    >
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Spis treści</p>
      <div className="mt-4 grid gap-x-8 sm:grid-cols-2">
        {items.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="flex items-baseline gap-3 border-b border-border/50 py-2 text-sm text-foreground/90 transition last:border-0 hover:text-primary sm:[&:nth-last-child(2)]:border-0"
          >
            <span className="min-w-9 shrink-0 text-xs font-bold text-primary">{item.num}</span>
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

export function LegalSection({
  id,
  num,
  title,
  children,
}: {
  id: string;
  num: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 space-y-4 border-t border-border/50 pt-8 first-of-type:border-0">
      <h2 className="flex items-baseline gap-3 text-2xl text-foreground">
        <span className="text-base font-bold text-primary">{num}</span>
        {title}
      </h2>
      <div className="space-y-3 text-sm leading-7 text-muted-foreground sm:text-[0.95rem] sm:leading-8 [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_h3]:pt-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-foreground [&_li]:mb-1.5 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-5 [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
        {children}
      </div>
    </section>
  );
}

export function LegalCallout({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-primary/25 bg-primary/5 p-4 text-sm leading-7 [&_p]:m-0 [&_p+p]:mt-2">
      {children}
    </div>
  );
}

export function LegalAttachment({
  id,
  label,
  title,
  children,
}: {
  id: string;
  label: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 space-y-4 rounded-2xl border border-border/70 bg-secondary/25 p-5 sm:p-7"
    >
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
        <h2 className="mt-2 text-xl font-semibold text-foreground">{title}</h2>
      </div>
      <div className="space-y-3 text-sm leading-7 text-muted-foreground [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
        {children}
      </div>
    </section>
  );
}

export function LegalFormField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="border-b border-border/60 py-2.5 last:border-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-foreground/80">{label}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {value ?? "……………………………………………………………………………"}
      </p>
    </div>
  );
}
