-- Add timestamp-based due_at for precise nagging & snooze (date-only is not enough)
alter table public.tasks add column if not exists due_at timestamptz;
-- Keep due_date nullable for compatibility, but prefer due_at going forward.
create index if not exists idx_tasks_created_by_due_at on public.tasks(created_by, due_at);
create index if not exists idx_tasks_pool_due_at on public.tasks(pool_id, due_at);
