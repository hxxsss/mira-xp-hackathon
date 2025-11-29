import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Coins, Target, ArrowRight, X, Users, Trophy } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
interface MatchConfirmCardProps {
  match: any;
  onJoin: () => void;
  onCancel: () => void;
  userId: string;
}
export const MatchConfirmCard = ({
  match,
  onJoin,
  onCancel,
  userId
}: MatchConfirmCardProps) => {
  const [hostName, setHostName] = useState<string>("Host");
  useEffect(() => {
    const loadHostName = async () => {
      const {
        data
      } = await supabase.from('profiles').select('name').eq('id', match.host_user_id).single();
      if (data) setHostName(data.name);
    };
    loadHostName();
  }, [match.host_user_id]);
  const isGroupMode = match.match_mode === 'group';
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div initial={{
      opacity: 0,
      scale: 0.9,
      y: 20
    }} animate={{
      opacity: 1,
      scale: 1,
      y: 0
    }} transition={{
      duration: 0.3
    }} className="w-full max-w-md">
        <Card className="glass-card backdrop-blur-2xl bg-white/10 border-white/20 rounded-3xl p-8 relative">
          {/* Close Button */}
          <button onClick={onCancel} className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>

          {/* Title */}
          <motion.div initial={{
          y: -10,
          opacity: 0
        }} animate={{
          y: 0,
          opacity: 1
        }} transition={{
          delay: 0.1
        }} className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              {isGroupMode ? <Trophy className="w-8 h-8 text-purple-400" /> : <Target className="w-8 h-8 text-cyan-400" />}
              <h2 className="text-2xl font-bold text-white drop-shadow-lg">
                {isGroupMode ? 'Sala de Batalha Épica' : 'Duelo Clássico'}
              </h2>
            </div>
            <p className="text-white/70 text-sm font-medium">
              {isGroupMode ? 'Entre na sala e escolha seu grupo!' : 'Confirme os detalhes antes de entrar'}
            </p>
          </motion.div>

          {/* Match Details */}
          <motion.div initial={{
          y: 10,
          opacity: 0
        }} animate={{
          y: 0,
          opacity: 1
        }} transition={{
          delay: 0.2
        }} className="space-y-4 mb-6">
            {/* Mode indicator for group */}
            {isGroupMode && <div className="glass-card p-4 rounded-xl bg-purple-500/20 backdrop-blur-xl border border-purple-400/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-400" />
                    <span className="font-medium text-lg text-black">Modo</span>
                  </div>
                  <span className="font-semibold text-purple-300 text-lg">Batalha de Grupos</span>
                </div>
              </div>}

            {/* Host - only for 1v1 */}
            {!isGroupMode && <div className="glass-card p-4 rounded-xl bg-white/5 backdrop-blur-xl border border-white/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-400" />
                    <span className="font-medium text-white text-lg">Host</span>
                  </div>
                  <span className="font-semibold text-white/80 text-lg">{hostName}</span>
                </div>
              </div>}

            {/* Max Groups - only for group mode */}
            {isGroupMode && match.max_groups && <div className="glass-card p-4 rounded-xl bg-white/5 backdrop-blur-xl border border-white/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-400" />
                    <span className="font-medium text-lg text-black">Máx. Grupos</span>
                  </div>
                  <span className="font-semibold text-green-300 text-lg">{match.max_groups} grupos</span>
                </div>
              </div>}

            {/* Bet */}
            <div className="glass-card p-4 rounded-xl bg-white/5 backdrop-blur-xl border border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-yellow-400" />
                  <span className="font-medium text-lg text-black">Aposta</span>
                </div>
                <span className="text-yellow-400 font-bold text-lg">{match.xp_bet} XP</span>
              </div>
            </div>

            {/* Difficulty */}
            {match.difficulty_level && <div className="glass-card p-4 rounded-xl bg-white/5 backdrop-blur-xl border border-white/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-cyan-400" />
                    <span className="font-medium text-white text-lg">Nível</span>
                  </div>
                  <span className="font-semibold capitalize text-cyan-300">{match.difficulty_level}</span>
                </div>
              </div>}
          </motion.div>

          {/* Info for group mode */}
          {isGroupMode && <motion.div initial={{
          y: 10,
          opacity: 0
        }} animate={{
          y: 0,
          opacity: 1
        }} transition={{
          delay: 0.25
        }} className="mb-4 p-3 rounded-lg bg-purple-500/20 border border-purple-400/30">
              <p className="text-purple-200 text-sm text-center font-medium">
                💡 O XP será cobrado apenas quando você criar ou entrar em um grupo
              </p>
            </motion.div>}

          {/* Action Buttons */}
          <motion.div initial={{
          y: 10,
          opacity: 0
        }} animate={{
          y: 0,
          opacity: 1
        }} transition={{
          delay: 0.3
        }} className="space-y-3">
            <Button onClick={onJoin} className={`w-full ${isGroupMode ? 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700' : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'} text-white font-bold py-6 text-lg rounded-xl shadow-xl`}>
              {isGroupMode ? 'Entrar na Sala' : 'Entrar na Partida'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <Button onClick={onCancel} variant="outline" className="w-full bg-white/5 border-white/20 hover:bg-white/10 text-white font-semibold py-4 rounded-xl">
              Cancelar
            </Button>
          </motion.div>
        </Card>
      </motion.div>
    </div>;
};