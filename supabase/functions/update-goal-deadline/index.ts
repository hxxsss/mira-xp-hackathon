import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

    // Create Supabase client with the user's JWT
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
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

    const { goalId, additionalMonths } = await req.json();

    // Validate inputs
    if (!goalId || additionalMonths === undefined) {
      return new Response(
        JSON.stringify({ error: "goalId and additionalMonths are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate goalId is a valid UUID
    if (!UUID_REGEX.test(goalId)) {
      return new Response(
        JSON.stringify({ error: "Invalid goalId format" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate additionalMonths is a number and within reasonable bounds
    const months = Number(additionalMonths);
    if (isNaN(months) || months < -12 || months > 120) {
      return new Response(
        JSON.stringify({ error: "additionalMonths must be between -12 and 120" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get current goal and verify ownership
    const { data: goal, error: fetchError } = await supabaseClient
      .from("goals")
      .select("target_date, user_id")
      .eq("id", goalId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !goal) {
      return new Response(
        JSON.stringify({ error: "Goal not found or access denied" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Calculate new target date
    const currentDate = goal.target_date ? new Date(goal.target_date) : new Date();
    currentDate.setMonth(currentDate.getMonth() + months);

    // Update goal with new target date
    const { error: updateError } = await supabaseClient
      .from("goals")
      .update({ target_date: currentDate.toISOString().split('T')[0] })
      .eq("id", goalId)
      .eq("user_id", user.id);

    if (updateError) {
      return new Response(
        JSON.stringify({ error: "Failed to update goal deadline" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        newTargetDate: currentDate.toISOString().split('T')[0],
        additionalMonths: months
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
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
