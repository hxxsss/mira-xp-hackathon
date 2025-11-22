import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Swords, Plus, LogIn, ArrowLeft } from "lucide-react";
import { CreateMatchDialog } from "@/components/pvp/CreateMatchDialog";
import { JoinMatchDialog } from "@/components/pvp/JoinMatchDialog";
import { MatchLobby } from "@/components/pvp/MatchLobby";
import { MatchGame } from "@/components/pvp/MatchGame";
import { MatchResultModal } from "@/components/pvp/MatchResultModal";
import { useToast } from "@/hooks/use-toast";

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
}

const PvP = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string>("");
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);

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
          event: '*',
          schema: 'public',
          table: 'pvp_matches',
          filter: `id=eq.${currentMatch.id}`
        },
        (payload) => {
          console.log('Match update:', payload);
          const updatedMatch = payload.new as Match;
          setCurrentMatch(updatedMatch);

          if (updatedMatch.status === 'completed') {
            setShowResultModal(true);
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

  const handleMatchCreated = (match: Match) => {
    setCurrentMatch(match);
    setShowCreateDialog(false);
  };

  const handleMatchJoined = (match: Match) => {
    setCurrentMatch(match);
    setShowJoinDialog(false);
  };

  const handleLeaveMatch = async () => {
    if (!currentMatch) return;

    try {
      if (currentMatch.status === 'waiting' && currentMatch.host_user_id === userId) {
        // Host cancela a partida
        await supabase
          .from('pvp_matches')
          .delete()
          .eq('id', currentMatch.id);
      }

      setCurrentMatch(null);
      toast({
        title: "Partida abandonada",
        description: "Você saiu da partida.",
      });
    } catch (error) {
      console.error('Error leaving match:', error);
    }
  };

  const handleGameComplete = () => {
    // O resultado será mostrado automaticamente via realtime
  };

  const handleCloseResult = () => {
    setShowResultModal(false);
    setCurrentMatch(null);
  };

  if (currentMatch) {
    if (currentMatch.status === 'waiting') {
      return (
        <MatchLobby
          match={currentMatch}
          userId={userId}
          onLeave={handleLeaveMatch}
        />
      );
    }

    if (currentMatch.status === 'in_progress') {
      return (
        <MatchGame
          match={currentMatch}
          userId={userId}
          onComplete={handleGameComplete}
        />
      );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <Swords className="h-8 w-8 text-primary" />
              Modo PvP
            </h1>
            <p className="text-muted-foreground mt-1">
              Desafie outros jogadores e aposte XP!
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setShowCreateDialog(true)}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Criar Partida</CardTitle>
                  <CardDescription>
                    Crie uma nova partida e convide um amigo
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Escolha o módulo de perguntas</li>
                <li>• Defina a aposta de XP</li>
                <li>• Compartilhe o código da sala</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setShowJoinDialog(true)}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-secondary/10 rounded-lg">
                  <LogIn className="h-6 w-6 text-secondary-foreground" />
                </div>
                <div>
                  <CardTitle>Entrar em Partida</CardTitle>
                  <CardDescription>
                    Use um código para entrar em uma partida
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Digite o código de 6 dígitos</li>
                <li>• Verifique a aposta de XP</li>
                <li>• Aceite o desafio!</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Como Funciona</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Sistema de Pontuação</h4>
              <p className="text-sm text-muted-foreground">
                Cada resposta correta vale pontos baseados na velocidade:
                <br />• Base: 100 pontos
                <br />• Bônus de velocidade: até +100 pontos (quanto mais rápido, mais pontos)
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Aposta e Recompensa</h4>
              <p className="text-sm text-muted-foreground">
                • O vencedor leva o dobro do XP apostado (sua aposta + aposta do oponente)
                <br />• Em caso de empate, cada jogador recupera sua aposta
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <CreateMatchDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onMatchCreated={handleMatchCreated}
        userId={userId}
      />

      <JoinMatchDialog
        open={showJoinDialog}
        onOpenChange={setShowJoinDialog}
        onMatchJoined={handleMatchJoined}
        userId={userId}
      />

      {currentMatch && showResultModal && (
        <MatchResultModal
          match={currentMatch}
          userId={userId}
          onClose={handleCloseResult}
        />
      )}
    </div>
  );
};

export default PvP;
