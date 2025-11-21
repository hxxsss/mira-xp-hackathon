-- Atualizar módulos 2 a 10 com novas perguntas do PDF

-- Módulo 2 - Reserva de Emergência
UPDATE learning_modules 
SET content = jsonb_set(
  content,
  '{lessons}',
  '[
    {
      "id": 1,
      "title": "O que é Reserva de Emergência",
      "type": "text",
      "content": "A reserva de emergência é um colchão financeiro essencial para cobrir imprevistos como desemprego, problemas de saúde ou reparos urgentes. O valor recomendado é de 6 a 12 meses das suas despesas mensais."
    },
    {
      "id": 2,
      "title": "Quiz: Teste seus conhecimentos",
      "type": "quiz",
      "questions": [
        {
          "question": "Qual a finalidade primordial de uma Reserva de Emergência e qual o valor geralmente recomendado para ela?",
          "hint": "Pense no que aconteceria se você perdesse sua fonte de renda por um tempo.",
          "options": [
            "Investir em ativos de alto risco, como ações, buscando grandes lucros imediatos e deve ser de 1 a 2 meses do custo de vida.",
            "Comprar a casa própria o mais rápido possível e deve ser de no mínimo 24 meses do custo de vida.",
            "Cobrir gastos inesperados, como desemprego ou problemas de saúde, e deve ser de 6 a 12 meses do custo de vida.",
            "Servir como capital de giro para abrir um novo negócio e deve ser o mínimo necessário para pagar as contas básicas do mês.",
            "Pagar todas as dívidas anuais antecipadamente e deve ser de 3 meses de salário líquido."
          ],
          "correct": 2,
          "justifications": {
            "0": {"type": "incorrect", "text": "A reserva de emergência deve ser investida em opções de baixíssimo risco e alta liquidez, e não em ativos voláteis."},
            "1": {"type": "incorrect", "text": "O valor da reserva de emergência é menor (6 a 12 meses) e tem como foco a segurança contra imprevistos, e não a aquisição de um bem de alto valor."},
            "2": {"type": "correct", "text": "A reserva de emergência é um colchão financeiro para imprevistos, protegendo o indivíduo de contrair dívidas caras ou resgatar investimentos de longo prazo em momentos inoportunos. O valor sugerido é de 6 a 12 meses de despesas mensais."},
            "3": {"type": "incorrect", "text": "O capital para um negócio é um investimento separado, e a reserva de emergência deve ser um valor maior do que apenas um mês de contas."},
            "4": {"type": "incorrect", "text": "A reserva cobre gastos inesperados, e o pagamento de dívidas anuais antecipadamente deve ser considerado no orçamento regular, não sendo a principal função da reserva."}
          }
        }
      ]
    }
  ]'::jsonb
)
WHERE number = '2';

-- Módulo 3 - Ativo vs. Passivo
UPDATE learning_modules 
SET content = jsonb_set(
  content,
  '{lessons}',
  '[
    {
      "id": 1,
      "title": "Entendendo Ativos e Passivos",
      "type": "text",
      "content": "Um ativo é algo que coloca dinheiro no seu bolso, gerando renda ou valorizando. Um passivo é algo que tira dinheiro do seu bolso através de despesas. Essa distinção, popularizada por Robert Kiyosaki, é fundamental para construir riqueza."
    },
    {
      "id": 2,
      "title": "Quiz: Teste seus conhecimentos",
      "type": "quiz",
      "questions": [
        {
          "question": "Em termos de educação financeira, qual das seguintes opções é considerada um Ativo?",
          "hint": "Um ativo, na definição de Robert Kiyosaki (Pai Rico, Pai Pobre), é o que coloca dinheiro no seu bolso.",
          "options": [
            "Um carro financiado usado apenas para locomoção pessoal, que gera parcelas e manutenção.",
            "Um empréstimo pessoal com alta taxa de juros que você deve pagar.",
            "Um cartão de crédito com o limite estourado.",
            "Um imóvel que é alugado e gera renda mensal para você.",
            "O imposto anual (IPVA) do seu veículo particular."
          ],
          "correct": 3,
          "justifications": {
            "0": {"type": "incorrect", "text": "O carro para uso pessoal é um passivo, pois gera despesas (IPVA, manutenção, gasolina) e tira dinheiro do seu bolso."},
            "1": {"type": "incorrect", "text": "Empréstimos e dívidas são passivos, pois representam obrigações financeiras que drenam seu capital."},
            "2": {"type": "incorrect", "text": "O saldo devedor de um cartão de crédito é um passivo com alto custo de juros, o oposto de um ativo."},
            "3": {"type": "correct", "text": "Um ativo é algo que coloca dinheiro no seu bolso, ou seja, gera renda ou tem potencial de valorização. Neste caso, o aluguel é uma fonte de receita."},
            "4": {"type": "incorrect", "text": "O IPVA é uma despesa, uma obrigação financeira, e, portanto, faz parte da categoria de passivos ou despesas, e não de ativos."}
          }
        }
      ]
    }
  ]'::jsonb
)
WHERE number = '3';

