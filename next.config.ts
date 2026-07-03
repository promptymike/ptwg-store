import type { NextConfig } from "next";

// Derive the Supabase origin from public env so CSP doesn't hardcode the
// project ref. Storage (covers/previews), REST and realtime all live here.
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://*.supabase.co";
let supabaseOrigin = "https://*.supabase.co";
let supabaseWss = "wss://*.supabase.co";
try {
  const u = new URL(supabaseUrl);
  supabaseOrigin = u.origin;
  supabaseWss = `wss://${u.host}`;
} catch {
  // keep wildcard fallback
}

// Content-Security-Policy. Enforcing in production (violations still POST to
// /api/csp-report); Report-Only in dev because HMR needs eval and we don't
// want local tooling noise to block rendering.
// NOTE: 'unsafe-inline' on script/style is temporary — the inline theme script
// and Tailwind inline styles need it until we move to nonce-based CSP.
// When GTM/GA/Meta are enabled, add their domains to script-src/connect-src/img-src.
// Vercel preview deployments inject the vercel.live toolbar (+ Pusher
// websockets), so those origins are appended only for VERCEL_ENV=preview.
const isVercelPreview = process.env.VERCEL_ENV === "preview";
const previewScript = isVercelPreview ? " https://vercel.live" : "";
const previewConnect = isVercelPreview
  ? " https://vercel.live https://*.pusher.com wss://*.pusher.com"
  : "";
const previewFrame = isVercelPreview ? " https://vercel.live" : "";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://js.stripe.com https://plausible.io${previewScript}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${supabaseOrigin}`,
  "font-src 'self' data:",
  `connect-src 'self' ${supabaseOrigin} ${supabaseWss} https://plausible.io https://api.stripe.com${previewConnect}`,
  `frame-src 'self' https://js.stripe.com https://hooks.stripe.com${previewFrame}`,
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self' https://checkout.stripe.com",
  "object-src 'none'",
  "report-uri /api/csp-report",
].join("; ");

const cspHeaderName =
  process.env.NODE_ENV === "production"
    ? "Content-Security-Policy"
    : "Content-Security-Policy-Report-Only";

// Baseline security headers applied to every response. These are the
// non-breaking, broadly-recommended defaults.
const securityHeaders = [
  // Force HTTPS for two years incl. subdomains. Safe on Vercel (always TLS).
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Stop browsers from MIME-sniffing a response away from its declared type.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Clickjacking protection. SAMEORIGIN (not DENY) so the storefront can keep
  // framing its own same-origin interactive planner embeds.
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Don't leak full URLs (with query/UTM) to third-party origins.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Drop access to powerful features the storefront never uses.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // Enforcing in production, Report-Only in dev — see note above.
  { key: cspHeaderName, value: csp },
];

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/planners/*": ["./templates/interactive-planners/**/*.html"],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
    // React <ViewTransition> — shared-element morph between the product-card
    // cover and the product-page hero. See src/components/ui/view-transition.tsx.
    viewTransition: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
