const CACHE_NAME = 'deepvape-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/robots.txt',
  '/sitemap.xml'
];

// 安裝 Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
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

  // 跳過 API 請求（不緩存動態數據）
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果緩存中有響應，返回緩存
        if (response) {
          return response;
        }

        // 否則進行網絡請求
        return fetch(event.request).then(response => {
          // 檢查是否是有效響應
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // 克隆響應
          const responseToCache = response.clone();

          // 將響應添加到緩存
          caches.open(CACHE_NAME)
            .then(cache => {
              // 只緩存靜態資源
              if (event.request.url.includes('/assets/') || 
                  event.request.url.includes('.js') || 
                  event.request.url.includes('.css') ||
                  event.request.url.includes('.png') ||
                  event.request.url.includes('.jpg') ||
                  event.request.url.includes('.webp')) {
                cache.put(event.request, responseToCache);
              }
            });

          return response;
        });
      })
      .catch(() => {
        // 離線時返回離線頁面
        if (event.request.destination === 'document') {
          return caches.match('/offline.html');
        }
      })
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