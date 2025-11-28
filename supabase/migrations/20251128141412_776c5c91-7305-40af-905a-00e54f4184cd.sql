-- Add monthly_savings_goal column to profiles table
ALTER TABLE profiles
ADD COLUMN monthly_savings_goal numeric DEFAULT NULL;

COMMENT ON COLUMN profiles.monthly_savings_goal IS 'User customized monthly savings goal (overrides 20% calculation if set)';
