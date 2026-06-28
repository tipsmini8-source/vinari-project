alter table public.user_preferences
add column if not exists app_template text not null default 'tech_premium';

alter table public.user_preferences
drop constraint if exists user_preferences_app_template_check;

alter table public.user_preferences
add constraint user_preferences_app_template_check
check (app_template in ('tech_premium', 'fintech_fresh'));

update public.user_preferences
set app_template = 'tech_premium'
where app_template is null
   or app_template not in ('tech_premium', 'fintech_fresh');
