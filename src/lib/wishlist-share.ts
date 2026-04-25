// Compact share-token encoding for wishlist URLs. UUIDs are 36 chars
// each — bundling 3-5 of them into a query string would be ugly, so we
// strip dashes and base64url the joined byte string. Keeps the URL
// readable up to ~20 items before query-length limits start to bite.

const UUID_BYTE_LENGTH = 16;

function uuidToBytes(uuid: string): Uint8Array | null {
  const hex = uuid.replace(/-/g, "");
  if (hex.length !== 32 || /[^0-9a-fA-F]/.test(hex)) return null;
  const bytes = new Uint8Array(UUID_BYTE_LENGTH);
  for (let i = 0; i < UUID_BYTE_LENGTH; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function bytesToUuid(bytes: Uint8Array, offset: number): string | null {
  if (offset + UUID_BYTE_LENGTH > bytes.length) return null;
  const hex: string[] = [];
  for (let i = 0; i < UUID_BYTE_LENGTH; i++) {
    hex.push(bytes[offset + i].toString(16).padStart(2, "0"));
  }
  const flat = hex.join("");
  return `${flat.slice(0, 8)}-${flat.slice(8, 12)}-${flat.slice(12, 16)}-${flat.slice(16, 20)}-${flat.slice(20)}`;
}

function base64UrlEncode(bytes: Uint8Array): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
  }
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecode(value: string): Uint8Array | null {
  try {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/");
    const padding = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
    const normalized = padded + padding;
    if (typeof Buffer !== "undefined") {
      return new Uint8Array(Buffer.from(normalized, "base64"));
    }
    const binary = atob(normalized);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  } catch {
    return null;
  }
}

export function encodeShareToken(productIds: string[]): string {
  const valid = productIds.slice(0, 50);
  const buffer = new Uint8Array(valid.length * UUID_BYTE_LENGTH);
  let offset = 0;
  for (const id of valid) {
    const bytes = uuidToBytes(id);
    if (!bytes) continue;
    buffer.set(bytes, offset);
    offset += UUID_BYTE_LENGTH;
  }
  return base64UrlEncode(buffer.subarray(0, offset));
}

export function decodeShareToken(token: string): string[] {
  if (!token) return [];
  const bytes = base64UrlDecode(token);
  if (!bytes || bytes.length % UUID_BYTE_LENGTH !== 0) return [];
  const ids: string[] = [];
  for (let offset = 0; offset < bytes.length; offset += UUID_BYTE_LENGTH) {
    const id = bytesToUuid(bytes, offset);
    if (id) ids.push(id);
  }
  return ids;
}
