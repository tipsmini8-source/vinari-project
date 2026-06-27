create table public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  method_type text not null default 'qris',
  name text not null,
  account_number text,
  account_name text,
  bank_name text,
  qr_image_url text,
  instructions text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payment_methods_method_type_check check (method_type in ('qris', 'bank_transfer', 'ewallet', 'manual'))
);

create index payment_methods_is_active_idx on public.payment_methods (is_active);
create index payment_methods_sort_order_idx on public.payment_methods (sort_order);

create trigger set_payment_methods_updated_at
before update on public.payment_methods
for each row execute function public.set_updated_at();

alter table public.payment_methods enable row level security;

create policy "Authenticated users can view active payment methods"
on public.payment_methods
for select
to authenticated
using (is_active = true);

create policy "Admins can view all payment methods"
on public.payment_methods
for select
to authenticated
using (public.is_admin());

create policy "Admins can insert payment methods"
on public.payment_methods
for insert
to authenticated
with check (public.is_admin());

create policy "Admins can update payment methods"
on public.payment_methods
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can delete payment methods"
on public.payment_methods
for delete
to authenticated
using (public.is_admin());

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'payment-methods',
  'payment-methods',
  true,
  5242880,
  array[
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
)
on conflict (id) do update
set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Authenticated users can read payment method files"
on storage.objects
for select
to authenticated
using (bucket_id = 'payment-methods');

create policy "Admins can upload payment method files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'payment-methods'
  and public.is_admin()
);

create policy "Admins can update payment method files"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'payment-methods'
  and public.is_admin()
)
with check (
  bucket_id = 'payment-methods'
  and public.is_admin()
);

create policy "Admins can delete payment method files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'payment-methods'
  and public.is_admin()
);
