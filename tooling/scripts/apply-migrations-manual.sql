-- TodayPool Database Setup
-- Copy and paste this entire file into Supabase SQL Editor
-- Or run: psql -h db.xxxxx.supabase.co -U postgres -d postgres -f tooling/scripts/apply-migrations-manual.sql

\echo '======================================'
\echo 'TodayPool Database Setup'
\echo '======================================'
\echo ''

\echo 'Applying 001_init.sql...'
\i supabase/migrations/001_init.sql
\echo '✓ 001_init.sql applied'
\echo ''

\echo 'Applying 002_indexes.sql...'
\i supabase/migrations/002_indexes.sql
\echo '✓ 002_indexes.sql applied'
\echo ''

\echo '======================================'
\echo '✓ Migrations applied successfully!'
\echo '======================================'
\echo ''
\echo 'Next: Create your first user and pool'
\echo '  1. Sign in to web app at http://localhost:3000'
\echo '  2. Note your user ID from auth.users'
\echo '  3. Run tooling/scripts/create-first-pool.sql'
\echo ''
