create table public.plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  price_monthly numeric(18, 2) default 0,
  price_yearly numeric(18, 2) default 0,
  max_workspaces integer,
  max_members integer,
  max_wallets integer,
  max_transactions_per_month integer,
  features jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspace_subscriptions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  plan_code text not null default 'free' references public.plans (code),
  status text not null default 'active',
  started_at timestamptz not null default now(),
  expired_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id),
  constraint workspace_subscriptions_status_check check (status in ('active', 'pending', 'expired', 'cancelled'))
);

create table public.payment_requests (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  plan_code text not null references public.plans (code),
  amount numeric(18, 2) not null check (amount >= 0),
  method text,
  proof_url text,
  status text not null default 'pending',
  note text,
  approved_by uuid references public.profiles (id),
  approved_at timestamptz,
  rejected_reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payment_requests_status_check check (status in ('pending', 'approved', 'rejected', 'cancelled'))
);

create index workspace_subscriptions_workspace_id_idx on public.workspace_subscriptions (workspace_id);
create index workspace_subscriptions_plan_code_idx on public.workspace_subscriptions (plan_code);
create index payment_requests_workspace_id_idx on public.payment_requests (workspace_id);
create index payment_requests_user_id_idx on public.payment_requests (user_id);
create index payment_requests_status_idx on public.payment_requests (status);

create trigger set_plans_updated_at
before update on public.plans
for each row execute function public.set_updated_at();

create trigger set_workspace_subscriptions_updated_at
before update on public.workspace_subscriptions
for each row execute function public.set_updated_at();

create trigger set_payment_requests_updated_at
before update on public.payment_requests
for each row execute function public.set_updated_at();

insert into public.plans (
  code,
  name,
  description,
  price_monthly,
  price_yearly,
  max_workspaces,
  max_members,
  max_wallets,
  max_transactions_per_month,
  features
)
values
  (
    'free',
    'Free',
    'Paket dasar untuk mulai mencatat keuangan pribadi.',
    0,
    0,
    1,
    1,
    3,
    100,
    '{"export": false, "ai_insight": false, "family_workspace": false, "advanced_report": false}'::jsonb
  ),
  (
    'premium_personal',
    'Premium Personal',
    'Paket premium untuk pengguna personal dengan kebutuhan lebih luas.',
    29000,
    290000,
    3,
    1,
    null,
    null,
    '{"export": true, "ai_insight": true, "family_workspace": false, "advanced_report": true}'::jsonb
  ),
  (
    'premium_family',
    'Premium Family',
    'Paket premium untuk workspace keluarga dan kolaborasi kecil.',
    49000,
    490000,
    5,
    5,
    null,
    null,
    '{"export": true, "ai_insight": true, "family_workspace": true, "advanced_report": true}'::jsonb
  )
on conflict (code) do update
set
  name = excluded.name,
  description = excluded.description,
  price_monthly = excluded.price_monthly,
  price_yearly = excluded.price_yearly,
  max_workspaces = excluded.max_workspaces,
  max_members = excluded.max_members,
  max_wallets = excluded.max_wallets,
  max_transactions_per_month = excluded.max_transactions_per_month,
  features = excluded.features,
  is_active = true;

insert into public.workspace_subscriptions (workspace_id, plan_code, status)
select id, 'free', 'active'
from public.workspaces
where deleted_at is null
on conflict (workspace_id) do nothing;

create or replace function public.ensure_free_workspace_subscription()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.workspace_subscriptions (workspace_id, plan_code, status)
  values (new.id, 'free', 'active')
  on conflict (workspace_id) do nothing;

  return new;
end;
$$;

create trigger ensure_free_workspace_subscription_on_workspace_created
after insert on public.workspaces
for each row execute function public.ensure_free_workspace_subscription();

alter table public.plans enable row level security;
alter table public.workspace_subscriptions enable row level security;
alter table public.payment_requests enable row level security;

create policy "Authenticated users can view active plans"
on public.plans
for select
to authenticated
using (is_active = true);

create policy "Active members can view workspace subscriptions"
on public.workspace_subscriptions
for select
to authenticated
using (public.is_workspace_member(workspace_id));

create policy "Workspace owners can update workspace subscriptions"
on public.workspace_subscriptions
for update
to authenticated
using (public.is_workspace_owner(workspace_id))
with check (public.is_workspace_owner(workspace_id));

create policy "Active members can view payment requests"
on public.payment_requests
for select
to authenticated
using (public.is_workspace_member(workspace_id));

create policy "Workspace editors can insert payment requests"
on public.payment_requests
for insert
to authenticated
with check (
  user_id = auth.uid()
  and public.is_workspace_member(workspace_id)
  and public.can_edit_workspace(workspace_id)
);
