"use client";

import { useId, useState, type ChangeEvent, type ReactNode } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  ImageIcon,
  Layers3,
  PackageCheck,
  Sparkles,
} from "lucide-react";

import { FileDropzone } from "@/components/admin/file-dropzone";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DEFAULT_COVER_IMAGE_OPACITY,
  MAX_COVER_IMAGE_OPACITY,
  MIN_COVER_IMAGE_OPACITY,
  normalizeCoverImageOpacity,
} from "@/lib/product";
import { cn } from "@/lib/utils";
import { type ProductBadge, type ProductPipelineStatus, type ProductStatus } from "@/types/store";

type CategoryOption = {
  id: string;
  name: string;
  slug: string;
};

type ProductRecord = {
  id?: string;
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
  salesLabel?: string | null;
  accent?: string | null;
  coverGradient?: string | null;
  coverImageOpacity?: number | null;
  coverImageUrl?: string | null;
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
  filePath?: string | null;
  linkedSource?: {
    id?: string | null;
    title?: string | null;
  } | null;
  previews?: Array<{
    id: string;
  }> | null;
};

type AdminProductEditorFieldsProps = {
  categories: CategoryOption[];
  product?: ProductRecord;
};

type ProductFormState = {
  name: string;
  slug: string;
  categoryId: string;
  format: string;
  price: string;
  compareAtPrice: string;
  shortDescription: string;
  description: string;
  heroNote: string;
  tags: string;
  includes: string;
  salesLabel: string;
  badge: string;
  status: ProductStatus;
  pipelineStatus: ProductPipelineStatus;
  pages: string;
  sortOrder: string;
  featuredOrder: string;
  accent: string;
  coverGradient: string;
  coverImageOpacity: number;
  bestseller: boolean;
  featured: boolean;
  isActive: boolean;
};

type GradientPreset = {
  id: string;
  label: string;
  tone: string;
  accent: string;
  coverGradient: string;
};

const BADGE_OPTIONS: Array<{ value: "" | ProductBadge; label: string }> = [
  { value: "", label: "Brak" },
  { value: "bestseller", label: "Bestseller" },
  { value: "new", label: "Nowość" },
  { value: "featured", label: "Featured" },
  { value: "pack", label: "Pakiet" },
];

const STORE_STATUS_OPTIONS: Array<{ value: ProductStatus; label: string; detail: string }> = [
  { value: "draft", label: "Draft", detail: "Produkt jest zapisany, ale nie pokazuje się klientom." },
  { value: "published", label: "Opublikowany", detail: "Produkt może być widoczny na storefront, jeśli jest aktywny." },
  { value: "archived", label: "Zarchiwizowany", detail: "Produkt znika z bieżącej oferty, ale zostaje w systemie." },
];

const PIPELINE_OPTIONS: Array<{
  value: ProductPipelineStatus;
  label: string;
  detail: string;
}> = [
  { value: "working", label: "Roboczy", detail: "Materiał dopiero powstaje albo wymaga większego dopracowania." },
  { value: "refining", label: "Do opracowania", detail: "Treść jest już sensowna, ale wymaga polishu i finalnych assetów." },
  { value: "ready", label: "Gotowy do publikacji", detail: "Produkt jest prawie gotowy i czeka na publikację." },
  { value: "published", label: "Opublikowany", detail: "Produkt jest po stronie operacyjnej zamknięty." },
];

const GRADIENT_PRESETS: GradientPreset[] = [
  {
    id: "ivory-editorial",
    label: "Ivory Editorial",
    tone: "jasny premium",
    accent: "from-stone-950 via-stone-900 to-amber-800",
    coverGradient: "from-[#fbf5ea] via-[#f4ead9] to-[#e4c58d]",
  },
  {
    id: "charcoal-gold",
    label: "Charcoal Gold",
    tone: "ciemny premium",
    accent: "from-stone-950 via-amber-900 to-yellow-700",
    coverGradient: "from-stone-950 via-stone-900 to-[#9d7b45]",
  },
  {
    id: "sage-portfolio",
    label: "Sage Portfolio",
    tone: "spokojny editorial",
    accent: "from-emerald-950 via-emerald-800 to-lime-600",
    coverGradient: "from-[#f5f5ed] via-[#dde5d2] to-[#9ab088]",
  },
  {
    id: "copper-studio",
    label: "Copper Studio",
    tone: "mocny sprzedażowo",
    accent: "from-amber-950 via-orange-700 to-rose-500",
    coverGradient: "from-[#f8ecdf] via-[#efc8a3] to-[#b35f49]",
  },
];

function safeText(value: string | null | undefined, fallback = "") {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

function safeNumberString(value: number | null | undefined, fallback = "0") {
  return typeof value === "number" && Number.isFinite(value) ? String(value) : fallback;
}

function safeStringArray(value: string[] | null | undefined) {
  return Array.isArray(value) ? value : [];
}

function normalizeTagCount(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean).length;
}

