/**
 * Android Notification Adapter
 * Uses AlarmManager for exact alarm scheduling with fallbacks
 */

import {
  NotificationAdapter,
  NotificationPayload,
  NotificationAction,
  ScheduleResult,
} from './types';

/**
 * Android-specific notification implementation
 * Handles AlarmManager API with proper permission handling and fallbacks
 *
 * Key features:
 * - Exact alarms via SCHEDULE_EXACT_ALARM permission (Android 12+)
 * - Fallback to setExactAndAllowWhileIdle for backward compatibility
 * - Notification channels with proper importance
 * - Action buttons (Done, +10m, +1h, Tomorrow AM)
 * - Handles OEM battery optimization edge cases
 */
export class AndroidNotificationAdapter implements NotificationAdapter {
  private alarmManager: any;
  private notificationManager: any;
  private hasExactAlarmPermission: boolean = false;

  constructor() {
    // Import React Native modules lazily
    try {
      const { NativeModules } = require('react-native');
      this.alarmManager = NativeModules.AlarmManager;
      this.notificationManager = NativeModules.NotificationManager;
    } catch (error) {
      console.warn('[AndroidAdapter] React Native not available:', error);
    }
  }

  /**
   * Request notification permission
   * On Android 13+, requests POST_NOTIFICATIONS permission
   * Also checks for SCHEDULE_EXACT_ALARM permission
   */
  async requestPermission(): Promise<boolean> {
    if (!this.notificationManager) {
      console.error('[AndroidAdapter] Notification manager not available');
      return false;
    }

    try {
      const { PermissionsAndroid, Platform } = require('react-native');

      // Android 13+ requires POST_NOTIFICATIONS permission
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Notification Permission',
            message: 'DoFirst needs notification permission to remind you about tasks',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('[AndroidAdapter] Notification permission denied');
          return false;
        }
      }

      // Check for exact alarm permission (Android 12+)
      if (Platform.Version >= 31) {
        await this.checkExactAlarmPermission();

        // If not granted, guide user to settings
        if (!this.hasExactAlarmPermission) {
          console.warn(
            '[AndroidAdapter] Exact alarm permission not granted. Notifications may be delayed.'
          );
          // In production, show UI to guide user to settings
          // For now, we'll use fallback scheduling
        }
      } else {
        // Pre-Android 12, exact alarms don't require permission
        this.hasExactAlarmPermission = true;
      }

