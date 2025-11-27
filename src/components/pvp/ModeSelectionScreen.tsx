import { motion } from "framer-motion";
import { Target, Zap, Crown, Trophy, Coins } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MatchConfirmCard } from "./MatchConfirmCard";

interface ModeSelectionScreenProps {
  onSelectMode: (mode: '1v1' | 'group') => void;
  onQuickMatch: () => void;
  onJoinWithCode: (matchId: string) => void;
  userId: string;
}

export const ModeSelectionScreen = ({
  onSelectMode,
  onQuickMatch,
  onJoinWithCode,
  userId
}: ModeSelectionScreenProps) => {
  const [roomCode, setRoomCode] = useState("");
  const [foundMatch, setFoundMatch] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  const { toast } = useToast();
  const handleSearchCode = async () => {
    if (!roomCode || roomCode.length !== 6) {
      toast({
        title: "Código inválido",
        description: "Digite um código de 6 caracteres",
        variant: "destructive"
      });
      return;
    }

    setSearching(true);

    try {
      // Buscar partida pelo código
      const { data: match, error } = await supabase
        .from("pvp_matches")
        .select("*")
        .eq("match_code", roomCode.toUpperCase())
        .eq("status", "waiting")
        .eq("match_mode", "1v1")
        .maybeSingle();

      if (error || !match) {
        toast({
          title: "Partida não encontrada",
          description: "Verifique o código ou a partida já iniciou",
          variant: "destructive"
        });
        return;
      }

      if (match.host_user_id === userId) {
        toast({
          title: "Erro",
          description: "Você não pode entrar na sua própria partida",
          variant: "destructive"
        });
        return;
      }

      setFoundMatch(match);
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Erro ao buscar",
        description: "Tente novamente",
        variant: "destructive"
      });
    } finally {
      setSearching(false);
    }
  };

  const handleMatchJoin = async () => {
    if (foundMatch) {
      // Verificar XP do usuário
      const { data: profile } = await supabase
        .from("profiles")
        .select("current_xp")
        .eq("id", userId)
        .single();

      if (!profile || profile.current_xp < foundMatch.xp_bet) {
        toast({
          title: "XP insuficiente",
          description: `Você precisa de ${foundMatch.xp_bet} XP para entrar nesta partida.`,
          variant: "destructive"
        });
        return;
      }

      // Descontar XP
      await supabase
        .from("profiles")
        .update({ current_xp: profile.current_xp - foundMatch.xp_bet })
        .eq("id", userId);

      // Entrar na partida
      await supabase
        .from("pvp_matches")
        .update({
          opponent_user_id: userId,
        })
        .eq("id", foundMatch.id);

      toast({
        title: "Partida iniciada!",
        description: "Boa sorte!"
      });

      onJoinWithCode(foundMatch.id);
      setFoundMatch(null);
      setRoomCode("");
    }
  };

  const handleCancelConfirm = () => {
    setFoundMatch(null);
    setRoomCode("");
  };

  const modes = [
    {
      id: '1v1',
      icon: Target,
      iconColor: 'text-cyan-400',
      title: 'DUELO CLÁSSICO',
      subtitle: 'Desafio Direto',
      description: 'Enfrente um oponente em um duelo de conhecimento financeiro.',
      gradient: 'from-cyan-500/20 via-blue-500/15 to-cyan-600/20',
      innerGradient: 'from-cyan-400/10 via-blue-500/5 to-transparent',
      borderColor: 'border-cyan-400/30',
      hoverGlow: 'hover:shadow-[0_0_40px_rgba(6,182,212,0.4)]',
      borderGlow: 'hover:border-cyan-400/60',
      patternOpacity: 'opacity-5',
      onClick: () => onSelectMode('1v1')
    },
    {
      id: 'quick',
      icon: Zap,
      iconColor: 'text-orange-400',
      title: 'PARTIDA INSTANTÂNEA',
      subtitle: 'Jogue Agora',
      description: 'Encontre um oponente aleatório e comece a jogar imediatamente.',
      gradient: 'from-orange-500/20 via-amber-500/15 to-orange-600/20',
      innerGradient: 'from-orange-400/10 via-amber-500/5 to-transparent',
      borderColor: 'border-orange-400/30',
      hoverGlow: 'hover:shadow-[0_0_40px_rgba(251,146,60,0.4)]',
      borderGlow: 'hover:border-orange-400/60',
      patternOpacity: 'opacity-5',
      onClick: onQuickMatch
    },
    {
      id: 'group',
      icon: Crown,
      iconColor: 'text-purple-400',
      title: 'BATALHA ÉPICA',
      subtitle: 'Modo Épico',
      description: 'Monte seu time e compita contra outros grupos em batalhas estratégicas.',
      gradient: 'from-purple-500/20 via-pink-500/15 to-purple-600/20',
      innerGradient: 'from-purple-400/10 via-pink-500/5 to-transparent',
      borderColor: 'border-purple-400/30',
      hoverGlow: 'hover:shadow-[0_0_40px_rgba(168,85,247,0.4)]',
      borderGlow: 'hover:border-purple-400/60',
      patternOpacity: 'opacity-5',
      onClick: () => onSelectMode('group')
    }
  ];

  return (
    <>
      {foundMatch && (
        <MatchConfirmCard
          match={foundMatch}
          onJoin={handleMatchJoin}
          onCancel={handleCancelConfirm}
          userId={userId}
        />
      )}

      <div className="relative min-h-screen overflow-hidden">
      {/* Background Idêntico ao Dashboard */}
      <div className="fixed inset-0 z-0 geometric-bg gradient-background">
        {/* Neon Lines - Meteor Effect */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "neon-line absolute",
              i % 2 === 0 ? "neon-line-cyan" : "neon-line-pink"
            )}
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 200 + 100}px`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 3 + 4}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4">
        <div className="max-w-7xl w-full space-y-12">
          {/* Subtitle Only - Centered */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <p className="text-xl md:text-2xl text-white/60 font-medium drop-shadow-md">
              Escolha sua batalha
            </p>
          </motion.div>

          {/* Mode Cards Grid - Uniform Heights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">

            {modes.map((mode, index) => {
              const Icon = mode.icon;
              return (
                <motion.div
                  key={mode.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15, duration: 0.6 }}
                  className="h-full"
                >
                  <motion.div
                    whileHover={{ scale: 1.03, y: -8 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={mode.onClick}
                    className="h-full"
                  >
                    <Card
                      className={cn(
                        "relative group cursor-pointer overflow-hidden h-full",
                        "bg-white/5 backdrop-blur-xl border-2",
                        mode.borderColor,
                        "rounded-3xl p-8",
                        "transition-all duration-500 ease-out",
                        mode.hoverGlow,
                        mode.borderGlow
                      )}
                    >
                      {/* Futuristic Pattern Overlay */}
                      <div 
                        className={cn(
                          "absolute inset-0 bg-[linear-gradient(30deg,transparent_0%,transparent_48%,rgba(255,255,255,0.05)_49%,rgba(255,255,255,0.05)_51%,transparent_52%,transparent_100%)]",
                          "bg-[length:20px_20px]",
                          mode.patternOpacity
                        )}
                      />

                      {/* Inner Gradient - Always Visible */}
                      <div className={cn(
                        "absolute inset-0 bg-gradient-to-br opacity-70",
                        mode.innerGradient
                      )} />

                      {/* Hover Gradient Overlay */}
                      <div className={cn(
                        "absolute inset-0 opacity-0 group-hover:opacity-100",
                        "bg-gradient-to-br transition-opacity duration-500",
                        mode.gradient
                      )} />

                      {/* Content - Full Height with Proper Spacing */}
                      <div className="relative z-10 h-full flex flex-col justify-between items-center text-center min-h-[400px]">
                        {/* Icon */}
                        <motion.div
                          className="relative flex-shrink-0"
                          whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.15 }}
                          transition={{ duration: 0.5 }}
                        >
                          <div className="absolute inset-0 bg-white/20 rounded-full blur-3xl" />
                           <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center border border-white/20 shadow-2xl group-hover:shadow-[0_0_30px_currentColor] transition-all duration-500">
                            <Icon className={cn("w-12 h-12 drop-shadow-lg", mode.iconColor)} strokeWidth={2} />
                          </div>
                        </motion.div>

                        {/* Text Content - Centered Flex */}
                        <div className="space-y-3 flex-grow flex flex-col justify-center py-6">
                          <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-white drop-shadow-lg tracking-tight">
                              {mode.title}
                            </h3>
                            <p className="text-base font-semibold text-white/70 drop-shadow-md">
                              {mode.subtitle}
                            </p>
                          </div>
                          <p className="text-sm text-white/60 leading-relaxed drop-shadow-sm px-2 font-medium">
                            {mode.description}
                          </p>
                        </div>

                        {/* CTA Button - Always at Bottom */}
                        <motion.div
                          className="w-full flex-shrink-0"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <div className="px-6 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 font-bold text-white text-base shadow-lg group-hover:bg-white/20 group-hover:border-white/30 transition-all duration-300">
                            Iniciar Partida
                          </div>
                        </motion.div>
                      </div>
                    </Card>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          {/* Join by Code Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="max-w-2xl mx-auto"
          >
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
              <div className="flex flex-col items-center gap-4">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white drop-shadow-md mb-1">
                    Já tem um código de sala?
                  </h3>
                  <p className="text-white/60 text-sm font-medium">
                    Digite o código para entrar em uma partida privada
                  </p>
                </div>
                
                <div className="flex gap-3 w-full max-w-md">
                  <Input
                    type="text"
                    placeholder="Digite o código"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 text-lg font-mono tracking-wider focus:border-white/40 focus:ring-white/20"
                    maxLength={6}
                  />
                  <Button
                    onClick={handleSearchCode}
                    disabled={!roomCode.trim() || searching}
                    className="bg-white/10 hover:bg-white/20 text-white font-semibold px-8 border border-white/20 hover:border-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {searching ? "Buscando..." : "Entrar"}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* How it Works Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-white text-center mb-8 drop-shadow-lg">
                Como Funciona
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                {/* Rule 1 */}
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500/15 to-purple-600/15 border border-purple-400/20 flex items-center justify-center">
                    <Zap className="w-7 h-7 text-purple-400" strokeWidth={2} />
                  </div>
                  <h3 className="text-lg font-bold text-white drop-shadow-md">Velocidade Conta</h3>
                  <p className="text-white/60 text-sm leading-relaxed font-medium">
                    Quem responde primeiro corretamente ganha mais pontos. Acertos rápidos valem ouro.
                  </p>
                </div>

                {/* Rule 2 */}
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500/15 to-blue-600/15 border border-blue-400/20 flex items-center justify-center">
                    <Coins className="w-7 h-7 text-blue-400" strokeWidth={2} />
                  </div>
                  <h3 className="text-lg font-bold text-white drop-shadow-md">Apostas de XP</h3>
                  <p className="text-white/60 text-sm leading-relaxed font-medium">
                    Aposte seus pontos de XP antes da partida. O vencedor leva tudo.
                  </p>
                </div>

                {/* Rule 3 */}
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500/15 to-green-600/15 border border-green-400/20 flex items-center justify-center">
                    <Trophy className="w-7 h-7 text-green-400" strokeWidth={2} />
                  </div>
                  <h3 className="text-lg font-bold text-white drop-shadow-md">Critério de Desempate</h3>
                  <p className="text-white/60 text-sm leading-relaxed font-medium">
                    Em caso de empate, vence quem teve o melhor tempo médio de resposta.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

        </div>
      </div>
      </div>
    </>
  );
};