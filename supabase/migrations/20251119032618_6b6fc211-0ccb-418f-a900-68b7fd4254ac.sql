-- Update the handle_new_user function to include income_type with default value
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
begin
  insert into public.profiles (id, name, email, income_type)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Novo Usuário'),
    new.email,
    'none'
  );
  return new;
end;
$$;