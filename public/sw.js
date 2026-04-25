// Templify service worker — minimal, cache-first for static assets,
// network-first for HTML so the user never gets a stale storefront.
// Reader content is private (signed URLs) so we deliberately do NOT
// cache /api/library/*, only the shell.

const CACHE_VERSION = "templify-v1";
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

self.addEventListener("install", (event) => {
  // Skip waiting so a redeploy activates the new SW on the next reload.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => !key.startsWith(CACHE_VERSION))
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never cache mutating endpoints, auth, Stripe, fulfillment or
  // signed-url library content — all sensitive or high-cost to mis-serve.
  if (
    url.pathname.startsWith("/api/checkout") ||
    url.pathname.startsWith("/api/stripe") ||
    url.pathname.startsWith("/api/library") ||
    url.pathname.startsWith("/api/admin") ||
    url.pathname.startsWith("/api/analytics") ||
    url.pathname.startsWith("/auth")
  ) {
    return;
  }

  // Static assets (icons, fonts, _next chunks): cache-first, opportunistic
  // background revalidation.
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/_next/image") ||
    url.pathname.match(/\.(?:png|jpg|jpeg|svg|webp|woff2?|ico)$/i)
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Documents / pages: network-first, fall back to cache.
  if (request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(networkFirst(request));
  }
});

async function cacheFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return cached ?? new Response("Offline", { status: 503 });
  }
}

async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    return new Response("Jesteś offline. Wróć, gdy znowu masz internet.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
