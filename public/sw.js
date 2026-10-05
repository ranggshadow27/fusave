self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Biarkan fetch berjalan normal secara online-first
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request)),
  );
});
