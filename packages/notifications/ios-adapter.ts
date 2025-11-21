/**
 * iOS Notification Adapter
 * Uses UNUserNotificationCenter for local notifications with action categories
 */

import {
  NotificationAdapter,
  NotificationPayload,
  NotificationAction,
  ScheduleResult,
} from './types';

/**
 * iOS-specific notification implementation
 * Handles UNUserNotificationCenter API with proper action categories
 *
 * Key features:
 * - Local notifications (no server required)
 * - Action buttons (Done, +10m, +1h, Tomorrow AM)
 * - Grouping by task ID
 * - Respects iOS 64 notification limit by scheduling max 3 at a time
 */
export class IOSNotificationAdapter implements NotificationAdapter {
  private notificationCenter: any; // UNUserNotificationCenter

  constructor() {
    // Import React Native modules lazily to avoid web/server errors
    try {
      const { NativeModules } = require('react-native');
      this.notificationCenter = NativeModules.RNCPushNotificationIOS;
    } catch (error) {
      console.warn('[IOSAdapter] React Native not available:', error);
    }
  }

  /**
   * Request notification permission from user
   * Shows iOS permission dialog
   */
  async requestPermission(): Promise<boolean> {
    if (!this.notificationCenter) {
      console.error('[IOSAdapter] Notification center not available');
      return false;
    }

    try {
      const { PushNotificationIOS } = require('@react-native-community/push-notification-ios');

      return new Promise((resolve) => {
        PushNotificationIOS.requestPermissions({
          alert: true,
          badge: true,
          sound: true,
        }).then((permissions: any) => {
          const granted = permissions.alert === 1;
          console.log('[IOSAdapter] Permission granted:', granted);
          resolve(granted);
        }).catch((error: any) => {
          console.error('[IOSAdapter] Permission request failed:', error);
          resolve(false);
        });
      });
    } catch (error) {
      console.error('[IOSAdapter] Error requesting permission:', error);
      return false;
    }
  }

  /**
   * Check if permission is already granted
   */
  async hasPermission(): Promise<boolean> {
    if (!this.notificationCenter) {
      return false;
    }

    try {
      const { PushNotificationIOS } = require('@react-native-community/push-notification-ios');

      return new Promise((resolve) => {
        PushNotificationIOS.checkPermissions((permissions: any) => {
          const granted = permissions.alert === 1;
          resolve(granted);
        });
      });
    } catch (error) {
      console.error('[IOSAdapter] Error checking permission:', error);
      return false;
    }
  }

