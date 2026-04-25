import "server-only";

import {
  CATEGORY_OPTIONS,
  PRODUCT_PIPELINE_STATUSES,
  PRODUCT_STATUSES,
  type Category,
  type ContentPage,
  type Product,
  type ProductBadge,
  type ProductPipelineStatus,
  type ProductStatus,
  type SiteSectionContent,
} from "@/types/store";
import {
  bestsellerProducts as mockBestsellers,
  bundles,
  faqItems as mockFaqItems,
  getBundleById,
  getLegalPage,
  getProductBySlug as getMockProductBySlug,
  homeFeaturedProducts as mockFeaturedProducts,
  legalPages as mockLegalPages,
  products as mockProducts,
  siteSections as mockSiteSections,
  testimonials as mockTestimonials,
} from "@/data/mock-store";
import { hasSupabaseEnv } from "@/lib/env";
import { formatCurrency } from "@/lib/format";
import { normalizeCoverImageOpacity } from "@/lib/product";
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server";
import { createProductCoverSignedUrl } from "@/lib/supabase/storage";
import type { Tables } from "@/types/database.types";

type CategoryRow = Pick<Tables<"categories">, "id" | "name" | "slug">;

type ProductRow = Tables<"products"> & {
  categories: CategoryRow | null;
};

type ProductPreviewRow = Tables<"product_previews">;

type ProductSourceRow = Tables<"product_sources"> & {
  products: Pick<
    Tables<"products">,
    "id" | "name" | "slug" | "status" | "pipeline_status"
  > | null;
};

type LibraryRow = Tables<"library_items"> & {
  products: Pick<
    Tables<"products">,
    | "id"
    | "slug"
    | "name"
    | "short_description"
    | "format"
    | "file_path"
    | "cover_path"
    | "cover_gradient"
    | "cover_image_opacity"
    | "updated_at"
  > & {
    categories: Pick<Tables<"categories">, "name" | "slug"> | null;
  };
};

type LibraryItemRow = Pick<
  Tables<"library_items">,
  "id" | "created_at" | "download_count" | "last_downloaded_at" | "product_id"
>;

type LibraryAccessRow = Pick<
  Tables<"library_items">,
  "id" | "created_at" | "download_count" | "last_downloaded_at"
> & {
  products: Pick<
    Tables<"products">,
    "id" | "slug" | "name" | "file_path" | "updated_at"
  > | null;
};

type AdminOrderRow = Tables<"orders"> & {
  profiles: Pick<Tables<"profiles">, "email" | "full_name"> | null;
  order_items: Array<Pick<Tables<"order_items">, "product_name">>;
};

type AccountOrderRow = Pick<
  Tables<"orders">,
  "id" | "status" | "total" | "created_at"
>;

type AccountOrderItemRow = Pick<
  Tables<"order_items">,
  "id" | "product_id" | "product_name" | "quantity" | "unit_price"
>;

type AccountOrderDetailsRow = Pick<
  Tables<"orders">,
  "id" | "status" | "total" | "subtotal" | "currency" | "created_at"
> & {
  order_items: AccountOrderItemRow[];
};

type AccountOrderProductRow = Pick<
  Tables<"products">,
  "id" | "slug" | "short_description" | "format" | "file_path"
> & {
  categories: Pick<Tables<"categories">, "name"> | null;
};

type AdminProductSourceStatus = "unattached" | "draft" | "published";

type AdminProductSourceSummary = {
  id: string;
  title: string;
};

type AdminProductSnapshot = {
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
  coverImageOpacity: number;
  includes: string[];
  heroNote: string;
  badge: ProductBadge | null;
  status: ProductStatus;
  pipelineStatus: ProductPipelineStatus;
  bestseller: boolean;
  featured: boolean;
  sortOrder: number;
  featuredOrder: number;
  isActive: boolean;
  coverPath: string | null;
  coverImageUrl: string | null;
  filePath: string | null;
  hasCover: boolean;
  hasFile: boolean;
  isVisibleOnStorefront: boolean;
  linkedSource: AdminProductSourceSummary | null;
  previews: Array<{
    id: string;
    storagePath: string;
    altText: string;
    sortOrder: number;
    imageUrl: string | null;
  }>;
};

type AdminProductSourceSnapshot = {
  id: string;
  driveFileId: string;
  title: string;
  mimeType: string;
  driveUrl: string;
  sourceStage: string;
  modifiedAt: string | null;
  status: AdminProductSourceStatus;
  linkedProduct:
    | {
        id: string;
        name: string;
        slug: string;
        status: ProductStatus;
        pipelineStatus: ProductPipelineStatus;
      }
    | null;
};

export type LibraryItemSnapshot = {
  id: string;
  createdAt: string;
  downloadCount: number;
  lastDownloadedAt: string | null;
  productId: string;
  slug: string;
  name: string;
  shortDescription: string;
  format: string;
  category: Category;
  filePath: string | null;
  coverImageUrl: string | null;
  coverGradient: string;
  coverImageOpacity: number;
  updateLabel: "Nowość" | "Zaktualizowano" | null;
};

export type LibrarySnapshotResult = {
  items: LibraryItemSnapshot[];
  error: string | null;
};

export type OwnedProductAccessSnapshot = {
  libraryItemId: string;
  productId: string;
  slug: string;
  filePath: string | null;
  createdAt: string;
  updatedAt: string | null;
  downloadCount: number;
  lastDownloadedAt: string | null;
  updateLabel: "Nowość" | "Zaktualizowano" | null;
};

export type AccountOrderDetailsSnapshot = {
  id: string;
  status: string;
  total: number;
  subtotal: number;
  currency: string;
  createdAt: string;
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    slug: string | null;
    shortDescription: string;
    format: string;
    category: Category;
    filePath: string | null;
  }>;
};

const SECTION_ORDER = [
  "hero",
  "featured",
  "use-cases",
  "why-templify",
  "how-it-works",
  "faq",
] as const;

const mockProductsBySlug = new Map(
  mockProducts.map((product) => [product.slug, product] as const),
);

function normalizeCategory(value: string | null | undefined): Category {
  const normalizedValue = value?.trim();
  return normalizedValue || CATEGORY_OPTIONS[0];
}

function logAdminStoreError(
  scope: string,
  error: unknown,
  context?: Record<string, unknown>,
) {
  if (
    error instanceof Error &&
    error.message.includes("Dynamic server usage")
  ) {
    return;
  }

  console.error(`[admin-store:${scope}]`, {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...context,
  });
}

