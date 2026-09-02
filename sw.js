// SMART CALCULATOR SERVICE WORKER
// Version: 2.2.0

const APP_VERSION = "2.2.0";
const CACHE_NAME = `smart-calculator-${APP_VERSION}`;

const CORE_FILES = [
  "./",
  "./index.html",
  "./manifest.json"
];

function isSameOrigin(request) {
  return new URL(request.url).origin === self.location.origin;
}

function isServiceWorkerFile(request) {
  return new URL(request.url).pathname.endsWith("/sw.js");
}

async function putInCache(request, response) {
  if (!response || response.status !== 200) return;

  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
  } catch (error) {
    console.warn("[SW] Cache write failed:", error);
  }
}

// INSTALL
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async cache => {
        for (const file of CORE_FILES) {
          try {
            await cache.add(file);
          } catch (error) {
            console.warn("[SW] Could not cache:", file, error);
          }
        }
      })
      .then(() => self.skipWaiting())
  );
});

// ACTIVATE
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name =>
              name.startsWith("smart-calculator-") &&
              name !== CACHE_NAME
            )
            .map(name => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// FETCH
self.addEventListener("fetch", event => {
  const request = event.request;

  // Only handle GET requests
  if (request.method !== "GET") return;

  // Ignore external websites
  if (!isSameOrigin(request)) return;

  // Do not intercept sw.js itself
  if (isServiceWorkerFile(request)) return;

  event.respondWith(
    (async () => {
      try {
        // Always try the newest version from the server first
        const response = await fetch(request, {
          cache: "no-store"
        });

        if (response && response.ok) {
          await putInCache(request, response);
        }

        return response;

      } catch (error) {
        // If internet/server is unavailable,
        // use the cached version
        const cached = await caches.match(request);

        if (cached) {
          return cached;
        }

        // For page navigation, fall back to index.html
        if (request.mode === "navigate") {
          const index = await caches.match("./index.html");

          if (index) {
            return index;
          }
        }

        throw error;
      }
    })()
  );
});

// FORCE UPDATE
self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
