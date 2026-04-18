import Link from "next/link";

const footerGroups = [
  {
    title: "Sklep",
    links: [
      { href: "/produkty", label: "Wszystkie produkty" },
      { href: "/#featured", label: "Bestsellery" },
      { href: "/#bundles", label: "Pakiety" },
      { href: "/#faq", label: "Najczęstsze pytania" },
    ],
  },
  {
    title: "Twoje konto",
    links: [
      { href: "/logowanie", label: "Zaloguj się" },
      { href: "/rejestracja", label: "Załóż konto" },
      { href: "/konto", label: "Panel klienta" },
      { href: "/biblioteka", label: "Moja biblioteka" },
    ],
  },
  {
    title: "Pomoc",
    links: [
      { href: "/kontakt", label: "Kontakt" },
      { href: "/regulamin", label: "Regulamin" },
      { href: "/polityka-prywatnosci", label: "Polityka prywatności" },
      { href: "/polityka-cookies", label: "Polityka cookies" },
    ],
  },
];

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60">
      <div className="shell section-space grid gap-10 xl:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="space-y-5">
          <span className="eyebrow">Templify</span>
          <div className="space-y-3">
            <h2 className="max-w-md text-3xl text-foreground sm:text-4xl">
              Premium szablony cyfrowe i gotowe systemy pracy.
            </h2>
            <p className="max-w-md text-sm leading-7 text-muted-foreground sm:text-base">
              Sprzedajemy efekt, nie plik. Każdy szablon jest zaprojektowany pod szybsze wdrożenie,
              lepsze decyzje i spokojniejszą pracę każdego dnia.
            </p>
          </div>
          <div className="space-y-1.5 text-sm text-muted-foreground">
            <p>kontakt@templify.store</p>
            <p>Pomoc dostępna w dni robocze, 9:00–17:00</p>
          </div>
        </div>

        {footerGroups.map((group) => (
          <div key={group.title} className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-foreground/80">
              {group.title}
            </h3>
            <div className="flex flex-col gap-2">
              {group.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground transition hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border/50">
        <div className="shell flex flex-col gap-3 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {currentYear} Templify. Wszystkie prawa zastrzeżone.
          </p>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>Bezpieczne płatności online</span>
            <span aria-hidden>·</span>
            <span>14 dni na zwrot</span>
            <span aria-hidden>·</span>
            <span>Natychmiastowy dostęp do plików</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