function getSingleRelation<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function normalizeText(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

function normalizeNullableText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function normalizeStringList(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string" && item.length > 0);
}

function normalizeNumber(value: unknown, fallback = 0) {
  const normalizedValue =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;

  return Number.isFinite(normalizedValue) ? normalizedValue : fallback;
}

function normalizeInteger(value: unknown, fallback = 0) {
  return Math.max(0, Math.trunc(normalizeNumber(value, fallback)));
}

function normalizeBoolean(value: unknown) {
  return value === true;
}

function isPublicStorefrontProduct(input: {
  status: unknown;
  isActive: unknown;
  slug?: unknown;
}) {
  return (
    normalizeProductStatus(input.status) === "published" &&
    normalizeBoolean(input.isActive) &&
    normalizeText(input.slug).length > 0
  );
}

const STOREFRONT_MAX_SLUG_LENGTH = 80;
const STOREFRONT_MAX_NAME_LENGTH = 120;

function looksLikeJunkProduct(input: {
  slug?: unknown;
  name?: unknown;
}) {
  const slug = normalizeText(input.slug);
  const name = normalizeText(input.name);

  if (slug.length > STOREFRONT_MAX_SLUG_LENGTH) return true;
  if (name.length > STOREFRONT_MAX_NAME_LENGTH) return true;
  if (/(.)\1{9,}/.test(slug)) return true;
  if (/(.)\1{14,}/.test(name)) return true;

  return false;
}

function normalizeProductStatus(value: unknown): ProductStatus {
  return typeof value === "string" &&
    (PRODUCT_STATUSES as readonly string[]).includes(value)
    ? (value as ProductStatus)
    : "draft";
}

function normalizePipelineStatus(value: unknown): ProductPipelineStatus {
  return typeof value === "string" &&
    (PRODUCT_PIPELINE_STATUSES as readonly string[]).includes(value)
    ? (value as ProductPipelineStatus)
    : "working";
}

function getLibraryActivityBadge(
  purchasedAt: string | null | undefined,
  updatedAt: string | null | undefined,
) {
  const purchasedDate = purchasedAt ? new Date(purchasedAt) : null;
  const updatedDate = updatedAt ? new Date(updatedAt) : null;
  const now = new Date();

  if (
    purchasedDate &&
    !Number.isNaN(purchasedDate.getTime()) &&
    now.getTime() - purchasedDate.getTime() <= 1000 * 60 * 60 * 24 * 10
  ) {
    return "Nowość" as const;
  }

  if (
    purchasedDate &&
    updatedDate &&
    !Number.isNaN(purchasedDate.getTime()) &&
    !Number.isNaN(updatedDate.getTime()) &&
    updatedDate.getTime() - purchasedDate.getTime() > 1000 * 60 * 60 * 24
  ) {
    return "Zaktualizowano" as const;
  }

  return null;
}

async function mapProductRow(
  row: ProductRow,
  previews: ProductPreviewRow[] = [],
  includeAssets = false,
): Promise<Product> {
  const category = getSingleRelation(row.categories);
  const [coverImageUrl, mappedPreviews] = includeAssets
    ? await Promise.all([
        normalizeText(row.cover_path)
          ? createProductCoverSignedUrl(normalizeText(row.cover_path))
          : null,
        Promise.all(
          previews.map(async (preview) => ({
            id: preview.id,
            imageUrl: normalizeText(preview.storage_path)
              ? await createProductCoverSignedUrl(normalizeText(preview.storage_path))
              : null,
            altText: normalizeText(preview.alt_text),
          })),
        ),
      ])
    : [null, []];

  const polishOverride = mockProductsBySlug.get(row.slug);

  return {
    id: row.id,
    slug: normalizeText(row.slug, row.id),
    name: polishOverride?.name ?? normalizeText(row.name, "Bez nazwy produktu"),
    category: normalizeCategory(category?.name),
    shortDescription:
      polishOverride?.shortDescription ??
      normalizeText(row.short_description, "Brak krótkiego opisu."),
    description: polishOverride?.description ?? normalizeText(row.description),
    price: normalizeNumber(row.price),
    compareAtPrice: normalizeNullableText(String(row.compare_at_price ?? "")) === null
      ? undefined
      : normalizeNumber(row.compare_at_price),
    // DB wins for format so admin-driven values like "Ebook" / "Planer"
    // surface even when mock-store.ts still ships a stale "HTML" override.
    format: normalizeText(row.format, polishOverride?.format ?? "Brak formatu"),
    pages: normalizeInteger(row.pages),
    tags: polishOverride?.tags ?? normalizeStringList(row.tags),
    rating: normalizeNumber(row.rating),
    salesLabel: polishOverride?.salesLabel ?? normalizeText(row.sales_label),
    accent: normalizeText(row.accent),
    coverGradient: normalizeText(row.cover_gradient),
    // `normalizeCoverImageOpacity` guards against `undefined` at runtime so we
    // stay compatible with older environments where migration
    // 20260422130000 hasn't been applied yet and the column is missing from
    // the PostgREST response.
    coverImageOpacity: normalizeCoverImageOpacity(row.cover_image_opacity),
    includes: polishOverride?.includes ?? normalizeStringList(row.includes),
    heroNote: polishOverride?.heroNote ?? normalizeText(row.hero_note),
    badge: (row.badge as ProductBadge | null) ?? null,
    status: normalizeProductStatus(row.status),
    bestseller: normalizeBoolean(row.bestseller),
    featured: normalizeBoolean(row.featured),
    coverImageUrl,
    previews: mappedPreviews,
    filePath: normalizeNullableText(row.file_path),
  };
}

function sortSections(sections: SiteSectionContent[]) {
  return [...sections].sort((left, right) => {
    const leftIndex = SECTION_ORDER.indexOf(left.key as (typeof SECTION_ORDER)[number]);
    const rightIndex = SECTION_ORDER.indexOf(
      right.key as (typeof SECTION_ORDER)[number],
    );

    if (leftIndex === -1 && rightIndex === -1) {
      return left.key.localeCompare(right.key, "pl");
    }

    if (leftIndex === -1) {
      return 1;
    }

    if (rightIndex === -1) {
      return -1;
    }

    return leftIndex - rightIndex;
  });
}

async function getProductPreviewsMap(productIds: string[]) {
  const supabase = await createSupabaseServerClient();

  if (!supabase || productIds.length === 0) {
    return new Map<string, ProductPreviewRow[]>();
  }

  const { data, error } = await supabase
    .from("product_previews")
    .select("*")
    .in("product_id", productIds)
    .order("sort_order", { ascending: true });

  if (error || !data) {
    return new Map<string, ProductPreviewRow[]>();
  }

  return data.reduce((map, preview) => {
    const existing = map.get(preview.product_id) ?? [];
    existing.push(preview);
    map.set(preview.product_id, existing);
    return map;
  }, new Map<string, ProductPreviewRow[]>());
}

async function getProductSourceByProductIdMap(productIds: string[]) {
  const supabase = await createSupabaseServerClient();

  if (!supabase || productIds.length === 0) {
    return new Map<string, AdminProductSourceSummary>();
  }

  try {
    const { data, error } = await supabase
      .from("product_sources")
      .select("id, title, product_id")
      .in("product_id", productIds);

    if (error || !data) {
      if (error) {
        logAdminStoreError("product-sources-map-query", error, {
          productIdsCount: productIds.length,
        });
      }

      return new Map<string, AdminProductSourceSummary>();
    }

    return data.reduce((map, source) => {
      const productId = normalizeNullableText(source.product_id);

      if (!productId || map.has(productId)) {
        return map;
      }

      map.set(productId, {
        id: source.id,
        title: normalizeText(source.title, "Bez nazwy źródła"),
      });

      return map;
    }, new Map<string, AdminProductSourceSummary>());
  } catch (error) {
    logAdminStoreError("product-sources-map", error, {
      productIdsCount: productIds.length,
    });
    return new Map<string, AdminProductSourceSummary>();
  }
}

export async function getCategoryFilterOptions() {
  if (!hasSupabaseEnv()) {
    return [...CATEGORY_OPTIONS];
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [...CATEGORY_OPTIONS];
  }

  const { data, error } = await supabase
    .from("categories")
    .select("name")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error || !data || data.length === 0) {
    return [...CATEGORY_OPTIONS];
  }

  return data.map((category) => normalizeCategory(category.name));
}

