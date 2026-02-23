// sw.js - Service Worker para LAG.barberia (VERSIÓN MEJORADA)

const CACHE_NAME = 'lag-barberia-v1';
const urlsToCache = [
  '/LAG-barberia/',
  '/LAG-barberia/index.html',
  '/LAG-barberia/admin.html',
  '/LAG-barberia/admin-login.html',
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

// Instalación del Service Worker
self.addEventListener('install', event => {
  console.log('📦 Service Worker instalando...');
  self.skipWaiting(); // Activar inmediatamente
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('✅ Cache creado');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activación - limpiar caches antiguos
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
      // Notificar a todas las clientes que hay una nueva versión
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'NEW_VERSION_AVAILABLE',
            cacheName: CACHE_NAME
          });
        });
      });
      return self.clients.claim();
    })
  );
});

// Estrategia de caché: Stale-while-revalidate
self.addEventListener('fetch', event => {
  // Ignorar peticiones a Supabase (API)
  if (event.request.url.includes('supabase.co')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Devolver cached response mientras se actualiza
        const fetchPromise = fetch(event.request)
          .then(networkResponse => {
            // Actualizar caché
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }
            return networkResponse;
          })
          .catch(error => {
            console.log('Error fetching:', error);
            return cachedResponse;
          });

        return cachedResponse || fetchPromise;
      })
  );
});

// Escuchar mensajes desde la página
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('✅ Service Worker de LAG.barberia configurado');