# Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in:
   - **Name**: TodayPool
   - **Database Password**: Generate a secure password (save it!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free tier is fine for MVP
4. Click "Create new project"
5. Wait 2-3 minutes for project to provision

## Step 2: Get Project Credentials

Once your project is ready:

1. Go to **Settings > API** in Supabase dashboard
2. Copy these values (you'll need them):
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGc...` (anon key)
   - **service_role**: `eyJhbGc...` (service role key - keep secret!)

## Step 3: Apply Database Migrations

### Option A: Using SQL Editor (Easiest)

1. Go to **SQL Editor** in Supabase dashboard
2. Click "New query"
3. Copy contents of `supabase/migrations/001_init.sql`
4. Paste into editor
5. Click "Run" (bottom right)
6. Wait for success message
7. Repeat for `supabase/migrations/002_indexes.sql`

### Option B: Using Supabase CLI

First, link your project:

```bash
cd /path/to/todaypool
supabase link --project-ref YOUR_PROJECT_REF
```

Get YOUR_PROJECT_REF from Settings > General > Reference ID

Then push migrations:

```bash
supabase db push
```

## Step 4: Verify Database Setup

Run this query in SQL Editor to verify everything is set up:

```sql
-- Check all tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Should see: email_aliases, notifications, pool_members, pools,
--             profiles, tags, task_submissions, task_tags, tasks,
--             today_limits, today_proposals

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- All should have rowsecurity = true
```

## Step 5: Create Storage Bucket

1. Go to **Storage** in Supabase dashboard
2. Click "New bucket"
3. Name: `attachments`
4. **Public bucket**: Uncheck (keep private)
5. Click "Create bucket"
6. Go to bucket > Policies
7. Add policy:
   ```sql
   -- Allow authenticated users to upload to their pool's folder
   CREATE POLICY "Authenticated users can upload attachments"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (
     bucket_id = 'attachments'
     AND (storage.foldername(name))[1] = auth.uid()::text
   );

   -- Allow users to read their own attachments
   CREATE POLICY "Users can read own attachments"
   ON storage.objects FOR SELECT
   TO authenticated
   USING (
     bucket_id = 'attachments'
     AND (storage.foldername(name))[1] = auth.uid()::text
   );
   ```

## Step 6: Deploy Edge Function

Deploy the mailgun-inbound function:

```bash
cd /path/to/todaypool
supabase functions deploy mailgun-inbound
```

Set environment variables for the function:

1. Go to **Edge Functions** in Supabase dashboard
2. Click on `mailgun-inbound`
3. Go to **Settings** tab
4. Add secrets:
   - `MAILGUN_SIGNING_KEY`: Your Mailgun HTTP webhook signing key
   - `SUPABASE_URL`: Your project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Your service role key

Get the function URL (you'll need it for Mailgun):
```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/mailgun-inbound
```

## Step 7: Update Environment Files

Update `.env` files in the project:

### Repository Root `.env`:
```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### `apps/web/.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
RESEND_API_KEY=re_...  # Get from resend.com
```

### `apps/mobile/.env`:
```bash
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
EXPO_PUBLIC_API_URL=http://localhost:3000  # Or your deployed web URL
```

## Step 8: Create First User and Pool

1. Run the web app: `cd apps/web && pnpm dev`
2. Go to http://localhost:3000
3. Click "Sign in with Email"
4. Enter your email
5. Check email for magic link
6. Click magic link to sign in
7. Note your user ID from browser console or SQL Editor:

```sql
-- Find your user ID
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 1;
```

8. Create your pool in SQL Editor:

```sql
-- Replace YOUR_USER_ID with actual ID from previous query
INSERT INTO pools (owner_id, name, timezone)
VALUES ('YOUR_USER_ID', 'My Pool', 'America/New_York')
RETURNING id;

-- Note the pool ID, then add yourself as owner
INSERT INTO pool_members (pool_id, user_id, role, can_add)
VALUES ('YOUR_POOL_ID', 'YOUR_USER_ID', 'owner', true);

-- Create core tags
INSERT INTO tags (pool_id, name, is_core)
VALUES
  ('YOUR_POOL_ID', 'personal', true),
  ('YOUR_POOL_ID', 'work', true);
```

9. Refresh your browser - you should now see the Quick Add form!

## Step 9: Create Email Alias (Optional)

If you want email-to-task:

```sql
-- Create an alias for your pool
INSERT INTO email_aliases (pool_id, alias_local, provider)
VALUES ('YOUR_POOL_ID', 'mytasks', 'mailgun')
RETURNING *;
```

Then follow [MAILGUN_SETUP.md](MAILGUN_SETUP.md) to configure Mailgun.

## Troubleshooting

### "No pool found" error

Make sure you've:
1. Created a pool with your user ID as owner_id
2. Added yourself to pool_members with role='owner'

```sql
-- Debug queries
SELECT * FROM pools WHERE owner_id = 'YOUR_USER_ID';
SELECT * FROM pool_members WHERE user_id = 'YOUR_USER_ID';
```

### RLS blocking queries

Make sure RLS is enabled and policies are created:

```sql
-- Check RLS status
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Check policies exist
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public';
```

If policies are missing, re-run `001_init.sql`.

### Edge function deploy fails

Make sure you're logged in:

```bash
supabase login
```

Then link your project:

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

### Function URL not working

1. Check function is deployed: Go to Edge Functions in dashboard
2. Check environment variables are set
3. Test with curl:

```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/mailgun-inbound \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

Should return "Method Not Allowed" (expected, since it wants POST with form data).

## Next Steps

- [Testing Guide](TESTING_GUIDE.md) - How to test the app
- [Mailgun Setup](MAILGUN_SETUP.md) - Configure email-to-task
- [Development Plan](DEVELOPMENT_PLAN.md) - See what's next

## Quick Reference

**Project Structure:**
```
User Auth (Supabase Auth)
  └─ Pool (owner_id)
      ├─ Pool Members (user_id, role)
      ├─ Tags
      ├─ Tasks (created_by, visibility)
      ├─ Today Proposals (proposed_by, proposed_for, date)
      └─ Email Aliases (alias_local)
```

**Default Quotas:**
- Owner: Unlimited
- Spouse: 3 proposals/day (configurable)
- Colleague: 2 proposals/day (configurable)

**Visibility Rules:**
- `owner_only`: Only pool owner sees
- `household`: Owner and spouse see
- `work`: Owner and colleagues see
- `public`: Everyone in pool sees
