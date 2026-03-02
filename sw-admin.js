// sw-admin.js - Service Worker simplificado para LAG.barberia Admin

const CACHE_NAME = 'lag-barberia-admin-v3';

self.addEventListener('install', event => {
  console.log('📦 Service Worker ADMIN instalando...');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('🔄 Service Worker ADMIN activado');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => response)
      .catch(() => caches.match(event.request))
  );
});

console.log('✅ Service Worker ADMIN simplificado');