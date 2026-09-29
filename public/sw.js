const CACHE_NAME = "dretfp-cache-v1";
const URLS_TO_CACHE = [
  "/",
  "/index.html",
  "/src/main.jsx",
  "/src/App.jsx"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
