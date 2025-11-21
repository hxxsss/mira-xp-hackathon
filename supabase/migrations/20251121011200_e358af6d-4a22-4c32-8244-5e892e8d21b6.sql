-- Atualizar módulos 11 a 15 e módulos I a V com novas perguntas do PDF

-- Módulo 11 - Finanças Comportamentais
UPDATE learning_modules 
SET content = jsonb_set(
  content,
  '{lessons}',
  '[
    {
      "id": 1,
      "title": "Vieses Cognitivos em Finanças",
      "type": "text",
      "content": "Finanças Comportamentais estudam como vieses psicológicos afetam decisões financeiras. O Viés de Ancoragem é um dos mais comuns, fazendo com que nos fixemos em informações iniciais mesmo quando irrelevantes."
    },
    {
      "id": 2,
      "title": "Quiz: Teste seus conhecimentos",
      "type": "quiz",
      "questions": [
        {
          "question": "O que significa o Viés de Ancoragem no contexto de decisões de investimento?",
          "hint": "Pense em como um preço ou valor inicial pode influenciar julgamentos futuros, mesmo que não seja relevante.",
          "options": [
            "A tendência de vender ativos que tiveram valorização rapidamente para garantir o lucro.",
            "O erro de tomar decisões de investimento baseando-se excessivamente na primeira informação recebida (o preço de compra ou um preço-alvo inicial), ignorando novos dados.",
            "A preferência por investimentos familiares e locais, mesmo que haja opções melhores no exterior.",
            "A crença irracional de que um evento que ocorreu com menos frequência no passado tem maior probabilidade de ocorrer no futuro.",
            "A tendência de ignorar informações que contradizem as crenças ou opiniões pré-existentes do investidor."
          ],
          "correct": 1,
          "justifications": {
            "0": {"type": "incorrect", "text": "Essa tendência está relacionada ao Viés de Realização de Lucro (Disposition Effect)."},
            "1": {"type": "correct", "text": "O Viés de Ancoragem ocorre quando os indivíduos ficam excessivamente ancorados ou influenciados por um valor inicial (como o preço que pagaram por uma ação), mesmo que informações subsequentes provem que esse valor é irrelevante para a avaliação futura."},
            "2": {"type": "incorrect", "text": "Essa é a definição de Viés de Familiaridade (Home Bias)."},
            "3": {"type": "incorrect", "text": "Esse conceito está ligado à Falácia do Jogador (Gambler''s Fallacy)."},
            "4": {"type": "incorrect", "text": "Essa é a definição do Viés de Confirmação."}
          }
        }
      ]
    }
  ]'::jsonb
)
WHERE number = '11';

-- Módulo 12 - Impostos
UPDATE learning_modules 
SET content = jsonb_set(
  content,
  '{lessons}',
  '[
    {
      "id": 1,
      "title": "Sistemas Tributários",
      "type": "text",
      "content": "O sistema tributário pode ser progressivo (alíquota aumenta com a renda) ou regressivo (onera mais proporcionalmente quem tem menos renda). Entender essa diferença é crucial para compreender justiça fiscal."
    },
    {
      "id": 2,
      "title": "Quiz: Teste seus conhecimentos",
      "type": "quiz",
      "questions": [
        {
          "question": "Qual a diferença fundamental entre um Sistema Tributário Progressivo (como o Imposto de Renda) e um Regressivo (como a maioria dos impostos sobre consumo no Brasil)?",
          "hint": "A diferença está em quem paga proporcionalmente mais em relação à sua renda.",
          "options": [
            "O progressivo aumenta a alíquota de acordo com a renda do contribuinte, enquanto o regressivo possui alíquota única (flat tax).",
            "O progressivo cobra menos impostos de todos os cidadãos, e o regressivo é utilizado para arrecadar mais rapidamente.",
            "O sistema progressivo eleva a alíquota para quem tem maior renda, sendo mais justo socialmente. O sistema regressivo cobra a mesma taxa de todos (sobre bens e serviços), onerando mais a parcela de menor renda.",
            "O regressivo só incide sobre a riqueza acumulada, e o progressivo só incide sobre o consumo.",
            "Ambos são utilizados apenas para financiar a dívida pública, sem impacto na distribuição de renda."
          ],
          "correct": 2,
          "justifications": {
            "0": {"type": "incorrect", "text": "O imposto regressivo sobre consumo não tem alíquota única; ele afeta todos igualmente, mas seu peso é desproporcional à renda."},
            "1": {"type": "incorrect", "text": "A finalidade do imposto não é a velocidade, mas a justiça fiscal ou a base de incidência."},
            "2": {"type": "correct", "text": "O imposto regressivo (consumo) incide igualmente sobre todos, fazendo com que a parcela mais pobre da população gaste uma porcentagem maior de sua renda total com o imposto, sendo menos justo. O progressivo (renda) aumenta o percentual do imposto à medida que a renda aumenta."},
            "3": {"type": "incorrect", "text": "É o oposto: no Brasil, o regressivo incide principalmente sobre o consumo, e o progressivo sobre a renda (e, em parte, a riqueza)."},
            "4": {"type": "incorrect", "text": "Impostos financiam todos os gastos públicos, e o progressivo tem grande impacto na distribuição de renda."}
          }
        }
      ]
    }
  ]'::jsonb
)
WHERE number = '12';

