-- Fix function search_path for unlock_next_track
DROP FUNCTION IF EXISTS public.unlock_next_track() CASCADE;

CREATE OR REPLACE FUNCTION public.unlock_next_track()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_track_id uuid;
  next_track_id uuid;
  total_modules integer;
  completed_modules integer;
BEGIN
  -- Get the track_id of the completed module
  SELECT track_id INTO current_track_id
  FROM learning_modules
  WHERE id = NEW.module_id;
  
  -- If module was just completed
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Count total modules in this track
    SELECT COUNT(*) INTO total_modules
    FROM learning_modules
    WHERE track_id = current_track_id;
    
    -- Count completed modules in this track for this user
    SELECT COUNT(*) INTO completed_modules
    FROM user_module_progress ump
    JOIN learning_modules lm ON ump.module_id = lm.id
    WHERE ump.user_id = NEW.user_id 
      AND lm.track_id = current_track_id 
      AND ump.status = 'completed';
    
    -- If all modules in track are completed
    IF completed_modules = total_modules THEN
      -- Mark track as completed
      UPDATE user_track_progress
      SET status = 'completed', completed_at = now()
      WHERE user_id = NEW.user_id AND track_id = current_track_id;
      
      -- Get next track
      SELECT lt.id INTO next_track_id
      FROM learning_tracks lt
      WHERE lt.order_index = (
        SELECT order_index + 1
        FROM learning_tracks
        WHERE id = current_track_id
      )
      LIMIT 1;
      
      -- Unlock next track if exists
      IF next_track_id IS NOT NULL THEN
        INSERT INTO user_track_progress (user_id, track_id, status, unlocked_at)
        VALUES (NEW.user_id, next_track_id, 'unlocked', now())
        ON CONFLICT (user_id, track_id) 
        DO UPDATE SET status = 'unlocked', unlocked_at = now();
        
        -- Unlock first module of next track
        INSERT INTO user_module_progress (user_id, module_id, status)
        SELECT NEW.user_id, lm.id, 'unlocked'
        FROM learning_modules lm
        WHERE lm.track_id = next_track_id
        ORDER BY lm.order_index
        LIMIT 1
        ON CONFLICT (user_id, module_id) 
        DO UPDATE SET status = 'unlocked';
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_module_completed ON user_module_progress;
CREATE TRIGGER on_module_completed
  AFTER INSERT OR UPDATE ON user_module_progress
  FOR EACH ROW
  EXECUTE FUNCTION unlock_next_track();