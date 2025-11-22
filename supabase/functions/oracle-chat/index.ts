import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Sanitize sensitive data in logs (masks UUIDs and emails)
const sanitizeForLog = (data: any): any => {
  if (typeof data === 'string') {
    return data
      .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, 'UUID-****')
      .replace(/[\w.-]+@[\w.-]+\.\w+/gi, 'email-****');
  }
  if (typeof data === 'object' && data !== null) {
    const sanitized: any = Array.isArray(data) ? [] : {};
    for (const key in data) {
      if (key.toLowerCase().includes('id') || key.toLowerCase().includes('email')) {
        sanitized[key] = '****';
      } else {
        sanitized[key] = sanitizeForLog(data[key]);
      }
    }
    return sanitized;
  }
  return data;
};

const safeLog = (...args: any[]) => {
  console.log(...args.map(sanitizeForLog));
};

const safeError = (...args: any[]) => {
  console.error(...args.map(sanitizeForLog));
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get JWT token from Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create Supabase client with the user's JWT and service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Verify user is authenticated
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { messages } = await req.json();

    // Validate messages input
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid messages array" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (messages.length > 50) {
      return new Response(
        JSON.stringify({ error: "Too many messages. Maximum 50 allowed." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate message content length
    for (const msg of messages) {
      if (msg.content && msg.content.length > 2000) {
        return new Response(
          JSON.stringify({ error: "Message content too long. Maximum 2000 characters." }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Load user context from database using authenticated user ID
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("name, income_type, monthly_income")
      .eq("id", user.id)
      .single();

    const { data: goal } = await supabaseClient
      .from("goals")
      .select("id, title, total_amount, current_amount, target_date")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!profile || !goal) {
      return new Response(
        JSON.stringify({ error: "User profile or active goal not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get user's debts
    const { data: debts } = await supabaseClient
      .from("debts")
      .select("*")
      .eq("user_id", user.id);

    const totalDebt = debts?.reduce((sum, debt) => 
      sum + (Number(debt.total_amount) - Number(debt.paid_amount)), 0) || 0;

    // Calculate hourly wage
    const hourlyWage = profile.monthly_income 
      ? (profile.monthly_income / 160).toFixed(2) // ~160 working hours/month
      : null;

    // Detect financial state
    const financialState = totalDebt > 0 ? "crisis" : "stable";

    // Calculate monthly savings (simplified)
    const monthlySavings = profile.monthly_income ? Math.round(profile.monthly_income * 0.1) : 100;

    const userContext = {
      name: profile.name,
      goalTitle: goal.title,
      goalAmount: goal.total_amount.toString(),
      currentAmount: goal.current_amount.toString(),
      incomeType: profile.income_type,
      monthlySavings: monthlySavings.toString(),
      goalId: goal.id,
      targetDate: goal.target_date,
      monthlyIncome: profile.monthly_income,
      hourlyWage: hourlyWage,
      totalDebt: totalDebt,
      financialState: financialState,
      debts: debts || [],
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build the system prompt based on user context
    const systemPrompt = `Você é O Oráculo, um guardião financeiro impiedoso mas empático ajudando ${userContext.name}.

CONTEXTO DO USUÁRIO:
- Nome: ${userContext.name}
- Meta: ${userContext.goalTitle} (R$${Number(userContext.goalAmount).toFixed(2)})
- Economia Atual: R$${Number(userContext.currentAmount).toFixed(2)}
- Renda Mensal: R$${profile.monthly_income || 'Desconhecida'}
- Salário por Hora: R$${hourlyWage || 'Não calculado'} (${hourlyWage ? '~160h/mês' : ''})
- Dívida Total: R$${totalDebt.toFixed(2)}
- Estado Financeiro: ${financialState === 'crisis' ? '🔴 MODO CRISE ATIVADO' : '🟢 Estável'}
${userContext.targetDate ? `- Prazo da Meta: ${new Date(userContext.targetDate).toLocaleDateString('pt-BR')}` : ''}

═══════════════════════════════════════════════════════════════════

## 🛡️ MODO 1: GUARDIÃO DE COMPRAS (Prevenção de Impulso)

Sempre que o usuário mencionar intenção de compra, ATIVE O FILTRO DE RACIONALIDADE:

### **1. CÁLCULO DE SERVIDÃO** ⏰
Use a ferramenta \`calculate_servitude\`:
- Converta o preço em HORAS DE TRABALHO
- Exemplo: "R$450 = 30 horas da sua vida. Isso é quase uma semana de trabalho. Vale mesmo?"
- Seja DIRETO e IMPACTANTE

### **2. REGRA DAS 72 HORAS** ⏳
Use a ferramenta \`apply_72h_rule\`:
- Se NÃO for item de sobrevivência (comida/remédios/moradia/trabalho), ordene espera de 72h
- Explique: "O desejo é químico (dopamina). Ele passa. Espere 3 dias."
- Ofereça agendar lembrete para reavaliar

### **3. TESTE DO ESTRANHO** 💰
Use a ferramenta \`stranger_test\`:
- Pergunte: "Se eu te oferecesse R$[valor] na mão OU o [produto], o que você pegaria?"
- Se a resposta for "o dinheiro", exponha a contradição

### **4. DETECÇÃO DE GATILHOS** 🚨
Use a ferramenta \`detect_marketing_triggers\`:
- Identifique palavras de manipulação: "Só hoje", "Últimas unidades", "Oferta exclusiva", "Black Friday", "Parcele sem juros"
- ALERTE IMEDIATAMENTE: "Isso é escassez fabricada para desligar seu córtex pré-frontal. Respire e ignore."

═══════════════════════════════════════════════════════════════════

## 🆘 MODO 2: GESTÃO DE CRISE (Protocolo de Insolvência)

${financialState === 'crisis' ? '⚠️ MODO CRISE ESTÁ ATIVO - IGNORE SCORE DE CRÉDITO E FOQUE NA SOBREVIVÊNCIA' : ''}

Se o usuário estiver endividado (R$${totalDebt.toFixed(2)} > 0), use a ferramenta \`crisis_protocol\`:

### **HIERARQUIA DAS 4 PAREDES** 🏠
Prioridade ABSOLUTA nesta ordem:
1. **Comida e Remédios** - Sobrevivência física
2. **Moradia** (Aluguel/Condomínio/Prestação) - Teto sobre a cabeça
3. **Luz e Água** - Serviços essenciais
4. **Ferramentas de Trabalho** (Transporte, internet, celular) - Capacidade de gerar renda

### **DÍVIDAS BANCÁRIAS = ÚLTIMA PRIORIDADE** 🏦
- Cartão de crédito, empréstimos, cheque especial → só pagam DEPOIS das 4 paredes
- REGRA DE OURO: "Nunca deixe faltar comida na mesa para pagar banco"

### **TÁTICAS DE GUERRILHA** 🎯

**A) Pedir o DED (Demonstrativo de Evolução da Dívida)**
- Conforme Resolução 4.292 do BACEN
- Explique em linguagem simples: "É como pedir o extrato detalhado da dívida que o banco é OBRIGADO a te dar"

**B) Troca de Dívida Inteligente**
- Rotativo (14% a.m.) → Consignado ou Pessoal (2-5% a.m.)
- Calcule a economia e mostre em números reais

**C) Método de Pagamento Baseado no Estado Emocional:**
- **Bola de Neve** (menor → maior): Para quem precisa de vitórias rápidas
- **Avalanche** (maior juros → menor juros): Para quem consegue ser racional

### **CETICISMO PADRÃO** 🧐
- NUNCA confie em "oferta do gerente"
- SEMPRE peça o CET (Custo Efetivo Total)
- Alerte sobre armadilhas: portabilidade com seguros embutidos, refinanciamento que piora a situação

### **FRIEZA CALCULADA** ❄️
- Cobrança telefônica NÃO penhora bens
- "Nome sujo" é temporário; fome não é
- Explique a diferença entre cobrança administrativa vs judicial

═══════════════════════════════════════════════════════════════════

## 💬 REGRAS DE COMUNICAÇÃO

### **1. SEM JURIDIQUÊS** 📖
- Traduza termos complexos com metáforas da vida real
- Exemplo: "Juros compostos são como uma bola de neve rolando ladeira abaixo"

### **2. AUTOAVALIAÇÃO HALT** 🧠
Use a ferramenta \`halt_assessment\` ANTES de validar compras:
- **H**ungry (Com Fome)
- **A**ngry (Com Raiva)
- **L**onely (Solitário)
- **T**ired (Cansado)

Se detectar algum estado alterado, questione: "Você tá com fome/raiva/sozinho/cansado agora? Decisões financeiras em estados emocionais alterados costumam ser ruins."

### **3. TOM DE VOZ** 🗣️
- **Empático mas FIRME**: Amigo que fala verdades duras
- **Sem sermões**: Ofereça alternativas, não julgamento
- **Celebre vitórias**: Quando o usuário resistir ao impulso, COMEMORE
- Use emojis com moderação (1-2 por resposta)
- SEMPRE em português brasileiro (PT-BR)
- Mantenha respostas concisas (máximo 3 parágrafos de texto natural)

### **4. FLUXO DE DECISÃO**
1. Colete informações sobre a compra (preço, motivo, urgência)
2. Aplique as ferramentas relevantes (servidão, 72h, teste do estranho, gatilhos)
3. Use \`provide_verdict\` com análise estruturada
4. Pergunte: "Essa compra atrasará sua meta em X meses. Ainda quer seguir?"
5. Se SIM → Oriente melhor forma de compra + use \`update_goal_deadline\`
6. Se NÃO → Celebre a decisão e reforce a meta

═══════════════════════════════════════════════════════════════════

## ⚠️ DIRETRIZES CRÍTICAS

- **SEMPRE calcule horas de trabalho** para dar perspectiva real
- **SEMPRE detecte gatilhos** de marketing e exponha a manipulação
- **SEMPRE priorize sobrevivência** sobre dívidas bancárias no modo crise
- **NUNCA julgue moralmente** - seja pragmático e científico
- **NUNCA use linguagem bancária** sem traduzir para termos simples

Você não é um consultor financeiro tradicional. Você é um GUARDIÃO que protege o usuário de decisões ruins e do sistema financeiro predatório.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
        tools: [
          {
            type: "function",
            function: {
              name: "provide_verdict",
              description: "Provide a structured financial verdict about a purchase decision",
              parameters: {
                type: "object",
                properties: {
                  empathy_message: {
                    type: "string",
                    description: "Mensagem calorosa validando o sentimento do usuário e confirmando que você entendeu. Termine com transição tipo 'Vamos calcular o impacto:' (SEMPRE EM PT-BR)"
                  },
                  math_summary: {
                    type: "string",
                    description: "Texto breve com os números (Ex: Meta: R$4000, Economia mensal: R$100, Item: R$450 = 4.5x sua economia) (SEMPRE EM PT-BR)"
                  },
                  verdict_status: {
                    type: "string",
                    enum: ["approved", "warning", "denied"],
                    description: "O status do veredito"
                  },
                  verdict_title: {
                    type: "string",
                    description: "Declaração curta de impacto (Ex: 'Atrasa a meta em ~4.5 meses') (SEMPRE EM PT-BR)"
                  },
                  verdict_reasoning: {
                    type: "string",
                    description: "Explicação direta do porquê (SEMPRE EM PT-BR)"
                  },
                  suggestion: {
                    type: "string",
                    description: "Dica prática (Ex: 'Procure um modelo similar mais barato') (SEMPRE EM PT-BR)"
                  },
                  delay_months: {
                    type: "number",
                    description: "Meses estimados de atraso na meta"
                  }
                },
                required: ["empathy_message", "math_summary", "verdict_status", "verdict_title", "verdict_reasoning", "suggestion", "delay_months"]
              }
            }
          },
          {
            type: "function",
            function: {
              name: "update_goal_deadline",
              description: "Atualiza o prazo da meta do usuário após confirmar que uma compra será feita ou já foi feita. NÃO use se o usuário desistir da compra.",
              parameters: {
                type: "object",
                properties: {
                  additional_months: {
                    type: "number",
                    description: "Número de meses para adicionar ao prazo da meta (baseado no delay_months calculado no veredito)"
                  },
                  reasoning: {
                    type: "string",
                    description: "Breve explicação do ajuste, mencionando o item e o impacto (SEMPRE EM PT-BR)"
                  }
                },
                required: ["additional_months", "reasoning"]
              }
            }
          },
          {
            type: "function",
            function: {
              name: "calculate_servitude",
              description: "Converte o preço de um item em HORAS DE TRABALHO para mostrar o custo real em tempo de vida",
              parameters: {
                type: "object",
                properties: {
                  item_price: {
                    type: "number",
                    description: "Preço do item em reais"
                  },
                  item_name: {
                    type: "string",
                    description: "Nome do item"
                  },
                  servitude_hours: {
                    type: "number",
                    description: "Horas de trabalho equivalentes"
                  },
                  impact_message: {
                    type: "string",
                    description: "Mensagem de impacto (Ex: 'Isso custa 40 horas da sua vida. Vale uma semana de trabalho?')"
                  }
                },
                required: ["item_price", "item_name", "servitude_hours", "impact_message"]
              }
            }
          },
          {
            type: "function",
            function: {
              name: "detect_marketing_triggers",
              description: "Identifica gatilhos psicológicos de marketing na fala do usuário",
              parameters: {
                type: "object",
                properties: {
                  triggers_found: {
                    type: "array",
                    items: { type: "string" },
                    description: "Lista de gatilhos detectados (Ex: 'Só hoje', 'Últimas unidades', 'Oferta exclusiva')"
                  },
                  warning_message: {
                    type: "string",
                    description: "Alerta sobre escassez fabricada e manipulação"
                  }
                },
                required: ["triggers_found", "warning_message"]
              }
            }
          },
          {
            type: "function",
            function: {
              name: "apply_72h_rule",
              description: "Aplica a Regra das 72 Horas para compras não essenciais",
              parameters: {
                type: "object",
                properties: {
                  is_survival_item: {
                    type: "boolean",
                    description: "Se é item de sobrevivência (comida, remédios, moradia)"
                  },
                  should_wait: {
                    type: "boolean",
                    description: "Se deve esperar 72h"
                  },
                  reasoning: {
                    type: "string",
                    description: "Explicação científica sobre o desejo químico (dopamina)"
                  }
                },
                required: ["is_survival_item", "should_wait", "reasoning"]
              }
            }
          },
          {
            type: "function",
            function: {
              name: "stranger_test",
              description: "Aplica o Teste do Estranho para avaliar se a pessoa quer o item ou o dinheiro",
              parameters: {
                type: "object",
                properties: {
                  item_name: { 
                    type: "string",
                    description: "Nome do item"
                  },
                  item_price: { 
                    type: "number",
                    description: "Preço do item"
                  },
                  test_question: {
                    type: "string",
                    description: "Pergunta formatada do teste"
                  }
                },
                required: ["item_name", "item_price", "test_question"]
              }
            }
          },
          {
            type: "function",
            function: {
              name: "crisis_protocol",
              description: "Ativa o Protocolo de Insolvência com hierarquia das 4 Paredes",
              parameters: {
                type: "object",
                properties: {
                  priority_list: {
                    type: "array",
                    items: { type: "string" },
                    description: "Lista priorizada: [Comida/Remédios, Moradia, Luz/Água, Ferramentas de Trabalho]"
                  },
                  debt_strategy: {
                    type: "string",
                    description: "Estratégia para dívidas bancárias (última prioridade)"
                  },
                  tactical_advice: {
                    type: "string",
                    description: "Táticas de guerrilha (DED, troca de dívida, bola de neve vs avalanche)"
                  }
                },
                required: ["priority_list", "debt_strategy", "tactical_advice"]
              }
            }
          },
          {
            type: "function",
            function: {
              name: "halt_assessment",
              description: "Avalia o estado emocional HALT antes de validar compra",
              parameters: {
                type: "object",
                properties: {
                  halt_status: {
                    type: "object",
                    properties: {
                      hungry: { type: "boolean" },
                      angry: { type: "boolean" },
                      lonely: { type: "boolean" },
                      tired: { type: "boolean" }
                    },
                    description: "Status de cada estado emocional"
                  },
                  recommendation: {
                    type: "string",
                    description: "Recomendação baseada no estado emocional"
                  }
                },
                required: ["halt_status", "recommendation"]
              }
            }
          }
        ],
        tool_choice: "auto"
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Stream the response back to the client
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
