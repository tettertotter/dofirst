# DoFirst Master Strategy & Development Plan

**Domain**: dofirst.today
**Last Updated**: 2025-11-01 18:00 UTC
**Mission**: Win over a Due user with a cross-platform-first task manager that adds collaborative Today flow

---

## 🏆 Development Standards (World-Class)

### Code Quality Principles
1. **No Stubs, No TODOs** - Every implementation is production-ready on first commit
2. **Test Before Claiming** - Manual test on all 3 platforms before marking done
3. **Complete, Not Quick** - Never skip difficult tasks or defer to "later"
4. **Elegant Solutions** - Prefer clarity over cleverness, but never sacrifice quality
5. **Security First** - Every feature reviewed against SECURITY_CHECKLIST before merge

### Implementation Standards
- **Full implementations only** - No placeholder functions, no "coming soon" comments
- **Error handling** - Every API call has error handling, user-facing error messages
- **Validation** - Zod schemas for all inputs, TypeScript strict mode, no `any`
- **Accessibility** - VoiceOver/TalkBack labels, ARIA attributes, keyboard navigation
- **Performance** - Measure before/after, verify performance budget compliance
- **Documentation** - Inline comments explain "why" not "what", update docs as you code

### Testing Requirements (Every Feature)
1. **Unit tests** - For parsers, schedulers, business logic
2. **Integration tests** - API endpoints tested with real DB queries
3. **Manual testing** - On iOS physical device, Android physical device, Web (Chrome + Safari)
4. **Edge cases** - Offline, poor network, timezone edge cases, leap seconds
5. **Performance** - Cold start time, interaction latency, memory usage
6. **Accessibility** - VoiceOver navigation, screen reader announcements, keyboard-only

### Setup Philosophy
- **CLI-First** - Use Supabase CLI, Vercel CLI, programmatic setup over manual steps
- **Grant Access** - User grants Claude access to services, Claude configures everything
- **Automated** - Scripts for common operations, one-command deploys
- **Documented** - Every setup step documented so future agents can replicate

### Documentation Standards
- **Update as you code** - Don't batch documentation, update immediately
- **CHANGELOG** - Every increment gets detailed entry with timestamp
- **MASTER_STRATEGY** - Updated after major decisions or architecture changes
- **Future agent ready** - Documentation explains context, not just steps
- **Screenshots/recordings** - Visual proof that features work on all platforms

---

## 🎯 Product Vision

### Core Value Proposition
DoFirst combines **Due's legendary nagging reliability** with **collaborative Today planning** across iOS, Android, and Web.

### What We Match (Due Parity)
1. **Lightning-fast capture** - Opens to Quick Add, supports voice dictation, one-tap submit
2. **Persistent nagging** - Auto-snooze repeats until acted upon, zero silent failures
3. **Effortless postpone** - One-tap: +10m, +1h, Tonight, Tomorrow AM
4. **Core recurrence** - Daily, weekdays, weekly, monthly(date), yearly
5. **Simple UI** - Calm, no projects, large tap targets, minimal friction

### What We Beat (DoFirst Advantages)
1. **Cross-platform** - Full parity on iOS, Android, Web (Due is Apple-only)
2. **Today proposals** - Trusted people suggest tasks with quotas, you decide
3. **Email-to-task** - Inline parsing of #tags, !priority, @date
4. **Web access** - Full-featured web app, not just mobile
5. **Collaboration** - Multi-user pools with visibility controls

### Success Metric
A Due user feels at home in 30 seconds, and in a week says: *"It's as fast, it nags just as reliably, and it actually helps me focus on today."*

---

## 📊 Current Status (As of 2025-11-01)

### ✅ Completed (Foundation)
1. **Database schema** - 11 tables with RLS policies, migrations 001-003
2. **Auth system** - Magic link, cross-platform (cookie + Bearer token)
3. **Quick Add API** - Full implementation with tag linking, role-based defaults
4. **Today Proposals API** - Quota enforcement, accept/decline/move
5. **Email-to-task** - Mailgun webhook with HMAC verification, inline parsing
6. **Web UI** - Basic Quick Add page with auth flow
7. **Mobile UI** - Native Quick Add with dictation button (React Native/Expo)
8. **Web Push Infrastructure** - Service worker, subscribe/send endpoints, test page

### 🔄 In Progress (Cross-Platform MVP - 1/9 Complete)
**Increment 1**: ✅ Web Push Infrastructure (DONE)

