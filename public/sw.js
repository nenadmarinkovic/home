// Service worker for the PWA. Gives a graceful offline fallback and caches
// enough to let the site — and especially the vocab review screen — run offline
// on a phone:
//   - the app entry points are precached at install (so launching the installed
//     PWA offline works, since it always opens at start_url "/"),
//   - every successful page navigation is cached so any page you've visited is
//     available offline, and
//   - Next's content-hashed static assets (the JS/CSS each page needs) are
//     cached on demand.
// The review data itself lives in IndexedDB (see lib/offline-deck.ts) and syncs
// via /api/lib/review/sync. API requests are never cached, so they always hit
// the live server when online and fail cleanly (the review screen then falls
// back to IndexedDB) when not.

const CACHE_VERSION = "v3";
const OFFLINE_URL = "/offline";
const PRECACHE = `precache-${CACHE_VERSION}`;
const RUNTIME = `runtime-${CACHE_VERSION}`;

// Entry points worth having before the user ever visits them offline. "/" is
// the PWA start_url; the lib paths are the offline review flow.
const PRECACHE_PAGES = ["/", "/admin/lib", "/admin/lib/review"];

// Cache a navigation response under its pathname, but only when it's the real
// page — not a redirect (e.g. to /login when the session has lapsed) or an
// error. Keying by pathname keeps lookups deterministic across requests.
async function cacheNavigation(pathname, response) {
  if (!response || !response.ok || response.redirected) return;
  if (response.type !== "basic") return;
  const cache = await caches.open(RUNTIME);
  await cache.put(pathname, response.clone());
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const precache = await caches.open(PRECACHE);
      try {
        await precache.add(new Request(OFFLINE_URL, { cache: "reload" }));
      } catch {
        // Offline fallback is optional — never block install on a network blip.
      }
      // Warm the entry points. Each is best-effort and guarded so a redirect to
      // login (unauthenticated) never gets cached as the page.
      await Promise.all(
        PRECACHE_PAGES.map(async (path) => {
          try {
            const response = await fetch(new Request(path, { cache: "reload" }));
            await cacheNavigation(path, response);
          } catch {
            // Will be cached on first successful navigation instead.
          }
        }),
      );
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

// Network-first for navigations: keep the latest copy of each visited page and
// serve it (or the offline page) when the network is gone.
async function handleNavigate(request) {
  const pathname = new URL(request.url).pathname;
  try {
    const response = await fetch(request);
    await cacheNavigation(pathname, response);
    return response;
  } catch {
    const cache = await caches.open(RUNTIME);
    const cached = await cache.match(pathname);
    if (cached) return cached;
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
