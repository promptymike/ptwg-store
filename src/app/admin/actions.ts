"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentProfile } from "@/lib/session";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import {
  PRODUCT_COVERS_BUCKET,
  PRODUCT_FILES_BUCKET,
  removeStorageFile,
  uploadStorageFile,
  validateUploadFile,
} from "@/lib/supabase/storage";
import {
  allowlistFormSchema,
  categoryFormSchema,
  contentPageFormSchema,
  contentSectionFormSchema,
  faqFormSchema,
  previewFormSchema,
  productFormSchema,
  siteSettingsFormSchema,
  testimonialFormSchema,
} from "@/lib/validations/admin";

function slugifyFilename(filename: string) {
  const normalized = filename
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || "plik";
}

function parseCheckbox(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
}

function parseList(value: string | undefined) {
  if (!value) {
    return [];
  }

  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseNullableString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

async function ensureAdmin() {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "admin") {
    throw new Error("Brak uprawnień administratora.");
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Brak konfiguracji Supabase.");
  }

  return { profile, supabase };
}

function redirectWithMessage(
  path: string,
  type: "success" | "error",
  message: string,
) {
  redirect(`${path}?type=${type}&message=${encodeURIComponent(message)}`);
}

async function uploadProductAssets(params: {
  productId: string;
  slug: string;
  coverFile?: File | null;
  productFile?: File | null;
  previousCoverPath?: string | null;
  previousFilePath?: string | null;
}) {
  let coverPath = params.previousCoverPath ?? null;
  let filePath = params.previousFilePath ?? null;

  if (params.coverFile && params.coverFile.size > 0) {
    const validationError = validateUploadFile("cover", params.coverFile);

    if (validationError) {
      throw new Error(`Niepoprawna okładka: ${validationError}`);
    }

    const nextCoverPath = `products/${params.productId}/covers/${Date.now()}-${slugifyFilename(
      params.coverFile.name,
    )}`;
    const uploadResult = await uploadStorageFile(
      PRODUCT_COVERS_BUCKET,
      nextCoverPath,
      params.coverFile,
    );

    if (uploadResult.error) {
      throw new Error(`Nie udało się wgrać okładki: ${uploadResult.error.message}`);
    }

    if (coverPath && coverPath !== nextCoverPath) {
      await removeStorageFile(PRODUCT_COVERS_BUCKET, coverPath);
    }

    coverPath = nextCoverPath;
  }

  if (params.productFile && params.productFile.size > 0) {
    const validationError = validateUploadFile("product", params.productFile);

    if (validationError) {
      throw new Error(`Niepoprawny plik produktu: ${validationError}`);
    }

    const nextFilePath = `products/${params.productId}/files/${Date.now()}-${slugifyFilename(
      params.productFile.name,
    )}`;
    const uploadResult = await uploadStorageFile(
      PRODUCT_FILES_BUCKET,
      nextFilePath,
      params.productFile,
    );

    if (uploadResult.error) {
      throw new Error(
        `Nie udało się wgrać pliku produktu: ${uploadResult.error.message}`,
      );
    }

    if (filePath && filePath !== nextFilePath) {
      await removeStorageFile(PRODUCT_FILES_BUCKET, filePath);
    }

    filePath = nextFilePath;
  }

  return { coverPath, filePath };
}

async function uploadProductPreview(params: {
  productId: string;
  previewFile: File;
}) {
  const validationError = validateUploadFile("preview", params.previewFile);

  if (validationError) {
    throw new Error(`Niepoprawny preview image: ${validationError}`);
  }

  const storagePath = `products/${params.productId}/previews/${Date.now()}-${slugifyFilename(
    params.previewFile.name,
  )}`;

  const uploadResult = await uploadStorageFile(
    PRODUCT_COVERS_BUCKET,
    storagePath,
    params.previewFile,
  );

  if (uploadResult.error) {
    throw new Error(`Nie udało się wgrać podglądu: ${uploadResult.error.message}`);
  }

  return storagePath;
}

async function cleanupProductFiles(params: {
  coverPath?: string | null;
  filePath?: string | null;
  previewPaths?: string[];
}) {
  await Promise.all([
    removeStorageFile(PRODUCT_COVERS_BUCKET, params.coverPath),
    removeStorageFile(PRODUCT_FILES_BUCKET, params.filePath),
    ...(params.previewPaths ?? []).map((previewPath) =>
      removeStorageFile(PRODUCT_COVERS_BUCKET, previewPath),
    ),
  ]);
}

function revalidateStorefront(productSlug?: string) {
  revalidatePath("/");
  revalidatePath("/produkty");
  revalidatePath("/koszyk");
  revalidatePath("/checkout");
  revalidatePath("/konto");
  revalidatePath("/biblioteka");

  if (productSlug) {
    revalidatePath(`/produkty/${productSlug}`);
  }
}

