import { updateSiteSettingsAction } from "@/app/admin/actions";
import { AdminSubmitButton } from "@/components/admin/admin-submit-button";
import { AdminStatusNotice } from "@/components/admin/admin-status-notice";
import { Input } from "@/components/ui/input";
import { bundles } from "@/data/mock-store";
import { getSiteSettingsSnapshot } from "@/lib/supabase/store";

type AdminSettingsPageProps = {
  searchParams: Promise<{
    type?: string;
    message?: string;
  }>;
};

export default async function AdminSettingsPage({
  searchParams,
}: AdminSettingsPageProps) {
  const [settings, status] = await Promise.all([
    getSiteSettingsSnapshot(),
    searchParams,
  ]);

  return (
    <div className="space-y-6">
      <AdminStatusNotice type={status.type} message={status.message} />

      <section className="surface-panel space-y-5 p-6">
        <div className="space-y-2">
          <span className="eyebrow">Ustawienia</span>
          <h2 className="text-3xl text-foreground">Praktyczne checklisty dla zespołu</h2>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Ta sekcja pełni rolę lekkiego centrum operacyjnego. Trzyma najważniejsze kroki,
            które zespół powinien znać przed dalszą rozbudową o marketing automation i Stripe metadata.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <article className="rounded-[1.4rem] border border-border/70 bg-background/60 p-5">
            <p className="text-sm font-medium text-foreground">Storage</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Bucket `product-files` powinien zostać prywatny. `product-covers` może być prywatny
              lub kontrolowany przez signed URL, zależnie od polityki zespołu.
            </p>
          </article>

          <article className="rounded-[1.4rem] border border-border/70 bg-background/60 p-5">
            <p className="text-sm font-medium text-foreground">Allowlista adminów</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Dodanie maila do allowlisty wystarcza. Po następnym logowaniu lub rejestracji rola
              profilu synchronizuje się automatycznie z bazą.
            </p>
          </article>

          <article className="rounded-[1.4rem] border border-border/70 bg-background/60 p-5">
            <p className="text-sm font-medium text-foreground">Content ops</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Homepage, FAQ, testimonials i legal pages możesz edytować z panelu `Content / Strony`
              bez ingerencji w komponenty storefrontu.
            </p>
          </article>
        </div>

        <form action={updateSiteSettingsAction} className="grid gap-4 rounded-[1.5rem] border border-border/70 bg-background/60 p-5 lg:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm text-foreground">Recommended bundle</span>
            <select
              name="recommendedBundleId"
              defaultValue={settings.recommendedBundleId}
              className="flex h-12 w-full rounded-2xl border border-border bg-input px-4 text-sm text-foreground"
            >
              {bundles.map((bundle) => (
                <option key={bundle.id} value={bundle.id}>
                  {bundle.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm text-foreground">Homepage featured limit</span>
            <Input
              name="homepageFeaturedLimit"
              type="number"
              min="1"
              max="12"
              defaultValue={settings.homepageFeaturedLimit}
            />
          </label>

          <AdminSubmitButton
            idleLabel="Zapisz merchandising"
            pendingLabel="Zapisywanie..."
            className="lg:col-span-2"
          />
        </form>
      </section>
    </div>
  );
}
