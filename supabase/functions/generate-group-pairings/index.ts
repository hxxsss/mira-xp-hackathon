import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Player {
  id: string;
  user_id: string;
  group_id: string;
  name?: string;
}

interface Pairing {
  player1: Player;
  player2: Player;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { matchId } = await req.json();

    if (!matchId) {
      return new Response(
        JSON.stringify({ error: 'matchId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`[generate-group-pairings] Processing match ${matchId}`);

    // Buscar todos os grupos da partida
    const { data: groups, error: groupsError } = await supabase
      .from('pvp_groups')
      .select('id, name')
      .eq('match_id', matchId);

    if (groupsError) {
      console.error('[generate-group-pairings] Error fetching groups:', groupsError);
      throw groupsError;
    }

    if (!groups || groups.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No groups found for this match' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const groupIds = groups.map(g => g.id);

    // Buscar todos os membros de todos os grupos
    const { data: members, error: membersError } = await supabase
      .from('pvp_group_members')
      .select('*, profiles!inner(name)')
      .in('group_id', groupIds);

    if (membersError) {
      console.error('[generate-group-pairings] Error fetching members:', membersError);
      throw membersError;
    }

    if (!members || members.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No members found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Preparar lista de jogadores com informações do grupo
    const players: Player[] = members.map((m: any) => ({
      id: m.id,
      user_id: m.user_id,
      group_id: m.group_id,
      name: m.profiles?.name || 'Jogador'
    }));

    console.log(`[generate-group-pairings] Found ${players.length} players across ${groups.length} groups`);

    // Algoritmo de emparelhamento 1v1
    const pairings: Pairing[] = [];
    const playersCopy = [...players];
    const usedPlayers = new Set<string>();

    // Primeira passada: emparelhar jogadores de grupos diferentes
    while (playersCopy.length >= 2) {
      const player1 = playersCopy.shift()!;
      usedPlayers.add(player1.user_id);

      // Buscar oponente de grupo diferente que ainda não foi usado
      const opponentIndex = playersCopy.findIndex(
        p => p.group_id !== player1.group_id && !usedPlayers.has(p.user_id)
      );

      if (opponentIndex !== -1) {
        const player2 = playersCopy.splice(opponentIndex, 1)[0];
        usedPlayers.add(player2.user_id);
        pairings.push({ player1, player2 });
        console.log(`[generate-group-pairings] Paired ${player1.name} vs ${player2.name}`);
      } else {
        // Jogador "sobra" - emparelhar com alguém já emparelhado
        if (pairings.length > 0) {
          const randomPairing = pairings[Math.floor(Math.random() * pairings.length)];
          const duplicateOpponent = Math.random() > 0.5 ? randomPairing.player1 : randomPairing.player2;
          pairings.push({ player1, player2: duplicateOpponent });
          console.log(`[generate-group-pairings] Player ${player1.name} will fight duplicate opponent ${duplicateOpponent.name}`);
        } else {
          // Se não há ninguém para emparelhar ainda, continuar
          playersCopy.push(player1);
        }
      }
    }

    // Tratar último jogador sobrando (caso haja número ímpar)
    if (playersCopy.length === 1 && pairings.length > 0) {
      const lastPlayer = playersCopy[0];
      const randomPairing = pairings[Math.floor(Math.random() * pairings.length)];
      const duplicateOpponent = Math.random() > 0.5 ? randomPairing.player1 : randomPairing.player2;
      pairings.push({ player1: lastPlayer, player2: duplicateOpponent });
      console.log(`[generate-group-pairings] Last player ${lastPlayer.name} paired with ${duplicateOpponent.name}`);
    }

    // Inserir emparelhamentos no banco de dados
    const pairingInserts = pairings.map(p => ({
      match_id: matchId,
      round_number: 1,
      player1_id: p.player1.user_id,
      player1_group_id: p.player1.group_id,
      player2_id: p.player2.user_id,
      player2_group_id: p.player2.group_id,
      status: 'pending'
    }));

    const { error: insertError } = await supabase
      .from('pvp_group_pairings')
      .insert(pairingInserts);

    if (insertError) {
      console.error('[generate-group-pairings] Error inserting pairings:', insertError);
      throw insertError;
    }

    console.log(`[generate-group-pairings] Created ${pairings.length} pairings successfully`);

    // Atualizar status da partida para in_progress
    const { error: updateError } = await supabase
      .from('pvp_matches')
      .update({ 
        status: 'in_progress',
        started_at: new Date().toISOString()
      })
      .eq('id', matchId);

    if (updateError) {
      console.error('[generate-group-pairings] Error updating match status:', updateError);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        pairingsCount: pairings.length,
        pairings: pairings.map(p => ({
          player1: p.player1.name,
          player2: p.player2.name
        }))
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[generate-group-pairings] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});