### ⏳ Remaining (Cross-Platform MVP - 8/9 Pending)
**Increment 2**: Notification Adapters (iOS/Android/Web)
**Increment 3**: Natural Date Parsing Enhancement
**Increment 4**: Auto-Snooze (Nagging 2.0)
**Increment 5**: Quick Postpone UI
**Increment 6**: Recurrence (Core Set)
**Increment 7**: Today UI for Web
**Increment 8**: Email-to-Task Enhancement
**Increment 9**: Reliability & Security

---

## 🏗️ Technical Architecture

### Stack
- **Frontend**: Next.js 15 (web), Expo Router (mobile)
- **Backend**: Next.js API routes, Supabase Edge Functions
- **Database**: PostgreSQL (Supabase) with Row Level Security
- **Auth**: Supabase Auth (magic link)
- **Notifications**: Web Push (VAPID), UNUserNotificationCenter (iOS), AlarmManager (Android)
- **Email**: Mailgun (inbound), Resend (outbound)
- **Monorepo**: Turborepo with pnpm workspaces

### Key Design Decisions
1. **RLS-first** - All data access through RLS policies, no service role in clients
2. **Cross-platform auth** - Cookie (web) + Authorization header (mobile)
3. **Shared packages** - `@todaypool/api` (parsing), `@todaypool/db` (schemas)
4. **Platform adapters** - Unified interface, platform-specific implementations
5. **Offline-ready** - Local notification scheduling, defensive healing on resume

### Performance Budget (Non-Negotiable)
- Cold start: ≤ 1.5s
- Interaction latency: < 100ms
- Capture-to-schedule: < 300ms
- Sync propagation: < 3s

---

## 🚀 Development Plan to Launch

### Phase 1: Cross-Platform Core (Current - 3 weeks)
**Goal**: Feature parity on iOS, Android, Web for core flows

#### Week 1 (Nov 4-8): Notifications & Parsing
- [ ] **Day 1-2**: Increment 2 - Notification Adapters
  - iOS: UNUserNotificationCenter with action categories
  - Android: AlarmManager with exact alarm permission flow
  - Web: Wrapper for Web Push
  - Shared interface in `packages/notifications/`

- [ ] **Day 3**: Increment 3 - Natural Date Parsing
  - "today/tomorrow 5pm" → exact datetime
  - "in 10m/2h/3d" → relative offsets
  - "fri 9a", "monday 2pm" → weekday resolution
  - Update Quick Add, email handler

#### Week 2 (Nov 11-15): Nagging & Postpone
- [ ] **Day 1-3**: Increment 4 - Auto-Snooze (Nagging 2.0)
  - Implement nagging scheduler (reference: `due_parity_pack/docs/COMPETE_DUE_CORE/code/nagging.ts`)
  - Default cadence: 5m → 10m (×3) → 15m (repeat)
  - Schedule next 3 occurrences locally
  - Quiet hours + catch-up alert
  - Healing on app resume (detect missed schedules)
  - Wire to all platform adapters

- [ ] **Day 4-5**: Increment 5 - Quick Postpone UI
  - Snooze chips on task cards (+10m, +1h, Tonight, Tomorrow AM)
  - Custom "Snooze Wheel" picker
  - Implement `POST /api/tasks.snooze` endpoint
  - Implement `POST /api/tasks.complete` endpoint
  - Test on all platforms

#### Week 3 (Nov 18-22): Recurrence & Today
- [ ] **Day 1-2**: Increment 6 - Recurrence
  - Core rules: Daily, Weekdays, Weekly, Monthly(date), Yearly
  - Storage: `recurrence` jsonb column (already in 003 migration)
  - Next instance generation on completion
  - Recurrence picker UI (web + mobile)
  - "Modify this vs pattern" logic

- [ ] **Day 3**: Increment 7 - Today UI for Web
  - Display accepted proposals and pending grouped by proposer
  - Show remaining quota badges
  - Accept/Decline/Move buttons
  - Real-time updates via Supabase subscriptions

- [ ] **Day 4**: Increment 8 - Email Enhancement
  - Use enhanced parser in email handler
  - Support natural dates in email
  - Attachment handling (signed URLs)

- [ ] **Day 5**: Increment 9 - Reliability & Security
  - Request IDs in all API routes
  - Structured logging with key decisions
  - Rate limiting (per-IP and per-user)
  - Verify SECURITY_CHECKLIST items
  - Delivery logs for push/email

