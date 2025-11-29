import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Copy, Users, Trophy, Loader2, UserPlus, Coins, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { avatars } from "@/components/ui/avatar-picker";
import { PvPHeader } from "./PvPHeader";

interface GroupLobbyProps {
  matchId: string;
  groupId: string;
  userId: string;
  onStartGame: () => void;
}

export const GroupLobby = ({ matchId, groupId, userId, onStartGame }: GroupLobbyProps) => {
  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [allGroups, setAllGroups] = useState<any[]>([]);
  const [match, setMatch] = useState<any>(null);
  const [isLeader, setIsLeader] = useState(false);
  const [readyGroups, setReadyGroups] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
    loadMatchData();
    
    const timeoutId = setTimeout(() => {
      if (!group || !match) {
        console.warn('⚠️ GroupLobby: Timeout - Dados não carregaram em 5s');
        toast({
          title: "Problemas ao carregar",
          description: "Recarregue a página se o problema persistir",
          variant: "destructive"
        });
      }
    }, 5000);
    
    const channel = supabase
      .channel(`match-${matchId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pvp_groups' }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pvp_group_members' }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pvp_matches' }, loadMatchData)
      .subscribe();

    return () => {
      clearTimeout(timeoutId);
      supabase.removeChannel(channel);
    };
  }, [matchId, groupId]);

  const loadData = async () => {
    console.log('🔍 GroupLobby: Carregando dados...', { groupId, matchId });
    
    try {
      const { data: groupData, error: groupError } = await supabase
        .from("pvp_groups")
        .select("*")
        .eq("id", groupId)
        .maybeSingle();
      
      console.log('📦 Dados do grupo:', groupData, groupError);
      
      if (groupData) {
        setGroup(groupData);
        setIsLeader(groupData.leader_user_id === userId);
      } else if (groupError) {
        console.error('❌ Erro ao carregar grupo:', groupError);
        toast({ 
          title: "Erro ao carregar grupo", 
          description: "Tente novamente em instantes",
          variant: "destructive" 
        });
      }

      const { data: membersData, error: membersError } = await supabase
        .from("pvp_group_members")
        .select("*, profiles(name, avatar_id)")
        .eq("group_id", groupId);
      
      console.log('👥 Membros do grupo:', membersData, membersError);
      
      if (membersData) setMembers(membersData);

      const { data: allGroupsData } = await supabase
        .from("pvp_groups")
        .select("*, pvp_group_members(count)")
        .eq("match_id", matchId);
      
      if (allGroupsData) {
        setAllGroups(allGroupsData);
        setReadyGroups(allGroupsData.filter(g => g.ready_to_start).length);
      }
    } catch (error) {
      console.error('❌ Erro geral ao carregar dados:', error);
    }
  };

  const loadMatchData = async () => {
    console.log('🎮 Carregando dados da partida...', matchId);
    
    const { data, error } = await supabase
      .from("pvp_matches")
      .select("*")
      .eq("id", matchId)
      .maybeSingle();
    
    console.log('🎮 Dados da partida:', data, error);
    
    if (data) {
      setMatch(data);
      // Transição para tela de ready check
      if (data.status === 'ready_check' || data.status === 'in_progress') {
        console.log('[GroupLobby] Match status changed to', data.status, '- transitioning...');
        onStartGame();
      }
    } else if (error) {
      console.error('❌ Erro ao carregar partida:', error);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Código copiado!", description: code });
  };

  const toggleReady = async () => {
    if (!isLeader) return;
    
    await supabase
      .from("pvp_groups")
      .update({ ready_to_start: !group.ready_to_start })
      .eq("id", groupId);
  };

  const startMatch = async () => {
    if (!isLeader) return;
    
    console.log('[GroupLobby] 🚀 Líder iniciando partida...', { groupId, matchId, membersCount: members.length });
    
    if (members.length < 1) {
      toast({ 
        title: "Grupo vazio", 
        description: "Aguarde membros entrarem no grupo",
        variant: "destructive" 
      });
      return;
    }

    try {
      // Check if we have at least 2 groups
      const { data: allGroupsData, error: groupsError } = await supabase
        .from("pvp_groups")
        .select("id")
        .eq("match_id", matchId);
      
      if (groupsError) {
        console.error('[GroupLobby] ❌ Erro ao verificar grupos:', groupsError);
        toast({ 
          title: "Erro ao iniciar", 
          description: groupsError.message || "Tente novamente",
          variant: "destructive" 
        });
        return;
      }
      
      if (!allGroupsData || allGroupsData.length < 2) {
        toast({ 
          title: "Aguarde mais grupos", 
          description: "É necessário pelo menos 2 grupos para iniciar",
          variant: "destructive" 
        });
        return;
      }

      // Mark this group as ready
      const { error: readyError } = await supabase
        .from("pvp_groups")
        .update({ ready_to_start: true })
        .eq("id", groupId);
      
      if (readyError) {
        console.error('[GroupLobby] ❌ Erro ao marcar grupo pronto:', readyError);
        toast({ 
          title: "Erro ao marcar grupo pronto", 
          description: readyError.message || "Tente novamente",
          variant: "destructive" 
        });
        return;
      }

      // Check if ALL groups are ready now
      const { data: updatedGroups, error: checkError } = await supabase
        .from("pvp_groups")
        .select("ready_to_start")
        .eq("match_id", matchId);
      
      if (checkError) {
        console.error('[GroupLobby] ❌ Erro ao verificar grupos prontos:', checkError);
        return;
      }
      
      const allReady = updatedGroups?.every(g => g.ready_to_start) || false;
      
      console.log('[GroupLobby] 📊 Status dos grupos:', { 
        total: updatedGroups?.length, 
        allReady,
        groups: updatedGroups 
      });
      
      if (allReady) {
        console.log('[GroupLobby] ✅ Todos prontos! Mudando para ready_check...');
        
        // Start the match
        const { data, error: startError } = await supabase
          .from("pvp_matches")
          .update({ status: 'ready_check', started_at: new Date().toISOString() })
          .eq("id", matchId)
          .select()
          .single();
        
        if (startError) {
          console.error('[GroupLobby] ❌ Erro ao iniciar partida:', startError);
          toast({
            title: "Erro ao iniciar partida",
            description: startError.message || "Tente novamente",
            variant: "destructive"
          });
          return;
        }
        
        console.log('[GroupLobby] ✅ Partida iniciada com sucesso:', data);
          
        toast({
          title: "Todos os grupos estão prontos!",
          description: "Iniciando contagem regressiva..."
        });
      } else {
        toast({
          title: "Grupo pronto!",
          description: "Aguardando outros grupos ficarem prontos..."
        });
      }
    } catch (err: any) {
      console.error('[GroupLobby] ❌ Exceção ao iniciar partida:', err);
      toast({
        title: "Erro ao iniciar partida",
        description: err.message || "Verifique sua conexão",
        variant: "destructive"
      });
    }
  };

  if (!group || !match) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-purple-400" />
        <p className="text-white text-lg">Carregando arena...</p>
        <p className="text-purple-300 text-sm">Se demorar muito, verifique sua conexão</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 h-full min-h-screen pvp-bg-group relative overflow-hidden p-3 sm:p-6">
      <PvPHeader />
      
      {/* Partículas de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: i % 3 === 0 ? '#a855f7' : i % 3 === 1 ? '#d946ef' : '#8b5cf6',
              opacity: 0.3
            }}
            animate={{
              y: [Math.random() * window.innerHeight, -100],
              x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: Math.random() * 5 + 3,
              repeat: Infinity,
              delay: Math.random() * 3
            }}
          />
        ))}
      </div>
      
      {/* LEFT SIDE - Invite Code */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col gap-4 sm:gap-6 relative z-10"
      >
        <Card className="p-4 sm:p-8 glass-card backdrop-blur-2xl bg-white/10 border-white/20 rounded-2xl sm:rounded-3xl">
          <div className="text-center space-y-4 sm:space-y-6">
            <div className="flex items-center justify-center gap-2">
              <UserPlus className="w-5 h-5 sm:w-7 sm:h-7 text-purple-400" strokeWidth={2} />
              <h2 className="text-lg sm:text-2xl font-bold text-white">Convide Amigos</h2>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <p className="text-white/80 text-sm sm:text-base font-medium">Compartilhe o código da sala</p>
              
              <motion.div 
                className="bg-white/5 rounded-xl p-4 sm:p-8 border-2 sm:border-4 border-purple-400/50 backdrop-blur-xl"
                whileHover={{ scale: 1.02 }}
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(168,85,247,0.3)',
                    '0 0 40px rgba(217,70,239,0.5)',
                    '0 0 20px rgba(168,85,247,0.3)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <code 
                  className="text-4xl sm:text-7xl font-black text-white tracking-widest"
                  style={{ textShadow: '0 0 30px rgba(217,70,239,0.8)' }}
                >
                  {match.match_code}
                </code>
              </motion.div>

              <Button
                onClick={() => copyCode(match.match_code)}
                className="w-full bg-purple-500/30 hover:bg-purple-500/50 border border-purple-400/50 text-white font-semibold text-sm sm:text-base py-4 sm:py-6 rounded-xl backdrop-blur-xl"
              >
                <Copy className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Copiar Código
              </Button>
            </div>

            <div className="bg-purple-950/30 rounded-lg p-3 sm:p-4 space-y-2 text-left border border-purple-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                  <span className="text-xs sm:text-sm text-purple-200 font-medium">Aposta</span>
                </div>
                <span className="text-xs sm:text-sm text-white font-semibold">{match.xp_bet} XP</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400" />
                  <span className="text-xs sm:text-sm text-purple-200 font-medium">Dificuldade</span>
                </div>
                <span className="text-xs sm:text-sm text-white font-semibold">{match.difficulty_level}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                  <span className="text-xs sm:text-sm text-purple-200 font-medium">Máx. Grupos</span>
                </div>
                <span className="text-xs sm:text-sm text-white font-semibold">{match.max_groups}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Start Button (only for leader) */}
        {isLeader && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              onClick={startMatch}
              disabled={members.length < 1}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold text-base sm:text-xl py-6 sm:py-10 rounded-xl shadow-xl"
            >
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
              Iniciar Jogo
            </Button>
            {members.length < 1 && (
              <p className="text-center text-yellow-300 mt-2 sm:mt-3 text-xs sm:text-sm font-medium">
                Aguarde pelo menos 1 membro entrar no grupo
              </p>
            )}
          </motion.div>
        )}

        {!isLeader && (
          <Card className="p-4 sm:p-6 bg-yellow-900/30 border-yellow-500">
            <p className="text-center text-yellow-300 font-bold text-sm sm:text-base">
              ⏳ Aguardando o líder iniciar...
            </p>
          </Card>
        )}
      </motion.div>

      {/* RIGHT SIDE - Members List */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col gap-4 sm:gap-6"
      >
        <Card className="p-4 sm:p-6 bg-gradient-to-br from-blue-900/80 to-cyan-900/80 border-blue-500 border-2">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-2xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 sm:w-7 sm:h-7 text-blue-300" />
              {group.name}
            </h3>
            <span className="bg-blue-500 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-full font-bold text-xs sm:text-base">
              {members.length} {members.length === 1 ? 'Membro' : 'Membros'}
            </span>
          </div>
          
          <div className="space-y-2 sm:space-y-3 max-h-[400px] sm:max-h-[600px] overflow-y-auto pr-2">
            {members.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <Users className="w-12 h-12 sm:w-16 sm:h-16 text-blue-400/50 mx-auto mb-3 sm:mb-4" />
                <p className="text-blue-300 text-sm sm:text-base">Aguardando membros...</p>
              </div>
            ) : (
              members.map((member, index) => {
                const avatar = avatars.find(a => a.id === (member.profiles?.avatar_id || 1)) || avatars[0];
                const isGroupLeader = member.user_id === group.leader_user_id;
                
                return (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center gap-2 sm:gap-4 p-2 sm:p-4 rounded-xl border-2 ${
                      isGroupLeader 
                        ? 'bg-gradient-to-r from-yellow-900/50 to-orange-900/50 border-yellow-500' 
                        : 'bg-blue-950/40 border-blue-600'
                    }`}
                  >
                    <div className={`w-10 h-10 sm:w-16 sm:h-16 rounded-full flex items-center justify-center border-2 sm:border-4 overflow-hidden bg-gradient-to-br from-cyan-100 to-cyan-50 ${
                      isGroupLeader ? 'border-yellow-400' : 'border-blue-400'
                    }`}>
                      <img 
                        src={avatar.img} 
                        alt={avatar.alt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-sm sm:text-lg flex items-center gap-1 sm:gap-2 truncate">
                        {member.profiles?.name || 'Jogador'}
                        {isGroupLeader && (
                          <span className="text-yellow-400 text-xs bg-yellow-500/20 px-1 sm:px-2 py-0.5 sm:py-1 rounded-full flex-shrink-0">
                            👑
                          </span>
                        )}
                      </p>
                      <p className="text-xs sm:text-sm text-blue-300">
                        {isGroupLeader ? 'Líder' : 'Membro'}
                      </p>
                    </div>

                    {member.has_played && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold flex-shrink-0">
                        ✓
                      </span>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>
        </Card>

        {/* Other Groups Status */}
        {allGroups.length > 1 && (
          <Card className="p-4 sm:p-6 bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-gray-700">
            <h4 className="text-sm sm:text-lg font-bold mb-3 sm:mb-4 flex items-center gap-2 text-white">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
              Outros Grupos ({allGroups.length} total)
            </h4>
            
            <div className="space-y-2">
              {allGroups
                .filter(g => g.id !== groupId)
                .map((g, index) => (
                  <motion.div
                    key={g.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-2 sm:p-3 bg-gray-800/50 rounded-lg border border-gray-600"
                  >
                    <span className="font-semibold text-white text-sm sm:text-base truncate">{g.name}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-gray-400">
                        <Users className="w-3 h-3 inline mr-1" />
                        {g.pvp_group_members?.[0]?.count || 0}
                      </span>
                      {g.ready_to_start && (
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                          ✓
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
            </div>
          </Card>
        )}
      </motion.div>
    </div>
  );
};
