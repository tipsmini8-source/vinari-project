create table public.goals (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  wallet_id uuid references public.wallets (id),
  name text not null,
  target_amount numeric(18, 2) not null check (target_amount > 0),
  current_amount numeric(18, 2) not null default 0,
  target_date date,
  status text not null default 'active',
  icon text,
  color text,
  created_by uuid references public.profiles (id),
  updated_by uuid references public.profiles (id),
  deleted_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint goals_current_amount_check check (current_amount >= 0),
  constraint goals_status_check check (status in ('active', 'achieved', 'cancelled'))
);

create table public.goal_contributions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  goal_id uuid not null references public.goals (id) on delete cascade,
  wallet_id uuid references public.wallets (id),
  amount numeric(18, 2) not null check (amount > 0),
  contribution_date date not null,
  note text,
  created_by uuid references public.profiles (id),
  deleted_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index goals_workspace_id_idx on public.goals (workspace_id);
create index goals_status_idx on public.goals (status);
create index goal_contributions_workspace_id_idx on public.goal_contributions (workspace_id);
create index goal_contributions_goal_id_idx on public.goal_contributions (goal_id);
create index goal_contributions_contribution_date_idx on public.goal_contributions (contribution_date);

create trigger set_goals_updated_at
before update on public.goals
for each row execute function public.set_updated_at();

create or replace function public.apply_goal_contribution()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.goals
  set
    current_amount = current_amount + new.amount,
    status = case
      when current_amount + new.amount >= target_amount then 'achieved'
      else status
    end
  where id = new.goal_id
    and workspace_id = new.workspace_id
    and deleted_at is null;

  return new;
end;
$$;

create trigger apply_goal_contribution_after_insert
after insert on public.goal_contributions
for each row
when (new.deleted_at is null)
execute function public.apply_goal_contribution();

alter table public.goals enable row level security;
alter table public.goal_contributions enable row level security;

create policy "Active members can view goals"
on public.goals
for select
to authenticated
using (deleted_at is null and public.is_workspace_member(workspace_id));

create policy "Workspace editors can insert goals"
on public.goals
for insert
to authenticated
with check (deleted_at is null and public.can_edit_workspace(workspace_id));

create policy "Workspace editors can update goals"
on public.goals
for update
to authenticated
using (deleted_at is null and public.can_edit_workspace(workspace_id))
with check (public.can_edit_workspace(workspace_id));

create policy "Active members can view goal contributions"
on public.goal_contributions
for select
to authenticated
using (deleted_at is null and public.is_workspace_member(workspace_id));

create policy "Workspace editors can insert goal contributions"
on public.goal_contributions
for insert
to authenticated
with check (deleted_at is null and public.can_edit_workspace(workspace_id));

create policy "Workspace editors can update goal contributions"
on public.goal_contributions
for update
to authenticated
using (deleted_at is null and public.can_edit_workspace(workspace_id))
with check (public.can_edit_workspace(workspace_id));
