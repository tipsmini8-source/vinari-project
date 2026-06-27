create or replace function public.create_workspace(
  workspace_name text,
  currency_code text,
  wallet_name text,
  opening_balance numeric,
  usage_type text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid;
  new_workspace_id uuid;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception 'User belum terautentikasi.';
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id = current_user_id
  ) then
    raise exception 'Profile user belum tersedia.';
  end if;

  if nullif(btrim(workspace_name), '') is null then
    raise exception 'Nama workspace wajib diisi.';
  end if;

  if nullif(btrim(wallet_name), '') is null then
    raise exception 'Nama wallet wajib diisi.';
  end if;

  if opening_balance < 0 then
    raise exception 'Saldo awal tidak boleh negatif.';
  end if;

  insert into public.workspaces (
    name,
    owner_id,
    currency_code,
    created_by,
    updated_by,
    metadata
  )
  values (
    btrim(workspace_name),
    current_user_id,
    coalesce(nullif(btrim(currency_code), ''), 'IDR'),
    current_user_id,
    current_user_id,
    jsonb_build_object('usage_type', coalesce(nullif(btrim(usage_type), ''), 'personal'))
  )
  returning id into new_workspace_id;

  insert into public.workspace_members (
    workspace_id,
    user_id,
    role,
    status,
    created_by,
    updated_by,
    metadata
  )
  values (
    new_workspace_id,
    current_user_id,
    'owner',
    'active',
    current_user_id,
    current_user_id,
    '{}'::jsonb
  );

  insert into public.wallets (
    workspace_id,
    name,
    wallet_type,
    initial_balance,
    opening_balance_date,
    currency_code,
    created_by,
    updated_by,
    metadata
  )
  values (
    new_workspace_id,
    btrim(wallet_name),
    'bank',
    coalesce(opening_balance, 0),
    current_date,
    coalesce(nullif(btrim(currency_code), ''), 'IDR'),
    current_user_id,
    current_user_id,
    '{}'::jsonb
  );

  perform public.create_default_categories(new_workspace_id, current_user_id);

  insert into public.user_preferences (
    user_id,
    currency_code,
    metadata
  )
  values (
    current_user_id,
    coalesce(nullif(btrim(currency_code), ''), 'IDR'),
    '{}'::jsonb
  )
  on conflict (user_id) do nothing;

  return new_workspace_id;
end;
$$;

create policy "Authenticated users can insert owned workspaces"
on public.workspaces
for insert
to authenticated
with check (owner_id = auth.uid());

create policy "Users can insert own owner workspace membership"
on public.workspace_members
for insert
to authenticated
with check (
  user_id = auth.uid()
  and role = 'owner'
);

drop policy if exists "Workspace editors can insert wallets" on public.wallets;

create policy "Workspace editors can insert wallets"
on public.wallets
for insert
to authenticated
with check (public.can_edit_workspace(workspace_id));
