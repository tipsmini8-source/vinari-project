create table public.user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  theme text default 'system',
  language text default 'id',
  currency_code text default 'IDR',
  date_format text default 'DD/MM/YYYY',
  first_day_of_week text default 'monday',
  dashboard_layout text default 'default',
  notification_enabled boolean default true,
  email_notification boolean default true,
  push_notification boolean default true,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id)
);

alter table public.user_preferences enable row level security;

create trigger set_user_preferences_updated_at
before update on public.user_preferences
for each row execute function public.set_updated_at();

create policy "Users can view their own preferences"
on public.user_preferences
for select
to authenticated
using (user_id = auth.uid());

create policy "Users can insert their own preferences"
on public.user_preferences
for insert
to authenticated
with check (user_id = auth.uid());

create policy "Users can update their own preferences"
on public.user_preferences
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
