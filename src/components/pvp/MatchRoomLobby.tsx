import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Users, Plus, Trophy, Zap, Target, ArrowRight, Crown, Loader2, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { PvPHeader } from "./PvPHeader";

interface MatchRoomLobbyProps {
  matchId: string;
  userId: string;
  onGroupSelected: (groupId: string) => void;
}

export const MatchRoomLobby = ({ matchId, userId, onGroupSelected }: MatchRoomLobbyProps) => {
  const [match, setMatch] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [currentXp, setCurrentXp] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
    
    const channel = supabase
      .channel(`match-room-${matchId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pvp_groups', filter: `match_id=eq.${matchId}` }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pvp_group_members' }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pvp_matches', filter: `id=eq.${matchId}` }, loadMatchStatus)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
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
              profiles(name, avatar_id)
            )
          `)
          .eq("match_id", matchId),
        supabase.from("profiles").select("current_xp").eq("id", userId).single()
      ]);

      if (matchRes.data) setMatch(matchRes.data);
      if (groupsRes.data) setGroups(groupsRes.data);
      if (profileRes.data) setCurrentXp(profileRes.data.current_xp);
    } catch (error) {
      console.error("Erro ao carregar sala:", error);
      toast({
        title: "Erro ao carregar sala",
        description: "Tente novamente",
        variant: "destructive"
      });
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
      toast({
        title: "Partida iniciada!",
        description: "A batalha começou"
      });
    }
  };

  const createGroup = async () => {
    if (!newGroupName.trim()) {
      toast({ title: "Digite o nome do grupo", variant: "destructive" });
      return;
    }

    if (currentXp < match.xp_bet) {
      toast({
        title: "XP insuficiente",
        description: `Você precisa de ${match.xp_bet} XP para criar grupo`,
        variant: "destructive"
      });
      return;
    }

    setCreatingGroup(true);
    try {
      const groupCode = Array.from({ length: 6 }, () => 
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]
      ).join('');

      const { data: group, error: groupError } = await supabase
        .from("pvp_groups")
        .insert({
          name: newGroupName,
          leader_user_id: userId,
          match_id: matchId,
          invite_code: groupCode
        })
        .select()
        .single();

      if (groupError) throw groupError;

      await supabase
        .from("profiles")
        .update({ current_xp: currentXp - match.xp_bet })
        .eq("id", userId);

      await supabase.from("pvp_group_members").insert({
        group_id: group.id,
        user_id: userId
      });

      toast({
        title: "Grupo criado!",
        description: `${newGroupName} foi criado com sucesso`
      });

      onGroupSelected(group.id);
    } catch (error: any) {
      console.error("Erro ao criar grupo:", error);
      toast({
        title: "Erro ao criar grupo",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setCreatingGroup(false);
    }
  };

  const joinGroup = async (groupId: string, xpBet: number) => {
    if (currentXp < xpBet) {
      toast({
        title: "XP insuficiente",
        description: `Você precisa de ${xpBet} XP para entrar`,
        variant: "destructive"
      });
      return;
    }

    try {
      await supabase
        .from("profiles")
        .update({ current_xp: currentXp - xpBet })
        .eq("id", userId);

      await supabase.from("pvp_group_members").insert({
        group_id: groupId,
        user_id: userId
      });

      toast({ title: "Entrou no grupo!" });
      onGroupSelected(groupId);
    } catch (error: any) {
      console.error("Erro ao entrar no grupo:", error);
      
      await supabase
        .from("profiles")
        .update({ current_xp: currentXp })
        .eq("id", userId);
      
      toast({
        title: "Erro ao entrar no grupo",
        description: error.message,
        variant: "destructive"
      });
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

  const canCreateGroup = groups.length < match.max_groups;
  const hostGroup = groups.find(g => g.leader_user_id === match.host_user_id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-4 md:p-6 relative overflow-hidden">
      <PvPHeader />
      
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -50, 0],
            y: [0, -30, 0]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10 space-y-6">
        {/* Match Info with Code */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="backdrop-blur-2xl bg-white/10 border-white/20 p-6 rounded-2xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center justify-center md:justify-start gap-2">
                  <Trophy className="w-8 h-8 text-yellow-400" />
                  Sala de Batalha Épica
                </h1>
                <p className="text-purple-200 text-sm">Escolha ou crie seu grupo para começar</p>
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
                <span className="text-white font-semibold">{groups.length}/{match.max_groups} grupos</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AnimatePresence>
            {groups.map((group, index) => {
              const isHost = group.id === hostGroup?.id;
              const memberCount = group.pvp_group_members?.length || 0;
              
              return (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`backdrop-blur-2xl border-2 p-6 rounded-2xl hover:scale-105 transition-transform ${
                    isHost 
                      ? 'bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border-yellow-500/50' 
                      : 'bg-white/10 border-white/20'
                  }`}>
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                            {group.name}
                            {isHost && <Crown className="w-5 h-5 text-yellow-400" />}
                          </h3>
                          <p className="text-purple-200 text-sm">
                            {memberCount} {memberCount === 1 ? 'membro' : 'membros'}
                          </p>
                        </div>
                        
                        {isHost && (
                          <span className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-xs font-bold border border-yellow-500/50">
                            Grupo do Host
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {group.pvp_group_members?.slice(0, 4).map((member: any) => (
                          <div
                            key={member.id}
                            className="bg-purple-900/50 px-3 py-1 rounded-lg text-white text-sm"
                          >
                            {member.profiles?.name || 'Jogador'}
                          </div>
                        ))}
                        {memberCount > 4 && (
                          <div className="bg-purple-900/50 px-3 py-1 rounded-lg text-white text-sm">
                            +{memberCount - 4}
                          </div>
                        )}
                      </div>

                      <Button
                        onClick={() => joinGroup(group.id, match.xp_bet)}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold"
                        disabled={currentXp < match.xp_bet}
                      >
                        {currentXp < match.xp_bet ? (
                          "XP Insuficiente"
                        ) : (
                          <>
                            Entrar no Grupo
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Create New Group */}
          {canCreateGroup && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: groups.length * 0.1 }}
            >
              <Card className="backdrop-blur-2xl bg-white/5 border-2 border-dashed border-white/30 p-6 rounded-2xl h-full flex flex-col justify-center">
                <div className="space-y-4">
                  <div className="text-center">
                    <Plus className="w-12 h-12 text-white/50 mx-auto mb-3" />
                    <h3 className="text-xl font-bold text-white mb-2">Criar Novo Grupo</h3>
                    <p className="text-purple-200 text-sm mb-4">
                      Seja o líder do seu próprio grupo
                    </p>
                  </div>

                  <Input
                    placeholder="Nome do grupo..."
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="bg-purple-950/50 border-purple-600 text-white"
                  />

                  <Button
                    onClick={createGroup}
                    disabled={creatingGroup || !newGroupName.trim() || currentXp < match.xp_bet}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold"
                  >
                    {creatingGroup ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : currentXp < match.xp_bet ? (
                      "XP Insuficiente"
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Criar Grupo
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {!canCreateGroup && groups.length === match.max_groups && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Card className="backdrop-blur-2xl bg-white/5 border-2 border-white/20 p-6 rounded-2xl h-full flex items-center justify-center">
                <div className="text-center text-white/70">
                  <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="font-semibold">Limite de grupos atingido</p>
                  <p className="text-sm mt-2">Escolha um dos grupos disponíveis</p>
                </div>
              </Card>
            </motion.div>
          )}
        </div>

        {/* User XP Info */}
        <Card className="backdrop-blur-2xl bg-white/10 border-white/20 p-4 rounded-xl">
          <div className="flex items-center justify-between text-white">
            <span className="font-semibold">Seu XP disponível:</span>
            <span className="text-2xl font-bold text-yellow-400">{currentXp} XP</span>
          </div>
          {currentXp < match.xp_bet && (
            <p className="text-yellow-300 text-sm mt-2 text-center">
              💡 Complete módulos na aba Mentalidade para ganhar mais XP!
            </p>
          )}
        </Card>
      </div>
    </div>
  );
};
