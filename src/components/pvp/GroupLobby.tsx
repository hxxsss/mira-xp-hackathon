import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Copy, Users, Trophy, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { avatars } from "@/components/ui/avatar-picker";

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
    
    const channel = supabase
      .channel(`match-${matchId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pvp_groups' }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pvp_group_members' }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pvp_matches' }, loadMatchData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, groupId]);

  const loadData = async () => {
    const { data: groupData, error: groupError } = await supabase
      .from("pvp_groups")
      .select("*")
      .eq("id", groupId)
      .maybeSingle();
    
    if (groupData) {
      setGroup(groupData);
      setIsLeader(groupData.leader_user_id === userId);
    }

    const { data: membersData } = await supabase
      .from("pvp_group_members")
      .select("*, profiles(name, avatar_id)")
      .eq("group_id", groupId);
    
    if (membersData) setMembers(membersData);

    const { data: allGroupsData } = await supabase
      .from("pvp_groups")
      .select("*, pvp_group_members(count)")
      .eq("match_id", matchId);
    
    if (allGroupsData) {
      setAllGroups(allGroupsData);
      setReadyGroups(allGroupsData.filter(g => g.ready_to_start).length);
    }
  };

  const loadMatchData = async () => {
    const { data } = await supabase
      .from("pvp_matches")
      .select("*")
      .eq("id", matchId)
      .maybeSingle();
    
    if (data) {
      setMatch(data);
      if (data.status === 'in_progress') {
        onStartGame();
      }
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
    
    if (members.length < 1) {
      toast({ 
        title: "Grupo vazio", 
        description: "Aguarde membros entrarem no grupo",
        variant: "destructive" 
      });
      return;
    }

    await supabase
      .from("pvp_matches")
      .update({ status: 'in_progress', started_at: new Date().toISOString() })
      .eq("id", matchId);
  };

  if (!group || !match) {
    return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-purple-400" /></div>;
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6 h-full">
      {/* LEFT SIDE - Invite Code */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col gap-6"
      >
        <Card className="p-8 bg-gradient-to-br from-purple-900/80 to-pink-900/80 border-purple-500 border-2">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
              <h2 className="text-3xl font-bold text-white">Convide Amigos!</h2>
              <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
            </div>
            
            <div className="space-y-4">
              <p className="text-purple-200 text-lg">Compartilhe o código do grupo:</p>
              
              <motion.div 
                className="bg-black/40 rounded-xl p-8 border-4 border-purple-400"
                whileHover={{ scale: 1.02 }}
              >
                <code className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 tracking-widest">
                  {group.invite_code}
                </code>
              </motion.div>

              <Button
                onClick={() => copyCode(group.invite_code)}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg py-6"
              >
                <Copy className="w-5 h-5 mr-2" />
                Copiar Código
              </Button>
            </div>

            <div className="pt-4 border-t border-purple-500/50">
              <p className="text-sm text-purple-300 mb-2">Código da Partida:</p>
              <div className="flex items-center justify-center gap-2">
                <code className="text-2xl font-bold text-white">{match.match_code}</code>
                <Button size="sm" variant="ghost" onClick={() => copyCode(match.match_code)} className="text-purple-300">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="bg-purple-950/50 rounded-lg p-4 space-y-2 text-left">
              <p className="text-sm text-purple-200"><strong>📊 Aposta:</strong> {match.xp_bet} XP</p>
              <p className="text-sm text-purple-200"><strong>🎯 Dificuldade:</strong> {match.difficulty_level}</p>
              <p className="text-sm text-purple-200"><strong>🏆 Máx. Grupos:</strong> {match.max_groups}</p>
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
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-black text-2xl py-12 rounded-xl shadow-2xl"
            >
              <Trophy className="w-8 h-8 mr-3" />
              INICIAR JOGO
              <Trophy className="w-8 h-8 ml-3" />
            </Button>
            {members.length < 1 && (
              <p className="text-center text-yellow-300 mt-3 text-sm">
                ⚠️ Aguarde pelo menos 1 membro entrar no grupo
              </p>
            )}
          </motion.div>
        )}

        {!isLeader && (
          <Card className="p-6 bg-yellow-900/30 border-yellow-500">
            <p className="text-center text-yellow-300 font-bold">
              ⏳ Aguardando o líder iniciar a partida...
            </p>
          </Card>
        )}
      </motion.div>

      {/* RIGHT SIDE - Members List */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col gap-6"
      >
        <Card className="p-6 bg-gradient-to-br from-blue-900/80 to-cyan-900/80 border-blue-500 border-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="w-7 h-7 text-blue-300" />
              {group.name}
            </h3>
            <span className="bg-blue-500 text-white px-4 py-2 rounded-full font-bold">
              {members.length} {members.length === 1 ? 'Membro' : 'Membros'}
            </span>
          </div>
          
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {members.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-blue-400/50 mx-auto mb-4" />
                <p className="text-blue-300">Aguardando membros...</p>
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
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 ${
                      isGroupLeader 
                        ? 'bg-gradient-to-r from-yellow-900/50 to-orange-900/50 border-yellow-500' 
                        : 'bg-blue-950/40 border-blue-600'
                    }`}
                  >
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 ${
                      isGroupLeader ? 'border-yellow-400' : 'border-blue-400'
                    }`}>
                      <div className="w-14 h-14 flex items-center justify-center">
                        {avatar.svg}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <p className="font-bold text-white text-lg flex items-center gap-2">
                        {member.profiles?.name || 'Jogador'}
                        {isGroupLeader && (
                          <span className="text-yellow-400 text-sm bg-yellow-500/20 px-2 py-1 rounded-full">
                            👑 Líder
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-blue-300">
                        {isGroupLeader ? 'Criador do grupo' : 'Membro'}
                      </p>
                    </div>

                    {member.has_played && (
                      <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-bold">
                        ✓ JOGOU
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
          <Card className="p-6 bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-gray-700">
            <h4 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Outros Grupos na Arena ({allGroups.length} total)
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
                    className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-600"
                  >
                    <span className="font-semibold text-white">{g.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        <Users className="w-3 h-3 inline mr-1" />
                        {g.pvp_group_members?.[0]?.count || 0}
                      </span>
                      {g.ready_to_start && (
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                          ✓ Pronto
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
