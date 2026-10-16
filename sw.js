const CACHE_NAME = "mi-presupuesto-v2";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Estrategia simple: intenta red primero, si falla usa lo que haya en caché.
// Así nunca ves una versión vieja "pegada" mientras tengas conexión.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  // Solo gestiona archivos de la propia app; Firebase y demás servicios van directos a la red.
  if (new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
