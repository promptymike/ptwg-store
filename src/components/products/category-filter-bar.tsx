import Link from "next/link";

import { cn } from "@/lib/utils";

type CategoryFilterBarProps = {
  activeCategory?: string;
  categories?: string[];
};

export function CategoryFilterBar({
  activeCategory,
  categories = [],
}: CategoryFilterBarProps) {
  const filters = [
    { label: "Wszystkie", href: "/produkty" },
    ...categories.map((category) => ({
      label: category,
      href: `/produkty?kategoria=${encodeURIComponent(category)}`,
    })),
  ];

  return (
    <div className="-mx-1 flex flex-nowrap gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-visible sm:pb-0">
      {filters.map((filter) => {
        const isActive =
          filter.label === "Wszystkie"
            ? !activeCategory
            : activeCategory === filter.label;

        return (
          <Link
            key={filter.label}
            href={filter.href}
            scroll={false}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-all duration-200 ease-out",
              isActive
                ? "border-primary/40 bg-primary text-primary-foreground shadow-[0_12px_24px_-16px_rgba(226,188,114,0.65)]"
                : "border-border/70 bg-secondary/45 text-muted-foreground hover:-translate-y-0.5 hover:border-primary/30 hover:text-foreground",
            )}
          >
            {filter.label}
          </Link>
        );
      })}
    </div>
  );
}
