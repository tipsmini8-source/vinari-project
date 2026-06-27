create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'info',
  is_read boolean not null default false,
  action_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create index if not exists notifications_user_id_is_read_idx
on public.notifications (user_id, is_read);

create index if not exists notifications_workspace_id_idx
on public.notifications (workspace_id);

create index if not exists notifications_created_at_idx
on public.notifications (created_at);

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'notifications'
      and policyname = 'Users can view own notifications'
  ) then
    create policy "Users can view own notifications"
    on public.notifications
    for select
    to authenticated
    using (user_id = auth.uid());
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'notifications'
      and policyname = 'Admins can view all notifications'
  ) then
    create policy "Admins can view all notifications"
    on public.notifications
    for select
    to authenticated
    using (public.is_admin());
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'notifications'
      and policyname = 'Users can update own notification read state'
  ) then
    create policy "Users can update own notification read state"
    on public.notifications
    for update
    to authenticated
    using (user_id = auth.uid())
    with check (user_id = auth.uid());
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'notifications'
      and policyname = 'Workspace editors can insert notifications'
  ) then
    create policy "Workspace editors can insert notifications"
    on public.notifications
    for insert
    to authenticated
    with check (
      workspace_id is not null
      and public.can_edit_workspace(workspace_id)
    );
  end if;
end;
$$;

revoke update on public.notifications from authenticated;
grant update (is_read) on public.notifications to authenticated;

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

  insert into public.notifications (
    workspace_id,
    user_id,
    title,
    message,
    type,
    action_url,
    metadata
  )
  values (
    selected_request.workspace_id,
    selected_request.user_id,
    'Pembayaran premium disetujui',
    'Pembayaran Anda untuk plan ' || selected_request.plan_code || ' sudah disetujui. Premium aktif selama 30 hari.',
    'success',
    '/app/billing',
    jsonb_build_object(
      'payment_request_id', selected_request.id,
      'plan_code', selected_request.plan_code
    )
  );
end;
$$;

create or replace function public.reject_payment_request(payment_request_uuid uuid, reason text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_request public.payment_requests%rowtype;
  rejection_reason text;
begin
  if not public.is_admin() then
    raise exception 'Only admins can reject payment requests.';
  end if;

  select *
  into selected_request
  from public.payment_requests
  where id = payment_request_uuid
  for update;

  if not found then
    raise exception 'Payment request not found.';
  end if;

  rejection_reason := nullif(btrim(reason), '');

  update public.payment_requests
  set
    status = 'rejected',
    rejected_reason = rejection_reason,
    approved_by = null,
    approved_at = null
  where id = payment_request_uuid;

  insert into public.notifications (
    workspace_id,
    user_id,
    title,
    message,
    type,
    action_url,
    metadata
  )
  values (
    selected_request.workspace_id,
    selected_request.user_id,
    'Pembayaran premium ditolak',
    case
      when rejection_reason is null then 'Pembayaran Anda untuk plan ' || selected_request.plan_code || ' ditolak. Silakan cek billing dan kirim ulang jika perlu.'
      else 'Pembayaran Anda untuk plan ' || selected_request.plan_code || ' ditolak. Alasan: ' || rejection_reason
    end,
    'warning',
    '/app/billing',
    jsonb_build_object(
      'payment_request_id', selected_request.id,
      'plan_code', selected_request.plan_code,
      'rejected_reason', rejection_reason
    )
  );
end;
$$;

grant execute on function public.approve_payment_request(uuid) to authenticated;
grant execute on function public.reject_payment_request(uuid, text) to authenticated;
