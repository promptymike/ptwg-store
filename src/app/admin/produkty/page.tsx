import { AdminProductManager } from "@/components/admin/admin-product-manager";
import { AdminStatusNotice } from "@/components/admin/admin-status-notice";
import { EmptyState } from "@/components/shared/empty-state";
import {
  getAdminCategoriesSnapshot,
  getAdminProductsSnapshot,
} from "@/lib/supabase/store";

type AdminProductsPageProps = {
  searchParams: Promise<{
    type?: string;
    message?: string;
    status?: string;
    pipelineStatus?: string;
    categoryId?: string;
  }>;
};

export default async function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  const status = await searchParams;
  const filters = {
    status: status.status,
    pipelineStatus: status.pipelineStatus,
    categoryId: status.categoryId,
  };

  const [{ products, summary, error: productsError }, { categories, error: categoriesError }] =
    await Promise.all([
      getAdminProductsSnapshot(filters),
      getAdminCategoriesSnapshot(),
    ]);

  const noticeMessage = [status.message, productsError, categoriesError]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="space-y-6">
      <AdminStatusNotice
        type={status.type ?? (productsError || categoriesError ? "error" : undefined)}
        message={noticeMessage || undefined}
      />

      {!categories.length && categoriesError ? (
        <EmptyState
          badge="Admin produkty"
          title="Nie udało się pobrać danych produktowych"
          description="Sprawdź konfigurację Supabase, role administratora i polityki RLS."
        />
      ) : (
        <AdminProductManager
          categories={categories}
          products={products}
          summary={summary}
          filters={filters}
        />
      )}
    </div>
  );
}