-- Módulo 13 - Derivativos
UPDATE learning_modules 
SET content = jsonb_set(
  content,
  '{lessons}',
  '[
    {
      "id": 1,
      "title": "Mercado de Derivativos",
      "type": "text",
      "content": "Derivativos são instrumentos financeiros cujo valor deriva de um ativo subjacente. Opções são contratos que conferem direitos (mas não obrigações) ao comprador, sendo ferramentas importantes para gestão de risco."
    },
    {
      "id": 2,
      "title": "Quiz: Teste seus conhecimentos",
      "type": "quiz",
      "questions": [
        {
          "question": "Em um mercado de Derivativos, o que o titular (comprador) de uma Opção de Compra (Call Option) adquire?",
          "hint": "O termo opção implica um direito, não uma obrigação.",
          "options": [
            "O direito de vender um ativo a um preço predeterminado (preço de exercício) em uma data futura, mas não a obrigação.",
            "A obrigação de comprar um ativo a um preço predeterminado, independentemente da vontade do titular.",
            "O direito de comprar um ativo (o ativo-objeto) a um preço predeterminado (preço de exercício) em uma data futura, mas não a obrigação.",
            "O direito de receber dividendos futuros da empresa emissora da opção.",
            "A obrigação de vender um ativo, caso o preço de mercado se torne muito mais alto que o preço de exercício."
          ],
          "correct": 2,
          "justifications": {
            "0": {"type": "incorrect", "text": "Essa é a definição de Opção de Venda (Put Option)."},
            "1": {"type": "incorrect", "text": "O titular de uma opção (comprador) nunca tem uma obrigação, apenas o direito. A obrigação é do lançador (vendedor)."},
            "2": {"type": "correct", "text": "O titular da Call adquire o direito de exercer a compra do ativo-objeto no preço e prazo definidos, mas pode simplesmente não exercer (deixando a opção virar pó) se o preço de mercado não for favorável."},
            "3": {"type": "incorrect", "text": "A opção confere direito sobre o ativo, não sobre dividendos, a menos que seja exercida antes da data-ex."},
            "4": {"type": "incorrect", "text": "A obrigação de vender é do lançador da Call, e não do titular."}
          }
        }
      ]
    }
  ]'::jsonb
)
WHERE number = '13';

