-- Create your first pool after signing in
-- Replace YOUR_USER_ID with your actual user ID from auth.users

-- Step 1: Find your user ID (run this first)
SELECT
  id as user_id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- Step 2: Create pool (replace YOUR_USER_ID below)
INSERT INTO pools (owner_id, name, timezone)
VALUES (
  'YOUR_USER_ID',  -- ⚠️ REPLACE THIS
  'My Pool',
  'America/New_York'
)
RETURNING id, name, owner_id;

-- Step 3: Note the pool_id from above, then add yourself as member (replace both IDs)
INSERT INTO pool_members (pool_id, user_id, role, can_add)
VALUES (
  'YOUR_POOL_ID',  -- ⚠️ REPLACE THIS with pool id from step 2
  'YOUR_USER_ID',  -- ⚠️ REPLACE THIS with your user id
  'owner',
  true
)
RETURNING *;

-- Step 4: Create core tags (replace YOUR_POOL_ID)
INSERT INTO tags (pool_id, name, is_core)
VALUES
  ('YOUR_POOL_ID', 'personal', true),  -- ⚠️ REPLACE THIS
  ('YOUR_POOL_ID', 'work', true)       -- ⚠️ REPLACE THIS
RETURNING *;

-- Step 5: (Optional) Create email alias for email-to-task
INSERT INTO email_aliases (pool_id, alias_local, provider)
VALUES (
  'YOUR_POOL_ID',  -- ⚠️ REPLACE THIS
  'mytasks',       -- This will be: mytasks@yourdomain.com
  'mailgun'
)
RETURNING *;

-- ✓ Done! Refresh your browser at http://localhost:3000
