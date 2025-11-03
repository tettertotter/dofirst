/**
 * Enhanced inline parsing with natural language date support
 * Deno-compatible version for Edge Functions
 *
 * This is a copy of packages/api/parsing-enhanced.ts and packages/api/date-parser.ts
 * optimized for Deno runtime (no Node.js dependencies)
 */

export interface ParsedInput {
  title: string;
  tags: string[];
  priority?: number;
  dueDate?: Date;
  rawDateExpression?: string;
  datePattern?: string;
}

interface ParsedDate {
  date: Date | null;
  raw: string;
  pattern: string | null;
}

/**
 * Parse natural language date expressions
 *
 * Supports:
 * - Relative time: "in 10m", "in 2h", "in 3d"
 * - Relative days: "today 5pm", "tomorrow 9am"
 * - Weekdays: "fri 9a", "monday 2pm"
 * - Legacy tokens: "@today", "@2025-12-25"
 */
function parseNaturalDate(input: string, now: Date = new Date()): ParsedDate {
  // Try parsers in order of specificity
  let result: ParsedDate;

  // 1. Relative time (in 10m, in 2h, in 3d)
  result = parseRelativeTime(input, now);
  if (result.date) return result;

  // 2. Relative days (today, tomorrow with optional time)
  result = parseRelativeDay(input, now);
  if (result.date) return result;

  // 3. Weekdays (monday, fri, etc with optional time)
  result = parseWeekday(input, now);
  if (result.date) return result;

  // 4. Legacy tokens (@today, @2025-12-25)
  result = parseLegacyToken(input, now);
  if (result.date) return result;

  // No match found
  return { date: null, raw: "", pattern: null };
}

/**
 * Parse relative time expressions: "in 10m", "in 2h", "in 3d"
 */
function parseRelativeTime(text: string, now: Date): ParsedDate {
  const match = text.match(/\bin\s+(\d+)\s*(m|min|minutes?|h|hr|hours?|d|days?|w|weeks?)\b/i);

  if (!match) {
    return { date: null, raw: "", pattern: null };
  }

  const amount = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();

  let milliseconds = 0;

  // Minutes
  if (unit.startsWith("m")) {
    milliseconds = amount * 60 * 1000;
  }
  // Hours
  else if (unit.startsWith("h")) {
    milliseconds = amount * 60 * 60 * 1000;
  }
  // Days
  else if (unit.startsWith("d")) {
    milliseconds = amount * 24 * 60 * 60 * 1000;
  }
  // Weeks
  else if (unit.startsWith("w")) {
    milliseconds = amount * 7 * 24 * 60 * 60 * 1000;
  }

  const date = new Date(now.getTime() + milliseconds);

  return {
    date,
    raw: match[0],
    pattern: "relative-time",
  };
}

/**
 * Parse relative day expressions: "today 5pm", "tomorrow 9am"
 */
function parseRelativeDay(text: string, now: Date): ParsedDate {
  const match = text.match(/\b(today|tomorrow)(?:\s+(.+?))?\b/i);

  if (!match) {
    return { date: null, raw: "", pattern: null };
  }

  const dayToken = match[1].toLowerCase();
  const timeStr = match[2];

  let date = new Date(now);

  // Set to target day
  if (dayToken === "tomorrow") {
    date.setDate(date.getDate() + 1);
  }

  // Parse time if provided, otherwise default to 9am
  if (timeStr) {
    const parsedTime = parseTime(timeStr, date);
    if (parsedTime) {
      date = parsedTime;
    } else {
      date.setHours(9, 0, 0, 0);
    }
  } else {
    date.setHours(9, 0, 0, 0);
  }

  return {
    date,
    raw: match[0],
    pattern: "relative-day",
  };
}

/**
 * Parse weekday expressions: "friday", "fri 9a", "monday 2pm"
 */
function parseWeekday(text: string, now: Date): ParsedDate {
  const weekdayPattern =
    /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)(?:\s+(.+?))?\b/i;
  const match = text.match(weekdayPattern);

  if (!match) {
    return { date: null, raw: "", pattern: null };
  }

  const weekdayStr = match[1].toLowerCase();
  const timeStr = match[2];

  // Map weekday names to numbers (0 = Sunday, 1 = Monday, ...)
  const weekdayMap: Record<string, number> = {
    sunday: 0,
    sun: 0,
    monday: 1,
    mon: 1,
    tuesday: 2,
    tue: 2,
    wednesday: 3,
    wed: 3,
    thursday: 4,
    thu: 4,
    friday: 5,
    fri: 5,
    saturday: 6,
    sat: 6,
  };

  const targetDay = weekdayMap[weekdayStr];
  if (targetDay === undefined) {
    return { date: null, raw: "", pattern: null };
  }

  // Calculate next occurrence of this weekday
  const currentDay = now.getDay();
  let daysUntil = targetDay - currentDay;

  // If target day is today or past, go to next week
  if (daysUntil <= 0) {
    daysUntil += 7;
  }

  const date = new Date(now);
  date.setDate(date.getDate() + daysUntil);

  // Parse time if provided, otherwise default to 9am
  if (timeStr) {
    const parsedTime = parseTime(timeStr, date);
    if (parsedTime) {
      return {
        date: parsedTime,
        raw: match[0],
        pattern: "weekday",
      };
    }
  }

  date.setHours(9, 0, 0, 0);

  return {
    date,
    raw: match[0],
    pattern: "weekday",
  };
}

