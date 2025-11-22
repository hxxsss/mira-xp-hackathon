import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Award, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Confetti from "react-confetti";

interface PodiumModalProps {
  open: boolean;
  onClose: () => void;
  groups: Array<{
    name: string;
    total_score: number;
    id: string;
  }>;
  userGroupId: string;
  xpGained: number;
}

export const PodiumModal = ({ open, onClose, groups, userGroupId, xpGained }: PodiumModalProps) => {
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Sort groups by score
  const sortedGroups = [...groups].sort((a, b) => b.total_score - a.total_score);
  const userGroup = groups.find(g => g.id === userGroupId);
  const userPosition = sortedGroups.findIndex(g => g.id === userGroupId) + 1;

  useEffect(() => {
    if (open && userPosition === 1) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [open, userPosition]);

  const getPodiumColor = (position: number) => {
    switch (position) {
      case 1: return "from-yellow-400 to-yellow-600";
      case 2: return "from-gray-300 to-gray-500";
      case 3: return "from-orange-400 to-orange-600";
      default: return "from-gray-700 to-gray-900";
    }
  };

  const getPodiumHeight = (position: number) => {
    switch (position) {
      case 1: return "h-40";
      case 2: return "h-32";
      case 3: return "h-24";
      default: return "h-20";
    }
  };

  const getMedal = (position: number) => {
    switch (position) {
      case 1: return "🥇";
      case 2: return "🥈";
      case 3: return "🥉";
      default: return "🏅";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}
      
      <DialogContent className="max-w-4xl bg-gradient-to-br from-purple-900/95 to-pink-900/95 border-yellow-500 border-4">
        <div className="space-y-6">
          {/* Title */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="text-center"
          >
            <Trophy className="w-20 h-20 mx-auto text-yellow-400 mb-4 animate-bounce" />
            <h2 className="text-4xl font-bold neon-text">CLASSIFICAÇÃO FINAL</h2>
          </motion.div>

          {/* Podium */}
          <div className="flex items-end justify-center gap-4 h-64">
            {/* 2nd Place */}
            {sortedGroups[1] && (
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center"
              >
                <div className="text-center mb-2">
                  <div className="text-3xl mb-1">{getMedal(2)}</div>
                  <p className="font-bold text-gray-300">{sortedGroups[1].name}</p>
                  <p className="text-xl text-yellow-400">{sortedGroups[1].total_score} pts</p>
                </div>
                <div className={`w-32 ${getPodiumHeight(2)} bg-gradient-to-t ${getPodiumColor(2)} rounded-t-lg flex items-center justify-center text-white font-bold text-2xl`}>
                  2º
                </div>
              </motion.div>
            )}

            {/* 1st Place */}
            {sortedGroups[0] && (
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center"
              >
                <div className="text-center mb-2">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-5xl mb-1"
                  >
                    {getMedal(1)}
                  </motion.div>
                  <p className="font-bold text-yellow-400 text-lg">{sortedGroups[0].name}</p>
                  <p className="text-2xl text-yellow-400 font-bold">{sortedGroups[0].total_score} pts</p>
                </div>
                <div className={`w-36 ${getPodiumHeight(1)} bg-gradient-to-t ${getPodiumColor(1)} rounded-t-lg flex items-center justify-center text-white font-bold text-3xl shadow-[0_0_40px_rgba(255,215,0,0.6)]`}>
                  1º
                </div>
              </motion.div>
            )}

            {/* 3rd Place */}
            {sortedGroups[2] && (
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col items-center"
              >
                <div className="text-center mb-2">
                  <div className="text-3xl mb-1">{getMedal(3)}</div>
                  <p className="font-bold text-gray-300">{sortedGroups[2].name}</p>
                  <p className="text-xl text-yellow-400">{sortedGroups[2].total_score} pts</p>
                </div>
                <div className={`w-32 ${getPodiumHeight(3)} bg-gradient-to-t ${getPodiumColor(3)} rounded-t-lg flex items-center justify-center text-white font-bold text-2xl`}>
                  3º
                </div>
              </motion.div>
            )}
          </div>

          {/* Other Groups */}
          {sortedGroups.length > 3 && (
            <div className="space-y-2">
              {sortedGroups.slice(3).map((group, idx) => (
                <motion.div
                  key={group.id}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getMedal(idx + 4)}</span>
                    <span className="font-bold">{group.name}</span>
                  </div>
                  <span className="text-yellow-400 font-bold">{group.total_score} pts</span>
                </motion.div>
              ))}
            </div>
          )}

          {/* Your Result */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6 }}
            className={`p-6 rounded-lg text-center ${
              userPosition === 1 
                ? 'bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border-2 border-yellow-400' 
                : 'bg-gray-800/50'
            }`}
          >
            <Award className="w-12 h-12 mx-auto mb-2 text-yellow-400" />
            <h3 className="text-2xl font-bold mb-2">
              {userPosition === 1 ? '🎉 VITÓRIA!' : `${userPosition}º Lugar`}
            </h3>
            <div className="flex items-center justify-center gap-2 text-xl">
              <Zap className="w-6 h-6 text-yellow-400" />
              <span className="font-bold text-yellow-400">
                {xpGained > 0 ? `+${xpGained}` : xpGained} XP
              </span>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-lg py-6"
            >
              Continuar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
