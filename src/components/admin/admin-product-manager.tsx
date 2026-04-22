import Link from "next/link";

import {
  createProductAction,
  createProductPreviewAction,
  deleteProductAction,
  deleteProductPreviewAction,
  updateProductAction,
  updateProductPreviewAction,
} from "@/app/admin/actions";
import { AdminProductForm } from "@/components/admin/admin-product-form";
import { AdminSubmitButton } from "@/components/admin/admin-submit-button";
import { FileDropzone } from "@/components/admin/file-dropzone";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  formatCurrency,
  formatProductPipelineStatus,
  formatProductStatus,
} from "@/lib/format";
import {
  PRODUCT_BADGES,
  PRODUCT_PIPELINE_STATUSES,
  PRODUCT_STATUSES,
} from "@/types/store";

type CategoryOption = {
  id: string;
  name: string;
  slug: string;
};

type ProductPreviewRecord = {
  id: string;
  storagePath?: string | null;
  altText?: string | null;
  sortOrder?: number | null;
  imageUrl?: string | null;
};

type ProductRecord = {
  id: string;
  slug?: string | null;
  name?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  price?: number | null;
  compareAtPrice?: number | null;
  category?: string | null;
  categoryId?: string | null;
  format?: string | null;
  pages?: number | null;
  tags?: string[] | null;
  rating?: number | null;
  salesLabel?: string | null;
  accent?: string | null;
  coverGradient?: string | null;
  includes?: string[] | null;
  heroNote?: string | null;
  badge?: string | null;
  status?: string | null;
  pipelineStatus?: string | null;
  bestseller?: boolean | null;
  featured?: boolean | null;
  sortOrder?: number | null;
  featuredOrder?: number | null;
  isActive?: boolean | null;
  coverPath?: string | null;
  coverImageUrl?: string | null;
  filePath?: string | null;
  hasCover?: boolean | null;
  hasFile?: boolean | null;
  isVisibleOnStorefront?: boolean | null;
  linkedSource?: {
    id?: string | null;
    title?: string | null;
  } | null;
  previews?: ProductPreviewRecord[] | null;
};

type AdminProductManagerProps = {
  categories: CategoryOption[];
  products: ProductRecord[];
  summary: {
    total?: number;
    draftCount?: number;
    readyCount?: number;
    publishedCount?: number;
    missingSourceCount?: number;
  };
  filters: {
    status?: string;
    pipelineStatus?: string;
    categoryId?: string;
  };
};

