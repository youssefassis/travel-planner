/**
 * Wanderly's service worker.
 *
 * The app is entirely static and client-side — the trip engine, the city
 * dataset, and the traveler's saved plans all live in the browser — so once
 * the shell and its chunks are cached, the planner keeps working on a plane
 * or a foreign SIM. Nothing here talks to a server that has to be reachable.
 *
 * Deliberately conservative: GET only, same-origin only, never cache a
 * response that isn't a clean 200, and bump CACHE to retire everything at
 * once if this logic ever needs undoing.
 */

const CACHE = "wanderly-v2";

/** Enough to open the app cold with no network. */
const SHELL = ["/", "/planner", "/explore", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      // One bad URL shouldn't abort the whole install.
      .then((cache) => Promise.allSettled(SHELL.map((url) => cache.add(url))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

/** Only a clean, same-origin 200 is worth keeping. */
function isCacheable(response) {
  return Boolean(response) && response.status === 200 && response.type === "basic";
}

/** Immutable build output and icons — safe to serve from cache first. */
function isStaticAsset(url) {
  return url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/");
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (isCacheable(response)) {
    const cache = await caches.open(CACHE);
    cache.put(request, response.clone());
  }
  return response;
}

/** Fresh when there's a network, the last good copy when there isn't. */
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (isCacheable(response)) {
      const cache = await caches.open(CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = (await caches.match(request)) ?? (await caches.match("/planner"));
    if (cached) return cached;
    throw error;
  }
}

async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  const fresh = fetch(request)
    .then(async (response) => {
      if (isCacheable(response)) {
        const cache = await caches.open(CACHE);
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => undefined);

  return cached ?? (await fresh) ?? Response.error();
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // map tiles and the like

  // React Server Component payloads are keyed by a query the router owns;
  // caching them would serve stale trees. Let them fail and let the router
  // fall back to a full navigation, which the cache can answer.
  if (url.searchParams.has("_rsc")) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});
