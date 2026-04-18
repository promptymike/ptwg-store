import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/server";

export const PRODUCT_FILES_BUCKET = "product-files";
export const PRODUCT_COVERS_BUCKET = "product-covers";

const FILE_LIMITS = {
  cover: {
    maxBytes: 8 * 1024 * 1024,
    allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
    allowedExtensions: [".png", ".jpg", ".jpeg", ".webp"],
  },
  preview: {
    maxBytes: 8 * 1024 * 1024,
    allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
    allowedExtensions: [".png", ".jpg", ".jpeg", ".webp"],
  },
  product: {
    maxBytes: 50 * 1024 * 1024,
    allowedMimeTypes: [
      "application/pdf",
      "application/zip",
      "application/x-zip-compressed",
    ],
    allowedExtensions: [".pdf", ".zip"],
  },
} as const;

type UploadKind = keyof typeof FILE_LIMITS;

function getFileExtension(fileName: string) {
  const lastDotIndex = fileName.lastIndexOf(".");

  if (lastDotIndex === -1) {
    return "";
  }

  return fileName.slice(lastDotIndex).toLowerCase();
}

export function validateUploadFile(kind: UploadKind, file: File) {
  const rules = FILE_LIMITS[kind];
  const extension = getFileExtension(file.name);

  if (file.size <= 0) {
    return "Plik jest pusty.";
  }

  if (file.size > rules.maxBytes) {
    return `Plik jest za duży. Limit dla tego typu uploadu to ${Math.round(
      rules.maxBytes / 1024 / 1024,
    )} MB.`;
  }

  if (!(rules.allowedExtensions as readonly string[]).includes(extension)) {
    return `Niedozwolone rozszerzenie pliku. Dozwolone: ${rules.allowedExtensions.join(", ")}.`;
  }

  if (file.type && !(rules.allowedMimeTypes as readonly string[]).includes(file.type)) {
    return `Niedozwolony typ pliku. Dozwolone: ${rules.allowedMimeTypes.join(", ")}.`;
  }

  return null;
}

export async function createProductFileSignedUrl(
  filePath: string,
  expiresIn = 60,
) {
  const supabase = createSupabaseAdminClient();

  if (!supabase || !filePath) {
    return null;
  }

  const { data, error } = await supabase.storage
    .from(PRODUCT_FILES_BUCKET)
    .createSignedUrl(filePath, expiresIn);

  if (error) {
    return null;
  }

  return data.signedUrl;
}

export async function createProductCoverSignedUrl(
  coverPath: string,
  expiresIn = 3600,
) {
  const supabase = createSupabaseAdminClient();

  if (!supabase || !coverPath) {
    return null;
  }

  const { data, error } = await supabase.storage
    .from(PRODUCT_COVERS_BUCKET)
    .createSignedUrl(coverPath, expiresIn);

  if (error) {
    return null;
  }

  return data.signedUrl;
}

export async function uploadStorageFile(
  bucket: typeof PRODUCT_FILES_BUCKET | typeof PRODUCT_COVERS_BUCKET,
  path: string,
  file: File,
) {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return { data: null, error: new Error("Brak konfiguracji Supabase.") };
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const { data, error } = await supabase.storage.from(bucket).upload(path, bytes, {
    contentType: file.type || undefined,
    upsert: true,
  });

  if (error) {
    return { data: null, error };
  }

  return { data, error: null };
}

export async function removeStorageFile(
  bucket: typeof PRODUCT_FILES_BUCKET | typeof PRODUCT_COVERS_BUCKET,
  path?: string | null,
) {
  const supabase = createSupabaseAdminClient();

  if (!supabase || !path) {
    return;
  }

  await supabase.storage.from(bucket).remove([path]);
}
