import { motion } from "framer-motion";
import { Swords, Users } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ModeSelectionScreenProps {
  onSelectMode: (mode: '1v1' | 'group') => void;
}

export const ModeSelectionScreen = ({ onSelectMode }: ModeSelectionScreenProps) => {
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

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
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
              className="arcade-button cursor-pointer p-8 bg-gradient-to-br from-red-500/20 to-orange-500/20 border-red-400 hover:shadow-[0_0_40px_rgba(239,68,68,0.5)] transition-all duration-300"
            >
              <div className="space-y-4">
                <Swords className="w-20 h-20 mx-auto text-red-400" />
                <h3 className="text-3xl font-bold text-red-400">⚔️ 1 vs 1</h3>
                <p className="text-lg text-gray-100">DUELO CLÁSSICO</p>
                <p className="text-sm text-gray-200">
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
              className="arcade-button cursor-pointer p-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-400 hover:shadow-[0_0_40px_rgba(168,85,247,0.5)] transition-all duration-300"
            >
              <div className="space-y-4">
                <Users className="w-20 h-20 mx-auto text-purple-400" />
                <h3 className="text-3xl font-bold text-purple-400">👥 GRUPOS</h3>
                <p className="text-lg text-gray-100">BATALHA ÉPICA</p>
                <p className="text-sm text-gray-200">
                  Até 5 times competindo<br />
                  Trabalho em equipe e estratégia
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
