import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { goalId, additionalMonths } = await req.json();

    if (!goalId || additionalMonths === undefined) {
      return new Response(
        JSON.stringify({ error: "goalId and additionalMonths are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create Supabase client with service role key for admin access
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get current goal
    const { data: goal, error: fetchError } = await supabaseAdmin
      .from("goals")
      .select("target_date, user_id")
      .eq("id", goalId)
      .single();

    if (fetchError) {
      console.error("Error fetching goal:", fetchError);
      return new Response(
        JSON.stringify({ error: "Goal not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Calculate new target date
    const currentDate = goal.target_date ? new Date(goal.target_date) : new Date();
    currentDate.setMonth(currentDate.getMonth() + additionalMonths);

    // Update goal with new target date
    const { error: updateError } = await supabaseAdmin
      .from("goals")
      .update({ target_date: currentDate.toISOString().split('T')[0] })
      .eq("id", goalId);

    if (updateError) {
      console.error("Error updating goal:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update goal deadline" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Goal ${goalId} deadline updated: added ${additionalMonths} months`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        newTargetDate: currentDate.toISOString().split('T')[0],
        additionalMonths 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Update goal deadline error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
