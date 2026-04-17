import Link from "next/link";

import { CATEGORY_OPTIONS } from "@/types/store";
import { cn } from "@/lib/utils";

type CategoryFilterBarProps = {
  activeCategory?: string;
};

export function CategoryFilterBar({
  activeCategory,
}: CategoryFilterBarProps) {
  const filters = [
    { label: "Wszystkie", href: "/produkty" },
    ...CATEGORY_OPTIONS.map((category) => ({
      label: category,
      href: `/produkty?kategoria=${encodeURIComponent(category)}`,
    })),
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => {
        const isActive =
          filter.label === "Wszystkie"
            ? !activeCategory
            : activeCategory === filter.label;

        return (
          <Link
            key={filter.label}
            href={filter.href}
            className={cn(
              "rounded-full border px-4 py-2 text-sm transition",
              isActive
                ? "border-primary/35 bg-primary/14 text-white"
                : "border-border/70 bg-secondary/45 text-muted-foreground hover:border-primary/25 hover:text-white",
            )}
          >
            {filter.label}
          </Link>
        );
      })}
    </div>
  );
}
