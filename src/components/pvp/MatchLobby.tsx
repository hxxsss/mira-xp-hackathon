import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Users, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface MatchLobbyProps {
  match: any;
  userId: string;
  onLeave: () => void;
}

export const MatchLobby = ({ match, userId, onLeave }: MatchLobbyProps) => {
  const { toast } = useToast();
  const isHost = match.host_user_id === userId;

  const copyMatchCode = () => {
    navigator.clipboard.writeText(match.match_code);
    toast({
      title: "Código copiado!",
      description: "Compartilhe com seu oponente.",
    });
  };

  return (
    <div className="min-h-screen battle-gradient flex items-center justify-center p-4 relative overflow-hidden">
      {/* Partículas animadas de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              background: `radial-gradient(circle, ${
                i % 3 === 0 ? '#ff00ff' : i % 3 === 1 ? '#00ffff' : '#ffff00'
              }, transparent)`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      <motion.div 
        className="glass-card p-8 max-w-lg w-full relative z-10"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Título Neon */}
        <motion.div 
          className="text-center mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            <Users className="h-20 w-20 text-primary mx-auto mb-4" 
                   style={{ filter: 'drop-shadow(0 0 20px currentColor)' }} />
          </motion.div>
          <h1 className="text-4xl font-black neon-text mb-2">
            ⚔️ AGUARDANDO OPONENTE
          </h1>
          <p className="text-white/80 text-lg">
            {isHost ? "Compartilhe o código com seu amigo!" : "O jogo iniciará em breve..."}
          </p>
        </motion.div>

        {/* Código da Sala - Estilo Arcade */}
        <motion.div 
          className="glass-card p-6 mb-6 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Animated border */}
          <motion.div
            className="absolute inset-0 border-2 border-primary/50 rounded-lg"
            animate={{
              boxShadow: [
                '0 0 20px rgba(255,0,255,0.3)',
                '0 0 40px rgba(0,255,255,0.5)',
                '0 0 20px rgba(255,0,255,0.3)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          
          <p className="text-white/60 text-center mb-3 text-sm font-bold tracking-wider">
            🔑 CÓDIGO DA SALA
          </p>
          <div className="flex items-center justify-center gap-3">
            <motion.span 
              className="text-5xl font-bold font-mono tracking-[0.3em] text-white relative"
              style={{ 
                textShadow: '0 0 20px #00ff88, 0 0 40px #00ff88, 0 0 60px #00ff88',
              }}
              animate={{
                textShadow: [
                  '0 0 20px #00ff88, 0 0 40px #00ff88',
                  '0 0 30px #00ffff, 0 0 60px #00ffff',
                  '0 0 20px #00ff88, 0 0 40px #00ff88'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {match.match_code}
            </motion.span>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                size="icon"
                onClick={copyMatchCode}
                className="arcade-button h-12 w-12 bg-primary/20 border-primary/50 hover:bg-primary/40"
              >
                <Copy className="h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Info da Partida */}
        <motion.div 
          className="space-y-3 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="glass-card p-4">
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm">💰 Aposta:</span>
              <span className="font-bold text-xl text-yellow-400" 
                    style={{ textShadow: '0 0 10px currentColor' }}>
                {match.xp_bet} XP
              </span>
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm">🏆 Prêmio do Vencedor:</span>
              <span className="font-bold text-xl text-green-400"
                    style={{ textShadow: '0 0 10px currentColor' }}>
                {match.xp_bet * 2} XP
              </span>
            </div>
          </div>
        </motion.div>

        {/* Loading Animado */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 360]
            }}
            transition={{
              scale: { duration: 1.5, repeat: Infinity },
              rotate: { duration: 2, repeat: Infinity, ease: "linear" }
            }}
          >
            <Loader2 className="w-16 h-16 text-primary mx-auto" 
                     style={{ filter: 'drop-shadow(0 0 10px currentColor)' }} />
          </motion.div>
          <motion.p 
            className="text-white/80 mt-4 text-lg font-semibold"
            animate={{
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity
            }}
          >
            ⏳ Procurando adversário...
          </motion.p>
        </motion.div>

        {/* Botão Sair */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            variant="outline"
            onClick={onLeave}
            className="w-full arcade-button bg-red-500/20 border-red-500/50 hover:bg-red-500/40 text-white"
          >
            {isHost ? "❌ Cancelar Partida" : "🚪 Sair"}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};