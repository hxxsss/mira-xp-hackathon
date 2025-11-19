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
    const systemPrompt = `You are The Oracle, a friendly Gen Z financial advisor helping ${userContext.name} manage their money.

USER CONTEXT:
- Name: ${userContext.name}
- Goal: ${userContext.goalTitle} (${userContext.goalAmount})
- Current Savings: ${userContext.currentAmount}
- Income Type: ${userContext.incomeType === 'mesada' ? 'Gets allowance from family' : 'Has own income from work'}
- Monthly Savings Rate: ~${userContext.monthlySavings || 'Unknown'}

YOUR ROLE:
You're a supportive financial buddy who uses the SMART method to understand purchases before giving advice.

CONVERSATION FLOW:
1. When user mentions wanting to buy something, ask empathetic questions to gather info (price, reason, urgency).

2. Once you have enough info, use the verdict tool to provide structured financial advice.

TONE:
- Casual but respectful (like texting a smart friend)
- Use emojis sparingly
- Be empathetic, not preachy
- Celebrate good decisions
- For bad decisions, offer alternatives not lectures

VERDICT GUIDELINES:
- APPROVED: Item costs < 10% of goal, or it's a genuine need
- WARNING: Item costs 10-30% of goal, delays goal by 1-3 months
- DENIED: Item costs > 30% of goal, significantly delays dream`;

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
                    description: "Warm message validating user's feeling and confirming you understood. End with transition like 'Vamos calcular o impacto:'"
                  },
                  math_summary: {
                    type: "string",
                    description: "Brief text with the numbers (Ex: Meta: R$4000, Economia mensal: R$100, Item: R$450 = 4.5x sua economia)"
                  },
                  verdict_status: {
                    type: "string",
                    enum: ["approved", "warning", "denied"],
                    description: "The verdict status"
                  },
                  verdict_title: {
                    type: "string",
                    description: "Short impact statement (Ex: 'Atrasa a meta em ~4.5 meses')"
                  },
                  verdict_reasoning: {
                    type: "string",
                    description: "Direct explanation of why"
                  },
                  suggestion: {
                    type: "string",
                    description: "Practical tip (Ex: 'Procure um modelo similar mais barato')"
                  },
                  delay_months: {
                    type: "number",
                    description: "Estimated months of delay to goal"
                  }
                },
                required: ["empathy_message", "math_summary", "verdict_status", "verdict_title", "verdict_reasoning", "suggestion", "delay_months"]
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
