import Link from "next/link";

import { createProductAction } from "@/app/admin/actions";
import { AdminProductForm } from "@/components/admin/admin-product-form";
import { AdminSubmitButton } from "@/components/admin/admin-submit-button";
import { FileDropzone } from "@/components/admin/file-dropzone";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  formatAdminDate,
  formatMimeTypeLabel,
  formatProductPipelineStatus,
  formatProductSourceLinkStatus,
  formatProductSourceStage,
  formatProductStatus,
} from "@/lib/format";
import { PRODUCT_PIPELINE_STATUSES, PRODUCT_STATUSES } from "@/types/store";

type CategoryOption = {
  id: string;
  name: string;
  slug: string;
};

type ProductSourceRecord = {
  id?: string | null;
  driveFileId?: string | null;
  title?: string | null;
  mimeType?: string | null;
  driveUrl?: string | null;
  sourceStage?: string | null;
  modifiedAt?: string | null;
  status?: string | null;
  linkedProduct?: {
    id?: string | null;
    name?: string | null;
    slug?: string | null;
    status?: string | null;
    pipelineStatus?: string | null;
  } | null;
};

type AdminProductSourcesManagerProps = {
  categories: CategoryOption[];
  sources: ProductSourceRecord[];
};

const DEFAULT_ACCENT = "from-stone-950 via-stone-800 to-amber-500";
const DEFAULT_COVER_GRADIENT = "from-[#f8f2ea] via-[#efe0c8] to-[#d8c09a]";

