import { motion } from "framer-motion";
import { Swords, Users, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

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
  const [roomCode, setRoomCode] = useState("");
  const modes = [
    {
      id: '1v1',
      icon: Swords,
      iconColor: 'text-cyan-400',
      title: 'DUELO CLÁSSICO',
      subtitle: 'Desafio Direto',
      description: 'Enfrente um oponente em um duelo de conhecimento. O mais rápido e preciso vence!',
      gradient: 'from-cyan-500/40 via-blue-500/30 to-cyan-600/40',
      innerGradient: 'from-cyan-500/20 to-transparent',
      borderColor: 'border-cyan-400/40',
      hoverGlow: 'hover:shadow-[0_0_80px_rgba(34,211,238,0.8)]',
      borderGlow: 'hover:border-cyan-400/90',
      patternOpacity: 'opacity-10',
      onClick: () => onSelectMode('1v1')
    },
    {
      id: 'quick',
      icon: Zap,
      iconColor: 'text-orange-400',
      title: 'PARTIDA INSTANTÂNEA',
      subtitle: 'Jogue Agora',
      description: 'Entre em uma partida instantânea contra um oponente aleatório. Sem espera!',
      gradient: 'from-orange-500/40 via-yellow-500/30 to-orange-600/40',
      innerGradient: 'from-orange-500/20 to-transparent',
      borderColor: 'border-orange-400/40',
      hoverGlow: 'hover:shadow-[0_0_80px_rgba(251,146,60,0.8)]',
      borderGlow: 'hover:border-orange-400/90',
      patternOpacity: 'opacity-10',
      onClick: onQuickMatch
    },
    {
      id: 'group',
      icon: Users,
      iconColor: 'text-purple-400',
      title: 'BATALHA ÉPICA',
      subtitle: 'Modo Épico',
      description: 'Reúna seu time e enfrente outros grupos. Trabalho em equipe e estratégia!',
      gradient: 'from-purple-500/40 via-fuchsia-500/30 to-purple-600/40',
      innerGradient: 'from-purple-500/20 to-transparent',
      borderColor: 'border-purple-400/40',
      hoverGlow: 'hover:shadow-[0_0_80px_rgba(192,132,252,0.8)]',
      borderGlow: 'hover:border-purple-400/90',
      patternOpacity: 'opacity-10',
      onClick: () => onSelectMode('group')
    }
  ];

  return (
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

          {/* Mode Cards Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">

            {modes.map((mode, index) => {
              const Icon = mode.icon;
              return (
                <motion.div
                  key={mode.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15, duration: 0.6 }}
                  whileHover={{ scale: 1.03, y: -8 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={mode.onClick}
                >
                  <Card
                    className={cn(
                      "relative group cursor-pointer overflow-hidden",
                      "bg-white/5 backdrop-blur-xl border-[1px]",
                      mode.borderColor,
                      "rounded-3xl p-8 h-[450px]",
                      "transition-all duration-500 ease-out",
                      "hover:translate-y-[-12px]",
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
                      "absolute inset-0 bg-gradient-to-br opacity-60",
                      mode.innerGradient
                    )} />

                    {/* Hover Gradient Overlay */}
                    <div className={cn(
                      "absolute inset-0 opacity-0 group-hover:opacity-100",
                      "bg-gradient-to-br transition-opacity duration-500",
                      mode.gradient
                    )} />

                    {/* Content */}
                    <div className="relative z-10 h-full flex flex-col items-center justify-between text-center">
                      {/* Icon */}
                      <motion.div
                        className="relative"
                        whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.15 }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className="absolute inset-0 bg-white/20 rounded-full blur-3xl" />
                        <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-white/30 to-white/10 flex items-center justify-center border-2 border-white/30 shadow-2xl">
                          <Icon className={cn("w-16 h-16 drop-shadow-2xl", mode.iconColor)} strokeWidth={2.5} />
                        </div>
                      </motion.div>

                      {/* Text Content */}
                      <div className="space-y-4 flex-1 flex flex-col justify-center">
                        <div className="space-y-2">
                          <h3 className="text-4xl font-black text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] tracking-tight">
                            {mode.title}
                          </h3>
                          <p className="text-xl font-bold text-white/80 drop-shadow-md">
                            {mode.subtitle}
                          </p>
                        </div>
                        <p className="text-base text-white/70 leading-relaxed drop-shadow-sm px-4 font-medium">
                          {mode.description}
                        </p>
                      </div>

                      {/* CTA Button */}
                      <motion.div
                        className="w-full"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="px-8 py-4 rounded-2xl bg-white/10 backdrop-blur-sm border-2 border-white/20 font-black text-white text-xl shadow-xl group-hover:bg-white/20 group-hover:border-white/40 transition-all duration-300">
                          JOGAR AGORA
                        </div>
                      </motion.div>
                    </div>
                  </Card>
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
            <Card className="bg-white/5 backdrop-blur-xl border-2 border-white/10 rounded-3xl p-6">
              <div className="flex flex-col items-center gap-4">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white drop-shadow-md mb-1">
                    🔑 Já tem um código de sala?
                  </h3>
                  <p className="text-white/60 text-sm">
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
                    onClick={() => {
                      if (roomCode.trim()) {
                        onJoinWithCode();
                      }
                    }}
                    disabled={!roomCode.trim()}
                    className="bg-white/10 hover:bg-white/20 text-white font-bold px-8 border-2 border-white/20 hover:border-white/40 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ENTRAR
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
            <Card className="bg-white/5 backdrop-blur-xl border-2 border-white/10 rounded-3xl p-8">
              <h2 className="text-3xl font-black text-white text-center mb-8 drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
                ⚔️ COMO FUNCIONA
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                {/* Rule 1 */}
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-2 border-purple-400/30 flex items-center justify-center">
                    <span className="text-3xl">⚡</span>
                  </div>
                  <h3 className="text-xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">Velocidade Conta</h3>
                  <p className="text-white/70 text-sm leading-relaxed">
                    <strong className="text-white drop-shadow-sm">Quem responde primeiro corretamente ganha mais pontos!</strong> Acertos rápidos valem ouro.
                  </p>
                </div>

                {/* Rule 2 */}
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-2 border-blue-400/30 flex items-center justify-center">
                    <span className="text-3xl">💰</span>
                  </div>
                  <h3 className="text-xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">Apostas de XP</h3>
                  <p className="text-white/70 text-sm leading-relaxed">
                    Aposte seus pontos de XP antes da partida. O vencedor leva tudo!
                  </p>
                </div>

                {/* Rule 3 */}
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/20 border-2 border-green-400/30 flex items-center justify-center">
                    <span className="text-3xl">🏆</span>
                  </div>
                  <h3 className="text-xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">Critério de Desempate</h3>
                  <p className="text-white/70 text-sm leading-relaxed">
                    Em caso de empate, vence quem teve o melhor tempo médio de resposta.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

        </div>
      </div>
    </div>
  );
};