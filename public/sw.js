// Service worker for the PWA. Mostly a graceful offline fallback, plus just
// enough caching to let the vocab review screen run offline on a phone:
//   - the /admin/lib/review shell (so the page loads with no network), and
//   - Next's content-hashed static assets (the JS/CSS the shell needs).
// The review data itself lives in IndexedDB (see lib/offline-deck.ts) and syncs
// via /api/lib/review/sync — API requests are never cached so they always hit
// the live server when online and fail cleanly (falling back to IndexedDB)
// when not. Other pages are server-rendered and deliberately not cached to
// avoid serving stale, auth-sensitive content.

const CACHE_VERSION = "v2";
const OFFLINE_URL = "/offline";
const REVIEW_URL = "/admin/lib/review";
const PRECACHE = `precache-${CACHE_VERSION}`;
const RUNTIME = `runtime-${CACHE_VERSION}`;

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PRECACHE);
      try {
        await cache.add(new Request(OFFLINE_URL, { cache: "reload" }));
      } catch {
        // Offline fallback is optional — never block install on a network blip.
      }
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([PRECACHE, RUNTIME]);
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => !keep.has(k)).map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

// Cache-first for immutable, content-hashed build assets.
async function handleStatic(request) {
  const cache = await caches.open(RUNTIME);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

// Network-first for navigations. Keep a fresh copy of the review shell so it
// can be served when offline; otherwise fall back to the offline page.
async function handleNavigate(request) {
  const url = new URL(request.url);
  const isReview = url.pathname === REVIEW_URL;
  try {
    const response = await fetch(request);
    // Only cache the review shell, and only when the response really is the
    // review page (not a redirect to /login when the session has lapsed).
    if (isReview && response.ok) {
      try {
        const finalPath = new URL(response.url).pathname;
        if (finalPath === REVIEW_URL) {
          const cache = await caches.open(RUNTIME);
          cache.put(REVIEW_URL, response.clone());
        }
      } catch {
        // Ignore caching failures — they must never break navigation.
      }
    }
    return response;
  } catch {
    if (isReview) {
      const cache = await caches.open(RUNTIME);
      const cachedReview = await cache.match(REVIEW_URL);
      if (cachedReview) return cachedReview;
    }
    const precache = await caches.open(PRECACHE);
    const offline = await precache.match(OFFLINE_URL);
    if (offline) return offline;
    return new Response("Offline", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(handleStatic(request));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(handleNavigate(request));
  }
});