-- Módulo 14 - Dívida/PIB
UPDATE learning_modules 
SET content = jsonb_set(
  content,
  '{lessons}',
  '[
    {
      "id": 1,
      "title": "Relação Dívida/PIB",
      "type": "text",
      "content": "A relação Dívida/PIB é um indicador crucial da saúde fiscal de um país. Mede a dívida pública em relação à capacidade de geração de riqueza da economia, sendo fundamental para avaliação de risco soberano."
    },
    {
      "id": 2,
      "title": "Quiz: Teste seus conhecimentos",
      "type": "quiz",
      "questions": [
        {
          "question": "Por que o indicador Dívida Líquida/PIB de um país é crucial para a saúde financeira e a avaliação de risco pelos investidores internacionais?",
          "hint": "O PIB é a medida da capacidade produtiva e de pagamento do país.",
          "options": [
            "Ele mede a relação entre os juros básicos (SELIC) e a inflação (IPCA), sem relação direta com a dívida.",
            "Representa o percentual da dívida externa total do país em relação às suas reservas cambiais.",
            "Indica o tempo que levará para o governo pagar sua dívida, assumindo que toda a riqueza produzida (PIB) seja utilizada para este fim.",
            "É uma medida da capacidade de pagamento do país: um PIB alto em relação à dívida sugere que o país tem grande capacidade de gerar riqueza para honrar seus compromissos, reduzindo o risco de crédito.",
            "O valor é irrelevante, pois a dívida pública é sempre garantida pela emissão de mais moeda."
          ],
          "correct": 3,
          "justifications": {
            "0": {"type": "incorrect", "text": "O indicador mede a dívida em relação ao PIB, que é a soma de todos os bens e serviços finais produzidos."},
            "1": {"type": "incorrect", "text": "Esse indicador compara a dívida total com a capacidade de geração de riqueza (PIB)."},
            "2": {"type": "incorrect", "text": "O PIB não é integralmente usado para pagar a dívida. O indicador mede a proporção, ou seja, a sustentabilidade da dívida em relação à capacidade produtiva."},
            "3": {"type": "correct", "text": "O PIB é o denominador (capacidade de gerar riqueza). Uma relação Dívida/PIB alta sugere que a dívida é grande comparada à capacidade de pagamento do país, o que aumenta o risco e o custo de captação (juros) para o governo."},
            "4": {"type": "incorrect", "text": "A emissão descontrolada de moeda para pagar dívida gera inflação e desconfiança, e o indicador é extremamente relevante na avaliação de risco."}
          }
        }
      ]
    }
  ]'::jsonb
)
WHERE number = '14';

-- Módulo 15 - Value Investing
UPDATE learning_modules 
SET content = jsonb_set(
  content,
  '{lessons}',
  '[
    {
      "id": 1,
      "title": "Filosofia do Value Investing",
      "type": "text",
      "content": "Value Investing é a estratégia de investir em ativos negociados abaixo do seu valor intrínseco, criando uma margem de segurança. Popularizada por Benjamin Graham e Warren Buffett, foca em fundamentos e longo prazo."
    },
    {
      "id": 2,
      "title": "Quiz: Teste seus conhecimentos",
      "type": "quiz",
      "questions": [
        {
          "question": "Qual é o princípio fundamental do Value Investing (Investimento em Valor), popularizado por Benjamin Graham e adotado por Warren Buffett?",
          "hint": "O conceito principal é encontrar algo que vale mais do que o seu preço.",
          "options": [
            "Comprar ações de empresas que estão crescendo muito rapidamente e que prometem altos lucros no futuro (Growth Investing).",
            "Comprar e vender ações em curtos períodos (day trade) para lucrar com a volatilidade diária do mercado.",
            "Adquirir ativos quando seu preço de mercado está significativamente abaixo de seu valor intrínseco (o Valor Justo), criando uma margem de segurança.",
            "Investir apenas em empresas estatais ou em setores regulamentados pelo governo para garantir a segurança do capital.",
            "Utilizar alavancagem para maximizar os retornos, mesmo que isso aumente dramaticamente o risco da carteira."
          ],
          "correct": 2,
          "justifications": {
            "0": {"type": "incorrect", "text": "Esta é a base do Growth Investing (Investimento em Crescimento), que se foca em potencial futuro, e não em preço atual."},
            "1": {"type": "incorrect", "text": "O Value Investing é uma estratégia de longo prazo e focada em fundamentos, o oposto de especulação de curto prazo."},
            "2": {"type": "correct", "text": "O Value Investing busca o desconto. O investidor compra a ação abaixo do seu valor fundamental (o valor intrínseco), garantindo uma Margem de Segurança que protege o investimento de erros de cálculo e volatilidade."},
            "3": {"type": "incorrect", "text": "O setor não é o foco; o foco é a qualidade da empresa e o preço de negociação."},
            "4": {"type": "incorrect", "text": "Investidores em valor como Buffett são conhecidos por evitar alavancagem excessiva e focar na preservação de capital."}
          }
        }
      ]
    }
  ]'::jsonb
)
WHERE number = '15';

