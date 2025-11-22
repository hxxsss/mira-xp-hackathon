-- Adicionar 10 novas perguntas PvP (2 por nível)

-- Iniciante
INSERT INTO pvp_questions (question_id, level, question, options) VALUES
(
  'ini_04',
  'Iniciante',
  'O que é uma ''Chave Pix'' e qual cuidado de segurança você deve ter com ela?',
  '[
    {"text": "É a sua senha bancária, que você deve compartilhar para receber dinheiro.", "isCorrect": false, "rationale": "Jamais compartilhe sua senha. A chave Pix é apenas um endereço para receber valores."},
    {"text": "É um ''apelido'' da sua conta (CPF, E-mail, Celular) usado para facilitar transferências, mas que não dá acesso ao seu saldo.", "isCorrect": true, "rationale": "A chave Pix serve apenas para identificar o destino do dinheiro, sendo segura para compartilhar, diferente da senha."},
    {"text": "É um código que permite sacar dinheiro sem cartão em qualquer banco.", "isCorrect": false, "rationale": "Chave Pix serve para transferências digitais, não para saques sem autenticação no caixa."},
    {"text": "É um token que muda a cada 30 segundos.", "isCorrect": false, "rationale": "Isso seria um 2FA (autenticação de dois fatores), não uma chave Pix."}
  ]'::jsonb
),
(
  'ini_05',
  'Iniciante',
  'Na regra de orçamento popularmente conhecida como ''50-30-20'', o que os 20% representam?',
  '[
    {"text": "O valor máximo que você pode gastar com lazer.", "isCorrect": false, "rationale": "Lazer geralmente entra nos 30% (Desejos)."},
    {"text": "A parte da renda destinada a Objetivos Financeiros (investir para o futuro) ou pagar dívidas atrasadas.", "isCorrect": true, "rationale": "A regra sugere: 50% Necessidades, 30% Desejos e 20% Investimentos/Dívidas."},
    {"text": "O imposto que o governo cobra sobre seu salário.", "isCorrect": false, "rationale": "O orçamento é calculado sobre a renda líquida, pós-impostos."},
    {"text": "O valor destinado a pagar o aluguel.", "isCorrect": false, "rationale": "Aluguel é uma necessidade essencial, entrando nos 50%."}
  ]'::jsonb
);

-- Básico
INSERT INTO pvp_questions (question_id, level, question, options) VALUES
(
  'bas_04',
  'Básico',
  'Se o seu salário aumenta 5% em um ano, mas a inflação (IPCA) foi de 10% no mesmo período, o que aconteceu com seu poder de compra?',
  '[
    {"text": "Aumentou, pois você ganhou 5% a mais em dinheiro.", "isCorrect": false, "rationale": "Ganho nominal não é ganho real. O dinheiro aumentou, mas compra menos coisas."},
    {"text": "Diminuiu, pois os preços subiram mais do que o seu salário, resultando em perda real.", "isCorrect": true, "rationale": "Para manter o poder de compra, o salário precisaria ter subido pelo menos igual à inflação (10%)."},
    {"text": "Ficou igual, pois o aumento salarial compensou metade da inflação.", "isCorrect": false, "rationale": "Compensar metade significa que você ainda perdeu a outra metade do poder de compra."},
    {"text": "Aumentou 15%, somando o salário e a inflação.", "isCorrect": false, "rationale": "Salário e inflação jogam em times opostos nessa conta."}
  ]'::jsonb
),
(
  'bas_05',
  'Básico',
  'Qual é a principal função da Taxa Selic na economia brasileira?',
  '[
    {"text": "Determinar o preço do dólar.", "isCorrect": false, "rationale": "O câmbio no Brasil é flutuante, não fixado pela Selic."},
    {"text": "Ser a taxa básica de juros da economia, usada pelo Banco Central para controlar a inflação.", "isCorrect": true, "rationale": "Ao subir a Selic, o BC encarece o crédito e desestimula o consumo para baixar a inflação. Ao descer, estimula a economia."},
    {"text": "Aumentar o imposto sobre grandes fortunas.", "isCorrect": false, "rationale": "Selic é juros, não imposto."},
    {"text": "Definir o valor do salário mínimo.", "isCorrect": false, "rationale": "O salário mínimo segue regras próprias de reajuste, não diretamente a Selic."}
  ]'::jsonb
);

