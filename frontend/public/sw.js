// Service worker minimal : met en cache les fichiers statiques de l'app
// (le squelette visuel) pour un chargement plus rapide et un minimum de
// résilience hors-ligne. Les appels à l'API backend ne sont volontairement
// jamais mis en cache : les logements, réservations et prix doivent
// toujours refléter les données les plus récentes.

const CACHE_NAME = "cauri-static-v1";
const PRECACHE_URLS = ["/", "/manifest.webmanifest", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Ne jamais mettre en cache les appels API (données toujours fraîches).
  if (url.pathname.startsWith("/api/")) return;

  // Pour tout le reste (fichiers statiques du site), on sert le cache en
  // priorité et on met à jour discrètement en arrière-plan.
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
