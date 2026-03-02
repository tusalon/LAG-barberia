// sw-admin.js - Service Worker para Panel Admin de LAG.barberia

const CACHE_NAME = 'lag-barberia-admin-v1';
const urlsToCache = [
  '/LAG-barberia/',
  '/LAG-barberia/admin-login.html',
  '/LAG-barberia/admin.html',
  '/LAG-barberia/manifest-admin.json',
  '/LAG-barberia/admin-app.js',
  '/LAG-barberia/icons/admin-icon-72x72.png',
  '/LAG-barberia/icons/admin-icon-96x96.png',
  '/LAG-barberia/icons/admin-icon-128x128.png',
  '/LAG-barberia/icons/admin-icon-144x144.png',
  '/LAG-barberia/icons/admin-icon-152x152.png',
  '/LAG-barberia/icons/admin-icon-192x192.png',
  '/LAG-barberia/icons/admin-icon-384x384.png',
  '/LAG-barberia/icons/admin-icon-512x512.png'
];

self.addEventListener('install', event => {
  console.log('📦 Service Worker ADMIN instalando...');
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('✅ Cache ADMIN creado:', CACHE_NAME);
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  console.log('🔄 Service Worker ADMIN activado');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName.includes('lag-barberia-admin')) {
            console.log('🗑️ Eliminando cache admin antiguo:', cacheName);
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
        if (cacheName.includes('lag-barberia-admin')) {
          caches.delete(cacheName);
        }
      });
    });
  }
});

console.log('✅ Service Worker ADMIN de LAG.barberia configurado');