export async function createCategoryAction(formData: FormData) {
  let redirectType: "success" | "error" = "success";
  let redirectMessage = "Kategoria została utworzona.";

  try {
    const { supabase } = await ensureAdmin();

    const parsed = categoryFormSchema.safeParse({
      slug: formData.get("slug"),
      name: formData.get("name"),
      description: formData.get("description"),
      sortOrder: formData.get("sortOrder"),
      isActive: parseCheckbox(formData.get("isActive")),
    });

    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Niepoprawne dane kategorii.");
    }

    const { error } = await supabase.from("categories").insert({
      slug: parsed.data.slug,
      name: parsed.data.name,
      description: parsed.data.description,
      sort_order: parsed.data.sortOrder,
      is_active: parsed.data.isActive ?? false,
    });

    if (error) {
      throw error;
    }

    revalidatePath("/admin/kategorie");
    revalidateStorefront();
  } catch (error) {
    redirectType = "error";
    redirectMessage =
      error instanceof Error ? error.message : "Nie udało się utworzyć kategorii.";
  }

  redirectWithMessage("/admin/kategorie", redirectType, redirectMessage);
}

export async function updateCategoryAction(formData: FormData) {
  let redirectType: "success" | "error" = "success";
  let redirectMessage = "Kategoria została zaktualizowana.";

  try {
    const { supabase } = await ensureAdmin();

    const parsed = categoryFormSchema.safeParse({
      categoryId: formData.get("categoryId"),
      slug: formData.get("slug"),
      name: formData.get("name"),
      description: formData.get("description"),
      sortOrder: formData.get("sortOrder"),
      isActive: parseCheckbox(formData.get("isActive")),
    });

    if (!parsed.success || !parsed.data.categoryId) {
      throw new Error(parsed.error?.issues[0]?.message ?? "Niepoprawne dane kategorii.");
    }

    const { error } = await supabase
      .from("categories")
      .update({
        slug: parsed.data.slug,
        name: parsed.data.name,
        description: parsed.data.description,
        sort_order: parsed.data.sortOrder,
        is_active: parsed.data.isActive ?? false,
      })
      .eq("id", parsed.data.categoryId);

    if (error) {
      throw error;
    }

    revalidatePath("/admin/kategorie");
    revalidateStorefront();
  } catch (error) {
    redirectType = "error";
    redirectMessage =
      error instanceof Error ? error.message : "Nie udało się zaktualizować kategorii.";
  }

  redirectWithMessage("/admin/kategorie", redirectType, redirectMessage);
}

export async function deleteCategoryAction(formData: FormData) {
  let redirectType: "success" | "error" = "success";
  let redirectMessage = "Kategoria została usunięta.";

  try {
    const { supabase } = await ensureAdmin();
    const categoryId = formData.get("categoryId");

    if (typeof categoryId !== "string" || !categoryId) {
      throw new Error("Brak identyfikatora kategorii.");
    }

    const { error } = await supabase.from("categories").delete().eq("id", categoryId);

    if (error) {
      throw error;
    }

    revalidatePath("/admin/kategorie");
    revalidateStorefront();
  } catch (error) {
    redirectType = "error";
    redirectMessage =
      error instanceof Error ? error.message : "Nie udało się usunąć kategorii.";
  }

  redirectWithMessage("/admin/kategorie", redirectType, redirectMessage);
}

