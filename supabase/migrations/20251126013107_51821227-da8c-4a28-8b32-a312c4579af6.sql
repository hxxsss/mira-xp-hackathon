-- Add ready status columns to pvp_matches
ALTER TABLE pvp_matches 
ADD COLUMN IF NOT EXISTS host_ready BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS opponent_ready BOOLEAN DEFAULT FALSE;