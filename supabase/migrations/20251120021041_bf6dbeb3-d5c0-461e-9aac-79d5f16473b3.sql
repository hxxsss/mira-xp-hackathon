-- Create learning tracks table
CREATE TABLE learning_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  order_index integer NOT NULL,
  background_color text NOT NULL,
  icon text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add track_id to learning_modules
ALTER TABLE learning_modules ADD COLUMN track_id uuid REFERENCES learning_tracks(id);

-- Insert the three tracks
INSERT INTO learning_tracks (name, description, order_index, background_color, icon) VALUES
('Mentalidade', 'Construa uma base sólida sobre dinheiro', 1, '#7C3AED', '🧠'),
('Organização', 'Aprenda a organizar suas finanças', 2, '#10B981', '📊'),
('Aceleração', 'Multiplique seus resultados', 3, '#F59E0B', '🚀');

-- Update existing modules to be part of Mentalidade track
UPDATE learning_modules 
SET track_id = (SELECT id FROM learning_tracks WHERE name = 'Mentalidade')
WHERE order_index IN (1, 2, 3, 4, 5);

-- Add more modules for Organização track
INSERT INTO learning_modules (number, title, description, icon, card_color, icon_bg, order_index, track_id, xp_reward, points_reward) VALUES
('06', 'Planejamento Financeiro', 'Crie seu primeiro plano financeiro', '📋', '#FFFFFF', 'linear-gradient(135deg, #10B981 0%, #34D399 100%)', 6, (SELECT id FROM learning_tracks WHERE name = 'Organização'), 50, 10),
('07', 'Controle de Gastos', 'Domine o controle das suas despesas', '💳', '#FFFFFF', 'linear-gradient(135deg, #10B981 0%, #34D399 100%)', 7, (SELECT id FROM learning_tracks WHERE name = 'Organização'), 50, 10),
('08', 'Orçamento Inteligente', 'Monte um orçamento que funciona', '🎯', '#FFFFFF', 'linear-gradient(135deg, #10B981 0%, #34D399 100%)', 8, (SELECT id FROM learning_tracks WHERE name = 'Organização'), 50, 10);

-- Add modules for Aceleração track
INSERT INTO learning_modules (number, title, description, icon, card_color, icon_bg, order_index, track_id, xp_reward, points_reward) VALUES
('09', 'Renda Extra', 'Descubra formas de aumentar sua renda', '💰', '#FFFFFF', 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)', 9, (SELECT id FROM learning_tracks WHERE name = 'Aceleração'), 50, 10),
('10', 'Investimentos Básicos', 'Comece a investir com segurança', '📈', '#FFFFFF', 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)', 10, (SELECT id FROM learning_tracks WHERE name = 'Aceleração'), 50, 10);

-- Create user_track_progress table
CREATE TABLE user_track_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  track_id uuid NOT NULL REFERENCES learning_tracks(id),
  status text NOT NULL DEFAULT 'locked', -- 'locked', 'unlocked', 'completed'
  unlocked_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, track_id)
);

-- RLS Policies for learning_tracks
ALTER TABLE learning_tracks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view tracks" ON learning_tracks FOR SELECT USING (true);

-- RLS Policies for user_track_progress
ALTER TABLE user_track_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own track progress" ON user_track_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own track progress" ON user_track_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own track progress" ON user_track_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to unlock next track when current track is completed
CREATE OR REPLACE FUNCTION unlock_next_track()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for track unlocking
CREATE TRIGGER on_module_completed_unlock_track
  AFTER INSERT OR UPDATE ON user_module_progress
  FOR EACH ROW
  EXECUTE FUNCTION unlock_next_track();