export async function createProductAction(formData: FormData) {
  let redirectType: "success" | "error" = "success";
  let redirectMessage = "Produkt został utworzony.";
  let createdProductId: string | null = null;
  let uploadedCoverPath: string | null = null;
  let uploadedFilePath: string | null = null;
  let uploadedPreviewPaths: string[] = [];

  try {
    const { supabase } = await ensureAdmin();

    const parsed = productFormSchema.safeParse({
      name: formData.get("name"),
      slug: formData.get("slug"),
      categoryId: formData.get("categoryId"),
      price: formData.get("price"),
      compareAtPrice: parseNullableString(formData.get("compareAtPrice")),
      shortDescription: formData.get("shortDescription"),
      description: formData.get("description"),
      format: formData.get("format"),
      pages: formData.get("pages"),
      salesLabel: formData.get("salesLabel"),
      heroNote: formData.get("heroNote"),
      accent: formData.get("accent"),
      coverGradient: formData.get("coverGradient"),
      badge: parseNullableString(formData.get("badge")) ?? null,
      status: formData.get("status"),
      sortOrder: formData.get("sortOrder"),
      featuredOrder: formData.get("featuredOrder"),
      tags: formData.get("tags"),
      includes: formData.get("includes"),
      bestseller: parseCheckbox(formData.get("bestseller")),
      featured: parseCheckbox(formData.get("featured")),
      isActive: parseCheckbox(formData.get("isActive")),
    });

    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Niepoprawne dane produktu.");
    }

    const { data: product, error } = await supabase
      .from("products")
      .insert({
        name: parsed.data.name,
        slug: parsed.data.slug,
        category_id: parsed.data.categoryId,
        price: parsed.data.price,
        compare_at_price: parsed.data.compareAtPrice ?? null,
        short_description: parsed.data.shortDescription,
        description: parsed.data.description,
        format: parsed.data.format,
        pages: parsed.data.pages,
        sales_label: parsed.data.salesLabel,
        hero_note: parsed.data.heroNote,
        accent: parsed.data.accent,
        cover_gradient: parsed.data.coverGradient,
        badge: parsed.data.badge ?? null,
        status: parsed.data.status,
        sort_order: parsed.data.sortOrder,
        featured_order: parsed.data.featured ? parsed.data.featuredOrder : 0,
        tags: parseList(parsed.data.tags),
        includes: parseList(parsed.data.includes),
        bestseller: parsed.data.bestseller ?? false,
        featured: parsed.data.featured ?? false,
        is_active:
          parsed.data.status === "published" && (parsed.data.isActive ?? true),
      })
      .select("id, slug")
      .single();

    if (error || !product) {
      throw error ?? new Error("Nie udało się utworzyć produktu.");
    }

    createdProductId = product.id;

    const coverFile = formData.get("coverFile");
    const productFile = formData.get("productFile");

    const assets = await uploadProductAssets({
      productId: product.id,
      slug: product.slug,
      coverFile: coverFile instanceof File ? coverFile : null,
      productFile: productFile instanceof File ? productFile : null,
    });
    uploadedCoverPath = assets.coverPath;
    uploadedFilePath = assets.filePath;

    const previewFiles = formData.getAll("previewFiles");
    const previewUploads = await Promise.all(
      previewFiles
        .filter((file): file is File => file instanceof File && file.size > 0)
        .map(async (file, index) => ({
          storage_path: await uploadProductPreview({
            productId: product.id,
            previewFile: file,
          }),
          alt_text: `Preview ${index + 1}`,
          sort_order: index,
          product_id: product.id,
        })),
    );
    uploadedPreviewPaths = previewUploads.map((preview) => preview.storage_path);

    const { error: updateError } = await supabase
      .from("products")
      .update({
        cover_path: assets.coverPath,
        file_path: assets.filePath,
      })
      .eq("id", product.id);

    if (updateError) {
      throw updateError;
    }

    if (previewUploads.length > 0) {
      const { error: previewsError } = await supabase
        .from("product_previews")
        .insert(previewUploads);

      if (previewsError) {
        throw previewsError;
      }
    }

    revalidatePath("/admin/produkty");
    revalidateStorefront(product.slug);
  } catch (error) {
    if (createdProductId) {
      const supabase = createSupabaseAdminClient();

      if (supabase) {
        await supabase.from("products").delete().eq("id", createdProductId);
      }
    }

    if (uploadedCoverPath || uploadedFilePath || uploadedPreviewPaths.length > 0) {
      await cleanupProductFiles({
        coverPath: uploadedCoverPath,
        filePath: uploadedFilePath,
        previewPaths: uploadedPreviewPaths,
      });
    }

    redirectType = "error";
    redirectMessage =
      error instanceof Error ? error.message : "Nie udało się utworzyć produktu.";
  }

  redirectWithMessage("/admin/produkty", redirectType, redirectMessage);
}