-- Módulo I - Custo Efetivo Total (CET)
UPDATE learning_modules 
SET content = jsonb_set(
  content,
  '{lessons}',
  '[
    {
      "id": 1,
      "title": "O que é CET",
      "type": "text",
      "content": "O Custo Efetivo Total (CET) é o indicador que engloba todos os custos de uma operação de crédito: juros, tarifas, impostos e seguros. É obrigatório por lei e essencial para comparar propostas de empréstimo."
    },
    {
      "id": 2,
      "title": "Quiz: Teste seus conhecimentos",
      "type": "quiz",
      "questions": [
        {
          "question": "Você está comparando propostas de empréstimo em dois bancos. Qual indicador você deve usar obrigatoriamente para ter certeza de qual proposta é realmente a mais barata, considerando juros, taxas e encargos?",
          "hint": "Procure pelo índice que engloba todos os custos da operação de crédito.",
          "options": [
            "Apenas a Taxa de Juros Nominal mensal.",
            "A taxa de inflação (IPCA) acumulada no período do empréstimo.",
            "O Índice de Inadimplência do Banco Central (Bacen).",
            "O Custo Efetivo Total (CET).",
            "O Imposto sobre Operações Financeiras (IOF) da operação."
          ],
          "correct": 3,
          "justifications": {
            "0": {"type": "incorrect", "text": "A taxa nominal ignora as tarifas, impostos (IOF) e outros custos embutidos, podendo levar a uma falsa impressão de que o empréstimo é mais barato do que realmente é."},
            "1": {"type": "incorrect", "text": "A inflação afeta o poder de compra, mas não é o indicador direto do custo do crédito."},
            "2": {"type": "incorrect", "text": "O índice de inadimplência mede o risco de crédito do banco, mas não o custo final para o tomador do empréstimo."},
            "3": {"type": "correct", "text": "O CET é o indicador obrigatório por lei que engloba todos os custos incidentes na operação de crédito (juros, taxas administrativas, impostos e seguros), sendo a única forma de comparar propostas com precisão."},
            "4": {"type": "incorrect", "text": "O IOF é apenas um dos componentes do custo total; o CET é que agrupa todos eles."}
          }
        }
      ]
    }
  ]'::jsonb
)
WHERE number = 'I';

