alter table public.categories
add column if not exists is_default boolean not null default false;

create or replace function public.create_default_categories(
  workspace_uuid uuid,
  user_uuid uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.categories (
    workspace_id,
    name,
    type,
    icon,
    color,
    sort_order,
    is_default,
    created_by,
    metadata
  )
  values
    (workspace_uuid, 'Gaji', 'income', 'wallet', '#16a34a', 10, true, user_uuid, '{}'::jsonb),
    (workspace_uuid, 'Bonus', 'income', 'gift', '#22c55e', 20, true, user_uuid, '{}'::jsonb),
    (workspace_uuid, 'Bisnis', 'income', 'briefcase', '#059669', 30, true, user_uuid, '{}'::jsonb),
    (workspace_uuid, 'Freelance', 'income', 'laptop', '#0d9488', 40, true, user_uuid, '{}'::jsonb),
    (workspace_uuid, 'Hadiah', 'income', 'gift', '#65a30d', 50, true, user_uuid, '{}'::jsonb),
    (workspace_uuid, 'Investasi', 'income', 'trending-up', '#0284c7', 60, true, user_uuid, '{}'::jsonb),
    (workspace_uuid, 'Lainnya', 'income', 'circle-ellipsis', '#64748b', 70, true, user_uuid, '{}'::jsonb),
    (workspace_uuid, 'Makanan', 'expense', 'utensils', '#f97316', 110, true, user_uuid, '{}'::jsonb),
    (workspace_uuid, 'Transportasi', 'expense', 'car', '#eab308', 120, true, user_uuid, '{}'::jsonb),
    (workspace_uuid, 'Belanja', 'expense', 'shopping-bag', '#ec4899', 130, true, user_uuid, '{}'::jsonb),
    (workspace_uuid, 'Rumah Tangga', 'expense', 'home', '#8b5cf6', 140, true, user_uuid, '{}'::jsonb),
    (workspace_uuid, 'Tagihan', 'expense', 'receipt', '#ef4444', 150, true, user_uuid, '{}'::jsonb),
    (workspace_uuid, 'Cicilan', 'expense', 'credit-card', '#dc2626', 160, true, user_uuid, '{}'::jsonb),
    (workspace_uuid, 'Kesehatan', 'expense', 'heart-pulse', '#db2777', 170, true, user_uuid, '{}'::jsonb),
    (workspace_uuid, 'Pendidikan', 'expense', 'graduation-cap', '#2563eb', 180, true, user_uuid, '{}'::jsonb),
    (workspace_uuid, 'Hiburan', 'expense', 'music', '#7c3aed', 190, true, user_uuid, '{}'::jsonb),
    (workspace_uuid, 'Anak', 'expense', 'baby', '#14b8a6', 200, true, user_uuid, '{}'::jsonb),
    (workspace_uuid, 'Donasi', 'expense', 'hand-heart', '#10b981', 210, true, user_uuid, '{}'::jsonb),
    (workspace_uuid, 'Lainnya', 'expense', 'circle-ellipsis', '#64748b', 220, true, user_uuid, '{}'::jsonb)
  on conflict (workspace_id, type, name) do nothing;
end;
$$;
