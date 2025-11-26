-- Drop the incorrect trigger that calls unlock_next_track
DROP TRIGGER IF EXISTS on_module_completed ON public.user_module_progress;

-- Create the correct trigger that calls unlock_next_module to grant XP rewards
CREATE TRIGGER on_module_xp_reward
  AFTER INSERT OR UPDATE ON public.user_module_progress
  FOR EACH ROW
  EXECUTE FUNCTION unlock_next_module();