-- Módulo II - Juros de Cartão de Crédito
UPDATE learning_modules 
SET content = jsonb_set(
  content,
  '{lessons}',
  '[
    {
      "id": 1,
      "title": "O Perigo do Crédito Rotativo",
      "type": "text",
      "content": "O crédito rotativo do cartão de crédito é uma das dívidas mais caras do Brasil, com juros compostos que podem ultrapassar 300% ao ano. É acionado quando você não paga o valor total da fatura."
    },
    {
      "id": 2,
      "title": "Quiz: Teste seus conhecimentos",
      "type": "quiz",
      "questions": [
        {
          "question": "Qual é o mecanismo que torna o cartão de crédito a dívida mais perigosa e cara no Brasil quando o valor total da fatura não é pago?",
          "hint": "Pense na diferença entre o pagamento mínimo e o valor total devido.",
          "options": [
            "A Taxa Selic é aplicada diretamente sobre o valor em aberto, mas ela é baixa.",
            "O uso do Custo de Oportunidade, que impede o crescimento do capital do devedor.",
            "O atraso gera o crédito rotativo, que cobra juros compostos altíssimos (em alguns casos, acima de 300% ao ano) sobre o saldo devedor.",
            "O cartão cobra apenas juros simples, que são facilmente controláveis a longo prazo.",
            "A dívida é automaticamente convertida em dólar após o primeiro dia de atraso."
          ],
          "correct": 2,
          "justifications": {
            "0": {"type": "incorrect", "text": "A taxa de juros do cartão de crédito é muito superior à Selic e é composta por juros remuneratórios e multa/mora."},
            "1": {"type": "incorrect", "text": "O Custo de Oportunidade é um conceito de finanças, mas não o mecanismo que encarece a dívida do cartão."},
            "2": {"type": "correct", "text": "O crédito rotativo é a modalidade de juros composta acionada ao não pagar o valor total, aplicando as taxas mais elevadas do mercado sobre o saldo remanescente, o que leva a uma escalada rápida da dívida."},
            "3": {"type": "incorrect", "text": "A dívida do cartão de crédito utiliza o regime de juros compostos, que é o que potencializa o crescimento do saldo."},
            "4": {"type": "incorrect", "text": "A dívida é cobrada na moeda nacional, acrescida dos juros e encargos locais."}
          }
        }
      ]
    }
  ]'::jsonb
)
WHERE number = 'II';

-- Módulo III - Previdência Privada
UPDATE learning_modules 
SET content = jsonb_set(
  content,
  '{lessons}',
  '[
    {
      "id": 1,
      "title": "Planejamento de Aposentadoria",
      "type": "text",
      "content": "A Previdência Privada (PGBL/VGBL) é um instrumento de acumulação de capital de longo prazo, focado em complementar a renda da aposentadoria oficial e preservar o padrão de vida na velhice."
    },
    {
      "id": 2,
      "title": "Quiz: Teste seus conhecimentos",
      "type": "quiz",
      "questions": [
        {
          "question": "Em termos de planejamento financeiro, qual é o objetivo principal e de longo prazo de contratar um plano de Previdência Privada (PGBL/VGBL)?",
          "hint": "O foco não é a rentabilidade imediata, mas sim a segurança futura.",
          "options": [
            "Ser um investimento de alta liquidez para a reserva de emergência.",
            "Garantir uma fonte de renda complementar ou de aposentadoria, preservando o padrão de vida na velhice.",
            "Usar o benefício fiscal da tabela regressiva no Imposto de Renda no curto prazo.",
            "Obter retornos de renda variável (ações) acima da média do mercado com risco zero.",
            "Pagar a faculdade dos filhos dentro de cinco anos."
          ],
          "correct": 1,
          "justifications": {
            "0": {"type": "incorrect", "text": "A previdência privada tem baixa liquidez (resgate em longo prazo) e não é adequada para a reserva de emergência."},
            "1": {"type": "correct", "text": "A previdência privada é um instrumento de acumulação de capital de longo prazo, criado com a finalidade primária de complementar a renda da aposentadoria oficial."},
            "2": {"type": "incorrect", "text": "Embora haja benefícios fiscais (PGBL), eles só são vantajosos se o plano for mantido por muitos anos, mantendo o foco no longo prazo."},
            "3": {"type": "incorrect", "text": "Não existe investimento com risco zero. Além disso, a Previdência Privada pode ter exposição à renda variável, mas o foco é a segurança do planejamento."},
            "4": {"type": "incorrect", "text": "Para objetivos de médio prazo (cinco anos), existem instrumentos mais adequados e com maior liquidez."}
          }
        }
      ]
    }
  ]'::jsonb
)
WHERE number = 'III';

