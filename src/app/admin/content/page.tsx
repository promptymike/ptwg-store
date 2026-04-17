import { AdminContentManager } from "@/components/admin/admin-content-manager";
import { AdminStatusNotice } from "@/components/admin/admin-status-notice";
import { EmptyState } from "@/components/shared/empty-state";
import { getAdminContentSnapshot } from "@/lib/supabase/store";

type AdminContentPageProps = {
  searchParams: Promise<{
    type?: string;
    message?: string;
  }>;
};

export default async function AdminContentPage({
  searchParams,
}: AdminContentPageProps) {
  const [{ sections, faqs, testimonials, pages, error }, status] = await Promise.all([
    getAdminContentSnapshot(),
    searchParams,
  ]);

  return (
    <div className="space-y-6">
      <AdminStatusNotice
        type={status.type ?? (error ? "error" : undefined)}
        message={status.message ?? error ?? undefined}
      />

      {!sections.length && !pages.length && error ? (
        <EmptyState
          badge="Content"
          title="Nie udało się pobrać treści storefrontu"
          description="Sprawdź tabele `site_sections`, `faq_items`, `testimonials` i `content_pages` w Supabase."
        />
      ) : (
        <AdminContentManager
          sections={sections}
          faqs={faqs}
          testimonials={testimonials}
          pages={pages}
        />
      )}
    </div>
  );
}
