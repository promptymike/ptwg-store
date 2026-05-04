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
import type { Bundle } from "@/types/store";

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

export type AdminCouponSnapshot = {
  id: string;
  code: string;
  label: string;
  percentOff: number;
  isActive: boolean;
  redemptionCount: number;
  maxRedemptions: number | null;
  expiresAt: string | null;
  createdAt: string;
};

export type AdminProductMasterSnapshot = {
  existingProducts: Array<{
    id: string;
    slug: string;
    name: string;
    status: ProductStatus;
  }>;
  error: string | null;
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

export type CheckoutOrderBumpSnapshot = {
  product: {
    id: string;
    slug: string;
    name: string;
    category: string;
    shortDescription: string;
    price: number;
    coverGradient: string;
  };
  discountPercent: number;
  originalPrice: number;
  discountedPrice: number;
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
    seoTitle: normalizeNullableText(row.seo_title),
    seoDescription: normalizeNullableText(row.seo_description),
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

function clampOrderBumpPercent(value: unknown, fallback = 20) {
  const parsed =
    typeof value === "number"
      ? value
      : Number.parseInt(typeof value === "string" ? value : "", 10);

  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(Math.trunc(parsed), 1), 80);
}

export async function getCheckoutOrderBumpSnapshot(): Promise<CheckoutOrderBumpSnapshot | null> {
  const [settings, products] = await Promise.all([
    getSiteSettingsSnapshot(),
    getStoreProducts(),
  ]);

  if (!settings.orderBumpEnabled || products.length === 0) {
    return null;
  }

  const configuredProduct = settings.orderBumpProductId
    ? products.find((product) => product.id === settings.orderBumpProductId)
    : null;
  const fallbackProduct =
    products.find((product) => product.bestseller || product.featured) ??
    products[0] ??
    null;
  const product = configuredProduct ?? fallbackProduct;

  if (!product || product.price <= 0) {
    return null;
  }

  const discountPercent = clampOrderBumpPercent(settings.orderBumpPercentOff);
  const discountedPrice = Math.max(
    Math.round(product.price * (1 - discountPercent / 100)),
    0,
  );

  return {
    product: {
      id: product.id,
      slug: product.slug,
      name: product.name,
      category: product.category,
      shortDescription: product.shortDescription,
      price: product.price,
      coverGradient: product.coverGradient,
    },
    discountPercent,
    originalPrice: product.price,
    discountedPrice,
  };
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

// Fetches the live bundle catalogue with each bundle's products fully
// resolved + ordered. Falls back to the empty list when Supabase env is
// missing so the BundlesSection can simply skip rendering instead of
// crashing on a typed null. Caller stays SSR-friendly.
export async function getBundlesSnapshot(): Promise<Bundle[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("bundles")
    .select(
      "id, slug, name, description, price, compare_at_price, accent, perks, sort_order, is_active, bundle_products(position, products(id, slug, name, price, categories(name)))",
    )
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error || !data) return [];

  type BundleRow = {
    id: string;
    slug: string;
    name: string;
    description: string;
    price: number;
    compare_at_price: number | null;
    accent: string | null;
    perks: string[] | null;
    bundle_products?: Array<{
      position: number;
      products?: {
        id: string;
        slug: string;
        name: string;
        price: number;
        categories?: { name?: string | null } | { name?: string | null }[] | null;
      } | null;
    }>;
  };

  return (data as BundleRow[]).map((row) => {
    const linked = (row.bundle_products ?? [])
      .filter((bp) => bp.products)
      .sort((a, b) => a.position - b.position)
      .map((bp) => {
        const product = bp.products!;
        const categoryRel = Array.isArray(product.categories)
          ? product.categories[0]
          : product.categories;
        return {
          id: product.id,
          slug: product.slug,
          name: product.name,
          category: normalizeCategory(categoryRel?.name ?? null),
          price: product.price,
        };
      });

    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description,
      price: row.price,
      compareAtPrice: row.compare_at_price ?? row.price,
      accent: row.accent ?? "from-[#fbf5ea] via-[#f4ead9] to-[#e4c58d]",
      perks: row.perks ?? [],
      productIds: linked.map((p) => p.id),
      products: linked,
    };
  });
}

