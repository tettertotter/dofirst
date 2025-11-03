/**
 * Natural Language Date Parser
 * Supports Due-style date parsing with timezone awareness
 *
 * Patterns supported:
 * - "today 5pm", "tomorrow 9am"
 * - "in 10m", "in 2h", "in 3d"
 * - "fri 9a", "monday 2pm", "tuesday"
 * - @today, @tomorrow, @YYYY-MM-DD (legacy)
 *
 * Time formats:
 * - 12-hour: "9am", "5pm", "1:30pm"
 * - 24-hour: "09:00", "17:00", "13:30"
 * - Shorthand: "9a", "5p"
 */

export interface ParsedDate {
  date: Date | null;
  raw: string;
  pattern: string | null;
}

/**
 * Parse natural language date/time from text
 * Returns Date object or null if no date found
 *
 * @param input - Raw text that may contain date references
 * @param now - Current time (for testing, defaults to new Date())
 * @param timezone - IANA timezone (defaults to system timezone)
 * @returns Parsed date object with metadata
 *
 * @example
 * parseNaturalDate("today 5pm")           // → Today at 5:00 PM
 * parseNaturalDate("in 2h")               // → 2 hours from now
 * parseNaturalDate("fri 9a")              // → Next Friday at 9:00 AM
 * parseNaturalDate("@2025-12-25")         // → Dec 25, 2025 at 9:00 AM
 */
export function parseNaturalDate(
  input: string,
  now: Date = new Date(),
  timezone?: string
): ParsedDate {
  const text = input.toLowerCase().trim();

  // Try each pattern in order of specificity
  const parsers = [
    parseRelativeTime,      // "in 10m", "in 2h", "in 3d"
    parseRelativeDay,       // "today 5pm", "tomorrow 9am"
    parseWeekday,           // "fri 9a", "monday 2pm"
    parseLegacyToken,       // "@today", "@2025-12-25"
  ];

  for (const parser of parsers) {
    const result = parser(text, now, timezone);
    if (result.date) {
      return result;
    }
  }

  return { date: null, raw: input, pattern: null };
}

/**
 * Parse relative time: "in 10m", "in 2h", "in 3d"
 */
function parseRelativeTime(text: string, now: Date): ParsedDate {
  // Pattern: "in <number><unit>"
  // Units: m (minutes), h (hours), d (days), w (weeks)
  const match = text.match(/\bin\s+(\d+)\s*(m|min|mins|minutes?|h|hr|hrs|hours?|d|days?|w|weeks?)\b/i);

  if (!match) {
    return { date: null, raw: text, pattern: null };
  }

  const [full, amount, unit] = match;
  const value = parseInt(amount, 10);

  let milliseconds = 0;

  // Normalize unit
  const unitLower = unit.toLowerCase();
  if (unitLower.startsWith('m')) {
    // minutes
    milliseconds = value * 60 * 1000;
  } else if (unitLower.startsWith('h')) {
    // hours
    milliseconds = value * 60 * 60 * 1000;
  } else if (unitLower.startsWith('d')) {
    // days
    milliseconds = value * 24 * 60 * 60 * 1000;
  } else if (unitLower.startsWith('w')) {
    // weeks
    milliseconds = value * 7 * 24 * 60 * 60 * 1000;
  }

  const date = new Date(now.getTime() + milliseconds);

  return { date, raw: full, pattern: 'relative-time' };
}

/**
 * Parse relative day with optional time: "today 5pm", "tomorrow 9am"
 */