export async function getStoreProducts(category?: string) {
  if (!hasSupabaseEnv()) {
    return category
      ? mockProducts.filter((product) => product.category === category)
      : mockProducts;
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return category
      ? mockProducts.filter((product) => product.category === category)
      : mockProducts;
  }

  let query = supabase
    .from("products")
    .select("*, categories(id, name, slug)")
    .eq("status", "published")
    .eq("is_active", true)
    .order("featured_order", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (category) {
    const { data: categoryRecord } = await supabase
      .from("categories")
      .select("id")
      .eq("name", category)
      .eq("is_active", true)
      .maybeSingle();

    if (!categoryRecord) {
      return [];
    }

    query = query.eq("category_id", categoryRecord.id);
  }

  const { data, error } = await query;

  if (error || !data || data.length === 0) {
    return category
      ? mockProducts.filter((product) => product.category === category)
      : mockProducts;
  }

  const filteredRows = (data as ProductRow[]).filter(
    (row) => !looksLikeJunkProduct({ slug: row.slug, name: row.name }),
  );

  return Promise.all(filteredRows.map((row) => mapProductRow(row)));
}

export async function getFeaturedStoreProducts(limit = 4) {
  const products = await getStoreProducts();
  return products.filter((product) => product.featured).slice(0, limit);
}

export async function getBestsellerStoreProducts(limit = 3) {
  const products = await getStoreProducts();
  return products.filter((product) => product.bestseller).slice(0, limit);
}

export async function getNewArrivalStoreProducts(limit = 3) {
  const products = await getStoreProducts();
  const withNewBadge = products.filter((product) => product.badge === "new");

  if (withNewBadge.length > 0) {
    return withNewBadge.slice(0, limit);
  }

  // Fallback: if nothing is explicitly marked as new, surface featured
  // products that aren't bestsellers so the section doesn't collapse. The
  // homepage layout always reserves space for this block, so returning an
  // empty array would leave a visible hole instead of a useful lineup.
  return products
    .filter((product) => product.featured && !product.bestseller)
    .slice(0, limit);
}

export async function getStoreProductsByCategory(
  category: string,
  limit = 3,
) {
  const products = await getStoreProducts(category);
  return products.slice(0, limit);
}

export async function getStoreProductBySlug(slug: string) {
  if (!hasSupabaseEnv()) {
    return getMockProductBySlug(slug);
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return getMockProductBySlug(slug);
  }

  const { data, error } = await supabase
    .from("products")
    .select("*, categories(id, name, slug)")
    .eq("slug", slug)
    .eq("status", "published")
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) {
    return getMockProductBySlug(slug);
  }

  if (looksLikeJunkProduct({ slug: data.slug, name: data.name })) {
    return null;
  }

  const previewsMap = await getProductPreviewsMap([data.id]);
  return mapProductRow(data as ProductRow, previewsMap.get(data.id) ?? [], true);
}

export async function getOwnedProductBySlug(userId: string, slug: string) {
  if (!hasSupabaseEnv()) {
    return getMockProductBySlug(slug);
  }

  const supabase = await createSupabaseServerClient();
  const adminSupabase = createSupabaseAdminClient();

  if (!supabase || !adminSupabase) {
    return null;
  }

  const { data: basicProduct, error: basicProductError } = await adminSupabase
    .from("products")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (basicProductError || !basicProduct) {
    return null;
  }

  const { data: libraryItem, error: libraryError } = await supabase
    .from("library_items")
    .select("id")
    .eq("user_id", userId)
    .eq("product_id", basicProduct.id)
    .maybeSingle();

  if (libraryError || !libraryItem) {
    return null;
  }

  const { data: product, error: productError } = await adminSupabase
    .from("products")
    .select("*, categories(id, name, slug)")
    .eq("id", basicProduct.id)
    .maybeSingle();

  if (productError || !product) {
    return null;
  }

  const previewsMap = await getProductPreviewsMap([product.id]);
  return mapProductRow(product as ProductRow, previewsMap.get(product.id) ?? [], true);
}

export async function getRelatedStoreProducts(product: Product, limit = 3) {
  const products = await getStoreProducts(product.category);

  return products
    .filter((candidate) => candidate.id !== product.id)
    .slice(0, limit);
}

// Returns the set of product ids owned by `userId` (or empty when the
// user is anonymous / Supabase env is missing). Cheap single-column
// query — meant to be called once per server render and passed down
// into ProductCard as `isOwned` so the card can swap its CTA.
export async function getOwnedProductIds(
  userId: string | null | undefined,
): Promise<Set<string>> {
  if (!userId) return new Set();
  const supabase = await createSupabaseServerClient();
  if (!supabase) return new Set();
  const { data, error } = await supabase
    .from("library_items")
    .select("product_id")
    .eq("user_id", userId);
  if (error || !data) return new Set();
  return new Set(data.map((row) => row.product_id));
}

// Cross-sell helper for the post-purchase page: return up to `limit`
// products that share a category with anything the buyer just paid for,
// excluding products they already own. Falls back to the latest
// products if no category match is left.
export async function getRecommendedProducts(
  ownedIds: Set<string>,
  basisProductIds: string[],
  limit = 3,
): Promise<Product[]> {
  const all = await getStoreProducts();
  const basis = all.filter((p) => basisProductIds.includes(p.id));
  const categories = new Set(basis.map((p) => p.category));
  const sameCategory = all.filter(
    (p) => categories.has(p.category) && !ownedIds.has(p.id),
  );
  if (sameCategory.length >= limit) return sameCategory.slice(0, limit);
  // Top up with anything else we don't own yet, preserving uniqueness.
  const seen = new Set(sameCategory.map((p) => p.id));
  const fillers = all.filter((p) => !ownedIds.has(p.id) && !seen.has(p.id));
  return [...sameCategory, ...fillers].slice(0, limit);
}

export async function getSiteSectionsSnapshot() {
  return sortSections(mockSiteSections);
}

