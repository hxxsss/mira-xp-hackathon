import { motion } from "framer-motion";
import { Target, Zap, Crown, Trophy, Coins, ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MatchConfirmCard } from "./MatchConfirmCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

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

      <div className="relative z-10 min-h-screen py-4 sm:py-8 px-3 sm:px-4">
        <div className="max-w-7xl w-full mx-auto space-y-4 sm:space-y-8">
          
          {/* Join by Code Section - FIRST on mobile */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-2xl mx-auto"
          >
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3 sm:p-6">
              <div className="flex flex-col items-center gap-2 sm:gap-4">
                <div className="text-center">
                  <h3 className="text-sm sm:text-xl font-bold text-white drop-shadow-md mb-0.5 sm:mb-1">
                    Já tem um código?
                  </h3>
                  <p className="text-white/60 text-xs font-medium hidden sm:block">
                    Digite o código para entrar em uma partida
                  </p>
                </div>
                
                <div className="flex flex-row gap-2 w-full max-w-md">
                  <Input
                    type="text"
                    placeholder="CÓDIGO"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 text-base font-mono tracking-wider focus:border-white/40 focus:ring-white/20 text-center"
                    maxLength={6}
                  />
                  <Button
                    onClick={handleSearchCode}
                    disabled={!roomCode.trim() || searching}
                    className="bg-cyan-500/20 hover:bg-cyan-500/40 text-white font-semibold px-4 sm:px-8 border border-cyan-400/50 hover:border-cyan-400/70 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {searching ? "..." : "Entrar"}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center"
          >
            <p className="text-base sm:text-xl md:text-2xl text-white/60 font-medium drop-shadow-md">
              Ou escolha um modo de batalha
            </p>
          </motion.div>

          {/* Mode Cards Carousel - Horizontal Slider - Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="-mx-3 sm:-mx-4"
          >
            <Carousel
              opts={{
                align: "start",
                loop: false,
              }}
              className="w-full"
            >
              <CarouselContent className="ml-3 sm:ml-4">
                {modes.map((mode, index) => {
                  const Icon = mode.icon;
                  return (
                    <CarouselItem 
                      key={mode.id} 
                      className="pl-3 sm:pl-4 basis-[70%] sm:basis-[45%] md:basis-1/3 last:pr-3 sm:last:pr-4"
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={mode.onClick}
                        className="h-full cursor-pointer"
                      >
                        <Card
                          className={cn(
                            "relative group overflow-hidden h-full",
                            "bg-white/5 backdrop-blur-xl border-2",
                            mode.borderColor,
                            "rounded-2xl p-4 sm:p-6",
                            "transition-all duration-300 ease-out",
                            "hover:scale-[1.02]",
                            mode.hoverGlow,
                            mode.borderGlow
                          )}
                        >
                          {/* Inner Gradient */}
                          <div className={cn(
                            "absolute inset-0 bg-gradient-to-br opacity-70",
                            mode.innerGradient
                          )} />

                          {/* Content */}
                          <div className="relative z-10 h-full flex flex-col items-center text-center min-h-[200px] sm:min-h-[280px]">
                            {/* Icon */}
                            <div className="relative mb-3 sm:mb-4">
                              <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl" />
                              <div className="relative w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center border border-white/20 shadow-xl">
                                <Icon className={cn("w-7 h-7 sm:w-10 sm:h-10 drop-shadow-lg", mode.iconColor)} strokeWidth={2} />
                              </div>
                            </div>

                            {/* Text Content */}
                            <div className="flex-grow flex flex-col justify-center space-y-1 sm:space-y-2">
                              <h3 className="text-base sm:text-xl font-bold text-white drop-shadow-lg tracking-tight">
                                {mode.title}
                              </h3>
                              <p className="text-xs sm:text-sm font-semibold text-white/70 drop-shadow-md">
                                {mode.subtitle}
                              </p>
                              <p className="text-xs text-white/50 leading-relaxed px-1 font-medium line-clamp-2">
                                {mode.description}
                              </p>
                            </div>

                            {/* CTA Button */}
                            <div className="w-full mt-3 sm:mt-4">
                              <div className="px-4 py-2 sm:py-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 font-bold text-white text-xs sm:text-sm shadow-lg group-hover:bg-white/20 transition-all duration-300">
                                Jogar
                              </div>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
            </Carousel>
          </motion.div>

          {/* How it Works Section - Full Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-8">
              <h2 className="text-lg sm:text-2xl font-bold text-white text-center mb-4 sm:mb-8 drop-shadow-lg">
                Como Funciona
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
                {/* Rule 1 */}
                <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-xl bg-white/5">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-400/30 flex items-center justify-center">
                    <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" strokeWidth={2} />
                  </div>
                  <h3 className="text-sm sm:text-lg font-bold text-white drop-shadow-md">Velocidade é Tudo</h3>
                  <p className="text-white/60 text-xs sm:text-sm leading-relaxed font-medium">
                    Quanto mais rápido você responder corretamente, mais pontos você ganha. O tempo é seu aliado!
                  </p>
                </div>

                {/* Rule 2 */}
                <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-xl bg-white/5">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-400/30 flex items-center justify-center">
                    <Coins className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400" strokeWidth={2} />
                  </div>
                  <h3 className="text-sm sm:text-lg font-bold text-white drop-shadow-md">Sistema de Apostas</h3>
                  <p className="text-white/60 text-xs sm:text-sm leading-relaxed font-medium">
                    Aposte seu XP antes da partida. O vencedor leva todo o prêmio acumulado. Alto risco, alta recompensa!
                  </p>
                </div>

                {/* Rule 3 */}
                <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-xl bg-white/5">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-400/30 flex items-center justify-center">
                    <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400" strokeWidth={2} />
                  </div>
                  <h3 className="text-sm sm:text-lg font-bold text-white drop-shadow-md">Desempate Justo</h3>
                  <p className="text-white/60 text-xs sm:text-sm leading-relaxed font-medium">
                    Em caso de empate nos pontos, o jogador com o melhor tempo médio de resposta é declarado vencedor.
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