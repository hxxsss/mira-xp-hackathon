import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface CuriosityCard {
  icon: string;
  title?: string;
  text: string;
  bgColor?: "yellow" | "blue" | "purple" | "green";
}

interface CuriosityCardSessionProps {
  cards: CuriosityCard[];
  onComplete: () => void;
}

export const CuriosityCardSession = ({
  cards,
  onComplete,
}: CuriosityCardSessionProps) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const totalCards = cards.length;
  const currentCard = cards[currentCardIndex];
  
  // Auto-complete cada card após 4 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentCardIndex < totalCards - 1) {
        // Próximo card
        setCurrentCardIndex(prev => prev + 1);
      } else {
        // Último card, completa a sessão
        onComplete();
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [currentCardIndex, totalCards, onComplete]);

  // Mapeamento de cores
  const bgColorMap = {
    yellow: "bg-yellow-50 border-yellow-200",
    blue: "bg-blue-50 border-blue-200",
    purple: "bg-purple-50 border-purple-200",
    green: "bg-green-50 border-green-200",
  };

  const iconColorMap = {
    yellow: "text-yellow-600",
    blue: "text-blue-600",
    purple: "text-primary",
    green: "text-green-600",
  };

  const bgColor = currentCard.bgColor || "purple";

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-8">
      {/* Stack de Cards Empilhados */}
      <div className="relative w-full max-w-2xl" style={{ minHeight: "400px" }}>
        <AnimatePresence mode="wait">
          {cards.map((card, index) => {
            const isActive = index === currentCardIndex;
            const isPast = index < currentCardIndex;
            const isFuture = index > currentCardIndex;
            const cardBgColor = card.bgColor || "purple";

            // Apenas renderiza o card atual e os cards futuros (empilhados atrás)
            if (isPast) return null;

            return (
              <motion.div
                key={index}
                initial={isFuture ? { 
                  opacity: 1, 
                  scale: 0.95 - (index - currentCardIndex) * 0.05,
                  y: (index - currentCardIndex) * -8,
                  zIndex: totalCards - index
                } : { 
                  opacity: 0, 
                  y: 30, 
                  scale: 0.95 
                }}
                animate={isActive ? { 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  zIndex: totalCards
                } : {
                  opacity: 1,
                  scale: 0.95 - (index - currentCardIndex) * 0.05,
                  y: (index - currentCardIndex) * -8,
                  zIndex: totalCards - index
                }}
                exit={{ 
                  opacity: 0, 
                  y: -30, 
                  scale: 0.95,
                  transition: { duration: 0.3 }
                }}
                transition={{ 
                  duration: 0.5,
                  type: "spring",
                  stiffness: 100,
                  damping: 15
                }}
                className="absolute inset-0"
                style={{
                  pointerEvents: isActive ? "auto" : "none"
                }}
              >
                <div
                  className={cn(
                    "relative rounded-2xl border-2 p-8 md:p-12",
                    "shadow-sm transition-all duration-300",
                    isActive && "hover:shadow-md",
                    bgColorMap[cardBgColor]
                  )}
                >
                  {/* Ícone Decorativo no Canto Superior */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: isActive ? 1 : 0.8, rotate: 0 }}
                    transition={{ 
                      delay: isActive ? 0.2 : 0,
                      type: "spring",
                      stiffness: 200,
                      damping: 15
                    }}
                    className="absolute -top-6 -left-6 md:-top-8 md:-left-8"
                  >
                    <div className={cn(
                      "w-12 h-12 md:w-16 md:h-16 rounded-full",
                      "flex items-center justify-center shadow-lg",
                      bgColorMap[cardBgColor]
                    )}>
                      <span className="text-3xl md:text-4xl">{card.icon}</span>
                    </div>
                  </motion.div>

                  {/* Ícone Adicional (Lâmpada ou Estrela) */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: isActive ? 0.3 : 0.1, scale: 1 }}
                    transition={{ delay: isActive ? 0.4 : 0 }}
                    className={cn(
                      "absolute top-4 right-4",
                      iconColorMap[cardBgColor]
                    )}
                  >
                    {cardBgColor === "yellow" || cardBgColor === "purple" ? (
                      <Lightbulb className="w-8 h-8" />
                    ) : (
                      <Sparkles className="w-8 h-8" />
                    )}
                  </motion.div>

                  {/* Título */}
                  {card.title && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: isActive ? 1 : 0.5, x: 0 }}
                      transition={{ delay: isActive ? 0.3 : 0 }}
                      className="mb-4"
                    >
                      <p className={cn(
                        "text-xs md:text-sm font-bold uppercase tracking-wider",
                        iconColorMap[cardBgColor]
                      )}>
                        {card.title}
                      </p>
                    </motion.div>
                  )}

                  {/* Texto do Fato */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: isActive ? 1 : 0.5, y: 0 }}
                    transition={{ delay: isActive ? 0.4 : 0 }}
                  >
                    <p className="text-base md:text-lg leading-relaxed font-medium text-foreground">
                      {card.text}
                    </p>
                  </motion.div>

                  {/* Barra de Progresso (apenas no card ativo) */}
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "100%" }}
                      transition={{ delay: 0.6, duration: 3.4 }}
                      className={cn(
                        "absolute bottom-0 left-0 h-1 rounded-b-2xl",
                        cardBgColor === "yellow" && "bg-yellow-400",
                        cardBgColor === "blue" && "bg-blue-400",
                        cardBgColor === "purple" && "bg-primary",
                        cardBgColor === "green" && "bg-green-400"
                      )}
                    />
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Indicador de Progresso */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center gap-2 mt-6"
      >
        {cards.map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              index === currentCardIndex 
                ? "w-8 bg-primary" 
                : index < currentCardIndex 
                  ? "w-2 bg-primary/60" 
                  : "w-2 bg-muted"
            )}
          />
        ))}
      </motion.div>

      {/* Texto Auxiliar */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-sm text-muted-foreground mt-4"
      >
        {currentCardIndex < totalCards - 1 
          ? `Curiosidade ${currentCardIndex + 1} de ${totalCards}` 
          : "Continue para a próxima sessão..."}
      </motion.p>
    </div>
  );
};