export async function getFaqSnapshot() {
  return mockFaqItems.map((faq) =>
    faq.id === "faq-06"
      ? {
          ...faq,
          answer:
            "Po zakupie wysyłamy potwierdzenie zamówienia na e-mail. Jeśli potrzebujesz danych do dokumentu zakupu, napisz do nas po zakupie na kontakt@templify.store.",
        }
      : faq,
  );
}

export async function getTestimonialsSnapshot() {
  return mockTestimonials;
}

export async function getContentPageBySlug(slug: string) {
  if (!hasSupabaseEnv()) {
    return getLegalPage(slug) ?? null;
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return getLegalPage(slug) ?? null;
  }

  const { data, error } = await supabase
    .from("content_pages")
    .select("slug, title, description, body")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error || !data) {
    return getLegalPage(slug) ?? null;
  }

  return data as ContentPage;
}

export async function getLegalPagesSnapshot() {
  if (!hasSupabaseEnv()) {
    return mockLegalPages;
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return mockLegalPages;
  }

  const { data, error } = await supabase
    .from("content_pages")
    .select("slug, title, description, body")
    .eq("is_published", true)
    .order("slug", { ascending: true });

  if (error || !data || data.length === 0) {
    return mockLegalPages;
  }

  return data as ContentPage[];
}

export async function getAccountSnapshot(userId: string) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const [{ data: profile }, { data: orders }, { count: libraryCount }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase
        .from("orders")
        .select("id, status, total, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("library_items")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId),
    ]);

  return {
    profile,
    orders: (orders ?? []) as AccountOrderRow[],
    libraryCount: libraryCount ?? 0,
  };
}

export async function getLibrarySnapshot(userId: string): Promise<LibrarySnapshotResult> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      items: [],
      error: "Brak konfiguracji Supabase.",
    };
  }

  const { data, error } = await supabase
    .from("library_items")
    .select(
      "id, created_at, download_count, last_downloaded_at, products!inner(id, slug, name, short_description, format, file_path, cover_path, cover_gradient, updated_at, categories(name, slug))",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return {
      items: [],
      error: error?.message ?? "Nie udało się pobrać biblioteki.",
    };
  }

  const seenProductIds = new Set<string>();
  const items = await Promise.all(
    (data as LibraryRow[])
      .filter((item) => {
        if (seenProductIds.has(item.products.id)) {
          return false;
        }

        seenProductIds.add(item.products.id);
        return true;
      })
      .map(async (item) => ({
        id: item.id,
        createdAt: item.created_at,
        downloadCount: item.download_count,
        lastDownloadedAt: item.last_downloaded_at,
        productId: item.products.id,
        slug: item.products.slug,
        name: item.products.name,
        shortDescription: item.products.short_description,
        format: item.products.format,
        category: normalizeCategory(item.products.categories?.name),
        filePath: item.products.file_path,
        coverImageUrl: item.products.cover_path
          ? await createProductCoverSignedUrl(item.products.cover_path)
          : null,
        coverGradient: normalizeText(
          item.products.cover_gradient,
          "from-[#fbf5ea] via-[#f4ead9] to-[#e4c58d]",
        ),
        coverImageOpacity: normalizeCoverImageOpacity(
          item.products.cover_image_opacity,
        ),
        updateLabel: getLibraryActivityBadge(
          item.created_at,
          item.products.updated_at,
        ),
      })),
  );

  return {
    items,
    error: null,
  };
}

export async function getOwnedProductAccess(
  userId: string,
  productId: string,
): Promise<OwnedProductAccessSnapshot | null> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("library_items")
    .select(
      "id, created_at, download_count, last_downloaded_at, products!inner(id, slug, name, file_path, updated_at)",
    )
    .eq("user_id", userId)
    .eq("product_id", productId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const item = data as LibraryAccessRow;

  if (!item.products) {
    return null;
  }

  return {
    libraryItemId: item.id,
    productId: item.products.id,
    slug: item.products.slug,
    filePath: item.products.file_path,
    createdAt: item.created_at,
    updatedAt: item.products.updated_at,
    downloadCount: item.download_count,
    lastDownloadedAt: item.last_downloaded_at,
    updateLabel: getLibraryActivityBadge(item.created_at, item.products.updated_at),
  };
}

export async function getCustomerLibrarySnapshot(
  userId: string,
): Promise<LibrarySnapshotResult> {
  const supabase = await createSupabaseServerClient();
  const adminSupabase = createSupabaseAdminClient();

  if (!supabase || !adminSupabase) {
    return {
      items: [],
      error: "Brak konfiguracji Supabase.",
    };
  }

  try {
    const { data, error } = await supabase
      .from("library_items")
      .select("id, created_at, download_count, last_downloaded_at, product_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error || !data) {
      return {
        items: [],
        error: error?.message ?? "Nie udało się pobrać biblioteki.",
      };
    }

    const libraryRows = data as LibraryItemRow[];
    const seenProductIds = new Set<string>();
    const orderedProductIds = libraryRows
      .map((item) => item.product_id)
      .filter((productId) => {
        if (!productId || seenProductIds.has(productId)) {
          return false;
        }

        seenProductIds.add(productId);
        return true;
      });

    if (orderedProductIds.length === 0) {
      return {
        items: [],
        error: null,
      };
    }

    const { data: products, error: productsError } = await adminSupabase
      .from("products")
      .select(
        "id, slug, name, short_description, format, file_path, cover_path, cover_gradient, updated_at, categories(name, slug)",
      )
      .in("id", orderedProductIds);

    if (productsError || !products) {
      return {
        items: [],
        error:
          productsError?.message ??
          "Nie udało się pobrać produktów z biblioteki.",
      };
    }

    const productsById = new Map(
      (products as Array<LibraryRow["products"]>).map((product) => [
        product.id,
        product,
      ]),
    );

    const items = await Promise.all(
      libraryRows
        .filter((item, index, rows) => {
          if (!item.product_id || !productsById.has(item.product_id)) {
            return false;
          }

          return rows.findIndex((row) => row.product_id === item.product_id) === index;
        })
        .map(async (item) => {
          const product = productsById.get(item.product_id);

          if (!product) {
            return null;
          }

          const category = getSingleRelation(product.categories);

          return {
            id: item.id,
            createdAt: item.created_at,
            downloadCount: item.download_count,
            lastDownloadedAt: item.last_downloaded_at,
            productId: product.id,
            slug: normalizeText(product.slug, product.id),
            name: normalizeText(product.name, "Produkt z biblioteki"),
            shortDescription: normalizeText(
              product.short_description,
              "Kupiony produkt cyfrowy dostępny na Twoim koncie.",
            ),
            format: normalizeText(product.format, "Plik cyfrowy"),
            category: normalizeCategory(category?.name),
            filePath: normalizeNullableText(product.file_path),
            coverImageUrl: product.cover_path
              ? await createProductCoverSignedUrl(product.cover_path)
              : null,
            coverGradient: normalizeText(
              product.cover_gradient,
              "from-[#fbf5ea] via-[#f4ead9] to-[#e4c58d]",
            ),
            coverImageOpacity: normalizeCoverImageOpacity(
              product.cover_image_opacity,
            ),
            updateLabel: getLibraryActivityBadge(item.created_at, product.updated_at),
          };
        }),
    );

    return {
      items: items.filter((item): item is LibraryItemSnapshot => Boolean(item)),
      error: null,
    };
  } catch (error) {
    logAdminStoreError("customer-library", error, { userId });

    return {
      items: [],
      error: "Nie udało się pobrać biblioteki.",
    };
  }
}

