-- Criar tabela pvp_questions
CREATE TABLE pvp_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id text NOT NULL UNIQUE,
  level text NOT NULL,
  question text NOT NULL,
  options jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE pvp_questions ENABLE ROW LEVEL SECURITY;

-- Política de leitura pública
CREATE POLICY "Anyone can view pvp questions" ON pvp_questions FOR SELECT USING (true);

-- Índice para performance
CREATE INDEX idx_pvp_questions_level ON pvp_questions(level);

-- Modificar tabela pvp_matches
ALTER TABLE pvp_matches ADD COLUMN difficulty_level text;
ALTER TABLE pvp_matches ALTER COLUMN module_id DROP NOT NULL;

-- Popular com as perguntas Iniciante
INSERT INTO pvp_questions (question_id, level, question, options) VALUES
('ini_01', 'Iniciante', 'O que é o ''Score de Crédito'' (como o do Serasa) e para que ele serve principalmente?', 
'[
  {"text": "É uma pontuação que mede o quanto você ganha de salário por mês.", "isCorrect": false, "rationale": "O Score não mede renda, mas sim o comportamento de pagamento e histórico de dívidas."},
  {"text": "É uma nota que indica a probabilidade de você pagar suas contas em dia, usada por bancos para aprovar empréstimos.", "isCorrect": true, "rationale": "O Score é o currículo financeiro do consumidor. Quanto maior a nota, maior a confiança do mercado."},
  {"text": "É o valor total que você tem guardado na poupança.", "isCorrect": false, "rationale": "Investimentos não compõem diretamente o cálculo do Score de crédito."},
  {"text": "É uma multa cobrada quando você atrasa a fatura do cartão.", "isCorrect": false, "rationale": "Score é uma pontuação de reputação, não uma taxa ou multa."}
]'::jsonb),

('ini_02', 'Iniciante', 'O que são as chamadas ''Despesas Fantasmas'' no orçamento doméstico?',
'[
  {"text": "Gastos com serviços sobrenaturais e religiosos.", "isCorrect": false, "rationale": "O termo é uma metáfora financeira, não literal."},
  {"text": "Pequenos gastos recorrentes (como assinaturas de streaming não usadas) que debitam automaticamente e passamos despercebidos.", "isCorrect": true, "rationale": "São chamadas de fantasmas porque ''assombram'' a fatura sem percebermos o valor real acumulado no fim do ano."},
  {"text": "Dívidas que você já pagou mas o banco continua cobrando.", "isCorrect": false, "rationale": "Isso seria uma cobrança indevida, não uma despesa fantasma."},
  {"text": "O valor gasto com aluguel e condomínio.", "isCorrect": false, "rationale": "Aluguel é uma despesa fixa e visível, não fantasma."}
]'::jsonb),

('ini_03', 'Iniciante', 'Qual a diferença básica entre Salário Bruto e Salário Líquido?',
'[
  {"text": "Não há diferença, são sinônimos.", "isCorrect": false, "rationale": "Há uma diferença crucial que impacta o dinheiro disponível para gastar."},
  {"text": "Bruto é o que cai na conta, Líquido é o valor registrado na carteira.", "isCorrect": false, "rationale": "É exatamente o contrário."},
  {"text": "Bruto é o valor total registrado sem descontos; Líquido é o que sobra após impostos (INSS/IR) e cai na sua conta.", "isCorrect": true, "rationale": "O orçamento deve ser sempre baseado no Salário Líquido, que é o dinheiro real disponível."},
  {"text": "Líquido é o salário fixo, Bruto inclui as horas extras.", "isCorrect": false, "rationale": "Ambos incluem horas extras, a distinção é sobre os descontos."}
]'::jsonb);

-- Popular com as perguntas Básico
INSERT INTO pvp_questions (question_id, level, question, options) VALUES
('bas_01', 'Básico', 'O que é o FGC (Fundo Garantidor de Créditos) e qual sua importância para o pequeno investidor?',
'[
  {"text": "É um seguro que devolve até R$ 250.000 por instituição se o banco quebrar (em Renda Fixa).", "isCorrect": true, "rationale": "O FGC protege investidores de CDB, LCI, LCA e Poupança em caso de falência da instituição financeira."},
  {"text": "É um fundo que garante lucro mínimo de 10% ao ano em ações.", "isCorrect": false, "rationale": "O FGC não cobre Renda Variável (ações) e não garante rentabilidade, apenas o saldo investido."},
  {"text": "É uma taxa cobrada pelo governo sobre todos os investimentos.", "isCorrect": false, "rationale": "FGC é uma entidade privada de proteção, não um imposto."},
  {"text": "É o fundo usado para pagar a aposentadoria pública.", "isCorrect": false, "rationale": "Isso é função do INSS, não do FGC."}
]'::jsonb),

