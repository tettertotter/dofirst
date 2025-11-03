# TodayPool Setup Guide

Quick setup guide to get TodayPool running locally.

## Prerequisites

- Node.js 18+ and pnpm
- Supabase account (free tier works)
- (Optional) Mailgun account for email-to-task
- (Optional) Resend account for email digests

## Quick Start (5 minutes)

### 1. Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Create new project (save the database password!)
3. Wait 2-3 minutes for provisioning

### 2. Get Credentials

Go to **Settings > API** and copy:
- Project URL: `https://xxxxx.supabase.co`
- anon key: `eyJhbGc...`
- service_role key: `eyJhbGc...` (keep secret!)

### 3. Apply Database Migrations

**Option A: SQL Editor (Easiest)**

1. Go to **SQL Editor** in Supabase
2. New query → paste contents of `supabase/migrations/001_init.sql`
3. Run (bottom right)
4. New query → paste contents of `supabase/migrations/002_indexes.sql`
5. Run

**Option B: Command Line**

```bash
# Create .env in repo root
cat > .env << EOF
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
EOF

# Run setup script (requires jq: brew install jq)
./tooling/scripts/setup-db.sh
```

### 4. Configure Environment

```bash
# Web app
cat > apps/web/.env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
RESEND_API_KEY=re_xxx  # Optional, get from resend.com
EOF

# Mobile app
cat > apps/mobile/.env << EOF
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
EXPO_PUBLIC_API_URL=http://localhost:3000
EOF
```

### 5. Install Dependencies

```bash
pnpm install
```

### 6. Start Web App

```bash
cd apps/web
pnpm dev
```

Open http://localhost:3000

### 7. Sign In and Create Pool

1. Click "Sign in with Email"
2. Enter your email
3. Check email for magic link
4. Click magic link

### 8. Create Your Pool

Go to Supabase **SQL Editor** and run:

```sql
-- Find your user ID
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 1;

-- Create pool (replace YOUR_USER_ID with ID from above)
INSERT INTO pools (owner_id, name, timezone)
VALUES ('YOUR_USER_ID', 'My Pool', 'America/New_York')
RETURNING id;

-- Add yourself as owner (replace both IDs)
INSERT INTO pool_members (pool_id, user_id, role, can_add)
VALUES ('YOUR_POOL_ID', 'YOUR_USER_ID', 'owner', true);

-- Create core tags
INSERT INTO tags (pool_id, name, is_core)
VALUES
  ('YOUR_POOL_ID', 'personal', true),
  ('YOUR_POOL_ID', 'work', true);
```

Or use the helper: `tooling/scripts/create-first-pool.sql`

### 9. Test!

Refresh http://localhost:3000 - you should see the Quick Add form!

Try adding a task:
```
Buy groceries #personal !2
```

## What's Next?

### Deploy Edge Function (for email-to-task)

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase functions deploy mailgun-inbound
```

See [docs/MAILGUN_SETUP.md](docs/MAILGUN_SETUP.md) for full email setup.

### Run Mobile App

```bash
cd apps/mobile
pnpm start
```

Scan QR code with Expo Go app.

### Add More Users

Invite family/colleagues:

```sql
-- After they sign in, add them to your pool
INSERT INTO pool_members (pool_id, user_id, role, can_add)
VALUES (
  'YOUR_POOL_ID',
  'THEIR_USER_ID',  -- Get from auth.users
  'colleague',      -- or 'spouse'
  true
);

-- Set their daily proposal limit
INSERT INTO today_limits (pool_id, delegator_id, daily_limit)
VALUES ('YOUR_POOL_ID', 'THEIR_USER_ID', 2);
```

## Troubleshooting

### "No pool found"

Make sure you created a pool and added yourself as a member. Check:

```sql
SELECT * FROM pools WHERE owner_id = 'YOUR_USER_ID';
SELECT * FROM pool_members WHERE user_id = 'YOUR_USER_ID';
```

### RLS errors

Re-run `001_init.sql` to ensure all policies are created.

### Migration errors

Check Supabase logs in dashboard > Database > Logs

### More help

- [SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) - Detailed Supabase setup
- [TESTING_GUIDE.md](docs/TESTING_GUIDE.md) - How to test features
- [MAILGUN_SETUP.md](docs/MAILGUN_SETUP.md) - Email-to-task setup
- [ENV_SETUP.md](docs/ENV_SETUP.md) - Environment variables reference

## Architecture Overview

```
┌─────────────────────────────────────────┐
│  Web App (Next.js)                      │
│  Mobile App (Expo)                      │
└───────────────┬─────────────────────────┘
                │
                │ API Calls (RLS enforced)
                ▼
┌─────────────────────────────────────────┐
│  Supabase                               │
│  ├─ Auth (Magic Links)                  │
│  ├─ Database (Postgres + RLS)           │
│  ├─ Storage (Attachments)               │
│  └─ Edge Functions (Email inbound)      │
└─────────────────────────────────────────┘
                │
                │ Webhooks
                ▼
┌─────────────────────────────────────────┐
│  External Services                      │
│  ├─ Mailgun (Inbound email)             │
│  ├─ Resend (Outbound email)             │
│  └─ Vercel Cron (Scheduled jobs)        │
└─────────────────────────────────────────┘
```

## Development Workflow

```bash
# Start web app
cd apps/web && pnpm dev

# Start mobile app
cd apps/mobile && pnpm start

# Watch all packages
pnpm dev

# Run tests (when added)
pnpm test

# Deploy edge function
supabase functions deploy mailgun-inbound

# View logs
supabase functions logs mailgun-inbound
```

## Production Deployment

### Web App (Vercel)

1. Connect GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy!

### Mobile App (Expo)

```bash
cd apps/mobile
eas build --platform ios
eas build --platform android
eas submit
```

### Edge Functions

Already deployed to Supabase - no separate hosting needed!

## Key Files

- `supabase/migrations/` - Database schema
- `apps/web/app/api/` - API route handlers
- `apps/web/app/page.tsx` - Main web UI
- `apps/mobile/app/index.tsx` - Main mobile UI
- `packages/api/parsing.ts` - Inline token parser (#tags, !priority)
- `supabase/functions/mailgun-inbound/` - Email-to-task handler

## Getting Help

- Check [docs/](docs/) for detailed guides
- Review [CHANGELOG.md](CHANGELOG.md) for what's implemented
- See [EXECUTION_NOTES.md](docs/EXECUTION_NOTES.md) for technical details

Happy task managing! 🎯
