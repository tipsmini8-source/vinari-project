alter table public.profiles
add column if not exists is_admin boolean not null default false;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.is_admin = true
  );
$$;

create or replace function public.approve_payment_request(payment_request_uuid uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_request public.payment_requests%rowtype;
begin
  if not public.is_admin() then
    raise exception 'Only admins can approve payment requests.';
  end if;

  select *
  into selected_request
  from public.payment_requests
  where id = payment_request_uuid
  for update;

  if not found then
    raise exception 'Payment request not found.';
  end if;

  update public.payment_requests
  set
    status = 'approved',
    approved_by = auth.uid(),
    approved_at = now(),
    rejected_reason = null
  where id = payment_request_uuid;

  insert into public.workspace_subscriptions (
    workspace_id,
    plan_code,
    status,
    started_at,
    expired_at
  )
  values (
    selected_request.workspace_id,
    selected_request.plan_code,
    'active',
    now(),
    now() + interval '30 days'
  )
  on conflict (workspace_id) do update
  set
    plan_code = excluded.plan_code,
    status = excluded.status,
    started_at = excluded.started_at,
    expired_at = excluded.expired_at;
end;
$$;

create or replace function public.reject_payment_request(payment_request_uuid uuid, reason text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admins can reject payment requests.';
  end if;

  update public.payment_requests
  set
    status = 'rejected',
    rejected_reason = nullif(btrim(reason), ''),
    approved_by = null,
    approved_at = null
  where id = payment_request_uuid;

  if not found then
    raise exception 'Payment request not found.';
  end if;
end;
$$;

create policy "Admins can view all payment requests"
on public.payment_requests
for select
to authenticated
using (public.is_admin());

create policy "Admins can view all workspace subscriptions"
on public.workspace_subscriptions
for select
to authenticated
using (public.is_admin());

create policy "Admins can update workspace subscriptions"
on public.workspace_subscriptions
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

grant execute on function public.is_admin() to authenticated;
grant execute on function public.approve_payment_request(uuid) to authenticated;
grant execute on function public.reject_payment_request(uuid, text) to authenticated;
