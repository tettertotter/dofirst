-- Performance indexes for common queries
-- Tasks by pool and status for listing views
create index if not exists idx_tasks_pool_status on public.tasks(pool_id, status);
-- Tasks by pool and creator for "added by" filters
create index if not exists idx_tasks_pool_creator on public.tasks(pool_id, created_by);
-- Task tags for filtering by tag
create index if not exists idx_task_tags_tag on public.task_tags(tag_id);
create index if not exists idx_task_tags_task on public.task_tags(task_id);
-- Today proposals for quota checks and listing
create index if not exists idx_proposals_composite on public.today_proposals(pool_id, date, status, proposed_by);
create index if not exists idx_proposals_for_user on public.today_proposals(proposed_for, date, status);