### Phase 2: Polish & Testing (1 week - Nov 25-29)
- [ ] **Cross-platform acceptance tests**
  - Run all tests from `due_parity_pack/docs/COMPETE_DUE_CORE/acceptance/ACCEPTANCE_TESTS.md`
  - Test on real iOS device (iPhone)
  - Test on real Android device
  - Test on Web (Chrome, Safari)

- [ ] **Performance audit**
  - Measure cold start times
  - Optimize bundle size
  - Verify interaction latency < 100ms
  - Test notification delivery reliability

- [ ] **UX refinement**
  - Haptic feedback (success, decline, accept)
  - Micro-animations (subtle, not flashy)
  - Accessibility audit (VoiceOver, TalkBack, dynamic type)
  - Edge case handling (offline, poor network)

- [ ] **Documentation**
  - User guide (Quick Add, Today flow, Email-to-task)
  - Setup guide for self-hosting
  - API documentation
  - Troubleshooting guide

### Phase 3: Beta Launch (1 week - Dec 2-6)
- [ ] **Infrastructure**
  - Deploy to production Supabase project
  - Configure custom domain
  - Set up Mailgun for production
  - Configure Resend for daily digests
  - Set up monitoring (Sentry, Vercel Analytics)

- [ ] **Beta testing**
  - Invite 10 Due users for beta
  - Collect feedback on nagging reliability
  - Monitor notification delivery rates
  - Track cold start times in production

- [ ] **Iteration**
  - Fix critical bugs
  - Address beta feedback
  - Refine nagging cadence based on real usage
  - Polish UI based on user recordings

### Phase 4: Public Launch (Dec 9-13)
- [ ] **Marketing site** (simple landing page)
- [ ] **App Store submission** (iOS)
- [ ] **Google Play submission** (Android)
- [ ] **Product Hunt launch**
- [ ] **Due user outreach** (Reddit, Twitter)

---

## �� Definition of Done (Every Increment)

### Code Quality
- [ ] Works on iOS (tested on physical device or Expo Go)
- [ ] Works on Android (tested on physical device or Expo Go)
- [ ] Works on Web (tested in Chrome and Safari)
- [ ] No service role keys in client code
- [ ] RLS verified for all new database access
- [ ] Request IDs in logs for new endpoints
- [ ] Zod validation for all API inputs

### Documentation
- [ ] CHANGELOG.md updated with timestamp and changes
- [ ] Screenshots or short recording from all three platforms
- [ ] Code comments explain "why" not "what"

### Testing
- [ ] Unit tests for new parsing/scheduling logic
- [ ] Manual test plan executed
- [ ] Performance budget verified (if UI change)

---

## 🔐 Security & Privacy Principles

### Non-Negotiable
1. **RLS everywhere** - All data access via RLS, never bypass
2. **Service role isolation** - Only in server-side code, never exposed
3. **HMAC verification** - All webhooks (Mailgun, Resend callbacks)
4. **Rate limiting** - Per-IP and per-user on write endpoints
5. **Signed URLs** - All attachments and private content
6. **Request IDs** - Every API call logged with tracing ID
7. **PII scrubbing** - Logs never contain full email addresses or passwords

### Data Retention
- Task submissions: 90 days
- Notifications logs: 30 days
- Email delivery logs: 7 days
- Attachments: Until task deleted + 7 days

---

## 🎨 UX Principles (Due-Inspired)

### Speed First
- Launch to Quick Add (< 1s)
- One-tap submit (partial input OK)
- Keyboard shortcuts (web): N (new), T (today), 1-5 (priority)
- No multi-step forms for common actions

### Calm & Focused
- No projects, no folders, just tags
- Simple list view with large tap targets
- Minimal color (priority = color intensity)
- No flashy animations, subtle haptics only

### Respectful Nagging
- Repeats until acted upon (core promise)
- Quiet hours respected (no audible alerts)
- Catch-up alert after quiet hours (badge only during)
- Action buttons: Done, +10m, +1h, Tomorrow AM

### Accessibility
- Dynamic type (iOS/Android)
- VoiceOver/TalkBack labels
- Contrast AA+ minimum
- Touch targets ≥ 44pt

---

## 📦 Package Structure

