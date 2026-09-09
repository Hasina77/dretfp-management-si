const CACHE_NAME = "dretfp-cache-v1";
// Liste des fichiers de base à garder en cache pour que l'interface s'affiche sans internet
const URLS_TO_CACHE = [
  "/",
  "/index.html",
  "/src/main.jsx",
  "/src/App.jsx"
];

// Installation : Mise en cache des ressources critiques
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

// Interception des requêtes réseau
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Si le fichier est dans le cache, on le renvoie. Sinon, on va sur le réseau.
      return response || fetch(event.request);
    })
  );
});
