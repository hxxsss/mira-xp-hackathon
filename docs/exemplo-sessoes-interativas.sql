-- Exemplo: Inserir sessões interativas em um módulo da Trilha Mentalidade
-- Este script atualiza o conteúdo de um módulo para incluir sessões do tipo "Termine a Frase"

-- IMPORTANTE: Substitua 'SEU_MODULO_ID' pelo ID real do módulo que você deseja atualizar

-- Exemplo 1: Adicionar uma única sessão "Termine a Frase"
UPDATE learning_modules
SET content = jsonb_build_object(
  'lessons', jsonb_build_array(
    jsonb_build_object(
      'id', 1,
      'title', 'Mentalidade Financeira',
      'type', 'interactive_sessions',
      'sessions', jsonb_build_array(
        jsonb_build_object(
          'type', 'complete_sentence',
          'data', jsonb_build_object(
            'sentence', 'Dinheiro não aceita ____ para o futuro.',
            'options', jsonb_build_array('Desaforo', 'Desculpas', 'Atraso'),
            'correctIndex', 0
          )
        )
      )
    )
  )
)
WHERE title ILIKE '%mentalidade%'
  AND track_id IN (SELECT id FROM learning_tracks WHERE name ILIKE '%mentalidade%')
LIMIT 1;

-- Exemplo 2: Adicionar múltiplas sessões em uma lição
UPDATE learning_modules
SET content = jsonb_build_object(
  'lessons', jsonb_build_array(
    jsonb_build_object(
      'id', 1,
      'title', 'Frases da Mentalidade Financeira',
      'type', 'interactive_sessions',
      'sessions', jsonb_build_array(
        jsonb_build_object(
          'type', 'complete_sentence',
          'data', jsonb_build_object(
            'sentence', 'Dinheiro não aceita ____ para o futuro.',
            'options', jsonb_build_array('Desaforo', 'Desculpas', 'Atraso'),
            'correctIndex', 0
          )
        ),
        jsonb_build_object(
          'type', 'complete_sentence',
          'data', jsonb_build_object(
            'sentence', 'Investir é ____ o dinheiro trabalhar para você.',
            'options', jsonb_build_array('fazer', 'deixar', 'forçar'),
            'correctIndex', 1
          )
        ),
        jsonb_build_object(
          'type', 'complete_sentence',
          'data', jsonb_build_object(
            'sentence', 'A ____ é a melhor estratégia para crescer patrimônio.',
            'options', jsonb_build_array('pressa', 'paciência', 'sorte'),
            'correctIndex', 1
          )
        )
      )
    ),
    jsonb_build_object(
      'id', 2,
      'title', 'Quiz Final',
      'type', 'quiz',
      'questions', jsonb_build_array(
        jsonb_build_object(
          'question', 'Qual é a primeira regra de ouro das finanças?',
          'options', jsonb_build_array(
            'Gastar menos do que ganha',
            'Investir em ações',
            'Ter muitos cartões de crédito',
            'Pedir empréstimos'
          ),
          'correct', 0
        )
      )
    )
  )
)
WHERE title ILIKE '%mentalidade%'
  AND track_id IN (SELECT id FROM learning_tracks WHERE name ILIKE '%mentalidade%')
LIMIT 1;

-- Verificar o resultado
SELECT 
  id,
  title,
  content->'lessons'->0->'type' as lesson_type,
  content->'lessons'->0->'sessions' as sessions
FROM learning_modules
WHERE title ILIKE '%mentalidade%'
  AND track_id IN (SELECT id FROM learning_tracks WHERE name ILIKE '%mentalidade%')
LIMIT 1;
