/**
 * Web Push Client Helper
 * Browser-side utility to register for push notifications
 */

/**
 * Register for Web Push notifications
 * Returns subscription if successful, null otherwise
 */
export async function registerWebPush(): Promise<PushSubscription | null> {
  // Check browser support
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('[WebPush] Browser does not support push notifications');
    return null;
  }

  try {
    // Register service worker
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('[WebPush] Service worker registered');

    // Wait for service worker to be ready
    await navigator.serviceWorker.ready;

    // Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('[WebPush] Notification permission denied');
      return null;
    }

    // Get VAPID public key from environment
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      console.error('[WebPush] VAPID public key not configured');
      return null;
    }

    // Subscribe to push notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    console.log('[WebPush] Push subscription created');

    // Send subscription to server
    const response = await fetch('/api/webpush/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(subscription),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[WebPush] Failed to save subscription:', error);
      return null;
    }

    console.log('[WebPush] Subscription saved to server');
    return subscription;
  } catch (error) {
    console.error('[WebPush] Registration failed:', error);
    return null;
  }
}

/**
 * Unregister from Web Push notifications
 */
export async function unregisterWebPush(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      const success = await subscription.unsubscribe();
      console.log('[WebPush] Unsubscribed:', success);
      return success;
    }

    return true;
  } catch (error) {
    console.error('[WebPush] Unsubscribe failed:', error);
    return false;
  }
}

/**
 * Check if user is currently subscribed to push notifications
 */
export async function isSubscribedToWebPush(): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return subscription !== null;
  } catch (error) {
    console.error('[WebPush] Check subscription failed:', error);
    return false;
  }
}

/**
 * Send test push notification to self
 */
export async function sendTestPush(title: string, body?: string, taskId?: string): Promise<boolean> {
  try {
    const response = await fetch('/api/webpush/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        payload: {
          title,
          body,
          taskId,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[WebPush] Failed to send test push:', error);
      return false;
    }

    const result = await response.json();
    console.log('[WebPush] Test push sent:', result);
    return true;
  } catch (error) {
    console.error('[WebPush] Send test push failed:', error);
    return false;
  }
}

/**
 * Convert URL-safe base64 to Uint8Array for VAPID key
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
