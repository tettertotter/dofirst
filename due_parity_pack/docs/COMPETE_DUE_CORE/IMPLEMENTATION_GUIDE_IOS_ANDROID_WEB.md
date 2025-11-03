# Implementation Guide (iOS, Android, Web)

## iOS
- Local notifications via `UNUserNotificationCenter` with action categories.
- Repeating alerts: chain `UNTimeIntervalNotificationTrigger` events for 3 future firings; reschedule on each receive or action.
- Optional: Critical Alerts (later, behind review).
- Dictation: system keyboard mic (no server dependency).

## Android
- `AlarmManager` + notification channels.
- Offer opt-in for `SCHEDULE_EXACT_ALARM` for medical/critical reminders; fallback to exact-while-idle + WorkManager.
- Foreground service during long-running alert sequences if needed.

## Web
- Start with in-app banners and email; Web Push optional later.
- Keyboard shortcuts: N (new), 1..5 (priority), T (today).

## Data & reliability
- Persist “next fire at” times; store last-fired timestamp and user action.
- Defensive scheduling: if app opens and detects overdue reminders with no upcoming notifications, patch schedule.
