# Testing Checklist - DoFirst MVP

**Last Updated**: 2025-11-01
**Status**: Awaiting Manual Testing

This document tracks all features that need manual testing across iOS, Android, and Web before claiming "done".

## Testing Philosophy

Per world-class development standards:
- **A feature is NOT done unless it works on iPhone, Android, AND Web**
- Test everything before claiming it works
- No stubs, no placeholders - everything must be production-ready

## Pre-Testing Setup

### Database Migrations
```bash
cd apps/web
supabase migration up  # Apply all migrations including 004_nagging_config.sql
```

### Environment Variables
Verify all required env vars are set:
- ✅ `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- ✅ `VAPID_PRIVATE_KEY`
- ✅ `SUPABASE_URL`
- ✅ `SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `MAILGUN_SIGNING_KEY`

### Start Services
```bash
# Web
cd apps/web && pnpm dev

# Mobile (iOS)
cd apps/mobile && pnpm ios

# Mobile (Android)
cd apps/mobile && pnpm android
```

---

## Increment 1: Web Push Infrastructure

### Web Testing

**Test Page**: http://localhost:3000/test-push

- [ ] **Subscribe to push notifications**
  - Click "Subscribe to Push"
  - Grant notification permission in browser
  - Verify "Subscribed" status appears

- [ ] **Send test notification**
  - Click "Send Test Push"
  - Verify notification appears with title and body
  - Verify notification has 4 action buttons (Done, +10m, +1h, Tomorrow AM)

- [ ] **Test action buttons**
  - [ ] Click "Done" → Should show "Task marked as done!" success notification
  - [ ] Click "+10m" → Should show "Snoozed for 10 minutes" success notification
  - [ ] Click "+1h" → Should show "Snoozed for 1 hour" success notification
  - [ ] Click "Tomorrow AM" → Should show "Moved to tomorrow morning" success notification

- [ ] **Test default click**
  - Click notification body (not action buttons)
  - Should open/focus app window

- [ ] **Service worker status**
  - Open DevTools → Application → Service Workers
  - Verify service worker is active
  - Check console for "[SW] Push received" logs

**Browsers to test:**
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

---

## Increment 2: Notification Adapters

### iOS Testing

**Setup**:
```bash
cd apps/mobile
pnpm ios
```

- [ ] **Permission request**
  - App should request notification permission on first launch
  - Grant permission in iOS Settings if needed

- [ ] **Action categories**
  - Verify notification actions are set up
  - Check console for "[NotificationFactory] iOS notifications initialized"

- [ ] **Local scheduling**
  - Create task with due date
  - Verify notifications scheduled locally (check iOS Settings → Notifications → DoFirst)
  - Force quit app
  - Verify notifications still fire

- [ ] **Action buttons**
  - Receive notification
  - [ ] Swipe/long-press to see actions
  - [ ] Tap "Done" → Task should be marked complete
  - [ ] Tap "+10m" → Task should be snoozed
  - [ ] Tap "+1h" → Task should be snoozed
  - [ ] Tap "Tomorrow AM" → Task should be snoozed

**Test on**:
- [ ] Physical iPhone (required for full testing, Expo Go has limitations)
- [ ] iOS Simulator (limited notification support)

### Android Testing

**Setup**:
```bash
cd apps/mobile
pnpm android
```

- [ ] **Permission request**
  - App should request notification permission (Android 13+)
  - App should guide to "Alarms & reminders" permission (Android 12+)
  - Grant both permissions

- [ ] **Notification channels**
  - Check Android Settings → Apps → DoFirst → Notifications
  - Verify "Task Reminders" channel exists with high importance

- [ ] **Exact alarm permission**
  - Android 12+: Settings → Apps → DoFirst → Alarms & reminders
  - Verify permission is granted
  - If not, app should show helper dialog

- [ ] **Local scheduling**
  - Create task with due date
  - Verify notifications scheduled via AlarmManager
  - Force quit app
  - Verify notifications still fire

- [ ] **Action buttons**
  - Receive notification
  - [ ] Tap "Done" → Task should be marked complete
  - [ ] Tap "+10m" → Task should be snoozed
  - [ ] Tap "+1h" → Task should be snoozed
  - [ ] Tap "Tomorrow AM" → Task should be snoozed

- [ ] **Battery optimization**
  - Check Settings → Apps → DoFirst → Battery
  - Verify app is not restricted
  - Test with Doze mode enabled

