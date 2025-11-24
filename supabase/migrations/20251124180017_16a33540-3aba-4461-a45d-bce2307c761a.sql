-- Fase 1: Integrar Jornada na Trilha Mentalidade

-- Passo 1: Ajustar order_index dos módulos existentes da trilha Mentalidade (+1)
UPDATE learning_modules
SET order_index = order_index + 1
WHERE track_id = (SELECT id FROM learning_tracks WHERE name = 'Mentalidade');

-- Passo 2: Inserir novo módulo "Jornada de Descoberta" como módulo 00
INSERT INTO learning_modules (
  id,
  track_id,
  number,
  title,
  description,
  icon,
  icon_bg,
  card_color,
  order_index,
  xp_reward,
  points_reward,
  content
)
SELECT
  gen_random_uuid(),
  (SELECT id FROM learning_tracks WHERE name = 'Mentalidade'),
  '00',
  'Jornada de Descoberta',
  'Descubra seu perfil financeiro através de uma jornada interativa e personalizada',
  '🗺️',
  'bg-gradient-to-br from-purple-500 to-purple-700',
  'bg-gradient-to-br from-purple-500 to-purple-700',
  0,
  100,
  20,
  jsonb_build_object(
    'type', 'journey',
    'steps', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', id,
          'step_number', step_number,
          'title', title,
          'subtitle', subtitle,
          'video_url', video_url,
          'question', question,
          'options', options
        )
        ORDER BY step_number
      )
      FROM journey_steps
    )
  );

-- Passo 3: Criar função para sincronizar progresso da jornada com progresso do módulo
CREATE OR REPLACE FUNCTION sync_journey_to_module_progress()
RETURNS TRIGGER AS $$
DECLARE
  journey_module_id uuid;
  total_steps integer;
  completed_steps integer;
  progress_pct integer;
BEGIN
  -- Obter ID do módulo de jornada
  SELECT id INTO journey_module_id
  FROM learning_modules
  WHERE number = '00' AND track_id = (SELECT id FROM learning_tracks WHERE name = 'Mentalidade');
  
  -- Contar total de etapas
  SELECT COUNT(*) INTO total_steps FROM journey_steps;
  
  -- Contar etapas completadas pelo usuário
  SELECT COUNT(*) INTO completed_steps
  FROM user_journey_progress
  WHERE user_id = NEW.user_id;
  
  -- Calcular porcentagem
  progress_pct := (completed_steps * 100) / total_steps;
  
  -- Upsert no user_module_progress
  INSERT INTO user_module_progress (user_id, module_id, status, progress_percent, last_accessed_at)
  VALUES (
    NEW.user_id,
    journey_module_id,
    CASE WHEN completed_steps = total_steps THEN 'completed' ELSE 'in_progress' END,
    progress_pct,
    now()
  )
  ON CONFLICT (user_id, module_id)
  DO UPDATE SET
    status = CASE WHEN completed_steps = total_steps THEN 'completed' ELSE 'in_progress' END,
    progress_percent = progress_pct,
    last_accessed_at = now(),
    completed_at = CASE WHEN completed_steps = total_steps THEN now() ELSE user_module_progress.completed_at END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Passo 4: Criar trigger para sincronizar automaticamente
DROP TRIGGER IF EXISTS sync_journey_progress_trigger ON user_journey_progress;
CREATE TRIGGER sync_journey_progress_trigger
AFTER INSERT OR UPDATE ON user_journey_progress
FOR EACH ROW
EXECUTE FUNCTION sync_journey_to_module_progress();

-- Passo 5: Garantir que o módulo de jornada está desbloqueado para todos os usuários
INSERT INTO user_module_progress (user_id, module_id, status)
SELECT 
  p.id,
  lm.id,
  'unlocked'
FROM profiles p
CROSS JOIN learning_modules lm
WHERE lm.number = '00' 
  AND lm.track_id = (SELECT id FROM learning_tracks WHERE name = 'Mentalidade')
ON CONFLICT (user_id, module_id) DO NOTHING;