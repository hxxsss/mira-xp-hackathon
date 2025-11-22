-- Tabela de partidas PvP
CREATE TABLE pvp_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_code TEXT UNIQUE NOT NULL,
  host_user_id UUID REFERENCES profiles(id) NOT NULL,
  opponent_user_id UUID REFERENCES profiles(id),
  module_id UUID REFERENCES learning_modules(id) NOT NULL,
  xp_bet INTEGER NOT NULL CHECK (xp_bet IN (5, 10, 15, 20)),
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'in_progress', 'completed', 'cancelled')),
  winner_user_id UUID REFERENCES profiles(id),
  host_score INTEGER,
  opponent_score INTEGER,
  questions_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_pvp_matches_status ON pvp_matches(status);
CREATE INDEX idx_pvp_matches_code ON pvp_matches(match_code);
CREATE INDEX idx_pvp_matches_host ON pvp_matches(host_user_id);
CREATE INDEX idx_pvp_matches_created ON pvp_matches(created_at);

-- Tabela de respostas PvP
CREATE TABLE pvp_match_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES pvp_matches(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  question_index INTEGER NOT NULL CHECK (question_index >= 0 AND question_index < 5),
  selected_answer INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_taken_seconds DECIMAL(5,2) NOT NULL CHECK (time_taken_seconds >= 0 AND time_taken_seconds <= 30),
  points_earned INTEGER NOT NULL,
  answered_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(match_id, user_id, question_index)
);

CREATE INDEX idx_pvp_answers_match ON pvp_match_answers(match_id);
CREATE INDEX idx_pvp_answers_user ON pvp_match_answers(user_id);

-- Função para gerar código de partida
CREATE OR REPLACE FUNCTION generate_match_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Função para calcular pontos por velocidade
CREATE OR REPLACE FUNCTION calculate_speed_points(
  is_correct BOOLEAN,
  time_seconds DECIMAL
)
RETURNS INTEGER AS $$
BEGIN
  IF NOT is_correct THEN
    RETURN 0;
  END IF;
  
  RETURN 100 + FLOOR(100 * (1 - (time_seconds / 30)));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger para finalizar partida automaticamente
CREATE OR REPLACE FUNCTION check_and_finalize_match()
RETURNS TRIGGER AS $$
DECLARE
  host_answers INTEGER;
  opponent_answers INTEGER;
  host_total_points INTEGER;
  opponent_total_points INTEGER;
  winner UUID;
  match_record RECORD;
BEGIN
  SELECT * INTO match_record
  FROM pvp_matches
  WHERE id = NEW.match_id;
  
  IF match_record.status != 'in_progress' THEN
    RETURN NEW;
  END IF;
  
  SELECT COUNT(*) INTO host_answers
  FROM pvp_match_answers
  WHERE match_id = NEW.match_id AND user_id = match_record.host_user_id;
  
  SELECT COUNT(*) INTO opponent_answers
  FROM pvp_match_answers
  WHERE match_id = NEW.match_id AND user_id = match_record.opponent_user_id;
  
  IF host_answers = 5 AND opponent_answers = 5 THEN
    SELECT COALESCE(SUM(points_earned), 0) INTO host_total_points
    FROM pvp_match_answers
    WHERE match_id = NEW.match_id AND user_id = match_record.host_user_id;
    
    SELECT COALESCE(SUM(points_earned), 0) INTO opponent_total_points
    FROM pvp_match_answers
    WHERE match_id = NEW.match_id AND user_id = match_record.opponent_user_id;
    
    IF host_total_points > opponent_total_points THEN
      winner := match_record.host_user_id;
      
      UPDATE profiles
      SET current_xp = current_xp + (match_record.xp_bet * 2),
          total_xp = total_xp + (match_record.xp_bet * 2),
          weekly_xp = weekly_xp + (match_record.xp_bet * 2),
          monthly_xp = monthly_xp + (match_record.xp_bet * 2)
      WHERE id = winner;
      
    ELSIF opponent_total_points > host_total_points THEN
      winner := match_record.opponent_user_id;
      
      UPDATE profiles
      SET current_xp = current_xp + (match_record.xp_bet * 2),
          total_xp = total_xp + (match_record.xp_bet * 2),
          weekly_xp = weekly_xp + (match_record.xp_bet * 2),
          monthly_xp = monthly_xp + (match_record.xp_bet * 2)
      WHERE id = winner;
      
    ELSE
      UPDATE profiles
      SET current_xp = current_xp + match_record.xp_bet
      WHERE id IN (match_record.host_user_id, match_record.opponent_user_id);
    END IF;
    
    UPDATE pvp_matches
    SET status = 'completed',
        winner_user_id = winner,
        host_score = host_total_points,
        opponent_score = opponent_total_points,
        completed_at = now()
    WHERE id = NEW.match_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_finalize_match
AFTER INSERT ON pvp_match_answers
FOR EACH ROW
EXECUTE FUNCTION check_and_finalize_match();

-- RLS Policies para pvp_matches
ALTER TABLE pvp_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create matches"
ON pvp_matches FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = host_user_id);

CREATE POLICY "Users can view their matches"
ON pvp_matches FOR SELECT
TO authenticated
USING (auth.uid() = host_user_id OR auth.uid() = opponent_user_id OR status = 'waiting');

CREATE POLICY "Users can join matches as opponent"
ON pvp_matches FOR UPDATE
TO authenticated
USING (opponent_user_id IS NULL OR auth.uid() = opponent_user_id OR auth.uid() = host_user_id)
WITH CHECK (auth.uid() = opponent_user_id OR auth.uid() = host_user_id);

-- RLS Policies para pvp_match_answers
ALTER TABLE pvp_match_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own answers"
ON pvp_match_answers FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view answers of their matches"
ON pvp_match_answers FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() 
  OR 
  EXISTS (
    SELECT 1 FROM pvp_matches
    WHERE id = match_id 
    AND (host_user_id = auth.uid() OR opponent_user_id = auth.uid())
  )
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE pvp_matches;
ALTER PUBLICATION supabase_realtime ADD TABLE pvp_match_answers;