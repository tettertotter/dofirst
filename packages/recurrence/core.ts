/**
 * Recurrence Core Logic
 * Compute next instance dates for recurring tasks
 */

import type {
  RecurrenceRule,
  RecurrenceFrequency,
  Weekday,
  NextInstance,
  ValidationResult
} from './types';
import { WEEKDAY_NAMES, WEEKDAY_SHORT } from './types';

/**
 * Compute next instance of a recurring task
 *
 * @param rule - Recurrence rule
 * @param currentDue - Current due date (completed instance)
 * @param occurrenceCount - Current occurrence number (for count-based rules)
 * @returns Next instance date and continuation status
 *
 * @example
 * // Daily task
 * computeNextInstance(
 *   { freq: 'daily', interval: 1 },
 *   new Date('2025-11-01T09:00:00')
 * )
 * // Returns: { dueAt: 2025-11-02T09:00:00, shouldContinue: true }
 *
 * @example
 * // Weekdays only
 * computeNextInstance(
 *   { freq: 'weekly', byweekday: [1,2,3,4,5] }, // Mon-Fri
 *   new Date('2025-11-01T09:00:00') // Friday
 * )
 * // Returns: { dueAt: 2025-11-04T09:00:00 (Monday), shouldContinue: true }
 */
export function computeNextInstance(
  rule: RecurrenceRule,
  currentDue: Date,
  occurrenceCount: number = 0
): NextInstance {
  // Check if recurrence should end
  if (rule.until) {
    const untilDate = new Date(rule.until);
    if (currentDue >= untilDate) {
      return {
        dueAt: currentDue,
        shouldContinue: false
      };
    }
  }

  if (rule.count !== undefined && occurrenceCount >= rule.count) {
    return {
      dueAt: currentDue,
      shouldContinue: false,
      occurrenceNumber: occurrenceCount
    };
  }

  const interval = rule.interval ?? 1;
  let nextDue: Date;

  switch (rule.freq) {
    case 'daily':
      nextDue = computeNextDaily(currentDue, interval);
      break;

    case 'weekly':
      nextDue = computeNextWeekly(currentDue, interval, rule.byweekday);
      break;

    case 'monthly':
      nextDue = computeNextMonthly(currentDue, interval, rule.bymonthday);
      break;

    case 'yearly':
      nextDue = computeNextYearly(currentDue, interval, rule.bymonth, rule.bymonthday);
      break;

    default:
      throw new Error(`Unknown frequency: ${rule.freq}`);
  }

  return {
    dueAt: nextDue,
    shouldContinue: true,
    occurrenceNumber: occurrenceCount + 1
  };
}

/**
 * Compute next daily instance
 */
function computeNextDaily(currentDue: Date, interval: number): Date {
  const next = new Date(currentDue);
  next.setDate(next.getDate() + interval);
  return next;
}

/**
 * Compute next weekly instance
 *
 * If byweekday is specified, finds next occurrence on specified weekdays
 * Otherwise, adds interval weeks to current date
 */
function computeNextWeekly(
  currentDue: Date,
  interval: number,
  byweekday?: Weekday[]
): Date {
  if (!byweekday || byweekday.length === 0) {
    // Simple: add interval weeks
    const next = new Date(currentDue);
    next.setDate(next.getDate() + interval * 7);
    return next;
  }

  // Find next occurrence on specified weekdays
  const currentWeekday = currentDue.getDay() as Weekday;
  const sortedWeekdays = [...byweekday].sort((a, b) => a - b);

  // Find next weekday in current week
  const nextInWeek = sortedWeekdays.find(day => day > currentWeekday);

  if (nextInWeek !== undefined) {
    // Next occurrence is in current week
    const daysUntil = nextInWeek - currentWeekday;
    const next = new Date(currentDue);
    next.setDate(next.getDate() + daysUntil);
    return next;
  }

  // Next occurrence is in next interval
  const firstWeekday = sortedWeekdays[0];
  const daysUntil = (7 - currentWeekday) + firstWeekday + (interval - 1) * 7;
  const next = new Date(currentDue);
  next.setDate(next.getDate() + daysUntil);
  return next;
}