export async function updateProductAction(formData: FormData) {
  let redirectType: "success" | "error" = "success";
  let redirectMessage = "Produkt został zaktualizowany.";
  let replacedCoverPath: string | null = null;
  let replacedFilePath: string | null = null;
  let uploadedPreviewPaths: string[] = [];
  let productUpdated = false;

  try {
    const { supabase } = await ensureAdmin();

    const parsed = productFormSchema.safeParse({
      productId: formData.get("productId"),
      name: formData.get("name"),
      slug: formData.get("slug"),
      categoryId: formData.get("categoryId"),
      price: formData.get("price"),
      compareAtPrice: parseNullableString(formData.get("compareAtPrice")),
      shortDescription: formData.get("shortDescription"),
      description: formData.get("description"),
      format: formData.get("format"),
      pages: formData.get("pages"),
      salesLabel: formData.get("salesLabel"),
      heroNote: formData.get("heroNote"),
      accent: formData.get("accent"),
      coverGradient: formData.get("coverGradient"),
      badge: parseNullableString(formData.get("badge")) ?? null,
      status: formData.get("status"),
      sortOrder: formData.get("sortOrder"),
      featuredOrder: formData.get("featuredOrder"),
      tags: formData.get("tags"),
      includes: formData.get("includes"),
      bestseller: parseCheckbox(formData.get("bestseller")),
      featured: parseCheckbox(formData.get("featured")),
      isActive: parseCheckbox(formData.get("isActive")),
    });

    if (!parsed.success || !parsed.data.productId) {
      throw new Error(parsed.error?.issues[0]?.message ?? "Niepoprawne dane produktu.");
    }

    const { data: existingProduct, error: existingError } = await supabase
      .from("products")
      .select("id, slug, cover_path, file_path")
      .eq("id", parsed.data.productId)
      .maybeSingle();

    if (existingError || !existingProduct) {
      throw existingError ?? new Error("Nie znaleziono produktu.");
    }

    const coverFile = formData.get("coverFile");
    const productFile = formData.get("productFile");
    const assets = await uploadProductAssets({
      productId: existingProduct.id,
      slug: parsed.data.slug,
      coverFile: coverFile instanceof File ? coverFile : null,
      productFile: productFile instanceof File ? productFile : null,
      previousCoverPath: existingProduct.cover_path,
      previousFilePath: existingProduct.file_path,
    });
    replacedCoverPath =
      assets.coverPath !== existingProduct.cover_path ? assets.coverPath : null;
    replacedFilePath =
      assets.filePath !== existingProduct.file_path ? assets.filePath : null;

    const { error } = await supabase
      .from("products")
      .update({
        name: parsed.data.name,
        slug: parsed.data.slug,
        category_id: parsed.data.categoryId,
        price: parsed.data.price,
        compare_at_price: parsed.data.compareAtPrice ?? null,
        short_description: parsed.data.shortDescription,
        description: parsed.data.description,
        format: parsed.data.format,
        pages: parsed.data.pages,
        sales_label: parsed.data.salesLabel,
        hero_note: parsed.data.heroNote,
        accent: parsed.data.accent,
        cover_gradient: parsed.data.coverGradient,
        badge: parsed.data.badge ?? null,
        status: parsed.data.status,
        sort_order: parsed.data.sortOrder,
        featured_order: parsed.data.featured ? parsed.data.featuredOrder : 0,
        tags: parseList(parsed.data.tags),
        includes: parseList(parsed.data.includes),
        bestseller: parsed.data.bestseller ?? false,
        featured: parsed.data.featured ?? false,
        is_active:
          parsed.data.status === "published" && (parsed.data.isActive ?? true),
        cover_path: assets.coverPath,
        file_path: assets.filePath,
      })
      .eq("id", parsed.data.productId);

    if (error) {
      throw error;
    }

    productUpdated = true;

    const previewFiles = formData.getAll("previewFiles");
    const previewUploads = await Promise.all(
      previewFiles
        .filter((file): file is File => file instanceof File && file.size > 0)
        .map(async (file, index) => ({
          storage_path: await uploadProductPreview({
            productId: existingProduct.id,
            previewFile: file,
          }),
          alt_text: `Preview ${index + 1}`,
          sort_order: Date.now() + index,
          product_id: existingProduct.id,
        })),
    );
    uploadedPreviewPaths = previewUploads.map((preview) => preview.storage_path);

    if (previewUploads.length > 0) {
      const { error: previewsError } = await supabase
        .from("product_previews")
        .insert(previewUploads);

      if (previewsError) {
        throw previewsError;
      }
    }

    revalidatePath("/admin/produkty");
    revalidateStorefront(existingProduct.slug);
    revalidateStorefront(parsed.data.slug);
  } catch (error) {
    if ((!productUpdated && (replacedCoverPath || replacedFilePath)) || uploadedPreviewPaths.length > 0) {
      await cleanupProductFiles({
        coverPath: productUpdated ? null : replacedCoverPath,
        filePath: productUpdated ? null : replacedFilePath,
        previewPaths: uploadedPreviewPaths,
      });
    }

    redirectType = "error";
    redirectMessage =
      error instanceof Error ? error.message : "Nie udało się zaktualizować produktu.";
  }

  redirectWithMessage("/admin/produkty", redirectType, redirectMessage);
}

export async function deleteProductAction(formData: FormData) {
  let redirectType: "success" | "error" = "success";
  let redirectMessage = "Produkt został usunięty.";

  try {
    const { supabase } = await ensureAdmin();
    const productId = formData.get("productId");

    if (typeof productId !== "string" || !productId) {
      throw new Error("Brak identyfikatora produktu.");
    }

    const { data: existingProduct, error: existingError } = await supabase
      .from("products")
      .select("slug, cover_path, file_path")
      .eq("id", productId)
      .maybeSingle();

    if (existingError || !existingProduct) {
      throw existingError ?? new Error("Nie znaleziono produktu.");
    }

    const { data: previews } = await supabase
      .from("product_previews")
      .select("storage_path")
      .eq("product_id", productId);

    const { error } = await supabase.from("products").delete().eq("id", productId);

    if (error) {
      throw error;
    }

    await Promise.all([
      removeStorageFile(PRODUCT_COVERS_BUCKET, existingProduct.cover_path),
      removeStorageFile(PRODUCT_FILES_BUCKET, existingProduct.file_path),
      ...(previews ?? []).map((preview) =>
        removeStorageFile(PRODUCT_COVERS_BUCKET, preview.storage_path),
      ),
    ]);

    revalidatePath("/admin/produkty");
    revalidateStorefront(existingProduct.slug);
  } catch (error) {
    redirectType = "error";
    redirectMessage =
      error instanceof Error
        ? error.message
        : "Nie udało się usunąć produktu. Jeśli produkt ma historię zamówień, zarchiwizuj go zamiast usuwać.";
  }

  redirectWithMessage("/admin/produkty", redirectType, redirectMessage);
}

