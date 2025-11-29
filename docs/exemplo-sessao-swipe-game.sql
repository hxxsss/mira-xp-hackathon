-- Exemplo de Sessão Tipo 7: Swipe Game (Compra ou Passa)
-- Estilo Tinder para decisões financeiras

-- Estrutura JSON para usar no campo `sessions` dentro de `interactive_sessions`

{
  "type": "swipe_game",
  "data": {
    "cards": [
      {
        "id": "1",
        "title": "Tênis de Marca",
        "price": 899.90,
        "emoji": "👟",
        "isImpulsive": true,
        "description": "Edição limitada com influencer"
      },
      {
        "id": "2",
        "title": "Conta de Luz",
        "price": 145.00,
        "emoji": "💡",
        "isImpulsive": false,
        "description": "Vencimento em 5 dias"
      },
      {
        "id": "3",
        "title": "Jantar Fancy",
        "price": 320.00,
        "emoji": "🍽️",
        "isImpulsive": true,
        "description": "Restaurante que vi no Instagram"
      },
      {
        "id": "4",
        "title": "Remédio da Receita",
        "price": 85.00,
        "emoji": "💊",
        "isImpulsive": false,
        "description": "Prescrição médica"
      },
      {
        "id": "5",
        "title": "Gadget Tech Novo",
        "price": 1200.00,
        "emoji": "📱",
        "isImpulsive": true,
        "description": "Só porque lançou ontem"
      }
    ]
  }
}

-- CAMPOS:
-- id: Identificador único do cartão (string)
-- title: Nome do produto/serviço (string)
-- price: Preço em R$ (number)
-- emoji: Ícone visual do item (string)
-- isImpulsive: true = gasto supérfluo / false = gasto necessário (boolean)
-- description: Texto descritivo opcional (string, opcional)

-- MECÂNICA:
-- 1. Cartões aparecem em pilha no centro
-- 2. Usuário desliza LEFT (Passa/Economiza) ou RIGHT (Compra/Gasta)
-- 3. Botões X (esquerda) e ♥ (direita) disponíveis
-- 4. Feedback imediato após cada decisão
-- 5. Resumo final mostra valor total economizado

-- LÓGICA DE PONTUAÇÃO:
-- Swipe LEFT em isImpulsive=true: Feedback positivo + adiciona ao valor economizado
-- Swipe RIGHT em isImpulsive=true: Feedback educativo (erro)
-- Swipe LEFT em isImpulsive=false: Feedback educativo (erro)
-- Swipe RIGHT em isImpulsive=false: Feedback positivo

-- DICAS DE USO:
-- - Use 5-7 cartões por sessão
-- - Misture gastos impulsivos e necessários
-- - Use emojis expressivos e preços realistas
-- - Descrições curtas e impactantes
-- - Ajuste isImpulsive conforme o objetivo educacional
