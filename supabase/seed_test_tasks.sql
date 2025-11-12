-- Seed test tasks for testing swipe gestures
-- Run this with: supabase db reset (or manually via SQL editor)

DO $$
DECLARE
  v_user_id uuid;
  v_pool_id uuid;
BEGIN
  -- Get the first user
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;

  -- Get the first pool for that user
  SELECT pool_id INTO v_pool_id
  FROM public.pool_members
  WHERE user_id = v_user_id
  LIMIT 1;

  -- Only proceed if we found a user and pool
  IF v_user_id IS NOT NULL AND v_pool_id IS NOT NULL THEN
    -- Clear existing test tasks (optional - comment out if you want to keep them)
    -- DELETE FROM public.tasks WHERE title LIKE '[TEST]%';

    -- Insert 15 test tasks with various priorities
    INSERT INTO public.tasks (pool_id, created_by, title, description, priority, status, visibility, due_at, created_at, updated_at) VALUES
    -- Priority 5 (Urgent)
    (v_pool_id, v_user_id, '[TEST] Fix critical production bug', 'System is down, users cannot login', 5, 'open', 'household', NOW() + interval '2 hours', NOW(), NOW()),
    (v_pool_id, v_user_id, '[TEST] Review security vulnerability', 'CVE reported in main dependency', 5, 'open', 'household', NOW() + interval '4 hours', NOW(), NOW()),

    -- Priority 4 (High)
    (v_pool_id, v_user_id, '[TEST] Prepare quarterly presentation', 'Q4 results presentation for stakeholders', 4, 'open', 'work', NOW() + interval '1 day', NOW(), NOW()),
    (v_pool_id, v_user_id, '[TEST] Call insurance company', 'Discuss coverage options for home', 4, 'open', 'owner_only', NOW() + interval '6 hours', NOW(), NOW()),
    (v_pool_id, v_user_id, '[TEST] Submit expense report', 'Last month''s business expenses', 4, 'open', 'work', NOW() + interval '2 days', NOW(), NOW()),

    -- Priority 3 (Medium)
    (v_pool_id, v_user_id, '[TEST] Update project documentation', 'Add API examples and usage guides', 3, 'open', 'work', NOW() + interval '3 days', NOW(), NOW()),
    (v_pool_id, v_user_id, '[TEST] Schedule dentist appointment', 'Annual cleaning and checkup', 3, 'open', 'household', NOW() + interval '1 week', NOW(), NOW()),
    (v_pool_id, v_user_id, '[TEST] Research vacation destinations', 'Summer 2025 family trip options', 3, 'open', 'household', NOW() + interval '2 weeks', NOW(), NOW()),
    (v_pool_id, v_user_id, '[TEST] Order new office supplies', 'Pens, notebooks, sticky notes', 3, 'open', 'work', NOW() + interval '5 days', NOW(), NOW()),

    -- Priority 2 (Low)
    (v_pool_id, v_user_id, '[TEST] Organize photo library', 'Sort and tag photos from last year', 2, 'open', 'owner_only', NOW() + interval '3 weeks', NOW(), NOW()),
    (v_pool_id, v_user_id, '[TEST] Read technical book', 'Designing Data-Intensive Applications', 2, 'open', 'owner_only', NULL, NOW(), NOW()),
    (v_pool_id, v_user_id, '[TEST] Clean out garage', 'Donate unused items, organize tools', 2, 'open', 'household', NOW() + interval '4 weeks', NOW(), NOW()),

    -- Priority 1 (Someday)
    (v_pool_id, v_user_id, '[TEST] Learn new programming language', 'Try Rust or Go for a side project', 1, 'open', 'owner_only', NULL, NOW(), NOW()),
    (v_pool_id, v_user_id, '[TEST] Start meditation practice', 'Daily 10-minute meditation habit', 1, 'open', 'owner_only', NULL, NOW(), NOW()),
    (v_pool_id, v_user_id, '[TEST] Paint bedroom walls', 'Choose color and schedule painting', 1, 'open', 'household', NULL, NOW(), NOW());

    RAISE NOTICE 'Successfully created 15 test tasks for user % in pool %', v_user_id, v_pool_id;
  ELSE
    RAISE EXCEPTION 'Could not find user or pool. Please sign in first and create a pool.';
  END IF;
END $$;
