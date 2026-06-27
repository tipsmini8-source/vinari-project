insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'premium-proofs',
  'premium-proofs',
  false,
  5242880,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf'
  ]
)
on conflict (id) do update
set
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Users can upload own premium proofs"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'premium-proofs'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can read own premium proofs"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'premium-proofs'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Admins can read all premium proofs"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'premium-proofs'
  and public.is_admin()
);

create or replace function public.attach_payment_proof(
  payment_request_uuid uuid,
  proof_path text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_request public.payment_requests%rowtype;
begin
  select *
  into selected_request
  from public.payment_requests
  where id = payment_request_uuid
  for update;

  if not found then
    raise exception 'Payment request not found.';
  end if;

  if selected_request.user_id <> auth.uid() then
    raise exception 'You can only upload proof for your own payment request.';
  end if;

  if not public.is_workspace_member(selected_request.workspace_id) then
    raise exception 'You are not a member of this workspace.';
  end if;

  if selected_request.status <> 'pending' then
    raise exception 'Payment proof can only be changed while request is pending.';
  end if;

  if proof_path not like ('premium-proofs/' || auth.uid()::text || '/' || payment_request_uuid::text || '-%') then
    raise exception 'Invalid proof path.';
  end if;

  update public.payment_requests
  set proof_url = proof_path
  where id = payment_request_uuid;
end;
$$;

grant execute on function public.attach_payment_proof(uuid, text) to authenticated;
