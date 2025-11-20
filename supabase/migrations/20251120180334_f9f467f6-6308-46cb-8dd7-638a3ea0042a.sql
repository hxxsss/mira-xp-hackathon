-- Add monthly and total XP tracking to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS monthly_xp integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_xp integer NOT NULL DEFAULT 0;

-- Create index for ranking queries
CREATE INDEX IF NOT EXISTS idx_profiles_monthly_xp ON public.profiles(monthly_xp DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_total_xp ON public.profiles(total_xp DESC);

-- Update existing profiles to set total_xp from current_xp
UPDATE public.profiles 
SET total_xp = current_xp, monthly_xp = weekly_xp
WHERE total_xp = 0;