export const env = {
  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000",
  appUrl:
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabasePublishableKey:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  supabaseSecretKey:
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY,
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  // Off by default. Flip STRIPE_TAX_ENABLED=true once a Polish Tax
  // registration exists in the Stripe dashboard — automatic_tax fails
  // session creation if Tax is not active on the account.
  stripeTaxEnabled: process.env.STRIPE_TAX_ENABLED === "true",
  // Plausible (privacy-friendly analytics). Only loaded after the user
  // grants analytics consent — see plausible-analytics.tsx.
  plausibleDomain: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
  plausibleScriptSrc:
    process.env.NEXT_PUBLIC_PLAUSIBLE_SRC ?? "https://plausible.io/js/script.js",
  // Optional future paid-media tooling. Do not load these scripts directly:
  // wire them through the consent-aware analytics layer first.
  gtmId: process.env.NEXT_PUBLIC_GTM_ID,
  gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID,
  // Resend (transactional email). Optional — when missing, the post-purchase
  // emails are skipped silently so tests and local dev keep working.
  resendApiKey: process.env.RESEND_API_KEY,
  resendFromAddress:
    process.env.RESEND_FROM_ADDRESS ?? "Templify <noreply@templify.pl>",
  resendReplyTo: process.env.RESEND_REPLY_TO ?? "kontakt@templify.store",
  // Optional Resend Audience id for newsletter contacts. When set, every
  // subscription syncs to that audience so admins can fire broadcasts
  // straight from resend.com/audiences.
  resendAudienceId: process.env.RESEND_AUDIENCE_ID,
  // Vercel Cron sends Authorization: Bearer <CRON_SECRET>. Required for
  // /api/cron/* endpoints — without it they 503 so a public hit never
  // accidentally fires the drip.
  cronSecret: process.env.CRON_SECRET,
  // Web Push (VAPID). Generate once with:
  //   npx web-push generate-vapid-keys
  // Public key is exposed to the browser to subscribe; private key only on
  // the server. Subject is a mailto: URL Apple/Mozilla require for routing.
  vapidPublicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  vapidPrivateKey: process.env.VAPID_PRIVATE_KEY,
  vapidSubject: process.env.VAPID_SUBJECT ?? "mailto:kontakt@templify.pl",
};

export function hasSupabaseEnv() {
  return Boolean(env.supabaseUrl && env.supabasePublishableKey);
}

export function hasStripeEnv() {
  return Boolean(
    env.siteUrl &&
      env.stripePublishableKey &&
      env.stripeSecretKey &&
      env.stripeWebhookSecret,
  );
}

export function getMissingSupabaseEnv() {
  return [
    !env.supabaseUrl ? "NEXT_PUBLIC_SUPABASE_URL" : null,
    !env.supabasePublishableKey
      ? "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
      : null,
    !env.supabaseSecretKey ? "SUPABASE_SECRET_KEY" : null,
  ].filter(Boolean);
}

/**
 * Returns the list of env vars missing to run the Stripe checkout flow
 * server-side. Must NOT be called from client code — `STRIPE_SECRET_KEY`
 * is not prefixed with `NEXT_PUBLIC_`, so it is always `undefined` in the
 * browser bundle, which would produce a false positive and trigger the
 * "Płatności chwilowo niedostępne" fallback even when the server is
 * properly configured.
 */
export function getMissingStripeCheckoutEnv() {
  return [
    !env.siteUrl ? "NEXT_PUBLIC_SITE_URL" : null,
    !env.stripePublishableKey ? "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" : null,
    !env.stripeSecretKey ? "STRIPE_SECRET_KEY" : null,
  ].filter(Boolean);
}

export function getMissingStripeWebhookEnv() {
  return [
    !env.siteUrl ? "NEXT_PUBLIC_SITE_URL" : null,
    !env.stripeSecretKey ? "STRIPE_SECRET_KEY" : null,
    !env.stripeWebhookSecret ? "STRIPE_WEBHOOK_SECRET" : null,
  ].filter(Boolean);
}

export function getMissingLaunchCriticalEnv() {
  return [
    ...getMissingSupabaseEnv(),
    !env.siteUrl ? "NEXT_PUBLIC_SITE_URL" : null,
    !env.stripePublishableKey ? "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" : null,
    !env.stripeSecretKey ? "STRIPE_SECRET_KEY" : null,
    !env.stripeWebhookSecret ? "STRIPE_WEBHOOK_SECRET" : null,
  ].filter((value, index, values): value is string => {
    return Boolean(value) && values.indexOf(value) === index;
  });
}

/**
 * Client-safe helper: returns whether the publishable key is present and
 * whether we are running against Stripe test mode. Only reads
 * `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, so it is safe to call from the
 * browser.
 */
export function getClientStripeStatus() {
  const publishable = env.stripePublishableKey ?? "";
  return {
    hasPublishableKey: publishable.length > 0,
    testMode: publishable.startsWith("pk_test_"),
    liveMode: publishable.startsWith("pk_live_"),
  };
}
