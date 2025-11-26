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
              setCurrentMatch(newMatch);
              
              // Se oponente entrou e ainda está em waiting, transicionar para ready_check
              if (newMatch.opponent_user_id && newMatch.status === 'waiting') {
                const { data: updatedMatch } = await supabase
                  .from('pvp_matches')
                  .update({ status: 'ready_check' })
                  .eq('id', newMatch.id)
                  .select()
                  .single();
                
                // ATUALIZAR estado local COM o novo status
                if (updatedMatch) {
                  setCurrentMatch(updatedMatch as Match);
                }
                
                toast({
                  title: "Oponente encontrado!",
                  description: "Preparem-se para a batalha!",
                });
                return;
              }

              // Notificação quando jogo iniciar
              if (newMatch.status === 'in_progress' && currentMatch.status !== 'in_progress') {
                toast({
                  title: "Partida iniciada!",
                  description: "A batalha começou. Boa sorte!",
                });
              }

              // Handle match completion
              if (newMatch.status === 'completed') {
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
    // Se a partida tem host e oponente mas ainda está waiting, 
    // a transição para ready_check pode não ter acontecido ainda
    if (match.opponent_user_id && match.status === 'waiting') {
      const { data: updatedMatch } = await supabase
        .from('pvp_matches')
        .update({ status: 'ready_check' })
        .eq('id', match.id)
        .select()
        .single();
      
      if (updatedMatch) {
        setCurrentMatch(updatedMatch as Match);
      }
    } else {
      setCurrentMatch(match);
    }
    setShowJoinDialog(false);
  };

  const handleLeaveMatch = async () => {
    if (!currentMatch) return;

    try {
      if (currentMatch.status === 'waiting' && currentMatch.host_user_id === userId) {
        await supabase
          .from('pvp_matches')
          .delete()
          .eq('id', currentMatch.id);
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
        // Se a partida tem host e oponente mas ainda está waiting, transicionar
        if (match.opponent_user_id && match.status === 'waiting') {
          const { data: updatedMatch } = await supabase
            .from('pvp_matches')
            .update({ status: 'ready_check' })
            .eq('id', match.id)
            .select()
            .single();
          
          if (updatedMatch) {
            setCurrentMatch(updatedMatch as Match);
          }
        } else {
          setCurrentMatch(match);
        }
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

    // 1v1 mode lobby (waiting for opponent)
    if (currentMatch.match_mode === '1v1' && currentMatch.status === 'waiting') {
      return (
        <MatchLobby
          match={currentMatch}
          userId={userId}
          onLeave={handleLeaveMatch}
        />
      );
    }

    // Ready check screen (both players confirming)
    if (currentMatch.status === 'ready_check') {
      return (
        <ReadyScreen
          match={currentMatch}
          userId={userId}
          onBothReady={() => {}}
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

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl font-bold flex items-center gap-3 neon-text">
              <Swords className="h-10 w-10" />
              ARENA PvP
            </h1>
            <p className="text-gray-100 mt-2 text-lg">
              ⚡ Desafie jogadores e aposte XP nas batalhas épicas!
            </p>
          </motion.div>
        </div>

        {!selectedMode ? (
          <ModeSelectionScreen 
            onSelectMode={handleModeSelected}
            onQuickMatch={() => setShowQuickMatchDialog(true)}
            onJoinWithCode={() => setShowUniversalJoinDialog(true)}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <Button
              variant="ghost"
              onClick={() => setSelectedMode(null)}
              className="text-white hover:bg-white/20"
            >
              ← Voltar aos Modos
            </Button>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="arcade-button cursor-pointer bg-gradient-to-br from-primary/20 to-accent/20 hover:scale-105 transition-transform" 
                    onClick={() => selectedMode === '1v1' ? setShowCreateDialog(true) : setShowCreateGroupDialog(true)}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/30 rounded-lg">
                      <Plus className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-white">
                        {selectedMode === '1v1' ? 'Criar Partida' : 'Criar Grupo'}
                      </CardTitle>
                      <CardDescription className="text-gray-200">
                        {selectedMode === '1v1' 
                          ? 'Crie uma partida 1v1' 
                          : 'Crie um grupo e convide membros'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-200">
                    <li>• Escolha o módulo de perguntas</li>
                    <li>• Defina a aposta de XP</li>
                    <li>• Compartilhe o código</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="arcade-button cursor-pointer bg-gradient-to-br from-secondary/20 to-primary/20 hover:scale-105 transition-transform" 
                    onClick={() => selectedMode === '1v1' ? setShowJoinDialog(true) : setShowJoinGroupDialog(true)}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-secondary/30 rounded-lg">
                      <LogIn className="h-6 w-6 text-secondary-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-white">Entrar {selectedMode === '1v1' ? 'na Partida' : 'no Grupo'}</CardTitle>
                      <CardDescription className="text-gray-200">
                        Use um código para entrar
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-200">
                    <li>• Digite o código de 6 dígitos</li>
                    <li>• Verifique a aposta de XP</li>
                    <li>• Entre na batalha!</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Swords className="w-6 h-6 text-yellow-400" />
                  Como Funciona
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-100">
                <div>
                  <h4 className="font-semibold mb-2 text-yellow-400">Sistema de Pontuação</h4>
                  <p className="text-sm">
                    Cada resposta correta vale pontos baseados na velocidade:
                    <br />• Base: 100 pontos
                    <br />• Bônus de velocidade: até +100 pontos
                  </p>
                </div>
                {selectedMode === 'group' && (
                  <div>
                    <h4 className="font-semibold mb-2 text-purple-400">Modo Grupo</h4>
                    <p className="text-sm">
                      • Até 5 grupos competindo simultaneamente
                      <br />• Cada membro joga sua vez contra membros de outros grupos
                      <br />• Pontos individuais somam ao total do grupo
                      <br />• Grupo com mais pontos vence e leva o prêmio!
                    </p>
                  </div>
                )}
                <div>
                  <h4 className="font-semibold mb-2 text-green-400">Recompensas</h4>
                  <p className="text-sm">
                    {selectedMode === '1v1' ? (
                      <>• Vencedor leva o dobro do XP apostado<br />• Empate: cada um recupera sua aposta</>
                    ) : (
                      <>• 1º lugar: 60% do pote total<br />• 2º lugar: 25% do pote<br />• 3º lugar: 15% do pote</>
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Dialogs */}
      <CreateMatchDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onMatchCreated={handleMatchCreated}
        userId={userId}
      />

        <CreateGroupDialog
          open={showCreateGroupDialog}
          onOpenChange={(open) => {
            setShowCreateGroupDialog(open);
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
