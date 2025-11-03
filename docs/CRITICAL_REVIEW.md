# Critical Technical Review (v1) — TodayPool

This document captures a senior full‑stack audit of the MVP scaffold with concrete improvements to reach production‑ready quality.

## 1) Architecture & boundaries
- ✅ Good: Clean separation of capture (app/email/voice), decision workflow (Today suggestions), and visibility.
- ❗Improve: Reduce accidental coupling between circles and visibility. Keep circles strictly for "who can see whose contributions" and keep per‑task exceptions in `task_shares`. This is preserved, but stress it as policy.
- ✅ RLS-first is correct. Keep all data access through policies and validate writes at the endpoint to avoid surprising errors at the DB.

## 2) Data model
- Add **indexes** for high‑cardinality queries and array tags:
  - GIN on `tasks.tags`
  - Btree on `(owner_id, created_by)` and `(owner_id, state)`
  - Composite on `today_suggestions (owner_id, suggested_date, status, suggester_id)`
- Add check constraints for state transitions at the API layer to keep logic easy to evolve.
- Adopt idempotency keys for inbound email (avoid duplicates on retries).

## 3) Security
- Avoid using service role keys in client routes. Use Next.js **Route Handlers** or **Server Actions** with the Service Role **only on the server**.
- Verify Mailgun signatures with HMAC. Reject outdated timestamps and enforce constant‑time comparison.
- Store inbound email tokens with high entropy. Rotate on leak.
- Require explicit allowlist to treat a sender as an authenticated **creator**; else the task is created but marked as `created_by = owner_id` with a "from" note.

## 4) Performance
- Use React Query (or TanStack Query) for cache + network. Avoid waterfall requests.
- On mobile, use FlashList for long lists and batch updates; prefetch queries on app resume.
- Keep RN Web bundle small: lazy load Today and People screens.

## 5) Reliability & ops
- Add Vercel Cron or Supabase Cron job for daily digests and nag pings.
- Add minimal structured logging and request IDs on API routes; log to Vercel + Supabase logs.
- Add retry strategy for Resend and Expo push (exponential backoff).

## 6) UX
- Keyboard shortcuts on web (N to add, 1..5 priority, T today).
- Big mic button with on-device dictation. If permission denied, degrade to text input.
- One-tap Accept/Decline/Move with clear feedback and undo toast.

## 7) Testing
- Unit tests for parsing (#tags, !priority, @date), RLS query snapshots, and API quotas.
- E2E flow: colleague hits quota, partner bypasses, owner accepts and moves.

## 8) Backlog (Post‑MVP)
- ICS feed for `today` items.
- Shared pools for teams.
- Recurring tasks and smart parser improvements.
