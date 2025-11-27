import { motion } from "framer-motion";
import { Swords, Users, Search, Key } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ModeSelectionScreenProps {
  onSelectMode: (mode: '1v1' | 'group') => void;
  onQuickMatch: () => void;
  onJoinWithCode: () => void;
}

export const ModeSelectionScreen = ({
  onSelectMode,
  onQuickMatch,
  onJoinWithCode
}: ModeSelectionScreenProps) => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Mesh Gradient Background - Cores das Trilhas */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(280,100%,70%)] via-[hsl(142,76%,36%)] to-[hsl(217,91%,60%)] opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-tr from-[hsl(217,91%,60%)] via-[hsl(280,100%,70%)] to-[hsl(142,76%,36%)] opacity-20 animate-pulse" style={{ animationDuration: '8s' }} />
      
      <div className="relative min-h-[60vh] flex items-center justify-center py-12">
        <div className="text-center space-y-8 px-4">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="text-5xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
          >
            🎯 ESCOLHA SEU MODO
          </motion.h2>

          <div className="grid md:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {/* 1v1 Mode */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.2 }} 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
            >
              <Card 
                onClick={() => onSelectMode('1v1')} 
                className="glass-card cursor-pointer p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl hover:bg-[hsl(280,100%,70%)]/20 hover:shadow-[0_0_40px_rgba(192,132,252,0.6)] transition-all duration-300"
              >
                <div className="space-y-3">
                  <Swords className="w-16 h-16 mx-auto text-white drop-shadow-lg" />
                  <h3 className="text-2xl font-bold text-white drop-shadow-md">⚔️ 1 vs 1</h3>
                  <p className="text-lg text-white/90 font-semibold drop-shadow-sm">DUELO CLÁSSICO</p>
                  <p className="text-sm text-white/80 drop-shadow-sm">
                    Desafie um oponente<br />
                    Quem responde mais rápido vence
                  </p>
                </div>
              </Card>
            </motion.div>

            {/* Group Mode */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.3 }} 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
            >
              <Card 
                onClick={() => onSelectMode('group')} 
                className="glass-card cursor-pointer p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl hover:bg-[hsl(142,76%,36%)]/20 hover:shadow-[0_0_40px_rgba(34,197,94,0.6)] transition-all duration-300"
              >
                <div className="space-y-3">
                  <Users className="w-16 h-16 mx-auto text-white drop-shadow-lg" />
                  <h3 className="text-2xl font-bold text-white drop-shadow-md">👥 GRUPOS</h3>
                  <p className="text-lg text-white/90 font-semibold drop-shadow-sm">BATALHA ÉPICA</p>
                  <p className="text-sm text-white/80 drop-shadow-sm">
                    Até 5 times competindo<br />
                    Trabalho em equipe e estratégia
                  </p>
                </div>
              </Card>
            </motion.div>

            {/* Quick Match Mode */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.4 }} 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
            >
              <Card 
                onClick={onQuickMatch} 
                className="glass-card cursor-pointer p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl hover:bg-[hsl(217,91%,60%)]/20 hover:shadow-[0_0_40px_rgba(96,165,250,0.6)] transition-all duration-300"
              >
                <div className="space-y-3">
                  <Search className="w-16 h-16 mx-auto text-white drop-shadow-lg" />
                  <h3 className="text-2xl font-bold text-white drop-shadow-md">⚡ RÁPIDO</h3>
                  <p className="text-lg text-white/90 font-semibold drop-shadow-sm">PARTIDA INSTANTÂNEA</p>
                  <p className="text-sm text-white/80 drop-shadow-sm">
                    Jogue contra um<br />
                    usuário aleatório
                  </p>
                </div>
              </Card>
            </motion.div>

            {/* Join with Code */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.5 }} 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
            >
              <Card 
                onClick={onJoinWithCode} 
                className="glass-card cursor-pointer p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl hover:bg-[hsl(280,100%,70%)]/20 hover:shadow-[0_0_40px_rgba(192,132,252,0.6)] transition-all duration-300"
              >
                <div className="space-y-3">
                  <Key className="w-16 h-16 mx-auto text-white drop-shadow-lg" />
                  <h3 className="text-2xl font-bold text-white drop-shadow-md">🔑 CÓDIGO</h3>
                  <p className="text-lg text-white/90 font-semibold drop-shadow-sm">ENTRAR COM CÓDIGO</p>
                  <p className="text-sm text-white/80 drop-shadow-sm">
                    Já tem um código?<br />
                    Entre diretamente!
                  </p>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* How it Works Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.6 }} 
            className="mt-8 max-w-5xl mx-auto"
          >
            <Card className="glass-card bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-white drop-shadow-md flex items-center gap-2 justify-center">
                  <Swords className="w-6 h-6 text-white drop-shadow-lg" />
                  Como Funciona o Sistema de Apostas
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6 p-6">
                {/* Sistema de Pontuação */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">📊</span>
                    <h4 className="font-bold text-white drop-shadow-md text-2xl">Sistema de Pontuação</h4>
                  </div>
                  <ul className="text-sm space-y-1 text-white/90">
                    <li className="font-medium text-xl text-justify">• Base: <strong className="text-white drop-shadow-sm">100 pontos</strong></li>
                    <li className="text-xl text-justify">• Bônus velocidade: <strong className="text-white drop-shadow-sm">até +100</strong></li>
                  </ul>
                </div>

                {/* Recompensas 1v1 */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">⚔️</span>
                    <h4 className="font-bold text-white drop-shadow-md text-2xl">Recompensas 1v1</h4>
                  </div>
                  <ul className="text-sm space-y-1 text-white/90">
                    <li className="text-xl text-justify">• Vencedor: <strong className="text-white drop-shadow-sm">dobro do XP</strong></li>
                    <li className="text-xl text-justify">• Empate: <strong className="text-white drop-shadow-sm">recupera aposta</strong></li>
                  </ul>
                </div>

                {/* Recompensas Grupos */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">👥</span>
                    <h4 className="font-bold text-white drop-shadow-md text-2xl">Recompensas Grupos</h4>
                  </div>
                  <ul className="text-sm space-y-1 text-white/90">
                    <li className="text-xl text-justify">• 1º lugar: <strong className="text-white drop-shadow-sm">60% do XP total</strong></li>
                    <li className="text-xl text-justify">• 2º lugar: <strong className="text-white drop-shadow-sm">25% do XP total</strong></li>
                    <li className="text-xl text-justify">• 3º lugar: <strong className="text-white drop-shadow-sm">15% do XP total</strong></li>
                  </ul>
                </div>

                {/* Apostas de XP */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">🎲</span>
                    <h4 className="font-bold text-white drop-shadow-md text-2xl">Apostas de XP</h4>
                  </div>
                  <ul className="text-sm space-y-1 text-white/90">
                    <li className="text-xl text-justify">• Mínimo: <strong className="text-white drop-shadow-sm">10 XP</strong></li>
                    <li className="text-xl text-justify">• Maior aposta = <strong className="text-white drop-shadow-sm">maior recompensa</strong></li>
                    <li className="text-xl text-justify">• Perder = <strong className="text-white drop-shadow-sm">perde o XP apostado</strong></li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};