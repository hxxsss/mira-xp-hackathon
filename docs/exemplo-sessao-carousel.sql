-- Exemplo: Adicionar sessão de carrossel explicativo ao módulo da Trilha Mentalidade
-- Este script adiciona uma sessão tipo "carousel" com 3 slides sobre gatilhos de compra

-- Atualizar módulo com carrossel de "Gatilhos de Compra"
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
        ),
        jsonb_build_object(
          'type', 'complete_sentence',
          'data', jsonb_build_object(
            'sentence', 'Para sobrar dinheiro, eu preciso gastar ____ do que ganho.',
            'options', jsonb_build_array('Mais', 'Igual', 'Menos'),
            'correctIndex', 2
          )
        ),
        jsonb_build_object(
          'type', 'carousel',
          'data', jsonb_build_object(
            'slides', jsonb_build_array(
              jsonb_build_object(
                'emoji', '😢',
                'title', 'O Gatilho Emocional',
                'text', 'Tudo começa com uma sensação ruim: tédio, tristeza ou cansaço após um dia longo.'
              ),
              jsonb_build_object(
                'emoji', '🛒',
                'title', 'A Ação Impulsiva',
                'text', 'Seu cérebro busca alívio rápido. Você abre o app de delivery ou loja online sem pensar.'
              ),
              jsonb_build_object(
                'emoji', '😌',
                'title', 'A Recompensa Falsa',
                'text', 'O prazer da compra dura pouco. Logo depois, vem a culpa da fatura. É um ciclo vicioso.'
              )
            )
          )
        )
      )
    )
  )
)
WHERE id = '04789d9f-7244-46dc-be26-fe3332cf7705';

-- Verificar o resultado
SELECT 
  id,
  title,
  content->'lessons'->0->'sessions' as sessions
FROM learning_modules
WHERE id = '04789d9f-7244-46dc-be26-fe3332cf7705';
