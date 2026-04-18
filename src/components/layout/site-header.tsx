"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShoppingBag } from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import { useCart } from "@/components/cart/cart-provider";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const primaryLinks = [
  { href: "/", label: "Start" },
  { href: "/produkty", label: "Produkty" },
  { href: "/#use-cases", label: "Kategorie" },
  { href: "/#bundles", label: "Pakiety" },
  { href: "/#faq", label: "FAQ" },
  { href: "/konto", label: "Konto" },
];

type SiteHeaderProps = {
  isAuthenticated?: boolean;
};

export function SiteHeader({ isAuthenticated = false }: SiteHeaderProps) {
  const pathname = usePathname();
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/88 backdrop-blur-2xl">
      <div className="shell flex flex-col gap-4 py-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-baseline gap-3">
            <span className="font-heading text-3xl leading-none text-foreground">Templify</span>
            <span className="text-[11px] uppercase tracking-[0.34em] text-muted-foreground">
              szablony premium
            </span>
          </Link>

          <div className="flex items-center gap-2 xl:hidden">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              render={<Link href="/koszyk" />}
            >
              <ShoppingBag className="size-4" />
              {totalItems > 0 ? totalItems : "Koszyk"}
            </Button>
          </div>
        </div>

        <nav className="hidden flex-wrap items-center gap-2 xl:flex">
          {primaryLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href.replace("/#", "/"));

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm transition",
                  isActive
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 xl:flex">
          <ThemeToggle />
          {isAuthenticated ? (
            <LogoutButton />
          ) : (
            <Button variant="outline" render={<Link href="/logowanie" />}>
              Logowanie
            </Button>
          )}
          <Button render={<Link href="/koszyk" />}>
            <ShoppingBag className="size-4" />
            Koszyk {totalItems > 0 ? `(${totalItems})` : ""}
          </Button>
        </div>

        <nav className="flex items-center gap-2 overflow-x-auto xl:hidden">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/70 px-3 py-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <Menu className="size-3.5" />
            Menu
          </span>
          {primaryLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap rounded-full border border-border/70 px-4 py-2 text-sm text-muted-foreground transition hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
