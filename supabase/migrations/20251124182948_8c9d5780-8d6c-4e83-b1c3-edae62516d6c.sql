-- Atualizar Módulo 01: A Ilusão do Crédito
UPDATE learning_modules
SET content = $$
{
  "type": "journey",
  "steps": [
    {
      "id": "step-1",
      "step_number": 1,
      "title": "O Cartão Mágico",
      "subtitle": "Reflita sobre sua relação com o crédito",
      "question": "Como você se sente ao receber um aumento de limite no cartão?",
      "options": [
        {"emoji": "🎉", "label": "Animado, é mais poder de compra!", "color": "#10b981"},
        {"emoji": "😰", "label": "Preocupado, é mais tentação", "color": "#f59e0b"},
        {"emoji": "🤔", "label": "Indiferente, não muda nada", "color": "#6366f1"},
        {"emoji": "❌", "label": "Recuso aumentos de limite", "color": "#8b5cf6"}
      ]
    },
    {
      "id": "step-2",
      "step_number": 2,
      "title": "Comprar Agora, Pagar Depois?",
      "subtitle": "A armadilha do parcelamento",
      "question": "O que você pensa quando vê parcelado sem juros?",
      "options": [
        {"emoji": "💳", "label": "Perfeito! Posso comprar mais", "color": "#10b981"},
        {"emoji": "🧮", "label": "Calculo se cabe no orçamento", "color": "#8b5cf6"},
        {"emoji": "⚠️", "label": "Sei que ainda é dívida", "color": "#f59e0b"},
        {"emoji": "🚫", "label": "Prefiro comprar à vista", "color": "#ef4444"}
      ]
    },
    {
      "id": "step-3",
      "step_number": 3,
      "title": "O Preço Real",
      "subtitle": "Enxergando além das parcelas",
      "question": "Você calcula o valor total antes de parcelar uma compra?",
      "options": [
        {"emoji": "❌", "label": "Não, só olho o valor da parcela", "color": "#ef4444"},
        {"emoji": "🤷", "label": "Às vezes, depende do valor", "color": "#f59e0b"},
        {"emoji": "✅", "label": "Sempre verifico o total", "color": "#10b981"},
        {"emoji": "📊", "label": "Comparo à vista vs parcelado", "color": "#8b5cf6"}
      ]
    },
    {
      "id": "step-4",
      "step_number": 4,
      "title": "Crédito vs. Dinheiro",
      "subtitle": "A diferença que poucos entendem",
      "question": "Qual a diferença entre ter limite disponível e ter dinheiro?",
      "options": [
        {"emoji": "🤔", "label": "Não vejo diferença", "color": "#6366f1"},
        {"emoji": "💡", "label": "Limite é empréstimo, não é meu", "color": "#8b5cf6"},
        {"emoji": "💰", "label": "Dinheiro é real, crédito é virtual", "color": "#10b981"},
        {"emoji": "⚡", "label": "Um é meu, outro vou pagar", "color": "#f59e0b"}
      ]
    },
    {
      "id": "step-5",
      "step_number": 5,
      "title": "Seu Compromisso",
      "subtitle": "Hora de mudar sua relação com o crédito",
      "question": "Você está pronto para usar o crédito com consciência?",
      "options": [
        {"emoji": "🎯", "label": "Sim, vou planejar cada compra", "color": "#8b5cf6"},
        {"emoji": "💪", "label": "Vou reduzir o uso do cartão", "color": "#10b981"},
        {"emoji": "📝", "label": "Vou anotar todos os gastos", "color": "#6366f1"},
        {"emoji": "🔥", "label": "Só emergências no crédito", "color": "#f59e0b"}
      ]
    }
  ]
}
$$::jsonb
WHERE number = '01';

