/**
 * Parse inline shortcuts from a freeform string.
 * Supports:
 *  - #tags           -> string[]
 *  - !1..5           -> priority
 *  - @today or @YYYY-MM-DD -> date marker
 */
export type Parsed = { title: string; tags: string[]; priority?: number; dateToken?: string };
export function parseInline(input: string): Parsed {
  const tags = Array.from(input.matchAll(/#([a-z0-9_-]{1,32})/gi)).map(m => m[1].toLowerCase());
  const prio = input.match(/!(?:[1-5])/);
  const priority = prio ? Number(prio[0].slice(1)) : undefined;
  const dateMatch = input.match(/@today|@\d{4}-\d{2}-\d{2}/i);
  const dateToken = dateMatch ? dateMatch[0].toLowerCase().replace("@", "") : undefined;
  // strip control tokens from title
  let title = input
    .replace(/#([a-z0-9_-]{1,32})/gi, "")
    .replace(/!(?:[1-5])/, "")
    .replace(/@today|@\d{4}-\d{2}-\d{2}/i, "")
    .replace(/\s+/g, " ").trim();
  return { title, tags, priority, dateToken };
}
