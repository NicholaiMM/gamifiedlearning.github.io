/* Nexus Arcade – Service Worker (cache-first with network fallback) */
const CACHE_NAME = 'nexus-arcade-v1';
const PRECACHE = ['./', './index.html', './manifest.json', './favicon.svg'];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(PRECACHE))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    const url = new URL(event.request.url);
    /* Only intercept same-origin requests to avoid opaque-response issues */
    if (url.origin !== location.origin) return;

    event.respondWith(
        /* Cache-first: serve from cache when available, else fetch and cache */
        caches.match(event.request).then(cached => {
            if (cached) return cached;
            return fetch(event.request).then(response => {
                const clone = response.clone();
                caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
                return response;
            });
        })
    );
});
