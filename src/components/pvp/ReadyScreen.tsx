import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Check, Loader2 } from "lucide-react";

interface ReadyScreenProps {
  match: any;
  userId: string;
  onBothReady: () => void;
}

export const ReadyScreen = ({ match, userId, onBothReady }: ReadyScreenProps) => {
  const { toast } = useToast();
  const isHost = match.host_user_id === userId;
  const [hostReady, setHostReady] = useState(match.host_ready || false);
  const [opponentReady, setOpponentReady] = useState(match.opponent_ready || false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [myReady, setMyReady] = useState(isHost ? match.host_ready : match.opponent_ready);

  
  // Estado de prontidão e início do jogo agora é coordenado via banco de dados
  // O status da partida é usado como "fonte da verdade" para sincronizar o início entre os dois jogadores.

  const startCountdown = () => {
    let count = 3;
    setCountdown(count);

    const interval = setInterval(() => {
      count--;
      if (count === 0) {
        setCountdown(0);
        clearInterval(interval);
        setTimeout(() => {
          startGame();
        }, 1000);
      } else {
        setCountdown(count);
      }
    }, 1000);
  };

  const startGame = async () => {
    if (isHost) {
      await supabase
        .from('pvp_matches')
        .update({ 
          status: 'in_progress',
          started_at: new Date().toISOString()
        })
        .eq('id', match.id)
        .eq('status', 'starting');
    }
    onBothReady();
  };

  const handleReady = async () => {
    setMyReady(true);
    
    const field = isHost ? 'host_ready' : 'opponent_ready';
    await supabase
      .from('pvp_matches')
      .update({ [field]: true })
      .eq('id', match.id);

    toast({
      title: "Pronto!",
      description: "Aguardando oponente...",
    });
  };

  // Mantém myReady em sincronia com o estado vindo do backend
  useEffect(() => {
    const myReadyField = isHost ? match.host_ready : match.opponent_ready;
    setMyReady(!!myReadyField);
  }, [isHost, match.host_ready, match.opponent_ready, match.id]);

  // Coordena transição para "starting" e início da contagem via status da partida
  useEffect(() => {
    setHostReady(!!match.host_ready);
    setOpponentReady(!!match.opponent_ready);

    const bothReady = !!match.host_ready && !!match.opponent_ready;

    // Apenas o host promove o estado para "starting" no banco
    if (bothReady && match.status === 'waiting' && isHost) {
      console.log('[ReadyScreen] Both players ready, host setting status=starting', match.id);
      supabase
        .from('pvp_matches')
        .update({ status: 'starting' })
        .eq('id', match.id)
        .eq('status', 'waiting')
        .then(({ error }) => {
          if (error) {
            console.error('[ReadyScreen] Error updating match to starting', error);
          }
        });
    }

    // Quando o status muda para "starting", ambos os clientes iniciam a contagem localmente
    if (match.status === 'starting' && countdown === null) {
      console.log('[ReadyScreen] Match status is starting, triggering countdown', match.id);
      startCountdown();
    }
  }, [match.host_ready, match.opponent_ready, match.status, isHost, match.id, countdown]);

  return (
    <div className="min-h-screen battle-gradient relative overflow-hidden flex items-center justify-center">
      {/* Partículas de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-purple-500/30 rounded-full"
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
              {/* Glow effect */}
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
              {/* Explosion effect */}
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
          className="relative z-10 max-w-4xl mx-auto p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.h1 
            className="text-6xl font-black text-center mb-12 neon-text"
            animate={{
              textShadow: [
                '0 0 20px #ff00ff, 0 0 40px #ff00ff',
                '0 0 40px #00ffff, 0 0 80px #00ffff',
                '0 0 20px #ff00ff, 0 0 40px #ff00ff'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ⚔️ PREPARAR PARA BATALHA! ⚔️
          </motion.h1>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Host Status */}
            <motion.div 
              className="glass-card p-8"
              animate={{
                borderColor: hostReady ? '#00ff00' : '#ff8800',
                boxShadow: hostReady 
                  ? '0 0 30px rgba(0,255,0,0.5)' 
                  : '0 0 30px rgba(255,136,0,0.3)'
              }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center">
                <div className="text-4xl mb-4">👑</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">HOST</h3>
                {hostReady ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center justify-center gap-2 text-green-600 text-xl font-bold"
                  >
                    <Check className="w-8 h-8" />
                    PRONTO!
                  </motion.div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-orange-600 text-xl">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Aguardando...
                  </div>
                )}
              </div>
            </motion.div>

            {/* Opponent Status */}
            <motion.div 
              className="glass-card p-8"
              animate={{
                borderColor: opponentReady ? '#00ff00' : '#ff8800',
                boxShadow: opponentReady 
                  ? '0 0 30px rgba(0,255,0,0.5)' 
                  : '0 0 30px rgba(255,136,0,0.3)'
              }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center">
                <div className="text-4xl mb-4">⚔️</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">OPONENTE</h3>
                {opponentReady ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center justify-center gap-2 text-green-600 text-xl font-bold"
                  >
                    <Check className="w-8 h-8" />
                    PRONTO!
                  </motion.div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-orange-600 text-xl">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Aguardando...
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Match Info */}
          <motion.div 
            className="glass-card p-6 mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="grid grid-cols-3 gap-4 text-center text-gray-800">
              <div>
                <p className="text-gray-600 text-sm mb-1">APOSTA</p>
                <p className="text-2xl font-bold text-yellow-600">{match.xp_bet} XP</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">PERGUNTAS</p>
                <p className="text-2xl font-bold text-purple-600">5</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">TEMPO/QUESTÃO</p>
                <p className="text-2xl font-bold text-blue-600">60s</p>
              </div>
            </div>
          </motion.div>

          {/* Ready Button */}
          {!myReady && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                onClick={handleReady}
                className="w-full h-20 text-3xl font-black arcade-button"
                style={{
                  background: 'linear-gradient(135deg, #ff00ff, #00ffff)',
                  boxShadow: '0 0 40px rgba(255,0,255,0.6)'
                }}
              >
                🎮 ESTOU PRONTO! 🎮
              </Button>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
};