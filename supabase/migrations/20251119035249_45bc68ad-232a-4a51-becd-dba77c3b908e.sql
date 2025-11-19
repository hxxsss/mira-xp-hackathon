-- Drop the old income_type check constraint
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_income_type_check;

-- Add new check constraint accepting PT-BR values
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_income_type_check 
CHECK (income_type IN ('none', 'mesada', 'trabalho'));

-- Ensure RLS policies are correct for profiles table
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Policy for INSERT: allow when user creates their own profile OR via trigger (auth.uid() IS NULL)
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK ((auth.uid() = id) OR (auth.uid() IS NULL));

-- Policy for SELECT: users can only view their own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Policy for UPDATE: users can only update their own profile
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);