import { NextResponse } from "next/server";

import { env, getMissingStripeCheckoutEnv } from "@/lib/env";
import { isCurrentUserAdmin } from "@/lib/session";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Diagnostic endpoint for the checkout flow. Public clients get a
 * minimal `{ ready, testMode }` payload. Dev builds and admins
 * additionally receive the list of missing env vars so QA can see why
 * the checkout is gated without exposing the list to random visitors.
 */
export async function GET() {
  const missing = getMissingStripeCheckoutEnv();
  const ready = missing.length === 0;
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
    testMode,
    liveMode,
    siteUrl: env.siteUrl ?? null,
    missing: revealDetails ? missing : undefined,
    webhookConfigured: Boolean(env.stripeWebhookSecret),
  });
}
