import type { ComponentType, ReactNode, SVGProps } from "react";
import Link from "next/link";

type EmptyStateAction = {
  href: string;
  label: string;
};

type EmptyStateProps = {
  badge?: string;
  title: string;
  description: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  action?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  extra?: ReactNode;
};

export function EmptyState({
  badge,
  title,
  description,
  icon: Icon,
  action,
  secondaryAction,
  extra,
}: EmptyStateProps) {
  return (
    <div className="surface-panel gold-frame flex flex-col items-start gap-5 p-8">
      {Icon ? (
        <span className="inline-flex size-14 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary shadow-[0_18px_40px_-22px_rgba(226,188,114,0.6)]">
          <Icon className="size-6" />
        </span>
      ) : null}
      {badge ? <span className="eyebrow">{badge}</span> : null}
      <div className="w-full space-y-3">
        <h2 className="break-words text-3xl text-foreground sm:text-4xl">
          {title}
        </h2>
        <p className="max-w-2xl break-words text-sm text-muted-foreground sm:text-base">
          {description}
        </p>
      </div>
      {extra}
      {action || secondaryAction ? (
        <div className="flex flex-wrap gap-3">
          {action ? (
            <Link
              href={action.href}
              className="inline-flex items-center justify-center rounded-full border border-primary/40 bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[0_12px_30px_-18px_rgba(226,188,114,0.7)] transition hover:bg-primary/90"
            >
              {action.label}
            </Link>
          ) : null}
          {secondaryAction ? (
            <Link
              href={secondaryAction.href}
              className="inline-flex items-center justify-center rounded-full border border-border/70 bg-background/60 px-5 py-3 text-sm font-semibold text-foreground transition hover:border-primary/40"
            >
              {secondaryAction.label}
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