/**
 * Compute next monthly instance
 *
 * If bymonthday is positive: specific day of month (1-31)
 * If bymonthday is negative: count from end of month (-1 = last day)
 * If not specified: same day of month as current
 */
function computeNextMonthly(
  currentDue: Date,
  interval: number,
  bymonthday?: number
): Date {
  const next = new Date(currentDue);
  const targetDay = bymonthday ?? currentDue.getDate();

  // Add interval months
  next.setMonth(next.getMonth() + interval);

  if (targetDay > 0) {
    // Positive: specific day of month
    next.setDate(Math.min(targetDay, getDaysInMonth(next)));
  } else {
    // Negative: count from end
    const daysInMonth = getDaysInMonth(next);
    next.setDate(daysInMonth + targetDay + 1); // -1 becomes last day
  }

  return next;
}

/**
 * Compute next yearly instance
 */
function computeNextYearly(
  currentDue: Date,
  interval: number,
  bymonth?: number,
  bymonthday?: number
): Date {
  const next = new Date(currentDue);

  // Add interval years
  next.setFullYear(next.getFullYear() + interval);

  // Set month if specified
  if (bymonth !== undefined) {
    next.setMonth(bymonth - 1); // bymonth is 1-indexed
  }

  // Set day if specified
  if (bymonthday !== undefined) {
    if (bymonthday > 0) {
      next.setDate(Math.min(bymonthday, getDaysInMonth(next)));
    } else {
      const daysInMonth = getDaysInMonth(next);
      next.setDate(daysInMonth + bymonthday + 1);
    }
  }

  return next;
}

/**
 * Get number of days in a month
 */
function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

/**
 * Validate recurrence rule
 *
 * @param rule - Recurrence rule to validate
 * @returns Validation result with errors
 */
