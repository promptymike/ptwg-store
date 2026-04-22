export const PRODUCT_FILES_BUCKET = "product-files";
export const PRODUCT_COVERS_BUCKET = "product-covers";

export const FILE_LIMITS = {
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

export type UploadKind = keyof typeof FILE_LIMITS;

export function getFileExtension(fileName: string) {
  const lastDotIndex = fileName.lastIndexOf(".");

  if (lastDotIndex === -1) {
    return "";
  }

  return fileName.slice(lastDotIndex).toLowerCase();
}

export function validateUploadMetadata(
  kind: UploadKind,
  file: {
    name: string;
    size: number;
    type?: string | null;
  },
) {
  const rules = FILE_LIMITS[kind];
  const extension = getFileExtension(file.name);

  if (file.size <= 0) {
    return "Plik jest pusty.";
  }

  if (file.size > rules.maxBytes) {
    return `Plik jest za duzy. Limit dla tego typu uploadu to ${Math.round(
      rules.maxBytes / 1024 / 1024,
    )} MB.`;
  }

  if (!(rules.allowedExtensions as readonly string[]).includes(extension)) {
    return `Niedozwolone rozszerzenie pliku. Dozwolone: ${rules.allowedExtensions.join(", ")}.`;
  }

  if (
    file.type &&
    !(rules.allowedMimeTypes as readonly string[]).includes(file.type)
  ) {
    return `Niedozwolony typ pliku. Dozwolone: ${rules.allowedMimeTypes.join(", ")}.`;
  }

  return null;
}

export function getUploadLimitMb(kind: UploadKind) {
  return Math.round(FILE_LIMITS[kind].maxBytes / 1024 / 1024);
}