export async function getCustomerOwnedProductAccess(
  userId: string,
  productId: string,
): Promise<OwnedProductAccessSnapshot | null> {
  const supabase = await createSupabaseServerClient();
  const adminSupabase = createSupabaseAdminClient();

  if (!supabase || !adminSupabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("library_items")
    .select("id, created_at, download_count, last_downloaded_at, product_id")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const item = data as LibraryItemRow;
  const { data: product, error: productError } = await adminSupabase
    .from("products")
    .select("id, slug, file_path, updated_at")
    .eq("id", item.product_id)
    .maybeSingle();

  if (productError || !product) {
    return null;
  }

  return {
    libraryItemId: item.id,
    productId: product.id,
    slug: product.slug,
    filePath: product.file_path,
    createdAt: item.created_at,
    updatedAt: product.updated_at,
    downloadCount: item.download_count,
    lastDownloadedAt: item.last_downloaded_at,
    updateLabel: getLibraryActivityBadge(item.created_at, product.updated_at),
  };
}

export async function getAccountOrderDetails(
  userId: string,
  orderId: string,
): Promise<AccountOrderDetailsSnapshot | null> {
  const supabase = await createSupabaseServerClient();
  const adminSupabase = createSupabaseAdminClient();

  if (!supabase || !adminSupabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, status, total, subtotal, currency, created_at, order_items(id, product_id, product_name, quantity, unit_price)",
    )
    .eq("user_id", userId)
    .eq("id", orderId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const order = data as AccountOrderDetailsRow;
  const productIds = order.order_items.map((item) => item.product_id);
  const { data: products } =
    productIds.length > 0
      ? await adminSupabase
          .from("products")
          .select("id, slug, short_description, format, file_path, categories(name)")
          .in("id", productIds)
      : { data: [] };

  const productsById = new Map(
    ((products ?? []) as AccountOrderProductRow[]).map((product) => [
      product.id,
      product,
    ]),
  );

  return {
    id: order.id,
    status: order.status,
    total: normalizeNumber(order.total),
    subtotal: normalizeNumber(order.subtotal),
    currency: normalizeText(order.currency, "PLN"),
    createdAt: order.created_at,
    items: order.order_items.map((item) => {
      const product = productsById.get(item.product_id);
      const category = product ? getSingleRelation(product.categories) : null;

      return {
        id: item.id,
        productId: item.product_id,
        productName: normalizeText(item.product_name, "Produkt cyfrowy"),
        quantity: normalizeInteger(item.quantity, 1),
        unitPrice: normalizeNumber(item.unit_price),
        slug: product ? normalizeText(product.slug, product.id) : null,
        shortDescription: product
          ? normalizeText(product.short_description)
          : "Produkt z zamówienia.",
        format: product ? normalizeText(product.format, "Plik cyfrowy") : "Plik cyfrowy",
        category: normalizeCategory(category?.name),
        filePath: product ? normalizeNullableText(product.file_path) : null,
      };
    }),
  };
}

export async function getAdminDashboardSnapshot() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      productCount: 0,
      draftCount: 0,
      readyToPublishCount: 0,
      publishedCount: 0,
      unattachedSourceCount: 0,
      orderCount: 0,
      revenue: formatCurrency(0),
      contentCount: 0,
      adminCount: 0,
    };
  }

  try {
    const [
      { count: productCount },
      { count: draftCount },
      { count: readyToPublishCount },
      { count: publishedCount },
      { count: unattachedSourceCount },
      { count: orderCount },
      { data: totals, error: totalsError },
      { count: contentCount },
      { count: adminCount },
    ] = await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("status", "draft"),
      supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("pipeline_status", "ready"),
      supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("status", "published"),
      supabase
        .from("product_sources")
        .select("*", { count: "exact", head: true })
        .is("product_id", null),
      supabase.from("orders").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("total"),
      supabase.from("content_pages").select("*", { count: "exact", head: true }),
      supabase
        .from("admin_allowlist")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true),
    ]);

    if (totalsError) {
      logAdminStoreError("admin-dashboard-totals", totalsError);
    }

    const revenueTotal = Array.isArray(totals)
      ? totals.reduce((sum, order) => sum + normalizeNumber(order.total), 0)
      : 0;

    return {
      productCount: normalizeInteger(productCount),
      draftCount: normalizeInteger(draftCount),
      readyToPublishCount: normalizeInteger(readyToPublishCount),
      publishedCount: normalizeInteger(publishedCount),
      unattachedSourceCount: normalizeInteger(unattachedSourceCount),
      orderCount: normalizeInteger(orderCount),
      revenue: formatCurrency(revenueTotal),
      contentCount: normalizeInteger(contentCount),
      adminCount: normalizeInteger(adminCount),
    };
  } catch (error) {
    logAdminStoreError("admin-dashboard", error);

    return {
      productCount: 0,
      draftCount: 0,
      readyToPublishCount: 0,
      publishedCount: 0,
      unattachedSourceCount: 0,
      orderCount: 0,
      revenue: formatCurrency(null),
      contentCount: 0,
      adminCount: 0,
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getAdminProductsSnapshotLegacy() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      products: [] as AdminProductSnapshot[],
      summary: {
        total: 0,
        draftCount: 0,
        readyCount: 0,
        publishedCount: 0,
        missingSourceCount: 0,
      },
      error: "Brak konfiguracji Supabase.",
    };
  }

  const { data, error } = await supabase
    .from("products")
    .select(
      "id, slug, name, short_description, description, price, compare_at_price, format, pages, tags, rating, sales_label, accent, cover_gradient, includes, hero_note, badge, status, pipeline_status, bestseller, featured, sort_order, featured_order, is_active, cover_path, file_path, categories(id, name, slug)",
    )
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error || !data) {
    return {
      products: [] as AdminProductSnapshot[],
      error: error?.message ?? "Nie udało się pobrać produktów.",
    };
  }

  const previewsMap = await getProductPreviewsMap(data.map((product) => product.id));

  return {
    products: await Promise.all(
      data.map(async (product) => {
        const previews = previewsMap.get(product.id) ?? [];
        return {
          id: product.id,
          slug: product.slug,
          name: product.name,
          shortDescription: product.short_description,
          description: product.description,
          price: product.price,
          compareAtPrice: product.compare_at_price,
          category: normalizeCategory(product.categories?.name),
          categoryId: product.categories?.id ?? "",
          format: product.format,
          pages: product.pages,
          tags: product.tags ?? [],
          rating: Number(product.rating),
          salesLabel: product.sales_label,
          accent: product.accent,
          coverGradient: product.cover_gradient,
          includes: product.includes ?? [],
          heroNote: product.hero_note,
          badge: (product.badge as ProductBadge | null) ?? null,
          status: product.status as ProductStatus,
          bestseller: product.bestseller,
          featured: product.featured,
          sortOrder: product.sort_order,
          featuredOrder: product.featured_order,
          isActive: product.is_active,
          coverPath: product.cover_path,
          coverImageUrl: product.cover_path
            ? await createProductCoverSignedUrl(product.cover_path)
            : null,
          filePath: product.file_path,
          previews: await Promise.all(
            previews.map(async (preview) => ({
              id: preview.id,
              storagePath: preview.storage_path,
              altText: preview.alt_text,
              sortOrder: preview.sort_order,
              imageUrl: await createProductCoverSignedUrl(preview.storage_path),
            })),
          ),
        };
      }),
    ),
    error: null,
  };
}

