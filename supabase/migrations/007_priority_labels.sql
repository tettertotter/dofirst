-- Add custom priority labels per pool
-- Users can rename priorities like "Priority 3" to "Dad's Birthday" or "This Month"

create table public.priority_labels (
  id uuid primary key default gen_random_uuid(),
  pool_id uuid not null references public.pools(id) on delete cascade,
  priority_number int not null check (priority_number >= 1),
  label text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(pool_id, priority_number)
);

-- Enable RLS
alter table public.priority_labels enable row level security;

-- Pool members can read priority labels
create policy priority_labels_read on public.priority_labels
for select using (public.is_member(auth.uid(), pool_id));

-- Pool owners can manage priority labels
create policy priority_labels_write on public.priority_labels
for all using (auth.uid() in (select owner_id from public.pools where id = pool_id))
with check (auth.uid() in (select owner_id from public.pools where id = pool_id));

-- Create index for efficient lookups
create index priority_labels_pool_idx on public.priority_labels(pool_id, priority_number);

-- Insert default labels for priority 1 and 2 for existing pools
insert into public.priority_labels (pool_id, priority_number, label)
select id, 1, 'Today' from public.pools
on conflict (pool_id, priority_number) do nothing;

insert into public.priority_labels (pool_id, priority_number, label)
select id, 2, 'This Week' from public.pools
on conflict (pool_id, priority_number) do nothing;