function parseRelativeDay(text: string, now: Date): ParsedDate {
  // Pattern: "today|tomorrow [time]"
  const match = text.match(/\b(today|tomorrow)(?:\s+(.+?))?\b/i);

  if (!match) {
    return { date: null, raw: text, pattern: null };
  }

  const [full, dayWord, timeStr] = match;

  // Determine base date
  let date = new Date(now);
  date.setHours(0, 0, 0, 0); // Start of day

  if (dayWord.toLowerCase() === 'tomorrow') {
    date.setDate(date.getDate() + 1);
  }

  // Parse time if present
  if (timeStr) {
    const time = parseTime(timeStr, date);
    if (time) {
      date = time;
    } else {
      // If time parsing failed, default to 9am
      date.setHours(9, 0, 0, 0);
    }
  } else {
    // No time specified, default to 9am
    date.setHours(9, 0, 0, 0);
  }

  return { date, raw: full, pattern: 'relative-day' };
}

/**
 * Parse weekday with optional time: "fri 9a", "monday 2pm", "tuesday"
 */
function parseWeekday(text: string, now: Date): ParsedDate {
  const weekdays = [
    { name: 'sunday', short: 'sun', index: 0 },
    { name: 'monday', short: 'mon', index: 1 },
    { name: 'tuesday', short: 'tue', index: 2 },
    { name: 'wednesday', short: 'wed', index: 3 },
    { name: 'thursday', short: 'thu', index: 4 },
    { name: 'friday', short: 'fri', index: 5 },
    { name: 'saturday', short: 'sat', index: 6 },
  ];

  // Build regex to match weekdays
  const dayPattern = weekdays.map(d => `${d.name}|${d.short}`).join('|');
  const regex = new RegExp(`\\b(${dayPattern})(?:\\s+(.+?))?\\b`, 'i');
  const match = text.match(regex);

  if (!match) {
    return { date: null, raw: text, pattern: null };
  }

  const [full, dayWord, timeStr] = match;

  // Find target weekday index
  const dayLower = dayWord.toLowerCase();
  const target = weekdays.find(d => d.name === dayLower || d.short === dayLower);

  if (!target) {
    return { date: null, raw: text, pattern: null };
  }

  // Calculate next occurrence of this weekday
  const currentDay = now.getDay();
  const targetDay = target.index;

  let daysUntil = targetDay - currentDay;
  if (daysUntil <= 0) {
    // If today or past, go to next week
    daysUntil += 7;
  }

  let date = new Date(now);
  date.setDate(date.getDate() + daysUntil);
  date.setHours(0, 0, 0, 0);

  // Parse time if present
  if (timeStr) {
    const time = parseTime(timeStr, date);
    if (time) {
      date = time;
    } else {
      // Default to 9am if time parsing failed
      date.setHours(9, 0, 0, 0);
    }
  } else {
    // No time specified, default to 9am
    date.setHours(9, 0, 0, 0);
  }

  return { date, raw: full, pattern: 'weekday' };
}

/**
 * Parse legacy @ tokens: "@today", "@tomorrow", "@YYYY-MM-DD"
 */
function parseLegacyToken(text: string, now: Date): ParsedDate {
  // Pattern: @today, @tomorrow, @YYYY-MM-DD
  const match = text.match(/@(today|tomorrow|\d{4}-\d{2}-\d{2})/i);

  if (!match) {
    return { date: null, raw: text, pattern: null };
  }

  const [full, token] = match;
  const tokenLower = token.toLowerCase();

  let date = new Date(now);

  if (tokenLower === 'today') {
    date.setHours(9, 0, 0, 0);
  } else if (tokenLower === 'tomorrow') {
    date.setDate(date.getDate() + 1);
    date.setHours(9, 0, 0, 0);
  } else {
    // YYYY-MM-DD format
    const parsed = new Date(token);
    if (isNaN(parsed.getTime())) {
      return { date: null, raw: full, pattern: null };
    }
    date = parsed;
    date.setHours(9, 0, 0, 0);
  }

  return { date, raw: full, pattern: 'legacy-token' };
}

/**
 * Parse time string into hours and minutes
 * Supports: "9am", "5pm", "1:30pm", "09:00", "17:00", "9a", "5p"
 *
 * @param timeStr - Time string to parse
 * @param baseDate - Date to apply time to
 * @returns Date with time applied, or null if invalid
 */
