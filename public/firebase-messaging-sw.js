/* eslint-disable no-undef */
// Firebase Messaging Service Worker for FoodLoop Background Push Notifications

importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Initialize Firebase compat app in Service Worker
// Note: In development on localhost, Firebase messaging compat uses origin/VAPID key automatically
firebase.initializeApp({
  apiKey: "placeholder",
  authDomain: "placeholder",
  projectId: "placeholder",
  storageBucket: "placeholder",
  messagingSenderId: "placeholder",
  appId: "placeholder"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Background Push Message received:', payload);

  const notificationTitle = payload.notification?.title || payload.data?.title || 'FoodLoop Alert';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || 'You have a new notification from FoodLoop.',
    icon: '/foodloop-logo.png',
    badge: '/foodloop-logo.png',
    data: payload.data || {},
    tag: payload.data?.notification_id || 'foodloop-push'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  let targetUrl = '/alerts';

  if (data.type && data.type.startsWith('SHARE_')) {
    targetUrl = '/community?tab=requests';
  } else if (data.type && data.type.includes('EXPIRY')) {
    targetUrl = '/alerts';
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
