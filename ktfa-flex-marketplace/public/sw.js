// ==============================================================================
// SERVICE WORKER - PWA DIGITAL MARK PRO & WHITE-LABEL CLONES
// ==============================================================================

const CACHE_NAME = 'app-pwa-cache-v5';
const STATIC_ASSETS = [
  '/',
  '/index.html',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).catch((err) => {
      console.warn('[PWA SW] Pre-caching warning:', err);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Ignorer strictement les requêtes non-HTTP (ex: extensions Chrome chrome-extension://, Firefox moz-extension://)
  if (!event.request || !event.request.url || !event.request.url.startsWith('http')) {
    return;
  }

  const url = new URL(event.request.url);

  // 1. Ne JAMAIS intercepter les API, le manifest dynamique, les favicons, Firebase ou les requêtes non-GET
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.includes('manifest') ||
    url.pathname.includes('favicon') ||
    url.pathname.includes('firebase') ||
    url.pathname.includes('apple-touch-icon') ||
    event.request.method !== 'GET'
  ) {
    return;
  }

  // 2. Fichiers statiques avec hash Vite (Cache First avec mise à jour réseau)
  if (
    url.pathname.includes('/assets/') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.woff2')
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone).catch(() => {});
            }).catch(() => {});
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 3. Navigation HTML (Network First, repli sur le cache pour mode hors-ligne)
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone).catch(() => {});
          }).catch(() => {});
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          return cached || caches.match('/');
        });
      })
  );
});

// ==============================================================================
// PUSH NOTIFICATIONS HANDLER (KTFA FLEX - CAMEROUN)
// ==============================================================================
self.addEventListener('push', (event) => {
  let data = {
    title: '🔥 Nouvel Arrivage KTFA FLEX',
    body: 'Disponible dès maintenant en paiement échelonné 4x sans caution à Douala et Yaoundé !',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    image: '/icon-192.png',
    url: '/?t=ktfa'
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      data = Object.assign(data, parsed);
    } catch (e) {
      data.body = event.data.text() || data.body;
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon-192.png',
    badge: data.badge || data.icon || '/icon-192.png',
    image: data.image || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80',
    vibrate: [200, 100, 200, 100, 200],
    data: { url: data.url || '/?t=ktfa' },
    tag: data.tag || 'ktfa-offer',
    renotify: true,
    requireInteraction: true,
    actions: [
      { action: 'explore', title: 'Explorer' }
    ]
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/?t=ktfa';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url && client.url.includes('?t=ktfa') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
