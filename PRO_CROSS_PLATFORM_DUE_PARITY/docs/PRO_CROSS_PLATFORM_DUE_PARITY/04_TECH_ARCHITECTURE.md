# Tech Architecture — Cross-Platform First

- Shared logic (TS): parsing, recurrence, nag scheduling.
- Platform adapters:
  - iOS: UNUserNotificationCenter; action categories.
  - Android: AlarmManager (exact alarms), fallback to exact-while-idle + WorkManager.
  - Web: Web Push (VAPID) + Service Worker; in-app banner fallback.
- Data:
  - `tasks`, `today_suggestions`, `today_quotas` (existing).
  - `web_push_subscriptions(user_id, endpoint, p256dh, auth, created_at)`.
  - `recurrence_rules(task_id, rrule or jsonb)` or augment tasks with `recurrence_rule` string and `next_occurrence`.
- Server:
  - Next.js routes for Web Push subscribe/send; Cron routes for daily digest and nag reinforcement.
  - Supabase Edge Function for Mailgun inbound.
- Observability: request ID, structured logs, delivery logs for push/email.
