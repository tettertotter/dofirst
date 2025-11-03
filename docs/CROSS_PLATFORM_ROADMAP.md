# Cross-Platform MVP Roadmap - Due Parity

**Last Updated**: 2025-11-01
**Goal**: Win over Due users with seamless iOS + Android + Web experience

## Definition of Done
A feature is NOT done unless it works on iPhone, Android, AND Web.

## Current Status

### ✅ Implemented (Previous Phase)
- Database schema with RLS
- Quick Add API (basic)
- Today Proposals API with quotas
- Today Respond API
- Email-to-task edge function
- Cross-platform auth (cookie + Bearer)
- Basic inline parsing (#tags, !priority)

### 🎯 Cross-Platform MVP (9 Increments)

#### **Increment 1: Web Push Infrastructure**
**Status**: Next
**Estimate**: 3 hours

**Tasks**:
- [ ] Add database migration for `web_push_subscriptions` table
- [ ] Create service worker at `apps/web/public/sw.js`
- [ ] Implement `POST /api/webpush/subscribe` (persist subscription)
- [ ] Implement `POST /api/webpush/send` (send push notification)
- [ ] Generate VAPID keys and store in env
- [ ] Create test page for self-push
- [ ] Handle notification actions in sw.js (Done, +10m, +1h, Tomorrow AM)

**Files**:
- `supabase/migrations/003_web_push.sql`
- `apps/web/public/sw.js`
- `apps/web/app/api/webpush/subscribe/route.ts`
- `apps/web/app/api/webpush/send/route.ts`
- `apps/web/lib/webpush-client.ts`
- `apps/web/app/test-push/page.tsx`

**Acceptance**:
- Subscribe on web, send notification, receive with action buttons
- Click "Done" → task marked complete
- Click "+10m" → task due shifted by 10 minutes

---

#### **Increment 2: Notification Adapters**
**Status**: Pending
**Estimate**: 4 hours

**Tasks**:
- [ ] Create shared notification adapter interface
- [ ] Implement iOS adapter (UNUserNotificationCenter)
- [ ] Implement Android adapter (AlarmManager + fallback)
- [ ] Implement Web adapter (wrapper for Web Push)
- [ ] Add notification action handlers
- [ ] Test scheduling and cancellation on all platforms

**Files**:
- `packages/notifications/adapter.ts` (interface)
- `apps/mobile/lib/notifications/ios.ts`
- `apps/mobile/lib/notifications/android.ts`
- `apps/web/lib/notifications/web.ts`
- `apps/mobile/app/notification-handler.ts`

**Acceptance**:
- Schedule notification on iOS → fires at exact time
- Schedule on Android → fires with exact alarm permission
- Schedule on Web → Web Push delivered
- All action buttons work consistently

---

#### **Increment 3: Natural Date Parsing Enhancement**
**Status**: Pending
**Estimate**: 2 hours

**Tasks**:
- [ ] Extend `parseInline` to support "today/tomorrow Xpm"
- [ ] Add relative time parsing "in 10m/2h/3d"
- [ ] Add weekday parsing "fri 9a", "monday 2pm"
- [ ] Update Quick Add to use enhanced parser
- [ ] Add tests for all parsing patterns

**Files**:
- `packages/api/parsing.ts` (enhanced)
- `packages/api/parsing.test.ts`
- Update `apps/web/app/api/tasks.quickAdd/route.ts`
- Update `supabase/functions/mailgun-inbound/index.ts`

**Acceptance**:
- "Buy milk today 5pm" → due set to today 5pm
- "Call mom in 2h" → due set to now + 2 hours
- "Meeting fri 9a" → due set to next Friday 9am
- Works on Web, Mobile, and Email-to-task

---

#### **Increment 4: Auto-Snooze (Nagging 2.0)**
**Status**: Pending
**Estimate**: 5 hours

**Tasks**:
- [ ] Add nagging scheduler using reference algorithm
- [ ] Add database columns for `due_at`, `snooze_cadence`
- [ ] Implement schedule next 3 occurrences
- [ ] Add quiet hours support
- [ ] Add catch-up alert after quiet hours
- [ ] Implement healing on app resume
- [ ] Wire to notification adapters

**Files**:
- `packages/nagging/scheduler.ts` (from reference)
- `supabase/migrations/004_nagging.sql`
- `apps/web/app/api/tasks.schedule/route.ts`
- Update notification adapters to schedule multiple times

**Acceptance**:
- Task due → notification at due time
- No action → notification +5m, +15m (10m interval), +25m (10m), then 15m thereafter
- Quiet hours 10pm-7am → notifications silent, catch-up at 7am
- Works on iOS, Android, Web

---

#### **Increment 5: Quick Postpone UI**
**Status**: Pending
**Estimate**: 3 hours

**Tasks**:
- [ ] Add snooze chips to task cards: +10m, +1h, Tonight, Tomorrow AM
- [ ] Create custom "Snooze Wheel" picker
- [ ] Implement snooze actions on Web
- [ ] Implement snooze actions on Mobile
- [ ] Add snooze buttons to notifications
- [ ] Update API to handle snooze actions

**Files**:
- `apps/web/components/task-card.tsx`
- `apps/web/components/snooze-wheel.tsx`
- `apps/mobile/components/TaskCard.tsx`
- `apps/mobile/components/SnoozeWheel.tsx`
- `apps/web/app/api/tasks.snooze/route.ts`

**Acceptance**:
- Click "+10m" → due shifts by 10 minutes, UI updates
- Click "Tonight" → due set to today 9pm
- Click "Tomorrow AM" → due set to tomorrow 9am
- Custom wheel allows selecting any time
- Works on Web and Mobile

---

#### **Increment 6: Recurrence (Core Set)**
**Status**: Pending
**Estimate**: 4 hours

**Tasks**:
- [ ] Add recurrence column to tasks table
- [ ] Implement recurrence rule storage (jsonb)
- [ ] Implement next instance generation
- [ ] Add recurrence UI to Quick Add
- [ ] Handle completion → generate next instance
- [ ] Support modify this vs modify pattern

**Files**:
- `supabase/migrations/005_recurrence.sql`
- `packages/recurrence/core.ts` (from reference)
- `apps/web/components/recurrence-picker.tsx`
- `apps/mobile/components/RecurrencePicker.tsx`
- `apps/web/app/api/tasks.complete/route.ts`

**Acceptance**:
- Create "Daily at 7am" → complete today → next instance tomorrow 7am
- Create "Weekdays 9am" → complete Monday → next instance Tuesday 9am
- Create "Weekly on Friday" → complete → next instance next Friday
- Works on Web and Mobile

---

#### **Increment 7: Today UI for Web**
**Status**: Pending
**Estimate**: 3 hours

**Tasks**:
- [ ] Create Today page showing accepted and pending proposals
- [ ] Group pending by proposer with remaining quota
- [ ] Add accept/decline/move buttons
- [ ] Add visual feedback for actions
- [ ] Show which proposals count toward quota
- [ ] Real-time updates via Supabase subscriptions

**Files**:
- `apps/web/app/today/page.tsx`
- `apps/web/components/proposal-card.tsx`
- `apps/web/components/proposal-actions.tsx`

**Acceptance**:
- See pending proposals grouped by person
- See "John (2/3 today)" showing quota usage
- Accept → moves to accepted list
- Decline → removed from list
- Move → prompts for new date

---

#### **Increment 8: Email-to-Task Enhancement**
**Status**: Pending
**Estimate**: 2 hours

**Tasks**:
- [ ] Update email handler to use enhanced parser
- [ ] Support natural dates in email subject/body
- [ ] Add attachment handling (private URLs)
- [ ] Add email-to-suggestion flow for @date
- [ ] Update MAILGUN_SETUP.md with new syntax

**Files**:
- Update `supabase/functions/mailgun-inbound/index.ts`
- Update `docs/MAILGUN_SETUP.md`

**Acceptance**:
- Email "Buy milk today 5pm #personal !2" → task with due=today 5pm
- Email "Meeting fri 9a #work" → task with due=next Friday 9am
- Email with @tomorrow → creates suggestion not task
- Attachments stored with signed URLs

---

#### **Increment 9: Reliability & Security**
**Status**: Pending
**Estimate**: 3 hours

**Tasks**:
- [ ] Add request ID generation middleware
- [ ] Implement structured logging with key decisions
- [ ] Add rate limiting to write routes (per-IP and per-user)
- [ ] Verify all SECURITY_CHECKLIST items
- [ ] Add delivery logs for push/email
- [ ] Create observability dashboard queries

**Files**:
- `apps/web/middleware.ts` (request IDs)
- `apps/web/lib/rate-limit.ts`
- `apps/web/lib/logger.ts`
- Update all API routes with logging
- `docs/OBSERVABILITY.md`

**Acceptance**:
- All API requests have unique request IDs in logs
- Write endpoints return 429 after rate limit
- Security checklist fully verified
- Can trace notification delivery in logs

---

## Definition of Done Checklist

Each increment must satisfy:

- [ ] Works on iOS (test on Expo Go or physical device)
- [ ] Works on Android (test on Expo Go or physical device)
- [ ] Works on Web (test in Chrome and Safari)
- [ ] CHANGELOG.md updated with timestamp and changes
- [ ] No service role keys in client code
- [ ] RLS verified for new database access
- [ ] Request IDs in logs for new endpoints
- [ ] Screenshot or recording from all three platforms

## Cross-Platform Acceptance Tests

Before declaring MVP complete, run all acceptance tests from:
- `due_parity_pack/docs/COMPETE_DUE_CORE/acceptance/ACCEPTANCE_TESTS.md`
- `PRO_CROSS_PLATFORM_DUE_PARITY/docs/PRO_CROSS_PLATFORM_DUE_PARITY/acceptance/PRO_PR_CHECKLIST.md`

## MVP Timeline

**Total Estimate**: 29 hours (~4 days of focused work)

- Day 1: Web Push + Notification Adapters (7h)
- Day 2: Natural Parsing + Auto-Snooze (7h)
- Day 3: Quick Postpone + Recurrence (7h)
- Day 4: Today UI + Email Enhancement + Reliability (8h)

## Post-MVP (Not in Scope)

- Shortcuts / App Intents
- Widgets
- Watch app
- Advanced recurring (Nth weekday)
- Offline-first queue
- Rich URL scheme
- ICS feed

---

**Next Action**: Begin Increment 1 - Web Push Infrastructure
