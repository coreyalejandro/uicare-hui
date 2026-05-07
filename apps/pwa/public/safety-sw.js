/**
 * Service Worker — Safety-Critical Offline Support
 * Extends next-pwa's generated SW with safety-specific offline guarantees.
 *
 * This file is loaded after the next-pwa generated service worker.
 * Core safety logic runs entirely offline — no network required for gates.
 *
 * NOT CLAIMED: This SW does not perform emergency response.
 * It ensures the gate UI and grounding content are available offline.
 */

const SAFETY_CACHE = "uicare-safety-v1";
const OFFLINE_SAFETY_ROUTES = [
  "/",
  "/grounding",
  "/consent",
  "/offline",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SAFETY_CACHE).then((cache) =>
      cache.addAll(OFFLINE_SAFETY_ROUTES)
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith("uicare-safety-") && k !== SAFETY_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Always serve safety routes from cache first
  if (OFFLINE_SAFETY_ROUTES.includes(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then(
        (cached) => cached || fetch(event.request)
      )
    );
  }
});
