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

    // Fetch last 10 transactions
    const { data: transactions } = await supabaseClient
      .from("transactions")
      .select("amount, category, description, date, type, is_recurring")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(10);

    // Fetch active debts
    const { data: debts } = await supabaseClient
      .from("debts")
      .select("name, total_amount, paid_amount, due_date")
      .eq("user_id", user.id);

    safeLog("oracle-chat: User context loaded successfully");

    // Calculate monthly savings using user's custom goal or 20% of income
    const monthlySavings = profile.monthly_savings_goal || 
                          (profile.monthly_income ? Math.round(profile.monthly_income * 0.20) : 100);

    // Calculate financial metrics (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentExpenses = transactions?.filter(t => 
      t.type === 'expense' && new Date(t.date) >= thirtyDaysAgo
    ) || [];

    const fixedExpenses = recentExpenses
      .filter(t => t.is_recurring)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const monthlyExpenses = recentExpenses
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const monthlyIncome = profile.monthly_income || 0;
    const freeBalance = monthlyIncome - monthlyExpenses;

    // Get top 3 expense categories
    const expensesByCategory = recentExpenses.reduce((acc, t) => {
      const category = t.category || 'Outros';
      acc[category] = (acc[category] || 0) + Number(t.amount);
      return acc;
    }, {} as Record<string, number>);

    const topExpenses = Object.entries(expensesByCategory)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([category, amount]) => `${category}: R$ ${(amount as number).toFixed(2)}`)
      .join(', ') || 'Nenhum gasto recente';

    // Calculate total debt
    const totalDebt = debts?.reduce((sum, d) => 
      sum + (Number(d.total_amount) - Number(d.paid_amount)), 0
    ) || 0;

    const userContext = {
      name: profile.name,
      goalTitle: goal.title,
      goalAmount: goal.total_amount.toString(),
      currentAmount: goal.current_amount.toString(),
      incomeType: profile.income_type,
      monthlySavings: monthlySavings.toString(),
      goalId: goal.id,
      targetDate: goal.target_date,
      monthlyIncome: monthlyIncome.toString(),
      fixedExpenses: fixedExpenses.toFixed(2),
      monthlyExpenses: monthlyExpenses.toFixed(2),
      freeBalance: freeBalance.toFixed(2),
      topExpenses: topExpenses,
      totalDebt: totalDebt.toFixed(2),
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build the system prompt based on user context
    const systemPrompt = `Você é o Oráculo, um Auditor Financeiro Pessoal integrado ao aplicativo MIRA. Sempre responda em português do Brasil.

RAIO-X FINANCEIRO DO USUÁRIO:
- Nome: ${userContext.name}
- Meta Ativa: ${userContext.goalTitle}
- Progresso: R$ ${userContext.currentAmount} de R$ ${userContext.goalAmount}
${userContext.targetDate ? `- Prazo da Meta: ${new Date(userContext.targetDate).toLocaleDateString('pt-BR')}` : ''}

SITUAÇÃO FINANCEIRA REAL:
- Renda Mensal: R$ ${userContext.monthlyIncome}
- Despesas Fixas: R$ ${userContext.fixedExpenses}
- Gastos Este Mês: R$ ${userContext.monthlyExpenses}
- Saldo Livre Atual: R$ ${userContext.freeBalance}
- Dívidas Ativas: R$ ${userContext.totalDebt}
- Top 3 Gastos Recentes: ${userContext.topExpenses}
- Economia Planejada/Mês: R$ ${userContext.monthlySavings}

FRAMEWORK OBRIGATÓRIO: PQPA (Preciso, Quero, Posso, Agora)
Use a sigla PQPA nas suas respostas para dar autoridade à análise.
NUNCA explique o que cada letra significa. O usuário já conhece o método.

APLICAÇÃO DO PQPA:
- Preciso: Confronte necessidade vs capricho usando o histórico de gastos
- Quero: Questione se é desejo real ou impulso momentâneo
- Posso: Use o saldo livre real e o impacto na meta para responder
- Agora: Considere timing, preços e sazonalidade

SUAS FERRAMENTAS:
1. provide_verdict: Use SEMPRE que o usuário mencionar compra com valor específico
2. update_goal_deadline: Use quando a compra impactar o prazo da meta (>1 semana)

ESTILO DE COMUNICAÇÃO:
- Seja CURTO, DIRETO e PERSONALIZADO
- Use os dados reais para confrontar o usuário quando necessário
- Exemplo: "Pelo PQPA, o 'Posso' travou: você já gastou R$ 400 em iFood esse mês. Esse Nike vai sugar seu saldo livre."
- Se aprovar: breve celebração + lembrete do impacto
- Se negar: mostre os números sem dó, mas com empatia

REGRA DE OURO:
- Mencione "PQPA" ou "pelo filtro PQPA" nas análises de compra
- Use os dados reais (Top 3 gastos, saldo livre) para embasar sua resposta
- Seja o auditor rigoroso que o usuário precisa, não o amigo que diz sim pra tudo
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
