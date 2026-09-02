// SMART CALCULATOR SERVICE WORKER
// Version: 2.1.1

const APP_VERSION = "2.1.1";
const CACHE_NAME = `smart-calculator-${APP_VERSION}`;

const CORE_FILES = [
  "./",
  "./index.html",
  "./manifest.json"
];

function isSameOrigin(request){
  return new URL(request.url).origin === self.location.origin;
}

function isServiceWorkerFile(request){
  return new URL(request.url).pathname.endsWith("/sw.js");
}

async function putInCache(request, response){
  if(!response || response.status !== 200) return;

  try{
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
  }catch(error){
    console.warn("[SW] Cache write failed:", error);
  }
}

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async cache => {
        for(const file of CORE_FILES){
          try{
            await cache.add(file);
          }catch(error){
            console.warn("[SW] Could not cache:", file, error);
          }
        }
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => Promise.all(
        cacheNames
          .filter(name =>
            name.startsWith("smart-calculator-") &&
            name !== CACHE_NAME
          )
          .map(name => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;

  if(request.method !== "GET") return;
  if(!isSameOrigin(request)) return;
  if(isServiceWorkerFile(request)) return;

  event.respondWith((async () => {
    try{
      const response = await fetch(request, {
        cache: "no-store"
      });

      if(response && response.ok){
        await putInCache(request, response);
      }

      return response;

    }catch(error){

      const cached = await caches.match(request);

      if(cached){
        return cached;
      }

      if(request.mode === "navigate"){
        const index = await caches.match("./index.html");

        if(index){
          return index;
        }
      }

      throw error;
    }
  })());
});

self.addEventListener("message", event => {
  if(event.data && event.data.type === "SKIP_WAITING"){
    self.skipWaiting();
  }
});
