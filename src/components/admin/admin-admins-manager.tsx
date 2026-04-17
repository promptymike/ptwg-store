import {
  createAllowlistEntryAction,
  deleteAllowlistEntryAction,
  updateAllowlistEntryAction,
} from "@/app/admin/actions";
import { AdminSubmitButton } from "@/components/admin/admin-submit-button";
import { Input } from "@/components/ui/input";

type AllowlistRecord = {
  id: string;
  email: string;
  note: string;
  isActive: boolean;
  createdAt: string;
};

type ProfileRecord = {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
  createdAt: string;
};

type AdminAdminsManagerProps = {
  allowlist: AllowlistRecord[];
  profiles: ProfileRecord[];
};

export function AdminAdminsManager({
  allowlist,
  profiles,
}: AdminAdminsManagerProps) {
  return (
    <div className="space-y-6">
      <section className="surface-panel space-y-5 p-6">
        <div className="space-y-2">
          <h2 className="text-2xl text-foreground">Allowlista adminów</h2>
          <p className="text-sm text-muted-foreground">
            Adres na allowliście automatycznie dostaje rolę `admin` po rejestracji lub logowaniu.
          </p>
        </div>

        <form action={createAllowlistEntryAction} className="grid gap-4 rounded-[1.4rem] border border-border/70 bg-background/60 p-4 xl:grid-cols-2">
          <Input name="email" type="email" placeholder="admin@templify.store" />
          <Input name="note" placeholder="Core admin" />
          <label className="flex items-center gap-3 rounded-[1.2rem] border border-border/70 bg-background/80 px-4 py-3 text-sm text-foreground xl:col-span-2">
            <input
              name="isActive"
              type="checkbox"
              defaultChecked
              className="size-4 accent-[var(--color-primary)]"
            />
            Wpis aktywny
          </label>
          <AdminSubmitButton idleLabel="Dodaj admina" pendingLabel="Dodawanie..." className="xl:col-span-2" />
        </form>

        <div className="grid gap-4">
          {allowlist.map((entry) => (
            <article key={entry.id} className="rounded-[1.4rem] border border-border/70 bg-background/60 p-4">
              <form action={updateAllowlistEntryAction} className="grid gap-4 xl:grid-cols-[1fr_1fr_auto]">
                <input type="hidden" name="allowlistId" value={entry.id} />
                <Input name="email" type="email" defaultValue={entry.email} />
                <Input name="note" defaultValue={entry.note} />
                <label className="flex items-center gap-3 rounded-[1.2rem] border border-border/70 bg-background/80 px-4 py-3 text-sm text-foreground">
                  <input
                    name="isActive"
                    type="checkbox"
                    defaultChecked={entry.isActive}
                    className="size-4 accent-[var(--color-primary)]"
                  />
                  Aktywny
                </label>
                <div className="flex flex-col gap-3 sm:flex-row xl:col-span-3">
                  <AdminSubmitButton idleLabel="Zapisz wpis" pendingLabel="Zapisywanie..." />
                </div>
              </form>
              <p className="mt-3 text-xs text-muted-foreground">
                Dodano {new Date(entry.createdAt).toLocaleDateString("pl-PL")}
              </p>
              <form action={deleteAllowlistEntryAction} className="mt-3">
                <input type="hidden" name="allowlistId" value={entry.id} />
                <AdminSubmitButton
                  idleLabel="Usuń wpis"
                  pendingLabel="Usuwanie..."
                  variant="destructive"
                />
              </form>
            </article>
          ))}
        </div>
      </section>

      <section className="surface-panel space-y-5 p-6">
        <div className="space-y-2">
          <h2 className="text-2xl text-foreground">Użytkownicy i admini</h2>
          <p className="text-sm text-muted-foreground">
            Podgląd realnych profili z Supabase. Rola aktualizuje się automatycznie na podstawie allowlisty.
          </p>
        </div>

        {profiles.length === 0 ? (
          <p className="rounded-[1.2rem] border border-border/70 bg-background/60 px-4 py-4 text-sm text-muted-foreground">
            Brak zarejestrowanych profili.
          </p>
        ) : (
          <div className="grid gap-3">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="flex flex-col gap-2 rounded-[1.2rem] border border-border/70 bg-background/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm text-foreground">
                    {profile.fullName || profile.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {profile.email} • {new Date(profile.createdAt).toLocaleDateString("pl-PL")}
                  </p>
                </div>
                <span className="rounded-full border border-border/70 px-3 py-1 text-xs uppercase tracking-[0.18em] text-primary/80">
                  {profile.role}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
