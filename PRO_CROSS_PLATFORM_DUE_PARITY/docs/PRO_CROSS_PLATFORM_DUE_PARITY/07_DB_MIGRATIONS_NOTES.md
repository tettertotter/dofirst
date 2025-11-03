# DB Migrations (additions)

-- Web Push subscriptions
create table if not exists public.web_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now(),
  unique(user_id, endpoint)
);
alter table public.web_push_subscriptions enable row level security;
create policy webpush_rw on public.web_push_subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Optional: recurrence rule on tasks
alter table public.tasks add column if not exists recurrence jsonb;  -- or rrule text
create index if not exists idx_tasks_recurrence on public.tasks using gin (recurrence);