export type RevenuePoint = {
  date: string;
  orders: number;
  revenue: number;
};

export type TopProductRow = {
  productId: string;
  name: string;
  slug: string;
  unitsSold: number;
  revenue: number;
};

export type AdminTrendsSnapshot = {
  daily: RevenuePoint[];
  topProducts: TopProductRow[];
};

const REVENUE_FUNNEL_EVENTS = [
  "page_view",
  "view_product",
  "add_to_cart",
  "begin_checkout",
  "purchase",
] as const;

export type RevenueFunnelEventName = (typeof REVENUE_FUNNEL_EVENTS)[number];

export type RevenueFunnelMetric = {
  eventName: RevenueFunnelEventName;
  label: string;
  events: number;
  uniqueVisitors: number;
  conversionFromPrevious: number | null;
};

export type RevenueByProductRow = {
  productId: string;
  name: string;
  slug: string;
  unitsSold: number;
  purchases: number;
  revenue: number;
  views: number;
  addToCart: number;
  conversionRate: number | null;
};

export type CampaignRevenueRow = {
  source: string;
  medium: string | null;
  campaign: string | null;
  orders: number;
  revenue: number;
  aov: number;
};

export type ViewsWithoutPurchaseRow = {
  productId: string;
  name: string;
  slug: string;
  views: number;
  addToCart: number;
};

export type AdminRevenueSnapshot = {
  days: number;
  totalRevenue: number;
  orderCount: number;
  purchaseCount: number;
  aov: number;
  refundCount: number;
  refundRate: number | null;
  revenueByProduct: RevenueByProductRow[];
  topProducts: RevenueByProductRow[];
  productsWithViewsNoPurchases: ViewsWithoutPurchaseRow[];
  funnel: RevenueFunnelMetric[];
  revenueByCampaign: CampaignRevenueRow[];
  analyticsAvailable: boolean;
  attributionAvailable: boolean;
  notes: string[];
};

