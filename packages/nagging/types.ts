/**
 * Nagging 2.0 - Type Definitions
 * Based on Due's nagging reliability model
 */

/**
 * Cadence configuration for reminder notifications
 *
 * Default cadence: first reminder 5m after due, then 10m intervals (×3), then 15m thereafter
 */
export interface Cadence {
  /**
   * Minutes to wait before first notification after due time
   * @default 5
   */
  firstAfterMin?: number;

  /**
   * Array of step intervals in minutes for subsequent notifications
   * Once exhausted, uses repeatAfter value
   * @default [10, 10, 10, 15, 15]
   */
  stepMinutes: number[];

  /**
   * Interval in minutes to repeat after stepMinutes exhausted
   * @default 15
   */
  repeatAfter?: number;
}

/**
 * Quiet hours configuration
 * No audible notifications during this period, silent/badge only
 * Catch-up alert delivered at end of quiet hours
 */
export interface QuietHours {
  /**
   * Start time in 24-hour format (HH:MM)
   * @example "22:00" for 10pm
   */
  start: string;

  /**
   * End time in 24-hour format (HH:MM)
   * @example "07:00" for 7am
   */
  end: string;
}

/**
 * Notification action types
 * Matches service worker and native notification actions
 */
export type NotificationAction = 'done' | 'snooze10' | 'snooze60' | 'tomorrowAM';

/**
 * Task nagging configuration stored in database
 */
export interface NaggingConfig {
  /**
   * Custom cadence for this task (null uses default)
   */
  cadence?: Cadence | null;

  /**
   * Quiet hours for this user
   */
  quietHours?: QuietHours | null;

  /**
   * Index in cadence.stepMinutes array
   * Used to track progression through cadence
   */
  stepIndex?: number;

  /**
   * Last notification time
   * Used for healing/rescheduling
   */
  lastNotificationAt?: string;

  /**
   * Whether nagging is enabled for this task
   * @default true
   */
  enabled?: boolean;
}

/**
 * Result of computing next notification times
 */
export interface ScheduleResult {
  /**
   * Array of Date objects for next notifications
   * Typically 3 occurrences to survive app termination
   */
  times: Date[];

  /**
   * Whether any times fell within quiet hours
   */
  hasQuietHours: boolean;

  /**
   * Catch-up alert time (end of quiet hours if notifications were skipped)
   */
  catchUpAt?: Date;
}

/**
 * Default nagging cadence
 * Matches Due's behavior: 5m → 10m (×3) → 15m (repeat)
 */
export const DEFAULT_CADENCE: Cadence = {
  firstAfterMin: 5,
  stepMinutes: [10, 10, 10, 15, 15],
  repeatAfter: 15
};

/**
 * Default quiet hours (10pm - 7am)
 */
export const DEFAULT_QUIET_HOURS: QuietHours = {
  start: '22:00',
  end: '07:00'
};