/**
 * Parse legacy @ tokens: "@today", "@2025-12-25"
 */
function parseLegacyToken(text: string, now: Date): ParsedDate {
  const match = text.match(/@(today|tomorrow|\d{4}-\d{2}-\d{2})/i);

  if (!match) {
    return { date: null, raw: "", pattern: null };
  }

  const token = match[1].toLowerCase();

  let date = new Date(now);

  if (token === "today") {
    date.setHours(9, 0, 0, 0);
  } else if (token === "tomorrow") {
    date.setDate(date.getDate() + 1);
    date.setHours(9, 0, 0, 0);
  } else {
    // Try parsing YYYY-MM-DD
    const parsed = new Date(token);
    if (isNaN(parsed.getTime())) {
      return { date: null, raw: "", pattern: null };
    }
    parsed.setHours(9, 0, 0, 0);
    date = parsed;
  }

  return {
    date,
    raw: match[0],
    pattern: "legacy-token",
  };
}

/**
 * Parse time expressions: "9am", "5pm", "1:30pm", "09:00", "9a"
 * Returns a new Date with the time applied to baseDate
 */
function parseTime(timeStr: string, baseDate: Date): Date | null {
  // Remove whitespace
  timeStr = timeStr.trim().toLowerCase();

  // Try 12-hour format: 9am, 5pm, 1:30pm, 9a, 5p
  let match = timeStr.match(/^(\d{1,2})(?::(\d{2}))?\s*(am?|pm?)$/i);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = match[2] ? parseInt(match[2], 10) : 0;
    const meridiem = match[3].toLowerCase();

    // Convert to 24-hour
    if (meridiem.startsWith("p") && hours !== 12) {
      hours += 12;
    } else if (meridiem.startsWith("a") && hours === 12) {
      hours = 0;
    }

    const date = new Date(baseDate);
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  // Try 24-hour format: 09:00, 17:30
  match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (match) {
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);

    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      const date = new Date(baseDate);
      date.setHours(hours, minutes, 0, 0);
      return date;
    }
  }

  return null;
}

/**
 * Parse inline shortcuts and natural language dates from freeform text
 *
 * Supports:
 * - #tags (alphanumeric, dash, underscore, max 32 chars)
 * - !1..5 (priority, 1 = highest)
 * - Natural dates (see parseNaturalDate for supported formats)
 *
 * @example
 * parseInlineEnhanced("Buy milk today 5pm #personal !2")
 * // → {
 * //   title: "Buy milk",
 * //   tags: ["personal"],
 * //   priority: 2,
 * //   dueDate: Date(today at 5pm),
 * //   rawDateExpression: "today 5pm",
 * //   datePattern: "relative-day"
 * // }
 */
export function parseInlineEnhanced(
  input: string,
  now: Date = new Date()
): ParsedInput {
  // Extract tags
  const tagMatches = Array.from(input.matchAll(/#([a-z0-9_-]{1,32})/gi));
  const tags = tagMatches.map((m) => m[1].toLowerCase());

  // Extract priority
  const priorityMatch = input.match(/!([1-5])/);
  const priority = priorityMatch ? parseInt(priorityMatch[1], 10) : undefined;

  // Extract date using natural language parser
  const dateResult = parseNaturalDate(input, now);

  // Build clean title by removing all tokens
  let title = input;

  // Remove tags
  title = title.replace(/#([a-z0-9_-]{1,32})/gi, "");

  // Remove priority
  title = title.replace(/![1-5]/g, "");

  // Remove date expression if found
  if (dateResult.raw) {
    title = title.replace(dateResult.raw, "");
  }

  // Clean up whitespace
  title = title.replace(/\s+/g, " ").trim();

  return {
    title,
    tags,
    priority,
    dueDate: dateResult.date || undefined,
    rawDateExpression: dateResult.raw || undefined,
    datePattern: dateResult.pattern || undefined,
  };
}
