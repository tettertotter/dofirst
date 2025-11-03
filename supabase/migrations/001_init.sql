create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create table public.pools (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'My Pool',
  timezone text not null default 'America/New_York',
  created_at timestamptz not null default now()
);

create type public.member_role as enum ('owner','spouse','colleague','guest');

create table public.pool_members (
  id uuid primary key default gen_random_uuid(),
  pool_id uuid not null references public.pools(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.member_role not null,
  can_add boolean not null default true,
  created_at timestamptz not null default now(),
  unique(pool_id, user_id)
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  pool_id uuid not null references public.pools(id) on delete cascade,
  name text not null,
  is_core boolean not null default false,
  created_at timestamptz not null default now(),
  unique(pool_id, name)
);

create type public.task_status as enum ('open','in_progress','done','archived');
create type public.task_visibility as enum ('owner_only','household','work','public');

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  pool_id uuid not null references public.pools(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete set null,
  title text not null,
  description text,
  priority int not null default 3 check (priority between 1 and 5),
  status public.task_status not null default 'open',
  visibility public.task_visibility not null default 'owner_only',
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.task_tags (
  task_id uuid not null references public.tasks(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key(task_id, tag_id)
);

create type public.inbound_source as enum ('app','email','voice','api');

create table public.task_submissions (
  id uuid primary key default gen_random_uuid(),
  pool_id uuid not null references public.pools(id) on delete cascade,
  submitted_by uuid references auth.users(id) on delete set null,
  raw_text text not null,
  parsed jsonb not null default '{}'::jsonb,
  source public.inbound_source not null,
  status text not null default 'accepted',
  created_task_id uuid references public.tasks(id) on delete set null,
  created_at timestamptz not null default now()
);

create type public.proposal_status as enum ('proposed','accepted','declined','moved');

create table public.today_proposals (
  id uuid primary key default gen_random_uuid(),
  pool_id uuid not null references public.pools(id) on delete cascade,
  proposed_for uuid not null references auth.users(id) on delete cascade,
  proposed_by uuid not null references auth.users(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  date date not null,
  status public.proposal_status not null default 'proposed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.today_limits (
  id uuid primary key default gen_random_uuid(),
  pool_id uuid not null references public.pools(id) on delete cascade,
  delegator_id uuid not null references auth.users(id) on delete cascade,
  daily_limit int not null default 2,
  unique(pool_id, delegator_id)
);

create table public.email_aliases (
  id uuid primary key default gen_random_uuid(),
  pool_id uuid not null references public.pools(id) on delete cascade,
  alias_local text not null,
  provider text not null default 'mailgun',
  created_at timestamptz not null default now(),
  unique(provider, alias_local)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  sent_at timestamptz
);

alter table public.profiles enable row level security;
alter table public.pools enable row level security;
alter table public.pool_members enable row level security;
alter table public.tags enable row level security;
alter table public.tasks enable row level security;
alter table public.task_tags enable row level security;
alter table public.task_submissions enable row level security;
alter table public.today_proposals enable row level security;
alter table public.today_limits enable row level security;
alter table public.email_aliases enable row level security;
alter table public.notifications enable row level security;

create or replace function public.is_member(u uuid, p uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from public.pool_members m
    where m.user_id = u and m.pool_id = p
  );
$$;

create policy pools_owner_read on public.pools
for select using (auth.uid() = owner_id or public.is_member(auth.uid(), id));

create policy pools_owner_insert on public.pools
for insert with check (auth.uid() = owner_id);

create policy pool_members_read on public.pool_members
for select using (public.is_member(auth.uid(), pool_id));

create policy pool_members_modify on public.pool_members
for all using (auth.uid() in (select owner_id from public.pools where id = pool_id))
with check (auth.uid() in (select owner_id from public.pools where id = pool_id));

create policy tags_read on public.tags
for select using (public.is_member(auth.uid(), pool_id));

create policy tags_write on public.tags
for all using (auth.uid() in (select owner_id from public.pools where id = pool_id))
with check (auth.uid() in (select owner_id from public.pools where id = pool_id));

create policy tasks_read on public.tasks
for select using (
  public.is_member(auth.uid(), pool_id)
  and (
    visibility = 'public'
    or (visibility = 'owner_only' and auth.uid() = (select owner_id from public.pools where id = pool_id))
    or (visibility = 'household' and auth.uid() in (
          select user_id from public.pool_members where pool_id = public.tasks.pool_id and role in ('owner','spouse')
        ))
    or (visibility = 'work' and auth.uid() in (
          select user_id from public.pool_members where pool_id = public.tasks.pool_id and role in ('owner','colleague')
        ))
  )
);

create policy tasks_insert on public.tasks
for insert with check (
  public.is_member(auth.uid(), pool_id)
  and auth.uid() in (
    select user_id from public.pool_members where pool_id = public.tasks.pool_id and can_add = true
  )
);

create policy tasks_update on public.tasks
for update using (
  auth.uid() in (select owner_id from public.pools where id = pool_id)
  or (created_by = auth.uid() and status in ('open','in_progress'))
);

create policy proposals_read on public.today_proposals
for select using (
  public.is_member(auth.uid(), pool_id)
  and (
    auth.uid() = proposed_for
    or auth.uid() = proposed_by
    or (
      (select visibility from public.tasks t where t.id = public.today_proposals.task_id) = 'work'
      and auth.uid() in (
        select user_id from public.pool_members where pool_id = public.today_proposals.pool_id and role in ('owner','colleague')
      )
    )
  )
);

create policy proposals_write on public.today_proposals
for insert with check (
  public.is_member(auth.uid(), pool_id)
  and auth.uid() in (
    select user_id from public.pool_members where pool_id = public.today_proposals.pool_id and can_add = true
  )
);

create policy proposals_update on public.today_proposals
for update using (
  auth.uid() = proposed_for
  or auth.uid() = (select owner_id from public.pools where id = pool_id)
);

create policy limits_rw on public.today_limits
for all using (auth.uid() in (select owner_id from public.pools where id = pool_id))
with check (auth.uid() in (select owner_id from public.pools where id = pool_id));

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

create policy email_aliases_rw on public.email_aliases
for all using (auth.uid() in (select owner_id from public.pools where id = pool_id))
with check (auth.uid() in (select owner_id from public.pools where id = pool_id));

create policy notifications_rw on public.notifications
for all using (auth.uid() = user_id)
with check (auth.uid() = user_id);
