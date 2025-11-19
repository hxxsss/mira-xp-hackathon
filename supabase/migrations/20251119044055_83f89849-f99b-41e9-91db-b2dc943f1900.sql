-- Add target_date column to goals table for deadline tracking
ALTER TABLE public.goals
ADD COLUMN target_date DATE;

-- Add index for better query performance
CREATE INDEX idx_goals_target_date ON public.goals(target_date);

-- Add comment for documentation
COMMENT ON COLUMN public.goals.target_date IS 'Estimated date when the user expects to reach their goal. Can be adjusted by the Oracle AI based on purchase decisions.';