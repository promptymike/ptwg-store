import { PRODUCT_BADGES, PRODUCT_STATUSES } from "@/types/store";

export type ProductMasterCategory = {
  id: string;
  name: string;
  slug: string;
};

export type ProductMasterInputRow = {
  name: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  category: string;
  price: number;
  compareAtPrice: number | null;
  badge: string | null;
  status: "draft" | "published" | "archived";
  seoTitle: string;
  seoDescription: string;
  coverImagePath: string | null;
  productFilePath: string | null;
  previewImages: string[];
};

export type ProductMasterParsedRow = {
  rowNumber: number;
  values: ProductMasterInputRow;
  categoryId: string | null;
  errors: string[];
  warnings: string[];
};

export type ProductMasterParseResult = {
  rows: ProductMasterParsedRow[];
  missingColumns: string[];
};

const REQUIRED_COLUMNS = [
  "name",
  "slug",
  "short_description",
  "long_description",
  "category",
  "price",
  "compare_at_price",
  "badge",
  "status",
  "seo_title",
  "seo_description",
  "cover_image_path",
  "product_file_path",
  "preview_images",
] as const;

const HEADER_ALIASES: Record<(typeof REQUIRED_COLUMNS)[number], string[]> = {
  name: ["name", "nazwa"],
  slug: ["slug", "url_slug"],
  short_description: ["short_description", "short description", "shortDescription"],
  long_description: ["long_description", "long description", "description", "opis"],
  category: ["category", "kategoria", "category_slug", "category_name"],
  price: ["price", "cena"],
  compare_at_price: ["compare_at_price", "compare-at price", "compareAtPrice"],
  badge: ["badge", "etykieta"],
  status: ["status"],
  seo_title: ["seo_title", "seo title", "meta_title", "SEO title"],
  seo_description: [
    "seo_description",
    "seo description",
    "meta_description",
    "SEO description",
  ],
  cover_image_path: [
    "cover_image_path",
    "cover image path/url",
    "cover_path",
    "cover_url",
    "cover image",
  ],
  product_file_path: [
    "product_file_path",
    "product file path/url",
    "file_path",
    "file_url",
    "product_file_url",
  ],
  preview_images: ["preview_images", "preview images", "previews", "preview_urls"],
};

const SLUG_REGEX = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

function normalizeHeader(value: string) {
  return value
    .trim()
    .replace(/^\uFEFF/, "")
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

function normalizeLookup(value: string) {
  return value.trim().toLowerCase();
}

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let current = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(current);
      if (row.some((cell) => cell.trim().length > 0)) {
        rows.push(row);
      }
      row = [];
      current = "";
      continue;
    }

    current += char;
  }

  row.push(current);
  if (row.some((cell) => cell.trim().length > 0)) {
    rows.push(row);
  }

  return rows;
}

function mapHeaders(headers: string[]) {
  const normalizedHeaders = headers.map(normalizeHeader);

  return Object.fromEntries(
    REQUIRED_COLUMNS.map((column) => {
      const aliases = HEADER_ALIASES[column].map(normalizeHeader);
      const index = normalizedHeaders.findIndex((header) => aliases.includes(header));
      return [column, index] as const;
    }),
  ) as Record<(typeof REQUIRED_COLUMNS)[number], number>;
}

function readCell(
  row: string[],
  headerMap: Record<(typeof REQUIRED_COLUMNS)[number], number>,
  column: (typeof REQUIRED_COLUMNS)[number],
) {
  const index = headerMap[column];
  return index >= 0 ? row[index]?.trim() ?? "" : "";
}

export function parsePriceInput(value: string) {
  const normalized = value
    .replace(/pln/gi, "")
    .replace(/\s+/g, "")
    .replace(",", ".")
    .trim();
  if (!normalized) return null;

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? Math.round(parsed) : null;
}

