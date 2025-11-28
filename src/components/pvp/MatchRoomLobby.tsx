import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Users, Trophy, Zap, Target, Crown, Loader2, Copy, Swords, UserPlus, ArrowLeft, Check, Clock, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { PvPHeader } from "./PvPHeader";
import { CountdownAnimation } from "./CountdownAnimation";

interface MatchRoomLobbyProps {
  matchId: string;
  userId: string;
  onGroupSelected: (groupId: string) => void;
  onLeaveLobby: () => void;
}

const TEAM_NAMES = ["Time Alfa", "Time Beta"];
const MAX_PLAYERS_PER_TEAM = 3;
const MIN_PLAYERS_PER_TEAM = 2;

export const MatchRoomLobby = ({ matchId, userId, onGroupSelected, onLeaveLobby }: MatchRoomLobbyProps) => {
  const navigate = useNavigate();
  const [match, setMatch] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningTeam, setJoiningTeam] = useState<string | null>(null);
  const [currentXp, setCurrentXp] = useState(0);
  const [userGroupId, setUserGroupId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [allPlayersReady, setAllPlayersReady] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
    
    const channel = supabase
      .channel(`match-room-${matchId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pvp_groups', filter: `match_id=eq.${matchId}` }, () => {
        console.log('Groups changed, reloading...');
        loadData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pvp_group_members' }, () => {
        console.log('Members changed, reloading...');
        loadData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pvp_matches', filter: `id=eq.${matchId}` }, loadMatchStatus)
      .subscribe();

    // Polling backup every 2 seconds
    const pollInterval = setInterval(loadData, 2000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, [matchId]);

  const loadData = async () => {
    try {
      const [matchRes, groupsRes, profileRes] = await Promise.all([
        supabase.from("pvp_matches").select("*").eq("id", matchId).single(),
        supabase
          .from("pvp_groups")
          .select(`
            *,
            pvp_group_members(
              id,
              user_id,
              is_ready,
              profiles(name, avatar_id)
            )
          `)
          .eq("match_id", matchId)
          .order("created_at", { ascending: true }),
        supabase.from("profiles").select("current_xp").eq("id", userId).single()
      ]);

      if (matchRes.data) setMatch(matchRes.data);
      if (groupsRes.data) {
        console.log('Loaded groups:', groupsRes.data);
        setGroups(groupsRes.data);
        const userGroup = groupsRes.data.find((g: any) => 
          g.pvp_group_members?.some((m: any) => m.user_id === userId)
        );
        if (userGroup) {
          setUserGroupId(userGroup.id);
          // Check if current user is ready
          const userMember = userGroup.pvp_group_members?.find((m: any) => m.user_id === userId);
          if (userMember) {
            setIsReady(userMember.is_ready || false);
          }
        } else {
          setUserGroupId(null);
          setIsReady(false);
        }

        // Check if all players are ready
        const allMembers = groupsRes.data.flatMap((g: any) => g.pvp_group_members || []);
        const allReady = allMembers.length >= MIN_PLAYERS_PER_TEAM * 2 && 
                         allMembers.every((m: any) => m.is_ready);
        setAllPlayersReady(allReady);
      }
      if (profileRes.data) setCurrentXp(profileRes.data.current_xp);
    } catch (error) {
      console.error("Erro ao carregar sala:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMatchStatus = async () => {
    const { data } = await supabase
      .from("pvp_matches")
      .select("status")
      .eq("id", matchId)
      .single();
    
    if (data?.status === 'in_progress') {
      console.log('[MatchRoomLobby] Match status is in_progress, transitioning to game...');
      
      // Make sure we have the user's group ID before transitioning
      if (userGroupId) {
        onGroupSelected(userGroupId);
      } else {
        // Try to get user's group one more time
        const { data: groupData } = await supabase
          .from('pvp_group_members')
          .select('group_id')
          .eq('user_id', userId)
          .single();
        
        if (groupData) {
          onGroupSelected(groupData.group_id);
        }
      }
    }
  };

  const handleLeaveLobby = async () => {
    if (userGroupId) {
      // Remove from group
      await supabase
        .from("pvp_group_members")
        .delete()
        .eq("group_id", userGroupId)
        .eq("user_id", userId);
      
      // Refund XP
      if (match) {
        await supabase
          .from("profiles")
          .update({ current_xp: currentXp + match.xp_bet })
          .eq("id", userId);
      }
    }
    
    toast({
      title: "Você saiu do lobby",
      description: "Seu XP foi devolvido"
    });
    
    // Call parent handler to clear state
    onLeaveLobby();
  };

  const handleLeaveTeam = async () => {
    if (!userGroupId) return;

    // Remove from group
    await supabase
      .from("pvp_group_members")
      .delete()
      .eq("group_id", userGroupId)
      .eq("user_id", userId);
    
    // Refund XP
    if (match) {
      await supabase
        .from("profiles")
        .update({ current_xp: currentXp + match.xp_bet })
        .eq("id", userId);
      setCurrentXp(prev => prev + match.xp_bet);
    }

    setUserGroupId(null);
    setIsReady(false);
    
    toast({
      title: "Você saiu do time",
      description: "Seu XP foi devolvido. Escolha outro time!"
    });
    
    loadData();
  };

  const handleToggleReady = async () => {
    if (!userGroupId) return;

    const newReadyState = !isReady;
    
    const { error } = await supabase
      .from("pvp_group_members")
      .update({ is_ready: newReadyState })
      .eq("group_id", userGroupId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error updating ready status:", error);
      toast({
        title: "Erro ao atualizar status",
        description: "Tente novamente",
        variant: "destructive"
      });
      return;
    }

    setIsReady(newReadyState);
    toast({
      title: newReadyState ? "Você está pronto!" : "Você não está mais pronto",
    });
  };

  const handleStartMatch = async () => {
    // Start countdown
    setShowCountdown(true);
  };

  const handleCountdownComplete = async () => {
    // Set the group ID first before changing status
    if (userGroupId) {
      onGroupSelected(userGroupId);
    }

    // Call edge function to generate pairings and start match
    // This will update the match status to 'in_progress' as well
    try {
      const { data, error } = await supabase.functions.invoke('generate-group-pairings', {
        body: { matchId }
      });
      
      if (error) {
        console.error('[MatchRoomLobby] Error generating pairings:', error);
        toast({
          title: "Erro ao iniciar partida",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      
      console.log('[MatchRoomLobby] Pairings generated:', data);
      toast({
        title: "Partida iniciada!",
        description: `${data.pairingsCount} batalhas criadas`
      });
    } catch (err) {
      console.error('[MatchRoomLobby] Error:', err);
      
      // Fallback: just update status if edge function fails
      await supabase
        .from("pvp_matches")
        .update({ 
          status: 'in_progress',
          started_at: new Date().toISOString()
        })
        .eq("id", matchId);
    }
  };

  const createOrJoinTeam = async (teamIndex: number) => {
    const teamName = TEAM_NAMES[teamIndex];
    
    if (userGroupId) {
      toast({
        title: "Você já está em um time",
        description: "Aguarde o início da partida",
        variant: "destructive"
      });
      return;
    }

    if (currentXp < match.xp_bet) {
      toast({
        title: "XP insuficiente",
        description: `Você precisa de ${match.xp_bet} XP para entrar`,
        variant: "destructive"
      });
      return;
    }

    setJoiningTeam(teamName);
    
    try {
      // Check if team already exists by NAME, not by array index
      let team = groups.find(g => g.name === teamName);
      
      if (!team) {
        // Create team if it doesn't exist
        const groupCode = Array.from({ length: 6 }, () => 
          'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]
        ).join('');

        const { data: newTeam, error: createError } = await supabase
          .from("pvp_groups")
          .insert({
            name: TEAM_NAMES[teamIndex],
            leader_user_id: userId,
            match_id: matchId,
            invite_code: groupCode
          })
          .select()
          .single();

        if (createError) throw createError;
        team = newTeam;
      }

      // Check if team is full
      const currentMembers = team.pvp_group_members?.length || 0;
      if (currentMembers >= MAX_PLAYERS_PER_TEAM) {
        toast({
          title: "Time cheio",
          description: "Este time já tem 3 jogadores",
          variant: "destructive"
        });
        setJoiningTeam(null);
        return;
      }

      // Deduct XP
      await supabase
        .from("profiles")
        .update({ current_xp: currentXp - match.xp_bet })
        .eq("id", userId);

      // Join team
      await supabase.from("pvp_group_members").insert({
        group_id: team.id,
        user_id: userId
      });

      setUserGroupId(team.id);
      setCurrentXp(prev => prev - match.xp_bet);
      
      toast({ 
        title: `Entrou no ${TEAM_NAMES[teamIndex]}!`,
        description: "Aguarde os outros jogadores"
      });
      
      loadData();
    } catch (error: any) {
      console.error("Erro ao entrar no time:", error);
      toast({
        title: "Erro ao entrar no time",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setJoiningTeam(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
        <Loader2 className="w-12 h-12 animate-spin text-white" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
        <Card className="p-8 bg-white/10 backdrop-blur-xl border-white/20">
          <p className="text-white text-lg">Sala não encontrada</p>
        </Card>
      </div>
    );
  }

  const teamAlfa = groups.find(g => g.name === "Time Alfa");
  const teamBeta = groups.find(g => g.name === "Time Beta");
  
  const alfaMembers = teamAlfa?.pvp_group_members || [];
  const betaMembers = teamBeta?.pvp_group_members || [];
  
  const totalPlayers = alfaMembers.length + betaMembers.length;
  const canStart = alfaMembers.length >= MIN_PLAYERS_PER_TEAM && betaMembers.length >= MIN_PLAYERS_PER_TEAM;
  const isHost = match?.host_user_id === userId;

  const renderPlayerSlot = (member: any, slotIndex: number, teamColor: string) => {
    if (member) {
      const isCurrentUser = member.user_id === userId;
      const isLeader = slotIndex === 0;
      const memberIsReady = member.is_ready;
      
      return (
        <motion.div
          key={member.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`flex items-center gap-3 p-3 rounded-xl ${
            isCurrentUser 
              ? teamColor === "blue" ? 'bg-blue-500/30 border border-blue-400/50' : 'bg-red-500/30 border border-red-400/50'
              : 'bg-white/10'
          }`}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
            teamColor === "blue" ? 'bg-gradient-to-br from-blue-400 to-blue-600' : 'bg-gradient-to-br from-red-400 to-red-600'
          }`}>
            {member.profiles?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="flex-1">
            <p className="text-white font-medium flex items-center gap-2">
              {member.profiles?.name || 'Jogador'}
              {isCurrentUser && <span className="text-xs text-green-400">(você)</span>}
              {isLeader && <Crown className="w-4 h-4 text-yellow-400" />}
            </p>
          </div>
          {/* Ready indicator */}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            memberIsReady ? 'bg-green-500' : 'bg-white/20'
          }`}>
            {memberIsReady ? (
              <Check className="w-5 h-5 text-white" />
            ) : (
              <Clock className="w-4 h-4 text-white/60" />
            )}
          </div>
        </motion.div>
      );
    }

    return (
      <div
        key={`empty-${slotIndex}`}
        className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border-2 border-dashed border-white/20"
      >
        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
          <UserPlus className="w-5 h-5 text-white/40" />
        </div>
        <p className="text-white/40 text-sm">Aguardando jogador...</p>
      </div>
    );
  };

  const renderTeamCard = (teamName: string, members: any[], teamIndex: number, teamColor: string, bgGradient: string) => {
    const isFull = members.length >= MAX_PLAYERS_PER_TEAM;
    const isUserInThisTeam = members.some((m: any) => m.user_id === userId);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: teamIndex * 0.2 }}
      >
        <Card className={`backdrop-blur-2xl border-2 p-6 rounded-2xl ${bgGradient} ${
          isUserInThisTeam ? `ring-2 ring-${teamColor}-400` : ''
        }`}>
          <div className="space-y-4">
            {/* Team Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-${teamColor}-400 to-${teamColor}-600 flex items-center justify-center`}>
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{teamName}</h3>
                  <p className={`text-${teamColor}-300 text-sm`}>
                    {members.length}/{MAX_PLAYERS_PER_TEAM} jogadores
                  </p>
                </div>
              </div>
              
              {isFull && (
                <span className={`bg-${teamColor}-500/20 text-${teamColor}-300 px-3 py-1 rounded-full text-xs font-bold border border-${teamColor}-500/50`}>
                  ✓ Completo
                </span>
              )}
              
              {isUserInThisTeam && !isFull && (
                <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs font-bold border border-green-500/50">
                  Seu Time
                </span>
              )}
            </div>

            {/* Player Slots */}
            <div className="space-y-2">
              {Array.from({ length: MAX_PLAYERS_PER_TEAM }).map((_, idx) => 
                renderPlayerSlot(members[idx], idx, teamColor)
              )}
            </div>

            {/* Join Button */}
            {!userGroupId && !isFull && (
              <Button
                onClick={() => createOrJoinTeam(teamIndex)}
                disabled={joiningTeam !== null || currentXp < match.xp_bet}
                className={`w-full bg-gradient-to-r from-${teamColor}-500 to-${teamColor}-600 hover:from-${teamColor}-600 hover:to-${teamColor}-700 text-white font-bold`}
              >
                {joiningTeam === teamName ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : currentXp < match.xp_bet ? (
                  "XP Insuficiente"
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Entrar no {teamName}
                  </>
                )}
              </Button>
            )}
            
            {isUserInThisTeam && !isFull && (
              <div className="text-center text-white/60 text-sm py-2">
                Aguardando mais jogadores...
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    );
  };

  if (showCountdown) {
    return <CountdownAnimation onComplete={handleCountdownComplete} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-4 md:p-6 relative overflow-hidden">
      <PvPHeader />
      
      {/* Exit Button */}
      <div className="absolute top-4 left-4 z-20">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLeaveLobby}
          className="text-white hover:bg-white/20 bg-black/30 backdrop-blur-sm"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-red-500/20 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], x: [0, -50, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="max-w-5xl mx-auto relative z-10 space-y-6">
        {/* Match Info */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="backdrop-blur-2xl bg-white/10 border-white/20 p-6 rounded-2xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center justify-center md:justify-start gap-2">
                  <Swords className="w-8 h-8 text-yellow-400" />
                  Batalha 3v3
                </h1>
                <p className="text-purple-200 text-sm">6 jogadores necessários para começar</p>
              </div>
              
              <div className="flex flex-col items-center gap-2 bg-purple-900/50 px-6 py-4 rounded-xl border-2 border-purple-400/50">
                <span className="text-purple-300 text-xs font-medium">Código da Sala</span>
                <code className="text-3xl md:text-4xl font-black text-white tracking-widest">
                  {match.match_code}
                </code>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => {
                    navigator.clipboard.writeText(match.match_code);
                    toast({ title: "Código copiado!", description: match.match_code });
                  }}
                  className="text-purple-300 hover:text-white hover:bg-purple-500/30"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copiar
                </Button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 items-center justify-center md:justify-start mt-4 pt-4 border-t border-purple-500/30">
              <div className="flex items-center gap-2 bg-purple-900/50 px-4 py-2 rounded-lg">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="text-white font-semibold">{match.xp_bet} XP</span>
              </div>
              <div className="flex items-center gap-2 bg-purple-900/50 px-4 py-2 rounded-lg">
                <Target className="w-5 h-5 text-cyan-400" />
                <span className="text-white font-semibold">{match.difficulty_level}</span>
              </div>
              <div className="flex items-center gap-2 bg-purple-900/50 px-4 py-2 rounded-lg">
                <Users className="w-5 h-5 text-green-400" />
                <span className="text-white font-semibold">{totalPlayers}/6 jogadores</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="h-2 bg-purple-900/50 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-red-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(totalPlayers / 6) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* VS Display */}
        <div className="flex items-center justify-center gap-4 py-4">
          <div className="flex-1 h-1 bg-gradient-to-r from-transparent via-blue-500 to-blue-500 rounded" />
          <motion.div 
            className="text-4xl font-black text-white bg-gradient-to-br from-yellow-400 to-orange-500 px-6 py-3 rounded-2xl shadow-2xl"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            VS
          </motion.div>
          <div className="flex-1 h-1 bg-gradient-to-r from-red-500 via-red-500 to-transparent rounded" />
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderTeamCard(
            "Time Alfa", 
            alfaMembers, 
            0, 
            "blue",
            "bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border-blue-500/50"
          )}
          {renderTeamCard(
            "Time Beta", 
            betaMembers, 
            1, 
            "red",
            "bg-gradient-to-br from-red-900/40 to-orange-900/40 border-red-500/50"
          )}
        </div>

        {/* Ready Button for user */}
        {userGroupId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Card className="backdrop-blur-2xl bg-white/10 border-white/20 p-6 rounded-2xl text-center">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  onClick={handleToggleReady}
                  size="lg"
                  className={`flex-1 max-w-md text-xl font-bold py-6 transition-all ${
                    isReady 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' 
                      : 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700'
                  }`}
                >
                  {isReady ? (
                    <>
                      <Check className="w-6 h-6 mr-2" />
                      PRONTO!
                    </>
                  ) : (
                    <>
                      <Clock className="w-6 h-6 mr-2" />
                      ESTOU PRONTO!
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={handleLeaveTeam}
                  variant="outline"
                  size="lg"
                  className="border-red-500/50 text-red-300 hover:bg-red-500/20 hover:text-red-200 py-6"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Sair do Time
                </Button>
              </div>
              <p className="text-white/60 text-sm mt-3">
                {isReady ? "Clique novamente para cancelar" : "Clique quando estiver pronto para começar"}
              </p>
            </Card>
          </motion.div>
        )}

        {/* Start Button for host when all ready */}
        {isHost && canStart && allPlayersReady && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="backdrop-blur-2xl bg-gradient-to-r from-green-900/40 to-emerald-900/40 border-green-500/50 p-6 rounded-2xl text-center">
              <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">Todos os jogadores prontos!</h2>
              <Button
                onClick={handleStartMatch}
                size="lg"
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-xl px-12 py-6"
              >
                <Swords className="w-6 h-6 mr-2" />
                INICIAR BATALHA!
              </Button>
            </Card>
          </motion.div>
        )}

        {/* Status messages */}
        {userGroupId && !canStart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <Card className="backdrop-blur-2xl bg-white/5 border-white/20 p-4 rounded-xl inline-block">
              <p className="text-purple-200">
                <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                Aguardando mais jogadores (mínimo 2 por time)...
              </p>
            </Card>
          </motion.div>
        )}

        {userGroupId && canStart && !allPlayersReady && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <Card className="backdrop-blur-2xl bg-yellow-900/30 border-yellow-500/50 p-4 rounded-xl inline-block">
              <p className="text-yellow-200">
                <Clock className="w-4 h-4 inline mr-2" />
                Aguardando todos ficarem prontos...
              </p>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};