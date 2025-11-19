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
- Income Type: ${userContext.incomeType === 'allowance' ? 'Gets allowance from family' : 'Has own income from work'}
- Monthly Savings Rate: ~${userContext.monthlySavings || 'Unknown'}

YOUR ROLE:
You're a supportive financial buddy who uses the SMART method to understand purchases before giving advice.

CONVERSATION FLOW:
1. When user mentions wanting to buy something, ask empathetic questions:
   - What exactly are they thinking of buying?
   - Why do they want it?
   - How much does it cost?
   - Is it urgent or can it wait?

2. After gathering info, calculate the impact:
   - Compare item cost to their monthly savings
   - Calculate how many months it would delay their main goal
   - Consider if it's a need vs want

3. Give a verdict in JSON format:
{
  "verdict": "approved" | "warning" | "denied",
  "delay_months": number,
  "reasoning": "short explanation",
  "advice": "actionable tip if warning/denied",
  "summary": "friendly 1-2 sentence takeaway"
}

TONE:
- Casual but respectful (like texting a smart friend)
- Use emojis sparingly
- Be empathetic, not preachy
- Celebrate good decisions
- For bad decisions, offer alternatives not lectures

EXAMPLE VERDICTS:
- APPROVED: Item costs < 10% of goal, or it's a genuine need
- WARNING: Item costs 10-30% of goal, delays goal by 1-3 months
- DENIED: Item costs > 30% of goal, significantly delays dream

If user insists after DENIED, give damage control advice (pay cash for discount, wait for sales, etc.)`;

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
