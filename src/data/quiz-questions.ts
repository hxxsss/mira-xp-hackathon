// Quiz questions extracted from PDF - 20 modules total
export interface QuizQuestion {
  question: string;
  hint: string;
  options: string[];
  correct: number;
  justifications: {
    [key: number]: {
      type: 'correct' | 'incorrect';
      text: string;
    };
  };
}

export interface ModuleQuestions {
  moduleNumber: string;
  title: string;
  questions: QuizQuestion[];
}

export const quizQuestions: ModuleQuestions[] = [
  {
    moduleNumber: "1",
    title: "Orçamento Pessoal",
    questions: [{
      question: "Qual é o objetivo principal e mais básico de criar um Orçamento Pessoal?",
      hint: "Pense no orçamento como um mapa que mostra para onde o seu dinheiro está indo.",
      options: [
        "Acumular o máximo de dívidas possível para usar o crédito do banco.",
        "Controlar as receitas e despesas para gerenciar melhor o dinheiro e definir metas de economia.",
        "Anotar apenas as despesas fixas, ignorando os gastos variáveis e supérfluos.",
        "Comprar bens de luxo no impulso para aproveitar promoções.",
        "Gastar o dinheiro o mais rápido possível para evitar a inflação."
      ],
      correct: 1,
      justifications: {
        0: { type: 'incorrect', text: "O orçamento é a ferramenta que ajuda a evitar dívidas, e não a incentivá-las. Seu objetivo é o controle e a saúde financeira." },
        1: { type: 'correct', text: "O orçamento é a ferramenta fundamental para ter uma visão clara da entrada (receitas) e saída (despesas) de dinheiro, permitindo o controle financeiro e a definição de objetivos." },
        2: { type: 'incorrect', text: "Para ser eficaz, o orçamento deve incluir todas as despesas (fixas, variáveis e supérfluas), pois os gastos menores podem somar grandes valores." },
        3: { type: 'incorrect', text: "O orçamento visa o planejamento e a disciplina, o que é o oposto do consumo por impulso, que pode comprometer a saúde financeira." },
        4: { type: 'incorrect', text: "Esta alternativa está incorreta e vai contra o princípio básico de planejamento financeiro." }
      }
    }]
  },
  {
    moduleNumber: "2",
    title: "Reserva de Emergência",
    questions: [{
      question: "Qual a finalidade primordial de uma Reserva de Emergência e qual o valor geralmente recomendado para ela?",
      hint: "Pense no que aconteceria se você perdesse sua fonte de renda por um tempo.",
      options: [
        "Investir em ativos de alto risco, como ações, buscando grandes lucros imediatos e deve ser de 1 a 2 meses do custo de vida.",
        "Comprar a casa própria o mais rápido possível e deve ser de no mínimo 24 meses do custo de vida.",
        "Cobrir gastos inesperados, como desemprego ou problemas de saúde, e deve ser de 6 a 12 meses do custo de vida.",
        "Servir como capital de giro para abrir um novo negócio e deve ser o mínimo necessário para pagar as contas básicas do mês.",
        "Pagar todas as dívidas anuais antecipadamente e deve ser de 3 meses de salário líquido."
      ],
      correct: 2,
      justifications: {
        0: { type: 'incorrect', text: "A reserva de emergência deve ser investida em opções de baixíssimo risco e alta liquidez, e não em ativos voláteis." },
        1: { type: 'incorrect', text: "O valor da reserva de emergência é menor (6 a 12 meses) e tem como foco a segurança contra imprevistos, e não a aquisição de um bem de alto valor." },
        2: { type: 'correct', text: "A reserva de emergência é um 'colchão financeiro' para imprevistos, protegendo o indivíduo de contrair dívidas caras ou resgatar investimentos de longo prazo em momentos inoportunos. O valor sugerido é de 6 a 12 meses de despesas mensais." },
        3: { type: 'incorrect', text: "O capital para um negócio é um investimento separado, e a reserva de emergência deve ser um valor maior do que apenas um mês de contas." },
        4: { type: 'incorrect', text: "A reserva cobre gastos inesperados, e o pagamento de dívidas anuais antecipadamente deve ser considerado no orçamento regular, não sendo a principal função da reserva." }
      }
    }]
  },
  {
    moduleNumber: "3",
    title: "Ativo vs. Passivo",
    questions: [{
      question: "Em termos de educação financeira, qual das seguintes opções é considerada um Ativo?",
      hint: "Um ativo, na definição de Robert Kiyosaki (Pai Rico, Pai Pobre), é o que coloca dinheiro no seu bolso.",
      options: [
        "Um carro financiado usado apenas para locomoção pessoal, que gera parcelas e manutenção.",
        "Um empréstimo pessoal com alta taxa de juros que você deve pagar.",
        "Um cartão de crédito com o limite estourado.",
        "Um imóvel que é alugado e gera renda mensal para você.",
        "O imposto anual (IPVA) do seu veículo particular."
      ],
      correct: 3,
      justifications: {
        0: { type: 'incorrect', text: "O carro para uso pessoal é um passivo, pois gera despesas (IPVA, manutenção, gasolina) e tira dinheiro do seu bolso." },
        1: { type: 'incorrect', text: "Empréstimos e dívidas são passivos, pois representam obrigações financeiras que drenam seu capital." },
        2: { type: 'incorrect', text: "O saldo devedor de um cartão de crédito é um passivo com alto custo de juros, o oposto de um ativo." },
        3: { type: 'correct', text: "Um ativo é algo que coloca dinheiro no seu bolso, ou seja, gera renda ou tem potencial de valorização. Neste caso, o aluguel é uma fonte de receita." },
        4: { type: 'incorrect', text: "O IPVA é uma despesa, uma obrigação financeira, e, portanto, faz parte da categoria de passivos ou despesas, e não de ativos." }
      }
    }]
  },
  {
    moduleNumber: "4",
    title: "Juros Compostos",
    questions: [{
      question: "Qual o principal benefício dos Juros Compostos em relação aos Juros Simples, especialmente no contexto de investimentos de longo prazo?",
      hint: "Lembre-se da frase 'juros sobre juros' e como isso afeta a base de cálculo.",
      options: [
        "Os juros são calculados apenas sobre o valor inicial investido (o capital principal) em todos os períodos.",
        "A rentabilidade é sempre menor que a inflação, garantindo a segurança do capital.",
        "Os juros incidem sobre o valor inicial e também sobre os juros acumulados anteriormente, acelerando o crescimento do capital.",
        "O pagamento de imposto de renda é menor em comparação com o regime de juros simples.",
        "Só podem ser aplicados em investimentos de Renda Variável, como ações."
      ],
      correct: 2,
      justifications: {
        0: { type: 'incorrect', text: "Esta é a definição de Juros Simples. Nos juros compostos, a base de cálculo aumenta a cada período." },
        1: { type: 'incorrect', text: "A rentabilidade ser menor que a inflação representa perda de poder de compra, o que não é um benefício. Os juros compostos podem gerar rentabilidade alta." },
        2: { type: 'correct', text: "No regime de juros compostos, o dinheiro rende sobre o principal mais os juros já incorporados, gerando o 'juros sobre juros', que é o grande motor do crescimento patrimonial no longo prazo." },
        3: { type: 'incorrect', text: "A forma de cálculo dos juros não tem relação direta com a alíquota de Imposto de Renda. A tributação depende do tipo de investimento e do prazo." },
        4: { type: 'incorrect', text: "Juros compostos são aplicados na maioria dos investimentos, incluindo Renda Fixa, e também em dívidas (como o crédito rotativo do cartão)." }
      }
    }]
  },
  {
    moduleNumber: "5",
    title: "Inflação",
    questions: [{
      question: "Qual é o efeito mais direto da Inflação no poder de compra do dinheiro ao longo do tempo?",
      hint: "Pense no que você conseguia comprar com R$100 há 5 anos e o que compra hoje.",
      options: [
        "Valorização do dinheiro em relação a outras moedas, como o Dólar.",
        "Redução generalizada dos preços, estimulando o consumo.",
        "Aumento da rentabilidade de todos os investimentos, especialmente a poupança.",
        "Diminuição das taxas de juros básicas (como a SELIC) pelo Banco Central.",
        "Aumento generalizado dos preços, fazendo com que o mesmo valor compre menos bens e serviços."
      ],
      correct: 4,
      justifications: {
        0: { type: 'incorrect', text: "A valorização cambial é um conceito diferente da inflação doméstica, que se refere ao aumento de preços internos." },
        1: { type: 'incorrect', text: "O oposto da inflação é a deflação, que é a redução generalizada de preços. A inflação é o aumento." },
        2: { type: 'incorrect', text: "Se a rentabilidade de um investimento for menor que a inflação, o investidor está perdendo poder de compra, mesmo que o valor nominal do dinheiro aumente." },
        3: { type: 'incorrect', text: "Em geral, o Banco Central aumenta a taxa SELIC para tentar combater a inflação alta, não o contrário." },
        4: { type: 'correct', text: "Inflação é a perda do poder de compra da moeda. Se os preços sobem, a mesma quantidade de dinheiro adquire uma quantidade menor de produtos ou serviços." }
      }
    }]
  },
  {
    moduleNumber: "6",
    title: "Renda Fixa",
    questions: [{
      question: "Qual a principal característica de um investimento classificado como 'Renda Fixa'?",
      hint: "O termo 'fixa' está relacionado à forma de cálculo dos rendimentos, que é definida ou prevista na contratação.",
      options: [
        "A rentabilidade é totalmente imprevisível e varia diariamente de acordo com o humor do mercado.",
        "O investidor se torna sócio de uma empresa e participa da distribuição de lucros (dividendos).",
        "O investidor consegue saber ou estimar com antecedência as regras de remuneração (taxa, indexador) no momento da aplicação.",
        "O risco é sempre zero, pois o valor principal é garantido por 100% dos títulos do mercado.",
        "É um investimento com liquidez diária e rentabilidade atrelada apenas ao IPCA."
      ],
      correct: 2,
      justifications: {
        0: { type: 'incorrect', text: "Esta é a principal característica da Renda Variável. A Renda Fixa busca previsibilidade." },
        1: { type: 'incorrect', text: "Essa é a característica do investimento em Ações, que é Renda Variável." },
        2: { type: 'correct', text: "Na Renda Fixa, a rentabilidade é determinada por uma taxa (prefixada) ou por um indexador (pós-fixada, como IPCA ou CDI) no momento da compra do título, oferecendo mais previsibilidade ao investidor." },
        3: { type: 'incorrect', text: "Embora o risco seja baixo, o risco zero não existe. O FGC (Fundo Garantidor de Créditos) garante até um limite, e nem todos os títulos são cobertos por ele." },
        4: { type: 'incorrect', text: "Muitos títulos de Renda Fixa não têm liquidez diária, e alguns têm rentabilidade atrelada ao CDI ou prefixada, não apenas ao IPCA." }
      }
    }]
  },
  {
    moduleNumber: "7",
    title: "Renda Variável",
    questions: [{
      question: "Ao investir em Ações (Renda Variável), qual é a principal forma de remuneração que o investidor pode ter?",
      hint: "Lembre-se que, ao comprar uma ação, você se torna um pequeno 'sócio' da empresa.",
      options: [
        "Recebimento de juros fixos anuais, similares aos de títulos públicos (Tesouro Direto).",
        "Valorização do preço da ação no mercado e recebimento de dividendos.",
        "Garantia de que o valor investido nunca será menor do que o capital inicial.",
        "Cobrança de uma taxa de custódia alta que é totalmente revertida para o investidor.",
        "Liquidez imediata garantida pelo Tesouro Nacional em qualquer momento."
      ],
      correct: 1,
      justifications: {
        0: { type: 'incorrect', text: "Ações não pagam juros fixos. Isso é característica de Renda Fixa. O que é pago são dividendos ou Juros sobre Capital Próprio, que variam." },
        1: { type: 'correct', text: "O ganho na Renda Variável, como ações, provém da valorização do papel (vender por um preço maior do que comprou) e da distribuição de parte dos lucros da empresa aos acionistas (dividendos)." },
        2: { type: 'incorrect', text: "A Renda Variável não oferece garantia de capital. O investidor pode perder parte ou a totalidade do que investiu, por isso é 'variável'." },
        3: { type: 'incorrect', text: "Taxas de custódia são custos para o investidor, e não uma forma de remuneração." },
        4: { type: 'incorrect', text: "Embora ações tenham liquidez, o valor da venda não é garantido e varia. A garantia do Tesouro é para Títulos Públicos (Renda Fixa)." }
      }
    }]
  },
  {
    moduleNumber: "8",
    title: "Diversificação",
    questions: [{
      question: "Qual o conceito e a principal utilidade da Diversificação na carteira de investimentos?",
      hint: "Pense no ditado popular sobre não colocar 'todos os ovos na mesma cesta'.",
      options: [
        "Concentrar 100% do capital em um único ativo que promete a maior rentabilidade do mercado, maximizando os ganhos.",
        "Comprar apenas ativos de Renda Fixa atrelados à inflação, garantindo que o dinheiro renderá o dobro do IPCA.",
        "Distribuir o dinheiro em diferentes tipos de ativos (Renda Fixa, Renda Variável, Moeda Estrangeira) e setores para reduzir o risco global do portfólio.",
        "Manter todo o dinheiro na conta corrente para ter liquidez total e imediata a qualquer momento.",
        "Trocar de corretora de investimentos todos os meses para aproveitar a taxa zero."
      ],
      correct: 2,
      justifications: {
        0: { type: 'incorrect', text: "A concentração em um único ativo aumenta o risco (risco não-sistemático) e é o oposto da diversificação." },
        1: { type: 'incorrect', text: "Embora seja uma estratégia de proteção, isso não é diversificação (pois é só Renda Fixa) e a rentabilidade não é garantida como o dobro do IPCA." },
        2: { type: 'correct', text: "A diversificação visa garantir que, se um tipo de ativo ou setor tiver um desempenho ruim, outros possam compensar a perda, protegendo o capital do investidor de grandes oscilações e reduzindo o risco não-sistemático." },
        3: { type: 'incorrect', text: "Manter o dinheiro parado é seguro em termos de liquidez, mas não protege o capital da inflação e não é uma estratégia de diversificação de investimentos." },
        4: { type: 'incorrect', text: "Trocar de corretora é uma questão operacional, sem relação com a estratégia de diversificação de ativos para mitigação de risco." }
      }
    }]
  },
  {
    moduleNumber: "9",
    title: "SELIC e IPCA",
    questions: [{
      question: "Como a Taxa SELIC (Taxa Básica de Juros da Economia) e o IPCA (Índice de Preços ao Consumidor Amplo - Inflação Oficial) se relacionam com os investimentos em Renda Fixa?",
      hint: "Um índice mede a inflação (preços), e o outro é a principal ferramenta do Banco Central para controlá-la (juros).",
      options: [
        "A SELIC é usada como indexador de títulos prefixados, e o IPCA só é usado para corrigir o valor de ações.",
        "A SELIC e o IPCA são exatamente o mesmo índice e têm a mesma finalidade: medir a inflação.",
        "A Taxa SELIC influencia a rentabilidade de títulos como o Tesouro SELIC e é usada como parâmetro para o CDI, e o IPCA é usado como indexador de títulos que protegem contra a inflação (Tesouro IPCA+).",
        "O IPCA determina a taxa de juros de títulos pós-fixados, e a SELIC só afeta o câmbio.",
        "Ambos são ignorados pelos investidores de Renda Fixa, que só consideram o valor do dólar."
      ],
      correct: 2,
      justifications: {
        0: { type: 'incorrect', text: "A SELIC não indexa títulos prefixados (que têm uma taxa definida), e o IPCA é o principal indexador de títulos de Renda Fixa com proteção contra a inflação, não de ações." },
        1: { type: 'incorrect', text: "São índices diferentes: SELIC é uma taxa de juros básica definida pelo COPOM, e IPCA é o índice oficial de inflação medido pelo IBGE." },
        2: { type: 'correct', text: "A SELIC é o principal balizador da economia, afetando a rentabilidade dos títulos atrelados a ela (como o Tesouro Selic). O IPCA é o índice oficial da inflação e é usado para corrigir títulos que buscam preservar o poder de compra." },
        3: { type: 'incorrect', text: "O índice que determina a rentabilidade da maioria dos pós-fixados é o CDI, que é próximo à SELIC. O IPCA mede a inflação." },
        4: { type: 'incorrect', text: "SELIC e IPCA são os indicadores mais importantes para a Renda Fixa, pois definem a rentabilidade e o poder de compra real do capital." }
      }
    }]
  },
  {
    moduleNumber: "10",
    title: "Custo de Oportunidade",
    questions: [{
      question: "Você tem R$10.000 e duas opções: (A) Comprar um bem de consumo imediato que não gera renda, ou (B) Investir em um título que paga 10% ao ano. Se você escolher a Opção A, qual é o seu Custo de Oportunidade em termos financeiros após um ano?",
      hint: "Lembre-se que o custo de oportunidade é o valor da melhor alternativa que foi descartada.",
      options: [
        "O valor total do bem de consumo, que é R$10.000.",
        "Os R$1.000 de juros que você deixou de ganhar ao não escolher a Opção B.",
        "A soma do bem de consumo e dos juros que seriam ganhos, totalizando R$11.000.",
        "O valor de R$10.000 corrigido pela inflação no período.",
        "Nenhum, pois a Opção A satisfaz uma necessidade imediata."
      ],
      correct: 1,
      justifications: {
        0: { type: 'incorrect', text: "O custo de oportunidade não é o valor total gasto, mas sim o benefício que foi sacrificado ao não escolher a melhor alternativa seguinte (o ganho de R$1.000)." },
        1: { type: 'correct', text: "O Custo de Oportunidade é o benefício que se perde ao escolher uma alternativa em detrimento de outra. Ao escolher a compra imediata, o custo é a rentabilidade (juros de 10% sobre R$10.000) que o investimento alternativo renderia." },
        2: { type: 'incorrect', text: "O custo de oportunidade é o benefício perdido da alternativa preterida (os R$1.000 de juros), e não a soma dos dois valores." },
        3: { type: 'incorrect', text: "Embora a inflação seja uma consideração importante, ela não define o custo de oportunidade da escolha entre as duas opções apresentadas no cenário." },
        4: { type: 'incorrect', text: "Sempre existe um custo de oportunidade implícito em toda decisão financeira. Neste caso, o custo é a perda do ganho potencial de R$1.000." }
      }
    }]
  },
  {
    moduleNumber: "11",
    title: "Finanças Comportamentais",
    questions: [{
      question: "O que significa o Viés de Ancoragem no contexto de decisões de investimento?",
      hint: "Pense em como um preço ou valor inicial pode influenciar julgamentos futuros, mesmo que não seja relevante.",
      options: [
        "A tendência de vender ativos que tiveram valorização rapidamente para garantir o lucro.",
        "O erro de tomar decisões de investimento baseando-se excessivamente na primeira informação recebida (o 'preço de compra' ou um preço-alvo inicial), ignorando novos dados.",
        "A preferência por investimentos familiares e locais, mesmo que haja opções melhores no exterior.",
        "A crença irracional de que um evento que ocorreu com menos frequência no passado tem maior probabilidade de ocorrer no futuro.",
        "A tendência de ignorar informações que contradizem as crenças ou opiniões pré-existentes do investidor."
      ],
      correct: 1,
      justifications: {
        0: { type: 'incorrect', text: "Essa tendência está relacionada ao Viés de Realização de Lucro (Disposition Effect)." },
        1: { type: 'correct', text: "O Viés de Ancoragem ocorre quando os indivíduos ficam excessivamente 'ancorados' ou influenciados por um valor inicial (como o preço que pagaram por uma ação), mesmo que informações subsequentes provem que esse valor é irrelevante para a avaliação futura." },
        2: { type: 'incorrect', text: "Essa é a definição de Viés de Familiaridade (Home Bias)." },
        3: { type: 'incorrect', text: "Esse conceito está ligado à Falácia do Jogador (Gambler's Fallacy)." },
        4: { type: 'incorrect', text: "Essa é a definição do Viés de Confirmação." }
      }
    }]
  },
  {
    moduleNumber: "12",
    title: "Impostos",
    questions: [{
      question: "Qual a diferença fundamental entre um Sistema Tributário Progressivo (como o Imposto de Renda) e um Regressivo (como a maioria dos impostos sobre consumo no Brasil)?",
      hint: "A diferença está em quem paga proporcionalmente mais em relação à sua renda.",
      options: [
        "O progressivo aumenta a alíquota de acordo com a renda do contribuinte, enquanto o regressivo possui alíquota única (flat tax).",
        "O progressivo cobra menos impostos de todos os cidadãos, e o regressivo é utilizado para arrecadar mais rapidamente.",
        "O sistema progressivo eleva a alíquota para quem tem maior renda, sendo mais justo socialmente. O sistema regressivo cobra a mesma taxa de todos (sobre bens e serviços), onerando mais a parcela de menor renda.",
        "O regressivo só incide sobre a riqueza acumulada, e o progressivo só incide sobre o consumo.",
        "Ambos são utilizados apenas para financiar a dívida pública, sem impacto na distribuição de renda."
      ],
      correct: 2,
      justifications: {
        0: { type: 'incorrect', text: "O imposto regressivo sobre consumo não tem alíquota única; ele afeta todos igualmente, mas seu peso é desproporcional à renda." },
        1: { type: 'incorrect', text: "A finalidade do imposto não é a velocidade, mas a justiça fiscal ou a base de incidência." },
        2: { type: 'correct', text: "O imposto regressivo (consumo) incide igualmente sobre todos, fazendo com que a parcela mais pobre da população gaste uma porcentagem maior de sua renda total com o imposto, sendo menos justo. O progressivo (renda) aumenta o percentual do imposto à medida que a renda aumenta." },
        3: { type: 'incorrect', text: "É o oposto: no Brasil, o regressivo incide principalmente sobre o consumo, e o progressivo sobre a renda (e, em parte, a riqueza)." },
        4: { type: 'incorrect', text: "Impostos financiam todos os gastos públicos, e o progressivo tem grande impacto na distribuição de renda." }
      }
    }]
  },
  {
    moduleNumber: "13",
    title: "Derivativos",
    questions: [{
      question: "Em um mercado de Derivativos, o que o titular (comprador) de uma Opção de Compra (Call Option) adquire?",
      hint: "O termo 'opção' implica um direito, não uma obrigação.",
      options: [
        "O direito de vender um ativo a um preço predeterminado (preço de exercício) em uma data futura, mas não a obrigação.",
        "A obrigação de comprar um ativo a um preço predeterminado, independentemente da vontade do titular.",
        "O direito de comprar um ativo (o ativo-objeto) a um preço predeterminado (preço de exercício) em uma data futura, mas não a obrigação.",
        "O direito de receber dividendos futuros da empresa emissora da opção.",
        "A obrigação de vender um ativo, caso o preço de mercado se torne muito mais alto que o preço de exercício."
      ],
      correct: 2,
      justifications: {
        0: { type: 'incorrect', text: "Essa é a definição de Opção de Venda (Put Option)." },
        1: { type: 'incorrect', text: "O titular de uma opção (comprador) nunca tem uma obrigação, apenas o direito. A obrigação é do lançador (vendedor)." },
        2: { type: 'correct', text: "O titular da Call adquire o direito de exercer a compra do ativo-objeto no preço e prazo definidos, mas pode simplesmente não exercer (deixando a opção virar pó) se o preço de mercado não for favorável." },
        3: { type: 'incorrect', text: "A opção confere direito sobre o ativo, não sobre dividendos, a menos que seja exercida antes da data-ex." },
        4: { type: 'incorrect', text: "A obrigação de vender é do lançador da Call, e não do titular." }
      }
    }]
  },
  {
    moduleNumber: "14",
    title: "Dívida/PIB",
    questions: [{
      question: "Por que o indicador Dívida Líquida/PIB de um país é crucial para a saúde financeira e a avaliação de risco pelos investidores internacionais?",
      hint: "O PIB é a medida da capacidade produtiva e de pagamento do país.",
      options: [
        "Ele mede a relação entre os juros básicos (SELIC) e a inflação (IPCA), sem relação direta com a dívida.",
        "Representa o percentual da dívida externa total do país em relação às suas reservas cambiais.",
        "Indica o tempo que levará para o governo pagar sua dívida, assumindo que toda a riqueza produzida (PIB) seja utilizada para este fim.",
        "É uma medida da capacidade de pagamento do país: um PIB alto em relação à dívida sugere que o país tem grande capacidade de gerar riqueza para honrar seus compromissos, reduzindo o risco de crédito.",
        "O valor é irrelevante, pois a dívida pública é sempre garantida pela emissão de mais moeda."
      ],
      correct: 3,
      justifications: {
        0: { type: 'incorrect', text: "O indicador mede a dívida em relação ao PIB, que é a soma de todos os bens e serviços finais produzidos." },
        1: { type: 'incorrect', text: "Esse indicador compara a dívida total com a capacidade de geração de riqueza (PIB)." },
        2: { type: 'incorrect', text: "O PIB não é integralmente usado para pagar a dívida. O indicador mede a proporção, ou seja, a sustentabilidade da dívida em relação à capacidade produtiva." },
        3: { type: 'correct', text: "O PIB é o denominador (capacidade de gerar riqueza). Uma relação Dívida/PIB alta sugere que a dívida é grande comparada à capacidade de pagamento do país, o que aumenta o risco e o custo de captação (juros) para o governo." },
        4: { type: 'incorrect', text: "A emissão descontrolada de moeda para pagar dívida gera inflação e desconfiança, e o indicador é extremamente relevante na avaliação de risco." }
      }
    }]
  },
  {
    moduleNumber: "15",
    title: "Value Investing",
    questions: [{
      question: "Qual é o princípio fundamental do Value Investing (Investimento em Valor), popularizado por Benjamin Graham e adotado por Warren Buffett?",
      hint: "O conceito principal é encontrar algo que vale mais do que o seu preço.",
      options: [
        "Comprar ações de empresas que estão crescendo muito rapidamente e que prometem altos lucros no futuro (Growth Investing).",
        "Comprar e vender ações em curtos períodos (day trade) para lucrar com a volatilidade diária do mercado.",
        "Adquirir ativos quando seu preço de mercado está significativamente abaixo de seu valor intrínseco (o 'Valor Justo'), criando uma 'margem de segurança'.",
        "Investir apenas em empresas estatais ou em setores regulamentados pelo governo para garantir a segurança do capital.",
        "Utilizar alavancagem para maximizar os retornos, mesmo que isso aumente dramaticamente o risco da carteira."
      ],
      correct: 2,
      justifications: {
        0: { type: 'incorrect', text: "Esta é a base do Growth Investing (Investimento em Crescimento), que se foca em potencial futuro, e não em preço atual." },
        1: { type: 'incorrect', text: "O Value Investing é uma estratégia de longo prazo e focada em fundamentos, o oposto de especulação de curto prazo." },
        2: { type: 'correct', text: "O Value Investing busca o desconto. O investidor compra a ação abaixo do seu valor fundamental (o valor intrínseco), garantindo uma Margem de Segurança que protege o investimento de erros de cálculo e volatilidade." },
        3: { type: 'incorrect', text: "O setor não é o foco; o foco é a qualidade da empresa e o preço de negociação." },
        4: { type: 'incorrect', text: "Investidores em valor como Buffett são conhecidos por evitar alavancagem excessiva e focar na preservação de capital." }
      }
    }]
  },
  {
    moduleNumber: "I",
    title: "Custo Efetivo Total (CET)",
    questions: [{
      question: "Você está comparando propostas de empréstimo em dois bancos. Qual indicador você deve usar obrigatoriamente para ter certeza de qual proposta é realmente a mais barata, considerando juros, taxas e encargos?",
      hint: "Procure pelo índice que engloba todos os custos da operação de crédito.",
      options: [
        "Apenas a Taxa de Juros Nominal mensal.",
        "A taxa de inflação (IPCA) acumulada no período do empréstimo.",
        "O Índice de Inadimplência do Banco Central (Bacen).",
        "O Custo Efetivo Total (CET).",
        "O Imposto sobre Operações Financeiras (IOF) da operação."
      ],
      correct: 3,
      justifications: {
        0: { type: 'incorrect', text: "A taxa nominal ignora as tarifas, impostos (IOF) e outros custos embutidos, podendo levar a uma falsa impressão de que o empréstimo é mais barato do que realmente é." },
        1: { type: 'incorrect', text: "A inflação afeta o poder de compra, mas não é o indicador direto do custo do crédito." },
        2: { type: 'incorrect', text: "O índice de inadimplência mede o risco de crédito do banco, mas não o custo final para o tomador do empréstimo." },
        3: { type: 'correct', text: "O CET é o indicador obrigatório por lei que engloba todos os custos incidentes na operação de crédito (juros, taxas administrativas, impostos e seguros), sendo a única forma de comparar propostas com precisão." },
        4: { type: 'incorrect', text: "O IOF é apenas um dos componentes do custo total; o CET é que agrupa todos eles." }
      }
    }]
  },
  {
    moduleNumber: "II",
    title: "Juros de Cartão de Crédito",
    questions: [{
      question: "Qual é o mecanismo que torna o cartão de crédito a dívida mais perigosa e cara no Brasil quando o valor total da fatura não é pago?",
      hint: "Pense na diferença entre o pagamento mínimo e o valor total devido.",
      options: [
        "A Taxa Selic é aplicada diretamente sobre o valor em aberto, mas ela é baixa.",
        "O uso do Custo de Oportunidade, que impede o crescimento do capital do devedor.",
        "O atraso gera o crédito rotativo, que cobra juros compostos altíssimos (em alguns casos, acima de 300% ao ano) sobre o saldo devedor.",
        "O cartão cobra apenas juros simples, que são facilmente controláveis a longo prazo.",
        "A dívida é automaticamente convertida em dólar após o primeiro dia de atraso."
      ],
      correct: 2,
      justifications: {
        0: { type: 'incorrect', text: "A taxa de juros do cartão de crédito é muito superior à Selic e é composta por juros remuneratórios e multa/mora." },
        1: { type: 'incorrect', text: "O Custo de Oportunidade é um conceito de finanças, mas não o mecanismo que encarece a dívida do cartão." },
        2: { type: 'correct', text: "O crédito rotativo é a modalidade de juros composta acionada ao não pagar o valor total, aplicando as taxas mais elevadas do mercado sobre o saldo remanescente, o que leva a uma escalada rápida da dívida." },
        3: { type: 'incorrect', text: "A dívida do cartão de crédito utiliza o regime de juros compostos, que é o que potencializa o crescimento do saldo." },
        4: { type: 'incorrect', text: "A dívida é cobrada na moeda nacional, acrescida dos juros e encargos locais." }
      }
    }]
  },
  {
    moduleNumber: "III",
    title: "Previdência Privada",
    questions: [{
      question: "Em termos de planejamento financeiro, qual é o objetivo principal e de longo prazo de contratar um plano de Previdência Privada (PGBL/VGBL)?",
      hint: "O foco não é a rentabilidade imediata, mas sim a segurança futura.",
      options: [
        "Ser um investimento de alta liquidez para a reserva de emergência.",
        "Garantir uma fonte de renda complementar ou de aposentadoria, preservando o padrão de vida na velhice.",
        "Usar o benefício fiscal da tabela regressiva no Imposto de Renda no curto prazo.",
        "Obter retornos de renda variável (ações) acima da média do mercado com risco zero.",
        "Pagar a faculdade dos filhos dentro de cinco anos."
      ],
      correct: 1,
      justifications: {
        0: { type: 'incorrect', text: "A previdência privada tem baixa liquidez (resgate em longo prazo) e não é adequada para a reserva de emergência." },
        1: { type: 'correct', text: "A previdência privada é um instrumento de acumulação de capital de longo prazo, criado com a finalidade primária de complementar a renda da aposentadoria oficial." },
        2: { type: 'incorrect', text: "Embora haja benefícios fiscais (PGBL), eles só são vantajosos se o plano for mantido por muitos anos, mantendo o foco no longo prazo." },
        3: { type: 'incorrect', text: "Não existe investimento com risco zero. Além disso, a Previdência Privada pode ter exposição à renda variável, mas o foco é a segurança do planejamento." },
        4: { type: 'incorrect', text: "Para objetivos de médio prazo (cinco anos), existem instrumentos mais adequados e com maior liquidez." }
      }
    }]
  },
  {
    moduleNumber: "IV",
    title: "Poder de Compra",
    questions: [{
      question: "Um investimento rendeu 10% ao ano, mas a inflação (IPCA) no mesmo período foi de 5%. Qual foi o ganho de Rentabilidade Real do investidor?",
      hint: "O ganho real é o que realmente aumenta o seu poder de compra, descontando a inflação.",
      options: [
        "Um ganho nominal de 10% (Rentabilidade Real), ignorando a inflação.",
        "Um ganho real de 15%, somando os dois percentuais.",
        "Um ganho real de aproximadamente 5%.",
        "Uma perda real de -5%, pois a inflação sempre supera os investimentos.",
        "Zero, pois não há garantia de que o investimento renderá mais do que a poupança."
      ],
      correct: 2,
      justifications: {
        0: { type: 'incorrect', text: "O ganho nominal é de 10%, mas o ganho real sempre exige o desconto da inflação." },
        1: { type: 'incorrect', text: "Os percentuais não devem ser somados; a inflação deve ser subtraída da rentabilidade nominal." },
        2: { type: 'correct', text: "O cálculo simplificado da rentabilidade real é a Rentabilidade Nominal (10%) menos a Inflação (5%), resultando em 5% de ganho de poder de compra." },
        3: { type: 'incorrect', text: "Houve ganho real, pois a rentabilidade nominal (10%) foi superior à inflação (5%)." },
        4: { type: 'incorrect', text: "O desempenho do investimento é comparado à inflação, não à poupança, para medir o ganho real de poder de compra." }
      }
    }]
  },
  {
    moduleNumber: "V",
    title: "Prazo e Risco",
    questions: [{
      question: "Qual é o princípio fundamental (o 'trade-off') que geralmente rege a relação entre Risco, Rentabilidade e Liquidez em investimentos?",
      hint: "O que você precisa sacrificar para buscar um retorno maior?",
      options: [
        "Quanto menor o risco e a liquidez, maior é a rentabilidade esperada.",
        "Para buscar maior rentabilidade, o investidor geralmente precisa aceitar menor risco e maior liquidez.",
        "É sempre possível maximizar rentabilidade, liquidez e minimizar risco simultaneamente.",
        "Maiores retornos (Rentabilidade) geralmente exigem que o investidor aceite maior Risco e, frequentemente, menor Liquidez (prazos mais longos).",
        "A liquidez e o risco não têm nenhuma correlação com a rentabilidade de um ativo."
      ],
      correct: 3,
      justifications: {
        0: { type: 'incorrect', text: "Geralmente, baixo risco e baixa liquidez não se combinam com alta rentabilidade." },
        1: { type: 'incorrect', text: "Quanto maior o potencial de rentabilidade, maior o risco associado." },
        2: { type: 'incorrect', text: "O 'tripé dos investimentos' exige que se priorize no máximo dois desses elementos. Não é possível ter alta rentabilidade, alta liquidez e baixo risco ao mesmo tempo." },
        3: { type: 'correct', text: "O 'trade-off' ou a relação de compromisso é: para buscar mais rentabilidade, você tem que se expor a mais risco ou abrir mão da liquidez (deixar o dinheiro parado por mais tempo)." },
        4: { type: 'incorrect', text: "Os três elementos estão intimamente ligados na precificação de qualquer ativo financeiro." }
      }
    }]
  }
];