export async function createProductPreviewAction(formData: FormData) {
  let redirectType: "success" | "error" = "success";
  let redirectMessage = "Preview został dodany.";
  const returnPath = "/admin/produkty";
  let uploadedPreviewPath: string | null = null;

  try {
    const { supabase } = await ensureAdmin();
    const parsed = previewFormSchema.safeParse({
      productId: formData.get("productId"),
      altText: parseNullableString(formData.get("altText")),
      sortOrder: formData.get("sortOrder"),
    });

    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Niepoprawne dane podglądu.");
    }

    const previewFile = formData.get("previewFile");

    if (!(previewFile instanceof File) || previewFile.size === 0) {
      throw new Error("Wybierz plik podglądu.");
    }

    const storagePath = await uploadProductPreview({
      productId: parsed.data.productId,
      previewFile,
    });
    uploadedPreviewPath = storagePath;

    const { error } = await supabase.from("product_previews").insert({
      product_id: parsed.data.productId,
      storage_path: storagePath,
      alt_text: parsed.data.altText ?? previewFile.name,
      sort_order: parsed.data.sortOrder,
    });

    if (error) {
      throw error;
    }

    revalidatePath(returnPath);
  } catch (error) {
    if (uploadedPreviewPath) {
      await cleanupProductFiles({
        previewPaths: [uploadedPreviewPath],
      });
    }

    redirectType = "error";
    redirectMessage =
      error instanceof Error ? error.message : "Nie udało się dodać preview.";
  }

  redirectWithMessage(returnPath, redirectType, redirectMessage);
}

export async function updateProductPreviewAction(formData: FormData) {
  let redirectType: "success" | "error" = "success";
  let redirectMessage = "Preview został zaktualizowany.";
  const returnPath = "/admin/produkty";

  try {
    const { supabase } = await ensureAdmin();
    const previewId = formData.get("previewId");
    const altText = parseNullableString(formData.get("altText")) ?? "";
    const sortOrder = formData.get("sortOrder");

    if (typeof previewId !== "string" || !previewId) {
      throw new Error("Brak identyfikatora preview.");
    }

    const { error } = await supabase
      .from("product_previews")
      .update({
        alt_text: altText,
        sort_order: Number(sortOrder ?? 0),
      })
      .eq("id", previewId);

    if (error) {
      throw error;
    }

    revalidatePath(returnPath);
  } catch (error) {
    redirectType = "error";
    redirectMessage =
      error instanceof Error ? error.message : "Nie udało się zaktualizować preview.";
  }

  redirectWithMessage(returnPath, redirectType, redirectMessage);
}

export async function deleteProductPreviewAction(formData: FormData) {
  let redirectType: "success" | "error" = "success";
  let redirectMessage = "Preview został usunięty.";
  const returnPath = "/admin/produkty";

  try {
    const { supabase } = await ensureAdmin();
    const previewId = formData.get("previewId");

    if (typeof previewId !== "string" || !previewId) {
      throw new Error("Brak identyfikatora preview.");
    }

    const { data: preview, error: previewError } = await supabase
      .from("product_previews")
      .select("storage_path")
      .eq("id", previewId)
      .maybeSingle();

    if (previewError || !preview) {
      throw previewError ?? new Error("Nie znaleziono preview.");
    }

    const { error } = await supabase
      .from("product_previews")
      .delete()
      .eq("id", previewId);

    if (error) {
      throw error;
    }

    await removeStorageFile(PRODUCT_COVERS_BUCKET, preview.storage_path);
    revalidatePath(returnPath);
  } catch (error) {
    redirectType = "error";
    redirectMessage =
      error instanceof Error ? error.message : "Nie udało się usunąć preview.";
  }

  redirectWithMessage(returnPath, redirectType, redirectMessage);
}

export async function updateSiteSectionAction(formData: FormData) {
  let redirectType: "success" | "error" = "success";
  let redirectMessage = "Sekcja została zaktualizowana.";
  const returnPath = "/admin/content";

  try {
    const { supabase } = await ensureAdmin();
    const parsed = contentSectionFormSchema.safeParse({
      sectionId: formData.get("sectionId"),
      eyebrow: formData.get("eyebrow"),
      title: formData.get("title"),
      description: formData.get("description"),
      body: parseNullableString(formData.get("body")) ?? "",
      ctaLabel: parseNullableString(formData.get("ctaLabel")),
      ctaHref: parseNullableString(formData.get("ctaHref")),
      isPublished: parseCheckbox(formData.get("isPublished")),
    });

    const sectionKey = formData.get("sectionKey");

    if (!parsed.success || typeof sectionKey !== "string" || !sectionKey) {
      throw new Error(parsed.error?.issues[0]?.message ?? "Niepoprawne dane sekcji.");
    }

    const payload = {
      eyebrow: parsed.data.eyebrow,
      title: parsed.data.title,
      description: parsed.data.description,
      body: parsed.data.body ?? "",
      cta_label: parsed.data.ctaLabel ?? null,
      cta_href: parsed.data.ctaHref ?? null,
      is_published: parsed.data.isPublished ?? false,
    };

    const query = parsed.data.sectionId
      ? supabase.from("site_sections").update(payload).eq("id", parsed.data.sectionId)
      : supabase.from("site_sections").insert({
          section_key: sectionKey,
          ...payload,
        });

    const { error } = await query;

    if (error) {
      throw error;
    }

    revalidatePath(returnPath);
    revalidateStorefront();
  } catch (error) {
    redirectType = "error";
    redirectMessage =
      error instanceof Error ? error.message : "Nie udało się zapisać sekcji.";
  }

  redirectWithMessage(returnPath, redirectType, redirectMessage);
}

