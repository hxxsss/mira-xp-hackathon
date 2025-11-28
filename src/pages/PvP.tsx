import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Swords, Plus, LogIn, ArrowLeft, Users, Search } from "lucide-react";
import { CreateMatchDialog } from "@/components/pvp/CreateMatchDialog";
import { JoinMatchDialog } from "@/components/pvp/JoinMatchDialog";
import { JoinGroupDialog } from "@/components/pvp/JoinGroupDialog";
import { CreateGroupDialog } from "@/components/pvp/CreateGroupDialog";
import { QuickMatchDialog } from "@/components/pvp/QuickMatchDialog";
import { UniversalJoinDialog } from "@/components/pvp/UniversalJoinDialog";
import { GroupLobby } from "@/components/pvp/GroupLobby";
import { MatchLobby } from "@/components/pvp/MatchLobby";
import { MatchGame } from "@/components/pvp/MatchGame";
import { ReadyScreen } from "@/components/pvp/ReadyScreen";
import { MatchResultModal } from "@/components/pvp/MatchResultModal";
import { PodiumModal } from "@/components/pvp/PodiumModal";
import { ModeSelectionScreen } from "@/components/pvp/ModeSelectionScreen";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface Match {
  id: string;
  status: string;
  match_code: string;
  xp_bet: number;
  host_user_id: string;
  opponent_user_id: string | null;
  questions_data: any;
  host_score: number | null;
  opponent_score: number | null;
  winner_user_id: string | null;
  match_mode?: '1v1' | 'group';
  host_ready?: boolean;
  opponent_ready?: boolean;
}

