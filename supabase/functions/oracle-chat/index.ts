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

    // Decode JWT from Authorization header to extract user id
    if (!authHeader.toLowerCase().startsWith("bearer ")) {
      return new Response(
        JSON.stringify({ error: "Invalid authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const token = authHeader.split(" ")[1];
    let userId: string | null = null;

    try {
      const [, payload] = token.split(".");
      const base64 = payload.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((payload.length + 3) % 4);
      const decoded = JSON.parse(atob(base64));
      userId = decoded.sub ?? null;
    } catch (e) {
      safeError("Failed to decode JWT", e);
    }


    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );


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
      .eq("id", userId)
      .single();

    const { data: goal } = await supabaseClient
      .from("goals")
      .select("id, title, total_amount, current_amount, target_date")
      .eq("user_id", userId)
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
      .eq("user_id", userId);

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
    const systemPrompt = `VOCÊ É O ORÁCULO - Guardião Financeiro de ${userContext.name}

CONTEXTO:
- Meta: ${userContext.goalTitle} (R$${Number(userContext.goalAmount).toFixed(2)})
- Progresso: R$${Number(userContext.currentAmount).toFixed(2)} de R$${Number(userContext.goalAmount).toFixed(2)}
- Renda: R$${profile.monthly_income || 'Desconhecida'}/mês
- Salário/hora: R$${hourlyWage || '?'} (~160h/mês)
- Economia mensal estimada: ~R$${((profile.monthly_income || 0) * 0.2).toFixed(2)}
${userContext.targetDate ? `- Prazo: ${new Date(userContext.targetDate).toLocaleDateString('pt-BR')}` : ''}

═══════════════════════════════════════════

SEU ÚNICO TRABALHO:
Quando o usuário mencionar uma POSSÍVEL COMPRA, faça isso:

1. COLETA NATURAL (se faltar dados):
   Se não tiver PREÇO + MOTIVO, pergunte naturalmente:
   - "Legal! Quanto custa? E me conta, por que você quer isso?"
   - "Opa! Qual o valor? E qual a real necessidade?"
   
   **NÃO desperdice tempo com "Vamos analisar?" - vá direto ao ponto**

2. ANÁLISE IMEDIATA (assim que tiver preço + motivo):
   a) Mensagem breve: "Entendi, [item] de R$[valor]. Vou calcular o impacto real..."
   b) Use calculate_servitude (preço → horas de trabalho)
   c) Use provide_verdict com:
      - delay_months: Quantos meses vai atrasar a meta
      - verdict_status:
        * "approved" → Necessidade real
        * "warning" → Desejo válido mas não urgente  
        * "denied" → Impulso / marketing / luxo desnecessário

3. CRITÉRIOS PARA VEREDITO:

   ✅ APPROVED (Recomendada):
   - Ferramenta de trabalho que gera/protege renda
   - Saúde / segurança urgente
   - Educação que aumenta renda
   - Previne gastos maiores futuros
   - Necessidade básica (comida, moradia, trabalho)
   
   ⚠️ WARNING (Alerta):
   - Desejo legítimo mas pode esperar
   - Preço alto para benefício médio
   - Alternativa mais barata existe
   - Atrasa meta moderadamente (2-6 meses)
   
   ❌ DENIED (Não Recomendada):
   - Impulso puro / gatilho emocional
   - Marketing manipulativo ("só hoje", "última unidade", "oferta exclusiva")
   - Luxo sem necessidade clara
   - Atrasa meta significativamente (>6 meses)
   - Estado emocional alterado (com fome/raiva/cansado/sozinho)

4. FORMATO DA RESPOSTA:
   Mensagem natural → [Tools: calculate_servitude + provide_verdict] → Pergunta final
   
   "Essa compra vai atrasar sua meta em X meses. Ainda quer seguir?"

═══════════════════════════════════════════

TOM DE VOZ:
- Direto mas empático (amigo que fala verdades duras)
- Números sem enrolação
- Verdade desconfortável quando necessário
- Celebra decisões inteligentes
- Use emojis com moderação (1-2 por mensagem)
- Português brasileiro (PT-BR)
- Respostas concisas (máximo 3 parágrafos)

═══════════════════════════════════════════

NÃO FAÇA:
- ❌ Análise sem ter preço + motivo
- ❌ Múltiplas perguntas de coleta (pergunte tudo de uma vez)
- ❌ Sermões morais ou julgamentos
- ❌ Frases vazias tipo "Vamos analisar?"
- ❌ Linguagem técnica sem explicar

═══════════════════════════════════════════

EXEMPLOS DE FLUXO IDEAL:

👤 "Quero comprar um notebook"
🔮 "Legal! Quanto custa esse notebook? E me conta, por que você precisa dele?"

👤 "R$3500, pra trabalhar com design"
🔮 "Entendi, notebook pra design de R$3500. Vou calcular o impacto real..."
    [Tools executam]
    "Essa compra vai atrasar sua meta em ~9 meses, mas é ferramenta de trabalho. Ainda quer seguir?"

---

👤 "Vi um tênis de R$800"
🔮 "Opa! E por que você quer esse tênis?"

👤 "Tá na promoção só hoje"
🔮 "Entendi, tênis de R$800 'só hoje'. Vou analisar..."
    [Tools executam, detectam gatilho de marketing]
    "Isso vai atrasar sua meta em 2 meses. É gatilho de escassez pra te fazer comprar sem pensar. Vale a pena?"`;


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
              description: "Provide a structured financial verdict. IMPORTANTE: Esta ferramenta só deve ser chamada DEPOIS de você ter enviado uma mensagem de texto natural reconhecendo a situação do usuário.",
              parameters: {
                type: "object",
                properties: {
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
                required: ["math_summary", "verdict_status", "verdict_title", "verdict_reasoning", "suggestion", "delay_months"]
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
