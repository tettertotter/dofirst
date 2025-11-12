-- Update today_limits to be per-person configurable
-- Each user controls how many tasks each pool member can add to THEIR Today list

-- Drop the old table and recreate with new structure
drop table if exists public.today_limits cascade;

create table public.today_limits (
  id uuid primary key default gen_random_uuid(),
  pool_id uuid not null references public.pools(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  delegate_id uuid not null references auth.users(id) on delete cascade,
  today_limit int check (today_limit >= 0),
  -- NULL = unlimited
  -- 0 = cannot add to Today list (can only add to Unsorted)
  -- 1+ = specific limit
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(pool_id, owner_id, delegate_id)
);

-- Enable RLS
alter table public.today_limits enable row level security;

-- Users can read limits for their own Today list or limits they have for others
create policy today_limits_read on public.today_limits
for select using (
  auth.uid() = owner_id
  or auth.uid() = delegate_id
  or public.is_member(auth.uid(), pool_id)
);

-- Users can only manage limits for their own Today list
create policy today_limits_write on public.today_limits
for all using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

-- Create index for efficient lookups
create index today_limits_owner_delegate_idx on public.today_limits(pool_id, owner_id, delegate_id);

-- Add default limits for existing pool members (1 task limit)
-- For each pool member, create limits from all other pool members
insert into public.today_limits (pool_id, owner_id, delegate_id, today_limit)
select
  pm1.pool_id,
  pm1.user_id as owner_id,
  pm2.user_id as delegate_id,
  1 as today_limit
from public.pool_members pm1
cross join public.pool_members pm2
where pm1.pool_id = pm2.pool_id
  and pm1.user_id != pm2.user_id  -- Don't create limit for self
on conflict (pool_id, owner_id, delegate_id) do nothing;
