/**
 * Nagging 2.0 - Scheduler Module
 * Based on Due's persistent nagging algorithm
 *
 * Goals: persistent, respectful, predictable
 * Survives: OS constraints, app termination, notification purges
 */

import type { Cadence, QuietHours, ScheduleResult } from './types';
import { DEFAULT_CADENCE } from './types';

/**
 * Check if a given time falls within quiet hours
 *
 * Handles quiet hours that cross midnight (e.g., 22:00 - 07:00)
 *
 * @param date - Date to check
 * @param quiet - Quiet hours configuration
 * @returns true if date is within quiet hours
 */
export function inQuietHours(date: Date, quiet: QuietHours | null): boolean {
  if (!quiet) return false;

  const [startHour, startMin] = quiet.start.split(':').map(Number);
  const [endHour, endMin] = quiet.end.split(':').map(Number);

  const minutes = date.getHours() * 60 + date.getMinutes();
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  // Normal case: quiet hours within same day (e.g., 13:00 - 17:00)
  if (startMinutes <= endMinutes) {
    return minutes >= startMinutes && minutes < endMinutes;
  }

  // Cross-midnight case: (e.g., 22:00 - 07:00)
  return minutes >= startMinutes || minutes < endMinutes;
}

/**
 * Roll a time forward to the end of quiet hours
 *
 * If time falls within quiet hours, return the end of quiet hours
 * Handles cross-midnight quiet hours
 *
 * @param time - Current time that fell in quiet hours
 * @param quiet - Quiet hours configuration
 * @returns Time at end of quiet hours
 */
function rollToEndOfQuiet(time: Date, quiet: QuietHours): Date {
  const [endHour, endMin] = quiet.end.split(':').map(Number);

  const next = new Date(time);
  next.setHours(endHour, endMin, 0, 0);

  // If we're still in quiet hours after setting to end time, add a day
  // This handles the case where we're past the start time but the end is tomorrow
  if (inQuietHours(next, quiet)) {
    next.setDate(next.getDate() + 1);
  }

  return next;
}

/**
 * Compute next nagging notification times
 *
 * Implements Due's nagging algorithm:
 * 1. First notification 5m after due (or immediate if already past due)
 * 2. Subsequent notifications follow cadence steps
 * 3. Respects quiet hours by rolling to end of quiet period
 * 4. Returns fixed number of future times (default 3) for local scheduling
 *
 * @param due - Due date/time for the task
 * @param now - Current time (for testing)
 * @param quiet - Quiet hours configuration (null = no quiet hours)
 * @param cadence - Notification cadence (defaults to Due's cadence)
 * @param limit - Number of future times to compute (default 3 for local scheduling)
 * @param startIndex - Index in cadence.stepMinutes to start from (for healing)
 * @returns Array of future notification times
 *
 * @example
 * // Task due at 2pm, current time 2:05pm
 * const times = computeNextTimes(
 *   new Date('2025-11-01T14:00:00'),
 *   new Date('2025-11-01T14:05:00')
 * );
 * // Returns: [2:10pm, 2:20pm, 2:30pm] (5m, +10m, +10m)
 *
 * @example
 * // With quiet hours (10pm - 7am)
 * const times = computeNextTimes(
 *   new Date('2025-11-01T21:00:00'),
 *   new Date('2025-11-01T21:00:00'),
 *   { start: '22:00', end: '07:00' }
 * );
 * // Returns: [9:05pm, 9:15pm, 9:25pm, 7:00am catchup, ...]
 */
export function computeNextTimes(
  due: Date,
  now: Date,
  quiet: QuietHours | null = null,
  cadence: Cadence = DEFAULT_CADENCE,
  limit: number = 3,
  startIndex: number = 0
): Date[] {
  const times: Date[] = [];

  // Start from either due time or current time (whichever is later)
  let t = new Date(Math.max(due.getTime(), now.getTime()));

  // First nudge: add firstAfterMin to the starting point
  if (cadence.firstAfterMin !== undefined && startIndex === 0) {
    if (now >= due) {
      // Already past due: first nudge is firstAfterMin from now
      t = new Date(now.getTime() + cadence.firstAfterMin * 60 * 1000);
    } else {
      // Not yet due: first nudge is firstAfterMin after due
      t = new Date(due.getTime() + cadence.firstAfterMin * 60 * 1000);
    }
  }

  let stepIdx = startIndex;

  while (times.length < limit) {
    // Get step interval: use cadence array or fallback to repeatAfter
    const step = cadence.stepMinutes[stepIdx] ?? cadence.repeatAfter ?? 15;

    // Advance time by step interval
    t = new Date(t.getTime() + step * 60 * 1000);

    // If this time falls in quiet hours, roll to end of quiet hours
    if (quiet && inQuietHours(t, quiet)) {
      t = rollToEndOfQuiet(t, quiet);
    }

    times.push(new Date(t));
    stepIdx++;
  }

  return times;
}

