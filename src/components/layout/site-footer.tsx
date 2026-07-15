import Link from "next/link";

import { BrandLogo } from "@/components/brand/brand-logo";
import { getSiteSettingsSnapshot } from "@/lib/supabase/store";

type FooterLink = { href: string; label: string; requiresBlog?: boolean };

const baseFooterGroups: Array<{ title: string; links: FooterLink[] }> = [
  {
    title: "Sklep",
    links: [
      { href: "/planery", label: "Interaktywne planery" },
      { href: "/produkty", label: "E-booki" },
      { href: "/#featured", label: "Bestsellery" },
      { href: "/#bundles", label: "Pakiety" },
      { href: "/blog", label: "Blog", requiresBlog: true },
      { href: "/podarunek", label: "Voucher podarunkowy" },
      { href: "/test", label: "Test stylu pracy" },
    ],
  },
  {
    title: "Twoje konto",
    links: [
      { href: "/logowanie", label: "Zaloguj się" },
      { href: "/rejestracja", label: "Załóż konto" },
      { href: "/konto", label: "Panel klienta" },
      { href: "/biblioteka", label: "Moja biblioteka" },
      { href: "/lista-zyczen", label: "Lista życzeń" },
    ],
  },
  {
    title: "Pomoc",
    links: [
      { href: "/pomoc", label: "Pomoc i reklamacje" },
      { href: "/kontakt", label: "Kontakt" },
      { href: "/partner", label: "Strefa partnera" },
      { href: "/regulamin", label: "Regulamin" },
      { href: "/polityka-prywatnosci", label: "Polityka prywatności" },
      { href: "/polityka-cookies", label: "Polityka cookies" },
    ],
  },
];

type SiteFooterProps = {
  hasBlogPosts?: boolean;
};

export async function SiteFooter({ hasBlogPosts = false }: SiteFooterProps) {
  const currentYear = new Date().getFullYear();
  const settings = await getSiteSettingsSnapshot();
  const hasBusinessDetails = Boolean(
    settings.businessName || settings.businessAddress,
  );

  const footerGroups = baseFooterGroups.map((group) => ({
    ...group,
    links: group.links.filter((link) => !link.requiresBlog || hasBlogPosts),
  }));

  return (
    <footer className="relative bg-gradient-to-b from-transparent via-background to-background before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-border/30 before:to-transparent">
      <div className="shell section-space grid gap-10 xl:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
        <div className="space-y-5">
          <Link href="/" className="inline-flex">
            <BrandLogo
              iconClassName="size-11 rounded-[0.95rem]"
              textClassName="text-[1.9rem] sm:text-[2.1rem]"
            />
          </Link>
          <div className="space-y-3">
            <h2 className="max-w-md text-3xl text-foreground sm:text-4xl">
              Planery i e-booki dla osób, które chcą ogarniać życie, a nie kolejne tabelki.
            </h2>
            <p className="max-w-md text-sm leading-7 text-muted-foreground sm:text-base">
              Interaktywne planery z automatycznym zapisem i praktyczne e-booki —
              dostępne z telefonu i komputera, do życia, domu i prowadzenia firmy.
            </p>
          </div>

          {/* Operator-sklepu tile only renders once admins have filled in the
              business identity in /admin/ustawienia. Until then we leave the
              tile out entirely — the previous "uzupełnij dane operatora..."
              copy was an admin nudge that was leaking publicly. */}
          {hasBusinessDetails ? (
            <div className="rounded-[1.5rem] border border-border/70 bg-background/60 p-5 text-sm text-muted-foreground">
              <p className="text-xs uppercase tracking-[0.22em] text-primary/75">Operator sklepu</p>
              <div className="mt-3 space-y-1.5">
                {settings.businessName ? (
                  <p className="font-medium text-foreground">{settings.businessName}</p>
                ) : null}
                {settings.businessAddress ? <p>{settings.businessAddress}</p> : null}
                <p>{settings.supportEmail}</p>
                {settings.businessPhone ? <p>{settings.businessPhone}</p> : null}
              </div>
            </div>
          ) : null}
        </div>

        {footerGroups.map((group) => (
          <div key={group.title} className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-foreground/80">
              {group.title}
            </h3>
            <div className="flex flex-col gap-1">
              {group.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="-mx-2 inline-flex min-h-[36px] items-center rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition hover:bg-secondary/40 hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="relative before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-border/25 before:to-transparent">
        <div className="shell flex flex-col gap-3 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {currentYear} Templify. Wszystkie prawa zastrzeżone.</p>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>Bezpieczne płatności online</span>
            <span aria-hidden>·</span>
            <span>Reklamacje rozpatrywane w 14 dni</span>
            <span aria-hidden>·</span>
            <span>Natychmiastowy dostęp do plików</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
