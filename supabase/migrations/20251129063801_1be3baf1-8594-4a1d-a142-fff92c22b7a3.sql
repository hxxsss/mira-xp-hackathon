-- Add countdown_start_at column to synchronize countdown across all clients
ALTER TABLE pvp_matches 
ADD COLUMN countdown_start_at timestamptz;