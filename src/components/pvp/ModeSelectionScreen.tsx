import { motion } from "framer-motion";
import { Swords, Users, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ModeSelectionScreenProps {
  onSelectMode: (mode: '1v1' | 'group') => void;
  onQuickMatch: () => void;
}

export const ModeSelectionScreen = ({ onSelectMode, onQuickMatch }: ModeSelectionScreenProps) => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-8">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold neon-text"
        >
          🎯 ESCOLHA SEU MODO
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
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
              className="arcade-button cursor-pointer p-6 bg-gradient-to-br from-red-500/20 to-orange-500/20 border-red-400 hover:shadow-[0_0_40px_rgba(239,68,68,0.5)] transition-all duration-300"
            >
              <div className="space-y-3">
                <Swords className="w-16 h-16 mx-auto text-red-400" />
                <h3 className="text-2xl font-bold text-red-400">⚔️ 1 vs 1</h3>
                <p className="text-lg text-black font-semibold">DUELO CLÁSSICO</p>
                <p className="text-sm text-black">
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
              className="arcade-button cursor-pointer p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-400 hover:shadow-[0_0_40px_rgba(168,85,247,0.5)] transition-all duration-300"
            >
              <div className="space-y-3">
                <Users className="w-16 h-16 mx-auto text-purple-400" />
                <h3 className="text-2xl font-bold text-purple-400">👥 GRUPOS</h3>
                <p className="text-lg text-black font-semibold">BATALHA ÉPICA</p>
                <p className="text-sm text-black">
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
              className="arcade-button cursor-pointer p-6 bg-gradient-to-br from-green-500/20 to-blue-500/20 border-green-400 hover:shadow-[0_0_40px_rgba(34,197,94,0.5)] transition-all duration-300"
            >
              <div className="space-y-3">
                <Search className="w-16 h-16 mx-auto text-green-400" />
                <h3 className="text-2xl font-bold text-green-400">⚡ RÁPIDO</h3>
                <p className="text-lg text-black font-semibold">PARTIDA INSTANTÂNEA</p>
                <p className="text-sm text-black">
                  Jogue contra um<br />
                  usuário aleatório
                </p>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* How it Works Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 max-w-5xl mx-auto"
        >
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700">
            <CardHeader className="pb-4">
              <CardTitle className="text-white flex items-center gap-2 justify-center">
                <Swords className="w-6 h-6 text-yellow-400" />
                Como Funciona o Sistema de Apostas
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6 p-6">
              {/* Sistema de Pontuação */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">📊</span>
                  <h4 className="font-bold text-yellow-400">Sistema de Pontuação</h4>
                </div>
                <ul className="text-sm space-y-1 text-gray-200">
                  <li>• Base: <strong className="text-white">100 pontos</strong></li>
                  <li>• Bônus velocidade: <strong className="text-white">até +100</strong></li>
                </ul>
              </div>

              {/* Recompensas 1v1 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">⚔️</span>
                  <h4 className="font-bold text-red-400">Recompensas 1v1</h4>
                </div>
                <ul className="text-sm space-y-1 text-gray-200">
                  <li>• Vencedor: <strong className="text-white">dobro do XP</strong></li>
                  <li>• Empate: <strong className="text-white">recupera aposta</strong></li>
                </ul>
              </div>

              {/* Recompensas Grupos */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">👥</span>
                  <h4 className="font-bold text-purple-400">Recompensas Grupos</h4>
                </div>
                <ul className="text-sm space-y-1 text-gray-200">
                  <li>• 1º lugar: <strong className="text-white">60% do XP total</strong></li>
                  <li>• 2º lugar: <strong className="text-white">25% do XP total</strong></li>
                  <li>• 3º lugar: <strong className="text-white">15% do XP total</strong></li>
                </ul>
              </div>

              {/* Apostas de XP */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🎲</span>
                  <h4 className="font-bold text-green-400">Apostas de XP</h4>
                </div>
                <ul className="text-sm space-y-1 text-gray-200">
                  <li>• Mínimo: <strong className="text-white">10 XP</strong></li>
                  <li>• Maior aposta = <strong className="text-white">maior recompensa</strong></li>
                  <li>• Perder = <strong className="text-white">perde o XP apostado</strong></li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
