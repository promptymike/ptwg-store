import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { getCurrentRole } from "@/lib/session";

type AccountPageProps = {
  searchParams: Promise<{
    denied?: string;
  }>;
};

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const role = await getCurrentRole();
  const resolvedSearchParams = await searchParams;

  return (
    <div className="shell section-space">
      <EmptyState
        badge="Konto użytkownika"
        title="Placeholder strefy klienta"
        description={`Aktywna rola demo: ${role ?? "brak"}. Tutaj później pojawią się dane konta, historia zamówień i ustawienia profilu z Supabase Auth.`}
        action={{ href: "/biblioteka", label: "Przejdź do biblioteki" }}
        extra={
          resolvedSearchParams.denied ? (
            <div className="rounded-[1.4rem] border border-primary/20 bg-primary/10 p-4 text-sm text-muted-foreground">
              Brak uprawnień do panelu admina. Zaloguj się jako demo admin z poziomu
              {" "}
              strony{" "}
              <Link href="/logowanie" className="text-primary">
                logowania
              </Link>
              .
            </div>
          ) : null
        }
      />
    </div>
  );
}