function parseTime(timeStr: string, baseDate: Date): Date | null {
  const time = timeStr.trim().toLowerCase();

  // Try 12-hour format with colon: "1:30pm", "9:15am"
  let match = time.match(/^(\d{1,2}):(\d{2})\s*(a|p|am|pm)?$/);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const meridiem = match[3];

    if (meridiem && (meridiem.startsWith('p')) && hours < 12) {
      hours += 12;
    } else if (meridiem && (meridiem.startsWith('a')) && hours === 12) {
      hours = 0;
    }

    const date = new Date(baseDate);
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  // Try 12-hour format without colon: "9am", "5pm", "9a", "5p"
  match = time.match(/^(\d{1,2})\s*(a|p|am|pm)$/);
  if (match) {
    let hours = parseInt(match[1], 10);
    const meridiem = match[2];

    if (meridiem.startsWith('p') && hours < 12) {
      hours += 12;
    } else if (meridiem.startsWith('a') && hours === 12) {
      hours = 0;
    }

    const date = new Date(baseDate);
    date.setHours(hours, 0, 0, 0);
    return date;
  }

  // Try 24-hour format: "09:00", "17:00", "13:30"
  match = time.match(/^(\d{1,2}):(\d{2})$/);
  if (match) {
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);

    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      const date = new Date(baseDate);
      date.setHours(hours, minutes, 0, 0);
      return date;
    }
  }

  // No match
  return null;
}

/**
 * Extract all date references from text
 * Useful for finding multiple dates in longer text
 *
 * @param text - Text to scan
 * @param now - Current time (for testing)
 * @returns Array of parsed dates
 */
export function extractDates(text: string, now: Date = new Date()): ParsedDate[] {
  const patterns = [
    /\bin\s+\d+\s*(?:m|min|mins|minutes?|h|hr|hrs|hours?|d|days?|w|weeks?)\b/gi,
    /\b(?:today|tomorrow)(?:\s+[^\s]+)?\b/gi,
    /\b(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)(?:\s+[^\s]+)?\b/gi,
    /@(?:today|tomorrow|\d{4}-\d{2}-\d{2})/gi,
  ];

  const results: ParsedDate[] = [];
  const seen = new Set<string>();

  for (const pattern of patterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const raw = match[0];
      if (!seen.has(raw.toLowerCase())) {
        seen.add(raw.toLowerCase());
        const parsed = parseNaturalDate(raw, now);
        if (parsed.date) {
          results.push(parsed);
        }
      }
    }
  }

  return results;
}

/**
 * Format relative time for display
 *
 * @param date - Date to format
 * @param now - Current time (for testing)
 * @returns Human-readable relative time
 *
 * @example
 * formatRelativeTime(inTwoHours) // → "in 2 hours"
 * formatRelativeTime(yesterday)  // → "1 day ago"
 */
export function formatRelativeTime(date: Date, now: Date = new Date()): string {
  const diff = date.getTime() - now.getTime();
  const absDiff = Math.abs(diff);
  const isPast = diff < 0;

  const minutes = Math.floor(absDiff / (60 * 1000));
  const hours = Math.floor(absDiff / (60 * 60 * 1000));
  const days = Math.floor(absDiff / (24 * 60 * 60 * 1000));

  if (minutes < 1) {
    return 'just now';
  } else if (minutes < 60) {
    return isPast ? `${minutes} min ago` : `in ${minutes} min`;
  } else if (hours < 24) {
    return isPast ? `${hours} hour${hours > 1 ? 's' : ''} ago` : `in ${hours} hour${hours > 1 ? 's' : ''}`;
  } else {
    return isPast ? `${days} day${days > 1 ? 's' : ''} ago` : `in ${days} day${days > 1 ? 's' : ''}`;
  }
}
