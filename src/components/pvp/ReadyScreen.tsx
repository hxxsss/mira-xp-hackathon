import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Check, Loader2, Crown, User, Users as UsersIcon } from "lucide-react";
import { PvPHeader } from "./PvPHeader";

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
  const [hostName, setHostName] = useState<string>("Jogador 1");
  const [opponentName, setOpponentName] = useState<string>("Jogador 2");
  const [countdownStartAt, setCountdownStartAt] = useState<Date | null>(null);

  
  // Estado de prontidão e início do jogo agora é coordenado via banco de dados
  // O status da partida é usado como "fonte da verdade" para sincronizar o início entre os dois jogadores.

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

  // Buscar nomes reais dos jogadores
  useEffect(() => {
    const fetchPlayerNames = async () => {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', [match.host_user_id, match.opponent_user_id].filter(Boolean));
      
      if (profiles) {
        const host = profiles.find(p => p.id === match.host_user_id);
        const opponent = profiles.find(p => p.id === match.opponent_user_id);
        
        if (host) setHostName(host.name);
        if (opponent) setOpponentName(opponent.name);
      }
    };
    
    if (match.opponent_user_id) {
      fetchPlayerNames();
    }
  }, [match.host_user_id, match.opponent_user_id]);

  // Mantém myReady em sincronia com o estado vindo do backend
  useEffect(() => {
    const myReadyField = isHost ? match.host_ready : match.opponent_ready;
    setMyReady(!!myReadyField);
  }, [isHost, match.host_ready, match.opponent_ready, match.id]);

  // Coordena transição para "in_progress" via status da partida no banco
  useEffect(() => {
    setHostReady(!!match.host_ready);
    setOpponentReady(!!match.opponent_ready);

    const bothReady = !!match.host_ready && !!match.opponent_ready;

    // Apenas o host inicia o countdown sincronizado
    if (bothReady && match.status === 'waiting' && !countdownStartAt) {
      console.log('[ReadyScreen] Both players ready, starting synchronized countdown', match.id);
      
      const initCountdown = async () => {
        if (!match.countdown_start_at) {
          // Host salva timestamp do servidor
          if (isHost) {
            const { data: updated } = await supabase
              .from('pvp_matches')
              .update({ countdown_start_at: new Date().toISOString() })
              .eq('id', match.id)
              .is('countdown_start_at', null)
              .select()
              .single();

            if (updated?.countdown_start_at) {
              setCountdownStartAt(new Date(updated.countdown_start_at));
            }
          }
        } else {
          setCountdownStartAt(new Date(match.countdown_start_at));
        }
      };

      initCountdown();
    }
  }, [match.host_ready, match.opponent_ready, match.status, match.countdown_start_at, isHost, match.id, countdownStartAt]);

  // Calcular contagem baseada na timestamp sincronizada
  useEffect(() => {
    if (!countdownStartAt) return;

    const updateCountdown = () => {
      const elapsed = (Date.now() - countdownStartAt.getTime()) / 1000;
      const remaining = Math.ceil(3 - elapsed);

      if (remaining <= 0) {
        setCountdown(0);
        
        // Após 500ms do GO!, atualizar status e ir para o jogo
        if (isHost) {
          setTimeout(() => {
            supabase
              .from('pvp_matches')
              .update({ 
                status: 'in_progress',
                started_at: new Date().toISOString()
              })
              .eq('id', match.id)
              .eq('status', 'waiting');
          }, 500);
        }
        
        setTimeout(() => onBothReady(), 500);
      } else {
        setCountdown(remaining);
      }
    };

    // Atualizar a cada 100ms para animação suave
    const interval = setInterval(updateCountdown, 100);
    updateCountdown(); // Executar imediatamente

    return () => clearInterval(interval);
  }, [countdownStartAt, isHost, match.id, onBothReady]);

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
          className="relative z-10 max-w-4xl mx-auto p-4 sm:p-8 w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.h1 
            className="text-2xl sm:text-4xl md:text-5xl font-bold text-center mb-6 sm:mb-12 text-white"
            style={{ textShadow: '0 0 30px rgba(6,182,212,0.4)' }}
          >
            Preparar para Batalha
          </motion.h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-12">
            {/* Host Status */}
            <motion.div 
              className="glass-card p-4 sm:p-8"
              animate={{
                borderColor: hostReady ? '#00ff00' : '#ff8800',
                boxShadow: hostReady 
                  ? '0 0 30px rgba(0,255,0,0.5)' 
                  : '0 0 30px rgba(255,136,0,0.3)'
              }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center">
                <div className="mb-2 sm:mb-4 flex justify-center">
                  <User className="w-10 h-10 sm:w-16 sm:h-16 text-cyan-400" strokeWidth={1.5} />
                </div>
                <div className="flex items-center justify-center gap-2 mb-1 sm:mb-2">
                  {userId === match.host_user_id && (
                    <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                  )}
                  <h3 className="text-lg sm:text-2xl font-semibold text-white">{hostName}</h3>
                </div>
                {hostReady ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center justify-center gap-2 text-green-400 text-sm sm:text-lg font-semibold"
                  >
                    <Check className="w-4 h-4 sm:w-6 sm:h-6" />
                    Pronto
                  </motion.div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-orange-400 text-sm sm:text-lg font-medium">
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    Aguardando
                  </div>
                )}
              </div>
            </motion.div>

            {/* Opponent Status */}
            <motion.div 
              className="glass-card p-4 sm:p-8"
              animate={{
                borderColor: opponentReady ? '#00ff00' : '#ff8800',
                boxShadow: opponentReady 
                  ? '0 0 30px rgba(0,255,0,0.5)' 
                  : '0 0 30px rgba(255,136,0,0.3)'
              }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center">
                <div className="mb-2 sm:mb-4 flex justify-center">
                  <UsersIcon className="w-10 h-10 sm:w-16 sm:h-16 text-cyan-400" strokeWidth={1.5} />
                </div>
                <div className="flex items-center justify-center gap-2 mb-1 sm:mb-2">
                  {userId === match.opponent_user_id && match.opponent_user_id === match.host_user_id && (
                    <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                  )}
                  <h3 className="text-lg sm:text-2xl font-semibold text-white">{opponentName}</h3>
                </div>
                {opponentReady ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center justify-center gap-2 text-green-400 text-sm sm:text-lg font-semibold"
                  >
                    <Check className="w-4 h-4 sm:w-6 sm:h-6" />
                    Pronto
                  </motion.div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-orange-400 text-sm sm:text-lg font-medium">
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    Aguardando
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Match Info */}
          <motion.div 
            className="glass-card p-4 sm:p-6 mb-4 sm:mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center text-gray-800">
              <div>
                <p className="text-gray-600 text-xs sm:text-sm mb-1">APOSTA</p>
                <p className="text-lg sm:text-2xl font-bold text-yellow-600">{match.xp_bet} XP</p>
              </div>
              <div>
                <p className="text-gray-600 text-xs sm:text-sm mb-1">PERGUNTAS</p>
                <p className="text-lg sm:text-2xl font-bold text-purple-600">5</p>
              </div>
              <div>
                <p className="text-gray-600 text-xs sm:text-sm mb-1">TEMPO</p>
                <p className="text-lg sm:text-2xl font-bold text-blue-600">60s</p>
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
                className="w-full h-14 sm:h-20 text-xl sm:text-3xl font-black arcade-button"
                style={{
                  background: 'linear-gradient(135deg, #ff00ff, #00ffff)',
                  boxShadow: '0 0 40px rgba(255,0,255,0.6)'
                }}
              >
                🎮 PRONTO! 🎮
              </Button>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
};