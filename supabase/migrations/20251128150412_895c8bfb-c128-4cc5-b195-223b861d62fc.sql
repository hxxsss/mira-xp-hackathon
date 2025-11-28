-- Add is_ready field to pvp_group_members
ALTER TABLE pvp_group_members ADD COLUMN is_ready BOOLEAN DEFAULT FALSE;

-- Create pvp_group_pairings table for 1v1 combat pairings
CREATE TABLE pvp_group_pairings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES pvp_matches(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL DEFAULT 1,
  player1_id UUID NOT NULL,
  player1_group_id UUID NOT NULL REFERENCES pvp_groups(id) ON DELETE CASCADE,
  player2_id UUID NOT NULL,
  player2_group_id UUID NOT NULL REFERENCES pvp_groups(id) ON DELETE CASCADE,
  player1_score INTEGER DEFAULT 0,
  player2_score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on pvp_group_pairings
ALTER TABLE pvp_group_pairings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view pairings of their matches
CREATE POLICY "Users can view pairings of their matches"
ON pvp_group_pairings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM pvp_matches
    WHERE pvp_matches.id = pvp_group_pairings.match_id
    AND (pvp_matches.host_user_id = auth.uid() OR pvp_matches.opponent_user_id = auth.uid())
  )
  OR player1_id = auth.uid()
  OR player2_id = auth.uid()
);

-- Policy: System can insert pairings
CREATE POLICY "System can insert pairings"
ON pvp_group_pairings
FOR INSERT
WITH CHECK (true);

-- Policy: Players can update their pairing scores
CREATE POLICY "Players can update pairing scores"
ON pvp_group_pairings
FOR UPDATE
USING (player1_id = auth.uid() OR player2_id = auth.uid());

-- Add index for faster queries
CREATE INDEX idx_pvp_group_pairings_match_id ON pvp_group_pairings(match_id);
CREATE INDEX idx_pvp_group_pairings_players ON pvp_group_pairings(player1_id, player2_id);