function safeText(value: string | null | undefined, fallback = "") {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

function safeNumber(value: number | null | undefined, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function stripExtension(filename: string) {
  return filename.replace(/\.[^.]+$/, "");
}

function prettifyTitle(filename: string) {
  return stripExtension(filename)
    .replace(/^ebook-/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function inferCategoryId(title: string, categories: CategoryOption[]) {
  const normalized = title.toLowerCase();

  const financeCategory = categories.find((category) => category.slug.includes("finanse"));
  const salesCategory = categories.find((category) => category.slug.includes("sprzed"));
  const planningCategory = categories.find((category) => category.slug.includes("plan"));

  if ((normalized.includes("finans") || normalized.includes("budzet")) && financeCategory) {
    return financeCategory.id;
  }

  if (
    (normalized.includes("firma") ||
      normalized.includes("ofert") ||
      normalized.includes("sprzed")) &&
    salesCategory
  ) {
    return salesCategory.id;
  }

  if (
    (normalized.includes("notion") ||
      normalized.includes("plan") ||
      normalized.includes("system")) &&
    planningCategory
  ) {
    return planningCategory.id;
  }

  return categories[0]?.id ?? "";
}

function inferFormat(source: ProductSourceRecord) {
  const mimeLabel = formatMimeTypeLabel(source.mimeType, source.title);
  return source.mimeType === "text/html" ? `${mimeLabel} + eksport PDF` : mimeLabel;
}

function inferPrice(source: ProductSourceRecord) {
  if (source.mimeType === "application/pdf") {
    return 59;
  }

  if (source.mimeType === "text/html") {
    return 79;
  }

  return 99;
}

function inferShortDescription(source: ProductSourceRecord) {
  const title = prettifyTitle(safeText(source.title, "Nowy produkt"));
  return `${title} pomaga przełożyć materiał roboczy na gotowy produkt cyfrowy z jasnym efektem dla klienta.`;
}

function inferDescription(source: ProductSourceRecord) {
  const title = prettifyTitle(safeText(source.title, "Nowy produkt"));
  return `${title} to materiał bazowy gotowy do opracowania jako produkt premium w Templify. Uzupełnij okładkę, finalny plik i dopracuj komunikat wartości przed publikacją.`;
}

function SourceStatusBadge({ status }: { status?: ProductSourceRecord["status"] }) {
  const normalizedStatus = status ?? "unattached";
  const toneClass =
    normalizedStatus === "published"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
      : normalizedStatus === "draft"
        ? "border-amber-500/20 bg-amber-500/10 text-amber-100"
        : "border-border/70 bg-background/60 text-muted-foreground";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.18em] ${toneClass}`}
    >
      {formatProductSourceLinkStatus(normalizedStatus)}
    </span>
  );
}

export function AdminProductSourcesManager({
  categories,
  sources,
}: AdminProductSourcesManagerProps) {
  const safeSources = Array.isArray(sources) ? sources : [];
  const unattachedCount = safeSources.filter((source) => source.status === "unattached").length;
  const draftCount = safeSources.filter((source) => source.status === "draft").length;
  const publishedCount = safeSources.filter((source) => source.status === "published").length;

  return (
    <div className="space-y-6">
      <section className="surface-panel space-y-5 p-6">
        <div className="space-y-2">
          <h2 className="text-2xl text-foreground">Źródła produktów</h2>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Ten widok zbiera istniejące materiały robocze z folderu produktowego i pokazuje,
            które z nich są już podpięte do oferty w sklepie.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-[1.3rem] border border-border/70 bg-background/70 p-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-primary/75">
              Niepodpięte
            </p>
            <p className="mt-3 text-3xl text-foreground">{safeNumber(unattachedCount)}</p>
            <p className="mt-1 text-sm text-muted-foreground">gotowe do utworzenia produktu</p>
          </article>
          <article className="rounded-[1.3rem] border border-border/70 bg-background/70 p-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-primary/75">Draft</p>
            <p className="mt-3 text-3xl text-foreground">{safeNumber(draftCount)}</p>
            <p className="mt-1 text-sm text-muted-foreground">materiały podpięte do draftów</p>
          </article>
          <article className="rounded-[1.3rem] border border-border/70 bg-background/70 p-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-primary/75">
              Opublikowane
            </p>
            <p className="mt-3 text-3xl text-foreground">{safeNumber(publishedCount)}</p>
            <p className="mt-1 text-sm text-muted-foreground">powiązane z aktywnymi produktami</p>
          </article>
        </div>
      </section>

      {safeSources.length === 0 ? (
        <section className="surface-panel p-6">
          <p className="rounded-[1.2rem] border border-dashed border-border/70 px-4 py-5 text-sm text-muted-foreground">
            Nie znaleziono jeszcze żadnych źródeł produktów do importu.
          </p>
        </section>
      ) : (
        <section className="surface-panel space-y-5 p-6">
          <div className="space-y-2">
            <h2 className="text-2xl text-foreground">Lista plików roboczych</h2>
            <p className="text-sm text-muted-foreground">
              Wybierz materiał, sprawdź jego stan i jednym formularzem utwórz produkt w sklepie.
            </p>
          </div>

          <div className="grid gap-4">
            {safeSources.map((source, index) => {
              const safeTitle = safeText(source.title, "Bez nazwy pliku");
              const defaultName = prettifyTitle(safeTitle);
              const defaultSlug = slugify(defaultName || `produkt-${index + 1}`);
              const defaultCategoryId = inferCategoryId(safeTitle, categories);
              const defaultPrice = inferPrice(source);
              const defaultShortDescription = inferShortDescription(source);
              const defaultDescription = inferDescription(source);
              const defaultStatus = source.status === "published" ? "published" : "draft";
              const defaultPipelineStatus =
                source.status === "published" ? "published" : "working";
              const linkedProduct = source.linkedProduct ?? null;

              return (
                <article
                  key={safeText(source.id, `${safeTitle}-${index}`)}
                  className="rounded-[1.5rem] border border-border/70 bg-background/60 p-5"
                >
                  <div className="flex flex-col gap-5">
                    <div className="grid gap-4 xl:grid-cols-[1.3fr_0.9fr]">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-lg text-foreground">{safeTitle}</p>
                          <SourceStatusBadge status={source.status} />
                          <span className="inline-flex rounded-full border border-border/70 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                            {formatProductSourceStage(source.sourceStage)}
                          </span>
                          <span className="inline-flex rounded-full border border-border/70 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                            {formatMimeTypeLabel(source.mimeType, source.title)}
                          </span>
                        </div>

                        <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                          <p>Data modyfikacji: {formatAdminDate(source.modifiedAt)}</p>
                          <p>ID pliku: {safeText(source.driveFileId, "Brak danych")}</p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          {safeText(source.driveUrl) ? (
                            <Link
                              href={safeText(source.driveUrl)}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-full border border-border/70 px-4 py-2 text-sm text-foreground transition hover:border-primary/30"
                            >
                              Otwórz plik źródłowy
                            </Link>
                          ) : null}

                          {linkedProduct ? (
                            <Link
                              href="/admin/produkty"
                              className="rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm text-foreground transition hover:border-primary/30"
                            >
                              Zobacz produkt: {safeText(linkedProduct.name, "Brak nazwy")}
                            </Link>
                          ) : null}
                        </div>
                      </div>

                      <div className="rounded-[1.3rem] border border-border/70 bg-background/70 p-4 text-sm text-muted-foreground">
                        <p className="text-[11px] uppercase tracking-[0.22em] text-primary/75">
                          Powiązany produkt
                        </p>
                        {linkedProduct ? (
                          <div className="mt-3 space-y-2">
                            <p className="text-base text-foreground">
                              {safeText(linkedProduct.name, "Bez nazwy produktu")}
                            </p>
                            <p>Status sklepu: {formatProductStatus(linkedProduct.status)}</p>
                            <p>
                              Pipeline: {formatProductPipelineStatus(linkedProduct.pipelineStatus)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Slug: {safeText(linkedProduct.slug, "brak")}
                            </p>
                          </div>
                        ) : (
                          <p className="mt-3">To źródło nie jest jeszcze podpięte do produktu.</p>
                        )}
                      </div>
                    </div>

                    {!linkedProduct ? (
                      categories.length === 0 ? (
                        <p className="rounded-[1.2rem] border border-border/70 bg-background/70 px-4 py-4 text-sm text-muted-foreground">
                          Najpierw dodaj kategorię w panelu kategorii, a potem wróć do importu.
                        </p>
                      ) : (
                        <details className="rounded-[1.3rem] border border-border/70 bg-background/80 p-4">
                          <summary className="cursor-pointer list-none text-sm text-foreground">
                            Utwórz produkt na bazie tego pliku
                          </summary>

                          <AdminProductForm
                            action={createProductAction}
                            className="mt-4 space-y-4"
                          >
                            <input type="hidden" name="sourceId" value={safeText(source.id)} />
                            <input type="hidden" name="returnPath" value="/admin/import" />
                            <input type="hidden" name="compareAtPrice" value="" />
                            <input type="hidden" name="format" value={inferFormat(source)} />
                            <input type="hidden" name="pages" value="0" />
                            <input type="hidden" name="salesLabel" value="Nowy produkt" />
                            <input type="hidden" name="heroNote" value="Gotowe do wdrożenia." />
                            <input type="hidden" name="accent" value={DEFAULT_ACCENT} />
                            <input
                              type="hidden"
                              name="coverGradient"
                              value={DEFAULT_COVER_GRADIENT}
                            />
                            <input type="hidden" name="sortOrder" value="0" />
                            <input type="hidden" name="featuredOrder" value="0" />
                            <input type="hidden" name="tags" value="" />
                            <input type="hidden" name="includes" value="" />
                            <input type="hidden" name="badge" value="" />
                            <input type="hidden" name="isActive" value="true" />

                            <div className="grid gap-4 xl:grid-cols-2">
                              <label className="space-y-2">
                                <span className="text-sm text-foreground">Nazwa produktu</span>
                                <Input name="name" defaultValue={defaultName} />
                              </label>

                              <label className="space-y-2">
                                <span className="text-sm text-foreground">Slug</span>
                                <Input name="slug" defaultValue={defaultSlug} />
                              </label>

                              <label className="space-y-2">
                                <span className="text-sm text-foreground">Kategoria</span>
                                <select
                                  name="categoryId"
                                  defaultValue={defaultCategoryId}
                                  className="flex h-12 w-full rounded-2xl border border-border bg-input px-4 text-sm text-foreground"
                                >
                                  {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                      {category.name}
                                    </option>
                                  ))}
                                </select>
                              </label>

                              <label className="space-y-2">
                                <span className="text-sm text-foreground">Cena</span>
                                <Input name="price" type="number" defaultValue={defaultPrice} />
                              </label>

                              <label className="space-y-2">
                                <span className="text-sm text-foreground">Status sklepu</span>
                                <select
                                  name="status"
                                  defaultValue={defaultStatus}
                                  className="flex h-12 w-full rounded-2xl border border-border bg-input px-4 text-sm text-foreground"
                                >
                                  {PRODUCT_STATUSES.map((status) => (
                                    <option key={status} value={status}>
                                      {formatProductStatus(status)}
                                    </option>
                                  ))}
                                </select>
                              </label>

                              <label className="space-y-2">
                                <span className="text-sm text-foreground">
                                  Pipeline publikacji
                                </span>
                                <select
                                  name="pipelineStatus"
                                  defaultValue={defaultPipelineStatus}
                                  className="flex h-12 w-full rounded-2xl border border-border bg-input px-4 text-sm text-foreground"
                                >
                                  {PRODUCT_PIPELINE_STATUSES.map((status) => (
                                    <option key={status} value={status}>
                                      {formatProductPipelineStatus(status)}
                                    </option>
                                  ))}
                                </select>
                              </label>

                              <label className="space-y-2 xl:col-span-2">
                                <span className="text-sm text-foreground">Krótki opis</span>
                                <Textarea
                                  name="shortDescription"
                                  defaultValue={defaultShortDescription}
                                  className="min-h-24"
                                />
                              </label>

                              <label className="space-y-2 xl:col-span-2">
                                <span className="text-sm text-foreground">Opis produktu</span>
                                <Textarea
                                  name="description"
                                  defaultValue={defaultDescription}
                                  className="min-h-32"
                                />
                              </label>

                              <div className="space-y-2">
                                <span className="text-sm text-foreground">Cover</span>
                                <FileDropzone
                                  name="coverFile"
                                  accept="image/png,image/jpeg,image/webp"
                                  label="Dodaj okładkę"
                                  hint="PNG, JPG lub WEBP, do 8 MB"
                                  maxSizeMb={8}
                                />
                              </div>

                              <div className="space-y-2">
                                <span className="text-sm text-foreground">Plik produktu</span>
                                <FileDropzone
                                  name="productFile"
                                  accept=".pdf,.zip,application/pdf,application/zip,application/x-zip-compressed"
                                  label="Dodaj finalny plik"
                                  hint="PDF lub ZIP, do 50 MB"
                                  maxSizeMb={50}
                                />
                              </div>
                            </div>

                            <AdminSubmitButton
                              idleLabel="Utwórz produkt z tego źródła"
                              pendingLabel="Tworzenie produktu..."
                            />
                          </AdminProductForm>
                        </details>
                      )
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
