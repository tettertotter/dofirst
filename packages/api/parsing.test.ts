/**
 * Test suite for natural language date parsing
 * Run with: pnpm test (when test runner is configured)
 */

import { parseNaturalDate, extractDates, formatRelativeTime } from './date-parser';
import { parseInlineEnhanced, resolveDate } from './parsing-enhanced';

// Test helpers
function testDate(year: number, month: number, day: number, hour: number = 9, minute: number = 0): Date {
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

describe('Natural Date Parser', () => {
  const now = testDate(2025, 11, 1, 10, 30); // Saturday, Nov 1, 2025, 10:30am

  describe('Relative Time', () => {
    test('in 10m', () => {
      const result = parseNaturalDate('in 10m', now);
      expect(result.date).not.toBeNull();
      expect(result.pattern).toBe('relative-time');
      expect(result.date!.getTime()).toBe(now.getTime() + 10 * 60 * 1000);
    });

    test('in 2h', () => {
      const result = parseNaturalDate('in 2h', now);
      expect(result.date).not.toBeNull();
      expect(result.date!.getTime()).toBe(now.getTime() + 2 * 60 * 60 * 1000);
    });

    test('in 3d', () => {
      const result = parseNaturalDate('in 3d', now);
      expect(result.date).not.toBeNull();
      expect(result.date!.getTime()).toBe(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    });

    test('in 2 hours', () => {
      const result = parseNaturalDate('in 2 hours', now);
      expect(result.date).not.toBeNull();
      expect(result.pattern).toBe('relative-time');
    });

    test('in 30 minutes', () => {
      const result = parseNaturalDate('in 30 minutes', now);
      expect(result.date).not.toBeNull();
      expect(result.date!.getTime()).toBe(now.getTime() + 30 * 60 * 1000);
    });
  });

  describe('Relative Days', () => {
    test('today', () => {
      const result = parseNaturalDate('today', now);
      expect(result.date).not.toBeNull();
      expect(result.pattern).toBe('relative-day');
      expect(result.date!.getDate()).toBe(1);
      expect(result.date!.getHours()).toBe(9); // Default 9am
    });

    test('today 5pm', () => {
      const result = parseNaturalDate('today 5pm', now);
      expect(result.date).not.toBeNull();
      expect(result.date!.getHours()).toBe(17);
      expect(result.date!.getMinutes()).toBe(0);
    });

    test('tomorrow', () => {
      const result = parseNaturalDate('tomorrow', now);
      expect(result.date).not.toBeNull();
      expect(result.date!.getDate()).toBe(2);
      expect(result.date!.getHours()).toBe(9);
    });

    test('tomorrow 9am', () => {
      const result = parseNaturalDate('tomorrow 9am', now);
      expect(result.date).not.toBeNull();
      expect(result.date!.getDate()).toBe(2);
      expect(result.date!.getHours()).toBe(9);
    });

    test('today 1:30pm', () => {
      const result = parseNaturalDate('today 1:30pm', now);
      expect(result.date).not.toBeNull();
      expect(result.date!.getHours()).toBe(13);
      expect(result.date!.getMinutes()).toBe(30);
    });
  });

  describe('Weekdays', () => {
    test('monday (next week)', () => {
      const result = parseNaturalDate('monday', now);
      expect(result.date).not.toBeNull();
      expect(result.pattern).toBe('weekday');
      expect(result.date!.getDay()).toBe(1); // Monday
      expect(result.date!.getDate()).toBe(3); // Nov 3
    });

    test('friday', () => {
      const result = parseNaturalDate('friday', now);
      expect(result.date).not.toBeNull();
      expect(result.date!.getDay()).toBe(5); // Friday
      expect(result.date!.getDate()).toBe(7); // Nov 7
    });

    test('fri 9a', () => {
      const result = parseNaturalDate('fri 9a', now);
      expect(result.date).not.toBeNull();
      expect(result.date!.getHours()).toBe(9);
      expect(result.date!.getMinutes()).toBe(0);
    });

    test('monday 2pm', () => {
      const result = parseNaturalDate('monday 2pm', now);
      expect(result.date).not.toBeNull();
      expect(result.date!.getHours()).toBe(14);
    });

    test('wed 10:30am', () => {
      const result = parseNaturalDate('wed 10:30am', now);
      expect(result.date).not.toBeNull();
      expect(result.date!.getHours()).toBe(10);
      expect(result.date!.getMinutes()).toBe(30);
    });
  });

  describe('Legacy Tokens', () => {
    test('@today', () => {
      const result = parseNaturalDate('@today', now);
      expect(result.date).not.toBeNull();
      expect(result.pattern).toBe('legacy-token');
      expect(result.date!.getDate()).toBe(1);
    });

    test('@tomorrow', () => {
      const result = parseNaturalDate('@tomorrow', now);
      expect(result.date).not.toBeNull();
      expect(result.date!.getDate()).toBe(2);
    });

    test('@2025-12-25', () => {
      const result = parseNaturalDate('@2025-12-25', now);
      expect(result.date).not.toBeNull();
      expect(result.date!.getFullYear()).toBe(2025);
      expect(result.date!.getMonth()).toBe(11); // December (0-indexed)
      expect(result.date!.getDate()).toBe(25);
    });
  });

  describe('No Match', () => {
    test('random text', () => {
      const result = parseNaturalDate('buy milk', now);
      expect(result.date).toBeNull();
      expect(result.pattern).toBeNull();
    });

    test('invalid date', () => {
      const result = parseNaturalDate('@2025-13-45', now);
      expect(result.date).toBeNull();
    });
  });
});

describe('Enhanced Inline Parser', () => {
  const now = testDate(2025, 11, 1, 10, 30);

  test('tags, priority, and date', () => {
    const result = parseInlineEnhanced('Buy milk today 5pm #personal !2', now);

    expect(result.title).toBe('Buy milk');
    expect(result.tags).toEqual(['personal']);
    expect(result.priority).toBe(2);
    expect(result.dueDate).not.toBeUndefined();
    expect(result.dueDate!.getHours()).toBe(17);
    expect(result.rawDateExpression).toBe('today 5pm');
    expect(result.datePattern).toBe('relative-day');
  });

  test('relative time', () => {
    const result = parseInlineEnhanced('Call mom in 2h #personal', now);

    expect(result.title).toBe('Call mom');
    expect(result.tags).toEqual(['personal']);
    expect(result.dueDate).not.toBeUndefined();
    expect(result.rawDateExpression).toBe('in 2h');
    expect(result.datePattern).toBe('relative-time');
  });

  test('weekday', () => {
    const result = parseInlineEnhanced('Team meeting fri 9a #work !1', now);

    expect(result.title).toBe('Team meeting');
    expect(result.tags).toEqual(['work']);
    expect(result.priority).toBe(1);
    expect(result.dueDate).not.toBeUndefined();
    expect(result.dueDate!.getDay()).toBe(5); // Friday
    expect(result.dueDate!.getHours()).toBe(9);
  });

  test('no date', () => {
    const result = parseInlineEnhanced('Someday task #personal', now);

    expect(result.title).toBe('Someday task');
    expect(result.tags).toEqual(['personal']);
    expect(result.dueDate).toBeUndefined();
    expect(result.rawDateExpression).toBeUndefined();
  });

  test('multiple tags', () => {
    const result = parseInlineEnhanced('Project review tomorrow 2pm #work #urgent !1', now);

    expect(result.title).toBe('Project review');
    expect(result.tags).toEqual(['work', 'urgent']);
    expect(result.priority).toBe(1);
    expect(result.dueDate).not.toBeUndefined();
    expect(result.dueDate!.getDate()).toBe(2);
    expect(result.dueDate!.getHours()).toBe(14);
  });
});

describe('Extract Dates', () => {
  const now = testDate(2025, 11, 1, 10, 30);

  test('multiple dates in text', () => {
    const text = 'Meeting today 2pm, follow-up friday 10am, and call in 2h';
    const dates = extractDates(text, now);

    expect(dates.length).toBe(3);
    expect(dates[0].pattern).toBe('relative-day'); // today 2pm
    expect(dates[1].pattern).toBe('weekday'); // friday 10am
    expect(dates[2].pattern).toBe('relative-time'); // in 2h
  });

  test('no dates', () => {
    const text = 'Buy milk and bread';
    const dates = extractDates(text, now);

    expect(dates.length).toBe(0);
  });
});

describe('Format Relative Time', () => {
  const now = testDate(2025, 11, 1, 10, 30);

  test('in minutes', () => {
    const future = new Date(now.getTime() + 15 * 60 * 1000);
    expect(formatRelativeTime(future, now)).toBe('in 15 min');
  });

  test('in hours', () => {
    const future = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    expect(formatRelativeTime(future, now)).toBe('in 2 hours');
  });

  test('in days', () => {
    const future = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(future, now)).toBe('in 3 days');
  });

  test('past', () => {
    const past = new Date(now.getTime() - 30 * 60 * 1000);
    expect(formatRelativeTime(past, now)).toBe('30 min ago');
  });
});

describe('Resolve Date (Legacy)', () => {
  const now = testDate(2025, 11, 1, 10, 30);

  test('today', () => {
    const date = resolveDate('today', now);
    expect(date).not.toBeNull();
    expect(date!.getDate()).toBe(1);
    expect(date!.getHours()).toBe(9);
  });

  test('tomorrow', () => {
    const date = resolveDate('tomorrow', now);
    expect(date).not.toBeNull();
    expect(date!.getDate()).toBe(2);
  });

  test('YYYY-MM-DD', () => {
    const date = resolveDate('2025-12-25', now);
    expect(date).not.toBeNull();
    expect(date!.getFullYear()).toBe(2025);
    expect(date!.getMonth()).toBe(11); // December
    expect(date!.getDate()).toBe(25);
  });

  test('invalid', () => {
    const date = resolveDate('invalid', now);
    expect(date).toBeNull();
  });
});

// Export for running in browser console or Node
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    parseNaturalDate,
    parseInlineEnhanced,
    extractDates,
    formatRelativeTime,
    resolveDate,
  };
}
