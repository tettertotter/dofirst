-- Fix RLS circular reference issues
-- The is_member() function was causing infinite recursion because it queries pool_members
-- which has RLS enabled that calls is_member() again

-- Drop ALL policies that depend on is_member() function
drop policy if exists pools_owner_read on public.pools;
drop policy if exists pool_members_read on public.pool_members;
drop policy if exists pool_members_modify on public.pool_members;
drop policy if exists tags_read on public.tags;
drop policy if exists tasks_read on public.tasks;
drop policy if exists tasks_insert on public.tasks;
drop policy if exists tasks_update on public.tasks;
drop policy if exists proposals_read on public.today_proposals;
drop policy if exists proposals_write on public.today_proposals;
drop policy if exists submissions_read on public.task_submissions;
drop policy if exists submissions_insert on public.task_submissions;
drop policy if exists priority_labels_read on public.priority_labels;
drop policy if exists today_limits_read on public.today_limits;

-- Now we can safely drop and recreate is_member as SECURITY DEFINER
drop function if exists public.is_member(uuid, uuid);
create or replace function public.is_member(u uuid, p uuid)
returns boolean
language sql
stable
security definer  -- This bypasses RLS
as $$
  select exists (
    select 1 from public.pool_members m
    where m.user_id = u and m.pool_id = p
  );
$$;

-- Recreate pools_owner_read policy
create policy pools_owner_read on public.pools
for select using (auth.uid() = owner_id or public.is_member(auth.uid(), id));

-- Recreate pool_members policies without circular reference
create policy pool_members_read on public.pool_members
for select using (
  user_id = auth.uid()  -- Users can see their own memberships
  or pool_id in (select id from public.pools where owner_id = auth.uid())  -- Pool owners can see all members
);

create policy pool_members_modify on public.pool_members
for all using (
  pool_id in (select id from public.pools where owner_id = auth.uid())
)
with check (
  pool_id in (select id from public.pools where owner_id = auth.uid())
);

-- Recreate tags_read policy
create policy tags_read on public.tags
for select using (public.is_member(auth.uid(), pool_id));

-- Recreate tasks policies (now safe because is_member is SECURITY DEFINER)
create policy tasks_read on public.tasks
for select using (
  public.is_member(auth.uid(), pool_id)
  and (
    visibility = 'public'
    or (visibility = 'owner_only' and auth.uid() = (select owner_id from public.pools where id = pool_id))
    or (visibility = 'household' and exists (
          select 1 from public.pool_members where pool_id = public.tasks.pool_id
          and user_id = auth.uid() and role in ('owner','spouse')
        ))
    or (visibility = 'work' and exists (
          select 1 from public.pool_members where pool_id = public.tasks.pool_id
          and user_id = auth.uid() and role in ('owner','colleague')
        ))
  )
);

create policy tasks_insert on public.tasks
for insert with check (
  public.is_member(auth.uid(), pool_id)
  and exists (
    select 1 from public.pool_members
    where pool_id = public.tasks.pool_id
    and user_id = auth.uid()
    and can_add = true
  )
);

create policy tasks_update on public.tasks
for update using (
  auth.uid() in (select owner_id from public.pools where id = pool_id)
  or (created_by = auth.uid() and status in ('open','in_progress'))
);

-- Recreate proposals policies
create policy proposals_read on public.today_proposals
for select using (
  public.is_member(auth.uid(), pool_id)
  and (
    auth.uid() = proposed_for
    or auth.uid() = proposed_by
    or (
      (select visibility from public.tasks t where t.id = public.today_proposals.task_id) = 'work'
      and exists (
        select 1 from public.pool_members
        where pool_id = public.today_proposals.pool_id
        and user_id = auth.uid()
        and role in ('owner','colleague')
      )
    )
  )
);

create policy proposals_write on public.today_proposals
for insert with check (
  public.is_member(auth.uid(), pool_id)
  and exists (
    select 1 from public.pool_members
    where pool_id = public.today_proposals.pool_id
    and user_id = auth.uid()
    and can_add = true
  )
);

-- Recreate submissions policies
create policy submissions_read on public.task_submissions
for select using (
  public.is_member(auth.uid(), pool_id)
  and (
    submitted_by = auth.uid()
    or auth.uid() = (select owner_id from public.pools where id = pool_id)
  )
);

create policy submissions_insert on public.task_submissions
for insert with check (public.is_member(auth.uid(), pool_id));

-- Recreate priority_labels_read policy
create policy priority_labels_read on public.priority_labels
for select using (public.is_member(auth.uid(), pool_id));

-- Recreate today_limits_read policy
create policy today_limits_read on public.today_limits
for select using (
  auth.uid() = owner_id
  or auth.uid() = delegate_id
  or public.is_member(auth.uid(), pool_id)
);