-- Atualizar Módulo 02: O Ralo Invisível
UPDATE learning_modules
SET content = $$
{
  "type": "journey",
  "steps": [
    {
      "id": "step-1",
      "step_number": 1,
      "title": "Café e Consequências",
      "subtitle": "Os pequenos gastos que você ignora",
      "question": "Quanto você gasta com coisinhas pequenas por mês?",
      "options": [
        {"emoji": "🤷", "label": "Não faço ideia", "color": "#ef4444"},
        {"emoji": "💸", "label": "Uns R$ 50-100", "color": "#f59e0b"},
        {"emoji": "📊", "label": "Entre R$ 100-300", "color": "#6366f1"},
        {"emoji": "😱", "label": "Mais de R$ 300!", "color": "#8b5cf6"}
      ]
    },
    {
      "id": "step-2",
      "step_number": 2,
      "title": "Streaming e Assinaturas",
      "subtitle": "Serviços que drenam sua conta",
      "question": "Quantos serviços você paga e raramente usa?",
      "options": [
        {"emoji": "✅", "label": "Nenhum, uso todos", "color": "#10b981"},
        {"emoji": "1️⃣", "label": "1 ou 2 serviços", "color": "#6366f1"},
        {"emoji": "😬", "label": "3 a 5 serviços", "color": "#f59e0b"},
        {"emoji": "💀", "label": "Mais de 5!", "color": "#ef4444"}
      ]
    },
    {
      "id": "step-3",
      "step_number": 3,
      "title": "Delivery é Praticidade?",
      "subtitle": "O custo da conveniência",
      "question": "Com que frequência você pede comida por app?",
      "options": [
        {"emoji": "🏠", "label": "Raramente, cozinho em casa", "color": "#10b981"},
        {"emoji": "📅", "label": "1-2 vezes por semana", "color": "#6366f1"},
        {"emoji": "🍕", "label": "3-5 vezes por semana", "color": "#f59e0b"},
        {"emoji": "🚨", "label": "Quase todo dia!", "color": "#ef4444"}
      ]
    },
    {
      "id": "step-4",
      "step_number": 4,
      "title": "Somando os Vazamentos",
      "subtitle": "O poder dos pequenos valores",
      "question": "Se você economizasse R$ 200/mês, em 1 ano teria quanto?",
      "options": [
        {"emoji": "🤔", "label": "Não sei calcular", "color": "#6366f1"},
        {"emoji": "💰", "label": "R$ 2.400 - quase uma viagem!", "color": "#8b5cf6"},
        {"emoji": "🎯", "label": "R$ 2.400 - minha reserva", "color": "#10b981"},
        {"emoji": "😱", "label": "Uau, não pensei nisso!", "color": "#f59e0b"}
      ]
    },
    {
      "id": "step-5",
      "step_number": 5,
      "title": "Plugando o Ralo",
      "subtitle": "Seu primeiro passo concreto",
      "question": "Qual micro-gasto você eliminará primeiro?",
      "options": [
        {"emoji": "☕", "label": "Cafés e lanches fora", "color": "#f59e0b"},
        {"emoji": "📺", "label": "Assinaturas não usadas", "color": "#6366f1"},
        {"emoji": "🍔", "label": "Delivery frequente", "color": "#ef4444"},
        {"emoji": "🛍️", "label": "Comprinhas impulsivas", "color": "#8b5cf6"}
      ]
    }
  ]
}
$$::jsonb
WHERE number = '02';

