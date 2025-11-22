import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Zap, TrendingUp, Users } from "lucide-react";
import { motion } from "framer-motion";

interface MatchResultModalProps {
  match: any;
  userId: string;
  onClose: () => void;
}

export const MatchResultModal = ({ match, userId, onClose }: MatchResultModalProps) => {
  const [hostName, setHostName] = useState("Jogador 1");
  const [opponentName, setOpponentName] = useState("Jogador 2");

  useEffect(() => {
    loadPlayerNames();
  }, []);

  const loadPlayerNames = async () => {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name')
      .in('id', [match.host_user_id, match.opponent_user_id]);

    if (profiles) {
      const host = profiles.find(p => p.id === match.host_user_id);
      const opponent = profiles.find(p => p.id === match.opponent_user_id);
      if (host) setHostName(host.name);
      if (opponent) setOpponentName(opponent.name);
    }
  };

  const isUserWinner = match.winner_user_id === userId;
  const isDraw = match.winner_user_id === null;
  const userScore = match.host_user_id === userId ? match.host_score : match.opponent_score;
  const opponentScore = match.host_user_id === userId ? match.opponent_score : match.host_score;

  let title = "Empate!";
  let description = `Ambos marcaram ${userScore} pontos`;
  let xpChange = `+${match.xp_bet} XP`;
  let color = "text-yellow-500";

  if (!isDraw) {
    if (isUserWinner) {
      title = "Vitória! 🎉";
      description = "Você venceu a partida!";
      xpChange = `+${match.xp_bet * 2} XP`;
      color = "text-green-500";
    } else {
      title = "Derrota";
      description = "Melhor sorte na próxima vez!";
      xpChange = `0 XP`;
      color = "text-red-500";
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="flex justify-center"
          >
            <div className={`p-6 rounded-full bg-primary/10 ${color}`}>
              <Trophy className="h-16 w-16" />
            </div>
          </motion.div>

          <div className="text-center space-y-2">
            <p className="text-muted-foreground">{description}</p>
            <p className={`text-3xl font-bold ${color}`}>
              {xpChange}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span className={match.host_user_id === userId ? "font-bold" : ""}>
                  {hostName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span className="font-bold">{match.host_score}</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span className={match.opponent_user_id === userId ? "font-bold" : ""}>
                  {opponentName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span className="font-bold">{match.opponent_score}</span>
              </div>
            </div>
          </div>

          <Button onClick={onClose} className="w-full" size="lg">
            Continuar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
