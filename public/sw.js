
const CACHE_VERSION =
  new URL(self.location.href).searchParams.get("v") || "static";
const OFFLINE_URL = "/offline";
const PRECACHE = `precache-${CACHE_VERSION}`;
const RUNTIME = `runtime-${CACHE_VERSION}`;

const STATIC = "static-assets";

const PRECACHE_PAGES = ["/", "/admin/lib", "/admin/lib/review"];

async function cacheNavigation(pathname, response) {
  if (!response || !response.ok || response.redirected) return;
  if (response.type !== "basic") return;
  const cache = await caches.open(RUNTIME);
  await cache.put(pathname, response.clone());
}

async function warmStaticAssets(html) {
  const matches = html.match(/\/_next\/static\/[^"'\\\s)]+/g);
  if (!matches) return;
  const urls = Array.from(new Set(matches));
  const cache = await caches.open(STATIC);
  await Promise.all(
    urls.map(async (url) => {
      try {
        if (await cache.match(url)) return;
        const response = await fetch(url, { cache: "reload" });
        if (response.ok) await cache.put(url, response.clone());
      } catch {
      }
    }),
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const precache = await caches.open(PRECACHE);
      try {
        await precache.add(new Request(OFFLINE_URL, { cache: "reload" }));
      } catch {
      }
      await Promise.all(
        PRECACHE_PAGES.map(async (path) => {
          try {
            const response = await fetch(new Request(path, { cache: "reload" }));
            if (!response.ok || response.redirected) return;
            await cacheNavigation(path, response);
            await warmStaticAssets(await response.text());
          } catch {
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
      const keep = new Set([PRECACHE, RUNTIME, STATIC]);
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => !keep.has(k)).map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

async function handleStatic(request) {
  const cache = await caches.open(STATIC);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

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