-- Atualizar Módulo 03: Gatilhos e Impulsos
UPDATE learning_modules
SET content = $$
{
  "type": "journey",
  "steps": [
    {
      "id": "step-1",
      "step_number": 1,
      "title": "O Que Te Move?",
      "subtitle": "Reconhecendo suas emoções",
      "question": "Quando você compra sem planejar, o que está sentindo?",
      "options": [
        {"emoji": "😢", "label": "Triste ou frustrado", "color": "#6366f1"},
        {"emoji": "😊", "label": "Feliz e celebrando", "color": "#10b981"},
        {"emoji": "😰", "label": "Ansioso ou estressado", "color": "#f59e0b"},
        {"emoji": "😴", "label": "Entediado", "color": "#8b5cf6"}
      ]
    },
    {
      "id": "step-2",
      "step_number": 2,
      "title": "Black Friday Mental",
      "subtitle": "A urgência artificial",
      "question": "Como você reage a promoções só hoje?",
      "options": [
        {"emoji": "🏃", "label": "Compro rápido antes de acabar!", "color": "#ef4444"},
        {"emoji": "🤔", "label": "Paro para pensar se preciso", "color": "#6366f1"},
        {"emoji": "🔍", "label": "Pesquiso se é realmente promoção", "color": "#8b5cf6"},
        {"emoji": "🚫", "label": "Ignoro, é tática de venda", "color": "#10b981"}
      ]
    },
    {
      "id": "step-3",
      "step_number": 3,
      "title": "Redes Sociais",
      "subtitle": "O feed que vende",
      "question": "Você compra coisas que viu no Instagram/TikTok?",
      "options": [
        {"emoji": "📱", "label": "Sim, direto!", "color": "#ef4444"},
        {"emoji": "🛒", "label": "Às vezes, quando acho legal", "color": "#f59e0b"},
        {"emoji": "💭", "label": "Raramente, só se realmente preciso", "color": "#6366f1"},
        {"emoji": "🛡️", "label": "Não, sei que é marketing", "color": "#10b981"}
      ]
    },
    {
      "id": "step-4",
      "step_number": 4,
      "title": "A Pausa Estratégica",
      "subtitle": "O poder das 24 horas",
      "question": "Você espera 24h antes de compras não essenciais?",
      "options": [
        {"emoji": "⚡", "label": "Não, compro na hora", "color": "#ef4444"},
        {"emoji": "🤷", "label": "Depende do valor", "color": "#f59e0b"},
        {"emoji": "⏰", "label": "Sim, sempre espero", "color": "#10b981"},
        {"emoji": "📝", "label": "Anoto na lista de desejos", "color": "#8b5cf6"}
      ]
    },
    {
      "id": "step-5",
      "step_number": 5,
      "title": "Seu Botão de Pausa",
      "subtitle": "Criando seu sistema anti-impulso",
      "question": "Qual estratégia você usará para frear impulsos?",
      "options": [
        {"emoji": "⏸️", "label": "Regra das 24 horas", "color": "#8b5cf6"},
        {"emoji": "💰", "label": "Limite diário de gastos", "color": "#10b981"},
        {"emoji": "📱", "label": "Desinstalar apps de compra", "color": "#ef4444"},
        {"emoji": "🤝", "label": "Consultar alguém antes", "color": "#6366f1"}
      ]
    }
  ]
}
$$::jsonb
WHERE number = '03';

-- Atualizar Módulo 04: O Custo Social (FOMO)
UPDATE learning_modules
SET content = $$
{
  "type": "journey",
  "steps": [
    {
      "id": "step-1",
      "step_number": 1,
      "title": "Acompanhar o Grupo",
      "subtitle": "A pressão dos amigos",
      "question": "Você gasta mais quando está com amigos?",
      "options": [
        {"emoji": "💸", "label": "Muito mais, não quero ficar pra trás", "color": "#ef4444"},
        {"emoji": "🤝", "label": "Um pouco, mas dentro do meu limite", "color": "#f59e0b"},
        {"emoji": "💪", "label": "Não, tenho meus próprios limites", "color": "#10b981"},
        {"emoji": "🎯", "label": "Sugiro alternativas mais baratas", "color": "#8b5cf6"}
      ]
    },
    {
      "id": "step-2",
      "step_number": 2,
      "title": "Lifestyle nas Redes",
      "subtitle": "A vida perfeita dos outros",
      "question": "Você se sente pressionado a mostrar conquistas?",
      "options": [
        {"emoji": "📸", "label": "Sim, preciso postar minhas compras", "color": "#ef4444"},
        {"emoji": "😬", "label": "Às vezes sinto essa pressão", "color": "#f59e0b"},
        {"emoji": "😌", "label": "Não, minha vida não é vitrine", "color": "#10b981"},
        {"emoji": "🧘", "label": "Nem uso muito redes sociais", "color": "#8b5cf6"}
      ]
    },
    {
      "id": "step-3",
      "step_number": 3,
      "title": "Eventos e Compromissos",
      "subtitle": "Rolês que pesam no bolso",
      "question": "Quantos programas você aceita por obrigação social?",
      "options": [
        {"emoji": "📅", "label": "Quase todos, não gosto de dizer não", "color": "#ef4444"},
        {"emoji": "🎭", "label": "Vários, sinto que preciso ir", "color": "#f59e0b"},
        {"emoji": "🎯", "label": "Poucos, escolho o que quero", "color": "#10b981"},
        {"emoji": "🚫", "label": "Só vou se realmente quiser", "color": "#8b5cf6"}
      ]
    },
    {
      "id": "step-4",
      "step_number": 4,
      "title": "Comparação e Felicidade",
      "subtitle": "O termômetro da satisfação",
      "question": "Sua satisfação depende do que os outros têm?",
      "options": [
        {"emoji": "😔", "label": "Sim, sempre me comparo", "color": "#ef4444"},
        {"emoji": "😕", "label": "Às vezes fico incomodado", "color": "#f59e0b"},
        {"emoji": "😊", "label": "Não, cada um tem seu ritmo", "color": "#10b981"},
        {"emoji": "🌟", "label": "Foco em minhas próprias metas", "color": "#8b5cf6"}
      ]
    },
    {
      "id": "step-5",
      "step_number": 5,
      "title": "Sua Liberdade",
      "subtitle": "Definindo seus próprios valores",
      "question": "Você está pronto para viver seus próprios valores?",
      "options": [
        {"emoji": "🦅", "label": "Sim, vou parar de me comparar", "color": "#8b5cf6"},
        {"emoji": "🎯", "label": "Vou focar em minhas metas", "color": "#10b981"},
        {"emoji": "💬", "label": "Vou ser honesto sobre meus limites", "color": "#6366f1"},
        {"emoji": "🛡️", "label": "Vou filtrar influências tóxicas", "color": "#f59e0b"}
      ]
    }
  ]
}
$$::jsonb
WHERE number = '04';

