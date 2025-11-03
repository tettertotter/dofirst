# Algorithms

## Nagging 2.0 (Auto-Snooze)
- Default cadence: 5m after due → 10m cadence for 60m → 15m thereafter, with quiet hours and catch-up.
- Always schedule next 3 occurrences; heal on app start/resume.
- Actions map:
  - Done: mark done, cancel future.
  - +10m: shift due += 10m.
  - +1h: shift due += 60m.
  - Tomorrow AM: set due to next morning 9:00 by owner TZ.

## Recurrence
- Store core rules as RRULE or `{freq:'DAILY'|'WEEKLY'|'MONTHLY_DATE'|'YEARLY', interval:1, byweekday?:[], bymonthday?:[]}`.
- On completion, generate next instance; respect "modify only this occurrence" vs "change pattern".
