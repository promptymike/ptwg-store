import { AdminAdminsManager } from "@/components/admin/admin-admins-manager";
import { AdminStatusNotice } from "@/components/admin/admin-status-notice";
import { EmptyState } from "@/components/shared/empty-state";
import { getAdminUsersSnapshot } from "@/lib/supabase/store";

type AdminAdminsPageProps = {
  searchParams: Promise<{
    type?: string;
    message?: string;
  }>;
};

export default async function AdminAdminsPage({
  searchParams,
}: AdminAdminsPageProps) {
  const [{ allowlist, profiles, error }, status] = await Promise.all([
    getAdminUsersSnapshot(),
    searchParams,
  ]);

  return (
    <div className="space-y-6">
      <AdminStatusNotice
        type={status.type ?? (error ? "error" : undefined)}
        message={status.message ?? error ?? undefined}
      />

      {!allowlist.length && !profiles.length && error ? (
        <EmptyState
          badge="Admini"
          title="Nie udało się pobrać użytkowników i allowlisty"
          description="Sprawdź tabele `profiles` i `admin_allowlist` oraz rolę administratora."
        />
      ) : (
        <AdminAdminsManager allowlist={allowlist} profiles={profiles} />
      )}
    </div>
  );
}