const PvP = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string>("");
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<'1v1' | 'group' | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCreateGroupDialog, setShowCreateGroupDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [showJoinGroupDialog, setShowJoinGroupDialog] = useState(false);
  const [showQuickMatchDialog, setShowQuickMatchDialog] = useState(false);
  const [showUniversalJoinDialog, setShowUniversalJoinDialog] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showPodiumModal, setShowPodiumModal] = useState(false);
  const [groupResults, setGroupResults] = useState<any[]>([]);
  const [xpGained, setXpGained] = useState(0);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!currentMatch) return;

    const channel = supabase
      .channel(`match-${currentMatch.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pvp_matches',
          filter: `id=eq.${currentMatch.id}`
        },
        async (payload) => {
          console.log('Match update:', payload);
          const updatedMatch = payload.new as Match;

          // SEMPRE refetch dados completos quando houver mudanças importantes
          const shouldRefetch = 
            updatedMatch.status !== currentMatch.status ||
            updatedMatch.opponent_user_id !== currentMatch.opponent_user_id ||
            updatedMatch.host_ready !== currentMatch.host_ready ||
            updatedMatch.opponent_ready !== currentMatch.opponent_ready;

          if (shouldRefetch) {
            const { data: fullMatch } = await supabase
              .from('pvp_matches')
              .select('*')
              .eq('id', updatedMatch.id)
              .single();
            
            if (fullMatch) {
              const newMatch = fullMatch as Match;
              
              // APENAS observar e atualizar estado - não fazer UPDATE aqui
              setCurrentMatch(newMatch);
              
              // Notificações apropriadas
              const opponentJustJoined = !currentMatch.opponent_user_id && newMatch.opponent_user_id;
              if (opponentJustJoined && newMatch.status === 'waiting') {
                toast({
                  title: "Oponente encontrado!",
                  description: "Preparem-se para a batalha!",
                });
              }

              if (newMatch.status === 'in_progress' && currentMatch.status !== 'in_progress') {
                console.log('[PvP] Match status is now in_progress, rendering game screen');
                toast({
                  title: "Partida iniciada!",
                  description: "A batalha começou. Boa sorte!",
                });
              }

              // Handle match completion
              if (newMatch.status === 'completed') {
                handleMatchCompleted(newMatch);
              }
              
              // Handle opponent disconnect (1v1 only)
              if (newMatch.match_mode === '1v1' && newMatch.status === 'abandoned') {
                toast({
                  title: "Oponente desconectou!",
                  description: "Você venceu por W.O.",
                  variant: "default",
                });
                handleMatchCompleted(newMatch);
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentMatch?.id]);

  // Polling de segurança: garante navegação mesmo se o Realtime falhar
  useEffect(() => {
    if (!currentMatch) return;

    console.log('[PvP] Starting safety polling for match status', currentMatch.id);

    const intervalId = window.setInterval(async () => {
      try {
        const { data, error } = await supabase
          .from('pvp_matches')
          .select('status')
          .eq('id', currentMatch.id)
          .single();

        if (error) {
          console.error('[PvP] Polling error while checking match status', error);
          return;
        }

        if (data && data.status !== currentMatch.status) {
          console.log('[PvP] Polling detected status change', currentMatch.status, '->', data.status);

          const { data: fullMatch } = await supabase
            .from('pvp_matches')
            .select('*')
            .eq('id', currentMatch.id)
            .single();

          if (fullMatch) {
            setCurrentMatch(fullMatch as Match);
          }
        }
      } catch (err) {
        console.error('[PvP] Polling exception while checking match status', err);
      }
    }, 2000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [currentMatch?.id, currentMatch?.status]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
      return;
    }
    setUserId(user.id);
  };

  const handleMatchCompleted = async (match: Match) => {
    if (match.match_mode === 'group') {
      // Load group results for podium
      const { data: groups } = await supabase
        .from("pvp_groups")
        .select("*")
        .eq("match_id", match.id)
        .order("total_score", { ascending: false });

      if (groups) {
        setGroupResults(groups);
        
        // Calculate XP gained
        const userGroup = groups.find(g => g.leader_user_id === userId || 
          groups.some(g => g.id === currentGroupId));
        const position = groups.findIndex(g => g.id === userGroup?.id) + 1;
        
        const totalPot = match.xp_bet * groups.length; // Simplified
        let xp = 0;
        if (position === 1) xp = Math.floor(totalPot * 0.6);
        else if (position === 2) xp = Math.floor(totalPot * 0.25);
        else if (position === 3) xp = Math.floor(totalPot * 0.15);
        else xp = -match.xp_bet;
        
        setXpGained(xp);
        setShowPodiumModal(true);
      }
    } else {
      setShowResultModal(true);
    }
  };

  const handleModeSelected = (mode: '1v1' | 'group') => {
    setSelectedMode(mode);
    if (mode === '1v1') {
      setShowCreateDialog(true);
    } else {
      setShowCreateGroupDialog(true);
    }
  };

  const handleMatchCreated = (match: Match) => {
    setCurrentMatch(match);
    setShowCreateDialog(false);
  };

  const handleGroupCreated = (matchId: string, groupId: string) => {
    supabase
      .from("pvp_matches")
      .select("*")
      .eq("id", matchId)
      .single()
      .then(({ data }) => {
        if (data) {
          setCurrentMatch(data as Match);
          setCurrentGroupId(groupId);
        }
      });
    setShowCreateGroupDialog(false);
  };

  const handleMatchJoined = async (match: Match) => {
    setCurrentMatch(match);
    setShowJoinDialog(false);
    setShowQuickMatchDialog(false);
  };

  const handleLeaveMatch = async () => {
    if (!currentMatch) return;

    try {
      // Se está em waiting, apenas deletar/sair
      if (currentMatch.status === 'waiting' && currentMatch.host_user_id === userId) {
        await supabase
          .from('pvp_matches')
          .delete()
          .eq('id', currentMatch.id);
      } else if (currentMatch.match_mode === '1v1' && currentMatch.status === 'in_progress') {
        // 1v1: Marcar como abandonado e dar vitória ao outro
        const winnerId = currentMatch.host_user_id === userId 
          ? currentMatch.opponent_user_id 
          : currentMatch.host_user_id;
          
        await supabase
          .from('pvp_matches')
          .update({ 
            status: 'completed',
            winner_user_id: winnerId,
            completed_at: new Date().toISOString()
          })
          .eq('id', currentMatch.id);
          
        // Dar XP ao vencedor
        if (winnerId) {
          const { data: winner } = await supabase
            .from('profiles')
            .select('current_xp')
            .eq('id', winnerId)
            .single();
            
          if (winner) {
            await supabase
              .from('profiles')
              .update({ current_xp: winner.current_xp + (currentMatch.xp_bet * 2) })
              .eq('id', winnerId);
          }
        }
      }

      setCurrentMatch(null);
      setCurrentGroupId(null);
      setSelectedMode(null);
      toast({
        title: "Partida abandonada",
        description: "Você saiu da partida.",
      });
    } catch (error) {
      console.error('Error leaving match:', error);
    }
  };

  const handleUniversalJoin = async (type: '1v1' | 'group', matchId: string, groupId?: string) => {
    if (type === '1v1') {
      // Reload match data for 1v1
      const { data } = await supabase
        .from("pvp_matches")
        .select("*")
        .eq("id", matchId)
        .single();
      
      if (data) {
        const match = data as Match;
        setCurrentMatch(match);
      }
    } else if (type === 'group' && groupId) {
      // Reload match and set group for group mode
      const { data } = await supabase
        .from("pvp_matches")
        .select("*")
        .eq("id", matchId)
        .single();
      
      if (data) {
        setCurrentMatch(data as Match);
        setCurrentGroupId(groupId);
      }
    }
    setShowUniversalJoinDialog(false);
  };

  const handleGameComplete = () => {
    // Result shown via realtime
  };

  const handleCloseResult = () => {
    setShowResultModal(false);
    setShowPodiumModal(false);
    setCurrentMatch(null);
    setCurrentGroupId(null);
    setSelectedMode(null);
  };

  const handleStartGroupGame = () => {
    // Game starts automatically via realtime
  };

  // Game screens
  if (currentMatch) {
    // Group mode lobby
    if (currentMatch.match_mode === 'group' && currentMatch.status === 'waiting' && currentGroupId) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-orange-900 p-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLeaveMatch}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-4xl font-bold neon-text"
              >
                🎮 ARENA DE GRUPOS
              </motion.h1>
            </div>
            
            <GroupLobby
              matchId={currentMatch.id}
              groupId={currentGroupId}
              userId={userId}
              onStartGame={handleStartGroupGame}
            />
          </div>
        </div>
      );
    }

    // 1v1 mode lobby (waiting / starting)
    if (
      currentMatch.match_mode === '1v1' &&
      (currentMatch.status === 'waiting' || currentMatch.status === 'starting')
    ) {
      // Se já existe oponente, sempre mostrar a tela de ready check (lobby sincronizado)
      if (currentMatch.opponent_user_id) {
        return (
          <ReadyScreen
            match={currentMatch}
            userId={userId}
            onBothReady={() => {}}
          />
        );
      }
      // Senão, mostrar MatchLobby aguardando oponente
      return (
        <MatchLobby
          match={currentMatch}
          userId={userId}
          onLeave={handleLeaveMatch}
        />
      );
    }


    // In game
    if (currentMatch.status === 'in_progress') {
      return (
        <div className="min-h-screen battle-gradient p-4">
          <MatchGame
            match={currentMatch}
            userId={userId}
            onComplete={handleGameComplete}
            onLeave={handleLeaveMatch}
          />
        </div>
      );
    }
  }

  // Main menu
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-orange-900 p-4 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-purple-500/30 rounded-full"
            animate={{
              y: [0, -1000],
              x: [0, Math.random() * 100 - 50],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: '100%'
            }}
          />
        ))}
      </div>

      <div className="max-w-6xl mx-auto relative z-10 px-2 sm:px-4">
        <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="text-white hover:bg-white/20 h-8 w-8 sm:h-10 sm:w-10"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold flex items-center gap-2 sm:gap-3 neon-text">
              <Swords className="h-6 w-6 sm:h-8 sm:w-8 md:h-12 md:w-12" />
              ARENA PvP
            </h1>
            <p className="text-gray-100 mt-1 sm:mt-2 text-sm sm:text-base md:text-lg">
              ⚡ Desafie jogadores e aposte XP!
            </p>
          </motion.div>
        </div>

        <ModeSelectionScreen 
          onSelectMode={handleModeSelected}
          onQuickMatch={() => setShowQuickMatchDialog(true)}
          onJoinWithCode={async (matchId: string) => {
            const { data: match } = await supabase
              .from('pvp_matches')
              .select('*')
              .eq('id', matchId)
              .single();
            
            if (match) {
              await handleMatchJoined(match as Match);
            }
          }}
          userId={userId}
        />

      </div>

      {/* Dialogs */}
      <CreateMatchDialog
        open={showCreateDialog}
        onOpenChange={(open) => {
          setShowCreateDialog(open);
          if (!open) {
            setSelectedMode(null);
          }
        }}
        onMatchCreated={handleMatchCreated}
        userId={userId}
      />

      <CreateGroupDialog
        open={showCreateGroupDialog}
        onOpenChange={(open) => {
          setShowCreateGroupDialog(open);
          if (!open) {
            setSelectedMode(null);
          }
        }}
        onGroupCreated={handleGroupCreated}
        userId={userId}
      />

        <QuickMatchDialog
          open={showQuickMatchDialog}
          onOpenChange={setShowQuickMatchDialog}
          onMatchFound={handleMatchJoined}
          userId={userId}
        />

      <JoinMatchDialog
        open={showJoinDialog}
        onOpenChange={setShowJoinDialog}
        onMatchJoined={handleMatchJoined}
        userId={userId}
      />

      <JoinGroupDialog
        open={showJoinGroupDialog}
        onOpenChange={setShowJoinGroupDialog}
        onGroupJoined={handleGroupCreated}
        userId={userId}
      />

      <UniversalJoinDialog
        open={showUniversalJoinDialog}
        onOpenChange={setShowUniversalJoinDialog}
        onJoinSuccess={handleUniversalJoin}
        userId={userId}
      />

      {currentMatch && showResultModal && (
        <MatchResultModal
          match={currentMatch}
          userId={userId}
          onClose={handleCloseResult}
        />
      )}

      {showPodiumModal && currentGroupId && (
        <PodiumModal
          open={showPodiumModal}
          onClose={handleCloseResult}
          groups={groupResults}
          userGroupId={currentGroupId}
          xpGained={xpGained}
        />
      )}
    </div>
  );
};

export default PvP;