-- Módulo 4 - Juros Compostos
UPDATE learning_modules 
SET content = jsonb_set(
  content,
  '{lessons}',
  '[
    {
      "id": 1,
      "title": "O Poder dos Juros Compostos",
      "type": "text",
      "content": "Juros compostos são os juros sobre juros. No longo prazo, esse mecanismo acelera exponencialmente o crescimento do seu capital, sendo considerado a oitava maravilha do mundo por Albert Einstein."
    },
    {
      "id": 2,
      "title": "Quiz: Teste seus conhecimentos",
      "type": "quiz",
      "questions": [
        {
          "question": "Qual o principal benefício dos Juros Compostos em relação aos Juros Simples, especialmente no contexto de investimentos de longo prazo?",
          "hint": "Lembre-se da frase juros sobre juros e como isso afeta a base de cálculo.",
          "options": [
            "Os juros são calculados apenas sobre o valor inicial investido (o capital principal) em todos os períodos.",
            "A rentabilidade é sempre menor que a inflação, garantindo a segurança do capital.",
            "Os juros incidem sobre o valor inicial e também sobre os juros acumulados anteriormente, acelerando o crescimento do capital.",
            "O pagamento de imposto de renda é menor em comparação com o regime de juros simples.",
            "Só podem ser aplicados em investimentos de Renda Variável, como ações."
          ],
          "correct": 2,
          "justifications": {
            "0": {"type": "incorrect", "text": "Esta é a definição de Juros Simples. Nos juros compostos, a base de cálculo aumenta a cada período."},
            "1": {"type": "incorrect", "text": "A rentabilidade ser menor que a inflação representa perda de poder de compra, o que não é um benefício. Os juros compostos podem gerar rentabilidade alta."},
            "2": {"type": "correct", "text": "No regime de juros compostos, o dinheiro rende sobre o principal mais os juros já incorporados, gerando o juros sobre juros, que é o grande motor do crescimento patrimonial no longo prazo."},
            "3": {"type": "incorrect", "text": "A forma de cálculo dos juros não tem relação direta com a alíquota de Imposto de Renda. A tributação depende do tipo de investimento e do prazo."},
            "4": {"type": "incorrect", "text": "Juros compostos são aplicados na maioria dos investimentos, incluindo Renda Fixa, e também em dívidas (como o crédito rotativo do cartão)."}
          }
        }
      ]
    }
  ]'::jsonb
)
WHERE number = '4';

-- Módulo 5 - Inflação
UPDATE learning_modules 
SET content = jsonb_set(
  content,
  '{lessons}',
  '[
    {
      "id": 1,
      "title": "Entendendo a Inflação",
      "type": "text",
      "content": "Inflação é o aumento generalizado dos preços de bens e serviços ao longo do tempo, resultando na perda do poder de compra da moeda. É essencial considerar a inflação em suas decisões de investimento."
    },
    {
      "id": 2,
      "title": "Quiz: Teste seus conhecimentos",
      "type": "quiz",
      "questions": [
        {
          "question": "Qual é o efeito mais direto da Inflação no poder de compra do dinheiro ao longo do tempo?",
          "hint": "Pense no que você conseguia comprar com R$100 há 5 anos e o que compra hoje.",
          "options": [
            "Valorização do dinheiro em relação a outras moedas, como o Dólar.",
            "Redução generalizada dos preços, estimulando o consumo.",
            "Aumento da rentabilidade de todos os investimentos, especialmente a poupança.",
            "Diminuição das taxas de juros básicas (como a SELIC) pelo Banco Central.",
            "Aumento generalizado dos preços, fazendo com que o mesmo valor compre menos bens e serviços."
          ],
          "correct": 4,
          "justifications": {
            "0": {"type": "incorrect", "text": "A valorização cambial é um conceito diferente da inflação doméstica, que se refere ao aumento de preços internos."},
            "1": {"type": "incorrect", "text": "O oposto da inflação é a deflação, que é a redução generalizada de preços. A inflação é o aumento."},
            "2": {"type": "incorrect", "text": "Se a rentabilidade de um investimento for menor que a inflação, o investidor está perdendo poder de compra, mesmo que o valor nominal do dinheiro aumente."},
            "3": {"type": "incorrect", "text": "Em geral, o Banco Central aumenta a taxa SELIC para tentar combater a inflação alta, não o contrário."},
            "4": {"type": "correct", "text": "Inflação é a perda do poder de compra da moeda. Se os preços sobem, a mesma quantidade de dinheiro adquire uma quantidade menor de produtos ou serviços."}
          }
        }
      ]
    }
  ]'::jsonb
)
WHERE number = '5';

