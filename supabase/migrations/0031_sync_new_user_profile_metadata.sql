create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_marketing_opt_in boolean := coalesce((new.raw_user_meta_data ->> 'marketing_email_opt_in')::boolean, false);
begin
  insert into public.profiles (
    id,
    email,
    tier,
    first_name,
    last_name,
    company_name,
    marketing_email_opt_in,
    marketing_email_opted_at,
    marketing_email_unsubscribed_at
  )
  values (
    new.id,
    new.email,
    'free',
    nullif(trim(new.raw_user_meta_data ->> 'first_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'last_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'company_name'), ''),
    v_marketing_opt_in,
    case when v_marketing_opt_in then now() else null end,
    null
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
