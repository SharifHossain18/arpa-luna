const CACHE_NAME = 'arpa-luna-v52';
const ASSETS = [
  './',
  'index.html',
  'style.css',
  'app.js',
  'manifest.json',
  'assets/daa7254c-65ac-4c99-a41c-bb63cdecec96-1e8067c.jpg',
  'assets/arpa_memory_1.jpg',
  'assets/arpa_memory_2.jpg',
  'assets/arpa_memory_3.jpg',
  'assets/arpa_memory_4.jpg',
  'assets/arpa_memory_5.jpg',
  'assets/arpa_memory_6.jpg',
  'assets/arpa_memory_7.jpg',
  'assets/arpa_memory_8.jpg',
  'assets/arpa_memory_9.jpg',
  'assets/arpa_memory_10.jpg',
  'assets/arpa_memory_11.jpg',
  'assets/arpa_memory_12.jpg',
  'assets/arpa_memory_13.jpg',
  'assets/arpa_memory_14.jpg',
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
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching Arpa\'s app assets');
      return cache.addAll(ASSETS);
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
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Handle root path or index.html requests
  const isIndex = url.pathname === '/' || url.pathname.endsWith('index.html');
  
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
      // If found in cache (ignoring query params like ?fresh=...)
      if (cachedResponse) return cachedResponse;
      
      // Special case: if requesting root and not in cache, try index.html
      if (isIndex) {
        return caches.match('index.html').then(response => response || fetch(event.request));
      }
      
      return fetch(event.request);
    }).catch(() => {
      // Offline fallback for index.html
      if (isIndex) return caches.match('index.html');
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      for (let i = 0; i < windowClients.length; i++) {
        let client = windowClients[i];
        if (client.url.includes('index.html') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('index.html');
      }
    })
  );
});
