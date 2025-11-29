import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Check, Loader2, Crown } from "lucide-react";
import { PvPHeader } from "./PvPHeader";

interface GroupMember {
  id: string;
  user_id: string;
  group_id: string;
  is_ready: boolean;
  name?: string;
  group_name?: string;
}

interface GroupReadyScreenProps {
  matchId: string;
  userId: string;
  onAllReady: () => void;
}

export const GroupReadyScreen = ({ matchId, userId, onAllReady }: GroupReadyScreenProps) => {
  const { toast } = useToast();
  const [allMembers, setAllMembers] = useState<GroupMember[]>([]);
  const [myMember, setMyMember] = useState<GroupMember | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Buscar todos os membros de todos os grupos desta partida
  const loadAllMembers = async () => {
    setLoading(true);
    
    // Buscar todos os grupos da partida
    const { data: groups } = await supabase
      .from('pvp_groups')
      .select('id, name, leader_user_id')
      .eq('match_id', matchId);

    if (!groups) {
      setLoading(false);
      return;
    }

    const groupIds = groups.map(g => g.id);

    // Buscar todos os membros desses grupos com nome do perfil
    const { data: members } = await supabase
      .from('pvp_group_members')
      .select('*, profiles!inner(name)')
      .in('group_id', groupIds);

    if (members) {
      const membersWithDetails = members.map(m => {
        const group = groups.find(g => g.id === m.group_id);
        return {
          ...m,
          name: (m.profiles as any)?.name || 'Jogador',
          group_name: group?.name || 'Grupo',
          is_leader: group?.leader_user_id === m.user_id
        };
      });

      setAllMembers(membersWithDetails);
      const currentMember = membersWithDetails.find(m => m.user_id === userId);
      setMyMember(currentMember || null);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadAllMembers();

    // Listener para atualizações de prontidão
    const channel = supabase
      .channel('group-ready-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pvp_group_members',
        },
        () => {
          loadAllMembers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, userId]);

  // Verificar se todos estão prontos
  useEffect(() => {
    if (allMembers.length === 0) return;

    const allReady = allMembers.every(m => m.is_ready);

    if (allReady && countdown === null) {
      console.log('[GroupReadyScreen] All members are ready! Starting countdown...');
      startCountdown();
    }
  }, [allMembers]);

  const startCountdown = () => {
    let count = 3;
    setCountdown(count);

    const interval = setInterval(() => {
      count--;
      if (count === 0) {
        setCountdown(0);
        clearInterval(interval);
        setTimeout(() => {
          onAllReady();
        }, 1000);
      } else {
        setCountdown(count);
      }
    }, 1000);
  };

  const handleReady = async () => {
    if (!myMember) return;

    await supabase
      .from('pvp_group_members')
      .update({ is_ready: true })
      .eq('id', myMember.id);

    toast({
      title: "Pronto!",
      description: "Aguardando outros jogadores...",
    });
  };

  // Agrupar membros por grupo
  const membersByGroup = allMembers.reduce((acc, member) => {
    const groupName = member.group_name || 'Grupo';
    if (!acc[groupName]) {
      acc[groupName] = [];
    }
    acc[groupName].push(member);
    return acc;
  }, {} as Record<string, GroupMember[]>);

  if (loading) {
    return (
      <div className="min-h-screen pvp-bg-classic flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pvp-bg-classic relative overflow-hidden flex items-center justify-center">
      <PvPHeader />
      
      {/* Partículas de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: i % 3 === 0 ? '#0ea5e9' : i % 3 === 1 ? '#06b6d4' : '#3b82f6',
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

      {/* Countdown Épico */}
      <AnimatePresence>
        {countdown !== null && countdown > 0 && (
          <motion.div 
            key={countdown}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/95"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 3, opacity: 0, rotate: -15 }}
              animate={{ 
                scale: [3, 1.2, 1],
                opacity: [0, 1, 1],
                rotate: [15, -5, 0]
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ 
                duration: 0.8,
                type: "spring",
                stiffness: 200
              }}
              className="relative"
            >
              <motion.div
                className="absolute inset-0 blur-3xl"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity
                }}
                style={{
                  background: `radial-gradient(circle, ${
                    countdown === 3 ? '#ff0000' : 
                    countdown === 2 ? '#ff8800' : 
                    '#00ff00'
                  }, transparent)`
                }}
              />
              
              <motion.div
                className="text-[40vh] font-black relative z-10"
                animate={{
                  textShadow: [
                    `0 0 50px ${countdown === 3 ? '#ff0000' : countdown === 2 ? '#ff8800' : '#00ff00'},
                     0 0 100px ${countdown === 3 ? '#ff0000' : countdown === 2 ? '#ff8800' : '#00ff00'},
                     0 0 150px ${countdown === 3 ? '#ff0000' : countdown === 2 ? '#ff8800' : '#00ff00'}`,
                  ]
                }}
                style={{
                  color: '#ffffff',
                  WebkitTextStroke: '4px rgba(0,0,0,0.8)',
                }}
              >
                {countdown}
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {/* GO! */}
        {countdown === 0 && (
          <motion.div 
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/95"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 5, opacity: 0 }}
              animate={{ 
                scale: [5, 0.8, 1],
                opacity: [0, 1, 1]
              }}
              transition={{ 
                duration: 0.6,
                type: "spring",
                stiffness: 300,
                damping: 20
              }}
              className="relative"
            >
              <motion.div
                className="absolute inset-0"
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 3, opacity: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="w-full h-full rounded-full bg-gradient-to-r from-green-400 via-yellow-400 to-green-400 blur-3xl" />
              </motion.div>

              <motion.div
                className="text-[25vh] font-black relative z-10"
                animate={{
                  textShadow: [
                    '0 0 30px #00ff00, 0 0 60px #00ff00, 0 0 90px #00ff00',
                    '0 0 60px #00ff00, 0 0 120px #00ff00, 0 0 180px #00ff00',
                    '0 0 30px #00ff00, 0 0 60px #00ff00, 0 0 90px #00ff00'
                  ]
                }}
                transition={{ duration: 0.5, repeat: Infinity }}
                style={{
                  color: '#ffffff',
                  WebkitTextStroke: '6px rgba(0,0,0,0.9)',
                }}
              >
                GO!
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ready Screen Content */}
      {countdown === null && (
        <motion.div 
          className="relative z-10 max-w-6xl mx-auto p-4 sm:p-8 w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.h1 
            className="text-2xl sm:text-4xl md:text-5xl font-bold text-center mb-6 sm:mb-12 text-white"
            style={{ textShadow: '0 0 30px rgba(6,182,212,0.4)' }}
          >
            Preparar para Batalha em Grupo
          </motion.h1>

          {/* Lista de Grupos e Membros */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {Object.entries(membersByGroup).map(([groupName, members]) => (
              <motion.div
                key={groupName}
                className="glass-card p-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <h3 className="text-xl font-bold text-center mb-4 text-cyan-400">
                  {groupName}
                </h3>
                <div className="space-y-2">
                  {members.map((member: any) => (
                    <motion.div
                      key={member.id}
                      className="flex items-center justify-between p-2 rounded bg-white/10"
                      animate={{
                        borderColor: member.is_ready ? '#00ff00' : '#ff8800',
                        boxShadow: member.is_ready 
                          ? '0 0 10px rgba(0,255,0,0.3)' 
                          : '0 0 10px rgba(255,136,0,0.2)'
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {member.is_leader && <Crown className="w-4 h-4 text-yellow-400" />}
                        <span className="text-white font-medium">{member.name}</span>
                      </div>
                      {member.is_ready ? (
                        <Check className="w-5 h-5 text-green-400" />
                      ) : (
                        <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Ready Button */}
          {myMember && !myMember.is_ready && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                onClick={handleReady}
                className="w-full h-14 sm:h-20 text-xl sm:text-3xl font-black arcade-button"
                style={{
                  background: 'linear-gradient(135deg, #ff00ff, #00ffff)',
                  boxShadow: '0 0 40px rgba(255,0,255,0.6)'
                }}
              >
                🎮 ESTOU PRONTO! 🎮
              </Button>
            </motion.div>
          )}

          {/* Waiting Message */}
          {myMember && myMember.is_ready && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <p className="text-2xl font-bold text-green-400">
                ✅ Você está pronto!
              </p>
              <p className="text-lg text-gray-300 mt-2">
                Aguardando outros jogadores...
              </p>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
};