import { AdminProductSourcesManager } from "@/components/admin/admin-product-sources-manager";
import { AdminStatusNotice } from "@/components/admin/admin-status-notice";
import { EmptyState } from "@/components/shared/empty-state";
import {
  getAdminCategoriesSnapshot,
  getAdminProductSourcesSnapshot,
} from "@/lib/supabase/store";

type AdminImportPageProps = {
  searchParams: Promise<{
    type?: string;
    message?: string;
  }>;
};

export default async function AdminImportPage({
  searchParams,
}: AdminImportPageProps) {
  const [{ categories, error: categoriesError }, { sources, error: sourcesError }, status] =
    await Promise.all([
      getAdminCategoriesSnapshot(),
      getAdminProductSourcesSnapshot(),
      searchParams,
    ]);

  const noticeMessage = [status.message, categoriesError, sourcesError]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="space-y-6">
      <AdminStatusNotice
        type={status.type ?? (categoriesError || sourcesError ? "error" : undefined)}
        message={noticeMessage || undefined}
      />

      {!sources?.length && sourcesError ? (
        <EmptyState
          badge="Admin import"
          title="Nie udało się pobrać źródeł produktów"
          description="Sprawdź konfigurację Supabase i to, czy migracja z tabelą `product_sources` została uruchomiona."
        />
      ) : (
        <AdminProductSourcesManager categories={categories ?? []} sources={sources ?? []} />
      )}
    </div>
  );
}
