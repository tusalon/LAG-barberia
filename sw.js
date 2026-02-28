// sw.js - Service Worker para LAG.barberia (VERSIÓN CORREGIDA)

const CACHE_NAME = 'lag-barberia-v1'; // ⚠️ CAMBIA ESTO CUANDO HAYA ACTUALIZACIONES
const urlsToCache = [
  '/LAG-barberia/',
  '/LAG-barberia/index.html',
  '/LAG-barberia/admin.html',
  '/LAG-barberia/manifest.json',
  '/LAG-barberia/icons/icon-72x72.png',
  '/LAG-barberia/icons/icon-96x96.png',
  '/LAG-barberia/icons/icon-128x128.png',
  '/LAG-barberia/icons/icon-144x144.png',
  '/LAG-barberia/icons/icon-152x152.png',
  '/LAG-barberia/icons/icon-192x192.png',
  '/LAG-barberia/icons/icon-384x384.png',
  '/LAG-barberia/icons/icon-512x512.png'
];

self.addEventListener('install', event => {
  console.log('📦 Service Worker instalando...');
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('✅ Cache creado:', CACHE_NAME);
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  console.log('🔄 Service Worker activado');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', event => {
  if (!event.request.url.startsWith('http')) return;
  if (event.request.url.includes('supabase.co')) return;
  if (event.request.url.includes('ntfy.sh')) return;

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then(cacheNames => {
      cacheNames.forEach(cacheName => {
        caches.delete(cacheName);
      });
    });
  }
});

console.log('✅ Service Worker de LAG.barberia configurado');