async function getAdminProductsSnapshotUnsafe(filters?: {
  status?: string;
  pipelineStatus?: string;
  categoryId?: string;
}) {
  const supabase = await createSupabaseServerClient();

  const emptySummary = {
    total: 0,
    draftCount: 0,
    readyCount: 0,
    publishedCount: 0,
    missingSourceCount: 0,
  };

  if (!supabase) {
    return {
      products: [] as AdminProductSnapshot[],
      summary: emptySummary,
      error: "Brak konfiguracji Supabase.",
    };
  }

  const { data, error } = await supabase
    .from("products")
    .select(
      "id, slug, name, short_description, description, price, compare_at_price, format, pages, tags, rating, sales_label, accent, cover_gradient, includes, hero_note, badge, status, pipeline_status, bestseller, featured, sort_order, featured_order, is_active, cover_path, file_path, categories(id, name, slug)",
    )
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error || !data) {
    return {
      products: [] as AdminProductSnapshot[],
      summary: emptySummary,
      error: error?.message ?? "Nie udało się pobrać produktów.",
    };
  }

  const productIds = data.map((product) => product.id);
  const [previewsMap, sourceByProductId] = await Promise.all([
    getProductPreviewsMap(productIds),
    getProductSourceByProductIdMap(productIds),
  ]);

  const products = await Promise.all(
    data.map(async (product) => {
      const previews = previewsMap.get(product.id) ?? [];
      const linkedSource = sourceByProductId.get(product.id) ?? null;

      return {
        id: product.id,
        slug: product.slug,
        name: product.name,
        shortDescription: product.short_description,
        description: product.description,
        price: product.price,
        compareAtPrice: product.compare_at_price,
        category: normalizeCategory(product.categories?.name),
        categoryId: product.categories?.id ?? "",
        format: product.format,
        pages: product.pages,
        tags: product.tags ?? [],
        rating: Number(product.rating),
        salesLabel: product.sales_label,
        accent: product.accent,
        coverGradient: product.cover_gradient,
        coverImageOpacity: normalizeCoverImageOpacity(
          (product as { cover_image_opacity?: number | null }).cover_image_opacity,
        ),
        includes: product.includes ?? [],
        heroNote: product.hero_note,
        badge: (product.badge as ProductBadge | null) ?? null,
        status: product.status as ProductStatus,
        pipelineStatus: product.pipeline_status as ProductPipelineStatus,
        bestseller: product.bestseller,
        featured: product.featured,
        sortOrder: product.sort_order,
        featuredOrder: product.featured_order,
        isActive: product.is_active,
        coverPath: product.cover_path,
        coverImageUrl: product.cover_path
          ? await createProductCoverSignedUrl(product.cover_path)
          : null,
        filePath: product.file_path,
        hasCover: Boolean(product.cover_path),
        hasFile: Boolean(product.file_path),
        isVisibleOnStorefront: isPublicStorefrontProduct({
          status: product.status,
          isActive: product.is_active,
          slug: product.slug,
        }),
        linkedSource,
        previews: await Promise.all(
          previews.map(async (preview) => ({
            id: preview.id,
            storagePath: preview.storage_path,
            altText: preview.alt_text,
            sortOrder: preview.sort_order,
            imageUrl: await createProductCoverSignedUrl(preview.storage_path),
          })),
        ),
      };
    }),
  );

  const summary = {
    total: products.length,
    draftCount: products.filter((product) => product.status === "draft").length,
    readyCount: products.filter((product) => product.pipelineStatus === "ready").length,
    publishedCount: products.filter((product) => product.status === "published").length,
    missingSourceCount: products.filter((product) => !product.linkedSource).length,
  };

  const filteredProducts = products.filter((product) => {
    if (filters?.status && filters.status !== "all" && product.status !== filters.status) {
      return false;
    }

    if (
      filters?.pipelineStatus &&
      filters.pipelineStatus !== "all" &&
      product.pipelineStatus !== filters.pipelineStatus
    ) {
      return false;
    }

    if (
      filters?.categoryId &&
      filters.categoryId !== "all" &&
      product.categoryId !== filters.categoryId
    ) {
      return false;
    }

    return true;
  });

  return {
    products: filteredProducts,
    summary,
    error: null,
  };
}

