import "server-only";

import {
  PRODUCT_COVERS_BUCKET,
  PRODUCT_FILES_BUCKET,
  type UploadKind,
  validateUploadMetadata,
} from "@/lib/upload-config";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export { PRODUCT_COVERS_BUCKET, PRODUCT_FILES_BUCKET };

export function validateUploadFile(kind: UploadKind, file: File) {
  return validateUploadMetadata(kind, {
    name: file.name,
    size: file.size,
    type: file.type,
  });
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
  if (/^https?:\/\//i.test(coverPath)) {
    return coverPath;
  }

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

/**
 * Server-side copy inside the product-files bucket. Used by the checkout
 * fulfillment to stamp out a per-user instance ("klatkę") of the master
 * product file so each customer reads/edits their own copy.
 *
 * Returns the destination path on success, or null if the copy fails — the
 * caller should fall back to the master file_path so the customer still
 * gets *something* in their library.
 */
export async function copyProductFileToInstance(
  sourcePath: string,
  destinationPath: string,
): Promise<string | null> {
  const supabase = createSupabaseAdminClient();

  if (!supabase || !sourcePath || !destinationPath) {
    return null;
  }

  const { error } = await supabase.storage
    .from(PRODUCT_FILES_BUCKET)
    .copy(sourcePath, destinationPath);

  if (error) {
    // Don't throw: a copy failure (e.g. destination exists from a previous
    // partial fulfillment) shouldn't break the order. Caller falls back to
    // the master file_path.
    console.warn(
      `[storage] failed to copy product file ${sourcePath} -> ${destinationPath}:`,
      error.message,
    );
    return null;
  }

  return destinationPath;
}

/**
 * Build the per-user instance path for a given user/product/master path.
 * Lives next to the storage helper because the routing decision (which
 * filename to keep) is a storage concern, not a checkout concern.
 */
export function buildInstanceStoragePath(
  userId: string,
  productId: string,
  masterFilePath: string,
): string {
  const filename = masterFilePath.split("/").pop() ?? "instance";
  return `instances/${userId}/${productId}/${filename}`;
}
