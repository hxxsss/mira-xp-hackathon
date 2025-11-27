import { motion } from "framer-motion";
import { Swords, Users, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
  const modes = [
    {
      id: '1v1',
      icon: Swords,
      title: 'DUELO CLÁSSICO',
      subtitle: 'Desafio Direto',
      description: 'Enfrente um oponente em um duelo de conhecimento. O mais rápido e preciso vence!',
      gradient: 'from-purple-500/30 via-pink-500/20 to-purple-600/30',
      innerGradient: 'from-purple-500/10 to-transparent',
      hoverGlow: 'hover:shadow-[0_0_60px_rgba(168,85,247,0.5)]',
      borderGlow: 'hover:border-purple-400/60',
      onClick: () => onSelectMode('1v1')
    },
    {
      id: 'quick',
      icon: Zap,
      title: 'PARTIDA INSTANTÂNEA',
      subtitle: 'Jogue Agora',
      description: 'Entre em uma partida instantânea contra um oponente aleatório. Sem espera!',
      gradient: 'from-blue-500/30 via-cyan-500/20 to-blue-600/30',
      innerGradient: 'from-blue-500/10 to-transparent',
      hoverGlow: 'hover:shadow-[0_0_60px_rgba(59,130,246,0.5)]',
      borderGlow: 'hover:border-blue-400/60',
      onClick: onQuickMatch
    },
    {
      id: 'group',
      icon: Users,
      title: 'BATALHA ÉPICA',
      subtitle: 'Modo Épico',
      description: 'Reúna seu time e enfrente outros grupos. Trabalho em equipe e estratégia!',
      gradient: 'from-green-500/30 via-emerald-500/20 to-green-600/30',
      innerGradient: 'from-green-500/10 to-transparent',
      hoverGlow: 'hover:shadow-[0_0_60px_rgba(34,197,94,0.5)]',
      borderGlow: 'hover:border-green-400/60',
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
          {/* Hero Title */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4"
          >
            <h1 className="text-6xl md:text-8xl font-black text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] tracking-tight">
              ESCOLHA SUA BATALHA
            </h1>
            <p className="text-xl md:text-2xl text-white/80 font-bold drop-shadow-lg">
              Teste seus conhecimentos e conquiste a vitória
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
                      "bg-white/5 backdrop-blur-xl border-2 border-white/10",
                      "rounded-3xl p-8 h-[450px]",
                      "transition-all duration-500 ease-out",
                      mode.hoverGlow,
                      mode.borderGlow
                    )}
                  >
                    {/* Inner Gradient - Always Visible */}
                    <div className={cn(
                      "absolute inset-0 bg-gradient-to-br opacity-50",
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
                          <Icon className="w-16 h-16 text-white drop-shadow-2xl" strokeWidth={2.5} />
                        </div>
                      </motion.div>

                      {/* Text Content */}
                      <div className="space-y-4 flex-1 flex flex-col justify-center">
                        <div className="space-y-2">
                          <h3 className="text-4xl font-black text-white drop-shadow-lg tracking-tight">
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

          {/* How it Works Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="bg-white/5 backdrop-blur-xl border-2 border-white/10 rounded-3xl p-8">
              <h2 className="text-3xl font-black text-white text-center mb-8 drop-shadow-lg">
                ⚔️ COMO FUNCIONA
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                {/* Rule 1 */}
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-2 border-purple-400/30 flex items-center justify-center">
                    <span className="text-3xl">⚡</span>
                  </div>
                  <h3 className="text-xl font-bold text-white drop-shadow-md">Velocidade Conta</h3>
                  <p className="text-white/70 text-sm leading-relaxed">
                    <strong className="text-white">Quem responde primeiro corretamente ganha mais pontos!</strong> Acertos rápidos valem ouro.
                  </p>
                </div>

                {/* Rule 2 */}
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-2 border-blue-400/30 flex items-center justify-center">
                    <span className="text-3xl">💰</span>
                  </div>
                  <h3 className="text-xl font-bold text-white drop-shadow-md">Apostas de XP</h3>
                  <p className="text-white/70 text-sm leading-relaxed">
                    Aposte seus pontos de XP antes da partida. O vencedor leva tudo!
                  </p>
                </div>

                {/* Rule 3 */}
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/20 border-2 border-green-400/30 flex items-center justify-center">
                    <span className="text-3xl">🏆</span>
                  </div>
                  <h3 className="text-xl font-bold text-white drop-shadow-md">Critério de Desempate</h3>
                  <p className="text-white/70 text-sm leading-relaxed">
                    Em caso de empate, vence quem teve o melhor tempo médio de resposta.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Join with Code - Secondary Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="text-center"
          >
            <motion.button
              onClick={onJoinWithCode}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/5 backdrop-blur-xl border-2 border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <span className="text-2xl">🔑</span>
              </div>
              <div className="text-left">
                <p className="text-white font-bold text-lg drop-shadow-md">Já tem um código?</p>
                <p className="text-white/60 text-sm drop-shadow-sm">Entrar com código de partida</p>
              </div>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};