function parsePreviewImages(value: string) {
  return value
    .split(/\r?\n|;|\|/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function stripBucketPrefix(value: string, bucket: "product-covers" | "product-files") {
  const normalized = value.trim();
  return normalized.startsWith(`${bucket}/`)
    ? normalized.slice(bucket.length + 1)
    : normalized;
}

export function normalizeAssetReference(
  value: string,
  bucket: "product-covers" | "product-files",
) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  if (!/^https?:\/\//i.test(trimmed)) {
    return stripBucketPrefix(trimmed, bucket);
  }

  try {
    const url = new URL(trimmed);
    const decodedPath = decodeURIComponent(url.pathname);
    const markers = [
      `/storage/v1/object/public/${bucket}/`,
      `/storage/v1/object/sign/${bucket}/`,
      `/storage/v1/object/authenticated/${bucket}/`,
    ];
    const marker = markers.find((candidate) => decodedPath.includes(candidate));

    if (marker) {
      return decodedPath.slice(decodedPath.indexOf(marker) + marker.length);
    }
  } catch {
    return trimmed;
  }

  return bucket === "product-covers" ? trimmed : "";
}

function findCategoryId(categoryValue: string, categories: ProductMasterCategory[]) {
  const normalized = normalizeLookup(categoryValue);
  const category = categories.find((candidate) => {
    return (
      normalizeLookup(candidate.slug) === normalized ||
      normalizeLookup(candidate.name) === normalized
    );
  });

  return category?.id ?? null;
}

export function parseProductMasterCsv(input: {
  csvText: string;
  categories: ProductMasterCategory[];
  existingSlugs?: Set<string>;
}): ProductMasterParseResult {
  const csvRows = parseCsv(input.csvText);
  const [headers, ...bodyRows] = csvRows;

  if (!headers) {
    return { rows: [], missingColumns: [...REQUIRED_COLUMNS] };
  }

  const headerMap = mapHeaders(headers);
  const missingColumns = REQUIRED_COLUMNS.filter((column) => headerMap[column] < 0);
  const existingSlugs = input.existingSlugs ?? new Set<string>();
  const seenSlugs = new Set<string>();

  const rows = bodyRows.map((row, index) => {
    const rowNumber = index + 2;
    const errors: string[] = [];
    const warnings: string[] = [];
    const slug = readCell(row, headerMap, "slug").toLowerCase();
    const category = readCell(row, headerMap, "category");
    const status = readCell(row, headerMap, "status").toLowerCase();
    const badge = readCell(row, headerMap, "badge").toLowerCase();
    const price = parsePriceInput(readCell(row, headerMap, "price"));
    const compareAtPrice = parsePriceInput(readCell(row, headerMap, "compare_at_price"));
    const coverRaw = readCell(row, headerMap, "cover_image_path");
    const productFileRaw = readCell(row, headerMap, "product_file_path");
    const normalizedCover = normalizeAssetReference(coverRaw, "product-covers");
    const normalizedProductFile = normalizeAssetReference(
      productFileRaw,
      "product-files",
    );
    const previewImages = parsePreviewImages(readCell(row, headerMap, "preview_images"))
      .map((image) => normalizeAssetReference(image, "product-covers"))
      .filter(Boolean);
    const categoryId = findCategoryId(category, input.categories);

    const values: ProductMasterInputRow = {
      name: readCell(row, headerMap, "name"),
      slug,
      shortDescription: readCell(row, headerMap, "short_description"),
      longDescription: readCell(row, headerMap, "long_description"),
      category,
      price: price ?? 0,
      compareAtPrice,
      badge: badge || null,
      status: PRODUCT_STATUSES.includes(status as (typeof PRODUCT_STATUSES)[number])
        ? (status as ProductMasterInputRow["status"])
        : "draft",
      seoTitle: readCell(row, headerMap, "seo_title"),
      seoDescription: readCell(row, headerMap, "seo_description"),
      coverImagePath: normalizedCover || null,
      productFilePath: normalizedProductFile || null,
      previewImages,
    };

    if (values.name.length < 3) errors.push("name must have at least 3 chars.");
    if (!SLUG_REGEX.test(slug)) {
      errors.push("slug must use lowercase letters, digits and hyphens.");
    }
    if (existingSlugs.has(slug)) {
      errors.push("slug already exists; import will not overwrite it.");
    }
    if (seenSlugs.has(slug)) {
      errors.push("duplicate slug inside this CSV.");
    }
    if (slug) seenSlugs.add(slug);
    if (!values.shortDescription || values.shortDescription.length < 12) {
      errors.push("short_description must be at least 12 chars.");
    }
    if (!values.longDescription || values.longDescription.length < 20) {
      errors.push("long_description must be at least 20 chars.");
    }
    if (!categoryId) {
      errors.push("category must match an existing category name or slug.");
    }
    if (!price || price < 1) {
      errors.push("price must be a number greater than 0.");
    }
    if (
      compareAtPrice !== null &&
      compareAtPrice > 0 &&
      price !== null &&
      compareAtPrice <= price
    ) {
      warnings.push("compare_at_price should usually be higher than price.");
    }
    if (badge && !PRODUCT_BADGES.includes(badge as (typeof PRODUCT_BADGES)[number])) {
      errors.push("badge must be empty, bestseller, new, featured or pack.");
    }
    if (!PRODUCT_STATUSES.includes(status as (typeof PRODUCT_STATUSES)[number])) {
      errors.push("status must be draft, published or archived.");
    }
    if (!values.seoTitle) errors.push("SEO title is required.");
    if (!values.seoDescription) errors.push("SEO description is required.");

    if (values.status === "published") {
      if (!values.coverImagePath) errors.push("published products need a cover image.");
      if (!values.productFilePath) {
        errors.push("published products need a private product-files path.");
      }
    } else {
      if (!values.coverImagePath) warnings.push("cover image can be added later.");
      if (!values.productFilePath) warnings.push("product file can be added later.");
    }

    if (productFileRaw && !normalizedProductFile) {
      errors.push(
        "product file URL must be a Supabase product-files URL or storage path.",
      );
    }

    return {
      rowNumber,
      values,
      categoryId,
      errors,
      warnings,
    };
  });

  return { rows, missingColumns };
}

export function getRequiredProductMasterColumns() {
  return [...REQUIRED_COLUMNS];
}
