# Nagging 2.0 — Algorithm Spec (MVP)

**Goals**: persistent, respectful, predictable. Survive OS constraints. Offline-first.

## Cadence
- Default cadence: re-alert at **5 min** after due, then **every 10 min** for 1 hour, then **every 15 min** thereafter until acted on.
- Per-reminder override: 1, 5, 10, 15, 30, 60 min.
- Quiet hours: no audible alerts between user-defined times; deliver silent/badge and batch a catch-up alert at end of quiet hours.

## Actions
- Notification buttons: **Done**, **+10m**, **+1h**, **Tomorrow AM**.
- Long-press: open “Snooze Wheel” for custom time.

## Scheduling model
- Schedule the next 3 occurrences locally to survive app termination.
- On receipt or user action, reschedule the next 3 occurrences.
- Keep a server “safety ping” (optional) to restore schedule if OS purges notifications.

## iOS notes
- Use `UNUserNotificationCenter` with `UNCalendarNotificationTrigger` or `UNTimeIntervalNotificationTrigger` for repeats.
- Prefer local notifications; critical alerts are optional and behind explicit user consent.
- Use notification categories for action buttons; log outcomes for reliability analytics.

## Android notes
- Use `AlarmManager` with `SCHEDULE_EXACT_ALARM` when user opts in; fallback to exact-while-idle + foreground service for reliability.
- Notification actions mirror iOS; use channels and importance levels.
- Respect OEM battery optimizations and provide a one-tap “Allow exact alarms” flow.

## Pseudocode
```
onDue(reminder):
  cadence = resolveCadence(reminder)  // default or per-reminder
  nextTimes = computeNextTimes(now, cadence, limit=3, quietHours)
  scheduleLocalNotifications(reminder.id, nextTimes, actions=[Done, +10m, +1h, TomorrowAM])
  log("scheduled", nextTimes)
```