**Test on**:
- [ ] Physical Android device (required for exact alarms)
- [ ] Android Emulator (limited alarm functionality)

**OEM-specific testing** (if available):
- [ ] Xiaomi (aggressive battery optimization)
- [ ] OnePlus (background restrictions)
- [ ] Samsung (moderate restrictions)

---

## Increment 3: Natural Date Parsing

### All Platforms

**Quick Add Testing** (works same on Web and Mobile):

#### Relative Time
- [ ] "Call mom in 10m #family"
  - Verify task created
  - Verify `due_at` = 10 minutes from now
  - Verify tag "family" applied

- [ ] "Meeting in 2h #work !1"
  - Verify `due_at` = 2 hours from now
  - Verify priority = 1
  - Verify tag "work" applied

- [ ] "Vacation planning in 3d #personal"
  - Verify `due_at` = 3 days from now

#### Relative Days
- [ ] "Buy milk today 5pm #errands"
  - Verify `due_at` = today at 5:00 PM
  - Verify clean title = "Buy milk" (no tokens)

- [ ] "Dentist tomorrow 9am #health !2"
  - Verify `due_at` = tomorrow at 9:00 AM

- [ ] "Workout today 1:30pm #fitness"
  - Verify `due_at` = today at 1:30 PM

#### Weekdays
- [ ] "Team standup friday 9a #work"
  - Verify `due_at` = next Friday at 9:00 AM
  - If today is Friday after 9am, should be next Friday

- [ ] "Dinner with Sarah monday 7pm #social"
  - Verify `due_at` = next Monday at 7:00 PM

- [ ] "Review PRs wed 10:30am #work !1"
  - Verify `due_at` = next Wednesday at 10:30 AM

#### Legacy Tokens
- [ ] "Laundry @today #chores"
  - Verify `due_at` = today at 9:00 AM (default time)

- [ ] "Tax deadline @2025-04-15 #finance !1"
  - Verify `due_at` = April 15, 2025 at 9:00 AM

#### Combined Tokens
- [ ] "Deploy hotfix in 30m #devops !1"
  - Verify tags: devops
  - Verify priority: 1
  - Verify due: 30 min from now

- [ ] "Birthday party tomorrow 2pm #personal #social"
  - Verify multiple tags applied
  - Verify due: tomorrow 2pm

### Email-to-Task Testing

**Setup**: Configure Mailgun with alias (see MAILGUN_SETUP.md)

- [ ] Send email: "Buy milk today 5pm #personal !2"
  - Subject line contains the task
  - Verify task created with due_at = today 5pm
  - Verify tags and priority applied

- [ ] Send email: "Meeting fri 9a #work"
  - Verify task created with due_at = next Friday 9am

- [ ] Send email with no date
  - Verify task created without due_at
  - No notifications scheduled

---

## Increment 4: Auto-Snooze (Nagging 2.0)

### Nagging Cadence Testing

**Setup**: Create task due in 5 minutes from now

#### Basic Nagging Flow
- [ ] Task reaches due time (2:00 PM)
- [ ] **1st notification** at 2:05 PM (+5m after due)
  - Verify notification appears
  - Verify has action buttons

- [ ] **2nd notification** at 2:15 PM (+10m)
  - Verify notification appears
  - No action taken

- [ ] **3rd notification** at 2:25 PM (+10m)
  - Verify notification appears
  - No action taken

- [ ] **4th notification** at 2:35 PM (+10m)
  - Verify notification appears (rescheduling should happen)
  - No action taken

- [ ] **5th notification** at 2:50 PM (+15m)
  - Verify notification appears
  - No action taken

- [ ] **6th notification** at 3:05 PM (+15m)
  - Verify notification appears
  - Should continue every 15m

#### Snooze Actions

**Quick Snooze: +10m**
- [ ] Create task due now
- [ ] Wait for first notification (5m after due)
- [ ] Click "+10m" button
- [ ] Verify:
  - Success notification appears
  - Task `due_at` updated to +10 minutes from now
  - Nagging state reset (step_index = 0)
  - Next notification scheduled for new due + 5m

**Quick Snooze: +1h**
- [ ] Same flow as above with "+1h" button
- [ ] Verify due_at updated to +1 hour from now

**Preset Snooze: Tonight**
- [ ] Click "Tomorrow AM" button (using service worker action)
- [ ] Verify due_at set to tomorrow 9:00 AM
- [ ] Verify nagging rescheduled from new due time

