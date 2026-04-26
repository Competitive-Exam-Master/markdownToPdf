const CACHE_NAME = 'md-editor-cache-v1';

// Caching strategy: Stale-While-Revalidate for everything
// This ensures that when you are offline, it pulls from the cache immediately.
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            const fetchPromise = fetch(event.request).then(networkResponse => {
                // Only cache successful GET requests
                if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
                    caches.open(CACHE_NAME).then(cache => {
                        // Clone before putting it in cache
                        cache.put(event.request, networkResponse.clone());
                    });
                }
                return networkResponse;
            }).catch(() => {
                // Ignore fetch errors (offline state)
            });

            // Return cached response immediately if available, otherwise wait for network
            return cachedResponse || fetchPromise;
        })
    );
});

// Clean up old caches when updating the service worker version
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});