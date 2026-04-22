import Link from "next/link";
import {
  CheckCircle2,
  CircleDashed,
  ExternalLink,
  FileText,
  FolderTree,
  ImageIcon,
  Store,
  type LucideIcon,
} from "lucide-react";

import { AdminDetailsToggleButton } from "@/components/admin/admin-details-toggle-button";
import {
  createProductAction,
  createProductPreviewAction,
  deleteProductAction,
  deleteProductPreviewAction,
  publishProductAction,
  updateProductAction,
  updateProductPreviewAction,
} from "@/app/admin/actions";
import { AdminCopyLinkButton } from "@/components/admin/admin-copy-link-button";
import { AdminProductEditorFields } from "@/components/admin/admin-product-editor-fields";
import { AdminProductForm } from "@/components/admin/admin-product-form";
import { AdminSubmitButton } from "@/components/admin/admin-submit-button";
import { FileDropzone } from "@/components/admin/file-dropzone";
import { Input } from "@/components/ui/input";
import {
  formatCurrency,
  formatProductPipelineStatus,
  formatProductStatus,
} from "@/lib/format";
import {
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

function safePreviews(value: ProductPreviewRecord[] | null | undefined) {
  return Array.isArray(value) ? value : [];
}

function isPositive(value: boolean | null | undefined) {
  return value === true;
}

function isStorefrontReady(product: ProductRecord) {
  return (
    product.status === "published" &&
    isPositive(product.isVisibleOnStorefront) &&
    Boolean(product.slug)
  );
}

function getVisibilityMessage(product: ProductRecord) {
  return isStorefrontReady(product)
    ? "Produkt jest widoczny na storefront."
    : "Ten produkt nie jest jeszcze widoczny na storefront.";
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

function ProductSignal({
  icon: Icon,
  label,
  ready,
  detail,
}: {
  icon: LucideIcon;
  label: string;
  ready: boolean;
  detail: string;
}) {
  return (
    <div className="min-w-0 rounded-[1rem] border border-border/70 bg-background/60 px-3 py-3 text-sm">
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex min-w-0 items-center gap-2 text-muted-foreground">
          <Icon className="size-4 shrink-0 text-primary" />
          <span className="truncate">{label}</span>
        </span>
        <span
          className={
            ready
              ? "inline-flex shrink-0 items-center gap-2 text-emerald-200"
              : "inline-flex shrink-0 items-center gap-2 text-muted-foreground"
          }
        >
          {ready ? <CheckCircle2 className="size-4" /> : <CircleDashed className="size-4" />}
        </span>
      </div>
      <p className="mt-2 break-words text-xs leading-5 text-muted-foreground">{detail}</p>
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
            Dodatkowe zrzuty pokazujace wnetrze i jakosc produktu.
          </p>
        </div>
        <span className="text-xs uppercase tracking-[0.22em] text-primary/75">
          {previews.length} plikow
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
          label="Upusc zrzut preview"
          hint="Jeden obraz PNG, JPG lub WEBP, do 8 MB"
          maxSizeMb={8}
          statusLabel="Opcjonalne"
          emptyState="Dodaj pojedynczy zrzut, jesli chcesz pokazac wnetrze produktu."
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
                  {safeText(preview.storagePath, "Brak sciezki")}
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
                  idleLabel="Usun"
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
            <h2 className="text-2xl text-foreground">Operacyjny katalog produktow</h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Filtruj pipeline publikacji, sprawdzaj kompletnosc assetow i szybko przechodz do
              edycji lub publikacji produktu.
            </p>
          </div>
          <Link
            href="/admin/import"
            className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm text-foreground transition hover:border-primary/30"
          >
            Import / Zrodla produktow
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <SummaryCard label="Wszystkie" value={String(summary.total ?? 0)} detail="produkty w systemie" />
          <SummaryCard label="Draft" value={String(summary.draftCount ?? 0)} detail="zapisane, ale jeszcze niepublikowane" />
          <SummaryCard label="Gotowe" value={String(summary.readyCount ?? 0)} detail="pipeline gotowy do publikacji" />
          <SummaryCard label="Opublikowane" value={String(summary.publishedCount ?? 0)} detail="produkty ze statusem sklepu published" />
          <SummaryCard label="Bez zrodla" value={String(summary.missingSourceCount ?? 0)} detail="produkty bez podpietego materialu roboczego" />
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
              { value: "all", label: "Caly pipeline" },
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
            Wyczysc
          </Link>
        </form>
      </section>

      <section className="surface-panel space-y-5 p-6">
        <div className="space-y-2">
          <h2 className="text-2xl text-foreground">Nowy produkt</h2>
          <p className="text-sm text-muted-foreground">
            Formularz prowadzi krok po kroku: pokazuje wymagane pola, sugerowana dlugosc copy,
            gotowosc do publikacji i podglad karty produktu na storefront.
          </p>
        </div>

        {categories.length === 0 ? (
          <p className="rounded-[1.2rem] border border-border/70 bg-background/70 px-4 py-4 text-sm text-muted-foreground">
            Najpierw dodaj co najmniej jedna kategorie w sekcji kategorii.
          </p>
        ) : (
          <AdminProductForm action={createProductAction} className="space-y-4">
            <AdminProductEditorFields categories={categories} />
            <AdminSubmitButton
              idleLabel="Utworz produkt"
              pendingLabel="Tworzenie produktu..."
              className="w-full"
            />
          </AdminProductForm>
        )}
      </section>

      <section className="surface-panel space-y-5 p-6">
        <div className="space-y-2">
          <h2 className="text-2xl text-foreground">Lista produktow</h2>
          <p className="text-sm text-muted-foreground">
            Operacyjny widok statusu produktu: sklep, pipeline, zrodlo, assety i widocznosc na
            storefront.
          </p>
        </div>

        {safeProducts.length === 0 ? (
          <p className="rounded-[1.2rem] border border-dashed border-border/70 px-4 py-5 text-sm text-muted-foreground">
            Brak produktow dla wybranych filtrow. Zmien filtry albo dodaj pierwszy produkt.
          </p>
        ) : (
          <div className="grid gap-4">
            {safeProducts.map((product) => {
              const storefrontHref = product.slug ? `/produkty/${product.slug}` : null;
              const storefrontReady = isStorefrontReady(product);
              const visibilityMessage = getVisibilityMessage(product);

              return (
                <article
                  key={product.id}
                  className="rounded-[1.5rem] border border-border/70 bg-background/60 p-5"
                >
                  <div className="flex flex-col gap-5">
                    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
                      <div className="min-w-0 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="max-w-full truncate text-lg text-foreground">
                            {safeText(product.name, "Bez nazwy produktu")}
                          </p>
                          <Chip label={`Sklep: ${formatProductStatus(product.status)}`} />
                          <Chip
                            label={`Pipeline: ${formatProductPipelineStatus(product.pipelineStatus)}`}
                            tone={
                              product.pipelineStatus === "ready" ||
                              product.pipelineStatus === "published"
                                ? "positive"
                                : "default"
                            }
                          />
                          <Chip
                            label={
                              storefrontReady
                                ? "Storefront: widoczny"
                                : "Storefront: ukryty"
                            }
                            tone={storefrontReady ? "positive" : "default"}
                          />
                          {product.badge ? <Chip label={product.badge} tone="warning" /> : null}
                        </div>

                        <p className="truncate text-sm text-muted-foreground">
                          {safeText(product.category, "Brak kategorii")} •{" "}
                          {safeText(product.format, "Brak formatu")} • {formatCurrency(product.price)}
                        </p>

                        <p className="max-w-3xl overflow-hidden text-sm leading-6 text-muted-foreground [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                          {safeText(product.shortDescription, "Brak krotkiego opisu.")}
                        </p>

                        <p
                          className={
                            storefrontReady
                              ? "text-sm text-emerald-200"
                              : "text-sm text-muted-foreground"
                          }
                        >
                          {visibilityMessage}
                        </p>

                        <div className="flex flex-wrap gap-2">
                          <AdminDetailsToggleButton targetId={`product-edit-${product.id}`} />

                          {!storefrontReady ? (
                            <form action={publishProductAction}>
                              <input type="hidden" name="productId" value={product.id} />
                              <input type="hidden" name="returnPath" value="/admin/produkty" />
                              <AdminSubmitButton
                                idleLabel="Opublikuj i pokaz na storefront"
                                pendingLabel="Publikowanie..."
                              />
                            </form>
                          ) : (
                            <Link
                              href={storefrontHref ?? "#"}
                              target="_blank"
                              className="inline-flex items-center gap-2 rounded-full border border-border/70 px-4 py-2 text-sm text-foreground transition hover:border-primary/30"
                            >
                              <ExternalLink className="size-4" />
                              Otworz na storefront
                            </Link>
                          )}

                          <AdminCopyLinkButton href={storefrontHref} disabled={!storefrontReady} />
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 xl:max-w-[340px]">
                        <ProductSignal
                          icon={FileText}
                          label="Plik produktu"
                          ready={isPositive(product.hasFile)}
                          detail={
                            isPositive(product.hasFile)
                              ? "Finalny plik jest podpiety i gotowy do biblioteki klienta."
                              : "Brakuje finalnego pliku produktu."
                          }
                        />
                        <ProductSignal
                          icon={ImageIcon}
                          label="Cover"
                          ready={isPositive(product.hasCover)}
                          detail={
                            isPositive(product.hasCover)
                              ? "Produkt ma okladke do karty i strony produktu."
                              : "Brakuje okladki produktu."
                          }
                        />
                        <ProductSignal
                          icon={FolderTree}
                          label="Zrodlo"
                          ready={Boolean(product.linkedSource?.title)}
                          detail={
                            product.linkedSource?.title
                              ? product.linkedSource.title
                              : "Brak podpietego materialu zrodlowego."
                          }
                        />
                        <ProductSignal
                          icon={Store}
                          label="Widocznosc"
                          ready={isPositive(product.isVisibleOnStorefront)}
                          detail={visibilityMessage}
                        />
                      </div>
                    </div>

                    <details
                      id={`product-edit-${product.id}`}
                      className="rounded-[1.3rem] border border-border/70 bg-background/80 p-4"
                    >
                      <summary className="cursor-pointer list-none text-sm text-foreground">
                        Edytuj produkt
                      </summary>

                      <div className="mt-4 space-y-4">
                        <AdminProductForm action={updateProductAction} className="space-y-4">
                          <input type="hidden" name="productId" value={product.id} />
                          <input type="hidden" name="returnPath" value="/admin/produkty" />
                          <AdminProductEditorFields categories={categories} product={product} />
                          <AdminSubmitButton
                            idleLabel="Zapisz zmiany"
                            pendingLabel="Zapisywanie..."
                          />
                        </AdminProductForm>

                        <PreviewManager product={product} />

                        <form action={deleteProductAction}>
                          <input type="hidden" name="productId" value={product.id} />
                          <AdminSubmitButton
                            idleLabel="Usun produkt"
                            pendingLabel="Usuwanie..."
                            variant="destructive"
                          />
                        </form>
                      </div>
                    </details>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
