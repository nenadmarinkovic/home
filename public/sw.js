// Lightweight service worker. Existing only so iOS treats the site as a
// fully-fledged PWA and to give a graceful offline fallback for navigations.
// Intentionally no aggressive caching — pages are rendered server-side and we
// don't want stale auth-sensitive content served from the SW cache.

const CACHE_VERSION = "v1";
const OFFLINE_URL = "/offline";
const PRECACHE = `precache-${CACHE_VERSION}`;

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
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== PRECACHE).map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  if (request.mode !== "navigate") return;

  event.respondWith(
    (async () => {
      try {
        return await fetch(request);
      } catch {
        const cache = await caches.open(PRECACHE);
        const cached = await cache.match(OFFLINE_URL);
        if (cached) return cached;
        return new Response("Offline", {
          status: 503,
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      }
    })(),
  );
});
