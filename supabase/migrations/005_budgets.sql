create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  category_id uuid not null references public.categories (id),
  name text not null,
  amount numeric(18, 2) not null check (amount > 0),
  period text not null default 'monthly',
  start_date date not null,
  end_date date not null,
  alert_percentage integer not null default 80,
  is_active boolean not null default true,
  created_by uuid references public.profiles (id),
  updated_by uuid references public.profiles (id),
  deleted_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint budgets_date_range_check check (end_date >= start_date),
  constraint budgets_alert_percentage_check check (alert_percentage between 1 and 100)
);

create index budgets_workspace_id_idx on public.budgets (workspace_id);
create index budgets_category_id_idx on public.budgets (category_id);
create index budgets_start_date_end_date_idx on public.budgets (start_date, end_date);

create trigger set_budgets_updated_at
before update on public.budgets
for each row execute function public.set_updated_at();

alter table public.budgets enable row level security;

create policy "Active members can view budgets"
on public.budgets
for select
to authenticated
using (deleted_at is null and public.is_workspace_member(workspace_id));

create policy "Workspace editors can insert budgets"
on public.budgets
for insert
to authenticated
with check (deleted_at is null and public.can_edit_workspace(workspace_id));

create policy "Workspace editors can update budgets"
on public.budgets
for update
to authenticated
using (deleted_at is null and public.can_edit_workspace(workspace_id))
with check (public.can_edit_workspace(workspace_id));