function safeText(value: string | null | undefined, fallback = "") {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

function safeNumber(value: number | null | undefined, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function safeStringArray(value: string[] | null | undefined) {
  return Array.isArray(value) ? value : [];
}

function safeBoolean(value: boolean | null | undefined) {
  return value === true;
}

function safePreviews(value: ProductPreviewRecord[] | null | undefined) {
  return Array.isArray(value) ? value : [];
}

function CategorySelect({
  categories,
  defaultValue,
}: {
  categories: CategoryOption[];
  defaultValue?: string | null;
}) {
  return (
    <select
      name="categoryId"
      className="flex h-12 w-full rounded-2xl border border-border bg-input px-4 text-sm text-foreground"
      defaultValue={defaultValue ?? categories[0]?.id ?? ""}
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
  defaultValue?: string | null;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm text-foreground">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue ?? options[0]?.value ?? ""}
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

function SummaryCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="rounded-[1.3rem] border border-border/70 bg-background/70 p-4">
      <p className="text-[11px] uppercase tracking-[0.22em] text-primary/75">{label}</p>
      <p className="mt-3 text-3xl text-foreground">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
    </article>
  );
}

function FilterSelect({
  name,
  defaultValue,
  options,
}: {
  name: string;
  defaultValue?: string;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <select
      name={name}
      defaultValue={defaultValue ?? "all"}
      className="h-11 rounded-2xl border border-border bg-background px-4 text-sm text-foreground"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function Chip({
  label,
  tone = "default",
}: {
  label: string;
  tone?: "default" | "positive" | "warning";
}) {
  const toneClass =
    tone === "positive"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
      : tone === "warning"
        ? "border-amber-500/20 bg-amber-500/10 text-amber-100"
        : "border-border/70 bg-background/60 text-muted-foreground";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.18em] ${toneClass}`}
    >
      {label}
    </span>
  );
}

function ProductFormFields({
  categories,
  product,
}: {
  categories: CategoryOption[];
  product?: ProductRecord;
}) {
  const linkedSource = product?.linkedSource ?? null;

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {linkedSource?.id ? (
        <div className="rounded-[1.2rem] border border-primary/20 bg-primary/10 px-4 py-4 text-sm text-muted-foreground xl:col-span-2">
          <input type="hidden" name="sourceId" value={linkedSource.id} />
          Powiązane źródło:{" "}
          <span className="text-foreground">
            {safeText(linkedSource.title, "Bez nazwy źródła")}
          </span>
        </div>
      ) : null}

      <label className="space-y-2">
        <span className="text-sm text-foreground">Nazwa</span>
        <Input
          name="name"
          defaultValue={safeText(product?.name)}
          placeholder="Founder OS Template"
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm text-foreground">Slug</span>
        <Input
          name="slug"
          defaultValue={safeText(product?.slug)}
          placeholder="founder-os-template"
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm text-foreground">Kategoria</span>
        <CategorySelect categories={categories} defaultValue={product?.categoryId} />
      </label>

      <label className="space-y-2">
        <span className="text-sm text-foreground">Format</span>
        <Input
          name="format"
          defaultValue={safeText(product?.format, "PDF")}
          placeholder="PDF + Notion"
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm text-foreground">Cena</span>
        <Input name="price" type="number" defaultValue={safeNumber(product?.price, 99)} />
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
        label="Status sklepu"
        defaultValue={product?.status ?? "draft"}
        options={PRODUCT_STATUSES.map((status) => ({
          value: status,
          label: formatProductStatus(status),
        }))}
      />

      <SelectField
        name="pipelineStatus"
        label="Pipeline publikacji"
        defaultValue={product?.pipelineStatus ?? "working"}
        options={PRODUCT_PIPELINE_STATUSES.map((status) => ({
          value: status,
          label: formatProductPipelineStatus(status),
        }))}
      />

      <SelectField
        name="badge"
        label="Badge"
        defaultValue={product?.badge ?? ""}
        options={[
          { value: "", label: "Brak" },
          ...PRODUCT_BADGES.map((badge) => ({
            value: badge,
            label: badge,
          })),
        ]}
      />

      <label className="space-y-2">
        <span className="text-sm text-foreground">Liczba stron</span>
        <Input name="pages" type="number" defaultValue={safeNumber(product?.pages)} />
      </label>

      <label className="space-y-2">
        <span className="text-sm text-foreground">Sort order</span>
        <Input name="sortOrder" type="number" defaultValue={safeNumber(product?.sortOrder)} />
      </label>

      <label className="space-y-2">
        <span className="text-sm text-foreground">Featured order</span>
        <Input
          name="featuredOrder"
          type="number"
          defaultValue={safeNumber(product?.featuredOrder)}
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm text-foreground">Etykieta sprzedażowa</span>
        <Input
          name="salesLabel"
          defaultValue={safeText(product?.salesLabel)}
          placeholder="Szablon dla małych zespołów"
        />
      </label>

      <label className="space-y-2 xl:col-span-2">
        <span className="text-sm text-foreground">Krótki opis</span>
        <Textarea
          name="shortDescription"
          defaultValue={safeText(product?.shortDescription)}
          className="min-h-24"
          placeholder="Jedno zdanie o efekcie, jaki daje produkt."
        />
      </label>

      <label className="space-y-2 xl:col-span-2">
        <span className="text-sm text-foreground">Pełny opis</span>
        <Textarea
          name="description"
          defaultValue={safeText(product?.description)}
          className="min-h-32"
          placeholder="Opisz use case, rezultat i zawartość produktu."
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm text-foreground">Hero note</span>
        <Input
          name="heroNote"
          defaultValue={safeText(product?.heroNote)}
          placeholder="Sprzedaj rezultat, nie sam plik."
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm text-foreground">Tagi</span>
        <Input
          name="tags"
          defaultValue={safeStringArray(product?.tags).join(", ")}
          placeholder="biznes, finanse, oferta"
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm text-foreground">Gradient accent</span>
        <Input name="accent" defaultValue={safeText(product?.accent)} placeholder="from-stone-900 ..." />
      </label>

      <label className="space-y-2">
        <span className="text-sm text-foreground">Gradient cover</span>
        <Input
          name="coverGradient"
          defaultValue={safeText(product?.coverGradient)}
          placeholder="from-[#f7f0e7] ..."
        />
      </label>

      <label className="space-y-2 xl:col-span-2">
        <span className="text-sm text-foreground">Sekcja „co zawiera”</span>
        <Textarea
          name="includes"
          defaultValue={safeStringArray(product?.includes).join("\n")}
          className="min-h-24"
          placeholder="Jedna pozycja na linię albo po przecinku."
        />
      </label>

      <div className="space-y-2">
        <span className="text-sm text-foreground">Okładka produktu</span>
        <FileDropzone
          name="coverFile"
          accept="image/png,image/jpeg,image/webp"
          label="Upuść okładkę"
          hint="PNG, JPG lub WEBP, do 8 MB"
          maxSizeMb={8}
        />
      </div>

      <div className="space-y-2">
        <span className="text-sm text-foreground">Plik cyfrowy</span>
        <FileDropzone
          name="productFile"
          accept=".pdf,.zip,application/pdf,application/zip,application/x-zip-compressed"
          label="Upuść plik produktu"
          hint="PDF lub ZIP, do 50 MB"
          maxSizeMb={50}
        />
      </div>

      <div className="space-y-2 xl:col-span-2">
        <span className="text-sm text-foreground">Preview images</span>
        <FileDropzone
          name="previewFiles"
          accept="image/png,image/jpeg,image/webp"
          multiple
          label="Upuść preview"
          hint="Możesz wrzucić kilka plików na raz."
          maxSizeMb={8}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3 xl:col-span-2">
        <label className="flex items-center gap-3 rounded-[1.2rem] border border-border/70 bg-background/60 px-4 py-3 text-sm text-foreground">
          <input
            name="bestseller"
            type="checkbox"
            defaultChecked={safeBoolean(product?.bestseller)}
            className="size-4 accent-[var(--color-primary)]"
          />
          Bestseller
        </label>
        <label className="flex items-center gap-3 rounded-[1.2rem] border border-border/70 bg-background/60 px-4 py-3 text-sm text-foreground">
          <input
            name="featured"
            type="checkbox"
            defaultChecked={safeBoolean(product?.featured)}
            className="size-4 accent-[var(--color-primary)]"
          />
          Featured
        </label>
        <label className="flex items-center gap-3 rounded-[1.2rem] border border-border/70 bg-background/60 px-4 py-3 text-sm text-foreground">
          <input
            name="isActive"
            type="checkbox"
            defaultChecked={product?.isActive !== false}
            className="size-4 accent-[var(--color-primary)]"
          />
          Widoczny
        </label>
      </div>
    </div>
  );
}

function PreviewManager({ product }: { product: ProductRecord }) {
  const previews = safePreviews(product.previews);

  return (
    <div className="space-y-4 rounded-[1.4rem] border border-border/70 bg-background/40 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">Preview images</p>
          <p className="text-xs text-muted-foreground">
            Dodatkowe zrzuty pokazujące wnętrze i jakość produktu.
          </p>
        </div>
        <span className="text-xs uppercase tracking-[0.22em] text-primary/75">
          {previews.length} plików
        </span>
      </div>

      <form action={createProductPreviewAction} className="space-y-3">
        <input type="hidden" name="productId" value={product.id} />
        <div className="grid gap-3 lg:grid-cols-[1fr_160px]">
          <Input name="altText" placeholder="Alt tekst preview" />
          <Input name="sortOrder" type="number" defaultValue={previews.length} />
        </div>
        <FileDropzone
          name="previewFile"
          accept="image/png,image/jpeg,image/webp"
          label="Upuść zrzut preview"
          hint="Jeden obraz PNG, JPG lub WEBP, do 8 MB"
          maxSizeMb={8}
        />
        <AdminSubmitButton idleLabel="Dodaj preview" pendingLabel="Dodawanie..." />
      </form>

      {previews.length === 0 ? (
        <p className="rounded-[1.2rem] border border-dashed border-border/70 px-4 py-4 text-sm text-muted-foreground">
          Ten produkt nie ma jeszcze dodatkowych preview images.
        </p>
      ) : (
        <div className="grid gap-3">
          {previews.map((preview) => (
            <div
              key={preview.id}
              className="grid gap-3 rounded-[1.2rem] border border-border/70 bg-background/80 p-4 xl:grid-cols-[1fr_1fr_auto]"
            >
              <div className="space-y-2">
                <p className="text-sm text-foreground">
                  {safeText(preview.altText, "Preview image")}
                </p>
                <p className="break-all text-xs text-muted-foreground">
                  {safeText(preview.storagePath, "Brak ścieżki")}
                </p>
              </div>

              <form action={updateProductPreviewAction} className="grid gap-3 sm:grid-cols-2">
                <input type="hidden" name="previewId" value={preview.id} />
                <Input
                  name="altText"
                  defaultValue={safeText(preview.altText)}
                  placeholder="Alt tekst"
                />
                <Input
                  name="sortOrder"
                  type="number"
                  defaultValue={safeNumber(preview.sortOrder)}
                />
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
  summary,
  filters,
}: AdminProductManagerProps) {
  const safeProducts = Array.isArray(products) ? products : [];

  return (
    <div className="space-y-6">
      <section className="surface-panel space-y-5 p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl text-foreground">Operacyjny katalog produktów</h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Filtruj pipeline publikacji, sprawdzaj kompletność assetów i szybko przechodź do
              edycji lub publikacji produktu.
            </p>
          </div>
          <Link
            href="/admin/import"
            className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm text-foreground transition hover:border-primary/30"
          >
            Import / Źródła produktów
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <SummaryCard label="Wszystkie" value={String(summary.total ?? 0)} detail="produkty w systemie" />
          <SummaryCard label="Draft" value={String(summary.draftCount ?? 0)} detail="niewidoczne jeszcze w sklepie" />
          <SummaryCard label="Gotowe" value={String(summary.readyCount ?? 0)} detail="pipeline ready to publish" />
          <SummaryCard label="Opublikowane" value={String(summary.publishedCount ?? 0)} detail="aktywne na storefront" />
          <SummaryCard label="Bez źródła" value={String(summary.missingSourceCount ?? 0)} detail="produkty bez podpiętego pliku roboczego" />
        </div>

        <form className="grid gap-3 rounded-[1.3rem] border border-border/70 bg-background/70 p-4 lg:grid-cols-[1fr_1fr_1fr_auto_auto]">
          <FilterSelect
            name="status"
            defaultValue={filters.status}
            options={[
              { value: "all", label: "Wszystkie statusy sklepu" },
              ...PRODUCT_STATUSES.map((status) => ({
                value: status,
                label: formatProductStatus(status),
              })),
            ]}
          />
          <FilterSelect
            name="pipelineStatus"
            defaultValue={filters.pipelineStatus}
            options={[
              { value: "all", label: "Cały pipeline" },
              ...PRODUCT_PIPELINE_STATUSES.map((status) => ({
                value: status,
                label: formatProductPipelineStatus(status),
              })),
            ]}
          />
          <FilterSelect
            name="categoryId"
            defaultValue={filters.categoryId}
            options={[
              { value: "all", label: "Wszystkie kategorie" },
              ...categories.map((category) => ({
                value: category.id,
                label: category.name,
              })),
            ]}
          />
          <button
            type="submit"
            className="rounded-2xl border border-border/70 px-4 py-2 text-sm text-foreground transition hover:border-primary/30"
          >
            Filtruj
          </button>
          <Link
            href="/admin/produkty"
            className="rounded-2xl border border-border/70 px-4 py-2 text-center text-sm text-muted-foreground transition hover:text-foreground"
          >
            Wyczyść
          </Link>
        </form>
      </section>

      <section className="surface-panel space-y-5 p-6">
        <div className="space-y-2">
          <h2 className="text-2xl text-foreground">Nowy produkt</h2>
          <p className="text-sm text-muted-foreground">
            Ręczne dodanie produktu do Supabase. Jeśli masz już gotowy plik roboczy, wygodniej
            zacząć od sekcji importu źródeł.
          </p>
        </div>

        {categories.length === 0 ? (
          <p className="rounded-[1.2rem] border border-border/70 bg-background/70 px-4 py-4 text-sm text-muted-foreground">
            Najpierw dodaj co najmniej jedną kategorię w sekcji kategorii.
          </p>
        ) : (
          <AdminProductForm action={createProductAction} className="space-y-4">
            <ProductFormFields categories={categories} />
            <AdminSubmitButton
              idleLabel="Utwórz produkt"
              pendingLabel="Tworzenie produktu..."
              className="w-full"
            />
          </AdminProductForm>
        )}
      </section>

      <section className="surface-panel space-y-5 p-6">
        <div className="space-y-2">
          <h2 className="text-2xl text-foreground">Lista produktów</h2>
          <p className="text-sm text-muted-foreground">
            Szybki podgląd gotowości: status, pipeline, okładka, plik produktu, widoczność i
            powiązane źródło.
          </p>
        </div>

        {safeProducts.length === 0 ? (
          <p className="rounded-[1.2rem] border border-dashed border-border/70 px-4 py-5 text-sm text-muted-foreground">
            Brak produktów dla wybranych filtrów. Zmień filtry albo dodaj pierwszy produkt.
          </p>
        ) : (
          <div className="grid gap-4">
            {safeProducts.map((product) => (
              <article
                key={product.id}
                className="rounded-[1.5rem] border border-border/70 bg-background/60 p-5"
              >
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg text-foreground">
                          {safeText(product.name, "Bez nazwy produktu")}
                        </p>
                        <Chip label={formatProductStatus(product.status)} />
                        <Chip
                          label={formatProductPipelineStatus(product.pipelineStatus)}
                          tone={product.pipelineStatus === "ready" ? "positive" : "default"}
                        />
                        {product.badge ? <Chip label={product.badge} tone="warning" /> : null}
                      </div>

                      <p className="text-sm text-muted-foreground">
                        {safeText(product.category, "Brak kategorii")} •{" "}
                        {safeText(product.format, "Brak formatu")} •{" "}
                        {formatCurrency(product.price)}
                      </p>

                      <p className="max-w-3xl text-sm text-muted-foreground">
                        {safeText(product.shortDescription, "Brak krótkiego opisu.")}
                      </p>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2 xl:min-w-[340px]">
                      <Chip
                        label={safeBoolean(product.hasFile) ? "Plik dodany" : "Brak pliku"}
                        tone={safeBoolean(product.hasFile) ? "positive" : "default"}
                      />
                      <Chip
                        label={safeBoolean(product.hasCover) ? "Cover dodany" : "Brak coveru"}
                        tone={safeBoolean(product.hasCover) ? "positive" : "default"}
                      />
                      <Chip
                        label={
                          safeBoolean(product.isVisibleOnStorefront)
                            ? "Widoczny na storefront"
                            : "Niewidoczny w sklepie"
                        }
                        tone={safeBoolean(product.isVisibleOnStorefront) ? "positive" : "default"}
                      />
                      <Chip
                        label={
                          product.linkedSource?.title
                            ? `Źródło: ${product.linkedSource.title}`
                            : "Brak źródła"
                        }
                        tone={product.linkedSource?.title ? "positive" : "default"}
                      />
                    </div>
                  </div>

                  <details className="rounded-[1.3rem] border border-border/70 bg-background/80 p-4">
                    <summary className="cursor-pointer list-none text-sm text-foreground">
                      Edytuj produkt
                    </summary>

                    <div className="mt-4 space-y-4">
                      <AdminProductForm
                        action={updateProductAction}
                        className="space-y-4"
                      >
                        <input type="hidden" name="productId" value={product.id} />
                        <input type="hidden" name="returnPath" value="/admin/produkty" />
                        <ProductFormFields categories={categories} product={product} />
                        <AdminSubmitButton
                          idleLabel="Zapisz zmiany"
                          pendingLabel="Zapisywanie..."
                        />
                      </AdminProductForm>

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
