import Image from "next/image";

import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  priority?: boolean;
};

export function BrandLogo({
  className,
  iconClassName,
  textClassName,
  priority = false,
}: BrandLogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        aria-hidden
        className={cn(
          "relative inline-flex size-10 shrink-0 overflow-hidden rounded-[0.85rem] bg-card shadow-[0_10px_28px_-18px_rgba(0,0,0,0.35)] ring-1 ring-border/45",
          iconClassName,
        )}
      >
        <Image
          src="/brand/templify-app-icon.png"
          alt=""
          fill
          sizes="48px"
          className="object-cover"
          priority={priority}
        />
      </span>
      <span
        className={cn(
          "flex items-baseline font-heading text-[1.72rem] font-semibold leading-none tracking-[-0.055em] text-foreground sm:text-[1.92rem]",
          textClassName,
        )}
      >
        <span>templify</span>
        <span className="text-primary">.pl</span>
      </span>
    </span>
  );
}
