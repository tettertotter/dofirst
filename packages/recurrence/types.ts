/**
 * Recurrence Types
 * Based on iCalendar RFC 5545 (simplified for DoFirst use cases)
 */

/**
 * Recurrence frequency
 */
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

/**
 * Weekday identifiers (0 = Sunday, 6 = Saturday)
 */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Weekday names for display
 */
export const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
] as const;

/**
 * Short weekday names
 */
export const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

/**
 * Recurrence rule
 * Stored as JSONB in database
 */
export interface RecurrenceRule {
  /**
   * Recurrence frequency
   */
  freq: RecurrenceFrequency;

  /**
   * Interval between occurrences
   * @default 1
   * @example freq='daily', interval=2 → every 2 days
   */
  interval?: number;

  /**
   * Days of week (for weekly recurrence)
   * Array of weekday numbers (0=Sunday, 6=Saturday)
   * @example [1, 3, 5] → Monday, Wednesday, Friday
   */
  byweekday?: Weekday[];

  /**
   * Day of month (for monthly recurrence)
   * 1-31, or negative for "last day of month"
   * @example 1 → first day of month
   * @example -1 → last day of month
   */
  bymonthday?: number;

  /**
   * Month of year (for yearly recurrence)
   * 1-12 (January = 1)
   * @example 12 → December
   */
  bymonth?: number;

  /**
   * End date for recurrence (optional)
   * ISO 8601 timestamp
   */
  until?: string;

  /**
   * Maximum number of occurrences (optional)
   * Alternative to 'until'
   */
  count?: number;
}

/**
 * Result of computing next instance
 */
export interface NextInstance {
  /**
   * Due date for next instance
   */
  dueAt: Date;

  /**
   * Whether recurrence should continue
   * false if reached 'until' or 'count' limit
   */
  shouldContinue: boolean;

  /**
   * Current occurrence number (if count specified)
   */
  occurrenceNumber?: number;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Preset recurrence patterns
 */
export const RECURRENCE_PRESETS = {
  daily: {
    freq: 'daily' as RecurrenceFrequency,
    interval: 1
  },
  weekdays: {
    freq: 'weekly' as RecurrenceFrequency,
    interval: 1,
    byweekday: [1, 2, 3, 4, 5] as Weekday[] // Monday-Friday
  },
  weekly: {
    freq: 'weekly' as RecurrenceFrequency,
    interval: 1
  },
  biweekly: {
    freq: 'weekly' as RecurrenceFrequency,
    interval: 2
  },
  monthly: {
    freq: 'monthly' as RecurrenceFrequency,
    interval: 1
  },
  yearly: {
    freq: 'yearly' as RecurrenceFrequency,
    interval: 1
  }
} as const;
