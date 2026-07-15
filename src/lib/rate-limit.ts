import "server-only";

import { createHash } from "node:crypto";

type HeaderReader = Pick<Headers, "get">;

type Bucket = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  limit: number;
  windowMs: number;
};

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;

export function getClientAddress(headers: HeaderReader) {
  const candidate =
    headers.get("cf-connecting-ip") ??
    headers.get("x-real-ip") ??
    headers.get("x-forwarded-for")?.split(",")[0] ??
    "unknown";

  return candidate.trim().slice(0, 80) || "unknown";
}

function compactExpiredBuckets(now: number) {
  if (buckets.size < MAX_BUCKETS) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
  if (buckets.size >= MAX_BUCKETS) {
    const oldestKey = buckets.keys().next().value as string | undefined;
    if (oldestKey) buckets.delete(oldestKey);
  }
}

/**
 * Small process-local abuse guard. It protects each running instance and is
 * intentionally fail-closed at the configured limit. Production should also
 * keep provider/WAF rate limits enabled because serverless instances do not
 * share memory.
 */
export function consumeRateLimit(
  scope: string,
  identifier: string,
  options: RateLimitOptions,
) {
  const now = Date.now();
  compactExpiredBuckets(now);
  const digest = createHash("sha256")
    .update(`${scope}:${identifier}`)
    .digest("base64url");
  const key = `${scope}:${digest}`;
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs });
    return { allowed: true, retryAfterSeconds: 0 } as const;
  }

  if (existing.count >= options.limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((existing.resetAt - now) / 1000),
      ),
    } as const;
  }

  existing.count += 1;
  buckets.set(key, existing);
  return { allowed: true, retryAfterSeconds: 0 } as const;
}
