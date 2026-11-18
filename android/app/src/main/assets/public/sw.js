// Bingo777 Self-Healing Network-First Service Worker (v3)
const CACHE_NAME = 'bingo777-v3';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Purge all legacy caches (including bingo777-v2 which cached stale index.html)
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
          return Promise.resolve();
        })
      );
      await self.clients.claim();

      // Refresh any controlled windows that were stuck on a stale cached index.html
      const windowClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of windowClients) {
        try {
          if (client.url && 'navigate' in client) {
            await client.navigate(client.url);
          }
        } catch {}
      }
    })()
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = event.request.url;

  // Never intercept Capacitor local server, API routes, or Firebase requests
  if (
    url.includes('localhost') ||
    url.includes('/api/') ||
    url.includes('firebase') ||
    url.includes('firestore') ||
    url.includes('googleapis')
  ) {
    return;
  }

  // Always use Network-First so index.html and hashed JS/CSS bundles are never stale
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
