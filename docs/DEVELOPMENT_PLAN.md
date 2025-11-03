# Development Plan

## Milestone 0: Bootstrap (1 day)
- Set up Supabase project and apply `001_init.sql`.
- Fill .env values across apps.
- Seed owner, spouse, colleagues, tags, and limits using `tooling/scripts/seed.ts`.
- Create Vercel project for web and run locally.

**Verification**
- Connect with Supabase Auth in web and mobile.
- Query `tags` and `tasks` with RLS enforced.

## Milestone 1: Quick Add and Listing (2 days)
- Implement `/api/tasks.quickAdd` in web with Zod validation.
- Web UI: Pool screen with filters and Quick Add sheet.
- Mobile UI: Quick Add on first open, dictation friendly.
- Tag linking and default visibility by role.

**Verification**
- Create tasks as owner, spouse, colleague. Confirm visibility rules and tag filters.

## Milestone 2: Today Proposals (2 days)
- Implement `/api/today.propose` with per-person daily limit check.
- Implement `/api/today.respond` with accept, decline, move.
- Web UI: Today screen with proposals grouped by proposer, and accepted list.
- Mobile UI: same flow simplified.

**Verification**
- Limits hold. Owner can accept, decline, move. Colleagues see work proposals, not household.

## Milestone 3: Email flows (1 day)
- Resend: invite emails and daily summary.
- Mailgun inbound: configure route to `mailgun-inbound` edge function, create tasks from emails.

**Verification**
- Email to alias creates a task with correct default visibility and tag inference.

## Milestone 4: Polish and Summaries (1 day)
- Daily summary job using Vercel cron calling a server action, or Supabase cron calling SQL function.
- Empty states, error messages, and loading spinners.

**Out of scope for MVP**
- Recurring tasks, offline sync, calendar view, full push notifications.
