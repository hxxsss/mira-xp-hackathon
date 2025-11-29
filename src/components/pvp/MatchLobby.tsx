import { Button } from "@/components/ui/button";
import { Copy, Users, Loader2, Trophy, Coins } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { PvPHeader } from "./PvPHeader";
interface MatchLobbyProps {
  match: any;
  userId: string;
  onLeave: () => void;
}
export const MatchLobby = ({
  match,
  userId,
  onLeave
}: MatchLobbyProps) => {
  const {
    toast
  } = useToast();
  const isHost = match.host_user_id === userId;
  const copyMatchCode = () => {
    navigator.clipboard.writeText(match.match_code);
    toast({
      title: "Código copiado!",
      description: "Compartilhe com seu oponente."
    });
  };
  return <div className="min-h-screen pvp-bg-classic flex items-center justify-center p-3 sm:p-4 relative overflow-hidden">
      <PvPHeader />
      
      {/* Partículas animadas de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => <motion.div key={i} className="absolute rounded-full" style={{
        width: Math.random() * 4 + 2,
        height: Math.random() * 4 + 2,
        background: `radial-gradient(circle, ${i % 3 === 0 ? '#0ea5e9' : i % 3 === 1 ? '#06b6d4' : '#3b82f6'}, transparent)`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`
      }} animate={{
        y: [0, -20, 0],
        x: [0, Math.random() * 20 - 10, 0],
        opacity: [0.2, 0.8, 0.2],
        scale: [1, 1.5, 1]
      }} transition={{
        duration: Math.random() * 3 + 2,
        repeat: Infinity,
        delay: Math.random() * 2
      }} />)}
      </div>

      <motion.div initial={{
      opacity: 0,
      scale: 0.9
    }} animate={{
      opacity: 1,
      scale: 1
    }} transition={{
      duration: 0.3
    }} className="glass-card p-4 sm:p-8 max-w-lg w-full relative z-10 rounded-2xl sm:rounded-3xl backdrop-blur-2xl border border-white/20 bg-[#318beb]">
        {/* Título Neon */}
        <motion.div className="text-center mb-4 sm:mb-8" initial={{
        y: -20,
        opacity: 0
      }} animate={{
        y: 0,
        opacity: 1
      }} transition={{
        delay: 0.1
      }}>
          <motion.div animate={{
          scale: [1, 1.1, 1]
        }} transition={{
          duration: 2,
          repeat: Infinity
        }}>
            <Users className="h-12 w-12 sm:h-20 sm:w-20 text-white mx-auto mb-2 sm:mb-4" style={{
            filter: 'drop-shadow(0 0 20px currentColor)'
          }} />
          </motion.div>
          <h1 className="text-2xl sm:text-4xl font-bold text-white mb-1 sm:mb-2" style={{
          textShadow: '0 0 20px rgba(255,255,255,0.3)'
        }}>
            Aguardando Oponente
          </h1>
          <p className="text-white/80 text-sm sm:text-base font-medium">
            {isHost ? "Compartilhe o código com seu amigo" : "O jogo iniciará em breve"}
          </p>
        </motion.div>

        {/* Código da Sala - Estilo Arcade */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.2
      }} className="glass-card p-4 sm:p-6 mb-4 sm:mb-6 relative overflow-hidden rounded-xl sm:rounded-2xl backdrop-blur-xl border border-white/30 bg-blue-700">
          {/* Animated border */}
          <motion.div className="absolute inset-0 border-2 border-cyan-400/50 rounded-xl sm:rounded-2xl" animate={{
          boxShadow: ['0 0 20px rgba(6,182,212,0.3)', '0 0 40px rgba(59,130,246,0.5)', '0 0 20px rgba(6,182,212,0.3)']
        }} transition={{
          duration: 2,
          repeat: Infinity
        }} />
          
          <div className="flex items-center justify-center gap-2 mb-2 sm:mb-3">
            <Copy className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400" />
            <p className="text-white/80 text-center text-xs sm:text-sm font-semibold tracking-wide">
              CÓDIGO DA SALA
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            <motion.span className="text-3xl sm:text-5xl font-bold font-mono tracking-[0.2em] sm:tracking-[0.3em] text-white relative" style={{
            textShadow: '0 0 20px #06b6d4, 0 0 40px #06b6d4, 0 0 60px #06b6d4'
          }} animate={{
            textShadow: ['0 0 20px #06b6d4, 0 0 40px #06b6d4', '0 0 30px #3b82f6, 0 0 60px #3b82f6', '0 0 20px #06b6d4, 0 0 40px #06b6d4']
          }} transition={{
            duration: 2,
            repeat: Infinity
          }}>
              {match.match_code}
            </motion.span>
            <motion.div whileHover={{
            scale: 1.1
          }} whileTap={{
            scale: 0.95
          }}>
              <Button variant="outline" size="icon" onClick={copyMatchCode} className="h-10 w-10 sm:h-12 sm:w-12 bg-cyan-500/20 border-cyan-400/50 hover:bg-cyan-500/40 text-white">
                <Copy className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Info da Partida */}
        <motion.div className="space-y-2 sm:space-y-3 mb-4 sm:mb-8" initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.3
      }}>
          <div className="glass-card p-3 sm:p-4 rounded-lg sm:rounded-xl backdrop-blur-xl border border-white/20 bg-blue-700">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Coins className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                <span className="text-xs sm:text-sm font-medium text-[#ededed]/90">Aposta</span>
              </div>
              <span className="font-bold text-base sm:text-lg text-yellow-400">
                {match.xp_bet} XP
              </span>
            </div>
          </div>
          <div className="glass-card p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white/5 backdrop-blur-xl border border-white/20">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                <span className="text-white/90 text-xs sm:text-sm font-medium">Prêmio</span>
              </div>
              <span className="font-bold text-base sm:text-lg text-green-400">
                {match.xp_bet * 2} XP
              </span>
            </div>
          </div>
        </motion.div>

        {/* Loading Animado */}
        <motion.div className="text-center mb-4 sm:mb-8" initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} transition={{
        delay: 0.4
      }}>
          <motion.div animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 360]
        }} transition={{
          scale: {
            duration: 1.5,
            repeat: Infinity
          },
          rotate: {
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }
        }}>
            <Loader2 className="w-10 h-10 sm:w-16 sm:h-16 text-white mx-auto" style={{
            filter: 'drop-shadow(0 0 10px currentColor)'
          }} />
          </motion.div>
          <motion.p className="text-white/80 mt-2 sm:mt-4 text-sm sm:text-base font-medium" animate={{
          opacity: [0.5, 1, 0.5]
        }} transition={{
          duration: 1.5,
          repeat: Infinity
        }}>
            Procurando adversário...
          </motion.p>
        </motion.div>

        {/* Botão Sair */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.5
      }}>
          <Button variant="outline" onClick={onLeave} className="w-full bg-red-500/20 border-red-500/50 hover:bg-red-500/40 text-white font-semibold rounded-lg sm:rounded-xl text-sm sm:text-base py-2 sm:py-3">
            {isHost ? "Cancelar Partida" : "Sair da Sala"}
          </Button>
        </motion.div>
      </motion.div>
    </div>;
};