```
todaypool/
├── apps/
│   ├── web/          # Next.js 15 web app
│   │   ├── app/
│   │   │   ├── api/        # API routes
│   │   │   ├── page.tsx    # Quick Add
│   │   │   └── today/      # Today proposals UI
│   │   ├── lib/
│   │   │   ├── supabase-server.ts
│   │   │   └── webpush-client.ts
│   │   └── public/sw.js    # Service worker
│   └── mobile/       # Expo/React Native app
│       ├── app/
│       │   └── index.tsx   # Quick Add
│       └── lib/
│           ├── supabase.ts
│           └── notifications/  # Platform adapters
│               ├── ios.ts
│               └── android.ts
├── packages/
│   ├── api/          # Shared utilities
│   │   └── parsing.ts      # Inline token parser
│   ├── db/           # Database schemas
│   │   └── schemas.ts
│   ├── notifications/  # Notification adapters
│   │   └── adapter.ts      # Interface
│   └── ui/           # Shared components (future)
├── supabase/
│   ├── migrations/
│   │   ├── 001_init.sql
│   │   ├── 002_indexes.sql
│   │   └── 003_web_push.sql
│   └── functions/
│       └── mailgun-inbound/
└── docs/
    ├── MASTER_STRATEGY.md  # This file
    ├── CROSS_PLATFORM_ROADMAP.md
    └── PRO_CROSS_PLATFORM_DUE_PARITY/
```

---

## 🔄 Daily Workflow

### Morning
1. Review CHANGELOG for yesterday's work
2. Update todo list with today's increment tasks
3. Run tests, verify nothing broken
4. Pick next task from increment plan

### During Development
1. Work in small commits (< 200 lines per feature)
2. Test on all 3 platforms before marking done
3. Update CHANGELOG after each logical unit
4. Keep service worker in sync with API changes

### End of Day
1. Update CHANGELOG with timestamp
2. Commit and push to repo
3. Update roadmap if priorities shifted
4. Note any blockers or questions

---

## 🚧 Known Blockers & Risks

### Technical Risks
1. **Android exact alarms** - Requires user permission, may be rejected by OEMs
   - Mitigation: Fallback to exact-while-idle + WorkManager

2. **iOS notification limits** - 64 local notifications max
   - Mitigation: Schedule next 3, reschedule on each fire/action

3. **Web Push reliability** - Requires HTTPS, service worker scope issues
   - Mitigation: Fallback to email notifications, clear error messages

4. **Offline nagging** - Local scheduling must survive app termination
   - Mitigation: Defensive healing on app resume, server safety ping

### Product Risks
1. **Due users resistant to change** - Strong habits with Due
   - Mitigation: Match familiar UX patterns, migration guide, import tool

2. **Quota friction** - Proposers frustrated by limits
   - Mitigation: Clear messaging, owner can adjust quotas, visual feedback

3. **Performance on low-end Android** - Budget devices struggle
   - Mitigation: Performance budget enforcement, minimize JS bundle

---

## 📈 Success Metrics (Post-Launch)

### Engagement
- Daily active users (DAU)
- Tasks created per user per day
- Notification action rate (Done vs Snooze)
- Today proposals accepted vs declined ratio

### Reliability
- Notification delivery rate (> 99%)
- P95 cold start time (< 1.5s)
- P95 capture-to-schedule latency (< 300ms)
- Crash-free session rate (> 99.5%)

### Retention
- Day 1 retention (> 60%)
- Day 7 retention (> 40%)
- Day 30 retention (> 25%)

### Satisfaction
- NPS score from Due migrants
- App Store / Play Store rating (> 4.5)
- Support ticket volume (< 5% of users)

---

## 🎯 Next Immediate Actions

1. **Now**: Continue with Increment 2 - Notification Adapters
2. **Create** `packages/notifications/` with shared interface
3. **Implement** iOS adapter (UNUserNotificationCenter)
4. **Implement** Android adapter (AlarmManager)
5. **Implement** Web adapter (Web Push wrapper)
6. **Test** on all three platforms
7. **Update** CHANGELOG with screenshots

---

## 📚 Reference Documents

### Strategic
- **This file** - Master strategy (consolidates all guidance)
- [CROSS_PLATFORM_ROADMAP.md](CROSS_PLATFORM_ROADMAP.md) - Detailed increment plan
- [PRO_CROSS_PLATFORM_DUE_PARITY/01_EXEC_SUMMARY.md](../PRO_CROSS_PLATFORM_DUE_PARITY/docs/PRO_CROSS_PLATFORM_DUE_PARITY/01_EXEC_SUMMARY.md)

