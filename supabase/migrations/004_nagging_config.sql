-- Nagging 2.0 Configuration
-- User-level settings for quiet hours and default cadence

-- User nagging preferences
create table if not exists public.nagging_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,

  -- Quiet hours (no audible notifications)
  -- Format: { start: "HH:MM", end: "HH:MM" }
  -- Example: { "start": "22:00", "end": "07:00" } for 10pm - 7am
  quiet_hours jsonb,

  -- Default cadence for all tasks
  -- Format: { firstAfterMin: 5, stepMinutes: [10,10,10,15,15], repeatAfter: 15 }
  -- Null uses system default (Due's cadence)
  default_cadence jsonb,

  -- Whether nagging is enabled globally for this user
  enabled boolean not null default true,

  -- Last time nagging configuration was updated
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.nagging_preferences enable row level security;

-- Users can manage their own preferences
create policy nagging_prefs_rw on public.nagging_preferences
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Index for efficient lookups
create index if not exists idx_nagging_prefs_user on public.nagging_preferences(user_id);

-- Function to get or create user nagging preferences
create or replace function public.get_nagging_preferences(p_user_id uuid)
returns table (
  user_id uuid,
  quiet_hours jsonb,
  default_cadence jsonb,
  enabled boolean
) as $$
begin
  -- Insert default preferences if not exists
  insert into public.nagging_preferences (user_id, quiet_hours, default_cadence, enabled)
  values (p_user_id, '{"start":"22:00","end":"07:00"}'::jsonb, null, true)
  on conflict (user_id) do nothing;

  -- Return preferences
  return query
  select
    np.user_id,
    np.quiet_hours,
    np.default_cadence,
    np.enabled
  from public.nagging_preferences np
  where np.user_id = p_user_id;
end;
$$ language plpgsql security definer;

-- Task-level nagging tracking
-- Tracks nagging state for each task (which step we're on, last notification time, etc.)
create table if not exists public.task_nagging_state (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade unique,

  -- Current step index in cadence (0-based)
  -- Used for healing: resume from this step after app termination
  step_index integer not null default 0,

  -- Last notification time
  -- Used to detect missed notifications
  last_notified_at timestamptz,

  -- Next scheduled notification times (up to 3)
  -- Stored for reference and healing
  scheduled_times jsonb, -- array of ISO 8601 timestamps

  -- Whether nagging is paused for this specific task
  paused boolean not null default false,

  -- Number of notifications sent for this task
  notification_count integer not null default 0,

  -- Metadata for debugging
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.task_nagging_state enable row level security;

-- Users can manage nagging state for tasks in their pools
create policy task_nagging_state_rw on public.task_nagging_state
  for all using (
    exists (
      select 1 from public.tasks t
      join public.pool_members pm on pm.pool_id = t.pool_id
      where t.id = task_nagging_state.task_id
        and pm.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.tasks t
      join public.pool_members pm on pm.pool_id = t.pool_id
      where t.id = task_nagging_state.task_id
        and pm.user_id = auth.uid()
    )
  );

-- Index for efficient lookups
create index if not exists idx_task_nagging_state_task on public.task_nagging_state(task_id);
create index if not exists idx_task_nagging_state_last_notified on public.task_nagging_state(last_notified_at) where last_notified_at is not null;

-- Function to update nagging state after notification
create or replace function public.update_nagging_state_after_notification(
  p_task_id uuid,
  p_new_times jsonb -- array of next 3 notification times
)
returns void as $$
begin
  insert into public.task_nagging_state (task_id, step_index, last_notified_at, scheduled_times, notification_count)
  values (
    p_task_id,
    1, -- increment from 0
    now(),
    p_new_times,
    1
  )
  on conflict (task_id) do update set
    step_index = task_nagging_state.step_index + 1,
    last_notified_at = now(),
    scheduled_times = p_new_times,
    notification_count = task_nagging_state.notification_count + 1,
    updated_at = now();
end;
$$ language plpgsql security definer;

-- Function to reset nagging state (e.g., after snooze or complete)
create or replace function public.reset_nagging_state(p_task_id uuid)
returns void as $$
begin
  delete from public.task_nagging_state where task_id = p_task_id;
end;
$$ language plpgsql security definer;

-- Comments for clarity
comment on table public.nagging_preferences is 'User-level nagging configuration (quiet hours, default cadence)';
comment on table public.task_nagging_state is 'Per-task nagging state tracking for healing and analytics';
comment on column public.nagging_preferences.quiet_hours is 'No audible notifications during these hours (silent/badge only)';
comment on column public.nagging_preferences.default_cadence is 'Default auto-snooze cadence for all tasks (null = use system default)';
comment on column public.task_nagging_state.step_index is 'Current position in cadence array (for healing after app termination)';
comment on column public.task_nagging_state.scheduled_times is 'Next 3 scheduled notification times (for reference and healing)';