export async function getAdminProductsSnapshot(filters?: {
  status?: string;
  pipelineStatus?: string;
  categoryId?: string;
}) {
  const emptySummary = {
    total: 0,
    draftCount: 0,
    readyCount: 0,
    publishedCount: 0,
    missingSourceCount: 0,
  };

  try {
    const snapshot = await getAdminProductsSnapshotUnsafe(filters);

    if (!snapshot || !Array.isArray(snapshot.products)) {
      return {
        products: [] as AdminProductSnapshot[],
        summary: emptySummary,
        error: "Nie udało się wczytać panelu produktów.",
      };
    }

    const safeProducts = await Promise.all(
      snapshot.products.map(async (product) => {
        const coverPath = normalizeNullableText(product.coverPath);
        const filePath = normalizeNullableText(product.filePath);
        const safePreviews = Array.isArray(product.previews) ? product.previews : [];

        return {
          id: normalizeText(product.id),
          slug: normalizeText(product.slug, normalizeText(product.id)),
          name: normalizeText(product.name, "Bez nazwy produktu"),
          shortDescription: normalizeText(
            product.shortDescription,
            "Brak krótkiego opisu.",
          ),
          description: normalizeText(product.description),
          price: normalizeNumber(product.price),
          compareAtPrice:
            product.compareAtPrice === null || product.compareAtPrice === undefined
              ? null
              : normalizeNumber(product.compareAtPrice),
          category: normalizeCategory(product.category),
          categoryId: normalizeText(product.categoryId),
          format: normalizeText(product.format, "Brak formatu"),
          pages: normalizeInteger(product.pages),
          tags: normalizeStringList(product.tags),
          rating: normalizeNumber(product.rating),
          salesLabel: normalizeText(product.salesLabel),
          accent: normalizeText(product.accent),
          coverGradient: normalizeText(product.coverGradient),
          coverImageOpacity: normalizeCoverImageOpacity(product.coverImageOpacity),
          includes: normalizeStringList(product.includes),
          heroNote: normalizeText(product.heroNote),
          badge: product.badge ?? null,
          status: normalizeProductStatus(product.status),
          pipelineStatus: normalizePipelineStatus(product.pipelineStatus),
          bestseller: normalizeBoolean(product.bestseller),
          featured: normalizeBoolean(product.featured),
          sortOrder: normalizeInteger(product.sortOrder),
          featuredOrder: normalizeInteger(product.featuredOrder),
          isActive: normalizeBoolean(product.isActive),
          coverPath,
          coverImageUrl:
            product.coverImageUrl ??
            (coverPath ? await createProductCoverSignedUrl(coverPath) : null),
          filePath,
          hasCover: Boolean(coverPath),
          hasFile: Boolean(filePath),
          isVisibleOnStorefront: isPublicStorefrontProduct({
            status: product.status,
            isActive: product.isActive,
            slug: product.slug,
          }),
          linkedSource: product.linkedSource
            ? {
                id: normalizeText(product.linkedSource.id),
                title: normalizeText(product.linkedSource.title, "Bez nazwy źródła"),
              }
            : null,
          previews: await Promise.all(
            safePreviews.map(async (preview) => {
              const previewPath = normalizeNullableText(preview.storagePath);

              return {
                id: normalizeText(preview.id),
                storagePath: previewPath ?? "",
                altText: normalizeText(preview.altText),
                sortOrder: normalizeInteger(preview.sortOrder),
                imageUrl:
                  preview.imageUrl ??
                  (previewPath ? await createProductCoverSignedUrl(previewPath) : null),
              };
            }),
          ),
        };
      }),
    );

    return {
      products: safeProducts,
      summary: {
        total: normalizeInteger(snapshot.summary?.total),
        draftCount: normalizeInteger(snapshot.summary?.draftCount),
        readyCount: normalizeInteger(snapshot.summary?.readyCount),
        publishedCount: normalizeInteger(snapshot.summary?.publishedCount),
        missingSourceCount: normalizeInteger(snapshot.summary?.missingSourceCount),
      },
      error: snapshot.error ?? null,
    };
  } catch (error) {
    logAdminStoreError("admin-products", error, { filters });

    return {
      products: [] as AdminProductSnapshot[],
      summary: emptySummary,
      error: "Nie udało się wczytać panelu produktów.",
    };
  }
}

async function getAdminProductSourcesSnapshotUnsafe() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      sources: [] as AdminProductSourceSnapshot[],
      error: "Brak konfiguracji Supabase.",
    };
  }

  const { data, error } = await supabase
    .from("product_sources")
    .select(
      "id, drive_file_id, title, mime_type, drive_url, source_stage, modified_at, product_id, products(id, name, slug, status, pipeline_status)",
    )
    .order("modified_at", { ascending: false, nullsFirst: false })
    .order("title", { ascending: true });

  if (error || !data) {
    return {
      sources: [] as AdminProductSourceSnapshot[],
      error: error?.message ?? "Nie udało się pobrać plików źródłowych.",
    };
  }

  return {
    sources: (data as ProductSourceRow[]).map((source) => {
      let status: AdminProductSourceStatus = "unattached";

      if (source.products?.status === "published") {
        status = "published";
      } else if (source.products) {
        status = "draft";
      }

      return {
        id: source.id,
        driveFileId: source.drive_file_id,
        title: source.title,
        mimeType: source.mime_type,
        driveUrl: source.drive_url,
        sourceStage: source.source_stage,
        modifiedAt: source.modified_at,
        status,
        linkedProduct: source.products
          ? {
              id: source.products.id,
              name: source.products.name,
              slug: source.products.slug,
              status: source.products.status as ProductStatus,
              pipelineStatus:
                source.products.pipeline_status as ProductPipelineStatus,
            }
          : null,
      };
    }),
    error: null,
  };
}

export async function getAdminProductSourcesSnapshot() {
  try {
    const snapshot = await getAdminProductSourcesSnapshotUnsafe();

    if (!snapshot || !Array.isArray(snapshot.sources)) {
      return {
        sources: [] as AdminProductSourceSnapshot[],
        error: "Nie udało się wczytać źródeł produktów.",
      };
    }

    return {
      sources: snapshot.sources.map((source) => ({
        id: normalizeText(source.id),
        driveFileId: normalizeText(source.driveFileId),
        title: normalizeText(source.title, "Bez nazwy pliku"),
        mimeType: normalizeText(source.mimeType),
        driveUrl: normalizeText(source.driveUrl),
        sourceStage: normalizeText(source.sourceStage, "planning"),
        modifiedAt: normalizeNullableText(source.modifiedAt),
        status:
          source.status === "draft" || source.status === "published"
            ? source.status
            : "unattached",
        linkedProduct: source.linkedProduct
          ? {
              id: normalizeText(source.linkedProduct.id),
              name: normalizeText(source.linkedProduct.name, "Bez nazwy produktu"),
              slug: normalizeText(source.linkedProduct.slug),
              status: normalizeProductStatus(source.linkedProduct.status),
              pipelineStatus: normalizePipelineStatus(
                source.linkedProduct.pipelineStatus,
              ),
            }
          : null,
      })),
      error: snapshot.error ?? null,
    };
  } catch (error) {
    logAdminStoreError("admin-product-sources", error);

    return {
      sources: [] as AdminProductSourceSnapshot[],
      error: "Nie udało się wczytać źródeł produktów.",
    };
  }
}

export async function getAdminCategoriesSnapshot() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      categories: [],
      error: "Brak konfiguracji Supabase.",
    };
  }

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error || !data) {
    return {
      categories: [],
      error: error?.message ?? "Nie udało się pobrać kategorii.",
    };
  }

  return {
    categories: data.map((category) => ({
      id: category.id,
      slug: category.slug,
      name: category.name,
      description: category.description,
      sortOrder: category.sort_order,
      isActive: category.is_active,
    })),
    error: null,
  };
}

export async function getAdminOrdersSnapshot() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      orders: [],
      error: "Brak konfiguracji Supabase.",
    };
  }

  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, email, status, total, created_at, profiles(full_name, email), order_items(product_name)",
    )
    .order("created_at", { ascending: false });

  if (error || !data) {
    return {
      orders: [],
      error: error?.message ?? "Nie udało się pobrać zamówień.",
    };
  }

  return {
    orders: (data as AdminOrderRow[]).map((order) => ({
      id: order.id,
      customer: order.profiles?.full_name ?? order.email,
      email: order.email,
      amount: order.total,
      status: order.status,
      date: order.created_at,
      items: order.order_items.map((item) => item.product_name),
    })),
    error: null,
  };
}

