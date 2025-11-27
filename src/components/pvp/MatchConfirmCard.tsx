import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Coins, Target, ArrowRight, X } from "lucide-react";
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
            <h2 className="text-2xl font-bold text-white drop-shadow-lg mb-2">
              Resumo da Partida
            </h2>
            <p className="text-white/70 text-sm font-medium">
              Confirme os detalhes antes de entrar
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
            {/* Host */}
            <div className="glass-card p-4 rounded-xl bg-white/5 backdrop-blur-xl border border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-400" />
                  <span className="font-medium text-black/80 text-xl">Host</span>
                </div>
                <span className="font-semibold text-[#3706a2]/80 text-xl">{hostName}</span>
              </div>
            </div>

            {/* Bet */}
            <div className="glass-card p-4 rounded-xl bg-white/5 backdrop-blur-xl border border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-yellow-400" />
                  <span className="font-medium text-black/80 text-xl">Aposta</span>
                </div>
                <span className="text-yellow-400 font-bold text-lg">{match.xp_bet} XP</span>
              </div>
            </div>

            {/* Difficulty */}
            {match.difficulty_level && <div className="glass-card p-4 rounded-xl bg-white/5 backdrop-blur-xl border border-white/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-cyan-400" />
                    <span className="font-medium text-black/80 text-xl">Nível</span>
                  </div>
                  <span className="font-semibold capitalize text-[#074aa3]/80">{match.difficulty_level}</span>
                </div>
              </div>}
          </motion.div>

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
            <Button onClick={onJoin} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-6 text-lg rounded-xl shadow-xl">
              Entrar na Partida
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