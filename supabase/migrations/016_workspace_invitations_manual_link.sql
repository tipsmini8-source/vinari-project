create table if not exists public.workspace_invitations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  email text not null,
  role text not null default 'member',
  token text not null unique,
  status text not null default 'pending',
  invited_by uuid references public.profiles (id) on delete set null,
  accepted_by uuid references public.profiles (id) on delete set null,
  expires_at timestamptz not null default now() + interval '7 days',
  accepted_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workspace_invitations_status_check check (status in ('pending', 'accepted', 'cancelled', 'expired')),
  constraint workspace_invitations_role_check check (role in ('owner', 'partner', 'member', 'viewer')),
  constraint workspace_invitations_email_normalized_check check (email = lower(btrim(email)))
);

create unique index if not exists workspace_invitations_token_idx
on public.workspace_invitations (token);

create index if not exists workspace_invitations_workspace_id_idx
on public.workspace_invitations (workspace_id);

create index if not exists workspace_invitations_email_idx
on public.workspace_invitations (email);

create index if not exists workspace_invitations_status_idx
on public.workspace_invitations (status);

create index if not exists workspace_invitations_expires_at_idx
on public.workspace_invitations (expires_at);

create unique index if not exists workspace_invitations_workspace_email_pending_idx
on public.workspace_invitations (workspace_id, email)
where status = 'pending';

drop trigger if exists set_workspace_invitations_updated_at on public.workspace_invitations;
create trigger set_workspace_invitations_updated_at
before update on public.workspace_invitations
for each row execute function public.set_updated_at();

alter table public.workspace_invitations enable row level security;

drop policy if exists "Workspace owners can view workspace invitations" on public.workspace_invitations;
create policy "Workspace owners can view workspace invitations"
on public.workspace_invitations
for select
to authenticated
using (public.is_workspace_owner(workspace_id));

drop policy if exists "Workspace owners can create workspace invitations" on public.workspace_invitations;
create policy "Workspace owners can create workspace invitations"
on public.workspace_invitations
for insert
to authenticated
with check (public.is_workspace_owner(workspace_id));

drop policy if exists "Workspace owners can update workspace invitations" on public.workspace_invitations;
create policy "Workspace owners can update workspace invitations"
on public.workspace_invitations
for update
to authenticated
using (public.is_workspace_owner(workspace_id))
with check (public.is_workspace_owner(workspace_id));

create or replace function public.get_invitation_by_token(invite_token text)
returns table (
  invitation_id uuid,
  workspace_id uuid,
  workspace_name text,
  email text,
  role text,
  status text,
  expires_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select
    wi.id as invitation_id,
    wi.workspace_id,
    w.name as workspace_name,
    wi.email,
    wi.role,
    case
      when wi.status = 'pending' and wi.expires_at <= now() then 'expired'
      else wi.status
    end as status,
    wi.expires_at
  from public.workspace_invitations wi
  join public.workspaces w on w.id = wi.workspace_id
  where wi.token = invite_token
    and w.deleted_at is null
  limit 1;
$$;

create or replace function public.accept_workspace_invitation(invite_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  invitation_record public.workspace_invitations%rowtype;
  user_email text;
begin
  if auth.uid() is null then
    raise exception 'Silakan masuk untuk menerima undangan.';
  end if;

  user_email := lower(coalesce(auth.jwt()->>'email', ''));

  select *
  into invitation_record
  from public.workspace_invitations
  where token = invite_token
  for update;

  if invitation_record.id is null then
    raise exception 'Undangan tidak ditemukan.';
  end if;

  if invitation_record.status = 'accepted' then
    raise exception 'Undangan sudah diterima.';
  end if;

  if invitation_record.status <> 'pending' then
    raise exception 'Undangan tidak ditemukan.';
  end if;

  if invitation_record.expires_at <= now() then
    update public.workspace_invitations
    set status = 'expired'
    where id = invitation_record.id;

    raise exception 'Undangan sudah kedaluwarsa.';
  end if;

  if invitation_record.email <> user_email then
    raise exception 'Email akun kamu berbeda dari email undangan.';
  end if;

  if exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = invitation_record.workspace_id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
      and wm.deleted_at is null
  ) then
    raise exception 'Kamu sudah menjadi anggota workspace ini.';
  end if;

  update public.workspace_members
  set role = invitation_record.role::public.workspace_role,
      status = 'active',
      accepted_at = now(),
      deleted_at = null,
      updated_by = auth.uid()
  where workspace_id = invitation_record.workspace_id
    and user_id = auth.uid()
    and status <> 'active';

  if not found then
    insert into public.workspace_members (
      workspace_id,
      user_id,
      role,
      status,
      accepted_at,
      created_by,
      updated_by,
      metadata
    )
    values (
      invitation_record.workspace_id,
      auth.uid(),
      invitation_record.role::public.workspace_role,
      'active',
      now(),
      invitation_record.invited_by,
      auth.uid(),
      '{}'::jsonb
    );
  end if;

  update public.workspace_invitations
  set status = 'accepted',
      accepted_by = auth.uid(),
      accepted_at = now()
  where id = invitation_record.id;

  return invitation_record.workspace_id;
end;
$$;

grant execute on function public.get_invitation_by_token(text) to anon, authenticated;
grant execute on function public.accept_workspace_invitation(text) to authenticated;

comment on table public.workspace_invitations is
'Manual invite-link invitations. Legacy rows in workspace_members with user_id null and status invited are intentionally ignored by the app; review before optional cleanup: delete from public.workspace_members where user_id is null and status = ''invited'';';