export async function createFaqAction(formData: FormData) {
  let redirectType: "success" | "error" = "success";
  let redirectMessage = "FAQ zostało dodane.";
  const returnPath = "/admin/content";

  try {
    const { supabase } = await ensureAdmin();
    const parsed = faqFormSchema.safeParse({
      question: formData.get("question"),
      answer: formData.get("answer"),
      sortOrder: formData.get("sortOrder"),
      isPublished: parseCheckbox(formData.get("isPublished")),
    });

    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Niepoprawne dane FAQ.");
    }

    const { error } = await supabase.from("faq_items").insert({
      question: parsed.data.question,
      answer: parsed.data.answer,
      sort_order: parsed.data.sortOrder,
      is_published: parsed.data.isPublished ?? false,
    });

    if (error) {
      throw error;
    }

    revalidatePath(returnPath);
    revalidateStorefront();
  } catch (error) {
    redirectType = "error";
    redirectMessage =
      error instanceof Error ? error.message : "Nie udało się dodać FAQ.";
  }

  redirectWithMessage(returnPath, redirectType, redirectMessage);
}

export async function updateFaqAction(formData: FormData) {
  let redirectType: "success" | "error" = "success";
  let redirectMessage = "FAQ zostało zaktualizowane.";
  const returnPath = "/admin/content";

  try {
    const { supabase } = await ensureAdmin();
    const parsed = faqFormSchema.safeParse({
      faqId: formData.get("faqId"),
      question: formData.get("question"),
      answer: formData.get("answer"),
      sortOrder: formData.get("sortOrder"),
      isPublished: parseCheckbox(formData.get("isPublished")),
    });

    if (!parsed.success || !parsed.data.faqId) {
      throw new Error(parsed.error?.issues[0]?.message ?? "Niepoprawne dane FAQ.");
    }

    const { error } = await supabase
      .from("faq_items")
      .update({
        question: parsed.data.question,
        answer: parsed.data.answer,
        sort_order: parsed.data.sortOrder,
        is_published: parsed.data.isPublished ?? false,
      })
      .eq("id", parsed.data.faqId);

    if (error) {
      throw error;
    }

    revalidatePath(returnPath);
    revalidateStorefront();
  } catch (error) {
    redirectType = "error";
    redirectMessage =
      error instanceof Error ? error.message : "Nie udało się zaktualizować FAQ.";
  }

  redirectWithMessage(returnPath, redirectType, redirectMessage);
}

export async function deleteFaqAction(formData: FormData) {
  let redirectType: "success" | "error" = "success";
  let redirectMessage = "FAQ zostało usunięte.";
  const returnPath = "/admin/content";

  try {
    const { supabase } = await ensureAdmin();
    const faqId = formData.get("faqId");

    if (typeof faqId !== "string" || !faqId) {
      throw new Error("Brak identyfikatora FAQ.");
    }

    const { error } = await supabase.from("faq_items").delete().eq("id", faqId);

    if (error) {
      throw error;
    }

    revalidatePath(returnPath);
    revalidateStorefront();
  } catch (error) {
    redirectType = "error";
    redirectMessage =
      error instanceof Error ? error.message : "Nie udało się usunąć FAQ.";
  }

  redirectWithMessage(returnPath, redirectType, redirectMessage);
}

export async function createTestimonialAction(formData: FormData) {
  let redirectType: "success" | "error" = "success";
  let redirectMessage = "Opinia została dodana.";
  const returnPath = "/admin/content";

  try {
    const { supabase } = await ensureAdmin();
    const parsed = testimonialFormSchema.safeParse({
      author: formData.get("author"),
      role: formData.get("role"),
      quote: formData.get("quote"),
      score: formData.get("score"),
      sortOrder: formData.get("sortOrder"),
      isPublished: parseCheckbox(formData.get("isPublished")),
    });

    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Niepoprawne dane opinii.");
    }

    const { error } = await supabase.from("testimonials").insert({
      author: parsed.data.author,
      role: parsed.data.role,
      quote: parsed.data.quote,
      score: parsed.data.score,
      sort_order: parsed.data.sortOrder,
      is_published: parsed.data.isPublished ?? false,
    });

    if (error) {
      throw error;
    }

    revalidatePath(returnPath);
    revalidateStorefront();
  } catch (error) {
    redirectType = "error";
    redirectMessage =
      error instanceof Error ? error.message : "Nie udało się dodać opinii.";
  }

  redirectWithMessage(returnPath, redirectType, redirectMessage);
}

