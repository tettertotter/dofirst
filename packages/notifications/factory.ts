/**
 * Notification Adapter Factory
 * Creates the appropriate notification adapter based on current platform
 */

import { NotificationAdapter, getPlatform, Platform } from './types';
import { WebNotificationAdapter } from './web-adapter';

/**
 * Create notification adapter for current platform
 *
 * @param apiUrl - Optional API URL for web adapter (defaults to current origin)
 * @returns Platform-specific notification adapter
 *
 * @example
 * ```typescript
 * import { createNotificationAdapter } from '@todaypool/notifications';
 *
 * const notifications = createNotificationAdapter();
 * await notifications.requestPermission();
 * await notifications.schedule(taskId, times, payload);
 * ```
 */
export async function createNotificationAdapter(apiUrl?: string): Promise<NotificationAdapter> {
  const platform = getPlatform();

  switch (platform) {
    case 'ios': {
      const { IOSNotificationAdapter } = await import('./ios-adapter');
      return new IOSNotificationAdapter();
    }

    case 'android': {
      const { AndroidNotificationAdapter } = await import('./android-adapter');
      return new AndroidNotificationAdapter();
    }

    case 'web':
      return new WebNotificationAdapter(apiUrl);

    default:
      // Should never happen, but fallback to web
      console.warn(`[NotificationFactory] Unknown platform: ${platform}, using web adapter`);
      return new WebNotificationAdapter(apiUrl);
  }
}

/**
 * Initialize platform-specific notification setup
 * Call this once during app initialization
 *
 * @example
 * ```typescript
 * // In app/_layout.tsx (React Native) or app/layout.tsx (Next.js)
 * import { initializeNotifications } from '@todaypool/notifications';
 *
 * useEffect(() => {
 *   initializeNotifications();
 * }, []);
 * ```
 */
export async function initializeNotifications(): Promise<void> {
  const platform = getPlatform();

  try {
    switch (platform) {
      case 'ios': {
        const { IOSNotificationAdapter } = await import('./ios-adapter');
        // Setup action categories for iOS
        IOSNotificationAdapter.setupActionCategories();
        console.log('[NotificationFactory] iOS notifications initialized');
        break;
      }

      case 'android': {
        const { AndroidNotificationAdapter } = await import('./android-adapter');
        // Setup notification channels for Android
        AndroidNotificationAdapter.setupNotificationChannels();
        console.log('[NotificationFactory] Android notifications initialized');
        break;
      }

      case 'web':
        // Web notifications are initialized on-demand when user subscribes
        console.log('[NotificationFactory] Web notifications ready');
        break;
    }
  } catch (error) {
    console.error('[NotificationFactory] Error initializing notifications:', error);
  }
}

/**
 * Get platform-specific notification settings/status
 * Useful for showing permission prompts or troubleshooting
 */
export async function getNotificationStatus(): Promise<{
  platform: Platform;
  hasPermission: boolean;
  isReady: boolean;
  details?: any;
}> {
  const platform = getPlatform();
  const adapter = await createNotificationAdapter();

  const hasPermission = await adapter.hasPermission();

  let isReady = hasPermission;
  const details: any = {};

  // Platform-specific checks
  if (platform === 'web') {
    const serviceWorkerReady = await WebNotificationAdapter.isServiceWorkerReady();
    isReady = hasPermission && serviceWorkerReady;
    details.serviceWorkerReady = serviceWorkerReady;
  }

  return {
    platform,
    hasPermission,
    isReady,
    details,
  };
}
