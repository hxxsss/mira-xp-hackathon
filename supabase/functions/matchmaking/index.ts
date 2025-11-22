import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log("Starting matchmaking process...");

    // 1. Fetch waiting players
    const { data: waitingPlayers, error: fetchError } = await supabase
      .from("pvp_queue")
      .select("*")
      .eq("status", "searching")
      .order("created_at", { ascending: true })
      .limit(100);

    if (fetchError) {
      console.error("Error fetching waiting players:", fetchError);
      throw fetchError;
    }

    if (!waitingPlayers || waitingPlayers.length < 2) {
      console.log(`Not enough players: ${waitingPlayers?.length || 0}`);
      return new Response(
        JSON.stringify({ message: "Aguardando mais jogadores", waiting: waitingPlayers?.length || 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${waitingPlayers.length} waiting players`);

    // 2. Group by matchmaking criteria
    const matches = new Map<string, any[]>();
    
    waitingPlayers.forEach(player => {
      const key = `${player.difficulty_level}-${player.xp_bet}`;
      if (!matches.has(key)) matches.set(key, []);
      matches.get(key)!.push(player);
    });

    // 3. Create matches for each pair
    const createdMatches = [];
    
    for (const [key, players] of matches) {
      console.log(`Processing group ${key} with ${players.length} players`);
      
      while (players.length >= 2) {
        const player1 = players.shift()!;
        const player2 = players.shift()!;

        console.log(`Matching ${player1.user_id} vs ${player2.user_id}`);

        // Fetch questions for this difficulty level
        const { data: questions, error: questionsError } = await supabase
          .from("pvp_questions")
          .select("*")
          .eq("level", player1.difficulty_level);

        if (questionsError) {
          console.error("Error fetching questions:", questionsError);
          continue;
        }

        if (!questions || questions.length < 5) {
          console.error(`Not enough questions for level ${player1.difficulty_level}`);
          continue;
        }

        // Shuffle and pick 5 questions
        const shuffled = questions.sort(() => Math.random() - 0.5).slice(0, 5);

        // Generate match code
        const matchCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        
        // Create match
        const { data: newMatch, error: matchError } = await supabase
          .from("pvp_matches")
          .insert({
            host_user_id: player1.user_id,
            opponent_user_id: player2.user_id,
            match_code: matchCode,
            xp_bet: player1.xp_bet,
            difficulty_level: player1.difficulty_level,
            questions_data: shuffled,
            status: "in_progress",
            match_mode: "1v1",
            started_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (matchError) {
          console.error("Error creating match:", matchError);
          continue;
        }

        console.log(`Created match ${newMatch.id}`);

        // Update queue entries to matched
        const { error: updateError } = await supabase
          .from("pvp_queue")
          .update({ 
            status: "matched", 
            matched_at: new Date().toISOString(),
            match_id: newMatch.id 
          })
          .in("id", [player1.id, player2.id]);

        if (updateError) {
          console.error("Error updating queue:", updateError);
        }

        createdMatches.push(newMatch);
      }
    }

    console.log(`Matchmaking complete. Created ${createdMatches.length} matches`);

    return new Response(
      JSON.stringify({ 
        message: "Matchmaking concluído",
        matches: createdMatches.length,
        details: createdMatches.map(m => ({ id: m.id, code: m.match_code }))
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Matchmaking error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