function normalizeListCount(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean).length;
}

function countWords(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]+/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function extractFileName(path?: string | null) {
  if (!path) {
    return null;
  }

  const segments = path.split("/");
  return segments[segments.length - 1] ?? path;
}

function getCategoryName(categories: CategoryOption[], categoryId: string) {
  return categories.find((category) => category.id === categoryId)?.name ?? "Wybierz kategorię";
}

function getInitialFormState(
  categories: CategoryOption[],
  product?: ProductRecord,
): ProductFormState {
  const firstCategoryId = categories[0]?.id ?? "";
  const initialCategoryId = product?.categoryId ?? firstCategoryId;
  const matchedPreset = GRADIENT_PRESETS.find(
    (preset) =>
      preset.accent === safeText(product?.accent) &&
      preset.coverGradient === safeText(product?.coverGradient),
  );

  return {
    name: safeText(product?.name),
    slug: safeText(product?.slug),
    categoryId: initialCategoryId,
    format: safeText(product?.format, "PDF"),
    price: safeNumberString(product?.price, "99"),
    compareAtPrice:
      typeof product?.compareAtPrice === "number" ? String(product.compareAtPrice) : "",
    shortDescription: safeText(product?.shortDescription),
    description: safeText(product?.description),
    heroNote: safeText(product?.heroNote),
    tags: safeStringArray(product?.tags).join(", "),
    includes: safeStringArray(product?.includes).join("\n"),
    salesLabel: safeText(product?.salesLabel),
    badge: safeText(product?.badge),
    status: (product?.status as ProductStatus | undefined) ?? "draft",
    pipelineStatus: (product?.pipelineStatus as ProductPipelineStatus | undefined) ?? "working",
    pages: safeNumberString(product?.pages, "0"),
    sortOrder: safeNumberString(product?.sortOrder, "0"),
    featuredOrder: safeNumberString(product?.featuredOrder, "0"),
    accent: matchedPreset?.accent ?? safeText(product?.accent, GRADIENT_PRESETS[0].accent),
    coverGradient:
      matchedPreset?.coverGradient ??
      safeText(product?.coverGradient, GRADIENT_PRESETS[0].coverGradient),
    coverImageOpacity:
      typeof product?.coverImageOpacity === "number"
        ? normalizeCoverImageOpacity(product.coverImageOpacity)
        : DEFAULT_COVER_IMAGE_OPACITY,
    bestseller: product?.bestseller === true,
    featured: product?.featured === true,
    isActive: product?.isActive !== false,
  };
}

function getCountTone(current: number, optimalMin: number, optimalMax: number) {
  if (current < optimalMin) {
    return {
      label: "Za krótkie",
      className: "text-amber-200",
    };
  }

  if (current > optimalMax) {
    return {
      label: "Za długie",
      className: "text-amber-200",
    };
  }

  return {
    label: "Optymalne",
    className: "text-emerald-200",
  };
}

function getReadinessState(state: ProductFormState, assetState: { hasCover: boolean; hasFile: boolean }) {
  const checks = [
    { id: "name", label: "Ma nazwę", ready: state.name.trim().length >= 3 },
    { id: "category", label: "Ma kategorię", ready: state.categoryId.trim().length > 0 },
    { id: "price", label: "Ma cenę", ready: Number(state.price) > 0 },
    {
      id: "shortDescription",
      label: "Ma krótki opis",
      ready: state.shortDescription.trim().length >= 12,
    },
    {
      id: "description",
      label: "Ma pełny opis",
      ready: state.description.trim().length >= 20,
    },
    { id: "cover", label: "Ma cover", ready: assetState.hasCover },
    { id: "file", label: "Ma finalny plik", ready: assetState.hasFile },
  ];

  return {
    checks,
    missing: checks.filter((check) => !check.ready),
    readyCount: checks.filter((check) => check.ready).length,
  };
}

function Legend() {
  return (
    <div className="rounded-[1.2rem] border border-border/70 bg-background/60 px-4 py-3 text-sm text-muted-foreground">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-foreground">
          <span className="text-primary">*</span> wymagane do zapisania
        </span>
        <span>Opcjonalne można uzupełnić później</span>
      </div>
    </div>
  );
}

function FieldLabel({
  label,
  required = false,
}: {
  label: string;
  required?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-foreground">
      <span>
        {label}
        {required ? <span className="ml-1 text-primary">*</span> : null}
      </span>
      {!required ? (
        <span className="rounded-full border border-border/70 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Opcjonalne
        </span>
      ) : null}
    </div>
  );
}

function HelperText({ children }: { children: ReactNode }) {
  return <p className="text-xs leading-5 text-muted-foreground">{children}</p>;
}

