-- Create pvp_queue table for matchmaking
CREATE TABLE pvp_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('Iniciante', 'Básico', 'Intermediário', 'Avançado')),
  xp_bet INTEGER NOT NULL,
  status TEXT DEFAULT 'searching' CHECK (status IN ('searching', 'matched', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  matched_at TIMESTAMPTZ,
  match_id UUID REFERENCES pvp_matches(id)
);

-- Create index for fast matchmaking queries
CREATE INDEX idx_pvp_queue_status ON pvp_queue(status, difficulty_level, xp_bet, created_at);

-- Enable RLS
ALTER TABLE pvp_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can insert into queue"
  ON pvp_queue FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their queue entries"
  ON pvp_queue FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their queue entries"
  ON pvp_queue FOR UPDATE
  USING (auth.uid() = user_id);

-- Enable realtime for instant match notifications
ALTER PUBLICATION supabase_realtime ADD TABLE pvp_queue;