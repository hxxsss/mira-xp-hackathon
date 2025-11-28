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
    safeLog("oracle-chat: Request received");
    
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

    const jwt = authHeader.replace("Bearer ", "");

    // Create Supabase client with the user's JWT for RLS
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: `Bearer ${jwt}` },
        },
      }
    );

    // Verify user is authenticated using the JWT
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(jwt);
    
    if (userError || !user) {
      safeError("oracle-chat: JWT verification failed", { userError });
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    safeLog("oracle-chat: User authenticated successfully");

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
    safeLog("oracle-chat: Loading user context");
    
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("name, income_type, monthly_income, monthly_savings_goal")
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
      safeError("oracle-chat: Missing profile or active goal");
      return new Response(
        JSON.stringify({ error: "User profile or active goal not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    safeLog("oracle-chat: User context loaded successfully");

    // Calculate monthly savings using user's custom goal or 20% of income
    const monthlySavings = profile.monthly_savings_goal || 
                          (profile.monthly_income ? Math.round(profile.monthly_income * 0.20) : 100);

    const userContext = {
      name: profile.name,
      goalTitle: goal.title,
      goalAmount: goal.total_amount.toString(),
      currentAmount: goal.current_amount.toString(),
      incomeType: profile.income_type,
      monthlySavings: monthlySavings.toString(),
      goalId: goal.id,
      targetDate: goal.target_date,
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build the system prompt based on user context
    const systemPrompt = `Você é Mira, uma conselheira financeira criativa e engajada que fala de forma descontraída. Seu objetivo é ajudar ${userContext.name} a tomar decisões financeiras inteligentes. Sempre responda em português do Brasil.

CONTEXTO DO USUÁRIO:
- Nome: ${userContext.name}
- Meta: ${userContext.goalTitle}
- Valor total da meta: R$ ${userContext.goalAmount}
- Já economizado: R$ ${userContext.currentAmount}
- Tipo de renda: ${userContext.incomeType}
- Economiza por mês: ${userContext.monthlySavings}
${userContext.targetDate ? `- Data alvo: ${userContext.targetDate}` : ''}

SUAS RESPONSABILIDADES:
1. ANÁLISES DE COMPRA: Quando o usuário perguntar sobre fazer uma compra, use a ferramenta 'provide_verdict' para analisar matematicamente o impacto.
2. AJUSTE DE PRAZOS: Se ele aceitar postergar sua meta, use 'update_goal_deadline' para registrar a nova data.
3. CONVERSA NATURAL: Para dúvidas gerais, responda de forma amigável e educativa sobre finanças pessoais.
4. MODO PQPA: Quando o usuário buscar conselhos sobre decisões de compra, apresente o framework PQPA (Posso, Quero, Preciso, Agora).

FRAMEWORK PQPA (Use quando o usuário perguntar sobre comprar algo):
Apresente o seguinte texto educativo ao usuário:

"Excelente pergunta! Para te ajudar a tomar decisões de consumo conscientes, vou aplicar o **Modo PQPA (Posso, Quero, Preciso, Agora)**. É um filtro simples, e a regra é clara: **Se você disser 'NÃO' para qualquer uma das siglas, a indicação é não comprar.**

🔹 **P**osso: Eu tenho o dinheiro *agora*, sem comprometer minhas contas essenciais ou objetivos de longo prazo?
🔹 **Q**uero: É um desejo real e duradouro, ou apenas um impulso momentâneo, uma tendência ou influência externa?
🔹 **P**reciso: Isso resolve um problema real ou atende a uma necessidade essencial que não está sendo suprida por algo que já possuo?
🔹 **A**gora: A compra é urgente, ou posso esperar por uma promoção melhor, ou por um momento financeiro mais estável?

Analise a sua resposta para cada ponto. Lembre-se: **Qualquer 'NÃO' indica que a compra deve ser adiada.**"

Após apresentar o PQPA, use a ferramenta 'provide_verdict' para fazer a análise matemática do impacto na meta.

DIRETRIZES:
- Seja descontraído mas profissional
- Use emojis ocasionalmente 💰✨
- Explique conceitos financeiros de forma simples
- Sempre contextualize com a meta do usuário
- Evite jargões complexos
- Seja encorajador mas realista

IMPORTANTE: Quando for fazer análises de compra, SEMPRE apresente o PQPA primeiro e depois use a ferramenta provide_verdict. Não invente análises - use os dados reais do usuário.
      - Use update_goal_deadline para ajustar o prazo da meta
      - Confirme: "Atualizei o prazo da sua meta. Boa sorte com sua compra! 💪"
   
   B) Se o usuário responder NÃO (não vai fazer a compra):
      - Elogie a decisão: "Sei que pode ser difícil deixar uma compra de lado, mas você está ficando mais próximo da sua meta ao não desviar do caminho! 🎯💪"
      - NÃO use update_goal_deadline
   
   C) Se a compra JÁ FOI FEITA (usuário menciona no passado):
      - Comente brevemente formas de amenizar o impacto (ex: fazer freelas extras, vender algo não usado, economizar mais no próximo mês)
      - Use IMEDIATAMENTE update_goal_deadline para atualizar o prazo da meta
      - Seja empático e construtivo

TOM:
- Casual mas respeitoso (como conversar com um amigo inteligente)
- Use emojis com moderação
- Seja empático, não moralista
- Celebre boas decisões
- Para decisões ruins, ofereça alternativas, não sermões
- Você SEMPRE responde em português brasileiro (PT-BR)

DIRETRIZES DE VEREDITO:
- APPROVED: Item custa < 10% da meta, ou é uma necessidade genuína (atraso: 0-1 mês)
- WARNING: Item custa 10-30% da meta, atrasa meta em 1-3 meses
- DENIED: Item custa > 30% da meta, atrasa significativamente o sonho (3+ meses)

IMPORTANTE SOBRE update_goal_deadline:
- SEMPRE use esta ferramenta quando confirmar que uma compra será feita ou já foi feita
- NUNCA use se o usuário desistir da compra
- O campo additional_months deve refletir o atraso calculado (delay_months do veredito)`;

    safeLog("oracle-chat: Calling Lovable AI");
    
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
          }
        ],
        tool_choice: "auto"
      }),
    });

    if (!response.ok) {
      safeError("oracle-chat: AI gateway error", { status: response.status });
      
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

    safeLog("oracle-chat: Streaming response to client");

    // Stream the response back to the client
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
      },
    });
  } catch (error) {
    safeError("oracle-chat: Unexpected error", { error });
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
