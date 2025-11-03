/**
 * Enhanced inline parsing with natural language date support
 * Parses #tags, !priority, and natural date expressions
 *
 * This is the main parser used by Quick Add and Email-to-Task
 */

import { parseNaturalDate, ParsedDate } from './date-parser';

export interface ParsedInput {
  title: string;
  tags: string[];
  priority?: number;
  dueDate?: Date;
  rawDateExpression?: string;
  datePattern?: string;
}

/**
 * Parse inline shortcuts and natural language dates from freeform text
 *
 * Supports:
 * - #tags (alphanumeric, dash, underscore, max 32 chars)
 * - !1..5 (priority, 1 = highest)
 * - Natural dates:
 *   - "today 5pm", "tomorrow 9am"
 *   - "in 10m", "in 2h", "in 3d"
 *   - "fri 9a", "monday 2pm"
 *   - "@today", "@2025-12-25" (legacy)
 *
 * @param input - Raw text input
 * @param now - Current time (for date parsing, defaults to new Date())
 * @returns Parsed structure with extracted metadata
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
 *
 * parseInlineEnhanced("Meeting in 2h #work")
 * // → {
 * //   title: "Meeting",
 * //   tags: ["work"],
 * //   dueDate: Date(2 hours from now),
 * //   rawDateExpression: "in 2h",
 * //   datePattern: "relative-time"
 * // }
 */
export function parseInlineEnhanced(
  input: string,
  now: Date = new Date()
): ParsedInput {
  // Extract tags
  const tagMatches = Array.from(input.matchAll(/#([a-z0-9_-]{1,32})/gi));
  const tags = tagMatches.map(m => m[1].toLowerCase());

  // Extract priority
  const priorityMatch = input.match(/!([1-5])/);
  const priority = priorityMatch ? parseInt(priorityMatch[1], 10) : undefined;

  // Extract date using natural language parser
  const dateResult = parseNaturalDate(input, now);

  // Build clean title by removing all tokens
  let title = input;

  // Remove tags
  title = title.replace(/#([a-z0-9_-]{1,32})/gi, '');

  // Remove priority
  title = title.replace(/![1-5]/g, '');

  // Remove date expression if found
  if (dateResult.raw) {
    title = title.replace(dateResult.raw, '');
  }

  // Clean up whitespace
  title = title.replace(/\s+/g, ' ').trim();

  return {
    title,
    tags,
    priority,
    dueDate: dateResult.date || undefined,
    rawDateExpression: dateResult.raw || undefined,
    datePattern: dateResult.pattern || undefined,
  };
}

/**
 * Legacy parser for backward compatibility
 * Returns same structure as original parseInline()
 *
 * @deprecated Use parseInlineEnhanced() instead
 */
export interface LegacyParsed {
  title: string;
  tags: string[];
  priority?: number;
  dateToken?: string;
}

export function parseInline(input: string): LegacyParsed {
  const tags = Array.from(input.matchAll(/#([a-z0-9_-]{1,32})/gi)).map(m => m[1].toLowerCase());
  const prioMatch = input.match(/![1-5]/);
  const priority = prioMatch ? Number(prioMatch[0].slice(1)) : undefined;
  const dateMatch = input.match(/@today|@tomorrow|@\d{4}-\d{2}-\d{2}/i);
  const dateToken = dateMatch ? dateMatch[0].toLowerCase().replace('@', '') : undefined;

  // Strip control tokens from title
  let title = input
    .replace(/#([a-z0-9_-]{1,32})/gi, '')
    .replace(/![1-5]/g, '')
    .replace(/@today|@tomorrow|@\d{4}-\d{2}-\d{2}/i, '')
    .replace(/\s+/g, ' ')
    .trim();

  return { title, tags, priority, dateToken };
}

/**
 * Resolve legacy date token to Date object
 * Used for backward compatibility with @today and @YYYY-MM-DD syntax
 *
 * @param dateToken - Token like "today", "tomorrow", "2025-12-25"
 * @param now - Current time (for testing)
 * @returns Date object or null if invalid
 */
export function resolveDate(dateToken: string | undefined, now: Date = new Date()): Date | null {
  if (!dateToken) {
    return null;
  }

  const token = dateToken.toLowerCase();

  if (token === 'today') {
    const date = new Date(now);
    date.setHours(9, 0, 0, 0);
    return date;
  }

  if (token === 'tomorrow') {
    const date = new Date(now);
    date.setDate(date.getDate() + 1);
    date.setHours(9, 0, 0, 0);
    return date;
  }

  // Try YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(token)) {
    const date = new Date(token);
    if (!isNaN(date.getTime())) {
      date.setHours(9, 0, 0, 0);
      return date;
    }
  }

  return null;
}
