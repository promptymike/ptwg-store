import {
  createProductAction,
  createProductPreviewAction,
  deleteProductAction,
  deleteProductPreviewAction,
  updateProductAction,
  updateProductPreviewAction,
} from "@/app/admin/actions";
import { AdminSubmitButton } from "@/components/admin/admin-submit-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PRODUCT_BADGES, PRODUCT_STATUSES } from "@/types/store";
import { formatCurrency } from "@/lib/format";

type CategoryOption = {
  id: string;
  name: string;
  slug: string;
};

type ProductPreviewRecord = {
  id: string;
  storagePath: string;
  altText: string;
  sortOrder: number;
  imageUrl: string | null;
};

type ProductRecord = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  category: string;
  categoryId: string;
  format: string;
  pages: number;
  tags: string[];
  rating: number;
  salesLabel: string;
  accent: string;
  coverGradient: string;
  includes: string[];
  heroNote: string;
  badge: string | null;
  status: string;
  bestseller: boolean;
  featured: boolean;
  sortOrder: number;
  featuredOrder: number;
  isActive: boolean;
  coverPath: string | null;
  coverImageUrl: string | null;
  filePath: string | null;
  previews: ProductPreviewRecord[];
};

type AdminProductManagerProps = {
  categories: CategoryOption[];
  products: ProductRecord[];
};

