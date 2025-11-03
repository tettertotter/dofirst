/**
 * Test suite for nagging scheduler
 */

import {
  computeNextTimes,
  computeSchedule,
  inQuietHours,
  formatCadence,
  parseCadence,
  isValidQuietHours
} from './scheduler';
import { DEFAULT_CADENCE, type QuietHours, type Cadence } from './types';

// Test helpers
function testDate(year: number, month: number, day: number, hour: number = 9, minute: number = 0): Date {
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

describe('Nagging Scheduler', () => {
  describe('inQuietHours', () => {
    const quiet: QuietHours = { start: '22:00', end: '07:00' };

    test('midnight crossing - during quiet hours', () => {
      expect(inQuietHours(testDate(2025, 11, 1, 23, 30), quiet)).toBe(true);
      expect(inQuietHours(testDate(2025, 11, 1, 6, 30), quiet)).toBe(true);
    });

    test('midnight crossing - outside quiet hours', () => {
      expect(inQuietHours(testDate(2025, 11, 1, 12, 0), quiet)).toBe(false);
      expect(inQuietHours(testDate(2025, 11, 1, 7, 0), quiet)).toBe(false);
      expect(inQuietHours(testDate(2025, 11, 1, 21, 59), quiet)).toBe(false);
    });

    test('same-day quiet hours', () => {
      const daytime: QuietHours = { start: '13:00', end: '17:00' };
      expect(inQuietHours(testDate(2025, 11, 1, 14, 0), daytime)).toBe(true);
      expect(inQuietHours(testDate(2025, 11, 1, 12, 59), daytime)).toBe(false);
      expect(inQuietHours(testDate(2025, 11, 1, 17, 0), daytime)).toBe(false);
    });

    test('null quiet hours', () => {
      expect(inQuietHours(testDate(2025, 11, 1, 23, 0), null)).toBe(false);
    });
  });

  describe('computeNextTimes', () => {
    const now = testDate(2025, 11, 1, 14, 0); // 2pm

    test('basic cadence - task already due', () => {
      const due = testDate(2025, 11, 1, 13, 55); // 5 minutes ago
      const times = computeNextTimes(due, now, null, DEFAULT_CADENCE, 5);

      expect(times.length).toBe(5);

      // First: now + 5m = 2:05pm
      expect(times[0].getHours()).toBe(14);
      expect(times[0].getMinutes()).toBe(5);

      // Second: 2:05pm + 10m = 2:15pm
      expect(times[1].getHours()).toBe(14);
      expect(times[1].getMinutes()).toBe(15);

      // Third: 2:15pm + 10m = 2:25pm
      expect(times[2].getHours()).toBe(14);
      expect(times[2].getMinutes()).toBe(25);

      // Fourth: 2:25pm + 10m = 2:35pm
      expect(times[3].getHours()).toBe(14);
      expect(times[3].getMinutes()).toBe(35);

      // Fifth: 2:35pm + 15m = 2:50pm
      expect(times[4].getHours()).toBe(14);
      expect(times[4].getMinutes()).toBe(50);
    });

    test('future due time', () => {
      const due = testDate(2025, 11, 1, 15, 0); // 3pm (future)
      const times = computeNextTimes(due, now, null, DEFAULT_CADENCE, 3);

      expect(times.length).toBe(3);

      // First: 3pm + 5m = 3:05pm
      expect(times[0].getHours()).toBe(15);
      expect(times[0].getMinutes()).toBe(5);

      // Second: 3:05pm + 10m = 3:15pm
      expect(times[1].getHours()).toBe(15);
      expect(times[1].getMinutes()).toBe(15);

      // Third: 3:15pm + 10m = 3:25pm
      expect(times[2].getHours()).toBe(15);
      expect(times[2].getMinutes()).toBe(25);
    });

    test('with quiet hours - roll to morning', () => {
      const quiet: QuietHours = { start: '22:00', end: '07:00' };
      const due = testDate(2025, 11, 1, 21, 50); // 9:50pm
      const now = testDate(2025, 11, 1, 21, 50);

      const times = computeNextTimes(due, now, quiet, DEFAULT_CADENCE, 3);

      expect(times.length).toBe(3);

      // First: 9:50pm + 5m = 9:55pm (before quiet hours)
      expect(times[0].getHours()).toBe(21);
      expect(times[0].getMinutes()).toBe(55);

      // Second: 9:55pm + 10m = 10:05pm → rolls to 7:00am (in quiet)
      expect(times[1].getHours()).toBe(7);
      expect(times[1].getMinutes()).toBe(0);
      expect(times[1].getDate()).toBe(2); // Next day

      // Third: 7:00am + 10m = 7:10am
      expect(times[2].getHours()).toBe(7);
      expect(times[2].getMinutes()).toBe(10);
    });

    test('custom cadence', () => {
      const cadence: Cadence = {
        firstAfterMin: 1,
        stepMinutes: [5, 5],
        repeatAfter: 10
      };

      const due = testDate(2025, 11, 1, 14, 0);
      const now = due;

      const times = computeNextTimes(due, now, null, cadence, 5);

      // First: 2:00pm + 1m = 2:01pm
      expect(times[0].getHours()).toBe(14);
      expect(times[0].getMinutes()).toBe(1);

      // Second: 2:01pm + 5m = 2:06pm
      expect(times[1].getHours()).toBe(14);
      expect(times[1].getMinutes()).toBe(6);

      // Third: 2:06pm + 5m = 2:11pm
      expect(times[2].getHours()).toBe(14);
      expect(times[2].getMinutes()).toBe(11);

      // Fourth: 2:11pm + 10m = 2:21pm (repeatAfter)
      expect(times[3].getHours()).toBe(14);
      expect(times[3].getMinutes()).toBe(21);

      // Fifth: 2:21pm + 10m = 2:31pm (repeatAfter)
      expect(times[4].getHours()).toBe(14);
      expect(times[4].getMinutes()).toBe(31);
    });

    test('startIndex for healing', () => {
      const due = testDate(2025, 11, 1, 14, 0);
      const now = testDate(2025, 11, 1, 14, 5);

      // Start from index 2 (skip first two steps)
      const times = computeNextTimes(due, now, null, DEFAULT_CADENCE, 3, 2);

      expect(times.length).toBe(3);

      // Uses stepMinutes[2] = 10, stepMinutes[3] = 15, stepMinutes[4] = 15
      // First: now + 10m = 2:15pm
      expect(times[0].getHours()).toBe(14);
      expect(times[0].getMinutes()).toBe(15);

      // Second: 2:15pm + 15m = 2:30pm
      expect(times[1].getHours()).toBe(14);
      expect(times[1].getMinutes()).toBe(30);

      // Third: 2:30pm + 15m = 2:45pm
      expect(times[2].getHours()).toBe(14);
      expect(times[2].getMinutes()).toBe(45);
    });
  });

  describe('computeSchedule', () => {
    test('returns metadata', () => {
      const quiet: QuietHours = { start: '22:00', end: '07:00' };
      const due = testDate(2025, 11, 1, 21, 50);
      const now = due;

      const result = computeSchedule(due, now, quiet, DEFAULT_CADENCE, 3);

      expect(result.times.length).toBe(3);
      expect(result.hasQuietHours).toBe(true);
    });

    test('no quiet hours', () => {
      const due = testDate(2025, 11, 1, 14, 0);
      const now = due;

      const result = computeSchedule(due, now, null, DEFAULT_CADENCE, 3);

      expect(result.times.length).toBe(3);
      expect(result.hasQuietHours).toBe(false);
      expect(result.catchUpAt).toBeUndefined();
    });
  });

  describe('formatCadence', () => {
    test('default cadence', () => {
      const formatted = formatCadence(DEFAULT_CADENCE);
      expect(formatted).toBe('5m → 10m (×3) → 15m (×2) → 15m (repeat)');
    });

    test('simple repeat', () => {
      const cadence: Cadence = {
        firstAfterMin: 5,
        stepMinutes: [],
        repeatAfter: 10
      };
      expect(formatCadence(cadence)).toBe('5m → 10m (repeat)');
    });

    test('mixed steps', () => {
      const cadence: Cadence = {
        firstAfterMin: 1,
        stepMinutes: [5, 10, 10, 15],
        repeatAfter: 20
      };
      expect(formatCadence(cadence)).toBe('1m → 5m → 10m (×2) → 15m → 20m (repeat)');
    });
  });

  describe('parseCadence', () => {
    test('comma-separated steps', () => {
      const cadence = parseCadence('5, 10, 10, 15');
      expect(cadence.firstAfterMin).toBe(5);
      expect(cadence.stepMinutes).toEqual([5, 10, 10]);
      expect(cadence.repeatAfter).toBe(15);
    });

    test('single number', () => {
      const cadence = parseCadence('10');
      expect(cadence.firstAfterMin).toBe(5);
      expect(cadence.stepMinutes).toEqual([]);
      expect(cadence.repeatAfter).toBe(10);
    });

    test('empty input', () => {
      expect(parseCadence('')).toEqual(DEFAULT_CADENCE);
      expect(parseCadence(null)).toEqual(DEFAULT_CADENCE);
      expect(parseCadence(undefined)).toEqual(DEFAULT_CADENCE);
    });

    test('invalid input', () => {
      expect(parseCadence('abc')).toEqual(DEFAULT_CADENCE);
      expect(parseCadence('5, , 10')).toEqual({ firstAfterMin: 5, stepMinutes: [5], repeatAfter: 10 });
    });
  });

  describe('isValidQuietHours', () => {
    test('valid times', () => {
      expect(isValidQuietHours('22:00', '07:00')).toBe(true);
      expect(isValidQuietHours('00:00', '23:59')).toBe(true);
      expect(isValidQuietHours('13:30', '17:45')).toBe(true);
    });

    test('invalid times', () => {
      expect(isValidQuietHours('24:00', '07:00')).toBe(false);
      expect(isValidQuietHours('22:00', '07:60')).toBe(false);
      expect(isValidQuietHours('22', '07:00')).toBe(false);
      expect(isValidQuietHours('22:00', '7:00')).toBe(false);
      expect(isValidQuietHours('invalid', 'time')).toBe(false);
    });
  });
});
