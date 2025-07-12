const CACHE_NAME = 'deepvape-v2'; // 更新版本號
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/robots.txt',
  '/sitemap.xml',
  '/offline.html'
];

// 需要預緩存的靜態資源
const staticAssets = [
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/images/itay-kabalo-b3sel60dv8a-unsplash.jpg'
];

// 安裝 Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // 先緩存必要的頁面
        return cache.addAll(urlsToCache)
          .then(() => {
            // 然後嘗試緩存靜態資源（失敗不影響安裝）
            return cache.addAll(staticAssets).catch(err => {
              console.warn('Some static assets failed to cache:', err);
            });
          });
      })
  );
  // 強制更新
  self.skipWaiting();
});

// 激活 Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // 立即接管所有頁面
  self.clients.claim();
});

// 攔截網絡請求
self.addEventListener('fetch', event => {
  // 跳過非 GET 請求
  if (event.request.method !== 'GET') {
    return;
  }

  // 跳過非 HTTP/HTTPS 協議的請求（如 chrome-extension://）
  if (!event.request.url.startsWith('http://') && !event.request.url.startsWith('https://')) {
    return;
  }

  // 解析 URL
  const { pathname } = new URL(event.request.url);

  // API 請求 - 使用 Network Only 策略
  if (pathname.startsWith('/api/')) {
    return;
  }

  // 靜態資源 - 使用 Cache First 策略
  if (pathname.includes('/assets/') || 
      pathname.endsWith('.js') || 
      pathname.endsWith('.css') ||
      pathname.endsWith('.png') ||
      pathname.endsWith('.jpg') ||
      pathname.endsWith('.jpeg') ||
      pathname.endsWith('.webp') ||
      pathname.endsWith('.woff2') ||
      pathname.endsWith('.woff')) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            // 在後台更新緩存（Stale While Revalidate）
            const fetchPromise = fetch(event.request)
              .then(networkResponse => {
                if (networkResponse && networkResponse.status === 200) {
                  const responseToCache = networkResponse.clone();
                  caches.open(CACHE_NAME)
                    .then(cache => {
                      cache.put(event.request, responseToCache);
                    })
                    .catch(error => {
                      console.warn('Cache update failed:', error);
                    });
                }
                return networkResponse;
              })
              .catch(() => undefined);
            
            return response;
          }
          
          // 如果緩存中沒有，從網絡獲取並緩存
          return fetch(event.request)
            .then(response => {
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }

              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                })
                .catch(error => {
                  console.warn('Cache put failed:', error);
                });

              return response;
            });
        })
    );
    return;
  }

  // HTML 頁面 - 使用 Network First 策略
  if (event.request.mode === 'navigate' || pathname === '/' || pathname.endsWith('.html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (!response || response.status !== 200) {
            throw new Error('Network response was not ok');
          }
          
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            })
            .catch(error => {
              console.warn('Cache put failed:', error);
            });
          
          return response;
        })
        .catch(() => {
          // 網絡失敗時使用緩存
          return caches.match(event.request)
            .then(response => {
              if (response) {
                return response;
              }
              // 如果沒有緩存，返回離線頁面
              return caches.match('/offline.html');
            });
        })
    );
    return;
  }

  // 其他請求 - 使用默認策略
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

// 後台同步
self.addEventListener('sync', event => {
  if (event.tag === 'sync-cart') {
    event.waitUntil(syncCart());
  }
});

// 推送通知
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : '您有新的通知',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('DeepVape 電子煙商城', options)
  );
});

// 處理通知點擊
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});

// 同步購物車數據
async function syncCart() {
  try {
    // 這裡可以實現離線購物車同步邏輯
    console.log('Syncing cart data...');
  } catch (error) {
    console.error('Cart sync failed:', error);
  }
}