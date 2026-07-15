import { NextResponse } from "next/server";

import { env, getMissingStripeCheckoutEnv } from "@/lib/env";
import { hasCompleteSellerIdentity } from "@/lib/legal-readiness";
import {
  PURCHASES_ENABLED,
  PURCHASES_UNAVAILABLE_MESSAGE,
} from "@/lib/purchase-availability";
import { isCurrentUserAdmin } from "@/lib/session";
import { getSiteSettingsSnapshot } from "@/lib/supabase/store";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Diagnostic endpoint for the checkout flow. Public clients get a
 * minimal `{ ready, testMode }` payload. Dev builds and admins
 * additionally receive the list of missing env vars so QA can see why
 * the checkout is gated without exposing the list to random visitors.
 */
export async function GET() {
  const missing = getMissingStripeCheckoutEnv();
  const siteSettings = await getSiteSettingsSnapshot();
  const sellerIdentityConfigured = hasCompleteSellerIdentity(siteSettings);
  const ready =
    PURCHASES_ENABLED && missing.length === 0 && sellerIdentityConfigured;
  const publishable = env.stripePublishableKey ?? "";
  const testMode = publishable.startsWith("pk_test_");
  const liveMode = publishable.startsWith("pk_live_");

  let revealDetails = isDev;

  if (!revealDetails) {
    try {
      revealDetails = await isCurrentUserAdmin();
    } catch {
      revealDetails = false;
    }
  }

  return NextResponse.json({
    ready,
    purchasesEnabled: PURCHASES_ENABLED,
    message: !PURCHASES_ENABLED
      ? PURCHASES_UNAVAILABLE_MESSAGE
      : sellerIdentityConfigured
        ? undefined
        : "Płatności są chwilowo niedostępne.",
    testMode,
    liveMode,
    siteUrl: env.siteUrl ?? null,
    missing: revealDetails ? missing : undefined,
    webhookConfigured: Boolean(env.stripeWebhookSecret),
    sellerIdentityConfigured,
    diagnosticsVisible: revealDetails,
  });
}