-- Módulo 6 - Renda Fixa
UPDATE learning_modules 
SET content = jsonb_set(
  content,
  '{lessons}',
  '[
    {
      "id": 1,
      "title": "Introdução à Renda Fixa",
      "type": "text",
      "content": "Renda Fixa é uma classe de investimentos onde você conhece ou pode estimar a rentabilidade no momento da aplicação. Inclui títulos públicos, CDBs, LCIs, LCAs e debêntures."
    },
    {
      "id": 2,
      "title": "Quiz: Teste seus conhecimentos",
      "type": "quiz",
      "questions": [
        {
          "question": "Qual a principal característica de um investimento classificado como Renda Fixa?",
          "hint": "O termo fixa está relacionado à forma de cálculo dos rendimentos, que é definida ou prevista na contratação.",
          "options": [
            "A rentabilidade é totalmente imprevisível e varia diariamente de acordo com o humor do mercado.",
            "O investidor se torna sócio de uma empresa e participa da distribuição de lucros (dividendos).",
            "O investidor consegue saber ou estimar com antecedência as regras de remuneração (taxa, indexador) no momento da aplicação.",
            "O risco é sempre zero, pois o valor principal é garantido por 100% dos títulos do mercado.",
            "É um investimento com liquidez diária e rentabilidade atrelada apenas ao IPCA."
          ],
          "correct": 2,
          "justifications": {
            "0": {"type": "incorrect", "text": "Esta é a principal característica da Renda Variável. A Renda Fixa busca previsibilidade."},
            "1": {"type": "incorrect", "text": "Essa é a característica do investimento em Ações, que é Renda Variável."},
            "2": {"type": "correct", "text": "Na Renda Fixa, a rentabilidade é determinada por uma taxa (prefixada) ou por um indexador (pós-fixada, como IPCA ou CDI) no momento da compra do título, oferecendo mais previsibilidade ao investidor."},
            "3": {"type": "incorrect", "text": "Embora o risco seja baixo, o risco zero não existe. O FGC (Fundo Garantidor de Créditos) garante até um limite, e nem todos os títulos são cobertos por ele."},
            "4": {"type": "incorrect", "text": "Muitos títulos de Renda Fixa não têm liquidez diária, e alguns têm rentabilidade atrelada ao CDI ou prefixada, não apenas ao IPCA."}
          }
        }
      ]
    }
  ]'::jsonb
)
WHERE number = '6';

-- Módulo 7 - Renda Variável
UPDATE learning_modules 
SET content = jsonb_set(
  content,
  '{lessons}',
  '[
    {
      "id": 1,
      "title": "Introdução à Renda Variável",
      "type": "text",
      "content": "Renda Variável engloba investimentos cuja rentabilidade não pode ser determinada no momento da aplicação. O principal exemplo são as ações, onde você se torna sócio de empresas e participa dos seus resultados."
    },
    {
      "id": 2,
      "title": "Quiz: Teste seus conhecimentos",
      "type": "quiz",
      "questions": [
        {
          "question": "Ao investir em Ações (Renda Variável), qual é a principal forma de remuneração que o investidor pode ter?",
          "hint": "Lembre-se que, ao comprar uma ação, você se torna um pequeno sócio da empresa.",
          "options": [
            "Recebimento de juros fixos anuais, similares aos de títulos públicos (Tesouro Direto).",
            "Valorização do preço da ação no mercado e recebimento de dividendos.",
            "Garantia de que o valor investido nunca será menor do que o capital inicial.",
            "Cobrança de uma taxa de custódia alta que é totalmente revertida para o investidor.",
            "Liquidez imediata garantida pelo Tesouro Nacional em qualquer momento."
          ],
          "correct": 1,
          "justifications": {
            "0": {"type": "incorrect", "text": "Ações não pagam juros fixos. Isso é característica de Renda Fixa. O que é pago são dividendos ou Juros sobre Capital Próprio, que variam."},
            "1": {"type": "correct", "text": "O ganho na Renda Variável, como ações, provém da valorização do papel (vender por um preço maior do que comprou) e da distribuição de parte dos lucros da empresa aos acionistas (dividendos)."},
            "2": {"type": "incorrect", "text": "A Renda Variável não oferece garantia de capital. O investidor pode perder parte ou a totalidade do que investiu, por isso é variável."},
            "3": {"type": "incorrect", "text": "Taxas de custódia são custos para o investidor, e não uma forma de remuneração."},
            "4": {"type": "incorrect", "text": "Embora ações tenham liquidez, o valor da venda não é garantido e varia. A garantia do Tesouro é para Títulos Públicos (Renda Fixa)."}
          }
        }
      ]
    }
  ]'::jsonb
)
WHERE number = '7';

