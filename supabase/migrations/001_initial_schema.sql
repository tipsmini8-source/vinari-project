create extension if not exists pgcrypto;

create type public.workspace_role as enum ('owner', 'partner', 'member', 'viewer');
create type public.category_type as enum ('income', 'expense');
create type public.transaction_type as enum ('income', 'expense', 'transfer', 'adjustment');
create type public.financial_effect as enum (
  'income',
  'expense',
  'transfer',
  'debt',
  'goal',
  'adjustment',
  'system'
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  timezone text not null default 'Asia/Jakarta',
  locale text not null default 'id-ID',
  currency_code text not null default 'IDR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references public.profiles (id) on delete restrict,
  currency_code text not null default 'IDR',
  is_archived boolean not null default false,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  deleted_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.workspace_role not null default 'viewer',
  status text not null default 'active',
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  deleted_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);

create table public.wallets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  name text not null,
  wallet_type text not null default 'other',
  initial_balance numeric(18, 2) not null default 0,
  opening_balance_date date,
  currency_code text not null default 'IDR',
  icon text,
  color text,
  sort_order integer not null default 0,
  is_archived boolean not null default false,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  deleted_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, workspace_id)
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  name text not null,
  type public.category_type not null,
  icon text,
  color text,
  sort_order integer not null default 0,
  is_archived boolean not null default false,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  deleted_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, workspace_id),
  unique (workspace_id, type, name)
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  wallet_id uuid,
  destination_wallet_id uuid,
  category_id uuid,
  type public.transaction_type not null,
  financial_effect public.financial_effect not null,
  title text not null,
  amount numeric(18, 2) not null check (amount > 0),
  transaction_date date not null,
  note text,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  deleted_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (wallet_id, workspace_id) references public.wallets (id, workspace_id) on delete restrict,
  foreign key (destination_wallet_id, workspace_id) references public.wallets (id, workspace_id) on delete restrict,
  foreign key (category_id, workspace_id) references public.categories (id, workspace_id) on delete restrict,
  constraint transactions_income_expense_wallet_check check (
    type not in ('income', 'expense') or wallet_id is not null
  ),
  constraint transactions_transfer_wallet_check check (
    type <> 'transfer'
    or (
      wallet_id is not null
      and destination_wallet_id is not null
      and wallet_id <> destination_wallet_id
    )
  ),
  constraint transactions_non_transfer_destination_check check (
    type = 'transfer' or destination_wallet_id is null
  )
);

create table public.financial_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  event_type text not null,
  entity_type text not null,
  entity_id uuid,
  payload jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index workspaces_owner_id_idx on public.workspaces (owner_id);
create index workspace_members_workspace_id_user_id_idx on public.workspace_members (workspace_id, user_id);
create index workspace_members_user_id_idx on public.workspace_members (user_id);
create index wallets_workspace_id_idx on public.wallets (workspace_id);
create index categories_workspace_id_idx on public.categories (workspace_id);
create index categories_workspace_id_type_idx on public.categories (workspace_id, type);
create index transactions_workspace_id_transaction_date_idx on public.transactions (workspace_id, transaction_date);
create index transactions_wallet_id_idx on public.transactions (wallet_id);
create index transactions_category_id_idx on public.transactions (category_id);
create index financial_events_workspace_id_created_at_idx on public.financial_events (workspace_id, created_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, metadata)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    '{}'::jsonb
  );

  return new;
end;
$$;

create or replace function public.is_workspace_member(workspace_uuid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = workspace_uuid
      and wm.user_id = auth.uid()
      and wm.status = 'active'
      and wm.deleted_at is null
  );
$$;

create or replace function public.is_workspace_owner(workspace_uuid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.workspaces w
    where w.id = workspace_uuid
      and w.owner_id = auth.uid()
      and w.deleted_at is null
  )
  or exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = workspace_uuid
      and wm.user_id = auth.uid()
      and wm.role = 'owner'
      and wm.status = 'active'
      and wm.deleted_at is null
  );
$$;

create or replace function public.can_edit_workspace(workspace_uuid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.is_workspace_owner(workspace_uuid)
  or exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = workspace_uuid
      and wm.user_id = auth.uid()
      and wm.role in ('partner', 'member')
      and wm.status = 'active'
      and wm.deleted_at is null
  );
$$;

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger set_workspaces_updated_at
before update on public.workspaces
for each row execute function public.set_updated_at();

create trigger set_workspace_members_updated_at
before update on public.workspace_members
for each row execute function public.set_updated_at();

create trigger set_wallets_updated_at
before update on public.wallets
for each row execute function public.set_updated_at();

create trigger set_categories_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

create trigger set_transactions_updated_at
before update on public.transactions
for each row execute function public.set_updated_at();

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.wallets enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.financial_events enable row level security;

create policy "Users can view their own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid());

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "Active members can view workspaces"
on public.workspaces
for select
to authenticated
using (deleted_at is null and public.is_workspace_member(id));

create policy "Users can create owned workspaces"
on public.workspaces
for insert
to authenticated
with check (owner_id = auth.uid());

create policy "Workspace owners can update workspaces"
on public.workspaces
for update
to authenticated
using (deleted_at is null and public.is_workspace_owner(id))
with check (public.is_workspace_owner(id));

create policy "Active members can view workspace memberships"
on public.workspace_members
for select
to authenticated
using (deleted_at is null and public.is_workspace_member(workspace_id));

create policy "Workspace owners can insert workspace memberships"
on public.workspace_members
for insert
to authenticated
with check (
  status = 'active'
  and public.is_workspace_owner(workspace_id)
);

create policy "Workspace owners can update workspace memberships"
on public.workspace_members
for update
to authenticated
using (deleted_at is null and public.is_workspace_owner(workspace_id))
with check (public.is_workspace_owner(workspace_id));

create policy "Active members can view wallets"
on public.wallets
for select
to authenticated
using (deleted_at is null and public.is_workspace_member(workspace_id));

create policy "Workspace editors can insert wallets"
on public.wallets
for insert
to authenticated
with check (deleted_at is null and public.can_edit_workspace(workspace_id));

create policy "Workspace editors can update wallets"
on public.wallets
for update
to authenticated
using (deleted_at is null and public.can_edit_workspace(workspace_id))
with check (public.can_edit_workspace(workspace_id));

create policy "Active members can view categories"
on public.categories
for select
to authenticated
using (deleted_at is null and public.is_workspace_member(workspace_id));

create policy "Workspace editors can insert categories"
on public.categories
for insert
to authenticated
with check (deleted_at is null and public.can_edit_workspace(workspace_id));

create policy "Workspace editors can update categories"
on public.categories
for update
to authenticated
using (deleted_at is null and public.can_edit_workspace(workspace_id))
with check (public.can_edit_workspace(workspace_id));

create policy "Active members can view transactions"
on public.transactions
for select
to authenticated
using (deleted_at is null and public.is_workspace_member(workspace_id));

create policy "Workspace editors can insert transactions"
on public.transactions
for insert
to authenticated
with check (deleted_at is null and public.can_edit_workspace(workspace_id));

create policy "Workspace editors can update transactions"
on public.transactions
for update
to authenticated
using (deleted_at is null and public.can_edit_workspace(workspace_id))
with check (public.can_edit_workspace(workspace_id));

create policy "Active members can view financial events"
on public.financial_events
for select
to authenticated
using (public.is_workspace_member(workspace_id));

create policy "Workspace editors can insert financial events"
on public.financial_events
for insert
to authenticated
with check (public.can_edit_workspace(workspace_id));
