import { getToken, onMessage } from 'firebase/messaging';
import { getFirebaseMessaging, vapidKey, isFirebaseConfigured } from './config';
import deviceService from '../services/deviceService';

export const checkPushSupport = async () => {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    return { supported: false, reason: 'UNSUPPORTED' };
  }
  if (!isFirebaseConfigured) {
    return { supported: false, reason: 'UNCONFIGURED' };
  }
  const messaging = await getFirebaseMessaging();
  if (!messaging) {
    return { supported: false, reason: 'UNSUPPORTED' };
  }

  const permission = Notification.permission; // 'default' | 'granted' | 'denied'
  return { supported: true, permission };
};

export const requestNotificationPermission = async () => {
  try {
    const supportState = await checkPushSupport();
    if (!supportState.supported) {
      return { success: false, reason: supportState.reason };
    }

    if (Notification.permission === 'denied') {
      return { success: false, reason: 'DENIED' };
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { success: false, reason: 'DENIED' };
    }

    const messaging = await getFirebaseMessaging();
    if (!messaging) {
      return { success: false, reason: 'UNSUPPORTED' };
    }

    if (!vapidKey) {
      console.warn('VITE_FIREBASE_VAPID_KEY is not configured in .env. FCM push token cannot be retrieved.');
      return { success: false, reason: 'MISSING_VAPID' };
    }

    // Register service worker if not already registered
    let swReg = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
    if (!swReg) {
      swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    }

    const currentToken = await getToken(messaging, {
      vapidKey: vapidKey,
      serviceWorkerRegistration: swReg,
    });

    if (currentToken) {
      // Send token to Django REST backend
      const deviceName = `${getBrowserName()} (${navigator.platform || 'Desktop'})`;
      await deviceService.registerDevice(currentToken, deviceName);
      return { success: true, token: currentToken, permission: 'granted' };
    } else {
      return { success: false, reason: 'TOKEN_FAILED' };
    }
  } catch (err) {
    console.error('Failed to enable FCM Push Notifications:', err);
    return { success: false, reason: 'ERROR', error: err.message };
  }
};

export const setupForegroundListener = async (onNotificationReceived) => {
  const messaging = await getFirebaseMessaging();
  if (!messaging) return null;

  return onMessage(messaging, (payload) => {
    console.log('Foreground FCM Message received:', payload);
    const notifTitle = payload.notification?.title || payload.data?.title || 'FoodLoop Alert';
    const notifBody = payload.notification?.body || payload.data?.body || '';

    // Spawn native desktop browser notification banner if permission is granted
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(notifTitle, {
          body: notifBody,
          icon: '/foodloop-logo.png',
          data: payload.data || {},
        });
      } catch (err) {
        console.warn('Could not trigger native OS notification in foreground:', err);
      }
    }

    if (onNotificationReceived && typeof onNotificationReceived === 'function') {
      onNotificationReceived({
        title: notifTitle,
        body: notifBody,
        data: payload.data || {},
      });
    }
  });
};

function getBrowserName() {
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Edg')) return 'Edge';
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Safari')) return 'Safari';
  return 'Browser';
}
