import { EmptyState } from "@/components/shared/empty-state";

export default function LibraryPage() {
  return (
    <div className="shell section-space">
      <EmptyState
        badge="Moja biblioteka"
        title="Biblioteka jest gotowa na prawdziwe pliki"
        description="Po integracji z Supabase Storage i Stripe tutaj pojawią się zakupione produkty, linki do pobrania oraz status dostępu. W MVP sekcja celowo pokazuje uporządkowany empty state."
        action={{ href: "/produkty", label: "Wróć do zakupów" }}
      />
    </div>
  );
}
