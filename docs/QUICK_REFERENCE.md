# DoFirst Quick Reference

**For Agents Starting Fresh** - Read this first, then MASTER_STRATEGY.md

---

## 🎯 The Mission
Win over Due users with a cross-platform task manager that matches Due's reliability and adds collaborative Today planning.

**Domain**: dofirst.today
**Stack**: Next.js 15 (web), Expo (mobile), Supabase (backend)

---

## 📊 Current Status (2025-11-01)

### ✅ Completed (Increment 1/9)
- Database schema (migrations 001-003)
- Quick Add API + UI (web + mobile)
- Today Proposals API (quotas, accept/decline/move)
- Email-to-task (Mailgun webhook)
- **Web Push Infrastructure** ← Just finished

### ⏳ Next Up (Increment 2/9)
**Notification Adapters for iOS/Android/Web**
- Create `packages/notifications/` with shared interface
- Implement iOS (UNUserNotificationCenter)
- Implement Android (AlarmManager)
- Implement Web (Web Push wrapper)

---

## 🏆 Standards (Non-Negotiable)

### Code Quality
- ✅ **No stubs or TODOs** - Production-ready code only
- ✅ **Test on all 3 platforms** - iOS, Android, Web before marking done
- ✅ **Full error handling** - Every API call, user-facing messages
- ✅ **Complete implementations** - Never skip difficult tasks

### Testing
- Manual test on iOS (physical device or Expo Go)
- Manual test on Android (physical device or Expo Go)
- Manual test on Web (Chrome + Safari)
- Unit tests for parsers, schedulers, business logic
- Performance verification (cold start < 1.5s, interaction < 100ms)

### Documentation
- Update CHANGELOG immediately after completing work
- Include screenshots/recordings from all 3 platforms
- Update MASTER_STRATEGY after major decisions
- Code comments explain "why" not "what"

---

## 🚀 Development Workflow

### Starting a New Increment
1. Read MASTER_STRATEGY.md and CROSS_PLATFORM_ROADMAP.md
2. Create TodoWrite tasks for the increment
3. Read reference implementations from PRO_CROSS_PLATFORM_DUE_PARITY/
4. Implement feature with full error handling and tests
5. Test manually on all 3 platforms
6. Update CHANGELOG with screenshots
7. Mark TodoWrite tasks as completed

### Before Claiming Done
- [ ] Works on iOS (tested)
- [ ] Works on Android (tested)
- [ ] Works on Web (tested)
- [ ] No service role keys in client code
- [ ] RLS verified for database access
- [ ] Zod validation for all inputs
- [ ] CHANGELOG updated
- [ ] Screenshots from all platforms

---

## 🔐 Security Checklist

- ✅ RLS on all database queries
- ✅ No service role keys in client code
- ✅ HMAC verification for webhooks
- ✅ Rate limiting on write endpoints
- ✅ Request IDs in all API routes
- ✅ Input validation with Zod schemas

---

## 📂 Key Files

### Configuration
- `.env` - Supabase credentials, VAPID keys, domain config
- `apps/web/.env.local` - Web-specific env vars
- `apps/mobile/.env` - Mobile-specific env vars

### Database
- `supabase/migrations/001_init.sql` - Core schema
- `supabase/migrations/002_indexes.sql` - Performance indexes
- `supabase/migrations/003_web_push.sql` - Web Push + nagging columns

### API Endpoints
- `apps/web/app/api/tasks.quickAdd/route.ts` - Task creation
- `apps/web/app/api/today.propose/route.ts` - Today proposals
- `apps/web/app/api/today.respond/route.ts` - Accept/decline/move
- `apps/web/app/api/webpush/subscribe/route.ts` - Web Push subscription
- `apps/web/app/api/webpush/send/route.ts` - Send push notifications

### Mobile
- `apps/mobile/app/index.tsx` - Quick Add UI
- `apps/mobile/lib/supabase.ts` - Supabase client
- `apps/mobile/lib/notifications/` - Platform adapters (to be created)

### Shared Packages
- `packages/api/parsing.ts` - Inline token parser (#tags, !priority, @date)
- `packages/db/schemas.ts` - Zod schemas

---

## 🎯 Performance Budget

**Must Verify**:
- Cold start: ≤ 1.5s
- Interaction latency: < 100ms
- Capture-to-schedule: < 300ms

**How to Test**:
1. Clear app cache/data
2. Kill app completely
3. Measure time from tap to first render
4. Measure time from tap to interaction feedback

---

## 📚 Reference Documents (Read in Order)

1. **QUICK_REFERENCE.md** (this file) - Quick overview
2. **MASTER_STRATEGY.md** - Complete strategy and standards
3. **CHANGELOG.md** - What's been done
4. **CROSS_PLATFORM_ROADMAP.md** - Detailed increment plans
5. **PRO_CROSS_PLATFORM_DUE_PARITY/** - Reference implementations

---

## 🆘 Common Issues

### "Service role key in client code"
**Fix**: Move to server-side API route, use RLS with anon key in client

### "Works on web but not mobile"
**Fix**: Check Authorization header support in API, verify AsyncStorage in mobile client

### "Notification not firing"
**Fix**:
- iOS: Check notification permissions, verify UNUserNotificationCenter
- Android: Check exact alarm permission, verify AlarmManager
- Web: Check service worker registration, VAPID keys

### "Performance budget exceeded"
**Fix**: Profile with React DevTools, check bundle size, lazy load components

---

## 🔄 CLI-First Setup Approach

When setting up services:
1. **Ask user for credentials** first
2. **Use CLI commands** to configure (e.g., `supabase`, `vercel`, `gh`)
3. **Create setup scripts** for repeatable operations
4. **Document the CLI commands** for future agents

Example:
```bash
# Good: CLI-first
supabase link --project-ref abc123
supabase db push

# Avoid: Manual instructions
# "Go to dashboard, click Settings, copy value..."
```

---

**Last Updated**: 2025-11-01 18:00 UTC
**For Questions**: Read MASTER_STRATEGY.md or ask user
