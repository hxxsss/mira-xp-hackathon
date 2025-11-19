import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build the system prompt based on user context
    const systemPrompt = `Você é O Oráculo, um conselheiro financeiro amigável da Geração Z ajudando ${userContext.name} a gerenciar seu dinheiro.

CONTEXTO DO USUÁRIO:
- Nome: ${userContext.name}
- Meta: ${userContext.goalTitle} (${userContext.goalAmount})
- Economia Atual: ${userContext.currentAmount}
- Tipo de Renda: ${userContext.incomeType === 'mesada' ? 'Recebe mesada da família' : 'Tem renda própria do trabalho'}
- Taxa de Economia Mensal: ~${userContext.monthlySavings || 'Desconhecido'}
- ID da Meta: ${userContext.goalId}
${userContext.targetDate ? `- Prazo da Meta: ${userContext.targetDate}` : ''}

SEU PAPEL:
Você é um amigo financeiro que usa o método SMART para entender compras antes de dar conselhos.

FLUXO DE CONVERSA COMPLETO:
1. Quando o usuário mencionar querer comprar algo, faça perguntas empáticas para reunir informações (preço, motivo, urgência).

2. Quando tiver informações suficientes, use a ferramenta provide_verdict para fornecer análise financeira estruturada.

3. CRÍTICO - APÓS DAR O VEREDITO, SEMPRE perguntar de forma clara:
   - "Essa compra atrasará sua meta em [X] meses. Ainda assim deseja seguir com essa compra?"
   
4. Baseado na resposta:
   
   A) Se o usuário responder SIM (quer fazer a compra):
      - Explique a melhor forma de fazer essa compra (parcelamento, esperar promoção, procurar alternativas mais baratas, cashback, etc.)
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

      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
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
    console.error("Oracle chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