-- Intermediário
INSERT INTO pvp_questions (question_id, level, question, options) VALUES
(
  'int_04',
  'Intermediário',
  'Qual título do Tesouro Direto é o mais indicado para proteger seu dinheiro contra a inflação no longo prazo (ex: aposentadoria)?',
  '[
    {"text": "Tesouro Prefixado.", "isCorrect": false, "rationale": "O Prefixado é arriscado para longo prazo, pois se a inflação explodir, seu ganho real pode virar prejuízo."},
    {"text": "Tesouro Selic.", "isCorrect": false, "rationale": "O Selic é ótimo para reserva de emergência e curto prazo, mas não garante ganho real fixo acima da inflação."},
    {"text": "Tesouro IPCA+.", "isCorrect": true, "rationale": "Ele paga uma taxa fixa MAIS a variação da inflação (IPCA), garantindo que seu dinheiro sempre cresça acima do aumento dos preços."},
    {"text": "Poupança.", "isCorrect": false, "rationale": "A poupança frequentemente perde para a inflação no longo prazo."}
  ]'::jsonb
),
(
  'int_05',
  'Intermediário',
  'O Fundo Garantidor de Créditos (FGC) protege até R$ 250 mil por banco. Existe um teto global para essa proteção?',
  '[
    {"text": "Não, você pode ter R$ 250 mil em 50 bancos diferentes e receber tudo.", "isCorrect": false, "rationale": "Existe um limite global para evitar abusos do sistema."},
    {"text": "Sim, o teto é de R$ 1 milhão por CPF a cada período de 4 anos.", "isCorrect": true, "rationale": "Se você tiver 5 contas com 250 mil cada e todos os bancos quebrarem, você só recupera até 1 milhão no total."},
    {"text": "Sim, o teto é de R$ 500 mil por vida inteira.", "isCorrect": false, "rationale": "O teto se renova a cada 4 anos (run-off)."},
    {"text": "Só existe teto para contas PJ, PF é ilimitado.", "isCorrect": false, "rationale": "A regra do teto de 1 milhão vale para todos."}
  ]'::jsonb
);

-- Avançado
INSERT INTO pvp_questions (question_id, level, question, options) VALUES
(
  'adv_04',
  'Avançado',
  'No mercado financeiro, o que significa operar ''Vendido'' (Short Selling)?',
  '[
    {"text": "Vender todas as suas ações para fugir da Bolsa.", "isCorrect": false, "rationale": "Isso é ''zerar posição''."},
    {"text": "Vender um ativo que você não possui (alugado), apostando que o preço vai cair para recomprá-lo mais barato depois.", "isCorrect": true, "rationale": "É uma estratégia para lucrar na queda. Você vende caro hoje, recompra barato amanhã e devolve o ativo ao dono original, ficando com a diferença."},
    {"text": "Vender ações para pagar dívidas de curto prazo.", "isCorrect": false, "rationale": "Short é uma operação especulativa, não de liquidez."},
    {"text": "Investir apenas em empresas do varejo (vendas).", "isCorrect": false, "rationale": "Não tem relação com o setor da empresa."}
  ]'::jsonb
),
(
  'adv_05',
  'Avançado',
  'Debêntures Incentivadas são títulos de dívida emitidos por empresas para financiar infraestrutura. Qual o principal atrativo fiscal delas para a Pessoa Física?',
  '[
    {"text": "Garantia do FGC ilimitada.", "isCorrect": false, "rationale": "Debêntures NÃO possuem garantia do FGC, o risco é da empresa quebrar."},
    {"text": "Isenção total de Imposto de Renda sobre os rendimentos.", "isCorrect": true, "rationale": "O governo isenta o IR para incentivar investidores a financiarem obras de infraestrutura (estradas, energia, saneamento)."},
    {"text": "Pagamento de dividendos mensais obrigatórios.", "isCorrect": false, "rationale": "Debêntures pagam juros (cupons), não dividendos, e a periodicidade varia."},
    {"text": "Possibilidade de converter a dívida em ações do governo.", "isCorrect": false, "rationale": "Debêntures são dívidas privadas, não públicas, e geralmente não conversíveis dessa forma."}
  ]'::jsonb
);