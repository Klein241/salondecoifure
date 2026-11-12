// ==============================================================================
// FIREBASE CLOUD MESSAGING SERVICE WORKER - BACKGROUND NOTIFICATIONS
// KTFA FLEX MARKETPLACE CAMEROUN 🇨🇲
// ==============================================================================

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyDDOJSgjx30yjdLDm5HOXqXoQ5kYdWknz4",
  authDomain: "maket-place-4c42a.firebaseapp.com",
  projectId: "maket-place-4c42a",
  storageBucket: "maket-place-4c42a.firebasestorage.app",
  messagingSenderId: "1004444456478",
  appId: "1:1004444456478:web:95d6f8a77ecc886755400f",
  measurementId: "G-PJP8HG88W4"
};

try {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Reçu message background push: ', payload);
    const title = payload.notification?.title || payload.data?.title || 'Ces offres sont faites pour vous...';
    const image = payload.notification?.image || payload.data?.image || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80';
    const options = {
      body: payload.notification?.body || payload.data?.body || '😮 Salut ! Ne manquez pas ces offres à durée limitée : paiement en 4x sans frais à Douala et Yaoundé.',
      icon: payload.notification?.icon || '/icon-192.png',
      badge: '/icon-192.png',
      image: image,
      vibrate: [200, 100, 200, 100, 200],
      tag: 'ktfa-offer',
      renotify: true,
      requireInteraction: true,
      data: {
        url: payload.data?.url || '/?t=ktfa'
      },
      actions: [
        { action: 'explore', title: 'Explorer' }
      ]
    };

    self.registration.showNotification(title, options);
  });
} catch (e) {
  console.warn('[firebase-messaging-sw.js] Init warning:', e);
}

// Fallback generic web push event
self.addEventListener('push', (event) => {
  let data = {
    title: 'Ces offres sont faites pour vous...',
    body: '😮 Salut ! Ne manquez pas ces offres à durée limitée : paiement en 4x sans frais à Douala et Yaoundé.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80',
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

// Click on notification opens/focuses the app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/?t=ktfa';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url && client.url.includes('?t=ktfa') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