export async function updateTestimonialAction(formData: FormData) {
  let redirectType: "success" | "error" = "success";
  let redirectMessage = "Opinia została zaktualizowana.";
  const returnPath = "/admin/content";

  try {
    const { supabase } = await ensureAdmin();
    const parsed = testimonialFormSchema.safeParse({
      testimonialId: formData.get("testimonialId"),
      author: formData.get("author"),
      role: formData.get("role"),
      quote: formData.get("quote"),
      score: formData.get("score"),
      sortOrder: formData.get("sortOrder"),
      isPublished: parseCheckbox(formData.get("isPublished")),
    });

    if (!parsed.success || !parsed.data.testimonialId) {
      throw new Error(
        parsed.error?.issues[0]?.message ?? "Niepoprawne dane opinii.",
      );
    }

    const { error } = await supabase
      .from("testimonials")
      .update({
        author: parsed.data.author,
        role: parsed.data.role,
        quote: parsed.data.quote,
        score: parsed.data.score,
        sort_order: parsed.data.sortOrder,
        is_published: parsed.data.isPublished ?? false,
      })
      .eq("id", parsed.data.testimonialId);

    if (error) {
      throw error;
    }

    revalidatePath(returnPath);
    revalidateStorefront();
  } catch (error) {
    redirectType = "error";
    redirectMessage =
      error instanceof Error ? error.message : "Nie udało się zaktualizować opinii.";
  }

  redirectWithMessage(returnPath, redirectType, redirectMessage);
}

export async function deleteTestimonialAction(formData: FormData) {
  let redirectType: "success" | "error" = "success";
  let redirectMessage = "Opinia została usunięta.";
  const returnPath = "/admin/content";

  try {
    const { supabase } = await ensureAdmin();
    const testimonialId = formData.get("testimonialId");

    if (typeof testimonialId !== "string" || !testimonialId) {
      throw new Error("Brak identyfikatora opinii.");
    }

    const { error } = await supabase
      .from("testimonials")
      .delete()
      .eq("id", testimonialId);

    if (error) {
      throw error;
    }

    revalidatePath(returnPath);
    revalidateStorefront();
  } catch (error) {
    redirectType = "error";
    redirectMessage =
      error instanceof Error ? error.message : "Nie udało się usunąć opinii.";
  }

  redirectWithMessage(returnPath, redirectType, redirectMessage);
}

export async function createContentPageAction(formData: FormData) {
  let redirectType: "success" | "error" = "success";
  let redirectMessage = "Strona została dodana.";
  const returnPath = "/admin/content";

  try {
    const { supabase } = await ensureAdmin();
    const parsed = contentPageFormSchema.safeParse({
      slug: formData.get("slug"),
      title: formData.get("title"),
      description: formData.get("description"),
      body: formData.get("body"),
      isPublished: parseCheckbox(formData.get("isPublished")),
    });

    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Niepoprawne dane strony.");
    }

    const { error } = await supabase.from("content_pages").insert({
      slug: parsed.data.slug,
      title: parsed.data.title,
      description: parsed.data.description,
      body: parsed.data.body,
      is_published: parsed.data.isPublished ?? false,
    });

    if (error) {
      throw error;
    }

    revalidatePath(returnPath);
    revalidatePath(`/${parsed.data.slug}`);
  } catch (error) {
    redirectType = "error";
    redirectMessage =
      error instanceof Error ? error.message : "Nie udało się dodać strony.";
  }

  redirectWithMessage(returnPath, redirectType, redirectMessage);
}

export async function updateContentPageAction(formData: FormData) {
  let redirectType: "success" | "error" = "success";
  let redirectMessage = "Strona została zaktualizowana.";
  const returnPath = "/admin/content";

  try {
    const { supabase } = await ensureAdmin();
    const parsed = contentPageFormSchema.safeParse({
      pageId: formData.get("pageId"),
      slug: formData.get("slug"),
      title: formData.get("title"),
      description: formData.get("description"),
      body: formData.get("body"),
      isPublished: parseCheckbox(formData.get("isPublished")),
    });

    if (!parsed.success || !parsed.data.pageId) {
      throw new Error(parsed.error?.issues[0]?.message ?? "Niepoprawne dane strony.");
    }

    const { error } = await supabase
      .from("content_pages")
      .update({
        slug: parsed.data.slug,
        title: parsed.data.title,
        description: parsed.data.description,
        body: parsed.data.body,
        is_published: parsed.data.isPublished ?? false,
      })
      .eq("id", parsed.data.pageId);

    if (error) {
      throw error;
    }

    revalidatePath(returnPath);
    revalidatePath(`/${parsed.data.slug}`);
  } catch (error) {
    redirectType = "error";
    redirectMessage =
      error instanceof Error ? error.message : "Nie udało się zaktualizować strony.";
  }

  redirectWithMessage(returnPath, redirectType, redirectMessage);
}

export async function deleteContentPageAction(formData: FormData) {
  let redirectType: "success" | "error" = "success";
  let redirectMessage = "Strona została usunięta.";
  const returnPath = "/admin/content";

  try {
    const { supabase } = await ensureAdmin();
    const pageId = formData.get("pageId");

    if (typeof pageId !== "string" || !pageId) {
      throw new Error("Brak identyfikatora strony.");
    }

    const { error } = await supabase.from("content_pages").delete().eq("id", pageId);

    if (error) {
      throw error;
    }

    revalidatePath(returnPath);
  } catch (error) {
    redirectType = "error";
    redirectMessage =
      error instanceof Error ? error.message : "Nie udało się usunąć strony.";
  }

  redirectWithMessage(returnPath, redirectType, redirectMessage);
}

