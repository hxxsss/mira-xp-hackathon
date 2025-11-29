-- Drop old constraint
ALTER TABLE public.pvp_matches DROP CONSTRAINT IF EXISTS pvp_matches_status_check;

-- Create new constraint with all necessary status values
ALTER TABLE public.pvp_matches ADD CONSTRAINT pvp_matches_status_check 
CHECK ((status = ANY (ARRAY['waiting'::text, 'ready_check'::text, 'in_progress'::text, 'completed'::text, 'cancelled'::text, 'abandoned'::text])));