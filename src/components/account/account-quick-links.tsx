import Link from "next/link";
import { ArrowRight, CreditCard, LibraryBig, UserRound } from "lucide-react";

type AccountQuickLinksProps = {
  libraryCount: number;
  orderCount: number;
  email: string;
};

const items = [
  {
    href: "/biblioteka",
    title: "Moja biblioteka",
    description: "Wszystkie kupione produkty, pobrania i szybki powrót do materiałów.",
    icon: LibraryBig,
    key: "library",
  },
  {
    href: "#zamowienia",
    title: "Moje zamówienia",
    description: "Historia zakupów i status ostatnich zamówień w jednym miejscu.",
    icon: CreditCard,
    key: "orders",
  },
  {
    href: "#profil",
    title: "Profil i ustawienia",
    description: "Dane konta, e-mail logowania i podstawowe informacje o profilu.",
    icon: UserRound,
    key: "profile",
  },
] as const;

export function AccountQuickLinks({
  libraryCount,
  orderCount,
  email,
}: AccountQuickLinksProps) {
  const metaByKey = {
    library: `${libraryCount} pozycji`,
    orders: `${orderCount} zamówień`,
    profile: email,
  } as const;

  return (
    <section className="grid gap-4 lg:grid-cols-3">
      {items.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          className="surface-panel group border-border/70 bg-background/60 p-5 transition hover:border-primary/30"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="rounded-full border border-primary/20 bg-primary/10 p-3 text-primary">
              <item.icon className="size-5" />
            </div>
            <ArrowRight className="size-4 text-muted-foreground transition group-hover:text-foreground" />
          </div>

          <div className="mt-5 space-y-2">
            <p className="text-lg text-foreground">{item.title}</p>
            <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
            <p className="break-all text-xs uppercase tracking-[0.18em] text-primary/75">
              {metaByKey[item.key]}
            </p>
          </div>
        </Link>
      ))}
    </section>
  );
}
