import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

import { env } from "@/lib/env";

const TOKEN_TTL_SECONDS = 10 * 60;
const CLOCK_SKEW_SECONDS = 30;

type PlannerEmbedAccessPayload = {
  slug: string;
  nonce: string;
  expiresAt: number;
};

function getSigningSecret() {
  if (!env.supabaseSecretKey) {
    throw new Error("Planner embed signing secret is not configured.");
  }

  return env.supabaseSecretKey;
}

function createSignature(encodedPayload: string) {
  return createHmac("sha256", getSigningSecret())
    .update(encodedPayload)
    .digest("base64url");
}

export function createPlannerEmbedAccessToken({
  slug,
}: {
  slug: string;
}) {
  const payload: PlannerEmbedAccessPayload = {
    slug,
    nonce: randomBytes(12).toString("base64url"),
    expiresAt: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");

  return `${encodedPayload}.${createSignature(encodedPayload)}`;
}

export function verifyPlannerEmbedAccessToken(token: string | null, slug: string) {
  if (!token) return false;

  const parts = token.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return false;

  const [encodedPayload, providedSignature] = parts;
  let expectedSignature: Buffer;
  let receivedSignature: Buffer;

  try {
    expectedSignature = Buffer.from(createSignature(encodedPayload), "base64url");
    receivedSignature = Buffer.from(providedSignature, "base64url");
  } catch {
    return false;
  }

  if (
    expectedSignature.length !== receivedSignature.length ||
    !timingSafeEqual(expectedSignature, receivedSignature)
  ) {
    return false;
  }

  let payload: PlannerEmbedAccessPayload;
  try {
    payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as PlannerEmbedAccessPayload;
  } catch {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  return (
    payload.slug === slug &&
    typeof payload.nonce === "string" &&
    payload.nonce.length >= 16 &&
    Number.isInteger(payload.expiresAt) &&
    payload.expiresAt >= now - CLOCK_SKEW_SECONDS &&
    payload.expiresAt <= now + TOKEN_TTL_SECONDS + CLOCK_SKEW_SECONDS
  );
}