function CounterHint({
  label,
  current,
  optimalMin,
  optimalMax,
  unit,
}: {
  label: string;
  current: number;
  optimalMin: number;
  optimalMax: number;
  unit: string;
}) {
  const tone = getCountTone(current, optimalMin, optimalMax);

  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">
        {label}: {current} {unit}
      </span>
      <span className={tone.className}>{tone.label}</span>
    </div>
  );
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[1.5rem] border border-border/70 bg-background/50 p-5 sm:p-6">
      <div className="space-y-1">
        <h3 className="text-lg text-foreground">{title}</h3>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

export function AdminProductEditorFields({
  categories,
  product,
}: AdminProductEditorFieldsProps) {
  const [formState, setFormState] = useState(() => getInitialFormState(categories, product));
  const [isSlugManual, setIsSlugManual] = useState(Boolean(safeText(product?.slug)));
  const [selectedPresetId, setSelectedPresetId] = useState(() => {
    const matchedPreset = GRADIENT_PRESETS.find(
      (preset) =>
        preset.accent === safeText(product?.accent) &&
        preset.coverGradient === safeText(product?.coverGradient),
    );

    return matchedPreset?.id ?? GRADIENT_PRESETS[0].id;
  });
  const [isManualGradientMode, setIsManualGradientMode] = useState(() => {
    const hasCustomGradient =
      safeText(product?.accent).length > 0 &&
      !GRADIENT_PRESETS.some(
        (preset) =>
          preset.accent === safeText(product?.accent) &&
          preset.coverGradient === safeText(product?.coverGradient),
      );

    return hasCustomGradient;
  });
  const [selectedCoverFiles, setSelectedCoverFiles] = useState<File[]>([]);
  const [selectedProductFiles, setSelectedProductFiles] = useState<File[]>([]);
  const [selectedPreviewFiles, setSelectedPreviewFiles] = useState<File[]>([]);
  const descriptionId = useId();

  function updateField<Key extends keyof ProductFormState>(
    key: Key,
    value: ProductFormState[Key],
  ) {
    setFormState((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleTextAreaChange(
    key: "shortDescription" | "description" | "includes",
    event: ChangeEvent<HTMLTextAreaElement>,
  ) {
    updateField(key, event.target.value);
  }

  function handleInputChange(
    key:
      | "name"
      | "slug"
      | "format"
      | "price"
      | "compareAtPrice"
      | "heroNote"
      | "tags"
      | "salesLabel"
      | "pages"
      | "sortOrder"
      | "featuredOrder"
      | "accent"
      | "coverGradient",
    event: ChangeEvent<HTMLInputElement>,
  ) {
    updateField(key, event.target.value);
  }

  function selectPreset(preset: GradientPreset) {
    setSelectedPresetId(preset.id);
    setIsManualGradientMode(false);
    setFormState((current) => ({
      ...current,
      accent: preset.accent,
      coverGradient: preset.coverGradient,
    }));
  }

  const coverFileName = extractFileName(product?.coverPath);
  const productFileName = extractFileName(product?.filePath);
  const hasCover = selectedCoverFiles.length > 0 || Boolean(coverFileName);
  const hasProductFile = selectedProductFiles.length > 0 || Boolean(productFileName);
  const readiness = getReadinessState(formState, {
    hasCover,
    hasFile: hasProductFile,
  });
  const selectedCategoryName = getCategoryName(categories, formState.categoryId);
  const selectedBadge =
    BADGE_OPTIONS.find((option) => option.value === formState.badge)?.label ?? "Brak";
  const productUrl = formState.slug ? `/produkty/${formState.slug}` : null;
  const statusNeedsWarning = formState.status === "published" && readiness.missing.length > 0;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_360px]">
      <div className="space-y-6">
        <Legend />

        <FormSection
          title="1. Podstawy produktu"
          description="Tu ustawiasz najważniejsze informacje operacyjne: nazwę, kategorię, cenę i status pracy nad produktem."
        >
          {product?.linkedSource?.id ? (
            <div className="rounded-[1.2rem] border border-primary/20 bg-primary/10 px-4 py-4 text-sm text-muted-foreground">
              <input type="hidden" name="sourceId" value={product.linkedSource.id} />
              Powiązane źródło:{" "}
              <span className="text-foreground">
                {safeText(product.linkedSource.title, "Bez nazwy źródła")}
              </span>
            </div>
          ) : null}

          <div className="grid gap-5 xl:grid-cols-2">
            <label className="space-y-2">
              <FieldLabel label="Nazwa" required />
              <Input
                name="name"
                value={formState.name}
                onChange={(event) => {
                  const nextName = event.target.value;
                  setFormState((current) => ({
                    ...current,
                    name: nextName,
                    slug: isSlugManual ? current.slug : slugify(nextName),
                  }));
                }}
                placeholder="Founder Offer Kit"
              />
              <HelperText>3-6 słów, jasno opisujących efekt produktu.</HelperText>
              <CounterHint
                label="Liczba słów"
                current={countWords(formState.name)}
                optimalMin={3}
                optimalMax={6}
                unit="słów"
              />
            </label>

            <label className="space-y-2">
              <FieldLabel label="Slug" required />
              <Input
                name="slug"
                value={formState.slug}
                onChange={(event) => {
                  setIsSlugManual(true);
                  handleInputChange("slug", event);
                }}
                placeholder="founder-offer-kit"
              />
              <HelperText>Automatycznie z nazwy, małe litery i myślniki.</HelperText>
            </label>

            <label className="space-y-2">
              <FieldLabel label="Kategoria" required />
              <select
                name="categoryId"
                className="flex h-12 w-full rounded-2xl border border-border bg-input px-4 text-sm text-foreground"
                value={formState.categoryId}
                onChange={(event) => updateField("categoryId", event.target.value)}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <HelperText>Ta kategoria steruje filtrem i etykietą produktu na storefront.</HelperText>
            </label>

            <label className="space-y-2">
              <FieldLabel label="Format" required />
              <Input
                name="format"
                value={formState.format}
                onChange={(event) => handleInputChange("format", event)}
                placeholder="PDF"
              />
              <HelperText>Krótko: PDF, ZIP, PDF + Notion, arkusz Google itp.</HelperText>
            </label>

            <label className="space-y-2">
              <FieldLabel label="Cena" required />
              <Input
                name="price"
                type="number"
                value={formState.price}
                onChange={(event) => handleInputChange("price", event)}
                min="1"
              />
              <HelperText>Finalna cena sprzedaży widoczna na karcie produktu i checkoutcie.</HelperText>
            </label>

            <label className="space-y-2">
              <FieldLabel label="Cena porównawcza" />
              <Input
                name="compareAtPrice"
                type="number"
                value={formState.compareAtPrice}
                onChange={(event) => handleInputChange("compareAtPrice", event)}
                placeholder="opcjonalnie"
                min="0"
              />
              <HelperText>Pokaże przekreśloną starą cenę na karcie produktu.</HelperText>
            </label>

            <label className="space-y-2">
              <FieldLabel label="Status sklepu" required />
              <select
                name="status"
                className="flex h-12 w-full rounded-2xl border border-border bg-input px-4 text-sm text-foreground"
                value={formState.status}
                onChange={(event) => updateField("status", event.target.value as ProductStatus)}
              >
                {STORE_STATUS_OPTIONS.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              <HelperText>
                {STORE_STATUS_OPTIONS.find((status) => status.value === formState.status)?.detail}
              </HelperText>
            </label>

            <label className="space-y-2">
              <FieldLabel label="Pipeline publikacji" required />
              <select
                name="pipelineStatus"
                className="flex h-12 w-full rounded-2xl border border-border bg-input px-4 text-sm text-foreground"
                value={formState.pipelineStatus}
                onChange={(event) =>
                  updateField("pipelineStatus", event.target.value as ProductPipelineStatus)
                }
              >
                {PIPELINE_OPTIONS.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              <HelperText>
                {PIPELINE_OPTIONS.find((status) => status.value === formState.pipelineStatus)?.detail}
              </HelperText>
            </label>
          </div>
        </FormSection>

        <FormSection
          title="2. Opis i copy sprzedażowe"
          description="Te pola wpływają na to, jak produkt brzmi na liście, karcie produktu i w sekcjach sprzedażowych."
        >
          <div className="grid gap-5 xl:grid-cols-2">
            <label className="space-y-2 xl:col-span-2">
              <FieldLabel label="Krótki opis" required />
              <Textarea
                name="shortDescription"
                value={formState.shortDescription}
                onChange={(event) => handleTextAreaChange("shortDescription", event)}
                className="min-h-24"
                placeholder="Jedno zdanie, które mówi co użytkownik zyskuje po wdrożeniu produktu."
              />
              <HelperText>1 zdanie, najlepiej 12-20 słów.</HelperText>
              <CounterHint
                label="Liczba słów"
                current={countWords(formState.shortDescription)}
                optimalMin={12}
                optimalMax={20}
                unit="słów"
              />
            </label>

            <label className="space-y-2 xl:col-span-2">
              <FieldLabel label="Pełny opis" required />
              <Textarea
                id={descriptionId}
                name="description"
                value={formState.description}
                onChange={(event) => handleTextAreaChange("description", event)}
                className="min-h-36"
                placeholder="Opisz efekt, zastosowanie, dla kogo jest produkt i co dokładnie dostaje kupujący."
              />
              <HelperText>2-4 zdania o efekcie, zastosowaniu i zawartości.</HelperText>
              <CounterHint
                label="Znaki"
                current={formState.description.length}
                optimalMin={120}
                optimalMax={340}
                unit="znaków"
              />
            </label>

            <label className="space-y-2">
              <FieldLabel label="Hero note" required />
              <Input
                name="heroNote"
                value={formState.heroNote}
                onChange={(event) => handleInputChange("heroNote", event)}
                placeholder="Sprzedaj rezultat, nie sam plik"
              />
              <HelperText>Krótki tekst nad tytułem, 4-10 słów.</HelperText>
              <CounterHint
                label="Liczba słów"
                current={countWords(formState.heroNote)}
                optimalMin={4}
                optimalMax={10}
                unit="słów"
              />
            </label>

            <label className="space-y-2">
              <FieldLabel label="Etykieta sprzedażowa" required />
              <Input
                name="salesLabel"
                value={formState.salesLabel}
                onChange={(event) => handleInputChange("salesLabel", event)}
                placeholder="System dla małych zespołów i founderów"
              />
              <HelperText>Krótki podpis wyjaśniający dla kogo jest produkt.</HelperText>
            </label>

            <label className="space-y-2">
              <FieldLabel label="Tagi" />
              <Input
                name="tags"
                value={formState.tags}
                onChange={(event) => handleInputChange("tags", event)}
                placeholder="sprzedaż, oferta, agency workflow"
              />
              <HelperText>Oddziel przecinkami, najlepiej 3-6 tagów.</HelperText>
              <CounterHint
                label="Tagi"
                current={normalizeTagCount(formState.tags)}
                optimalMin={3}
                optimalMax={6}
                unit="pozycji"
              />
            </label>

            <label className="space-y-2">
              <FieldLabel label="Badge" />
              <select
                name="badge"
                className="flex h-12 w-full rounded-2xl border border-border bg-input px-4 text-sm text-foreground"
                value={formState.badge}
                onChange={(event) => updateField("badge", event.target.value)}
              >
                {BADGE_OPTIONS.map((badge) => (
                  <option key={badge.value || "empty"} value={badge.value}>
                    {badge.label}
                  </option>
                ))}
              </select>
              <HelperText>Mały wyróżnik na karcie produktu: bestseller, nowość, featured lub pakiet.</HelperText>
            </label>

            <label className="space-y-2 xl:col-span-2">
              <FieldLabel label="Sekcja „co zawiera”" />
              <Textarea
                name="includes"
                value={formState.includes}
                onChange={(event) => handleTextAreaChange("includes", event)}
                className="min-h-28"
                placeholder={"Checklistę wdrożenia\nSzablon strony sprzedażowej\nPakiet copy do sekcji hero"}
              />
              <HelperText>1 element na linię albo po przecinku.</HelperText>
              <CounterHint
                label="Elementy"
                current={normalizeListCount(formState.includes)}
                optimalMin={3}
                optimalMax={8}
                unit="pozycji"
              />
            </label>
          </div>
        </FormSection>

        <FormSection
          title="3. Wygląd na storefront"
          description="Te ustawienia wpływają na kartę produktu, sekcje featured i pierwsze wrażenie na storefront."
        >
          <div className="space-y-4">
            <div className="rounded-[1.2rem] border border-border/70 bg-background/70 px-4 py-4 text-sm text-muted-foreground">
              Wybierz preset wizualny zamiast ręcznie wpisywać klasy. Ten styl wpływa na wygląd karty produktu i okładki na storefront.
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {GRADIENT_PRESETS.map((preset) => {
                const selected = !isManualGradientMode && selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => selectPreset(preset)}
                    className={cn(
                      "rounded-[1.35rem] border p-4 text-left transition",
                      selected
                        ? "border-primary/40 bg-primary/10"
                        : "border-border/70 bg-background/70 hover:border-primary/25",
                    )}
                  >
                    <div
                      className={cn(
                        "h-20 rounded-[1rem] bg-gradient-to-br",
                        preset.coverGradient,
                      )}
                    />
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm text-foreground">{preset.label}</p>
                        <p className="text-xs text-muted-foreground">{preset.tone}</p>
                      </div>
                      {selected ? <Badge>Wybrany</Badge> : null}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                if (isManualGradientMode) {
                  const selectedPreset =
                    GRADIENT_PRESETS.find((preset) => preset.id === selectedPresetId) ??
                    GRADIENT_PRESETS[0];
                  selectPreset(selectedPreset);
                  return;
                }

                setIsManualGradientMode(true);
              }}
              className="inline-flex items-center gap-2 rounded-full border border-border/70 px-4 py-2 text-sm text-foreground transition hover:border-primary/30"
            >
              <Layers3 className="size-4" />
              {isManualGradientMode ? "Ukryj tryb ręczny" : "Włącz tryb ręczny"}
            </button>

            {isManualGradientMode ? (
              <div className="grid gap-5 xl:grid-cols-2">
                <label className="space-y-2">
                  <FieldLabel label="Gradient accent" required />
                  <Input
                    name="accent"
                    value={formState.accent}
                    onChange={(event) => handleInputChange("accent", event)}
                    placeholder="from-stone-950 via-stone-900 to-amber-800"
                  />
                  <HelperText>Kolor badge’a kategorii i drobnych akcentów na karcie produktu.</HelperText>
                </label>

                <label className="space-y-2">
                  <FieldLabel label="Gradient cover" required />
                  <Input
                    name="coverGradient"
                    value={formState.coverGradient}
                    onChange={(event) => handleInputChange("coverGradient", event)}
                    placeholder="from-[#fbf5ea] via-[#f4ead9] to-[#e4c58d]"
                  />
                  <HelperText>Tło głównej karty i hero produktu na storefront.</HelperText>
                </label>
              </div>
            ) : (
              <>
                <input type="hidden" name="accent" value={formState.accent} />
                <input type="hidden" name="coverGradient" value={formState.coverGradient} />
              </>
            )}

            <div className="space-y-2 rounded-[1.35rem] border border-border/70 bg-background/70 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <FieldLabel label="Przesiąkanie okładki przez gradient" />
                <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs text-foreground">
                  {formState.coverImageOpacity}%
                </span>
              </div>
              <input
                type="range"
                name="coverImageOpacity"
                min={MIN_COVER_IMAGE_OPACITY}
                max={MAX_COVER_IMAGE_OPACITY}
                step={5}
                value={formState.coverImageOpacity}
                onChange={(event) =>
                  updateField(
                    "coverImageOpacity",
                    normalizeCoverImageOpacity(event.target.value),
                  )
                }
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-[var(--color-primary)]"
                aria-label="Przesiąkanie okładki przez gradient"
              />
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                <span>0% — sam gradient</span>
                <span>100% — sama okładka</span>
              </div>
              <HelperText>
                Sterujesz tym, ile okładki pokazuje się na tle gradientu na karcie
                produktu, hero i w bibliotece klienta. Domyślnie {DEFAULT_COVER_IMAGE_OPACITY}% —
                okładka jest widoczna, ale gradient wciąż nadaje ton produktu.
              </HelperText>
            </div>
          </div>
        </FormSection>

        <FormSection
          title="4. Pliki i assety"
          description="Tutaj dodajesz cover, finalny plik produktu i opcjonalne preview. Admin od razu widzi limity i stan gotowości."
        >
          <div className="grid gap-5 xl:grid-cols-2">
            <div className="space-y-2">
              <FieldLabel label="Okładka produktu" />
              <FileDropzone
                name="coverFile"
                accept="image/png,image/jpeg,image/webp"
                label="Dodaj cover produktu"
                hint="PNG, JPG lub WEBP, do 8 MB"
                maxSizeMb={8}
                statusLabel="Opcjonalne do zapisu, wymagane do pełnej publikacji"
                emptyState="Brak coveru. Produkt zapisze się bez okładki, ale na storefront będzie wyglądał mniej premium."
                currentValueLabel={coverFileName ? "Cover już dodany" : undefined}
                currentValueDetail={coverFileName ?? undefined}
                onFilesChange={setSelectedCoverFiles}
              />
            </div>

            <div className="space-y-2">
              <FieldLabel label="Finalny plik produktu" required />
              <FileDropzone
                name="productFile"
                accept=".pdf,.zip,application/pdf,application/zip,application/x-zip-compressed"
                label="Dodaj plik produktu"
                hint="PDF lub ZIP, do 50 MB"
                maxSizeMb={50}
                statusLabel="Wymagane do sprzedaży i biblioteki klienta"
                emptyState="Dodaj finalny plik produktu. Bez niego klient nie dostanie dostępu po zakupie."
                currentValueLabel={productFileName ? "Finalny plik już dodany" : undefined}
                currentValueDetail={productFileName ?? undefined}
                onFilesChange={setSelectedProductFiles}
              />
            </div>

            <div className="space-y-2 xl:col-span-2">
              <FieldLabel label="Preview images" />
              <FileDropzone
                name="previewFiles"
                accept="image/png,image/jpeg,image/webp"
                multiple
                label="Dodaj preview produktu"
                hint="Możesz wrzucić kilka plików na raz. PNG, JPG lub WEBP, do 8 MB każdy."
                maxSizeMb={8}
                statusLabel="Opcjonalne"
                emptyState="Preview nie są wymagane, ale pomagają pokazać wnętrze produktu na karcie produktu."
                currentValueLabel={
                  product?.previews?.length ? `Dodane preview: ${product.previews.length}` : undefined
                }
                currentValueDetail={
                  product?.previews?.length
                    ? "Istniejące preview możesz dalej porządkować niżej w edycji produktu."
                    : undefined
                }
                onFilesChange={setSelectedPreviewFiles}
              />
            </div>
          </div>
        </FormSection>

        <FormSection
          title="5. Publikacja i widoczność"
          description="Na koniec decydujesz, czy produkt ma być widoczny, promowany i jaką ma kolejność w sklepie."
        >
          <div className="grid gap-5 xl:grid-cols-2">
            <label className="space-y-2">
              <FieldLabel label="Liczba stron" required />
              <Input
                name="pages"
                type="number"
                value={formState.pages}
                onChange={(event) => handleInputChange("pages", event)}
                min="0"
              />
              <HelperText>Liczba stron lub ekranów, jeśli produkt jest w PDF albo prezentacji.</HelperText>
            </label>

            <label className="space-y-2">
              <FieldLabel label="Sort order" required />
              <Input
                name="sortOrder"
                type="number"
                value={formState.sortOrder}
                onChange={(event) => handleInputChange("sortOrder", event)}
                min="0"
              />
              <HelperText>Niższa liczba oznacza wyższą pozycję na listach administracyjnych i storefrontowych.</HelperText>
            </label>

            <label className="space-y-2">
              <FieldLabel label="Featured order" required />
              <Input
                name="featuredOrder"
                type="number"
                value={formState.featuredOrder}
                onChange={(event) => handleInputChange("featuredOrder", event)}
                min="0"
              />
              <HelperText>Używane, gdy produkt ma trafić do sekcji featured na homepage.</HelperText>
            </label>

            <div className="space-y-3">
              <FieldLabel label="Promocja produktu" />
              <input
                type="hidden"
                name="storefrontVisibility"
                value={formState.isActive ? "visible" : "hidden"}
              />
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="flex items-center gap-3 rounded-[1.2rem] border border-border/70 bg-background/60 px-4 py-3 text-sm text-foreground">
                  <input
                    name="bestseller"
                    type="checkbox"
                    checked={formState.bestseller}
                    onChange={(event) => updateField("bestseller", event.target.checked)}
                    className="size-4 accent-[var(--color-primary)]"
                  />
                  Bestseller
                </label>
                <label className="flex items-center gap-3 rounded-[1.2rem] border border-border/70 bg-background/60 px-4 py-3 text-sm text-foreground">
                  <input
                    name="featured"
                    type="checkbox"
                    checked={formState.featured}
                    onChange={(event) => updateField("featured", event.target.checked)}
                    className="size-4 accent-[var(--color-primary)]"
                  />
                  Featured
                </label>
                <label className="flex items-center gap-3 rounded-[1.2rem] border border-border/70 bg-background/60 px-4 py-3 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={formState.isActive}
                    onChange={(event) => updateField("isActive", event.target.checked)}
                    className="size-4 accent-[var(--color-primary)]"
                  />
                  Widoczny na storefront
                </label>
              </div>
              <HelperText>
                Jeśli produkt ma status „Opublikowany” i to pole jest włączone, trafi do publicznego katalogu.
              </HelperText>
            </div>
          </div>
        </FormSection>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
        <section className="rounded-[1.5rem] border border-border/70 bg-background/70 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">Gotowość do publikacji</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {readiness.readyCount}/7 kluczowych elementów jest gotowych.
              </p>
            </div>
            <Badge variant="outline">{readiness.missing.length === 0 ? "Gotowe" : "Braki"}</Badge>
          </div>

          <div className="mt-4 space-y-2">
            {readiness.checks.map((check) => (
              <div
                key={check.id}
                className="flex items-center justify-between gap-3 rounded-[1rem] border border-border/70 bg-background/60 px-3 py-3 text-sm"
              >
                <span className={check.ready ? "text-foreground" : "text-muted-foreground"}>
                  {check.label}
                </span>
                {check.ready ? (
                  <CheckCircle2 className="size-4 text-emerald-300" />
                ) : (
                  <CircleDashed className="size-4 text-amber-200" />
                )}
              </div>
            ))}
          </div>

          {statusNeedsWarning ? (
            <div className="mt-4 rounded-[1.1rem] border border-amber-500/25 bg-amber-500/10 p-4 text-sm text-amber-100">
              <div className="flex items-center gap-2 text-amber-50">
                <AlertTriangle className="size-4" />
                <span>Produkt ma status „Opublikowany”, ale wciąż czegoś mu brakuje.</span>
              </div>
              <p className="mt-2 text-amber-100/90">
                Uzupełnij: {readiness.missing.map((item) => item.label.toLowerCase()).join(", ")}.
              </p>
            </div>
          ) : null}
        </section>

        <section className="rounded-[1.5rem] border border-border/70 bg-background/70 p-5">
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Podgląd na storefront</p>
            <p className="text-sm text-muted-foreground">
              Mały preview pokazujący, jak produkt będzie wyglądał na liście produktów.
            </p>
          </div>

          <div className="mt-4 overflow-hidden rounded-[1.6rem] border border-border/70 bg-card/70 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.45)]">
            <div className={cn("relative min-h-52 overflow-hidden bg-gradient-to-br p-5", formState.coverGradient)}>
              <div className="hero-orb right-5 top-5 size-16 bg-white/35" />
              <div className="hero-orb bottom-5 left-5 size-14 bg-primary/18" />

              {product?.coverImageUrl && formState.coverImageOpacity > 0 ? (
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    backgroundImage: `url(${product.coverImageUrl})`,
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                    opacity: formState.coverImageOpacity / 100,
                  }}
                />
              ) : null}

              <div className="relative flex h-full flex-col justify-between gap-6">
                <div className="flex items-center justify-between gap-3">
                  <Badge
                    className={cn(
                      "border-0 bg-gradient-to-r text-[11px] uppercase tracking-[0.22em] text-brand-foreground",
                      formState.accent,
                    )}
                  >
                    {selectedCategoryName}
                  </Badge>
                  {formState.badge ? (
                    <Badge variant="outline" className="border-foreground/15 bg-background/75 text-foreground">
                      {selectedBadge}
                    </Badge>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-foreground/65">
                    {formState.heroNote || "Krótki tekst nad tytułem"}
                  </p>
                  <p className="max-w-[16rem] text-2xl text-foreground">
                    {formState.name || "Nazwa produktu"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 p-5">
              <div className="space-y-2">
                <p className="text-sm leading-6 text-muted-foreground">
                  {formState.shortDescription || "Tutaj pojawi się krótki opis produktu widoczny na karcie."}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full border border-border/70 px-3 py-1">
                    {formState.format || "Format"}
                  </span>
                  <span className="rounded-full border border-border/70 px-3 py-1">
                    {formState.pages || "0"} stron
                  </span>
                </div>
              </div>

              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-2xl font-semibold text-foreground">
                    {formState.price ? `${formState.price} zł` : "Cena"}
                  </p>
                  {formState.compareAtPrice ? (
                    <p className="text-sm text-muted-foreground line-through">
                      {formState.compareAtPrice} zł
                    </p>
                  ) : null}
                </div>
                <span className="text-sm font-medium text-primary">Zobacz</span>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-border/70 bg-background/70 p-5">
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Szybki skrót</p>
            <p className="text-sm text-muted-foreground">
              Najważniejsze decyzje w jednym miejscu, bez przewijania całego formularza.
            </p>
          </div>

          <div className="mt-4 grid gap-3">
            <div className="flex items-center justify-between rounded-[1rem] border border-border/70 bg-background/60 px-3 py-3 text-sm">
              <span className="inline-flex items-center gap-2 text-muted-foreground">
                <PackageCheck className="size-4 text-primary" />
                Status sklepu
              </span>
              <span className="text-foreground">
                {STORE_STATUS_OPTIONS.find((status) => status.value === formState.status)?.label}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-[1rem] border border-border/70 bg-background/60 px-3 py-3 text-sm">
              <span className="inline-flex items-center gap-2 text-muted-foreground">
                <Sparkles className="size-4 text-primary" />
                Pipeline
              </span>
              <span className="text-foreground">
                {PIPELINE_OPTIONS.find((status) => status.value === formState.pipelineStatus)?.label}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-[1rem] border border-border/70 bg-background/60 px-3 py-3 text-sm">
              <span className="inline-flex items-center gap-2 text-muted-foreground">
                <ImageIcon className="size-4 text-primary" />
                Cover
              </span>
              <span className={hasCover ? "text-foreground" : "text-muted-foreground"}>
                {hasCover ? "Gotowe" : "Brak"}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-[1rem] border border-border/70 bg-background/60 px-3 py-3 text-sm">
              <span className="inline-flex items-center gap-2 text-muted-foreground">
                <PackageCheck className="size-4 text-primary" />
                Plik produktu
              </span>
              <span className={hasProductFile ? "text-foreground" : "text-muted-foreground"}>
                {hasProductFile ? "Gotowe" : "Brak"}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-[1rem] border border-border/70 bg-background/60 px-3 py-3 text-sm">
              <span className="text-muted-foreground">Link storefront</span>
              <span className="truncate text-foreground">{productUrl ?? "Wpisz slug"}</span>
            </div>
            {selectedPreviewFiles.length > 0 ? (
              <div className="rounded-[1rem] border border-border/70 bg-background/60 px-3 py-3 text-sm text-muted-foreground">
                Dodane preview w tym zapisie: {selectedPreviewFiles.length}
              </div>
            ) : null}
          </div>
        </section>
      </aside>
    </div>
  );
}
