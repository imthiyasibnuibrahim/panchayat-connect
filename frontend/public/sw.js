const CACHE_NAME = 'panchayat-connect-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/manifest.json',
  '/favicon.ico',
  '/offline.html',
];

// Dynamic API endpoints to cache aggressively for offline emergency access
const EMERGENCY_API_CACHE = 'panchayat-emergency-cache-v1';

// Service Worker Install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[PWA SW] Pre-caching Core Application Shell');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Service Worker Activate & Cache Cleanup
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME && cache !== EMERGENCY_API_CACHE) {
            console.log('[PWA SW] Clearing Old Cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Interceptor: Cache-First for static, Network-First with Stale-While-Revalidate for Emergency Alerts
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Strategy 1: Emergency & Notice API Requests -> Network-First, fallback to Cache
  if (url.pathname.includes('/api/v1/alerts') || url.pathname.includes('/api/v1/notices')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone and update cache with fresh emergency data
          const responseClone = response.clone();
          caches.open(EMERGENCY_API_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(async () => {
          console.warn('[PWA SW] Offline mode detected. Serving Emergency Alerts from Cache.');
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;

          // Return synthetic offline response if not cached
          return new Response(
            JSON.stringify({
              success: true,
              isOffline: true,
              message: 'Operating in Offline Calamity Mode. Displaying cached alerts.',
              data: [],
            }),
            { headers: { 'Content-Type': 'application/json' } }
          );
        })
    );
    return;
  }

  // Strategy 2: App Shell Assets -> Cache-First with Network Fallback
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(request).catch(() => {
        if (request.headers.get('accept').includes('text/html')) {
          return caches.match('/offline.html');
        }
      });
    })
  );
});

// Strategy 3: Background Sync for offline pre-bookings & emergency broadcasts when connection restores
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-bookings') {
    event.waitUntil(syncOfflineBookings());
  }
});

async function syncOfflineBookings() {
  console.log('[PWA SW] Connection Restored! Syncing offline pre-booking orders...');
  // Logic to read from IndexedDB queue and POST to Node.js backend
}
