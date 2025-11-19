-- Ajustar RLS para permitir inserção de perfis via trigger de signup
ALTER POLICY "Users can insert their own profile"
ON public.profiles
WITH CHECK ((auth.uid() = id) OR (auth.uid() IS NULL));