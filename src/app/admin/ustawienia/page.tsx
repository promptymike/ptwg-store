import { updateSiteSettingsAction } from "@/app/admin/actions";
import { AdminStatusNotice } from "@/components/admin/admin-status-notice";
import { AdminSubmitButton } from "@/components/admin/admin-submit-button";
import { Input } from "@/components/ui/input";
import { bundles } from "@/data/mock-store";
import {
  getBundlesSnapshot,
  getSiteSettingsSnapshot,
  getStoreProducts,
} from "@/lib/supabase/store";

type AdminSettingsPageProps = {
  searchParams: Promise<{
    type?: string;
    message?: string;
  }>;
};

export default async function AdminSettingsPage({
  searchParams,
}: AdminSettingsPageProps) {
  const [settings, liveBundles, products, status] = await Promise.all([
    getSiteSettingsSnapshot(),
    getBundlesSnapshot(),
    getStoreProducts(),
    searchParams,
  ]);
  const bundleOptions = liveBundles.length > 0 ? liveBundles : bundles;

  return (
    <div className="space-y-6">
      <AdminStatusNotice type={status.type} message={status.message} />

      <section className="surface-panel space-y-5 p-6">
        <div className="space-y-2">
          <span className="eyebrow">Ustawienia</span>
          <h2 className="text-3xl text-foreground">Merchandising i trust layer</h2>
          <p className="max-w-3xl text-sm text-muted-foreground">
            To miejsce steruje najważniejszymi ustawieniami homepage oraz danymi operatora sklepu
            widocznymi w stopce. Dzięki temu zespół może szybko domknąć zaufanie przed soft
            launchiem bez zmian w kodzie.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <article className="rounded-[1.4rem] border border-border/70 bg-background/60 p-5">
            <p className="text-sm font-medium text-foreground">Merchandising</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Ustaw rekomendowany pakiet i limit bestsellerów na homepage, żeby landing był
              krótszy i bardziej sprzedażowy.
            </p>
          </article>

          <article className="rounded-[1.4rem] border border-border/70 bg-background/60 p-5">
            <p className="text-sm font-medium text-foreground">Trust</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Nazwa firmy, NIP, adres i mail wsparcia trafiają prosto do stopki sklepu.
            </p>
          </article>

          <article className="rounded-[1.4rem] border border-border/70 bg-background/60 p-5">
            <p className="text-sm font-medium text-foreground">Checklist</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Przed większą kampanią uzupełnij dane operatora, legal pages i upewnij się, że copy
              checkoutu odpowiada temu, co naprawdę wysyłasz klientowi po zakupie.
            </p>
          </article>
        </div>

        <form
          action={updateSiteSettingsAction}
          className="grid gap-4 rounded-[1.5rem] border border-border/70 bg-background/60 p-5 lg:grid-cols-2"
        >
          <label className="space-y-2">
            <span className="text-sm text-foreground">Recommended bundle</span>
            <select
              name="recommendedBundleId"
              defaultValue={settings.recommendedBundleId}
              className="flex h-12 w-full rounded-2xl border border-border bg-input px-4 text-sm text-foreground"
            >
              {bundleOptions.map((bundle) => (
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

          <label className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background/70 p-4 text-sm lg:col-span-2">
            <input
              type="checkbox"
              name="orderBumpEnabled"
              defaultChecked={settings.orderBumpEnabled}
              className="mt-1 size-4 shrink-0 accent-[var(--color-foreground)]"
            />
            <span>
              <span className="block font-medium text-foreground">
                Włącz order bump w checkout
              </span>
              <span className="text-muted-foreground">
                Checkout pokaże jedną dodatkową propozycję z rabatem. Cena jest
                przeliczana po stronie serwera przy tworzeniu sesji Stripe.
              </span>
            </span>
          </label>

          <label className="space-y-2">
            <span className="text-sm text-foreground">Produkt order bump</span>
            <select
              name="orderBumpProductId"
              defaultValue={settings.orderBumpProductId}
              className="flex h-12 w-full rounded-2xl border border-border bg-input px-4 text-sm text-foreground"
            >
              <option value="">Automatycznie: bestseller / featured</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm text-foreground">Rabat order bump (%)</span>
            <Input
              name="orderBumpPercentOff"
              type="number"
              min="1"
              max="80"
              defaultValue={settings.orderBumpPercentOff}
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-foreground">Pełna nazwa firmy</span>
            <Input
              name="businessName"
              defaultValue={settings.businessName}
              placeholder="np. Templify sp. z o.o."
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-foreground">NIP</span>
            <Input
              name="businessTaxId"
              defaultValue={settings.businessTaxId}
              placeholder="np. 1234567890"
            />
          </label>

          <label className="space-y-2 lg:col-span-2">
            <span className="text-sm text-foreground">Adres</span>
            <Input
              name="businessAddress"
              defaultValue={settings.businessAddress}
              placeholder="np. ul. Przykładowa 1, 00-000 Warszawa"
            />
          </label>

          <label className="space-y-2 lg:col-span-2">
            <span className="text-sm text-foreground">E-mail wsparcia</span>
            <Input
              name="supportEmail"
              type="email"
              defaultValue={settings.supportEmail}
              placeholder="kontakt@templify.store"
            />
          </label>

          <AdminSubmitButton
            idleLabel="Zapisz ustawienia storefrontu"
            pendingLabel="Zapisywanie..."
            className="lg:col-span-2"
          />
        </form>
      </section>
    </div>
  );
}
