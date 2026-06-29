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

// Content-Security-Policy. Shipped in Report-Only first: it never blocks, only
// reports violations to /api/csp-report so we can confirm every integration
// (Stripe, Supabase, Plausible, inline theme/JSON-LD scripts) is covered before
// switching the header name to enforcing `Content-Security-Policy`.
// NOTE: 'unsafe-inline' on script/style is temporary — the inline theme script
// and Tailwind inline styles need it until we move to nonce-based CSP.
// When GTM/GA/Meta are enabled, add their domains to script-src/connect-src/img-src.
const cspReportOnly = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://js.stripe.com https://plausible.io`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${supabaseOrigin}`,
  "font-src 'self' data:",
  `connect-src 'self' ${supabaseOrigin} ${supabaseWss} https://plausible.io https://api.stripe.com`,
  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self' https://checkout.stripe.com",
  "object-src 'none'",
  "report-uri /api/csp-report",
].join("; ");

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
  // Report-Only for now — see note above. Switch to "Content-Security-Policy"
  // to enforce once the violation report is clean.
  { key: "Content-Security-Policy-Report-Only", value: cspReportOnly },
];

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/planners/*": ["./templates/interactive-planners/**/*.html"],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
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
