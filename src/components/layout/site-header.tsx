"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShoppingBag, X } from "lucide-react";

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
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- close mobile menu when route changes
    setIsMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMobileOpen) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [isMobileOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-2xl">
      <div className="shell flex items-center justify-between gap-4 py-3 xl:py-4">
        <Link href="/" className="flex items-baseline gap-3">
          <span className="font-heading text-3xl leading-none text-foreground">Templify</span>
          <span className="hidden text-[11px] uppercase tracking-[0.34em] text-muted-foreground sm:inline">
            szablony premium
          </span>
        </Link>

        <nav className="hidden flex-wrap items-center gap-1 xl:flex">
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

        <div className="hidden items-center gap-2 xl:flex">
          <ThemeToggle />
          {isAuthenticated ? (
            <LogoutButton />
          ) : (
            <Button variant="outline" size="sm" render={<Link href="/logowanie" />}>
              Logowanie
            </Button>
          )}
          <Button size="sm" render={<Link href="/koszyk" />}>
            <ShoppingBag className="size-4" />
            Koszyk {totalItems > 0 ? `(${totalItems})` : ""}
          </Button>
        </div>

        <div className="flex items-center gap-2 xl:hidden">
          <ThemeToggle />
          <Button
            variant="outline"
            size="sm"
            className="relative gap-2"
            render={<Link href="/koszyk" />}
          >
            <ShoppingBag className="size-4" />
            {totalItems > 0 ? (
              <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                {totalItems}
              </span>
            ) : null}
          </Button>
          <button
            type="button"
            aria-label={isMobileOpen ? "Zamknij menu" : "Otwórz menu"}
            aria-expanded={isMobileOpen}
            onClick={() => setIsMobileOpen((value) => !value)}
            className="inline-flex size-10 items-center justify-center rounded-full border border-border/70 bg-background/80 text-foreground transition hover:bg-secondary"
          >
            {isMobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {isMobileOpen ? (
        <div className="xl:hidden">
          <div
            className="fixed inset-0 top-[var(--mobile-nav-offset,0px)] z-40 bg-background/60 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
            aria-hidden
          />
          <div className="relative z-50 border-t border-border/60 bg-background/95 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.2)]">
            <nav className="shell flex flex-col gap-1 py-4">
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
                      "rounded-2xl px-4 py-3 text-base transition",
                      isActive
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="mt-2 flex flex-col gap-2 border-t border-border/60 pt-3">
                {isAuthenticated ? (
                  <LogoutButton />
                ) : (
                  <Button variant="outline" render={<Link href="/logowanie" />}>
                    Logowanie
                  </Button>
                )}
              </div>
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
}
