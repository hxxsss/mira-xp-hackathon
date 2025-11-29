-- Exemplo de Sessão: Drag & Drop (Classificação)
-- Tipo: drag_drop

-- Este tipo de sessão permite que o usuário classifique itens arrastando-os para zonas específicas.
-- Ideal para ensinar categorização de gastos (essencial vs supérfluo, necessidade vs desejo, etc.)

-- Estrutura JSON para inserir no campo content do learning_modules:

{
  "type": "drag_drop",
  "data": {
    "title": "Organize seus Gastos",  -- Título opcional da sessão
    "zones": [
      {
        "id": 0,
        "label": "Essencial",       -- Nome da zona
        "color": "green"             -- Cor: green, red, blue, yellow
      },
      {
        "id": 1,
        "label": "Supérfluo",
        "color": "red"
      }
    ],
    "items": [
      {
        "id": "aluguel",
        "label": "Aluguel",
        "correctZone": 0             -- ID da zona correta (0 = Essencial)
      },
      {
        "id": "spotify",
        "label": "Spotify Premium",
        "correctZone": 1             -- ID da zona correta (1 = Supérfluo)
      },
      {
        "id": "mercado",
        "label": "Mercado",
        "correctZone": 0
      },
      {
        "id": "videogame",
        "label": "Jogo de Vídeo Game",
        "correctZone": 1
      }
    ]
  }
}

-- Como funciona:
-- 1. O usuário vê todos os itens disponíveis no topo
-- 2. Duas ou mais zonas aparecem abaixo para classificação
-- 3. O usuário arrasta cada item para a zona que considera correta
-- 4. Se acertar: item é adicionado à zona com feedback verde
-- 5. Se errar: zona pisca em vermelho e item volta para o topo
-- 6. Quando todos os itens estiverem classificados corretamente, a sessão é concluída

-- Exemplo de INSERT completo:

INSERT INTO learning_modules (content)
VALUES (
  '[
    {
      "type": "drag_drop",
      "data": {
        "title": "Essencial ou Supérfluo?",
        "zones": [
          {
            "id": 0,
            "label": "Necessidade",
            "color": "blue"
          },
          {
            "id": 1,
            "label": "Desejo",
            "color": "yellow"
          }
        ],
        "items": [
          {
            "id": "agua",
            "label": "Conta de Água",
            "correctZone": 0
          },
          {
            "id": "cinema",
            "label": "Cinema",
            "correctZone": 1
          },
          {
            "id": "transporte",
            "label": "Transporte",
            "correctZone": 0
          },
          {
            "id": "tenis",
            "label": "Tênis de Marca",
            "correctZone": 1
          }
        ]
      }
    }
  ]'::jsonb
)
WHERE number = '00';
