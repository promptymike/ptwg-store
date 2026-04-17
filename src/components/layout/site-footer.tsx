import Link from "next/link";

const footerGroups = [
  {
    title: "Sklep",
    links: [
      { href: "/produkty", label: "Produkty" },
      { href: "/koszyk", label: "Koszyk" },
      { href: "/checkout", label: "Checkout" },
    ],
  },
  {
    title: "Konto",
    links: [
      { href: "/logowanie", label: "Logowanie" },
      { href: "/rejestracja", label: "Rejestracja" },
      { href: "/biblioteka", label: "Moja biblioteka" },
    ],
  },
  {
    title: "Admin",
    links: [
      { href: "/admin", label: "Dashboard" },
      { href: "/admin/produkty", label: "Produkty" },
      { href: "/admin/zamowienia", label: "Zamówienia" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="shell section-space grid gap-10 lg:grid-cols-[1.3fr_repeat(3,1fr)]">
        <div className="space-y-4">
          <span className="eyebrow">Footer</span>
          <div className="space-y-3">
            <h2 className="text-3xl text-white sm:text-4xl">
              Cyfrowe produkty w estetyce premium, gotowe pod sprzedaż i rozwój.
            </h2>
            <p className="max-w-md text-sm text-muted-foreground sm:text-base">
              MVP przygotowane w Next.js, z dark-gold UI, polskim katalogiem,
              Supabase Auth, Stripe Checkout i architekturą gotową pod deployment na Vercel.
            </p>
          </div>
        </div>

        {footerGroups.map((group) => (
          <div key={group.title} className="space-y-4">
            <h3 className="text-lg text-white">{group.title}</h3>
            <div className="flex flex-col gap-2">
              {group.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground transition hover:text-primary"
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
