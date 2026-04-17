import { AdminCategoryManager } from "@/components/admin/admin-category-manager";
import { AdminStatusNotice } from "@/components/admin/admin-status-notice";
import { EmptyState } from "@/components/shared/empty-state";
import { getAdminCategoriesSnapshot } from "@/lib/supabase/store";

type AdminCategoriesPageProps = {
  searchParams: Promise<{
    type?: string;
    message?: string;
  }>;
};

export default async function AdminCategoriesPage({
  searchParams,
}: AdminCategoriesPageProps) {
  const [{ categories, error }, status] = await Promise.all([
    getAdminCategoriesSnapshot(),
    searchParams,
  ]);

  return (
    <div className="space-y-6">
      <AdminStatusNotice
        type={status.type ?? (error ? "error" : undefined)}
        message={status.message ?? error ?? undefined}
      />

      {!categories.length && error ? (
        <EmptyState
          badge="Admin kategorie"
          title="Nie udało się pobrać kategorii"
          description="Strona jest gotowa pod pełny CRUD, ale Supabase nie zwrócił danych. Sprawdź połączenie i role administratora."
        />
      ) : (
        <AdminCategoryManager categories={categories} />
      )}
    </div>
  );
}