('bas_02', 'Básico', 'O que significa a sigla CDB, um dos investimentos mais populares do Brasil?',
'[
  {"text": "Crédito Direto Bancário - Empréstimo do banco para você.", "isCorrect": false, "rationale": "CDB é você emprestando para o banco, não o contrário."},
  {"text": "Certificado de Depósito Bancário - Você empresta dinheiro ao banco em troca de juros.", "isCorrect": true, "rationale": "Ao comprar um CDB, o investidor está financiando as atividades do banco e recebe juros por isso."},
  {"text": "Custo de Dívida Brasileira - Um índice de inflação.", "isCorrect": false, "rationale": "CDB é um produto de investimento, não um índice econômico."},
  {"text": "Carteira de Dividendos Básica - Um fundo de ações.", "isCorrect": false, "rationale": "CDB é Renda Fixa, não tem relação direta com dividendos de ações."}
]'::jsonb),

('bas_03', 'Básico', 'Em uma viagem internacional, por que é financeiramente perigoso depender apenas do cartão de crédito?',
'[
  {"text": "Porque os cartões brasileiros não funcionam no exterior.", "isCorrect": false, "rationale": "Cartões internacionais funcionam normalmente."},
  {"text": "Devido à alta cobrança de IOF (4,38% atualmente) e à variação cambial até o fechamento da fatura.", "isCorrect": true, "rationale": "Você paga um imposto (IOF) alto e fica sujeito à cotação do dólar no dia do pagamento, encarecendo a viagem."},
  {"text": "Porque é impossível parcelar compras fora do Brasil.", "isCorrect": false, "rationale": "Embora o parcelamento sem juros seja raro fora, o risco cambial e o IOF são os maiores perigos."},
  {"text": "Porque o limite diminui automaticamente fora do país.", "isCorrect": false, "rationale": "O limite não muda pela geolocalização."}
]'::jsonb);

-- Popular com as perguntas Intermediário
INSERT INTO pvp_questions (question_id, level, question, options) VALUES
('int_01', 'Intermediário', 'O que é o ''Come-Cotas'' que incide sobre Fundos de Investimento (Renda Fixa e Multimercado)?',
'[
  {"text": "Uma taxa de administração extra cobrada se o fundo perder dinheiro.", "isCorrect": false, "rationale": "O come-cotas incide sobre o lucro, independente da performance relativa."},
  {"text": "Uma antecipação semestral do Imposto de Renda, que reduz o número de cotas que você possui.", "isCorrect": true, "rationale": "O governo recolhe o IR automaticamente nos meses de maio e novembro, reduzindo a quantidade de cotas e o efeito dos juros compostos."},
  {"text": "É o apelido dado à inflação quando ela supera 10%.", "isCorrect": false, "rationale": "Come-cotas é um mecanismo tributário específico, não um fenômeno inflacionário."},
  {"text": "A taxa de corretagem cobrada pela B3.", "isCorrect": false, "rationale": "Fundos abertos não são negociados na B3 da mesma forma."}
]'::jsonb),

('int_02', 'Intermediário', 'Qual a principal diferença tributária entre investir em Ações (Swing Trade) e em Fundos Imobiliários (FIIs) para pessoa física?',
'[
  {"text": "Ações pagam 27,5% de IR, FIIs são isentos na venda.", "isCorrect": false, "rationale": "As alíquotas estão incorretas."},
  {"text": "Não há diferença, ambos pagam 15% sobre o lucro.", "isCorrect": false, "rationale": "FIIs têm alíquota de 20% sobre ganho de capital."},
  {"text": "Vendas de Ações até R$ 20.000/mês são isentas de IR sobre lucro; vendas de FIIs não têm essa isenção e pagam 20%.", "isCorrect": true, "rationale": "O pequeno investidor de ações tem isenção de vendas mensais (swing trade), o de FIIs paga imposto sobre qualquer lucro na venda da cota."},
  {"text": "Dividendos de Ações pagam imposto, dividendos de FIIs pagam o dobro.", "isCorrect": false, "rationale": "Atualmente, dividendos de ações e FIIs são isentos de IR para PF na maioria dos casos."}
]'::jsonb),

