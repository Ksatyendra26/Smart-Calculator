// Smart Calculator Service Worker
// Version: 2.1.0

const CACHE_NAME = "smart-calculator-v2.1.0";

const CORE_FILES = [
  "./",
  "./index.html",
  "./manifest.json"
];

// Install new Service Worker
self.addEventListener("install", (event) => {
  console.log("[SW] Installing:", CACHE_NAME);

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_FILES))
      .then(() => self.skipWaiting())
  );
});

// Activate and delete old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating:", CACHE_NAME);

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log("[SW] Deleting old cache:", name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Network-first strategy
// Always tries to get the newest version from GitHub Pages.
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    fetch(event.request, {
      cache: "no-store"
    })
      .then((response) => {
        // Save a fresh copy in cache
        if (response && response.status === 200) {
          const responseClone = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }

        return response;
      })
      .catch(() => {
        // If internet is unavailable, use cached version
        return caches.match(event.request);
      })
  );
});

// Allow the webpage to tell the Service Worker to update immediately
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