-- Módulo 8 - Diversificação
UPDATE learning_modules 
SET content = jsonb_set(
  content,
  '{lessons}',
  '[
    {
      "id": 1,
      "title": "A Importância da Diversificação",
      "type": "text",
      "content": "Diversificação é a estratégia de distribuir investimentos em diferentes ativos e classes para reduzir riscos. O ditado popular não coloque todos os ovos na mesma cesta resume bem esse conceito."
    },
    {
      "id": 2,
      "title": "Quiz: Teste seus conhecimentos",
      "type": "quiz",
      "questions": [
        {
          "question": "Qual o conceito e a principal utilidade da Diversificação na carteira de investimentos?",
          "hint": "Pense no ditado popular sobre não colocar todos os ovos na mesma cesta.",
          "options": [
            "Concentrar 100% do capital em um único ativo que promete a maior rentabilidade do mercado, maximizando os ganhos.",
            "Comprar apenas ativos de Renda Fixa atrelados à inflação, garantindo que o dinheiro renderá o dobro do IPCA.",
            "Distribuir o dinheiro em diferentes tipos de ativos (Renda Fixa, Renda Variável, Moeda Estrangeira) e setores para reduzir o risco global do portfólio.",
            "Manter todo o dinheiro na conta corrente para ter liquidez total e imediata a qualquer momento.",
            "Trocar de corretora de investimentos todos os meses para aproveitar a taxa zero."
          ],
          "correct": 2,
          "justifications": {
            "0": {"type": "incorrect", "text": "A concentração em um único ativo aumenta o risco (risco não-sistemático) e é o oposto da diversificação."},
            "1": {"type": "incorrect", "text": "Embora seja uma estratégia de proteção, isso não é diversificação (pois é só Renda Fixa) e a rentabilidade não é garantida como o dobro do IPCA."},
            "2": {"type": "correct", "text": "A diversificação visa garantir que, se um tipo de ativo ou setor tiver um desempenho ruim, outros possam compensar a perda, protegendo o capital do investidor de grandes oscilações e reduzindo o risco não-sistemático."},
            "3": {"type": "incorrect", "text": "Manter o dinheiro parado é seguro em termos de liquidez, mas não protege o capital da inflação e não é uma estratégia de diversificação de investimentos."},
            "4": {"type": "incorrect", "text": "Trocar de corretora é uma questão operacional, sem relação com a estratégia de diversificação de ativos para mitigação de risco."}
          }
        }
      ]
    }
  ]'::jsonb
)
WHERE number = '8';

