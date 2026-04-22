/**
 * Shared product-display helpers used by the storefront, the library and the
 * admin preview. Kept client- and server-safe (no imports from "server-only"
 * or browser-only modules) so both server components and interactive controls
 * can import from the same source of truth.
 */

export const DEFAULT_COVER_IMAGE_OPACITY = 40;

export const MIN_COVER_IMAGE_OPACITY = 0;
export const MAX_COVER_IMAGE_OPACITY = 100;

/**
 * Normalize an opacity percentage coming from the admin form / database.
 * Clamps to [0, 100] and falls back to the default when the input is missing
 * or not a finite number. Rounds to an integer so we never store fractional
 * percentages.
 */
export function normalizeCoverImageOpacity(value: unknown): number {
  const numeric =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;

  if (!Number.isFinite(numeric)) {
    return DEFAULT_COVER_IMAGE_OPACITY;
  }

  return Math.max(
    MIN_COVER_IMAGE_OPACITY,
    Math.min(MAX_COVER_IMAGE_OPACITY, Math.round(numeric)),
  );
}

/**
 * Read the cover image opacity from a Product-like input and return a number
 * between 0 and 1 that can be passed directly to the `opacity` CSS property.
 */
export function getCoverImageOverlayOpacity(
  product: { coverImageOpacity?: number | null } | null | undefined,
): number {
  return normalizeCoverImageOpacity(product?.coverImageOpacity) / 100;
}
