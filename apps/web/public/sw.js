/**
 * Service Worker for TodayPool Web Push Notifications
 * Handles push events and notification actions (Done, +10m, +1h, Tomorrow AM)
 */

// Service worker version for cache busting
const SW_VERSION = 'v1.0.0';

// Install event - activate immediately
self.addEventListener('install', (event) => {
  console.log(`[SW ${SW_VERSION}] Installing...`);
  self.skipWaiting();
});

// Activate event - claim clients
self.addEventListener('activate', (event) => {
  console.log(`[SW ${SW_VERSION}] Activating...`);
  event.waitUntil(self.clients.claim());
});

// Push event - display notification
self.addEventListener('push', (event) => {
  console.log('[SW] Push received', event);

  let data = { title: 'TodayPool', body: 'New notification' };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      console.error('[SW] Error parsing push data:', e);
    }
  }

  const options = {
    body: data.body || '',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    tag: data.taskId || 'todaypool-notification',
    requireInteraction: true,
    actions: [
      { action: 'done', title: 'Done', icon: '/icon-check.png' },
      { action: 'snooze10', title: '+10m', icon: '/icon-snooze.png' },
      { action: 'snooze60', title: '+1h', icon: '/icon-snooze.png' },
      { action: 'tomorrowAM', title: 'Tomorrow AM', icon: '/icon-calendar.png' }
    ],
    data: data
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'TodayPool', options)
  );
});

// Notification click - handle actions
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click:', event.action, event.notification.data);

  event.notification.close();

  const data = event.notification.data || {};
  const taskId = data.taskId;

  if (!taskId) {
    console.error('[SW] No taskId in notification data');
    return;
  }

  // Handle action
  event.waitUntil(
    handleNotificationAction(event.action, taskId, data)
  );
});

/**
 * Handle notification action by calling API
 */
async function handleNotificationAction(action, taskId, data) {
  const baseUrl = self.location.origin;

  try {
    if (!action || action === 'default') {
      // Default click - open app to task
      const url = `${baseUrl}/?task=${taskId}`;
      await openOrFocusWindow(url);
      return;
    }

    // Map action to API call
    let endpoint, body;

    switch (action) {
      case 'done':
        endpoint = '/api/tasks.complete';
        body = { taskId };
        break;

      case 'snooze10':
        endpoint = '/api/tasks.snooze';
        body = { taskId, minutes: 10 };
        break;

      case 'snooze60':
        endpoint = '/api/tasks.snooze';
        body = { taskId, minutes: 60 };
        break;

      case 'tomorrowAM':
        endpoint = '/api/tasks.snooze';
        body = { taskId, preset: 'tomorrow_am' };
        break;

      default:
        console.warn('[SW] Unknown action:', action);
        return;
    }

    // Call API
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('[SW] Action completed:', action, result);

    // Show success notification
    await self.registration.showNotification('TodayPool', {
      body: getSuccessMessage(action),
      icon: '/icon-192.png',
      tag: 'todaypool-action-success',
      requireInteraction: false
    });

  } catch (error) {
    console.error('[SW] Error handling action:', error);

    // Show error notification
    await self.registration.showNotification('TodayPool Error', {
      body: 'Could not complete action. Please open the app.',
      icon: '/icon-192.png',
      tag: 'todaypool-action-error',
      requireInteraction: false
    });
  }
}

/**
 * Open or focus existing window
 */
async function openOrFocusWindow(url) {
  const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });

  // Try to focus existing window
  for (const client of clients) {
    if (client.url === url && 'focus' in client) {
      return client.focus();
    }
  }

  // Open new window
  if (self.clients.openWindow) {
    return self.clients.openWindow(url);
  }
}

/**
 * Get success message for action
 */
function getSuccessMessage(action) {
  switch (action) {
    case 'done':
      return 'Task marked as done!';
    case 'snooze10':
      return 'Snoozed for 10 minutes';
    case 'snooze60':
      return 'Snoozed for 1 hour';
    case 'tomorrowAM':
      return 'Moved to tomorrow morning';
    default:
      return 'Action completed';
  }
}