-- Módulo 9 - SELIC e IPCA
UPDATE learning_modules 
SET content = jsonb_set(
  content,
  '{lessons}',
  '[
    {
      "id": 1,
      "title": "SELIC e IPCA: Indicadores Fundamentais",
      "type": "text",
      "content": "A SELIC é a taxa básica de juros da economia brasileira, controlada pelo Banco Central. O IPCA é o índice oficial de inflação. Ambos são fundamentais para entender a rentabilidade real dos investimentos."
    },
    {
      "id": 2,
      "title": "Quiz: Teste seus conhecimentos",
      "type": "quiz",
      "questions": [
        {
          "question": "Como a Taxa SELIC (Taxa Básica de Juros da Economia) e o IPCA (Índice de Preços ao Consumidor Amplo - Inflação Oficial) se relacionam com os investimentos em Renda Fixa?",
          "hint": "Um índice mede a inflação (preços), e o outro é a principal ferramenta do Banco Central para controlá-la (juros).",
          "options": [
            "A SELIC é usada como indexador de títulos prefixados, e o IPCA só é usado para corrigir o valor de ações.",
            "A SELIC e o IPCA são exatamente o mesmo índice e têm a mesma finalidade: medir a inflação.",
            "A Taxa SELIC influencia a rentabilidade de títulos como o Tesouro SELIC e é usada como parâmetro para o CDI, e o IPCA é usado como indexador de títulos que protegem contra a inflação (Tesouro IPCA+).",
            "O IPCA determina a taxa de juros de títulos pós-fixados, e a SELIC só afeta o câmbio.",
            "Ambos são ignorados pelos investidores de Renda Fixa, que só consideram o valor do dólar."
          ],
          "correct": 2,
          "justifications": {
            "0": {"type": "incorrect", "text": "A SELIC não indexa títulos prefixados (que têm uma taxa definida), e o IPCA é o principal indexador de títulos de Renda Fixa com proteção contra a inflação, não de ações."},
            "1": {"type": "incorrect", "text": "São índices diferentes: SELIC é uma taxa de juros básica definida pelo COPOM, e IPCA é o índice oficial de inflação medido pelo IBGE."},
            "2": {"type": "correct", "text": "A SELIC é o principal balizador da economia, afetando a rentabilidade dos títulos atrelados a ela (como o Tesouro Selic). O IPCA é o índice oficial da inflação e é usado para corrigir títulos que buscam preservar o poder de compra."},
            "3": {"type": "incorrect", "text": "O índice que determina a rentabilidade da maioria dos pós-fixados é o CDI, que é próximo à SELIC. O IPCA mede a inflação."},
            "4": {"type": "incorrect", "text": "SELIC e IPCA são os indicadores mais importantes para a Renda Fixa, pois definem a rentabilidade e o poder de compra real do capital."}
          }
        }
      ]
    }
  ]'::jsonb
)
WHERE number = '9';

-- Módulo 10 - Custo de Oportunidade
UPDATE learning_modules 
SET content = jsonb_set(
  content,
  '{lessons}',
  '[
    {
      "id": 1,
      "title": "Entendendo Custo de Oportunidade",
      "type": "text",
      "content": "Custo de Oportunidade é o valor do benefício que você abre mão ao escolher uma alternativa em detrimento de outra. Toda decisão financeira tem um custo de oportunidade implícito."
    },
    {
      "id": 2,
      "title": "Quiz: Teste seus conhecimentos",
      "type": "quiz",
      "questions": [
        {
          "question": "Você tem R$10.000 e duas opções: (A) Comprar um bem de consumo imediato que não gera renda, ou (B) Investir em um título que paga 10% ao ano. Se você escolher a Opção A, qual é o seu Custo de Oportunidade em termos financeiros após um ano?",
          "hint": "Lembre-se que o custo de oportunidade é o valor da melhor alternativa que foi descartada.",
          "options": [
            "O valor total do bem de consumo, que é R$10.000.",
            "Os R$1.000 de juros que você deixou de ganhar ao não escolher a Opção B.",
            "A soma do bem de consumo e dos juros que seriam ganhos, totalizando R$11.000.",
            "O valor de R$10.000 corrigido pela inflação no período.",
            "Nenhum, pois a Opção A satisfaz uma necessidade imediata."
          ],
          "correct": 1,
          "justifications": {
            "0": {"type": "incorrect", "text": "O custo de oportunidade não é o valor total gasto, mas sim o benefício que foi sacrificado ao não escolher a melhor alternativa seguinte (o ganho de R$1.000)."},
            "1": {"type": "correct", "text": "O Custo de Oportunidade é o benefício que se perde ao escolher uma alternativa em detrimento de outra. Ao escolher a compra imediata, o custo é a rentabilidade (juros de 10% sobre R$10.000) que o investimento alternativo renderia."},
            "2": {"type": "incorrect", "text": "O custo de oportunidade é o benefício perdido da alternativa preterida (os R$1.000 de juros), e não a soma dos dois valores."},
            "3": {"type": "incorrect", "text": "Embora a inflação seja uma consideração importante, ela não define o custo de oportunidade da escolha entre as duas opções apresentadas no cenário."},
            "4": {"type": "incorrect", "text": "Sempre existe um custo de oportunidade implícito em toda decisão financeira. Neste caso, o custo é a perda do ganho potencial de R$1.000."}
          }
        }
      ]
    }
  ]'::jsonb
)
WHERE number = '10';