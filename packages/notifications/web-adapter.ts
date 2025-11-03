/**
 * Web Notification Adapter
 * Wraps Web Push API for browser notifications
 */

import {
  NotificationAdapter,
  NotificationPayload,
  NotificationAction,
  ScheduleResult,
} from './types';

/**
 * Web-specific notification implementation
 * Uses Web Push API via service worker for reliable delivery
 *
 * Key features:
 * - Web Push with VAPID authentication
 * - Service worker for background notifications
 * - Action buttons handled in service worker
 * - Fallback to in-app notifications if service worker unavailable
 * - Server-side scheduling (browser notifications can't be scheduled locally)
 */
export class WebNotificationAdapter implements NotificationAdapter {
  private apiUrl: string;

  constructor(apiUrl: string = '') {
    this.apiUrl = apiUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  }

  /**
   * Request notification permission from browser
   */
  async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.warn('[WebAdapter] Notifications not supported');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';

      console.log('[WebAdapter] Permission granted:', granted);
      return granted;
    } catch (error) {
      console.error('[WebAdapter] Error requesting permission:', error);
      return false;
    }
  }

  /**
   * Check if notification permission is granted
   */
  async hasPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }

    return Notification.permission === 'granted';
  }

  /**
   * Schedule notifications via server
   * Web browsers don't support local notification scheduling,
   * so we store the schedule on the server and use cron/webhooks to trigger
   */
  async schedule(
    taskId: string,
    times: Date[],
    payload: NotificationPayload
  ): Promise<ScheduleResult> {
    try {
      // Call server API to schedule notifications
      // The server will use a cron job or scheduler to send Web Push at the specified times
      const response = await fetch(`${this.apiUrl}/api/notifications/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          taskId,
          times: times.map((t) => t.toISOString()),
          payload,
          platform: 'web',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to schedule notifications');
      }

      const result = await response.json();

      console.log(
        `[WebAdapter] Scheduled ${times.length} notifications for task ${taskId}`
      );

      return {
        success: true,
        scheduledCount: times.length,
        notificationIds: result.notificationIds || times.map((_, i) => `${taskId}-${i}`),
      };
    } catch (error) {
      console.error('[WebAdapter] Error scheduling notifications:', error);

      // Fallback: show immediate in-app notification if scheduling fails
      if (times.length > 0 && times[0].getTime() <= Date.now()) {
        await this.showImmediateNotification(payload);
      }

      return {
        success: false,
        scheduledCount: 0,
        notificationIds: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Show immediate browser notification (for testing or fallback)
   */
  private async showImmediateNotification(payload: NotificationPayload): Promise<void> {
    if (!await this.hasPermission()) {
      return;
    }

    try {
      // If service worker is available, use it
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(payload.title, {
          body: payload.body || '',
          icon: '/icon-192.png',
          badge: '/badge-72.png',
          tag: payload.taskId,
          requireInteraction: true,
          actions: [
            { action: 'done', title: 'Done', icon: '/icon-check.png' },
            { action: 'snooze10', title: '+10m', icon: '/icon-snooze.png' },
            { action: 'snooze60', title: '+1h', icon: '/icon-snooze.png' },
            { action: 'tomorrowAM', title: 'Tomorrow AM', icon: '/icon-calendar.png' },
          ],
          data: payload,
        });
      } else {
        // Fallback to basic Notification API (no actions)
        new Notification(payload.title, {
          body: payload.body || '',
          icon: '/icon-192.png',
          tag: payload.taskId,
        });
      }
    } catch (error) {
      console.error('[WebAdapter] Error showing immediate notification:', error);
    }
  }

  /**
   * Cancel scheduled notifications for a task
   */
  async cancel(taskId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/api/notifications/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ taskId }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel notifications');
      }

      console.log(`[WebAdapter] Cancelled notifications for task ${taskId}`);
      return true;
    } catch (error) {
      console.error('[WebAdapter] Error cancelling notifications:', error);
      return false;
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAll(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/api/notifications/cancel-all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel all notifications');
      }

      console.log('[WebAdapter] Cancelled all notifications');
      return true;
    } catch (error) {
      console.error('[WebAdapter] Error cancelling all notifications:', error);
      return false;
    }
  }

  /**
   * Handle notification action
   * This is typically called by the service worker, not directly
   * Actions are handled in sw.js
   */
  async handleAction(
    action: NotificationAction,
    payload: NotificationPayload
  ): Promise<boolean> {
    console.log(`[WebAdapter] Handling action: ${action} for task ${payload.taskId}`);

    // Actions are already handled in the service worker (apps/web/public/sw.js)
    // The service worker calls the appropriate API endpoints:
    // - done -> /api/tasks.complete
    // - snooze10/snooze60/tomorrowAM -> /api/tasks.snooze

    return true;
  }

  /**
   * Get pending scheduled notifications
   */
  async getPendingNotifications(taskId?: string): Promise<string[]> {
    try {
      const url = new URL(`${this.apiUrl}/api/notifications/pending`);
      if (taskId) {
        url.searchParams.set('taskId', taskId);
      }

      const response = await fetch(url.toString(), {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to get pending notifications');
      }

      const result = await response.json();
      return result.notificationIds || [];
    } catch (error) {
      console.error('[WebAdapter] Error getting pending notifications:', error);
      return [];
    }
  }

  /**
   * Register for Web Push (subscribe user's browser)
   * This should be called once after permission is granted
   */
  async registerForPush(): Promise<boolean> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.warn('[WebAdapter] Service workers not supported');
      return false;
    }

    try {
      // Check if already subscribed
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        console.log('[WebAdapter] Already subscribed to push');
        return true;
      }

      // Request permission if not granted
      if (Notification.permission !== 'granted') {
        const granted = await this.requestPermission();
        if (!granted) {
          return false;
        }
      }

      // Get VAPID public key from server
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        console.error('[WebAdapter] VAPID public key not configured');
        return false;
      }

      // Subscribe to push
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey),
      });

      // Send subscription to server
      const response = await fetch(`${this.apiUrl}/api/webpush/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(subscription),
      });

      if (!response.ok) {
        throw new Error('Failed to save subscription');
      }

      console.log('[WebAdapter] Successfully subscribed to push');
      return true;
    } catch (error) {
      console.error('[WebAdapter] Error registering for push:', error);
      return false;
    }
  }

  /**
   * Convert VAPID key from URL-safe base64 to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }

  /**
   * Check if service worker is registered and active
   */
  static async isServiceWorkerReady(): Promise<boolean> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      return registration !== undefined && registration.active !== null;
    } catch (error) {
      console.error('[WebAdapter] Error checking service worker:', error);
      return false;
    }
  }
}