export async function getAdminContentSnapshot() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      sections: sortSections(
        mockSiteSections.map((section) => ({
          ...section,
          id: section.key,
          isPublished: true,
        })),
      ),
      faqs: mockFaqItems.map((faq, index) => ({
        ...faq,
        sortOrder: index,
        isPublished: true,
      })),
      testimonials: mockTestimonials.map((testimonial, index) => ({
        ...testimonial,
        sortOrder: index,
        isPublished: true,
      })),
      pages: mockLegalPages.map((page) => ({
        ...page,
        id: page.slug,
        isPublished: true,
      })),
      error: "Brak konfiguracji Supabase.",
    };
  }

  const [{ data: sections }, { data: faqs }, { data: testimonials }, { data: pages }] =
    await Promise.all([
      supabase
        .from("site_sections")
        .select("id, section_key, eyebrow, title, description, body, cta_label, cta_href, is_published"),
      supabase
        .from("faq_items")
        .select("id, question, answer, sort_order, is_published")
        .order("sort_order", { ascending: true }),
      supabase
        .from("testimonials")
        .select("id, author, role, quote, score, sort_order, is_published")
        .order("sort_order", { ascending: true }),
      supabase
        .from("content_pages")
        .select("id, slug, title, description, body, is_published")
        .order("slug", { ascending: true }),
    ]);

  return {
    sections: sortSections(
      (sections ?? []).map((section) => ({
        id: section.id,
        key: section.section_key,
        eyebrow: section.eyebrow,
        title: section.title,
        description: section.description,
        body: section.body,
        ctaLabel: section.cta_label,
        ctaHref: section.cta_href,
        isPublished: section.is_published,
      })),
    ),
    faqs: (faqs ?? []).map((faq) => ({
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
      sortOrder: faq.sort_order,
      isPublished: faq.is_published,
    })),
    testimonials: (testimonials ?? []).map((testimonial) => ({
      id: testimonial.id,
      author: testimonial.author,
      role: testimonial.role,
      quote: testimonial.quote,
      score: Number(testimonial.score).toFixed(1),
      sortOrder: testimonial.sort_order,
      isPublished: testimonial.is_published,
    })),
    pages: (pages ?? []).map((page) => ({
      id: page.id,
      slug: page.slug,
      title: page.title,
      description: page.description,
      body: page.body,
      isPublished: page.is_published,
    })),
    error: null,
  };
}

export async function getAdminUsersSnapshot() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      allowlist: [],
      profiles: [],
      error: "Brak konfiguracji Supabase.",
    };
  }

  const [{ data: allowlist }, { data: profiles }] = await Promise.all([
    supabase
      .from("admin_allowlist")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false }),
  ]);

  return {
    allowlist: (allowlist ?? []).map((entry) => ({
      id: entry.id,
      email: entry.email,
      note: entry.note,
      isActive: entry.is_active,
      createdAt: entry.created_at,
    })),
    profiles: (profiles ?? []).map((profile) => ({
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name,
      role: profile.role,
      createdAt: profile.created_at,
    })),
    error: null,
  };
}

export async function getSiteSettingsSnapshot() {
  const defaults = {
    recommendedBundleId: "bundle-01",
    homepageFeaturedLimit: 4,
    businessName: "",
    businessTaxId: "",
    businessAddress: "",
    supportEmail: "kontakt@templify.store",
  };

  if (!hasSupabaseEnv()) {
    return defaults;
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return defaults;
  }

  const { data, error } = await supabase.from("site_settings").select("key, value");

  if (error || !data) {
    return defaults;
  }

  const settingsMap = new Map(data.map((entry) => [entry.key, entry.value]));
  const parsedFeaturedLimit = Number.parseInt(
    settingsMap.get("homepage_featured_limit") ?? String(defaults.homepageFeaturedLimit),
    10,
  );

  return {
    recommendedBundleId:
      settingsMap.get("recommended_bundle_id") ?? defaults.recommendedBundleId,
    homepageFeaturedLimit:
      Number.isFinite(parsedFeaturedLimit) && parsedFeaturedLimit > 0
        ? parsedFeaturedLimit
        : defaults.homepageFeaturedLimit,
    businessName: settingsMap.get("business_name") ?? defaults.businessName,
    businessTaxId: settingsMap.get("business_tax_id") ?? defaults.businessTaxId,
    businessAddress: settingsMap.get("business_address") ?? defaults.businessAddress,
    supportEmail: settingsMap.get("support_email") ?? defaults.supportEmail,
  };
}

export async function getStorefrontSnapshot() {
  const [
    sections,
    settings,
    allProducts,
    featuredProducts,
    bestsellerProducts,
    newArrivalProducts,
    faqs,
    testimonials,
  ] = await Promise.all([
    getSiteSectionsSnapshot(),
    getSiteSettingsSnapshot(),
    getStoreProducts(),
    getFeaturedStoreProducts(),
    getBestsellerStoreProducts(),
    getNewArrivalStoreProducts(),
    getFaqSnapshot(),
    getTestimonialsSnapshot(),
  ]);

  // De-duplicate the "new arrivals" strip against the bestseller strip. If the
  // database has no products explicitly tagged "new", the fallback in
  // getNewArrivalStoreProducts promotes featured-but-not-bestseller items,
  // which can still accidentally overlap when admins haven't separated those
  // flags. Filtering by id keeps the two lanes visually distinct.
  const bestsellerIds = new Set(bestsellerProducts.map((product) => product.id));
  const deduplicatedNewArrivals = newArrivalProducts.filter(
    (product) => !bestsellerIds.has(product.id),
  );

  // Mock products are kept as a last-resort fallback when the database is
  // completely empty (fresh install / preview env without seeds). When the
  // database has real products but admins haven't flagged any as featured or
  // bestseller yet, we promote the real products so the storefront does not
  // advertise mock items that fail at checkout (the checkout API only finds
  // products that exist in Supabase by id).
  const hasRealProducts = allProducts.length > 0;
  const featuredLimit = Math.max(1, settings.homepageFeaturedLimit || 4);

  const resolvedFeatured =
    featuredProducts.length > 0
      ? featuredProducts
      : hasRealProducts
        ? allProducts.slice(0, featuredLimit)
        : mockFeaturedProducts;

  const resolvedBestsellers =
    bestsellerProducts.length > 0
      ? bestsellerProducts
      : hasRealProducts
        ? allProducts.slice(0, 3)
        : mockBestsellers;

  return {
    sections,
    featuredProducts: resolvedFeatured.slice(0, featuredLimit),
    bestsellerProducts: resolvedBestsellers,
    newArrivalProducts: deduplicatedNewArrivals,
    recommendedBundle:
      getBundleById(settings.recommendedBundleId) ?? bundles[0] ?? null,
    faqs,
    testimonials,
  };
}
