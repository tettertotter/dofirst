/**
 * Shared notification types and interfaces
 * Platform-agnostic abstractions for iOS, Android, and Web notifications
 */

/**
 * Notification action types
 * Must match across all platforms for consistent UX
 */
export type NotificationAction = 'done' | 'snooze10' | 'snooze60' | 'tomorrowAM';

/**
 * Notification payload
 * Contains all data needed to display and handle a notification
 */
export interface NotificationPayload {
  taskId: string;
  title: string;
  body?: string;
  dueAt: string; // ISO 8601 datetime
  priority?: number; // 1-5
  poolId?: string;
  userId?: string;
}

/**
 * Notification scheduling result
 * Returned after successfully scheduling notifications
 */
export interface ScheduleResult {
  success: boolean;
  scheduledCount: number;
  notificationIds: string[];
  error?: string;
}

/**
 * Platform-agnostic notification adapter interface
 * All platform-specific implementations must conform to this interface
 */
export interface NotificationAdapter {
  /**
   * Request notification permissions from the user
   * @returns true if granted, false otherwise
   */
  requestPermission(): Promise<boolean>;

  /**
   * Check if notification permissions are granted
   * @returns true if granted, false otherwise
   */
  hasPermission(): Promise<boolean>;

  /**
   * Schedule notifications at specific times
   * Implementations should handle platform-specific limits (e.g., iOS 64 notification limit)
   *
   * @param taskId - Unique task identifier for grouping notifications
   * @param times - Array of exact datetimes to fire notifications
   * @param payload - Notification data
   * @returns Result with scheduled notification IDs
   */
  schedule(
    taskId: string,
    times: Date[],
    payload: NotificationPayload
  ): Promise<ScheduleResult>;

  /**
   * Cancel all scheduled notifications for a specific task
   *
   * @param taskId - Task identifier
   * @returns true if successfully cancelled, false otherwise
   */
  cancel(taskId: string): Promise<boolean>;

  /**
   * Cancel all scheduled notifications
   * Used for cleanup or logout scenarios
   *
   * @returns true if successfully cancelled all, false otherwise
   */
  cancelAll(): Promise<boolean>;

  /**
   * Handle notification action (when user taps action button)
   * This is called by platform-specific notification receivers
   *
   * @param action - The action identifier (done, snooze10, etc.)
   * @param payload - The original notification payload
   * @returns true if handled successfully, false otherwise
   */
  handleAction(
    action: NotificationAction,
    payload: NotificationPayload
  ): Promise<boolean>;

  /**
   * Get pending scheduled notifications
   * Useful for debugging and healing schedules
   *
   * @param taskId - Optional task ID to filter by
   * @returns Array of pending notification identifiers
   */
  getPendingNotifications(taskId?: string): Promise<string[]>;
}

/**
 * Platform detection helper
 */
export type Platform = 'ios' | 'android' | 'web';

/**
 * Get current platform
 */
export function getPlatform(): Platform {
  if (typeof window === 'undefined') {
    return 'web'; // Server-side, default to web
  }

  // Check for React Native
  if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
    // Detect iOS vs Android
    const userAgent = navigator.userAgent || '';
    if (/android/i.test(userAgent)) {
      return 'android';
    }
    return 'ios';
  }

  return 'web';
}
