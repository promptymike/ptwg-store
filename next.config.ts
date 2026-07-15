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
const devScript = process.env.NODE_ENV === "production" ? "" : " 'unsafe-eval'";
const devAnalyticsScript =
  process.env.NODE_ENV === "production" ? "" : " https://va.vercel-scripts.com";
const previewScript = isVercelPreview ? " https://vercel.live" : "";
const previewConnect = isVercelPreview
  ? " https://vercel.live https://*.pusher.com wss://*.pusher.com"
  : "";
const previewFrame = isVercelPreview ? " https://vercel.live" : "";
const plannerFontStyles = " https://fonts.googleapis.com";
const plannerFontFiles = " https://fonts.gstatic.com";
const plannerMapTiles = " https://*.basemaps.cartocdn.com";
const plannerWeatherConnect =
  " https://geocoding-api.open-meteo.com https://api.open-meteo.com";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${devScript}${devAnalyticsScript} https://js.stripe.com https://plausible.io${previewScript}`,
  `style-src 'self' 'unsafe-inline'${plannerFontStyles}`,
  `img-src 'self' data: blob: ${supabaseOrigin}${plannerMapTiles}`,
  `font-src 'self' data:${plannerFontFiles}`,
  `connect-src 'self' ${supabaseOrigin} ${supabaseWss} https://plausible.io https://api.stripe.com${plannerWeatherConnect}${previewConnect}`,
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
    // The planner-assets route readFile()s these from node_modules at runtime
    // (dynamic path — invisible to static tracing), so without this list the
    // files are missing from the serverless bundle and every planner loses
    // Chart.js/dayjs/etc. in production (404 → blank analytics).
    "/api/planner-assets/*": [
      "./node_modules/chart.js/dist/chart.umd.js",
      "./node_modules/sortablejs/Sortable.min.js",
      "./node_modules/dayjs/dayjs.min.js",
      "./node_modules/dayjs/locale/pl.js",
      "./node_modules/dayjs/plugin/weekOfYear.js",
      "./node_modules/dayjs/plugin/customParseFormat.js",
      "./node_modules/dayjs/plugin/isBetween.js",
      "./node_modules/lucide/dist/cjs/lucide.js",
      "./node_modules/leaflet/dist/**/*",
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
    // React <ViewTransition> (cover morph) is intentionally OFF: with the
    // flag on, document.startViewTransition freezes rendering AND input for
    // the whole duration of every client-side navigation. On slower routes
    // (/biblioteka: auth middleware + dynamic SSR) the site felt hung for
    // seconds — "strona się zacina, nie da się nic kliknąć". The
    // <ViewTransition> wrapper degrades to a plain passthrough without it.
    // viewTransition: true,
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