export function validateRecurrenceRule(rule: any): ValidationResult {
  const errors: string[] = [];

  // Check required fields
  if (!rule || typeof rule !== 'object') {
    errors.push('Rule must be an object');
    return { valid: false, errors };
  }

  if (!rule.freq) {
    errors.push('freq is required');
  } else if (!['daily', 'weekly', 'monthly', 'yearly'].includes(rule.freq)) {
    errors.push('freq must be daily, weekly, monthly, or yearly');
  }

  // Validate interval
  if (rule.interval !== undefined) {
    if (!Number.isInteger(rule.interval) || rule.interval < 1) {
      errors.push('interval must be a positive integer');
    }
  }

  // Validate byweekday
  if (rule.byweekday !== undefined) {
    if (!Array.isArray(rule.byweekday)) {
      errors.push('byweekday must be an array');
    } else {
      for (const day of rule.byweekday) {
        if (!Number.isInteger(day) || day < 0 || day > 6) {
          errors.push('byweekday must contain integers 0-6');
          break;
        }
      }
    }
  }

  // Validate bymonthday
  if (rule.bymonthday !== undefined) {
    if (!Number.isInteger(rule.bymonthday) || rule.bymonthday === 0 || rule.bymonthday < -31 || rule.bymonthday > 31) {
      errors.push('bymonthday must be -31 to -1 or 1 to 31');
    }
  }

  // Validate bymonth
  if (rule.bymonth !== undefined) {
    if (!Number.isInteger(rule.bymonth) || rule.bymonth < 1 || rule.bymonth > 12) {
      errors.push('bymonth must be 1-12');
    }
  }

  // Validate until
  if (rule.until !== undefined) {
    const untilDate = new Date(rule.until);
    if (isNaN(untilDate.getTime())) {
      errors.push('until must be a valid ISO 8601 date');
    }
  }

  // Validate count
  if (rule.count !== undefined) {
    if (!Number.isInteger(rule.count) || rule.count < 1) {
      errors.push('count must be a positive integer');
    }
  }

  // Can't have both until and count
  if (rule.until && rule.count) {
    errors.push('Cannot specify both until and count');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Format recurrence rule for human display
 *
 * @param rule - Recurrence rule
 * @returns Human-readable string
 *
 * @example
 * formatRecurrenceRule({ freq: 'daily', interval: 1 })
 * // → "Every day"
 *
 * @example
 * formatRecurrenceRule({ freq: 'weekly', byweekday: [1,3,5] })
 * // → "Every week on Mon, Wed, Fri"
 *
 * @example
 * formatRecurrenceRule({ freq: 'monthly', bymonthday: 1 })
 * // → "Every month on the 1st"
 */
export function formatRecurrenceRule(rule: RecurrenceRule): string {
  const interval = rule.interval ?? 1;
  const parts: string[] = [];

  // Frequency and interval
  if (interval === 1) {
    parts.push('Every');
  } else {
    parts.push(`Every ${interval}`);
  }

  switch (rule.freq) {
    case 'daily':
      parts.push(interval === 1 ? 'day' : 'days');
      break;

    case 'weekly':
      parts.push(interval === 1 ? 'week' : 'weeks');
      if (rule.byweekday && rule.byweekday.length > 0) {
        const days = rule.byweekday.map(d => WEEKDAY_SHORT[d]).join(', ');
        parts.push(`on ${days}`);
      }
      break;

    case 'monthly':
      parts.push(interval === 1 ? 'month' : 'months');
      if (rule.bymonthday !== undefined) {
        if (rule.bymonthday > 0) {
          parts.push(`on the ${ordinal(rule.bymonthday)}`);
        } else if (rule.bymonthday === -1) {
          parts.push('on the last day');
        } else {
          parts.push(`on the ${ordinal(Math.abs(rule.bymonthday))} from end`);
        }
      }
      break;

    case 'yearly':
      parts.push(interval === 1 ? 'year' : 'years');
      if (rule.bymonth !== undefined) {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        parts.push(`in ${monthNames[rule.bymonth - 1]}`);
      }
      if (rule.bymonthday !== undefined && rule.bymonthday > 0) {
        parts.push(`on the ${ordinal(rule.bymonthday)}`);
      }
      break;
  }

  // Add end condition
  if (rule.until) {
    const date = new Date(rule.until);
    parts.push(`until ${date.toLocaleDateString()}`);
  } else if (rule.count) {
    parts.push(`for ${rule.count} times`);
  }

  return parts.join(' ');
}

/**
 * Convert number to ordinal (1st, 2nd, 3rd, etc.)
 */
function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/**
 * Parse user-friendly recurrence input
 *
 * Supports natural language patterns:
 * - "daily" / "every day"
 * - "weekdays"
 * - "weekly" / "every week"
 * - "biweekly" / "every 2 weeks"
 * - "monthly" / "every month"
 * - "yearly" / "every year"
 *
 * @param input - User input string
 * @param baseDate - Base date for context (e.g., for "weekly" means same day of week)
 * @returns Recurrence rule or null if invalid
 */
export function parseRecurrenceInput(input: string, baseDate: Date = new Date()): RecurrenceRule | null {
  const normalized = input.toLowerCase().trim();

  // Daily
  if (normalized === 'daily' || normalized === 'every day') {
    return { freq: 'daily', interval: 1 };
  }

  // Weekdays (Monday-Friday)
  if (normalized === 'weekdays' || normalized === 'every weekday') {
    return { freq: 'weekly', interval: 1, byweekday: [1, 2, 3, 4, 5] };
  }

  // Weekly
  if (normalized === 'weekly' || normalized === 'every week') {
    return { freq: 'weekly', interval: 1, byweekday: [baseDate.getDay() as Weekday] };
  }

  // Biweekly
  if (normalized === 'biweekly' || normalized === 'every 2 weeks') {
    return { freq: 'weekly', interval: 2, byweekday: [baseDate.getDay() as Weekday] };
  }

  // Monthly
  if (normalized === 'monthly' || normalized === 'every month') {
    return { freq: 'monthly', interval: 1, bymonthday: baseDate.getDate() };
  }

  // Yearly
  if (normalized === 'yearly' || normalized === 'every year') {
    return { freq: 'yearly', interval: 1, bymonth: baseDate.getMonth() + 1, bymonthday: baseDate.getDate() };
  }

  return null;
}
