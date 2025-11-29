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

  // Sincronizar transição para o jogo após countdown
  useEffect(() => {
    if (!countdownStartAt) return;

    const checkAndStart = () => {
      const elapsed = (Date.now() - countdownStartAt.getTime()) / 1000;

      // Após 3 segundos, atualizar status e ir para o jogo
      if (elapsed >= 3) {
        if (isHost) {
          supabase
            .from('pvp_matches')
            .update({ 
              status: 'in_progress',
              started_at: new Date().toISOString()
            })
            .eq('id', match.id)
            .eq('status', 'waiting');
        }
        
        onBothReady();
      }
    };

    // Verificar a cada 100ms
    const interval = setInterval(checkAndStart, 100);
    checkAndStart(); // Executar imediatamente

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

      {/* Ready Screen Content */}
      {countdownStartAt === null && (
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