import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Check, Clock, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReadyScreenProps {
  match: any;
  userId: string;
  onBothReady: () => void;
}

export const ReadyScreen = ({ match, userId, onBothReady }: ReadyScreenProps) => {
  const { toast } = useToast();
  const [hostReady, setHostReady] = useState(match.host_ready || false);
  const [opponentReady, setOpponentReady] = useState(match.opponent_ready || false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [myReady, setMyReady] = useState(false);

  const isHost = match.host_user_id === userId;

  useEffect(() => {
    // Listen for ready status changes
    const channel = supabase
      .channel(`ready-${match.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pvp_matches',
          filter: `id=eq.${match.id}`
        },
        (payload) => {
          const updated = payload.new;
          setHostReady(updated.host_ready);
          setOpponentReady(updated.opponent_ready);

          // When both ready, start countdown
          if (updated.host_ready && updated.opponent_ready && countdown === null) {
            startCountdown();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [match.id, countdown]);

  const startCountdown = () => {
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          setTimeout(() => {
            startGame();
          }, 500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startGame = async () => {
    // Only host starts the game
    if (isHost) {
      await supabase
        .from('pvp_matches')
        .update({ status: 'in_progress', started_at: new Date().toISOString() })
        .eq('id', match.id);
    }
    onBothReady();
  };

  const handleReady = async () => {
    setMyReady(true);
    
    const column = isHost ? 'host_ready' : 'opponent_ready';
    await supabase
      .from('pvp_matches')
      .update({ [column]: true })
      .eq('id', match.id);

    toast({
      title: "Pronto!",
      description: "Aguardando o outro jogador...",
    });
  };

  return (
    <div className="min-h-screen battle-gradient flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/50 rounded-full"
            animate={{
              y: [0, -1000],
              x: [Math.random() * 100 - 50, Math.random() * 100 - 50],
              opacity: [0, 1, 0],
              scale: [0, 2, 0]
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: '100%'
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        {/* Countdown overlay */}
        {countdown !== null && countdown > 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/80"
          >
            <motion.div
              key={countdown}
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="text-9xl font-bold neon-text"
            >
              {countdown}
            </motion.div>
          </motion.div>
        )}

        {countdown === 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/80"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 0.5 }}
              className="text-8xl font-bold neon-text"
            >
              🎮 GO! 🎮
            </motion.div>
          </motion.div>
        )}

        {/* Main content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-12"
        >
          <div>
            <motion.h1
              animate={{ 
                scale: [1, 1.05, 1],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-6xl font-bold neon-text mb-4"
            >
              ⚡ PRONTO PARA COMEÇAR? ⚡
            </motion.h1>
            <p className="text-2xl text-white/80">
              A batalha está prestes a iniciar!
            </p>
          </div>

          {/* Players status */}
          <div className="grid grid-cols-2 gap-8 max-w-2xl mx-auto">
            {/* Host */}
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`relative p-6 rounded-2xl border-4 ${
                hostReady ? 'border-green-400 bg-green-500/20' : 'border-yellow-400 bg-yellow-500/10'
              } transition-all duration-300`}
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className={`px-4 py-1 rounded-full text-sm font-bold ${
                  isHost ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                }`}>
                  {isHost ? 'VOCÊ' : 'OPONENTE'}
                </div>
              </div>

              <div className="flex flex-col items-center gap-4 mt-4">
                <motion.div
                  animate={hostReady ? { 
                    scale: [1, 1.2, 1],
                    rotate: [0, 360]
                  } : {}}
                  transition={{ duration: 0.5 }}
                  className={`w-24 h-24 rounded-full flex items-center justify-center ${
                    hostReady ? 'bg-green-500' : 'bg-gray-500'
                  }`}
                >
                  {hostReady ? (
                    <Check className="w-12 h-12 text-white" />
                  ) : (
                    <Clock className="w-12 h-12 text-white animate-pulse" />
                  )}
                </motion.div>

                <div className="text-center">
                  <p className="text-white font-bold text-xl">Jogador 1</p>
                  <p className={`text-sm font-semibold ${
                    hostReady ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {hostReady ? '✓ PRONTO!' : '⏱ Aguardando...'}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Opponent */}
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`relative p-6 rounded-2xl border-4 ${
                opponentReady ? 'border-green-400 bg-green-500/20' : 'border-yellow-400 bg-yellow-500/10'
              } transition-all duration-300`}
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className={`px-4 py-1 rounded-full text-sm font-bold ${
                  !isHost ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                }`}>
                  {!isHost ? 'VOCÊ' : 'OPONENTE'}
                </div>
              </div>

              <div className="flex flex-col items-center gap-4 mt-4">
                <motion.div
                  animate={opponentReady ? { 
                    scale: [1, 1.2, 1],
                    rotate: [0, 360]
                  } : {}}
                  transition={{ duration: 0.5 }}
                  className={`w-24 h-24 rounded-full flex items-center justify-center ${
                    opponentReady ? 'bg-green-500' : 'bg-gray-500'
                  }`}
                >
                  {opponentReady ? (
                    <Check className="w-12 h-12 text-white" />
                  ) : (
                    <Clock className="w-12 h-12 text-white animate-pulse" />
                  )}
                </motion.div>

                <div className="text-center">
                  <p className="text-white font-bold text-xl">Jogador 2</p>
                  <p className={`text-sm font-semibold ${
                    opponentReady ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {opponentReady ? '✓ PRONTO!' : '⏱ Aguardando...'}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Ready button */}
          {!myReady && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
            >
              <Button
                onClick={handleReady}
                size="lg"
                className="arcade-button text-2xl px-12 py-8 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold shadow-2xl"
              >
                <Zap className="w-8 h-8 mr-3" />
                ESTOU PRONTO!
                <Zap className="w-8 h-8 ml-3" />
              </Button>
            </motion.div>
          )}

          {myReady && !hostReady && !opponentReady && (
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-xl text-white"
            >
              Aguardando outro jogador...
            </motion.div>
          )}

          {/* Match info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="glass-card p-6 max-w-md mx-auto"
          >
            <h3 className="text-white font-bold mb-4 flex items-center justify-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Informações da Partida
            </h3>
            <div className="space-y-2 text-white/90">
              <div className="flex justify-between">
                <span>Aposta:</span>
                <span className="font-bold text-yellow-400">{match.xp_bet} XP</span>
              </div>
              <div className="flex justify-between">
                <span>Questões:</span>
                <span className="font-bold">5 perguntas</span>
              </div>
              <div className="flex justify-between">
                <span>Tempo por questão:</span>
                <span className="font-bold">90 segundos</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};