function CategorySelect({
  categories,
  defaultValue,
}: {
  categories: CategoryOption[];
  defaultValue?: string;
}) {
  return (
    <select
      name="categoryId"
      className="flex h-12 w-full rounded-2xl border border-border bg-input px-4 text-sm text-foreground"
      defaultValue={defaultValue ?? categories[0]?.id}
    >
      {categories.map((category) => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </select>
  );
}

function SelectField({
  name,
  label,
  options,
  defaultValue,
}: {
  name: string;
  label: string;
  options: Array<{ value: string; label: string }>;
  defaultValue?: string;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm text-foreground">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="flex h-12 w-full rounded-2xl border border-border bg-input px-4 text-sm text-foreground"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ProductFormFields({
  categories,
  product,
}: {
  categories: CategoryOption[];
  product?: ProductRecord;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <label className="space-y-2">
        <span className="text-sm text-foreground">Nazwa</span>
        <Input name="name" defaultValue={product?.name} placeholder="Founder OS Template" />
      </label>

      <label className="space-y-2">
        <span className="text-sm text-foreground">Slug</span>
        <Input name="slug" defaultValue={product?.slug} placeholder="founder-os-template" />
      </label>

      <label className="space-y-2">
        <span className="text-sm text-foreground">Kategoria</span>
        <CategorySelect categories={categories} defaultValue={product?.categoryId} />
      </label>

      <label className="space-y-2">
        <span className="text-sm text-foreground">Format</span>
        <Input name="format" defaultValue={product?.format ?? "PDF"} placeholder="Notion + PDF" />
      </label>

      <label className="space-y-2">
        <span className="text-sm text-foreground">Cena</span>
        <Input name="price" type="number" defaultValue={product?.price ?? 99} />
      </label>

      <label className="space-y-2">
        <span className="text-sm text-foreground">Cena porównawcza</span>
        <Input
          name="compareAtPrice"
          type="number"
          defaultValue={product?.compareAtPrice ?? undefined}
          placeholder="opcjonalnie"
        />
      </label>

      <SelectField
        name="status"
        label="Status"
        defaultValue={product?.status ?? "draft"}
        options={PRODUCT_STATUSES.map((status) => ({
          value: status,
          label: status,
        }))}
      />

      <SelectField
        name="badge"
        label="Badge"
        defaultValue={product?.badge ?? ""}
        options={[
          { value: "", label: "brak" },
          ...PRODUCT_BADGES.map((badge) => ({
            value: badge,
            label: badge,
          })),
        ]}
      />

      <label className="space-y-2">
        <span className="text-sm text-foreground">Sort order</span>
        <Input name="sortOrder" type="number" defaultValue={product?.sortOrder ?? 0} />
      </label>

      <label className="space-y-2">
        <span className="text-sm text-foreground">Featured order</span>
        <Input
          name="featuredOrder"
          type="number"
          defaultValue={product?.featuredOrder ?? 0}
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm text-foreground">Liczba stron</span>
        <Input name="pages" type="number" defaultValue={product?.pages ?? 0} />
      </label>

      <label className="space-y-2">
        <span className="text-sm text-foreground">Etykieta sprzedażowa</span>
        <Input
          name="salesLabel"
          defaultValue={product?.salesLabel}
          placeholder="Best for founders"
        />
      </label>

      <label className="space-y-2 xl:col-span-2">
        <span className="text-sm text-foreground">Krótki opis</span>
        <Textarea
          name="shortDescription"
          defaultValue={product?.shortDescription}
          className="min-h-24"
          placeholder="Krótki opis karty produktu..."
        />
      </label>

      <label className="space-y-2 xl:col-span-2">
        <span className="text-sm text-foreground">Pełny opis</span>
        <Textarea
          name="description"
          defaultValue={product?.description}
          className="min-h-32"
          placeholder="Rozwiń rezultat, use case i zawartość produktu..."
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm text-foreground">Hero note</span>
        <Input
          name="heroNote"
          defaultValue={product?.heroNote}
          placeholder="Sell the result, not the file."
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm text-foreground">Tagi</span>
        <Input
          name="tags"
          defaultValue={product?.tags.join(", ")}
          placeholder="notion, sales, founder"
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm text-foreground">Gradient accent</span>
        <Input name="accent" defaultValue={product?.accent} placeholder="from-stone-900 ..." />
      </label>

      <label className="space-y-2">
        <span className="text-sm text-foreground">Gradient cover</span>
        <Input
          name="coverGradient"
          defaultValue={product?.coverGradient}
          placeholder="from-[#f8f1e8] ..."
        />
      </label>

      <label className="space-y-2 xl:col-span-2">
        <span className="text-sm text-foreground">Sekcja &quot;co zawiera&quot;</span>
        <Textarea
          name="includes"
          defaultValue={product?.includes.join("\n")}
          className="min-h-24"
          placeholder="Jedna pozycja na linię albo po przecinku"
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm text-foreground">Okładka produktu</span>
        <Input name="coverFile" type="file" accept="image/png,image/jpeg,image/webp" />
      </label>

      <label className="space-y-2">
        <span className="text-sm text-foreground">Plik cyfrowy</span>
        <Input
          name="productFile"
          type="file"
          accept=".pdf,.zip,.png,.jpg,.jpeg,.webp,application/pdf,application/zip"
        />
      </label>

      <label className="space-y-2 xl:col-span-2">
        <span className="text-sm text-foreground">Preview images</span>
        <Input
          name="previewFiles"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-3 xl:col-span-2">
        <label className="flex items-center gap-3 rounded-[1.2rem] border border-border/70 bg-background/60 px-4 py-3 text-sm text-foreground">
          <input
            name="bestseller"
            type="checkbox"
            defaultChecked={product?.bestseller}
            className="size-4 accent-[var(--color-primary)]"
          />
          Bestseller
        </label>
        <label className="flex items-center gap-3 rounded-[1.2rem] border border-border/70 bg-background/60 px-4 py-3 text-sm text-foreground">
          <input
            name="featured"
            type="checkbox"
            defaultChecked={product?.featured}
            className="size-4 accent-[var(--color-primary)]"
          />
          Featured
        </label>
        <label className="flex items-center gap-3 rounded-[1.2rem] border border-border/70 bg-background/60 px-4 py-3 text-sm text-foreground">
          <input
            name="isActive"
            type="checkbox"
            defaultChecked={product?.isActive ?? true}
            className="size-4 accent-[var(--color-primary)]"
          />
          Widoczny
        </label>
      </div>
    </div>
  );
}

function PreviewManager({ product }: { product: ProductRecord }) {
  return (
    <div className="space-y-4 rounded-[1.4rem] border border-border/70 bg-background/40 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">Preview images</p>
          <p className="text-xs text-muted-foreground">
            Dodaj dodatkowe zrzuty lub mockupy pokazujące wnętrze produktu.
          </p>
        </div>
        <span className="text-xs uppercase tracking-[0.22em] text-primary/75">
          {product.previews.length} plików
        </span>
      </div>

      <form
        action={createProductPreviewAction}
        className="grid gap-3 lg:grid-cols-[1fr_160px_160px_auto]"
        encType="multipart/form-data"
      >
        <input type="hidden" name="productId" value={product.id} />
        <Input name="altText" placeholder="Alt tekst preview" />
        <Input name="sortOrder" type="number" defaultValue={product.previews.length} />
        <Input name="previewFile" type="file" accept="image/png,image/jpeg,image/webp" />
        <AdminSubmitButton idleLabel="Dodaj preview" pendingLabel="Dodawanie..." />
      </form>

      {product.previews.length === 0 ? (
        <p className="rounded-[1.2rem] border border-dashed border-border/70 px-4 py-4 text-sm text-muted-foreground">
          Ten produkt nie ma jeszcze dodatkowych preview images.
        </p>
      ) : (
        <div className="grid gap-3">
          {product.previews.map((preview) => (
            <div
              key={preview.id}
              className="grid gap-3 rounded-[1.2rem] border border-border/70 bg-background/80 p-4 xl:grid-cols-[1fr_1fr_auto]"
            >
              <div className="space-y-2">
                <p className="text-sm text-foreground">{preview.altText || "Preview image"}</p>
                <p className="text-xs text-muted-foreground break-all">
                  {preview.storagePath}
                </p>
              </div>

              <form action={updateProductPreviewAction} className="grid gap-3 sm:grid-cols-2">
                <input type="hidden" name="previewId" value={preview.id} />
                <Input name="altText" defaultValue={preview.altText} placeholder="Alt tekst" />
                <Input name="sortOrder" type="number" defaultValue={preview.sortOrder} />
                <AdminSubmitButton idleLabel="Zapisz preview" pendingLabel="Zapisywanie..." />
              </form>

              <form action={deleteProductPreviewAction} className="self-start">
                <input type="hidden" name="previewId" value={preview.id} />
                <AdminSubmitButton
                  idleLabel="Usuń"
                  pendingLabel="Usuwanie..."
                  variant="destructive"
                />
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminProductManager({
  categories,
  products,
}: AdminProductManagerProps) {
  return (
    <div className="space-y-6">
      <section className="surface-panel space-y-5 p-6">
        <div className="space-y-2">
          <h2 className="text-2xl text-foreground">Nowy produkt</h2>
          <p className="text-sm text-muted-foreground">
            Formularz zapisuje produkt do Supabase, wgrywa okładkę, plik cyfrowy i opcjonalne
            preview images.
          </p>
        </div>

        {categories.length === 0 ? (
          <p className="rounded-[1.2rem] border border-border/70 bg-background/70 px-4 py-4 text-sm text-muted-foreground">
            Najpierw dodaj co najmniej jedną kategorię w sekcji kategorii.
          </p>
        ) : (
          <form
            action={createProductAction}
            className="space-y-4"
            encType="multipart/form-data"
          >
            <ProductFormFields categories={categories} />
            <AdminSubmitButton
              idleLabel="Utwórz produkt"
              pendingLabel="Tworzenie produktu..."
              className="w-full"
            />
          </form>
        )}
      </section>

      <section className="surface-panel space-y-5 p-6">
        <div className="space-y-2">
          <h2 className="text-2xl text-foreground">Katalog operacyjny</h2>
          <p className="text-sm text-muted-foreground">
            Tu zarządzasz statusem publikacji, kolejnością, pricingiem, plikami i preview.
          </p>
        </div>

        {products.length === 0 ? (
          <p className="rounded-[1.2rem] border border-border/70 bg-background/70 px-4 py-4 text-sm text-muted-foreground">
            Nie ma jeszcze żadnych produktów do edycji.
          </p>
        ) : (
          <div className="grid gap-4">
            {products.map((product) => (
              <article
                key={product.id}
                className="rounded-[1.5rem] border border-border/70 bg-background/60 p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg text-foreground">{product.name}</p>
                      <span className="rounded-full border border-border/70 px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        {product.status}
                      </span>
                      {product.badge ? (
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-primary">
                          {product.badge}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {product.category} • {product.format} • {product.pages} stron
                    </p>
                    <p className="text-sm text-foreground">{formatCurrency(product.price)}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-primary/75">
                      {product.coverPath ? "okładka dodana" : "brak okładki"} •{" "}
                      {product.filePath ? "plik dodany" : "brak pliku"} •{" "}
                      {product.previews.length} preview
                    </p>
                  </div>

                  <details className="w-full max-w-5xl">
                    <summary className="cursor-pointer rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm text-foreground">
                      Edytuj produkt
                    </summary>

                    <div className="mt-4 space-y-4 rounded-[1.4rem] border border-border/70 bg-background/80 p-4">
                      <form
                        action={updateProductAction}
                        className="space-y-4"
                        encType="multipart/form-data"
                      >
                        <input type="hidden" name="productId" value={product.id} />
                        <ProductFormFields categories={categories} product={product} />
                        <AdminSubmitButton
                          idleLabel="Zapisz zmiany"
                          pendingLabel="Zapisywanie..."
                        />
                      </form>

                      <PreviewManager product={product} />

                      <form action={deleteProductAction}>
                        <input type="hidden" name="productId" value={product.id} />
                        <AdminSubmitButton
                          idleLabel="Usuń produkt"
                          pendingLabel="Usuwanie..."
                          variant="destructive"
                        />
                      </form>
                    </div>
                  </details>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