export async function createAllowlistEntryAction(formData: FormData) {
  let redirectType: "success" | "error" = "success";
  let redirectMessage = "Admin został dodany do allowlisty.";
  const returnPath = "/admin/admini";

  try {
    const { supabase } = await ensureAdmin();
    const parsed = allowlistFormSchema.safeParse({
      email: formData.get("email"),
      note: parseNullableString(formData.get("note")),
      isActive: parseCheckbox(formData.get("isActive")),
    });

    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Niepoprawne dane admina.");
    }

    const { error } = await supabase.from("admin_allowlist").insert({
      email: parsed.data.email.toLowerCase(),
      note: parsed.data.note ?? "",
      is_active: parsed.data.isActive ?? true,
    });

    if (error) {
      throw error;
    }

    revalidatePath(returnPath);
    revalidatePath("/admin");
  } catch (error) {
    redirectType = "error";
    redirectMessage =
      error instanceof Error ? error.message : "Nie udało się dodać admina.";
  }

  redirectWithMessage(returnPath, redirectType, redirectMessage);
}

export async function updateAllowlistEntryAction(formData: FormData) {
  let redirectType: "success" | "error" = "success";
  let redirectMessage = "Allowlista została zaktualizowana.";
  const returnPath = "/admin/admini";

  try {
    const { supabase } = await ensureAdmin();
    const parsed = allowlistFormSchema.safeParse({
      allowlistId: formData.get("allowlistId"),
      email: formData.get("email"),
      note: parseNullableString(formData.get("note")),
      isActive: parseCheckbox(formData.get("isActive")),
    });

    if (!parsed.success || !parsed.data.allowlistId) {
      throw new Error(
        parsed.error?.issues[0]?.message ?? "Niepoprawne dane allowlisty.",
      );
    }

    const { error } = await supabase
      .from("admin_allowlist")
      .update({
        email: parsed.data.email.toLowerCase(),
        note: parsed.data.note ?? "",
        is_active: parsed.data.isActive ?? false,
      })
      .eq("id", parsed.data.allowlistId);

    if (error) {
      throw error;
    }

    revalidatePath(returnPath);
    revalidatePath("/admin");
  } catch (error) {
    redirectType = "error";
    redirectMessage =
      error instanceof Error ? error.message : "Nie udało się zaktualizować allowlisty.";
  }

  redirectWithMessage(returnPath, redirectType, redirectMessage);
}

export async function deleteAllowlistEntryAction(formData: FormData) {
  let redirectType: "success" | "error" = "success";
  let redirectMessage = "Wpis allowlisty został usunięty.";
  const returnPath = "/admin/admini";

  try {
    const { supabase } = await ensureAdmin();
    const allowlistId = formData.get("allowlistId");

    if (typeof allowlistId !== "string" || !allowlistId) {
      throw new Error("Brak identyfikatora wpisu.");
    }

    const { error } = await supabase
      .from("admin_allowlist")
      .delete()
      .eq("id", allowlistId);

    if (error) {
      throw error;
    }

    revalidatePath(returnPath);
    revalidatePath("/admin");
  } catch (error) {
    redirectType = "error";
    redirectMessage =
      error instanceof Error ? error.message : "Nie udało się usunąć wpisu.";
  }

  redirectWithMessage(returnPath, redirectType, redirectMessage);
}

export async function updateSiteSettingsAction(formData: FormData) {
  let redirectType: "success" | "error" = "success";
  let redirectMessage = "Ustawienia merchandisingu zostały zapisane.";
  const returnPath = "/admin/ustawienia";

  try {
    const { supabase } = await ensureAdmin();
    const parsed = siteSettingsFormSchema.safeParse({
      recommendedBundleId: formData.get("recommendedBundleId"),
      homepageFeaturedLimit: formData.get("homepageFeaturedLimit"),
      businessName: parseNullableString(formData.get("businessName")) ?? "",
      businessTaxId: parseNullableString(formData.get("businessTaxId")) ?? "",
      businessAddress: parseNullableString(formData.get("businessAddress")) ?? "",
      supportEmail:
        parseNullableString(formData.get("supportEmail")) ?? "kontakt@templify.store",
    });

    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Niepoprawne dane ustawień.");
    }

    const { error } = await supabase.from("site_settings").upsert(
      [
        {
          key: "recommended_bundle_id",
          value: parsed.data.recommendedBundleId,
        },
        {
          key: "homepage_featured_limit",
          value: String(parsed.data.homepageFeaturedLimit),
        },
        {
          key: "business_name",
          value: parsed.data.businessName ?? "",
        },
        {
          key: "business_tax_id",
          value: parsed.data.businessTaxId ?? "",
        },
        {
          key: "business_address",
          value: parsed.data.businessAddress ?? "",
        },
        {
          key: "support_email",
          value: parsed.data.supportEmail,
        },
      ],
      {
        onConflict: "key",
      },
    );

    if (error) {
      throw error;
    }

    revalidatePath("/admin/ustawienia");
    revalidatePath("/");
  } catch (error) {
    redirectType = "error";
    redirectMessage =
      error instanceof Error ? error.message : "Nie udało się zapisać ustawień.";
  }

  redirectWithMessage(returnPath, redirectType, redirectMessage);
}
