-- Extend priority range from 1-5 to 1-10
-- Priority 1 = "Today", Priority 2 = "This Week", 3-10 = numbered priorities
-- NULL priority = "Unsorted"

-- Drop the existing check constraint
alter table public.tasks drop constraint if exists tasks_priority_check;

-- Add new check constraint for priority 1-10
alter table public.tasks add constraint tasks_priority_check check (priority between 1 and 10);

-- Allow NULL priority for "Unsorted" tasks
alter table public.tasks alter column priority drop not null;

-- Add sort_order field for sub-ordering within each priority level (e.g., 3.1, 3.2, 3.3)
alter table public.tasks add column if not exists sort_order int not null default 0;

-- Create index for efficient sorting by priority and sort_order
create index if not exists tasks_priority_sort_idx on public.tasks(pool_id, priority nulls last, sort_order, created_at desc);