  /**
   * Schedule local notifications at specific times
   * iOS limits to 64 pending notifications, so we only schedule next 3
   */
  async schedule(
    taskId: string,
    times: Date[],
    payload: NotificationPayload
  ): Promise<ScheduleResult> {
    if (!this.notificationCenter) {
      return {
        success: false,
        scheduledCount: 0,
        notificationIds: [],
        error: 'Notification center not available',
      };
    }

    try {
      const { PushNotificationIOS } = require('@react-native-community/push-notification-ios');

      const notificationIds: string[] = [];

      // iOS limit: only schedule next 3 to stay under 64 total limit
      const timesToSchedule = times.slice(0, 3);

      for (let i = 0; i < timesToSchedule.length; i++) {
        const fireDate = timesToSchedule[i];
        const notificationId = `${taskId}-${i}`;

        // Calculate time interval from now
        const now = new Date();
        const timeInterval = (fireDate.getTime() - now.getTime()) / 1000;

        if (timeInterval <= 0) {
          console.warn(`[IOSAdapter] Skipping past notification: ${fireDate}`);
          continue;
        }

        // Create local notification
        PushNotificationIOS.addNotificationRequest({
          id: notificationId,
          title: payload.title,
          body: payload.body || '',
          fireDate: fireDate.toISOString(),
          userInfo: {
            taskId: payload.taskId,
            dueAt: payload.dueAt,
            priority: payload.priority,
            poolId: payload.poolId,
            userId: payload.userId,
          },
          category: 'TASK_REMINDER', // Action category defined below
          sound: payload.alarmEnabled ? 'default' : undefined,
          badge: 1,
        });

        notificationIds.push(notificationId);
      }

      console.log(
        `[IOSAdapter] Scheduled ${notificationIds.length} notifications for task ${taskId}`
      );

      return {
        success: true,
        scheduledCount: notificationIds.length,
        notificationIds,
      };
    } catch (error) {
      console.error('[IOSAdapter] Error scheduling notifications:', error);
      return {
        success: false,
        scheduledCount: 0,
        notificationIds: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Cancel all notifications for a specific task
   */
  async cancel(taskId: string): Promise<boolean> {
    if (!this.notificationCenter) {
      return false;
    }

    try {
      const { PushNotificationIOS } = require('@react-native-community/push-notification-ios');

      // Get all pending notifications
      const pending = await this.getPendingNotifications(taskId);

      // Remove each one
      for (const notificationId of pending) {
        PushNotificationIOS.removePendingNotificationRequests([notificationId]);
      }

      console.log(`[IOSAdapter] Cancelled ${pending.length} notifications for task ${taskId}`);
      return true;
    } catch (error) {
      console.error('[IOSAdapter] Error cancelling notifications:', error);
      return false;
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAll(): Promise<boolean> {
    if (!this.notificationCenter) {
      return false;
    }

    try {
      const { PushNotificationIOS } = require('@react-native-community/push-notification-ios');

      PushNotificationIOS.removeAllPendingNotificationRequests();

      console.log('[IOSAdapter] Cancelled all notifications');
      return true;
    } catch (error) {
      console.error('[IOSAdapter] Error cancelling all notifications:', error);
      return false;
    }
  }

  /**
   * Handle notification action (called when user taps action button)
   */
  async handleAction(
    action: NotificationAction,
    payload: NotificationPayload
  ): Promise<boolean> {
    console.log(`[IOSAdapter] Handling action: ${action} for task ${payload.taskId}`);

    // Action handlers should call API endpoints
    // This is typically wired up in the mobile app's AppDelegate/MainActivity
    // For now, we log and return true (actual API calls happen in mobile app)

    try {
      // The mobile app will listen for notification actions and call appropriate APIs
      // See apps/mobile/app/_layout.tsx for action handling setup
      return true;
    } catch (error) {
      console.error('[IOSAdapter] Error handling action:', error);
      return false;
    }
  }

  /**
   * Get pending scheduled notifications for a task
   */
  async getPendingNotifications(taskId?: string): Promise<string[]> {
    if (!this.notificationCenter) {
      return [];
    }

    try {
      const { PushNotificationIOS } = require('@react-native-community/push-notification-ios');

      return new Promise((resolve) => {
        PushNotificationIOS.getPendingNotificationRequests((notifications: any[]) => {
          let filtered = notifications;

          if (taskId) {
            // Filter by task ID prefix
            filtered = notifications.filter((n) =>
              n.id.startsWith(`${taskId}-`)
            );
          }

          const ids = filtered.map((n) => n.id);
          resolve(ids);
        });
      });
    } catch (error) {
      console.error('[IOSAdapter] Error getting pending notifications:', error);
      return [];
    }
  }

  /**
   * Setup notification action categories
   * This should be called once during app initialization
   */
  static setupActionCategories(): void {
    try {
      const { PushNotificationIOS } = require('@react-native-community/push-notification-ios');

      // Define action buttons
      const doneAction = {
        id: 'done',
        title: 'Done',
        options: {
          foreground: false, // Don't open app
          destructive: false,
          authenticationRequired: false,
        },
      };

      const snooze10Action = {
        id: 'snooze10',
        title: '+10m',
        options: {
          foreground: false,
          destructive: false,
          authenticationRequired: false,
        },
      };

      const snooze60Action = {
        id: 'snooze60',
        title: '+1h',
        options: {
          foreground: false,
          destructive: false,
          authenticationRequired: false,
        },
      };

      const tomorrowAction = {
        id: 'tomorrowAM',
        title: 'Tomorrow AM',
        options: {
          foreground: false,
          destructive: false,
          authenticationRequired: false,
        },
      };

      // Create category with actions
      PushNotificationIOS.setNotificationCategories([
        {
          id: 'TASK_REMINDER',
          actions: [doneAction, snooze10Action, snooze60Action, tomorrowAction],
        },
      ]);

      console.log('[IOSAdapter] Notification action categories configured');
    } catch (error) {
      console.error('[IOSAdapter] Error setting up action categories:', error);
    }
  }
}
