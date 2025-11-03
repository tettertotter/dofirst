# DoFirst - Quick Start Guide

Get DoFirst running locally in under 5 minutes.

## Prerequisites

- Node.js 18+ and pnpm
- Supabase CLI
- Docker (for Supabase local)

## 1. Clone & Install

```bash
git clone <repo-url>
cd todaypool
pnpm install
```

## 2. Start Supabase

```bash
supabase start
```

This will output your local Supabase credentials:
```
API URL: http://localhost:54321
Anon key: eyJhbGc...
Service role key: eyJhbGc...
```

## 3. Run Migrations

```bash
cd apps/web
supabase migration up
```

This applies all 4 migrations:
- 001_init.sql - Core schema
- 002_indexes.sql - Performance indexes
- 003_natural_dates.sql - Date parsing support
- 004_nagging_config.sql - Notification config

## 4. Set Environment Variables

Create `apps/web/.env.local`:

```bash
# Supabase (from supabase start output)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Web Push (generate with: npx web-push generate-vapid-keys)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key

# Mailgun (optional, for email-to-task)
MAILGUN_SIGNING_KEY=your_key
```

## 5. Generate VAPID Keys

```bash
cd apps/web
npx web-push generate-vapid-keys
```

Copy the keys to your `.env.local` file.

## 6. Start Web App

```bash
cd apps/web
pnpm dev
```

Open http://localhost:3000

## 7. Start Mobile App (Optional)

```bash
cd apps/mobile
pnpm ios    # for iOS simulator
# or
pnpm android # for Android emulator
```

## What to Try First

### 1. Quick Add (Main Page)
- Visit http://localhost:3000
- Click "Sign in with Email"
- Enter your email, check inbox for magic link
- Try: `Buy milk today 5pm #personal !2`
- Try: `Meeting tomorrow 9am #work`
- Try: `Call client in 2h`

### 2. Web Push Notifications
- Visit http://localhost:3000/test-push
- Click "Subscribe to Push"
- Click "Send Test Push"
- Try the action buttons (Done, +10m, +1h, Tomorrow AM)

### 3. Snooze UI
- Visit http://localhost:3000/test-snooze
- Try quick snooze chips
- Try custom time picker
- Try snooze modal

### 4. Today Proposals
- Visit http://localhost:3000/today
- View proposals (none yet, need 2+ users)
- Create proposal via API (see below)

## Test with Multiple Users

Open an incognito window and sign in with a different email to test proposals:

**User 1** (main window):
```bash
# Create a proposal for User 2
curl -X POST http://localhost:3000/api/today.propose \
  -H "Content-Type: application/json" \
  -b "your_cookies.txt" \
  -d '{
    "proposedFor": "user2@example.com",
    "proposedDate": "2025-11-02",
    "title": "Review quarterly report",
    "priority": 1,
    "tags": ["work"]
  }'
```

**User 2** (incognito):
- Sign in with user2@example.com
- Visit http://localhost:3000/today
- See the proposal
- Accept/Decline/Move

## Troubleshooting

### "No pool found"
Create a pool first:
```sql
-- In Supabase SQL Editor
INSERT INTO pools (name, description)
VALUES ('My Pool', 'My task pool');

INSERT INTO pool_members (pool_id, user_id, role)
VALUES (
  (SELECT id FROM pools LIMIT 1),
  (SELECT id FROM auth.users WHERE email = 'your@email.com'),
  'owner'
);
```

### "Unauthorized"
Check that your Supabase session is valid:
```javascript
// In browser console
const { data } = await window.supabase.auth.getSession();
console.log(data.session);
```

### Notifications not working
- Chrome: Check DevTools → Application → Service Workers
- Ensure VAPID keys are set
- Check browser console for errors
- Try http://localhost:3000/test-push

### Migrations failed
Reset Supabase:
```bash
supabase db reset
```

## Next Steps

1. **Read the docs:**
   - [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md) - Comprehensive testing plan
   - [PROJECT_STATUS.md](./PROJECT_STATUS.md) - Feature overview
   - [MAILGUN_SETUP.md](./MAILGUN_SETUP.md) - Email integration

2. **Explore the code:**
   - `apps/web/app/api/` - API endpoints
   - `packages/ui/src/` - React components
   - `packages/nagging/` - Notification logic
   - `packages/recurrence/` - Recurring tasks

3. **Test the features:**
   - Natural language parsing
   - Recurring tasks (complete a task with recurrence)
   - Snooze actions
   - Today proposals

4. **Deploy to production:**
   - Set up Vercel/AWS for web
   - Configure production Supabase
   - Set up Mailgun
   - Build mobile apps with Expo

## Demo Accounts

For testing, you can use any email addresses. Magic links are sent via Supabase Auth.

To test without email:
```sql
-- Create a user directly in Supabase
-- (Only for local development!)
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES ('test@example.com', crypt('password123', gen_salt('bf')), now());
```

## Common Tasks

### View all tasks
```bash
# In Supabase SQL Editor
SELECT * FROM tasks ORDER BY created_at DESC LIMIT 10;
```

### Check notification state
```sql
SELECT t.title, tns.*
FROM task_nagging_state tns
JOIN tasks t ON t.id = tns.task_id
ORDER BY tns.last_notified_at DESC;
```

### View proposals
```sql
SELECT * FROM today_proposals ORDER BY proposed_at DESC;
```

### Reset a user's rate limit
```javascript
// In browser console
await fetch('/api/tasks.quickAdd', {
  method: 'POST',
  headers: { 'X-Reset-Rate-Limit': 'true' }
});
```

## Need Help?

- Check the CHANGELOG.md for detailed feature documentation
- Review package READMEs for specific components
- Check browser/mobile console for errors
- Verify environment variables are set

Happy building! 🚀
