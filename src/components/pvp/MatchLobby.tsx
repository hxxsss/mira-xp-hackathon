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
    }} className="p-4 sm:p-8 max-w-lg w-full relative z-10 rounded-2xl sm:rounded-3xl backdrop-blur-xl border-2 border-white/30 bg-gradient-to-br from-blue-900/95 via-blue-800/95 to-indigo-900/95 shadow-2xl">
        {/* Título */}
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
            <Users className="h-12 w-12 sm:h-20 sm:w-20 text-cyan-300 mx-auto mb-2 sm:mb-4" style={{
            filter: 'drop-shadow(0 0 15px rgba(103, 232, 249, 0.6))'
          }} />
          </motion.div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white mb-1 sm:mb-2 drop-shadow-lg">
            Aguardando Oponente
          </h1>
          <p className="text-cyan-100 text-sm sm:text-base font-semibold drop-shadow-md">
            {isHost ? "Compartilhe o código com seu amigo" : "O jogo iniciará em breve"}
          </p>
        </motion.div>

        {/* Código da Sala */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.2
      }} className="p-4 sm:p-6 mb-4 sm:mb-6 relative overflow-hidden rounded-xl sm:rounded-2xl border-2 border-cyan-400/40 bg-gradient-to-br from-slate-900/90 to-blue-950/90 shadow-lg">
          {/* Animated border */}
          <motion.div className="absolute inset-0 border-2 border-cyan-400/30 rounded-xl sm:rounded-2xl pointer-events-none" animate={{
          boxShadow: ['0 0 15px rgba(6,182,212,0.2)', '0 0 25px rgba(6,182,212,0.4)', '0 0 15px rgba(6,182,212,0.2)']
        }} transition={{
          duration: 2,
          repeat: Infinity
        }} />
          
          <div className="flex items-center justify-center gap-2 mb-2 sm:mb-3">
            <Copy className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-300" />
            <p className="text-cyan-100 text-center text-xs sm:text-sm font-bold tracking-widest uppercase">
              Código da Sala
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            <motion.span className="text-3xl sm:text-5xl font-black font-mono tracking-[0.2em] sm:tracking-[0.3em] text-white drop-shadow-lg" animate={{
            textShadow: ['0 0 10px rgba(6,182,212,0.5)', '0 0 20px rgba(6,182,212,0.7)', '0 0 10px rgba(6,182,212,0.5)']
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
              <Button variant="outline" size="icon" onClick={copyMatchCode} className="h-10 w-10 sm:h-12 sm:w-12 bg-cyan-500/30 border-cyan-300/60 hover:bg-cyan-400/50 text-white shadow-md">
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
          <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl border border-yellow-500/30 bg-gradient-to-r from-yellow-900/40 to-amber-900/40 shadow-md">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300" />
                <span className="text-sm sm:text-base font-bold text-yellow-100">Aposta</span>
              </div>
              <span className="font-black text-lg sm:text-xl text-yellow-300 drop-shadow-md">
                {match.xp_bet} XP
              </span>
            </div>
          </div>
          <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-900/40 to-green-900/40 shadow-md">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300" />
                <span className="text-sm sm:text-base font-bold text-emerald-100">Prêmio</span>
              </div>
              <span className="font-black text-lg sm:text-xl text-emerald-300 drop-shadow-md">
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
            <Loader2 className="w-10 h-10 sm:w-16 sm:h-16 text-cyan-300 mx-auto" style={{
            filter: 'drop-shadow(0 0 12px rgba(103, 232, 249, 0.6))'
          }} />
          </motion.div>
          <motion.p className="text-cyan-100 mt-2 sm:mt-4 text-sm sm:text-base font-bold drop-shadow-md" animate={{
          opacity: [0.7, 1, 0.7]
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
          <Button variant="outline" onClick={onLeave} className="w-full bg-red-600/30 border-2 border-red-400/60 hover:bg-red-500/50 text-white font-bold rounded-lg sm:rounded-xl text-sm sm:text-base py-3 sm:py-4 shadow-lg transition-all">
            {isHost ? "Cancelar Partida" : "Sair da Sala"}
          </Button>
        </motion.div>
      </motion.div>
    </div>;
};