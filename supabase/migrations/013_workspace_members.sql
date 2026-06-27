alter table public.workspace_members
alter column user_id drop not null;

alter table public.workspace_members
add column if not exists invite_email text,
add column if not exists invited_at timestamptz,
add column if not exists accepted_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'workspace_members_status_check'
      and conrelid = 'public.workspace_members'::regclass
  ) then
    alter table public.workspace_members
    add constraint workspace_members_status_check
    check (status in ('active', 'invited', 'removed'));
  end if;
end;
$$;

create index if not exists workspace_members_invite_email_idx
on public.workspace_members (lower(invite_email))
where invite_email is not null and deleted_at is null;

create unique index if not exists workspace_members_workspace_invite_email_active_idx
on public.workspace_members (workspace_id, lower(invite_email))
where invite_email is not null and status = 'invited' and deleted_at is null;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Workspace members can view profiles in shared workspaces'
  ) then
    create policy "Workspace members can view profiles in shared workspaces"
    on public.profiles
    for select
    to authenticated
    using (
      exists (
        select 1
        from public.workspace_members current_member
        join public.workspace_members target_member
          on target_member.workspace_id = current_member.workspace_id
        where current_member.user_id = auth.uid()
          and current_member.status = 'active'
          and current_member.deleted_at is null
          and target_member.user_id = public.profiles.id
          and target_member.status = 'active'
          and target_member.deleted_at is null
      )
    );
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'workspace_members'
      and policyname = 'Invited users can view their workspace invitations'
  ) then
    create policy "Invited users can view their workspace invitations"
    on public.workspace_members
    for select
    to authenticated
    using (
      deleted_at is null
      and status = 'invited'
      and invite_email is not null
      and lower(invite_email) = lower(coalesce(auth.jwt()->>'email', ''))
    );
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'workspace_members'
      and policyname = 'Workspace owners can invite workspace memberships'
  ) then
    create policy "Workspace owners can invite workspace memberships"
    on public.workspace_members
    for insert
    to authenticated
    with check (
      status = 'invited'
      and user_id is null
      and invite_email is not null
      and public.is_workspace_owner(workspace_id)
    );
  end if;
end;
$$;

create or replace function public.accept_workspace_invitation(invitation_uuid uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  invitation_record public.workspace_members%rowtype;
  user_email text;
begin
  user_email := lower(coalesce(auth.jwt()->>'email', ''));

  select *
  into invitation_record
  from public.workspace_members
  where id = invitation_uuid
    and status = 'invited'
    and deleted_at is null
  for update;

  if invitation_record.id is null then
    raise exception 'Undangan tidak ditemukan.';
  end if;

  if lower(coalesce(invitation_record.invite_email, '')) <> user_email then
    raise exception 'Email akun tidak sesuai dengan undangan.';
  end if;

  if exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = invitation_record.workspace_id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
      and wm.deleted_at is null
  ) then
    raise exception 'Akun ini sudah menjadi member workspace.';
  end if;

  update public.workspace_members
  set user_id = auth.uid(),
      status = 'active',
      accepted_at = now(),
      updated_by = auth.uid()
  where id = invitation_uuid;
end;
$$;

grant execute on function public.accept_workspace_invitation(uuid) to authenticated;
