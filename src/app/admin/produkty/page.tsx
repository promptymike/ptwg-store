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
  }>;
};

export default async function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  const [{ products, error: productsError }, { categories, error: categoriesError }, status] =
    await Promise.all([
      getAdminProductsSnapshot(),
      getAdminCategoriesSnapshot(),
      searchParams,
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

      {!products.length && !categories.length && productsError && categoriesError ? (
        <EmptyState
          badge="Admin produkty"
          title="Nie udało się pobrać danych produktów"
          description="Sprawdź konfigurację Supabase, polityki RLS i połączenie z bazą. Gdy dane wrócą, formularze CRUD pojawią się tutaj bez zmiany route'u."
        />
      ) : (
        <AdminProductManager categories={categories} products={products} />
      )}
    </div>
  );
}
