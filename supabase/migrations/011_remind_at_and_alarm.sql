-- Add remind_at for Gmail-style "remind me" snooze functionality
-- Add alarm_enabled for mobile alarm notifications
alter table public.tasks add column if not exists remind_at timestamptz;
alter table public.tasks add column if not exists alarm_enabled boolean default false;

-- Index for efficiently finding tasks with upcoming reminders
create index if not exists idx_tasks_remind_at on public.tasks(remind_at) where remind_at is not null;

-- Index for finding snoozed tasks by pool
create index if not exists idx_tasks_pool_remind_at on public.tasks(pool_id, remind_at) where remind_at is not null;
