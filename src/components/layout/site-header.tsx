"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  LayoutDashboard,
  LibraryBig,
  Menu,
  ShieldCheck,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import { useCart } from "@/components/cart/cart-provider";
import { MiniCart } from "@/components/cart/mini-cart";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const primaryLinks = [
  { href: "/produkty", label: "Produkty" },
  { href: "/#use-cases", label: "Kategorie" },
  { href: "/#bundles", label: "Pakiety" },
  { href: "/test", label: "Test" },
];

export type SiteHeaderProfile = {
  initials: string;
  displayName: string;
  email: string;
  isAdmin: boolean;
};

type SiteHeaderProps = {
  profile?: SiteHeaderProfile | null;
};

export function SiteHeader({ profile }: SiteHeaderProps) {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- close menus after navigation
    setIsMobileOpen(false);
    setIsAccountOpen(false);
    setIsCartOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMobileOpen) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [isMobileOpen]);

  useEffect(() => {
    if (!isAccountOpen) return;
    function handleClick(event: MouseEvent) {
      if (!accountRef.current) return;
      if (!accountRef.current.contains(event.target as Node)) {
        setIsAccountOpen(false);
      }
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setIsAccountOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isAccountOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-2xl">
      <div className="shell flex items-center justify-between gap-4 py-3 xl:py-4">
        <Link href="/" className="flex min-h-[36px] items-baseline gap-3">
          <span className="font-heading text-3xl leading-none text-foreground">
            Templify
          </span>
          <span className="hidden text-[11px] uppercase tracking-[0.34em] text-muted-foreground sm:inline">
            ebooki i planery
          </span>
        </Link>

        <nav className="hidden flex-wrap items-center gap-1 xl:flex">
          {primaryLinks.map((link) => {
            const isActive = pathname.startsWith(link.href.replace("/#", "/"));
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
          {profile ? (
            <div className="relative" ref={accountRef}>
              <button
                type="button"
                onClick={() => setIsAccountOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={isAccountOpen}
                className="group inline-flex h-11 items-center gap-3 rounded-full border border-border/70 bg-card/70 px-2 pr-4 transition hover:border-primary/40"
              >
                <span className="inline-flex size-8 items-center justify-center rounded-full bg-foreground text-xs font-semibold uppercase tracking-[0.14em] text-background">
                  {profile.initials}
                </span>
                <span className="hidden max-w-[12ch] truncate text-sm font-semibold text-foreground sm:inline">
                  {profile.displayName}
                </span>
              </button>
              {isAccountOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-72 origin-top-right rounded-2xl border border-border/80 bg-card/95 p-2 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.45)] backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  <div className="flex items-center gap-3 rounded-xl px-3 py-2">
                    <span className="inline-flex size-9 items-center justify-center rounded-full bg-foreground text-xs font-semibold uppercase tracking-[0.14em] text-background">
                      {profile.initials}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {profile.displayName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {profile.email}
                      </p>
                    </div>
                  </div>
                  <div className="my-1 h-px bg-border/60" aria-hidden />
                  <Link
                    href="/biblioteka"
                    role="menuitem"
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground transition hover:bg-secondary"
                  >
                    <LibraryBig className="size-4" />
                    Moja biblioteka
                  </Link>
                  <Link
                    href="/lista-zyczen"
                    role="menuitem"
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground transition hover:bg-secondary"
                  >
                    <Heart className="size-4" />
                    Lista życzeń
                  </Link>
                  <Link
                    href="/konto"
                    role="menuitem"
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground transition hover:bg-secondary"
                  >
                    <UserRound className="size-4" />
                    Konto i zamówienia
                  </Link>
                  {profile.isAdmin ? (
                    <Link
                      href="/admin"
                      role="menuitem"
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground transition hover:bg-secondary"
                    >
                      <ShieldCheck className="size-4" />
                      Panel admina
                    </Link>
                  ) : null}
                  <div className="my-1 h-px bg-border/60" aria-hidden />
                  <div className="px-1 pb-1">
                    <LogoutButton
                      className="w-full justify-start"
                      variant="ghost"
                      size="sm"
                    />
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              render={<Link href="/logowanie?next=/checkout" />}
            >
              Zaloguj się
            </Button>
          )}
          <Button
            size="sm"
            className="relative gap-2"
            onClick={() => setIsCartOpen(true)}
            aria-label="Otwórz koszyk"
            aria-haspopup="dialog"
            aria-expanded={isCartOpen}
          >
            <ShoppingBag className="size-4" />
            Koszyk
            {totalItems > 0 ? (
              <span className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-primary-foreground/20 px-1.5 text-[11px] font-bold text-primary-foreground">
                {totalItems}
              </span>
            ) : null}
          </Button>
        </div>

        <div className="flex items-center gap-2 xl:hidden">
          <Button
            variant="outline"
            size="sm"
            className="relative gap-2"
            onClick={() => setIsCartOpen(true)}
            aria-label="Otwórz koszyk"
            aria-haspopup="dialog"
            aria-expanded={isCartOpen}
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
              {profile ? (
                <div className="mb-3 flex items-center gap-3 rounded-2xl border border-border/70 bg-card/60 p-3">
                  <span className="inline-flex size-10 items-center justify-center rounded-full bg-foreground text-sm font-semibold uppercase tracking-[0.14em] text-background">
                    {profile.initials}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {profile.displayName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {profile.email}
                    </p>
                  </div>
                </div>
              ) : null}

              {primaryLinks.map((link) => {
                const isActive = pathname.startsWith(link.href.replace("/#", "/"));
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

              <div className="mt-2 space-y-2 border-t border-border/60 pt-3">
                <ThemeToggle />
              </div>

              <div className="mt-2 flex flex-col gap-2 border-t border-border/60 pt-3">
                {profile ? (
                  <>
                    <Button variant="outline" render={<Link href="/biblioteka" />}>
                      <LibraryBig className="size-4" />
                      Moja biblioteka
                    </Button>
                    <Button variant="outline" render={<Link href="/konto" />}>
                      <UserRound className="size-4" />
                      Konto i zamówienia
                    </Button>
                    {profile.isAdmin ? (
                      <Button
                        variant="outline"
                        render={<Link href="/admin" />}
                      >
                        <LayoutDashboard className="size-4" />
                        Panel admina
                      </Button>
                    ) : null}
                    <LogoutButton variant="ghost" className="justify-start" />
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      render={<Link href="/logowanie?next=/checkout" />}
                    >
                      Logowanie
                    </Button>
                    <Button render={<Link href="/rejestracja?next=/checkout" />}>
                      Załóż konto
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        </div>
      ) : null}

      <MiniCart open={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
}
