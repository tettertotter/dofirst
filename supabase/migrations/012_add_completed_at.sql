-- Add completed_at column to tasks table
-- This tracks when a task was marked as completed

alter table public.tasks add column completed_at timestamptz;

-- Add index for performance when querying completed tasks
create index tasks_completed_at_idx on public.tasks(completed_at) where completed_at is not null;

-- Optionally: Backfill completed_at for tasks that are already marked as done
-- Using updated_at as a fallback timestamp for existing done tasks
update public.tasks
set completed_at = updated_at
where status = 'done' and completed_at is null;
