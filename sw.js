// 工作助手 V3.0 - Service Worker
const CACHE_NAME = 'workbox-v300';
const CACHE_FILES = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './favicon.png'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(CACHE_FILES).catch(function(){});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.map(function(n) {
          if(n !== CACHE_NAME) return caches.delete(n);
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(e) {
  if(e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(function(response) {
      if(response && response.status === 200 && e.request.url.startsWith(self.location.origin)) {
        var respClone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(e.request, respClone).catch(function(){});
        });
      }
      return response;
    }).catch(function() {
      return caches.match(e.request).then(function(cached) {
        return cached || caches.match('./index.html');
      });
    })
  );
});
