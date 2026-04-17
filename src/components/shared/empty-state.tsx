import type { ReactNode } from "react";
import Link from "next/link";

type EmptyStateProps = {
  badge?: string;
  title: string;
  description: string;
  action?: {
    href: string;
    label: string;
  };
  extra?: ReactNode;
};

export function EmptyState({
  badge,
  title,
  description,
  action,
  extra,
}: EmptyStateProps) {
  return (
    <div className="surface-panel gold-frame flex flex-col items-start gap-5 p-8">
      {badge ? <span className="eyebrow">{badge}</span> : null}
      <div className="space-y-3">
        <h2 className="text-3xl text-white sm:text-4xl">{title}</h2>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          {description}
        </p>
      </div>
      {extra}
      {action ? (
        <Link
          href={action.href}
          className="rounded-full border border-primary/30 bg-primary/12 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/18"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