// Pulls last `days` of order data into per-day buckets and the top
// best-selling products by units. Single round-trip thanks to the
// orders → order_items expand. Used by the admin dashboard charts.
export async function getAdminTrendsSnapshot(
  days = 30,
): Promise<AdminTrendsSnapshot> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { daily: [], topProducts: [] };

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const sinceIso = since.toISOString();

  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, total, created_at, order_items(product_id, product_name, quantity, unit_price, products(slug))",
    )
    .gte("created_at", sinceIso)
    .order("created_at", { ascending: true })
    .limit(2000);

  if (error || !data) return { daily: [], topProducts: [] };

  type ItemRow = {
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    products?: { slug: string } | { slug: string }[] | null;
  };
  type OrderRow = {
    id: string;
    total: number;
    created_at: string;
    order_items?: ItemRow[];
  };

  // Build a complete day-by-day series so the chart never has gaps.
  const dailyMap = new Map<string, RevenuePoint>();
  for (let offset = days - 1; offset >= 0; offset--) {
    const day = new Date(Date.now() - offset * 24 * 60 * 60 * 1000);
    const key = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
    dailyMap.set(key, { date: key, orders: 0, revenue: 0 });
  }

  const productAgg = new Map<
    string,
    { name: string; slug: string; units: number; revenue: number }
  >();

  for (const order of (data as OrderRow[]) ?? []) {
    const day = new Date(order.created_at);
    const key = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
    const bucket = dailyMap.get(key);
    if (bucket) {
      bucket.orders += 1;
      bucket.revenue += normalizeNumber(order.total);
    }
    for (const item of order.order_items ?? []) {
      const slug = Array.isArray(item.products)
        ? item.products[0]?.slug
        : item.products?.slug;
      const existing = productAgg.get(item.product_id) ?? {
        name: item.product_name,
        slug: slug ?? "",
        units: 0,
        revenue: 0,
      };
      existing.units += item.quantity;
      existing.revenue += item.unit_price * item.quantity;
      existing.name = item.product_name || existing.name;
      if (slug) existing.slug = slug;
      productAgg.set(item.product_id, existing);
    }
  }

  const topProducts: TopProductRow[] = [...productAgg.entries()]
    .map(([productId, info]) => ({
      productId,
      name: info.name,
      slug: info.slug,
      unitsSold: info.units,
      revenue: info.revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);

  return {
    daily: [...dailyMap.values()],
    topProducts,
  };
}

function getEmptyRevenueSnapshot(
  days: number,
  notes: string[] = [],
): AdminRevenueSnapshot {
  const funnel = REVENUE_FUNNEL_EVENTS.map((eventName) => ({
    eventName,
    label: getFunnelLabel(eventName),
    events: 0,
    uniqueVisitors: 0,
    conversionFromPrevious: null,
  }));

  return {
    days,
    totalRevenue: 0,
    orderCount: 0,
    purchaseCount: 0,
    aov: 0,
    refundCount: 0,
    refundRate: null,
    revenueByProduct: [],
    topProducts: [],
    productsWithViewsNoPurchases: [],
    funnel,
    revenueByCampaign: [],
    analyticsAvailable: false,
    attributionAvailable: false,
    notes,
  };
}

function getFunnelLabel(eventName: RevenueFunnelEventName) {
  switch (eventName) {
    case "page_view":
      return "Wejścia";
    case "view_product":
      return "Widoki produktu";
    case "add_to_cart":
      return "Dodania do koszyka";
    case "begin_checkout":
      return "Start checkoutu";
    case "purchase":
      return "Zakupy";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getRecordString(
  input: Record<string, unknown> | null | undefined,
  keys: string[],
) {
  for (const key of keys) {
    const value = input?.[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function getProductSlugFromRelation(
  relation: { slug: string | null } | Array<{ slug: string | null }> | null | undefined,
) {
  if (Array.isArray(relation)) return relation[0]?.slug ?? "";
  return relation?.slug ?? "";
}

export async function getAdminRevenueSnapshot(
  days = 30,
): Promise<AdminRevenueSnapshot> {
  const supabase = createSupabaseAdminClient();
  const notes: string[] = [];

  if (!supabase) {
    return getEmptyRevenueSnapshot(days, [
      "Brak konfiguracji Supabase admin, więc dashboard przychodów jest pusty.",
    ]);
  }

  const sinceIso = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const baseOrderSelect =
    "id, total, status, created_at, refund_amount, order_items(product_id, product_name, quantity, unit_price, products(slug))";
  const attributionOrderSelect =
    "id, total, status, created_at, refund_amount, utm_source, utm_medium, utm_campaign, utm_content, utm_term, referrer, landing_page, order_items(product_id, product_name, quantity, unit_price, products(slug))";

  const attributionOrdersResult = await supabase
    .from("orders")
    .select(attributionOrderSelect)
    .gte("created_at", sinceIso)
    .order("created_at", { ascending: false })
    .limit(5000);

  let ordersData: unknown[] | null = attributionOrdersResult.data as unknown[] | null;
  let ordersError = attributionOrdersResult.error;

  if (ordersError) {
    console.warn("[admin-revenue] order attribution query failed", {
      message: ordersError.message,
    });
    notes.push(
      "Brakuje kolumn attribution na orders albo migracja nie została jeszcze uruchomiona.",
    );
    const fallbackOrdersResult = await supabase
      .from("orders")
      .select(baseOrderSelect)
      .gte("created_at", sinceIso)
      .order("created_at", { ascending: false })
      .limit(5000);
    ordersData = fallbackOrdersResult.data as unknown[] | null;
    ordersError = fallbackOrdersResult.error;
  }

  if (ordersError || !ordersData) {
    console.warn("[admin-revenue] orders query failed", {
      message: ordersError?.message,
    });
    return getEmptyRevenueSnapshot(days, [
      ...notes,
      "Nie udało się wczytać zamówień do dashboardu przychodów.",
    ]);
  }

  const eventsResult = await supabase
    .from("analytics_events")
    .select("event_name, visitor_id, product_id, amount, properties, created_at")
    .gte("created_at", sinceIso)
    .in("event_name", [...REVENUE_FUNNEL_EVENTS])
    .order("created_at", { ascending: false })
    .limit(50000);

  const analyticsAvailable = !eventsResult.error;
  if (eventsResult.error) {
    console.warn("[admin-revenue] analytics query failed", {
      message: eventsResult.error.message,
    });
    notes.push(
      "Brak danych analytics_events. Lejek i produkty z widokami bez zakupów pozostają puste.",
    );
  }

  type RevenueItemRow = {
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    products?: { slug: string | null } | Array<{ slug: string | null }> | null;
  };
  type RevenueOrderRow = {
    id: string;
    total: number | string | null;
    status: string | null;
    created_at: string;
    refund_amount?: number | string | null;
    utm_source?: string | null;
    utm_medium?: string | null;
    utm_campaign?: string | null;
    utm_content?: string | null;
    utm_term?: string | null;
    referrer?: string | null;
    landing_page?: string | null;
    order_items?: RevenueItemRow[] | null;
  };
  type AnalyticsEventRow = {
    event_name: string;
    visitor_id: string;
    product_id: string | null;
    amount: number | null;
    properties: unknown;
    created_at: string;
  };

  const orders = (ordersData as RevenueOrderRow[]) ?? [];
  const events = analyticsAvailable
    ? ((eventsResult.data as AnalyticsEventRow[]) ?? [])
    : [];

  const productAgg = new Map<
    string,
    {
      name: string;
      slug: string;
      unitsSold: number;
      purchases: number;
      revenue: number;
      views: number;
      addToCart: number;
    }
  >();
  const eventProductAgg = new Map<
    string,
    { name: string; slug: string; views: number; addToCart: number }
  >();
  const campaignAgg = new Map<
    string,
    { source: string; medium: string | null; campaign: string | null; orders: number; revenue: number }
  >();
  const funnelAgg = new Map<
    RevenueFunnelEventName,
    { events: number; visitors: Set<string> }
  >();

  for (const eventName of REVENUE_FUNNEL_EVENTS) {
    funnelAgg.set(eventName, { events: 0, visitors: new Set() });
  }

  for (const event of events) {
    if (!REVENUE_FUNNEL_EVENTS.includes(event.event_name as RevenueFunnelEventName)) {
      continue;
    }
    const eventName = event.event_name as RevenueFunnelEventName;
    const bucket = funnelAgg.get(eventName);
    if (bucket) {
      bucket.events += 1;
      bucket.visitors.add(event.visitor_id);
    }

    const properties = isRecord(event.properties) ? event.properties : null;
    const productId =
      event.product_id ||
      getRecordString(properties, ["product_id", "productId", "id"]);

    if (!productId) continue;

    const existing = eventProductAgg.get(productId) ?? {
      name: getRecordString(properties, ["product_name", "productName", "name"]) ||
        "Produkt cyfrowy",
      slug: getRecordString(properties, ["product_slug", "productSlug", "slug"]),
      views: 0,
      addToCart: 0,
    };

    existing.name =
      getRecordString(properties, ["product_name", "productName", "name"]) ||
      existing.name;
    existing.slug =
      getRecordString(properties, ["product_slug", "productSlug", "slug"]) ||
      existing.slug;
    if (eventName === "view_product") existing.views += 1;
    if (eventName === "add_to_cart") existing.addToCart += 1;
    eventProductAgg.set(productId, existing);
  }

  let totalRevenue = 0;
  let orderCount = 0;
  let purchaseCount = 0;
  let refundCount = 0;
  let attributionAvailable = false;

  for (const order of orders) {
    if (order.status === "cancelled") continue;

    const total = normalizeNumber(order.total);
    const explicitRefund = normalizeNumber(order.refund_amount);
    const refundAmount =
      order.status === "refunded" && explicitRefund === 0 ? total : explicitRefund;
    const netRevenue = Math.max(0, total - refundAmount);
    const isRefunded = order.status === "refunded" || refundAmount > 0;

    orderCount += 1;
    totalRevenue += netRevenue;
    if (isRefunded) refundCount += 1;

    const hasAttribution = Boolean(
      order.utm_source ||
        order.utm_medium ||
        order.utm_campaign ||
        order.utm_content ||
        order.utm_term ||
        order.referrer ||
        order.landing_page,
    );
    attributionAvailable ||= hasAttribution;

    if (hasAttribution) {
      const referrerHost = (() => {
        try {
          return order.referrer ? new URL(order.referrer).hostname : "";
        } catch {
          return "";
        }
      })();
      const source = order.utm_source || referrerHost || "direct / unknown";
      const medium = order.utm_medium || null;
      const campaign = order.utm_campaign || null;
      const key = `${source}|${medium ?? ""}|${campaign ?? ""}`;
      const campaignBucket = campaignAgg.get(key) ?? {
        source,
        medium,
        campaign,
        orders: 0,
        revenue: 0,
      };
      campaignBucket.orders += 1;
      campaignBucket.revenue += netRevenue;
      campaignAgg.set(key, campaignBucket);
    }

    if (netRevenue <= 0) continue;

    for (const item of order.order_items ?? []) {
      const quantity = normalizeInteger(item.quantity, 1);
      const itemRevenue = normalizeNumber(item.unit_price) * quantity;
      const existing = productAgg.get(item.product_id) ?? {
        name: item.product_name || "Produkt cyfrowy",
        slug: getProductSlugFromRelation(item.products),
        unitsSold: 0,
        purchases: 0,
        revenue: 0,
        views: 0,
        addToCart: 0,
      };

      existing.name = item.product_name || existing.name;
      existing.slug = getProductSlugFromRelation(item.products) || existing.slug;
      existing.unitsSold += quantity;
      existing.purchases += 1;
      existing.revenue += itemRevenue;
      productAgg.set(item.product_id, existing);
      purchaseCount += quantity;
    }
  }

  for (const [productId, eventInfo] of eventProductAgg.entries()) {
    const existing = productAgg.get(productId) ?? {
      name: eventInfo.name,
      slug: eventInfo.slug,
      unitsSold: 0,
      purchases: 0,
      revenue: 0,
      views: 0,
      addToCart: 0,
    };
    existing.views = eventInfo.views;
    existing.addToCart = eventInfo.addToCart;
    existing.name = existing.name || eventInfo.name;
    existing.slug = existing.slug || eventInfo.slug;
    productAgg.set(productId, existing);
  }

  const revenueByProduct = [...productAgg.entries()]
    .map(([productId, info]) => ({
      productId,
      name: info.name,
      slug: info.slug,
      unitsSold: info.unitsSold,
      purchases: info.purchases,
      revenue: info.revenue,
      views: info.views,
      addToCart: info.addToCart,
      conversionRate: info.views > 0 ? info.purchases / info.views : null,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const productsWithViewsNoPurchases = revenueByProduct
    .filter((product) => product.views > 0 && product.purchases === 0)
    .sort((a, b) => b.views - a.views)
    .slice(0, 8)
    .map((product) => ({
      productId: product.productId,
      name: product.name,
      slug: product.slug,
      views: product.views,
      addToCart: product.addToCart,
    }));

  const funnel: RevenueFunnelMetric[] = [];
  let previousVisitors: number | null = null;
  for (const eventName of REVENUE_FUNNEL_EVENTS) {
    const bucket = funnelAgg.get(eventName);
    const uniqueVisitors = bucket?.visitors.size ?? 0;
    funnel.push({
      eventName,
      label: getFunnelLabel(eventName),
      events: bucket?.events ?? 0,
      uniqueVisitors,
      conversionFromPrevious:
        previousVisitors && previousVisitors > 0
          ? uniqueVisitors / previousVisitors
          : null,
    });
    previousVisitors = uniqueVisitors;
  }

  const revenueByCampaign = [...campaignAgg.values()]
    .map((campaign) => ({
      ...campaign,
      aov: campaign.orders > 0 ? campaign.revenue / campaign.orders : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);

  if (!attributionAvailable) {
    notes.push(
      "Brak zapisanej atrybucji UTM/referrer na zamówieniach w wybranym okresie.",
    );
  }

  return {
    days,
    totalRevenue,
    orderCount,
    purchaseCount,
    aov: orderCount > 0 ? totalRevenue / orderCount : 0,
    refundCount,
    refundRate: orderCount > 0 ? refundCount / orderCount : null,
    revenueByProduct,
    topProducts: revenueByProduct.slice(0, 6),
    productsWithViewsNoPurchases,
    funnel,
    revenueByCampaign,
    analyticsAvailable,
    attributionAvailable,
    notes,
  };
}

export type AdminActivityEvent = {
  id: string;
  type: "order" | "review" | "subscriber" | "blog";
  title: string;
  detail: string;
  href: string;
  createdAt: string;
};

// Returns the latest activity across orders / reviews / subscribers / blog
// publishes, merged into one timeline so the admin dashboard has a single
// "what happened lately" widget instead of four sub-widgets.
export async function getAdminRecentActivity(
  limit = 12,
): Promise<AdminActivityEvent[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const events: AdminActivityEvent[] = [];

  const [orders, reviews, subscribers, posts] = await Promise.all([
    supabase
      .from("orders")
      .select("id, email, total, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("product_reviews")
      .select(
        "id, rating, status, created_at, products(name), profiles(full_name, email)",
      )
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("newsletter_subscribers")
      .select("id, email, created_at, source")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("blog_posts")
      .select("id, slug, title, status, published_at, updated_at")
      .order("updated_at", { ascending: false })
      .limit(6),
  ]);

  for (const row of orders.data ?? []) {
    events.push({
      id: `order-${row.id}`,
      type: "order",
      title: `Zamówienie ${formatCurrency(row.total)}`,
      detail: row.email,
      href: `/admin/zamowienia`,
      createdAt: row.created_at,
    });
  }

  type ReviewRow = {
    id: string;
    rating: number;
    status: string;
    created_at: string;
    products: { name: string } | { name: string }[] | null;
    profiles: { full_name: string | null; email: string } | null;
  };
  for (const row of (reviews.data ?? []) as ReviewRow[]) {
    const product = Array.isArray(row.products) ? row.products[0] : row.products;
    const author = row.profiles?.full_name ?? row.profiles?.email ?? "Anonim";
    events.push({
      id: `review-${row.id}`,
      type: "review",
      title: `${row.rating}★ ${row.status === "pending" ? "(do moderacji)" : row.status === "approved" ? "(opublikowana)" : "(odrzucona)"}`,
      detail: `${author} → ${product?.name ?? "produkt"}`,
      href: "/admin/recenzje",
      createdAt: row.created_at,
    });
  }

  for (const row of subscribers.data ?? []) {
    events.push({
      id: `sub-${row.id}`,
      type: "subscriber",
      title: "Nowy zapis na newsletter",
      detail: `${row.email} (${row.source})`,
      href: "/admin/ustawienia",
      createdAt: row.created_at,
    });
  }

  for (const row of posts.data ?? []) {
    events.push({
      id: `blog-${row.id}`,
      type: "blog",
      title:
        row.status === "published"
          ? `Wpis opublikowany: ${row.title}`
          : `Wpis zaktualizowany: ${row.title} (${row.status})`,
      detail: `/blog/${row.slug}`,
      href: `/admin/blog/${row.slug}`,
      createdAt: row.published_at ?? row.updated_at,
    });
  }

  return events
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
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
      revenueRaw: 0,
      contentCount: 0,
      adminCount: 0,
      pendingReviewCount: 0,
      approvedReviewCount: 0,
      subscriberCount: 0,
      blogPublishedCount: 0,
      bundleCount: 0,
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
      { count: pendingReviewCount },
      { count: approvedReviewCount },
      { count: subscriberCount },
      { count: blogPublishedCount },
      { count: bundleCount },
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
      supabase
        .from("product_reviews")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("product_reviews")
        .select("*", { count: "exact", head: true })
        .eq("status", "approved"),
      supabase
        .from("newsletter_subscribers")
        .select("*", { count: "exact", head: true })
        .is("unsubscribed_at", null),
      supabase
        .from("blog_posts")
        .select("*", { count: "exact", head: true })
        .eq("status", "published"),
      supabase
        .from("bundles")
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
      revenueRaw: revenueTotal,
      contentCount: normalizeInteger(contentCount),
      adminCount: normalizeInteger(adminCount),
      pendingReviewCount: normalizeInteger(pendingReviewCount),
      approvedReviewCount: normalizeInteger(approvedReviewCount),
      subscriberCount: normalizeInteger(subscriberCount),
      blogPublishedCount: normalizeInteger(blogPublishedCount),
      bundleCount: normalizeInteger(bundleCount),
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
      revenueRaw: 0,
      contentCount: 0,
      adminCount: 0,
      pendingReviewCount: 0,
      approvedReviewCount: 0,
      subscriberCount: 0,
      blogPublishedCount: 0,
      bundleCount: 0,
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

export async function getAdminProductMasterSnapshot(): Promise<AdminProductMasterSnapshot> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      existingProducts: [],
      error: "Brak konfiguracji Supabase.",
    };
  }

  const { data, error } = await supabase
    .from("products")
    .select("id, slug, name, status")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return {
      existingProducts: [],
      error: error?.message ?? "Nie udało się pobrać listy produktów.",
    };
  }

  return {
    existingProducts: data.map((product) => ({
      id: product.id,
      slug: normalizeText(product.slug),
      name: normalizeText(product.name, "Bez nazwy produktu"),
      status: normalizeProductStatus(product.status),
    })),
    error: null,
  };
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

export async function getAdminCouponsSnapshot() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      coupons: [] as AdminCouponSnapshot[],
      error: "Brak konfiguracji Supabase.",
    };
  }

  const { data, error } = await supabase
    .from("coupon_codes")
    .select(
      "id, code, label, percent_off, is_active, redemption_count, max_redemptions, expires_at, created_at",
    )
    .order("created_at", { ascending: false });

  if (error || !data) {
    return {
      coupons: [] as AdminCouponSnapshot[],
      error:
        error?.message ??
        "Nie udało się pobrać kodów rabatowych. Sprawdź, czy migracja Stage 2 została uruchomiona.",
    };
  }

  return {
    coupons: data.map((coupon) => ({
      id: coupon.id,
      code: coupon.code,
      label: coupon.label,
      percentOff: coupon.percent_off,
      isActive: coupon.is_active,
      redemptionCount: coupon.redemption_count,
      maxRedemptions: coupon.max_redemptions,
      expiresAt: coupon.expires_at,
      createdAt: coupon.created_at,
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
    orderBumpEnabled: true,
    orderBumpProductId: "",
    orderBumpPercentOff: 20,
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
  const parsedOrderBumpPercent = Number.parseInt(
    settingsMap.get("order_bump_percent_off") ?? String(defaults.orderBumpPercentOff),
    10,
  );

  return {
    recommendedBundleId:
      settingsMap.get("recommended_bundle_id") ?? defaults.recommendedBundleId,
    homepageFeaturedLimit:
      Number.isFinite(parsedFeaturedLimit) && parsedFeaturedLimit > 0
        ? parsedFeaturedLimit
        : defaults.homepageFeaturedLimit,
    orderBumpEnabled:
      (settingsMap.get("order_bump_enabled") ?? String(defaults.orderBumpEnabled)) !==
      "false",
    orderBumpProductId:
      settingsMap.get("order_bump_product_id") ?? defaults.orderBumpProductId,
    orderBumpPercentOff:
      Number.isFinite(parsedOrderBumpPercent) && parsedOrderBumpPercent > 0
        ? Math.min(parsedOrderBumpPercent, 80)
        : defaults.orderBumpPercentOff,
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

  // Live bundles come from the DB; fall back to the static mock list when
  // Supabase env is missing so previews / CI keep rendering something.
  const liveBundles = await getBundlesSnapshot();
  const bundlesForUi = liveBundles.length > 0 ? liveBundles : bundles;

  return {
    sections,
    featuredProducts: resolvedFeatured.slice(0, featuredLimit),
    bestsellerProducts: resolvedBestsellers,
    newArrivalProducts: deduplicatedNewArrivals,
    bundles: bundlesForUi,
    recommendedBundle:
      bundlesForUi.find((b) => b.id === settings.recommendedBundleId) ??
      bundlesForUi[0] ??
      null,
    faqs,
    testimonials,
  };
}
