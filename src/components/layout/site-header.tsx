"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag } from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const primaryLinks = [
  { href: "/", label: "Start" },
  { href: "/produkty", label: "Katalog" },
  { href: "/#pakiety", label: "Pakiety" },
  { href: "/#opinie", label: "Opinie" },
  { href: "/konto", label: "Konto" },
];

type SiteHeaderProps = {
  isAuthenticated?: boolean;
};

export function SiteHeader({ isAuthenticated = false }: SiteHeaderProps) {
  const pathname = usePathname();
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/78 backdrop-blur-2xl">
      <div className="shell flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="font-heading text-3xl leading-none text-white">PTWG</span>
            <span className="text-xs uppercase tracking-[0.38em] text-primary/80">
              premium store
            </span>
          </Link>

          <Button
            variant="outline"
            size="sm"
            className="lg:hidden"
            render={<Link href="/koszyk" />}
          >
            <ShoppingBag className="size-4" />
            Koszyk {totalItems > 0 ? `(${totalItems})` : ""}
          </Button>
        </div>

        <nav className="flex flex-wrap gap-2">
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
                  "rounded-full border px-4 py-2 text-sm transition",
                  isActive
                    ? "border-primary/35 bg-primary/12 text-white"
                    : "border-border/70 bg-secondary/45 text-muted-foreground hover:border-primary/25 hover:text-white",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {isAuthenticated ? (
            <LogoutButton />
          ) : (
            <Button
              variant="outline"
              className="border-primary/20 bg-secondary/50 text-white hover:bg-secondary"
              render={<Link href="/logowanie" />}
            >
              Logowanie
            </Button>
          )}
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            render={<Link href="/koszyk" />}
          >
            <ShoppingBag className="size-4" />
            Koszyk {totalItems > 0 ? `(${totalItems})` : ""}
          </Button>
        </div>
      </div>
    </header>
  );
}
