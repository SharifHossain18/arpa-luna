const CACHE_NAME = 'arpa-luna-v56';

// Only cache small essential files + small photos
// Large photos (>2MB) are excluded from pre-cache to avoid install failures
// They will still load from network and get cached on demand
const ASSETS = [
  './',
  'index.html',
  'style.css',
  'app.js',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
  'assets/daa7254c-65ac-4c99-a41c-bb63cdecec96-1e8067c.jpg',
  'assets/arpa_memory_1.jpg',
  'assets/arpa_memory_2.jpg',
  'assets/arpa_memory_3.jpg',
  'assets/arpa_memory_4.jpg',
  'assets/arpa_memory_5.jpg',
  'assets/arpa_memory_12.jpg',
  'assets/arpa_memory_13.jpg',
  'assets/arpa_memory_15.jpg',
  'assets/arpa_memory_16.jpg',
  'assets/arpa_memory_17.jpg',
  'assets/arpa_memory_18.jpg',
  'assets/arpa_memory_19.jpg',
  'assets/arpa_memory_20.jpg',
  'assets/arpa_memory_21.jpg',
  'assets/arpa_memory_22.jpg',
  'assets/arpa_memory_23.jpg',
  'assets/arpa_memory_24.jpg',
  'assets/arpa_memory_25.jpg',
  'assets/arpa_memory_26.jpg',
  'assets/arpa_memory_27.jpg',
  'assets/arpa_memory_28.jpg',
  'assets/arpa_memory_29.jpg',
  'assets/arpa_memory_30.jpg'
  // arpa_memory_6,7,8,9,10,11 excluded (too large, cached on-demand instead)
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use Promise.allSettled so one failed asset doesn't break the whole install
      return Promise.allSettled(
        ASSETS.map(asset => cache.add(asset).catch(err => {
          console.warn('Failed to cache:', asset, err);
        }))
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isIndex = url.pathname === '/' || url.pathname.endsWith('index.html') || url.pathname.endsWith('/arpa-luna/');

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      if (isIndex) {
        return caches.match('index.html').then(response => response || fetch(event.request));
      }

      // Fetch from network and cache for future offline use
      return fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    }).catch(() => {
      if (isIndex) return caches.match('index.html');
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      for (let client of windowClients) {
        if (client.url.includes('arpa-luna') && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('./');
    })
  );
});
