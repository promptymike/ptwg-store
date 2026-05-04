import { AdminProductMasterImport } from "@/components/admin/admin-product-master-import";
import { AdminStatusNotice } from "@/components/admin/admin-status-notice";
import { EmptyState } from "@/components/shared/empty-state";
import {
  getAdminCategoriesSnapshot,
  getAdminProductMasterSnapshot,
} from "@/lib/supabase/store";

type AdminProductMasterPageProps = {
  searchParams: Promise<{
    type?: string;
    message?: string;
  }>;
};

export default async function AdminProductMasterPage({
  searchParams,
}: AdminProductMasterPageProps) {
  const [categoriesSnapshot, productMasterSnapshot, status] = await Promise.all([
    getAdminCategoriesSnapshot(),
    getAdminProductMasterSnapshot(),
    searchParams,
  ]);

  const noticeMessage = [
    status.message,
    categoriesSnapshot.error,
    productMasterSnapshot.error,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="space-y-6">
      <AdminStatusNotice
        type={
          status.type ??
          (categoriesSnapshot.error || productMasterSnapshot.error ? "error" : undefined)
        }
        message={noticeMessage || undefined}
      />

      {!categoriesSnapshot.categories?.length ? (
        <EmptyState
          badge="Product Master"
          title="Najpierw dodaj kategorie"
          description="Import CSV mapuje kolumnę category po nazwie lub slugu istniejącej kategorii. Bez kategorii nie możemy bezpiecznie utworzyć produktów."
          action={{ href: "/admin/kategorie", label: "Przejdź do kategorii" }}
        />
      ) : (
        <AdminProductMasterImport
          categories={categoriesSnapshot.categories ?? []}
          existingProducts={productMasterSnapshot.existingProducts}
        />
      )}
    </div>
  );
}