('int_03', 'Intermediário', 'O que é um ETF (Exchange Traded Fund)?',
'[
  {"text": "Um fundo de investimento que é negociado na Bolsa como se fosse uma ação e geralmente replica um índice.", "isCorrect": true, "rationale": "ETFs são fundos de índice (Ex: BOVA11 segue o Ibovespa) que você compra e vende no home broker."},
  {"text": "Uma criptomoeda estatal.", "isCorrect": false, "rationale": "ETF é um fundo regulado, não uma moeda."},
  {"text": "Um título de dívida emitido por empresas estrangeiras.", "isCorrect": false, "rationale": "Isso seria um Bond ou Debênture internacional."},
  {"text": "Um aplicativo de Trade Frequente.", "isCorrect": false, "rationale": "ETF é um produto financeiro, não um software."}
]'::jsonb);

-- Popular com as perguntas Avançado
INSERT INTO pvp_questions (question_id, level, question, options) VALUES
('adv_01', 'Avançado', 'O que é a ''Marcação a Mercado'' em títulos de Renda Fixa (como o Tesouro IPCA+)?',
'[
  {"text": "A garantia de que o título sempre valerá mais a cada dia que passa.", "isCorrect": false, "rationale": "A marcação a mercado pode fazer o título valer menos temporariamente."},
  {"text": "A atualização diária do preço do título baseada nas expectativas de juros futuros, podendo gerar prejuízo se vendido antes do vencimento.", "isCorrect": true, "rationale": "Se os juros futuros sobem, o preço do título cai hoje. Se vender antes, perde dinheiro. Se levar até o fim, recebe o contratado."},
  {"text": "Um carimbo que o banco coloca para validar o título.", "isCorrect": false, "rationale": "É um conceito de precificação, não físico."},
  {"text": "A taxa que o mercado cobra para investir na Bolsa.", "isCorrect": false, "rationale": "Não tem relação com taxas de bolsa."}
]'::jsonb),

('adv_02', 'Avançado', 'O que é o ''Circuit Breaker'' na Bolsa de Valores?',
'[
  {"text": "Quando a Bolsa fecha para almoço.", "isCorrect": false, "rationale": "O pregão não para para almoço."},
  {"text": "Um mecanismo de segurança que interrompe as negociações temporariamente quando o índice cai bruscamente (ex: 10%).", "isCorrect": true, "rationale": "Serve para acalmar os ânimos do mercado e evitar o pânico generalizado e vendas irracionais."},
  {"text": "Uma ferramenta que impede você de perder dinheiro em ações.", "isCorrect": false, "rationale": "Ele para o mercado, mas não impede o prejuízo se a ação abrir mais baixa depois."},
  {"text": "O momento em que a Bolsa atinge sua pontuação máxima histórica.", "isCorrect": false, "rationale": "Circuit Breaker é acionado em quedas drásticas."}
]'::jsonb),

('adv_03', 'Avançado', 'Qual a principal diferença tributária entre ''Day Trade'' e ''Swing Trade'' em ações?',
'[
  {"text": "Não há diferença, é tudo 15%.", "isCorrect": false, "rationale": "As alíquotas são distintas."},
  {"text": "Day Trade é isento de IR, Swing Trade paga 20%.", "isCorrect": false, "rationale": "É o oposto, Day Trade nunca tem isenção."},
  {"text": "Day Trade paga 20% de IR sobre qualquer lucro e não tem isenção; Swing Trade paga 15% e tem isenção para vendas até R$ 20 mil.", "isCorrect": true, "rationale": "Day Trade é considerado especulação pura, por isso a alíquota é maior e não existem faixas de isenção."},
  {"text": "Day Trade só paga imposto se o lucro for superior a R$ 1 milhão.", "isCorrect": false, "rationale": "Paga imposto sobre qualquer valor de lucro."}
]'::jsonb);