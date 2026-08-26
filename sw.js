// 工作助手 Service Worker - 离线缓存
const CACHE_NAME = 'workbox-v204';
const CACHE_FILES = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './favicon.png'
];

// 安装：缓存核心文件，并立即激活
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(CACHE_FILES).catch(function(err) {
        console.log('部分文件缓存失败:', err);
      });
    })
  );
  self.skipWaiting();
});

// 激活：清理所有旧缓存
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.map(function(n) { return caches.delete(n); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// 请求拦截：网络优先，网络失败再用缓存
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
