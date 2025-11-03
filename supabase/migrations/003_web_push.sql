-- Web Push Subscriptions Table
-- Stores browser push notification subscriptions for web clients

create table if not exists public.web_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now(),
  unique(user_id, endpoint)
);

-- Enable RLS
alter table public.web_push_subscriptions enable row level security;

-- Users can manage their own subscriptions
create policy webpush_rw on public.web_push_subscriptions
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Index for efficient lookups
create index if not exists idx_webpush_user on public.web_push_subscriptions(user_id);

-- Add columns to tasks for scheduling and nagging
alter table public.tasks add column if not exists due_at timestamptz;
alter table public.tasks add column if not exists snooze_cadence jsonb; -- { firstAfterMin, stepMinutes[], repeatAfter }
alter table public.tasks add column if not exists recurrence jsonb; -- { freq, interval, byweekday, bymonthday }

-- Indexes for notification scheduling queries
create index if not exists idx_tasks_due_at on public.tasks(due_at) where due_at is not null;
create index if not exists idx_tasks_recurrence on public.tasks using gin (recurrence) where recurrence is not null;

-- Comments for clarity
comment on table public.web_push_subscriptions is 'Browser push notification subscriptions for Web clients';
comment on column public.tasks.due_at is 'Exact due date/time for notifications and nagging';
comment on column public.tasks.snooze_cadence is 'Auto-snooze configuration (Nagging 2.0)';
comment on column public.tasks.recurrence is 'Recurrence rule (Daily, Weekly, Monthly, Yearly)';
