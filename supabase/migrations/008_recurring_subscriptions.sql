create table public.recurring_transactions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  wallet_id uuid references public.wallets (id),
  category_id uuid references public.categories (id),
  type transaction_type not null,
  financial_effect financial_effect not null,
  title text not null,
  amount numeric(18, 2) not null check (amount > 0),
  frequency text not null default 'monthly',
  start_date date not null,
  end_date date,
  next_run_date date not null,
  is_active boolean not null default true,
  note text,
  created_by uuid references public.profiles (id),
  updated_by uuid references public.profiles (id),
  deleted_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint recurring_transactions_frequency_check check (frequency in ('daily', 'weekly', 'monthly', 'yearly')),
  constraint recurring_transactions_type_check check (type in ('income', 'expense')),
  constraint recurring_transactions_date_range_check check (end_date is null or end_date >= start_date),
  constraint recurring_transactions_next_run_date_check check (next_run_date >= start_date),
  constraint recurring_transactions_income_expense_refs_check check (wallet_id is not null and category_id is not null)
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  wallet_id uuid references public.wallets (id),
  category_id uuid references public.categories (id),
  name text not null,
  amount numeric(18, 2) not null check (amount > 0),
  billing_cycle text not null default 'monthly',
  next_due_date date not null,
  is_active boolean not null default true,
  note text,
  created_by uuid references public.profiles (id),
  updated_by uuid references public.profiles (id),
  deleted_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subscriptions_billing_cycle_check check (billing_cycle in ('daily', 'weekly', 'monthly', 'yearly'))
);

create index recurring_transactions_workspace_id_idx on public.recurring_transactions (workspace_id);
create index recurring_transactions_next_run_date_idx on public.recurring_transactions (next_run_date);
create index subscriptions_workspace_id_idx on public.subscriptions (workspace_id);
create index subscriptions_next_due_date_idx on public.subscriptions (next_due_date);

create trigger set_recurring_transactions_updated_at
before update on public.recurring_transactions
for each row execute function public.set_updated_at();

create trigger set_subscriptions_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();

alter table public.recurring_transactions enable row level security;
alter table public.subscriptions enable row level security;

create policy "Active members can view recurring transactions"
on public.recurring_transactions
for select
to authenticated
using (deleted_at is null and public.is_workspace_member(workspace_id));

create policy "Workspace editors can insert recurring transactions"
on public.recurring_transactions
for insert
to authenticated
with check (deleted_at is null and public.can_edit_workspace(workspace_id));

create policy "Workspace editors can update recurring transactions"
on public.recurring_transactions
for update
to authenticated
using (deleted_at is null and public.can_edit_workspace(workspace_id))
with check (public.can_edit_workspace(workspace_id));

create policy "Active members can view subscriptions"
on public.subscriptions
for select
to authenticated
using (deleted_at is null and public.is_workspace_member(workspace_id));

create policy "Workspace editors can insert subscriptions"
on public.subscriptions
for insert
to authenticated
with check (deleted_at is null and public.can_edit_workspace(workspace_id));

create policy "Workspace editors can update subscriptions"
on public.subscriptions
for update
to authenticated
using (deleted_at is null and public.can_edit_workspace(workspace_id))
with check (public.can_edit_workspace(workspace_id));