/**
 * Compute next notification times with metadata
 *
 * Enhanced version that returns additional metadata about scheduling:
 * - Whether any times fell in quiet hours
 * - Catch-up alert time if applicable
 *
 * @param due - Due date/time for the task
 * @param now - Current time
 * @param quiet - Quiet hours configuration
 * @param cadence - Notification cadence
 * @param limit - Number of future times to compute
 * @param startIndex - Index in cadence to start from
 * @returns Schedule result with times and metadata
 */
export function computeSchedule(
  due: Date,
  now: Date,
  quiet: QuietHours | null = null,
  cadence: Cadence = DEFAULT_CADENCE,
  limit: number = 3,
  startIndex: number = 0
): ScheduleResult {
  const times = computeNextTimes(due, now, quiet, cadence, limit, startIndex);

  // Check if any computed times were adjusted for quiet hours
  const originalTimes = computeNextTimes(due, now, null, cadence, limit, startIndex);
  const hasQuietHours = times.some((t, i) => t.getTime() !== originalTimes[i].getTime());

  // If quiet hours affected scheduling, compute catch-up alert
  let catchUpAt: Date | undefined;
  if (hasQuietHours && quiet) {
    // Catch-up alert is at the end of quiet hours
    const now = new Date();
    if (inQuietHours(now, quiet)) {
      catchUpAt = rollToEndOfQuiet(now, quiet);
    }
  }

  return {
    times,
    hasQuietHours,
    catchUpAt
  };
}

/**
 * Format cadence for display
 *
 * @param cadence - Cadence configuration
 * @returns Human-readable cadence description
 *
 * @example
 * formatCadence(DEFAULT_CADENCE)
 * // → "5m → 10m (×3) → 15m (repeat)"
 */
export function formatCadence(cadence: Cadence): string {
  const parts: string[] = [];

  if (cadence.firstAfterMin) {
    parts.push(`${cadence.firstAfterMin}m`);
  }

  // Group consecutive identical steps
  const groups: Array<{value: number, count: number}> = [];
  for (const step of cadence.stepMinutes) {
    const last = groups[groups.length - 1];
    if (last && last.value === step) {
      last.count++;
    } else {
      groups.push({ value: step, count: 1 });
    }
  }

  for (const group of groups) {
    if (group.count > 1) {
      parts.push(`${group.value}m (×${group.count})`);
    } else {
      parts.push(`${group.value}m`);
    }
  }

  if (cadence.repeatAfter) {
    parts.push(`${cadence.repeatAfter}m (repeat)`);
  }

  return parts.join(' → ');
}

/**
 * Parse custom cadence from user input
 *
 * Supports formats like:
 * - "5, 10, 10, 15" → steps array
 * - "10" → single repeating step
 * - null/undefined → default cadence
 *
 * @param input - User input string
 * @returns Parsed cadence or default
 */
export function parseCadence(input: string | null | undefined): Cadence {
  if (!input || !input.trim()) {
    return DEFAULT_CADENCE;
  }

  const parts = input.split(',').map(s => s.trim()).filter(Boolean);
  const steps = parts.map(Number).filter(n => !isNaN(n) && n > 0);

  if (steps.length === 0) {
    return DEFAULT_CADENCE;
  }

  if (steps.length === 1) {
    // Single number: use as repeat interval
    return {
      firstAfterMin: 5,
      stepMinutes: [],
      repeatAfter: steps[0]
    };
  }

  // Multiple numbers: use as step array with last as repeat
  return {
    firstAfterMin: 5,
    stepMinutes: steps.slice(0, -1),
    repeatAfter: steps[steps.length - 1]
  };
}

/**
 * Validate quiet hours format
 *
 * @param start - Start time string (HH:MM)
 * @param end - End time string (HH:MM)
 * @returns true if valid format
 */
export function isValidQuietHours(start: string, end: string): boolean {
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

  if (!timeRegex.test(start) || !timeRegex.test(end)) {
    return false;
  }

  return true;
}
