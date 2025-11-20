-- Update the unlock_next_module function to also update monthly and total XP
CREATE OR REPLACE FUNCTION public.unlock_next_module()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  next_module_id uuid;
  module_xp integer;
  module_points integer;
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Get next module in sequence
    SELECT lm.id INTO next_module_id
    FROM learning_modules lm
    WHERE lm.order_index = (
      SELECT order_index + 1 
      FROM learning_modules 
      WHERE id = NEW.module_id
    )
    LIMIT 1;
    
    -- Unlock next module if exists
    IF next_module_id IS NOT NULL THEN
      INSERT INTO user_module_progress (user_id, module_id, status)
      VALUES (NEW.user_id, next_module_id, 'unlocked')
      ON CONFLICT (user_id, module_id) 
      DO UPDATE SET status = 'unlocked', last_accessed_at = now();
    END IF;
    
    -- Grant rewards
    SELECT xp_reward, points_reward INTO module_xp, module_points
    FROM learning_modules 
    WHERE id = NEW.module_id;
    
    UPDATE profiles
    SET 
      current_xp = current_xp + module_xp,
      weekly_xp = weekly_xp + module_xp,
      monthly_xp = monthly_xp + module_xp,
      total_xp = total_xp + module_xp,
      dream_points = dream_points + module_points
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create a function to reset monthly XP (to be called by a scheduled job)
CREATE OR REPLACE FUNCTION public.reset_monthly_xp()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE profiles
  SET monthly_xp = 0;
END;
$function$;