-- Atualizar módulo 1 com nova pergunta do PDF
UPDATE learning_modules 
SET content = jsonb_set(
  content,
  '{lessons}',
  '[
    {
      "id": 1,
      "title": "Introdução ao Orçamento Pessoal",
      "type": "text",
      "content": "O orçamento pessoal é a ferramenta fundamental para ter controle financeiro. Ele permite visualizar claramente suas receitas e despesas, ajudando a tomar decisões mais conscientes sobre o uso do dinheiro."
    },
    {
      "id": 2,
      "title": "Quiz: Teste seus conhecimentos",
      "type": "quiz",
      "questions": [
        {
          "question": "Qual é o objetivo principal e mais básico de criar um Orçamento Pessoal?",
          "hint": "Pense no orçamento como um mapa que mostra para onde o seu dinheiro está indo.",
          "options": [
            "Acumular o máximo de dívidas possível para usar o crédito do banco.",
            "Controlar as receitas e despesas para gerenciar melhor o dinheiro e definir metas de economia.",
            "Anotar apenas as despesas fixas, ignorando os gastos variáveis e supérfluos.",
            "Comprar bens de luxo no impulso para aproveitar promoções.",
            "Gastar o dinheiro o mais rápido possível para evitar a inflação."
          ],
          "correct": 1,
          "justifications": {
            "0": {"type": "incorrect", "text": "O orçamento é a ferramenta que ajuda a evitar dívidas, e não a incentivá-las. Seu objetivo é o controle e a saúde financeira."},
            "1": {"type": "correct", "text": "O orçamento é a ferramenta fundamental para ter uma visão clara da entrada (receitas) e saída (despesas) de dinheiro, permitindo o controle financeiro e a definição de objetivos."},
            "2": {"type": "incorrect", "text": "Para ser eficaz, o orçamento deve incluir todas as despesas (fixas, variáveis e supérfluas), pois os gastos menores podem somar grandes valores."},
            "3": {"type": "incorrect", "text": "O orçamento visa o planejamento e a disciplina, o que é o oposto do consumo por impulso, que pode comprometer a saúde financeira."},
            "4": {"type": "incorrect", "text": "Esta alternativa está incorreta e vai contra o princípio básico de planejamento financeiro."}
          }
        }
      ]
    }
  ]'::jsonb
)
WHERE number = '1';