-- Atualizar Módulo 05: O Próximo Passo
UPDATE learning_modules
SET content = $$
{
  "type": "journey",
  "steps": [
    {
      "id": "step-1",
      "step_number": 1,
      "title": "Reconhecendo Padrões",
      "subtitle": "Olhe para trás e aprenda",
      "question": "Qual foi sua maior descoberta até aqui?",
      "options": [
        {"emoji": "💳", "label": "Eu uso crédito sem consciência", "color": "#ef4444"},
        {"emoji": "💸", "label": "Pequenos gastos viram grandes perdas", "color": "#f59e0b"},
        {"emoji": "🎯", "label": "Compro por impulso emocional", "color": "#6366f1"},
        {"emoji": "👥", "label": "Me comparo muito com outros", "color": "#8b5cf6"}
      ]
    },
    {
      "id": "step-2",
      "step_number": 2,
      "title": "Sua Maior Armadilha",
      "subtitle": "Identificando o principal desafio",
      "question": "Qual comportamento você mais precisa mudar?",
      "options": [
        {"emoji": "💳", "label": "Usar menos o cartão de crédito", "color": "#ef4444"},
        {"emoji": "☕", "label": "Cortar os micro-gastos", "color": "#f59e0b"},
        {"emoji": "🛍️", "label": "Parar compras impulsivas", "color": "#6366f1"},
        {"emoji": "🚫", "label": "Dizer não à pressão social", "color": "#8b5cf6"}
      ]
    },
    {
      "id": "step-3",
      "step_number": 3,
      "title": "Definindo Limites",
      "subtitle": "Seu primeiro limite concreto",
      "question": "Qual será seu primeiro limite pessoal de gastos?",
      "options": [
        {"emoji": "💰", "label": "Limite diário (ex: R$ 50/dia)", "color": "#10b981"},
        {"emoji": "🛒", "label": "Compras acima de R$ 100 exigem 24h", "color": "#6366f1"},
        {"emoji": "📱", "label": "Máximo 2 deliveries por semana", "color": "#f59e0b"},
        {"emoji": "🎯", "label": "Só programas que caibam no orçamento", "color": "#8b5cf6"}
      ]
    },
    {
      "id": "step-4",
      "step_number": 4,
      "title": "Rede de Apoio",
      "subtitle": "Você não precisa fazer isso sozinho",
      "question": "Quem pode te apoiar nessa mudança?",
      "options": [
        {"emoji": "👨‍👩‍👧", "label": "Família", "color": "#10b981"},
        {"emoji": "🤝", "label": "Amigos próximos", "color": "#6366f1"},
        {"emoji": "💑", "label": "Parceiro(a)", "color": "#f59e0b"},
        {"emoji": "💪", "label": "Vou fazer sozinho primeiro", "color": "#8b5cf6"}
      ]
    },
    {
      "id": "step-5",
      "step_number": 5,
      "title": "Compromisso Final",
      "subtitle": "Da reflexão para a ação",
      "question": "Qual ação concreta você tomará ESTA SEMANA?",
      "options": [
        {"emoji": "📊", "label": "Anotar TODOS os gastos", "color": "#8b5cf6"},
        {"emoji": "✂️", "label": "Cancelar 1 assinatura não usada", "color": "#10b981"},
        {"emoji": "💰", "label": "Definir orçamento semanal", "color": "#6366f1"},
        {"emoji": "🎯", "label": "Usar apenas dinheiro/débito", "color": "#f59e0b"}
      ]
    }
  ]
}
$$::jsonb
WHERE number = '05';