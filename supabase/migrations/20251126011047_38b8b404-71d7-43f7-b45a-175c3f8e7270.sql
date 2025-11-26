-- Fix time constraint to allow up to 120 seconds (game has 90 second timer)
ALTER TABLE pvp_match_answers 
DROP CONSTRAINT IF EXISTS pvp_match_answers_time_taken_seconds_check;

ALTER TABLE pvp_match_answers 
ADD CONSTRAINT pvp_match_answers_time_taken_seconds_check 
CHECK (time_taken_seconds >= 0 AND time_taken_seconds <= 120);

-- Configure REPLICA IDENTITY FULL to ensure all fields are sent in realtime updates
ALTER TABLE pvp_matches REPLICA IDENTITY FULL;
ALTER TABLE pvp_match_answers REPLICA IDENTITY FULL;