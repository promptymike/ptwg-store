import "server-only";

import {
  CATEGORY_OPTIONS,
  type Category,
  type Product,
} from "@/types/store";
import {
  getProductBySlug as getMockProductBySlug,
  products as mockProducts,
} from "@/data/mock-store";
import { formatCurrency } from "@/lib/format";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database.types";

type ProductRow = Tables<"products"> & {
  categories: Pick<Tables<"categories">, "id" | "name" | "slug"> | null;
};

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

type AdminCategoryRow = Tables<"categories">;

type AccountOrderRow = Pick<
  Tables<"orders">,
  "id" | "status" | "total" | "created_at"
>;

function normalizeCategory(value: string | null | undefined): Category {
  const normalizedValue = value?.trim();
  return normalizedValue || CATEGORY_OPTIONS[0];
}

function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: normalizeCategory(row.categories?.name),
    shortDescription: row.short_description,
    description: row.description,
    price: row.price,
    compareAtPrice: row.compare_at_price ?? undefined,
    format: row.format,
    pages: row.pages,
    tags: row.tags ?? [],
    rating: Number(row.rating),
    salesLabel: row.sales_label,
    accent: row.accent,
    coverGradient: row.cover_gradient,
    includes: row.includes ?? [],
    heroNote: row.hero_note,
    bestseller: row.bestseller,
    featured: row.featured,
  };
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
    .eq("is_active", true)
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

  return (data as ProductRow[]).map(mapProduct);
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
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) {
    return getMockProductBySlug(slug);
  }

  return mapProduct(data as ProductRow);
}

export async function getRelatedStoreProducts(product: Product, limit = 3) {
  const products = await getStoreProducts(product.category);

  return products
    .filter((candidate) => candidate.id !== product.id)
    .slice(0, limit);
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
      orderCount: 0,
      revenue: formatCurrency(0),
    };
  }

  const [{ count: productCount }, { count: orderCount }, { data: totals }] =
    await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("total"),
    ]);

  const revenueTotal = (totals ?? []).reduce(
    (sum, order) => sum + order.total,
    0,
  );

  return {
    productCount: productCount ?? 0,
    orderCount: orderCount ?? 0,
    revenue: formatCurrency(revenueTotal),
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
      "id, slug, name, short_description, description, price, compare_at_price, format, pages, tags, rating, sales_label, accent, cover_gradient, includes, hero_note, bestseller, featured, is_active, cover_path, file_path, categories(id, name, slug)",
    )
    .order("created_at", { ascending: false });

  if (error || !data) {
    return {
      products: [],
      error: error?.message ?? "Nie udało się pobrać produktów.",
    };
  }

  return {
    products: data.map((product) => ({
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
      rating: product.rating,
      salesLabel: product.sales_label,
      accent: product.accent,
      coverGradient: product.cover_gradient,
      includes: product.includes ?? [],
      heroNote: product.hero_note,
      bestseller: product.bestseller,
      featured: product.featured,
      isActive: product.is_active,
      coverPath: product.cover_path,
      filePath: product.file_path,
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
    categories: (data as AdminCategoryRow[]).map((category) => ({
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
