# Testing Guide

## Prerequisites

Before testing, ensure you have:

1. **Supabase Project**: Created and configured
2. **Migrations Applied**: Both 001_init.sql and 002_indexes.sql
3. **Environment Variables**: Set in .env files
4. **Dependencies Installed**: Run `pnpm install` from repo root

## Step 1: Apply Database Migrations

### Option A: Using Supabase CLI (Recommended)

```bash
# From repo root
supabase db push
```

### Option B: Using SQL Editor

1. Go to Supabase dashboard > SQL Editor
2. Copy contents of `supabase/migrations/001_init.sql`
3. Execute
4. Copy contents of `supabase/migrations/002_indexes.sql`
5. Execute

### Verify Migrations

Run this query in SQL Editor:

```sql
-- Check tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Should see: email_aliases, notifications, pool_members, pools, profiles,
--             tags, task_submissions, task_tags, tasks, today_limits, today_proposals

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- All should have rowsecurity = true

-- Check indexes exist
SELECT indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY indexname;
```

## Step 2: Create Test Users and Pool

Since we need real auth users (not random UUIDs), we'll create them through Supabase Auth:

### Manual Setup (for initial testing)

1. **Create Owner User**:
   - Go to Supabase dashboard > Authentication > Users
   - Click "Add user"
   - Email: `owner@todaypool.test`
   - Password: Generate one
   - Confirm email manually
   - Copy the user ID

2. **Create Pool in SQL Editor**:

```sql
-- Replace YOUR_USER_ID with the actual UUID from step 1
INSERT INTO public.pools (owner_id, name, timezone)
VALUES ('YOUR_USER_ID', 'My Test Pool', 'America/New_York')
RETURNING id;

-- Copy the returned pool ID

-- Add owner as pool member
INSERT INTO public.pool_members (pool_id, user_id, role, can_add)
VALUES ('YOUR_POOL_ID', 'YOUR_USER_ID', 'owner', true);

-- Create core tags
INSERT INTO public.tags (pool_id, name, is_core)
VALUES
  ('YOUR_POOL_ID', 'personal', true),
  ('YOUR_POOL_ID', 'work', true);
```

3. **Create Additional Users** (optional for multi-role testing):

```sql
-- Spouse
INSERT INTO public.pool_members (pool_id, user_id, role, can_add)
VALUES ('YOUR_POOL_ID', 'SPOUSE_USER_ID', 'spouse', true);

-- Colleague
INSERT INTO public.pool_members (pool_id, user_id, role, can_add)
VALUES ('YOUR_POOL_ID', 'COLLEAGUE_USER_ID', 'colleague', true);

-- Set today limits
INSERT INTO public.today_limits (pool_id, delegator_id, daily_limit)
VALUES
  ('YOUR_POOL_ID', 'SPOUSE_USER_ID', 3),
  ('YOUR_POOL_ID', 'COLLEAGUE_USER_ID', 2);
```

## Step 3: Run Web App Locally

```bash
# From repo root
cd apps/web
pnpm dev
```

Open http://localhost:3000

## Step 4: Test Quick Add Flow

### Test Case 1: Basic Task Creation

1. Click "Sign in with Email"
2. Enter `owner@todaypool.test`
3. Check email for magic link (or use password if set)
4. After sign in, you should see "Quick Add" form
5. Enter: `Buy groceries`
6. Click "Add" or press Enter
7. Should see success message: "Task added: Buy groceries"

**Verify in Database**:

```sql
SELECT title, priority, status, visibility, created_by
FROM public.tasks
WHERE title = 'Buy groceries';

-- Should return one row with:
-- priority = 3 (default)
-- status = 'open'
-- visibility = 'household' (for owner role)
```

### Test Case 2: Task with Tags

1. Enter: `Deploy website #work #urgent`
2. Click "Add"
3. Should see: "Task added: Deploy website"

**Verify**:

```sql
SELECT t.title, array_agg(tag.name) as tags
FROM public.tasks t
JOIN public.task_tags tt ON t.id = tt.task_id
JOIN public.tags tag ON tt.tag_id = tag.id
WHERE t.title = 'Deploy website'
GROUP BY t.id, t.title;

-- Should show tags: {work, urgent}
```

### Test Case 3: Task with Priority

1. Enter: `Fix critical bug !1`
2. Click "Add"
3. Should see: "Task added: Fix critical bug"

**Verify**:

