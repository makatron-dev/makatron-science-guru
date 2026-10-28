const CACHE_NAME = "makaverse-v1";
const urlsToCache = [
  "/",
  "/index.html"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Only cache GET requests, don't cache API calls (backend)
  if (event.request.method !== "GET" || event.request.url.includes("/api/") || event.request.url.includes("127.0.0.1") || event.request.url.includes("onrender.com")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version if found, otherwise fetch from network
      return response || fetch(event.request).then((networkResponse) => {
        // Cache the new file dynamically
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      });
    }).catch(() => {
      // Offline fallback if needed
      return caches.match("/index.html");
    })
  );
});