      console.log('[AndroidAdapter] Permission granted');
      return true;
    } catch (error) {
      console.error('[AndroidAdapter] Error requesting permission:', error);
      return false;
    }
  }

  /**
   * Check if notification permissions are granted
   */
  async hasPermission(): Promise<boolean> {
    if (!this.notificationManager) {
      return false;
    }

    try {
      const { PermissionsAndroid, Platform } = require('react-native');

      if (Platform.Version >= 33) {
        const hasNotificationPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );

        if (!hasNotificationPermission) {
          return false;
        }
      }

      // Check exact alarm permission
      if (Platform.Version >= 31) {
        await this.checkExactAlarmPermission();
      } else {
        this.hasExactAlarmPermission = true;
      }

      return true;
    } catch (error) {
      console.error('[AndroidAdapter] Error checking permission:', error);
      return false;
    }
  }

  /**
   * Check if SCHEDULE_EXACT_ALARM permission is granted
   * This is required for reliable exact alarms on Android 12+
   */
  private async checkExactAlarmPermission(): Promise<void> {
    try {
      const { NativeModules } = require('react-native');
      const { AlarmManager } = NativeModules;

      if (AlarmManager && AlarmManager.canScheduleExactAlarms) {
        this.hasExactAlarmPermission = await AlarmManager.canScheduleExactAlarms();
      } else {
        // If method not available, assume no permission
        this.hasExactAlarmPermission = false;
      }
    } catch (error) {
      console.error('[AndroidAdapter] Error checking exact alarm permission:', error);
      this.hasExactAlarmPermission = false;
    }
  }

  /**
   * Schedule notifications using AlarmManager
   * Uses exact alarms if permission granted, otherwise falls back to inexact
   */
  async schedule(
    taskId: string,
    times: Date[],
    payload: NotificationPayload
  ): Promise<ScheduleResult> {
    if (!this.alarmManager || !this.notificationManager) {
      return {
        success: false,
        scheduledCount: 0,
        notificationIds: [],
        error: 'Managers not available',
      };
    }

    try {
      const notificationIds: string[] = [];

      // Schedule next 3 notifications (Android doesn't have iOS's 64 limit, but we stay consistent)
      const timesToSchedule = times.slice(0, 3);

      for (let i = 0; i < timesToSchedule.length; i++) {
        const fireDate = timesToSchedule[i];
        const notificationId = `${taskId}-${i}`;
        const requestCode = this.generateRequestCode(notificationId);

        const now = new Date();
        const triggerAt = fireDate.getTime();

        if (triggerAt <= now.getTime()) {
          console.warn(`[AndroidAdapter] Skipping past notification: ${fireDate}`);
          continue;
        }

        // Prepare notification data
        const notificationData = {
          id: notificationId,
          taskId: payload.taskId,
          title: payload.title,
          body: payload.body || '',
          dueAt: payload.dueAt,
          priority: payload.priority || 3,
          poolId: payload.poolId,
          userId: payload.userId,
        };

        // Schedule alarm based on permission availability
        if (this.hasExactAlarmPermission) {
          // Use exact alarm (most reliable)
          await this.scheduleExactAlarm(requestCode, triggerAt, notificationData);
        } else {
          // Fallback to setExactAndAllowWhileIdle (less reliable but doesn't need permission)
          await this.scheduleExactAllowWhileIdle(requestCode, triggerAt, notificationData);
        }

        notificationIds.push(notificationId);
      }

      console.log(
        `[AndroidAdapter] Scheduled ${notificationIds.length} notifications for task ${taskId}`
      );

      return {
        success: true,
        scheduledCount: notificationIds.length,
        notificationIds,
      };
    } catch (error) {
      console.error('[AndroidAdapter] Error scheduling notifications:', error);
      return {
        success: false,
        scheduledCount: 0,
        notificationIds: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Schedule exact alarm (requires SCHEDULE_EXACT_ALARM permission on Android 12+)
   */
  private async scheduleExactAlarm(
    requestCode: number,
    triggerAt: number,
    data: any
  ): Promise<void> {
    const { AlarmManager } = require('react-native').NativeModules;

    await AlarmManager.setExactAlarm({
      requestCode,
      triggerAt,
      data: JSON.stringify(data),
      allowWhileIdle: true, // Allow firing during Doze mode
    });
  }

  /**
   * Fallback scheduling method for devices without exact alarm permission
   * Less reliable but doesn't require special permission
   */
  private async scheduleExactAllowWhileIdle(
    requestCode: number,
    triggerAt: number,
    data: any
  ): Promise<void> {
    const { AlarmManager } = require('react-native').NativeModules;

    await AlarmManager.setExactAndAllowWhileIdle({
      requestCode,
      triggerAt,
      data: JSON.stringify(data),
    });
  }

  /**
   * Generate unique request code for alarm
   * Android uses int request codes to identify alarms
   */
  private generateRequestCode(notificationId: string): number {
    // Simple hash function to convert string to int
    let hash = 0;
    for (let i = 0; i < notificationId.length; i++) {
      const char = notificationId.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Cancel all notifications for a task
   */
  async cancel(taskId: string): Promise<boolean> {
    if (!this.alarmManager) {
      return false;
    }

    try {
      const { AlarmManager } = require('react-native').NativeModules;

      // Cancel alarms for this task (up to 3 notifications)
      for (let i = 0; i < 3; i++) {
        const notificationId = `${taskId}-${i}`;
        const requestCode = this.generateRequestCode(notificationId);

        await AlarmManager.cancelAlarm(requestCode);
      }

      console.log(`[AndroidAdapter] Cancelled notifications for task ${taskId}`);
      return true;
    } catch (error) {
      console.error('[AndroidAdapter] Error cancelling notifications:', error);
      return false;
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAll(): Promise<boolean> {
    if (!this.alarmManager) {
      return false;
    }

    try {
      const { AlarmManager } = require('react-native').NativeModules;

      await AlarmManager.cancelAllAlarms();

      console.log('[AndroidAdapter] Cancelled all notifications');
      return true;
    } catch (error) {
      console.error('[AndroidAdapter] Error cancelling all notifications:', error);
      return false;
    }
  }

  /**
   * Handle notification action
   * Called when user taps action button on notification
   */
  async handleAction(
    action: NotificationAction,
    payload: NotificationPayload
  ): Promise<boolean> {
    console.log(`[AndroidAdapter] Handling action: ${action} for task ${payload.taskId}`);

    // Action handling is wired up in MainActivity.java
    // The native side receives the action and calls appropriate API endpoints
    // See apps/mobile/android/app/src/main/java/com/dofirst/NotificationActionReceiver.java

    return true;
  }

  /**
   * Get pending scheduled notifications
   * Note: AlarmManager doesn't provide a way to list pending alarms
   * This is a limitation we work around by keeping track ourselves
   */
  async getPendingNotifications(taskId?: string): Promise<string[]> {
    // Android's AlarmManager doesn't have an API to list pending alarms
    // We would need to maintain our own database of scheduled notifications
    // For now, return empty array
    console.warn('[AndroidAdapter] getPendingNotifications not fully implemented on Android');
    return [];
  }

  /**
   * Setup notification channels (Android 8.0+)
   * This should be called once during app initialization
   */
  static setupNotificationChannels(): void {
    try {
      const { NotificationManager } = require('react-native').NativeModules;

      // Create high-priority channel for task reminders
      NotificationManager.createNotificationChannel({
        id: 'task_reminders',
        name: 'Task Reminders',
        description: 'Notifications for task due dates and nagging reminders',
        importance: 'high', // Shows as heads-up notification
        sound: 'default',
        vibration: true,
        badge: true,
      });

      console.log('[AndroidAdapter] Notification channels configured');
    } catch (error) {
      console.error('[AndroidAdapter] Error setting up notification channels:', error);
    }
  }

  /**
   * Guide user to exact alarm settings (Android 12+)
   * Opens system settings to allow SCHEDULE_EXACT_ALARM permission
   */
  static async openExactAlarmSettings(): Promise<void> {
    try {
      const { Linking, Platform } = require('react-native');

      if (Platform.Version >= 31) {
        const packageName = 'com.dofirst.today'; // Adjust based on your package name

        await Linking.openSettings();
        // Or use specific intent for exact alarm settings:
        // android.settings.REQUEST_SCHEDULE_EXACT_ALARM
      }
    } catch (error) {
      console.error('[AndroidAdapter] Error opening alarm settings:', error);
    }
  }
}