```sql
SELECT title, priority
FROM public.tasks
WHERE title = 'Fix critical bug';

-- Should show priority = 1
```

### Test Case 4: Combined Tokens

1. Enter: `Review PR #work !2`
2. Click "Add"

**Verify**:

```sql
SELECT t.title, t.priority, array_agg(tag.name) as tags
FROM public.tasks t
JOIN public.task_tags tt ON t.id = tt.task_id
JOIN public.tags tag ON tt.tag_id = tag.id
WHERE t.title = 'Review PR'
GROUP BY t.id, t.title, t.priority;

-- Should show: priority = 2, tags = {work}
```

### Test Case 5: Empty Title (Error)

1. Enter: `#work !1` (only tokens, no text)
2. Click "Add"
3. Should see error: "Please enter a task title"

### Test Case 6: Unauthorized (No Pool)

To test this, you'd need to sign in with a user who isn't a member of any pool:

1. Create a new user in Supabase Auth
2. Sign in with that user
3. Should see: "No pool found. Please create a pool first."

## Step 5: Verify RLS Policies

### Test Visibility Rules

Create tasks with different visibility settings and verify users see only what they should:

```sql
-- As owner, create different visibility tasks
-- Sign in as owner
-- Add tasks with different visibility:
-- 1. owner_only
-- 2. household
-- 3. work

-- Then query as different users to verify RLS
```

### Test with Different Roles

1. Sign in as owner: should see all tasks
2. Sign in as spouse: should see household and public tasks
3. Sign in as colleague: should see work and public tasks
4. Sign in as guest: should only see own tasks (unless shared)

## Step 6: Test Task Submissions Logging

```sql
SELECT
  ts.raw_text,
  ts.parsed,
  ts.source,
  ts.status,
  t.title as created_task_title
FROM public.task_submissions ts
LEFT JOIN public.tasks t ON ts.created_task_id = t.id
ORDER BY ts.created_at DESC
LIMIT 10;

-- Should see all your quick add submissions logged
```

## Common Issues and Solutions

### Issue: "Missing Supabase environment variables"

**Solution**: Ensure `.env.local` exists in `apps/web/` with:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Issue: "unauthorized" error

**Solution**:
1. Check that user is signed in (check browser DevTools > Application > Cookies)
2. Verify `sb-access-token` cookie exists
3. Try signing out and back in

### Issue: "Not authorized to add tasks to this pool"

**Solution**:
1. Verify user is a member of the pool:
   ```sql
   SELECT * FROM public.pool_members
   WHERE user_id = 'YOUR_USER_ID';
   ```
2. Ensure `can_add = true` for that member

### Issue: Tags not linking

**Solution**:
1. Check that tags table exists and is accessible
2. Verify RLS policies on tags table allow the user to read/write
3. Check task_tags join table for entries

### Issue: "Failed to create task" with RLS error

**Solution**:
1. Verify user is a pool member
2. Check that all RLS policies are created correctly
3. Ensure user has `can_add = true` in pool_members

## Performance Testing

### Load Test Tag Creation

Run this to test tag creation performance:

```sql
EXPLAIN ANALYZE
SELECT id FROM public.tags
WHERE pool_id = 'YOUR_POOL_ID'
AND name = 'test';

-- Should use index idx_tags_unique or similar
```

### Test Query Performance

```sql
-- Tasks by pool and status (should use idx_tasks_pool_status)
EXPLAIN ANALYZE
SELECT * FROM public.tasks
WHERE pool_id = 'YOUR_POOL_ID'
AND status = 'open';

-- Task tags join (should use idx_task_tags_tag)
EXPLAIN ANALYZE
SELECT t.*, array_agg(tag.name) as tags
FROM public.tasks t
LEFT JOIN public.task_tags tt ON t.id = tt.task_id
LEFT JOIN public.tags tag ON tt.tag_id = tag.id
WHERE t.pool_id = 'YOUR_POOL_ID'
GROUP BY t.id;
```

## Next Testing Steps

After Quick Add is verified:

1. Test Today proposals (when implemented)
2. Test email inbound (when implemented)
3. Test cron jobs (when implemented)
4. Test mobile app (when implemented)
5. Load testing with multiple concurrent users
6. Security testing (attempt to bypass RLS, inject malicious input, etc.)

## Automated Tests (TODO)

Future work:
- Unit tests for parseInline function
- Integration tests for API endpoints
- E2E tests with Playwright
- RLS policy tests with multiple users