**API Snooze Testing** (curl/Postman):
```bash
# Snooze by minutes
curl -X POST http://localhost:3000/api/tasks.snooze \
  -H "Content-Type: application/json" \
  -b "cookies.txt" \
  -d '{"taskId":"<uuid>","minutes":10}'

# Snooze by preset
curl -X POST http://localhost:3000/api/tasks.snooze \
  -H "Content-Type: application/json" \
  -b "cookies.txt" \
  -d '{"taskId":"<uuid>","preset":"tomorrow_am"}'

# Custom timestamp
curl -X POST http://localhost:3000/api/tasks.snooze \
  -H "Content-Type: application/json" \
  -b "cookies.txt" \
  -d '{"taskId":"<uuid>","timestamp":"2025-11-02T14:00:00Z"}'
```

#### Complete Action
- [ ] Create task with due date
- [ ] Wait for notification
- [ ] Click "Done" button
- [ ] Verify:
  - Task status = "completed"
  - Completed_at timestamp set
  - All pending notifications cancelled
  - Nagging state reset
  - Success notification appears

**API Complete Testing**:
```bash
curl -X POST http://localhost:3000/api/tasks.complete \
  -H "Content-Type: application/json" \
  -b "cookies.txt" \
  -d '{"taskId":"<uuid>"}'
```

### Quiet Hours Testing

**Setup**: Set quiet hours to test range (e.g., current time to current time + 2 hours)

- [ ] Create task due in 5 minutes
- [ ] Wait for notification time
- [ ] If in quiet hours:
  - [ ] Notification should be silent/badge only
  - [ ] Next notification should roll to end of quiet hours
  - [ ] Verify catch-up alert at end of quiet hours

**Test scenarios**:
- [ ] Quiet hours: 22:00 - 07:00 (midnight crossing)
- [ ] Task due at 21:55 (before quiet hours)
  - Notifications at 22:00, 22:10, 22:20 should roll to 07:00

- [ ] Task due at 22:05 (during quiet hours)
  - First notification should roll to 07:00

**Database verification**:
```sql
-- Check user's quiet hours
SELECT quiet_hours, default_cadence, enabled
FROM nagging_preferences
WHERE user_id = '<uuid>';

-- Check task nagging state
SELECT step_index, last_notified_at, scheduled_times, notification_count
FROM task_nagging_state
WHERE task_id = '<uuid>';
```

### Healing Testing

**Scenario 1: App termination**
- [ ] Create task with due date in 5 minutes
- [ ] Wait for first notification
- [ ] Force quit app (swipe away)
- [ ] Wait for second notification time
- [ ] Verify notification still fires (scheduled locally)
- [ ] Reopen app
- [ ] Verify nagging state is correct

**Scenario 2: Device reboot**
- [ ] Create task with due date in future
- [ ] Verify notifications scheduled
- [ ] Reboot device
- [ ] Wait for notification time
- [ ] Verify notifications still fire

**Scenario 3: OS purge**
- [ ] Schedule many notifications (multiple tasks)
- [ ] iOS: hit 64 notification limit
- [ ] Android: test after long period
- [ ] Verify app reschedules when opened

### Cross-Platform Verification

- [ ] **Web**: All nagging features work
- [ ] **iOS**: Nagging survives app termination
- [ ] **Android**: Exact alarms fire on time
- [ ] **Mobile API**: Same APIs work via Authorization header

---

## Known Issues to Document

Track any issues discovered during testing:

### Blocking Issues
- [ ] None yet

### Non-Blocking Issues
- [ ] None yet

### Platform-Specific Quirks
- **iOS**: Notification limit of 64, mitigated by scheduling only 3 at a time
- **Android**: Requires exact alarm permission on Android 12+
- **Web**: Requires service worker and HTTPS

---

## Testing Sign-Off

Once all tests pass, sign off here:

- [ ] **Web** (Chrome) - Tester: _____ Date: _____
- [ ] **Web** (Safari) - Tester: _____ Date: _____
- [ ] **iOS** (Physical Device) - Tester: _____ Date: _____
- [ ] **Android** (Physical Device) - Tester: _____ Date: _____
- [ ] **Email-to-Task** - Tester: _____ Date: _____

---

## Post-Testing

After testing completes:
1. Update CHANGELOG.md with testing results
2. Update Cross-Platform Status in each increment
3. Move to next increment
4. Document any discovered issues in GitHub Issues
