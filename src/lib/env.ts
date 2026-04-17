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
