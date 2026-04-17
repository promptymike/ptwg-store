import Link from "next/link";

const footerGroups = [
  {
    title: "Sklep",
    links: [
      { href: "/produkty", label: "Produkty" },
      { href: "/koszyk", label: "Koszyk" },
      { href: "/checkout", label: "Checkout" },
      { href: "/biblioteka", label: "Moja biblioteka" },
    ],
  },
  {
    title: "Konto",
    links: [
      { href: "/logowanie", label: "Logowanie" },
      { href: "/rejestracja", label: "Rejestracja" },
      { href: "/konto", label: "Panel klienta" },
      { href: "/kontakt", label: "Kontakt" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/polityka-prywatnosci", label: "Polityka prywatności" },
      { href: "/polityka-cookies", label: "Polityka cookies" },
      { href: "/regulamin", label: "Regulamin" },
      { href: "/kontakt", label: "Kontakt" },
    ],
  },
  {
    title: "Admin",
    links: [
      { href: "/admin", label: "Dashboard" },
      { href: "/admin/produkty", label: "Produkty" },
      { href: "/admin/content", label: "Content / Strony" },
      { href: "/admin/admini", label: "Admini" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="shell section-space grid gap-10 xl:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div className="space-y-4">
          <span className="eyebrow">Templify</span>
          <div className="space-y-3">
            <h2 className="max-w-md text-3xl text-foreground sm:text-4xl">
              Premium storefront dla gotowych systemów, templatek i produktów cyfrowych.
            </h2>
            <p className="max-w-md text-sm leading-7 text-muted-foreground sm:text-base">
              Templify sprzedaje rezultat, nie plik. Storefront, konto, biblioteka, checkout,
              legal pages i panel admina są spięte z Supabase, Storage i Stripe.
            </p>
          </div>
        </div>

        {footerGroups.map((group) => (
          <div key={group.title} className="space-y-4">
            <h3 className="text-lg text-foreground">{group.title}</h3>
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
    </footer>
  );
}
