create table public.debts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  name text not null,
  lender_name text,
  principal_amount numeric(18, 2) not null check (principal_amount > 0),
  remaining_amount numeric(18, 2) not null check (remaining_amount >= 0),
  installment_amount numeric(18, 2),
  interest_rate numeric(8, 4) default 0,
  due_date date,
  start_date date,
  end_date date,
  status text not null default 'active',
  note text,
  created_by uuid references public.profiles (id),
  updated_by uuid references public.profiles (id),
  deleted_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint debts_status_check check (status in ('active', 'paid', 'cancelled')),
  constraint debts_installment_amount_check check (installment_amount is null or installment_amount > 0),
  constraint debts_interest_rate_check check (interest_rate is null or interest_rate >= 0),
  constraint debts_date_range_check check (end_date is null or start_date is null or end_date >= start_date)
);

create table public.debt_payments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  debt_id uuid not null references public.debts (id) on delete cascade,
  wallet_id uuid references public.wallets (id),
  amount numeric(18, 2) not null check (amount > 0),
  payment_date date not null,
  note text,
  created_by uuid references public.profiles (id),
  deleted_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index debts_workspace_id_idx on public.debts (workspace_id);
create index debts_status_idx on public.debts (status);
create index debts_due_date_idx on public.debts (due_date);
create index debt_payments_workspace_id_idx on public.debt_payments (workspace_id);
create index debt_payments_debt_id_idx on public.debt_payments (debt_id);
create index debt_payments_payment_date_idx on public.debt_payments (payment_date);

create trigger set_debts_updated_at
before update on public.debts
for each row execute function public.set_updated_at();

create or replace function public.apply_debt_payment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  current_remaining numeric(18, 2);
  next_remaining numeric(18, 2);
begin
  select remaining_amount
  into current_remaining
  from public.debts
  where id = new.debt_id
    and workspace_id = new.workspace_id
    and deleted_at is null
  for update;

  if current_remaining is null then
    raise exception 'Debt tidak ditemukan.';
  end if;

  if new.amount > current_remaining then
    raise exception 'Pembayaran tidak boleh lebih besar dari sisa hutang.';
  end if;

  next_remaining = current_remaining - new.amount;

  update public.debts
  set
    remaining_amount = next_remaining,
    status = case
      when next_remaining <= 0 then 'paid'
      else status
    end
  where id = new.debt_id
    and workspace_id = new.workspace_id
    and deleted_at is null;

  return new;
end;
$$;

create trigger apply_debt_payment_after_insert
after insert on public.debt_payments
for each row
when (new.deleted_at is null)
execute function public.apply_debt_payment();

alter table public.debts enable row level security;
alter table public.debt_payments enable row level security;

create policy "Active members can view debts"
on public.debts
for select
to authenticated
using (deleted_at is null and public.is_workspace_member(workspace_id));

create policy "Workspace editors can insert debts"
on public.debts
for insert
to authenticated
with check (deleted_at is null and public.can_edit_workspace(workspace_id));

create policy "Workspace editors can update debts"
on public.debts
for update
to authenticated
using (deleted_at is null and public.can_edit_workspace(workspace_id))
with check (public.can_edit_workspace(workspace_id));

create policy "Active members can view debt payments"
on public.debt_payments
for select
to authenticated
using (deleted_at is null and public.is_workspace_member(workspace_id));

create policy "Workspace editors can insert debt payments"
on public.debt_payments
for insert
to authenticated
with check (deleted_at is null and public.can_edit_workspace(workspace_id));

create policy "Workspace editors can update debt payments"
on public.debt_payments
for update
to authenticated
using (deleted_at is null and public.can_edit_workspace(workspace_id))
with check (public.can_edit_workspace(workspace_id));