-- Módulo IV - Poder de Compra (Rentabilidade Real)
UPDATE learning_modules 
SET content = jsonb_set(
  content,
  '{lessons}',
  '[
    {
      "id": 1,
      "title": "Rentabilidade Real",
      "type": "text",
      "content": "A rentabilidade real é o ganho efetivo de um investimento após descontar a inflação. É o que realmente importa, pois mede o aumento do seu poder de compra."
    },
    {
      "id": 2,
      "title": "Quiz: Teste seus conhecimentos",
      "type": "quiz",
      "questions": [
        {
          "question": "Um investimento rendeu 10% ao ano, mas a inflação (IPCA) no mesmo período foi de 5%. Qual foi o ganho de Rentabilidade Real do investidor?",
          "hint": "O ganho real é o que realmente aumenta o seu poder de compra, descontando a inflação.",
          "options": [
            "Um ganho nominal de 10% (Rentabilidade Real), ignorando a inflação.",
            "Um ganho real de 15%, somando os dois percentuais.",
            "Um ganho real de aproximadamente 5%.",
            "Uma perda real de -5%, pois a inflação sempre supera os investimentos.",
            "Zero, pois não há garantia de que o investimento renderá mais do que a poupança."
          ],
          "correct": 2,
          "justifications": {
            "0": {"type": "incorrect", "text": "O ganho nominal é de 10%, mas o ganho real sempre exige o desconto da inflação."},
            "1": {"type": "incorrect", "text": "Os percentuais não devem ser somados; a inflação deve ser subtraída da rentabilidade nominal."},
            "2": {"type": "correct", "text": "O cálculo simplificado da rentabilidade real é a Rentabilidade Nominal (10%) menos a Inflação (5%), resultando em 5% de ganho de poder de compra."},
            "3": {"type": "incorrect", "text": "Houve ganho real, pois a rentabilidade nominal (10%) foi superior à inflação (5%)."},
            "4": {"type": "incorrect", "text": "O desempenho do investimento é comparado à inflação, não à poupança, para medir o ganho real de poder de compra."}
          }
        }
      ]
    }
  ]'::jsonb
)
WHERE number = 'IV';

-- Módulo V - Prazo e Risco (Trade-off)
UPDATE learning_modules 
SET content = jsonb_set(
  content,
  '{lessons}',
  '[
    {
      "id": 1,
      "title": "O Tripé dos Investimentos",
      "type": "text",
      "content": "Todo investimento envolve um trade-off entre Rentabilidade, Risco e Liquidez. Não é possível maximizar os três simultaneamente - para buscar maior retorno, geralmente é preciso aceitar mais risco ou menos liquidez."
    },
    {
      "id": 2,
      "title": "Quiz: Teste seus conhecimentos",
      "type": "quiz",
      "questions": [
        {
          "question": "Qual é o princípio fundamental (o trade-off) que geralmente rege a relação entre Risco, Rentabilidade e Liquidez em investimentos?",
          "hint": "O que você precisa sacrificar para buscar um retorno maior?",
          "options": [
            "Quanto menor o risco e a liquidez, maior é a rentabilidade esperada.",
            "Para buscar maior rentabilidade, o investidor geralmente precisa aceitar menor risco e maior liquidez.",
            "É sempre possível maximizar rentabilidade, liquidez e minimizar risco simultaneamente.",
            "Maiores retornos (Rentabilidade) geralmente exigem que o investidor aceite maior Risco e, frequentemente, menor Liquidez (prazos mais longos).",
            "A liquidez e o risco não têm nenhuma correlação com a rentabilidade de um ativo."
          ],
          "correct": 3,
          "justifications": {
            "0": {"type": "incorrect", "text": "Geralmente, baixo risco e baixa liquidez não se combinam com alta rentabilidade."},
            "1": {"type": "incorrect", "text": "Quanto maior o potencial de rentabilidade, maior o risco associado."},
            "2": {"type": "incorrect", "text": "O tripé dos investimentos exige que se priorize no máximo dois desses elementos. Não é possível ter alta rentabilidade, alta liquidez e baixo risco ao mesmo tempo."},
            "3": {"type": "correct", "text": "O trade-off ou a relação de compromisso é: para buscar mais rentabilidade, você tem que se expor a mais risco ou abrir mão da liquidez (deixar o dinheiro parado por mais tempo)."},
            "4": {"type": "incorrect", "text": "Os três elementos estão intimamente ligados na precificação de qualquer ativo financeiro."}
          }
        }
      ]
    }
  ]'::jsonb
)
WHERE number = 'V';