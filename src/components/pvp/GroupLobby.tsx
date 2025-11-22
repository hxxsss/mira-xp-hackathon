import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Copy, Users, Trophy, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

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
    const { data: groupData } = await supabase
      .from("pvp_groups")
      .select("*")
      .eq("id", groupId)
      .single();
    
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
      .single();
    
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
    if (readyGroups < 2) {
      toast({ title: "Aguarde", description: "É necessário pelo menos 2 grupos prontos" });
      return;
    }

    await supabase
      .from("pvp_matches")
      .update({ status: 'in_progress', started_at: new Date().toISOString() })
      .eq("id", matchId);
  };

  if (!group || !match) {
    return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  const canStart = isLeader && readyGroups >= 2 && readyGroups === allGroups.length;

  return (
    <div className="space-y-6">
      {/* Header with Codes */}
      <Card className="p-6 bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-500">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-sm text-purple-300 mb-2">Código da Partida</p>
            <div className="flex items-center justify-center gap-2">
              <code className="text-3xl font-bold text-white">{match.match_code}</code>
              <Button size="sm" variant="ghost" onClick={() => copyCode(match.match_code)}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm text-pink-300 mb-2">Código do Grupo</p>
            <div className="flex items-center justify-center gap-2">
              <code className="text-3xl font-bold text-white">{group.invite_code}</code>
              <Button size="sm" variant="ghost" onClick={() => copyCode(group.invite_code)}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Groups Status */}
      <Card className="p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-400" />
          Status dos Grupos ({readyGroups}/{match.max_groups} prontos)
        </h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allGroups.map((g) => (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-4 rounded-lg border-2 ${
                g.ready_to_start 
                  ? 'bg-green-500/20 border-green-400' 
                  : 'bg-gray-700/20 border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold">{g.name}</span>
                <span className={`text-sm px-2 py-1 rounded ${
                  g.ready_to_start ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300'
                }`}>
                  {g.ready_to_start ? '✓ PRONTO' : 'Aguardando...'}
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-2">
                <Users className="w-4 h-4 inline mr-1" />
                {g.pvp_group_members?.[0]?.count || 0} membros
              </p>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Your Group */}
      <Card className="p-6 bg-gradient-to-br from-blue-900/50 to-cyan-900/50 border-blue-500">
        <h3 className="text-2xl font-bold mb-4 text-center text-blue-300">
          {group.name}
        </h3>
        
        <div className="space-y-3 mb-6">
          {members.map((member) => (
            <div key={member.id} className="flex items-center gap-3 p-3 bg-blue-950/30 rounded-lg">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-xl">
                {member.profiles?.avatar_id || '👤'}
              </div>
              <div>
                <p className="font-bold">{member.profiles?.name || 'Jogador'}</p>
                {member.user_id === group.leader_user_id && (
                  <span className="text-xs text-yellow-400">👑 Líder</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {isLeader && (
          <div className="space-y-3">
            <Button
              onClick={toggleReady}
              className={`w-full text-lg font-bold py-6 ${
                group.ready_to_start
                  ? 'bg-yellow-500 hover:bg-yellow-600'
                  : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {group.ready_to_start ? '⏸️ Cancelar Pronto' : '✓ ESTOU PRONTO!'}
            </Button>

            {canStart && (
              <Button
                onClick={startMatch}
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold text-xl py-8 animate-pulse"
              >
                🎮 INICIAR BATALHA!
              </Button>
            )}
          </div>
        )}

        {!isLeader && (
          <p className="text-center text-gray-400">
            Aguardando o líder dar o sinal de pronto...
          </p>
        )}
      </Card>
    </div>
  );
};
