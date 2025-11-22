-- Add estimated_timeline column to goals table
ALTER TABLE goals ADD COLUMN estimated_timeline text;

COMMENT ON COLUMN goals.estimated_timeline IS 'User estimated timeline for achieving the goal (e.g., "1-3 meses", "3-6 meses", etc.)';