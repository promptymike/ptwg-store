import "server-only";

import {
  CATEGORY_OPTIONS,
  type Category,
  type ContentPage,
  type Product,
  type ProductBadge,
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
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createProductCoverSignedUrl } from "@/lib/supabase/storage";
import type { Tables } from "@/types/database.types";

type CategoryRow = Pick<Tables<"categories">, "id" | "name" | "slug">;

type ProductRow = Tables<"products"> & {
  categories: CategoryRow | null;
};

type ProductPreviewRow = Tables<"product_previews">;

type LibraryRow = Tables<"library_items"> & {
  products: Pick<
    Tables<"products">,
    "id" | "slug" | "name" | "short_description" | "format" | "file_path"
  > & {
    categories: Pick<Tables<"categories">, "name" | "slug"> | null;
  };
};

type AdminOrderRow = Tables<"orders"> & {
  profiles: Pick<Tables<"profiles">, "email" | "full_name"> | null;
  order_items: Array<Pick<Tables<"order_items">, "product_name">>;
};

type AccountOrderRow = Pick<
  Tables<"orders">,
  "id" | "status" | "total" | "created_at"
>;

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

async function mapProductRow(
  row: ProductRow,
  previews: ProductPreviewRow[] = [],
  includeAssets = false,
): Promise<Product> {
  const [coverImageUrl, mappedPreviews] = includeAssets
    ? await Promise.all([
        row.cover_path ? createProductCoverSignedUrl(row.cover_path) : null,
        Promise.all(
          previews.map(async (preview) => ({
            id: preview.id,
            imageUrl: await createProductCoverSignedUrl(preview.storage_path),
            altText: preview.alt_text,
          })),
        ),
      ])
    : [null, []];

  const polishOverride = mockProductsBySlug.get(row.slug);

  return {
    id: row.id,
    slug: row.slug,
    name: polishOverride?.name ?? row.name,
    category: normalizeCategory(row.categories?.name),
    shortDescription: polishOverride?.shortDescription ?? row.short_description,
    description: polishOverride?.description ?? row.description,
    price: row.price,
    compareAtPrice: row.compare_at_price ?? undefined,
    format: polishOverride?.format ?? row.format,
    pages: row.pages,
    tags: polishOverride?.tags ?? row.tags ?? [],
    rating: Number(row.rating),
    salesLabel: polishOverride?.salesLabel ?? row.sales_label,
    accent: row.accent,
    coverGradient: row.cover_gradient,
    includes: polishOverride?.includes ?? row.includes ?? [],
    heroNote: polishOverride?.heroNote ?? row.hero_note,
    badge: (row.badge as ProductBadge | null) ?? null,
    status: row.status as ProductStatus,
    bestseller: row.bestseller,
    featured: row.featured,
    coverImageUrl,
    previews: mappedPreviews,
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

  return Promise.all((data as ProductRow[]).map((row) => mapProductRow(row)));
}

export async function getFeaturedStoreProducts(limit = 4) {
  const products = await getStoreProducts();
  return products.filter((product) => product.featured).slice(0, limit);
}

export async function getBestsellerStoreProducts(limit = 3) {
  const products = await getStoreProducts();
  return products.filter((product) => product.bestseller).slice(0, limit);
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
    .neq("status", "archived")
    .maybeSingle();

  if (error || !data) {
    return getMockProductBySlug(slug);
  }

  const previewsMap = await getProductPreviewsMap([data.id]);
  return mapProductRow(data as ProductRow, previewsMap.get(data.id) ?? [], true);
}

export async function getRelatedStoreProducts(product: Product, limit = 3) {
  const products = await getStoreProducts(product.category);

  return products
    .filter((candidate) => candidate.id !== product.id)
    .slice(0, limit);
}

export async function getSiteSectionsSnapshot() {
  return sortSections(mockSiteSections);
}

export async function getFaqSnapshot() {
  return mockFaqItems;
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

export async function getLibrarySnapshot(userId: string) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("library_items")
    .select(
      "id, created_at, download_count, last_downloaded_at, products!inner(id, slug, name, short_description, format, file_path, categories(name, slug))",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as LibraryRow[]).map((item) => ({
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
  }));
}

export async function getAdminDashboardSnapshot() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      productCount: 0,
      publishedCount: 0,
      orderCount: 0,
      revenue: formatCurrency(0),
      contentCount: 0,
      adminCount: 0,
    };
  }

  const [
    { count: productCount },
    { count: publishedCount },
    { count: orderCount },
    { data: totals },
    { count: contentCount },
    { count: adminCount },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("status", "published"),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("total"),
    supabase.from("content_pages").select("*", { count: "exact", head: true }),
    supabase
      .from("admin_allowlist")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
  ]);

  const revenueTotal = (totals ?? []).reduce(
    (sum, order) => sum + order.total,
    0,
  );

  return {
    productCount: productCount ?? 0,
    publishedCount: publishedCount ?? 0,
    orderCount: orderCount ?? 0,
    revenue: formatCurrency(revenueTotal),
    contentCount: contentCount ?? 0,
    adminCount: adminCount ?? 0,
  };
}

export async function getAdminProductsSnapshot() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      products: [],
      error: "Brak konfiguracji Supabase.",
    };
  }

  const { data, error } = await supabase
    .from("products")
    .select(
      "id, slug, name, short_description, description, price, compare_at_price, format, pages, tags, rating, sales_label, accent, cover_gradient, includes, hero_note, badge, status, bestseller, featured, sort_order, featured_order, is_active, cover_path, file_path, categories(id, name, slug)",
    )
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error || !data) {
    return {
      products: [],
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
  };
}

export async function getStorefrontSnapshot() {
  const [sections, settings, featuredProducts, bestsellerProducts, faqs, testimonials] =
    await Promise.all([
      getSiteSectionsSnapshot(),
      getSiteSettingsSnapshot(),
      getFeaturedStoreProducts(),
      getBestsellerStoreProducts(),
      getFaqSnapshot(),
      getTestimonialsSnapshot(),
    ]);

  return {
    sections,
    featuredProducts:
      (featuredProducts.length > 0 ? featuredProducts : mockFeaturedProducts).slice(
        0,
        Math.max(1, settings.homepageFeaturedLimit || 4),
      ),
    bestsellerProducts:
      bestsellerProducts.length > 0 ? bestsellerProducts : mockBestsellers,
    recommendedBundle:
      getBundleById(settings.recommendedBundleId) ?? bundles[0] ?? null,
    faqs,
    testimonials,
  };
}
