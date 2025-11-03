# TodayPool Quick Setup (5 Minutes)

Follow these steps to get TodayPool running locally.

## Step 1: Create Supabase Project (2 min)

1. Go to: https://supabase.com/dashboard
2. Click **"New Project"**
3. Fill in:
   - Name: `todaypool`
   - Database Password: (generate a strong one - save it!)
   - Region: Choose closest to you
4. Click **"Create new project"**
5. Wait 2-3 minutes for provisioning

## Step 2: Get Your Credentials (1 min)

1. In your Supabase project, go to **Settings > API**
2. Copy these three values:

```
Project URL: https://xxxxx.supabase.co
anon public: eyJhbGc...
service_role: eyJhbGc...
```

## Step 3: Configure Environment (1 min)

Open these files and paste your credentials:

### `/Users/pc2/Desktop/vscode repo/todaypool/.env`
```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Leave these empty for now
RESEND_API_KEY=
MAILGUN_SIGNING_KEY=
MAILGUN_DOMAIN=inbound.dofirst.today
WEB_PUSH_VAPID_PUBLIC_KEY=
WEB_PUSH_VAPID_PRIVATE_KEY=
APP_BASE_URL=https://dofirst.today
```

### `/Users/pc2/Desktop/vscode repo/todaypool/apps/web/.env.local`
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Leave empty for now
RESEND_API_KEY=

APP_BASE_URL=http://localhost:3000
```

### `/Users/pc2/Desktop/vscode repo/todaypool/apps/mobile/.env`
```bash
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
EXPO_PUBLIC_API_URL=http://localhost:3000
```

## Step 4: Apply Database Migrations (1 min)

1. Go to your Supabase project
2. Click **SQL Editor** in left sidebar
3. Click **"New query"**
4. Copy entire contents of: `/Users/pc2/Desktop/vscode repo/todaypool/supabase/migrations/001_init.sql`
5. Paste into SQL Editor
6. Click **Run** (bottom right)
7. You should see "Success. No rows returned"
8. Click **"New query"** again
9. Copy entire contents of: `/Users/pc2/Desktop/vscode repo/todaypool/supabase/migrations/002_indexes.sql`
10. Paste and **Run**

✅ Database is now ready!

## Step 5: Install and Start (1 min)

```bash
cd /Users/pc2/Desktop/vscode\ repo/todaypool
pnpm install
cd apps/web
pnpm dev
```

Open: http://localhost:3000

## Step 6: Create Your Account

1. Click **"Sign in with Email"**
2. Enter your email
3. Check your email for magic link
4. Click the magic link

## Step 7: Create Your Pool

1. Go back to Supabase **SQL Editor**
2. Run this query to find your user ID:

```sql
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 1;
```

3. Copy your `id` value
4. Run this query (replace `YOUR_USER_ID` with your actual ID):

```sql
-- Create pool
INSERT INTO pools (owner_id, name, timezone)
VALUES ('YOUR_USER_ID', 'My Pool', 'America/New_York')
RETURNING id;
```

5. Copy the returned pool `id`
6. Run this query (replace both placeholders):

```sql
-- Add yourself as member
INSERT INTO pool_members (pool_id, user_id, role, can_add)
VALUES ('YOUR_POOL_ID', 'YOUR_USER_ID', 'owner', true);

-- Create core tags
INSERT INTO tags (pool_id, name, is_core)
VALUES
  ('YOUR_POOL_ID', 'personal', true),
  ('YOUR_POOL_ID', 'work', true);
```

## Step 8: Test It!

1. Refresh http://localhost:3000
2. You should now see the **Quick Add** form
3. Try adding a task:

```
Buy groceries #personal !2
```

✅ **You're done!** Your TodayPool is running!

---

## Troubleshooting

**"No pool found"**: Make sure you completed Step 7 and added yourself as a pool member.

**Migration errors**: Check Supabase dashboard > Database > Logs for details.

**Auth errors**: Make sure all three .env files have the correct credentials.

## What's Next?

- **Mobile app**: `cd apps/mobile && pnpm start` (scan QR with Expo Go)
- **Email-to-task**: See `docs/MAILGUN_SETUP.md`
- **Add users**: See `SETUP.md` for inviting others

## Need Help?

- Full documentation: `SETUP.md`
- Detailed Supabase setup: `docs/SUPABASE_SETUP.md`
- Testing guide: `docs/TESTING_GUIDE.md`