### Product
- [PRODUCT_SPEC.md](PRODUCT_SPEC.md) - Original product vision
- [due_parity_pack/CORE_PARITY_MATRIX.md](../due_parity_pack/docs/COMPETE_DUE_CORE/CORE_PARITY_MATRIX.md)
- [due_parity_pack/DUE_USER_WOW_PLAN.md](../due_parity_pack/docs/COMPETE_DUE_CORE/DUE_USER_WOW_PLAN.md)

### Technical
- [ARCHITECTURE.md](ARCHITECTURE.md) - System design
- [PRO_CROSS_PLATFORM_DUE_PARITY/04_TECH_ARCHITECTURE.md](../PRO_CROSS_PLATFORM_DUE_PARITY/docs/PRO_CROSS_PLATFORM_DUE_PARITY/04_TECH_ARCHITECTURE.md)
- [due_parity_pack/NAGGING_ALGO_SPEC.md](../due_parity_pack/docs/COMPETE_DUE_CORE/NAGGING_ALGO_SPEC.md)

### Implementation
- [PRO_CROSS_PLATFORM_DUE_PARITY/05_ALGORITHMS.md](../PRO_CROSS_PLATFORM_DUE_PARITY/docs/PRO_CROSS_PLATFORM_DUE_PARITY/05_ALGORITHMS.md)
- [PRO_CROSS_PLATFORM_DUE_PARITY/06_API_CONTRACTS.md](../PRO_CROSS_PLATFORM_DUE_PARITY/docs/PRO_CROSS_PLATFORM_DUE_PARITY/06_API_CONTRACTS.md)
- [due_parity_pack/IMPLEMENTATION_GUIDE_IOS_ANDROID_WEB.md](../due_parity_pack/docs/COMPETE_DUE_CORE/IMPLEMENTATION_GUIDE_IOS_ANDROID_WEB.md)

### Testing
- [TESTING_GUIDE.md](TESTING_GUIDE.md) - Database and API testing
- [due_parity_pack/acceptance/ACCEPTANCE_TESTS.md](../due_parity_pack/docs/COMPETE_DUE_CORE/acceptance/ACCEPTANCE_TESTS.md)
- [PRO_CROSS_PLATFORM_DUE_PARITY/acceptance/PRO_PR_CHECKLIST.md](../PRO_CROSS_PLATFORM_DUE_PARITY/docs/PRO_CROSS_PLATFORM_DUE_PARITY/acceptance/PRO_PR_CHECKLIST.md)

### Operations
- [SUPABASE_SETUP.md](SUPABASE_SETUP.md) - Database setup
- [MAILGUN_SETUP.md](MAILGUN_SETUP.md) - Email-to-task setup
- [SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md) - Security review

---

**Last Review**: 2025-11-01 18:00 UTC
**Next Review**: After each completed increment
**Owner**: Lead Engineer (Claude)

---

## 📝 Agent Handoff Notes

### For Future Agents
This document is the **source of truth** for the entire DoFirst project. Before starting any work:

1. **Read MASTER_STRATEGY.md** (this file) completely
2. **Read CHANGELOG.md** to understand what's already done
3. **Read CROSS_PLATFORM_ROADMAP.md** for detailed increment plans
4. **Check TodoWrite** list for current tasks

### Current State Summary
- **Phase**: Cross-Platform MVP (Increment 1/9 complete)
- **Domain**: dofirst.today (updated 2025-11-01)
- **Standards**: World-class - no stubs, test everything, document as you code
- **Approach**: CLI-first, ask user for access, automate everything

### What's Working
- Web Push infrastructure fully implemented and tested
- Database migrations 001-003 applied
- Quick Add API and UI on web + mobile
- Today Proposals API with quotas
- Email-to-task with Mailgun webhook

### What's Next
- **Increment 2**: Notification Adapters (iOS/Android/Web)
- Must work on all 3 platforms before claiming done
- Full implementations, no placeholders
- Update CHANGELOG with screenshots after completion

### Critical Context
- User expects production-ready code on first try
- Test manually on iOS, Android, Web before marking done
- Update documentation as you code, not after
- Domain is dofirst.today, not todaypool.app
- CLI-first approach: ask user for credentials to set up via CLI
