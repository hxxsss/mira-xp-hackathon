import { useState } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { X, Heart, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SwipeCard {
  id: string;
  title: string;
  price: number;
  emoji: string;
  isImpulsive: boolean; // true = gasto supérfluo que deve ser evitado
  description?: string;
}

interface SwipeGameSessionProps {
  cards: SwipeCard[];
  onComplete: () => void;
}

export const SwipeGameSession = ({ cards, onComplete }: SwipeGameSessionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [savedAmount, setSavedAmount] = useState(0);
  const [feedback, setFeedback] = useState<{ type: "good" | "bad"; message: string } | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const currentCard = cards[currentIndex];
  const isLastCard = currentIndex === cards.length - 1;

  const handleSwipe = (direction: "left" | "right") => {
    if (isAnimating || !currentCard) return;
    setIsAnimating(true);

    const isCorrectChoice = 
      (direction === "left" && currentCard.isImpulsive) || 
      (direction === "right" && !currentCard.isImpulsive);

    // Feedback
    if (direction === "left" && currentCard.isImpulsive) {
      setFeedback({
        type: "good",
        message: `Boa economia! Você economizou R$ ${currentCard.price.toFixed(2)}!`
      });
      setSavedAmount(prev => prev + currentCard.price);
    } else if (direction === "left" && !currentCard.isImpulsive) {
      setFeedback({
        type: "bad",
        message: "Ops! Esse era um gasto necessário."
      });
    } else if (direction === "right" && currentCard.isImpulsive) {
      setFeedback({
        type: "bad",
        message: "Cuidado! Isso era um gatilho de impulso."
      });
    } else {
      setFeedback({
        type: "good",
        message: "Correto! Esse era um gasto importante."
      });
    }

    // Avançar para o próximo cartão
    setTimeout(() => {
      setFeedback(null);
      if (isLastCard) {
        onComplete();
      } else {
        setCurrentIndex(prev => prev + 1);
      }
      setIsAnimating(false);
    }, 1500);
  };

  if (!currentCard) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 max-w-md"
        >
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-foreground">
            Parabéns!
          </h2>
          <div className="bg-success/10 border-2 border-success rounded-2xl p-6 space-y-2">
            <p className="text-lg text-muted-foreground">
              Você economizou hoje:
            </p>
            <p className="text-4xl font-bold text-success">
              R$ {savedAmount.toFixed(2)}
            </p>
          </div>
          <p className="text-muted-foreground">
            Continue fazendo escolhas conscientes! 💪
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-8">
      {/* Header com progresso */}
      <div className="w-full max-w-md mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">
            Cartão {currentIndex + 1} de {cards.length}
          </span>
          <div className="flex items-center gap-2 text-success">
            <TrendingDown className="w-4 h-4" />
            <span className="text-sm font-medium">
              R$ {savedAmount.toFixed(2)} economizado
            </span>
          </div>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <motion.div
            className="bg-primary h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Pilha de Cartões */}
      <div className="relative w-full max-w-md h-[400px] mb-8">
        {/* Cartões de fundo (próximos) */}
        {cards.slice(currentIndex + 1, currentIndex + 3).map((card, idx) => (
          <motion.div
            key={card.id}
            className="absolute inset-0"
            initial={false}
            animate={{
              scale: 1 - (idx + 1) * 0.05,
              y: (idx + 1) * 10,
              opacity: 1 - (idx + 1) * 0.3,
            }}
            style={{ zIndex: cards.length - idx - 1 }}
          >
            <div className="w-full h-full bg-card rounded-3xl border-2 border-border shadow-lg" />
          </motion.div>
        ))}

        {/* Cartão Atual */}
        <SwipeCard
          card={currentCard}
          onSwipe={handleSwipe}
          isAnimating={isAnimating}
        />
      </div>

      {/* Botões de Ação */}
      <div className="flex gap-6 items-center">
        <Button
          size="icon"
          variant="outline"
          onClick={() => handleSwipe("left")}
          disabled={isAnimating}
          className="h-16 w-16 rounded-full border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground shadow-lg"
        >
          <X className="w-8 h-8" />
        </Button>

        <Button
          size="icon"
          variant="outline"
          onClick={() => handleSwipe("right")}
          disabled={isAnimating}
          className="h-16 w-16 rounded-full border-2 border-success text-success hover:bg-success hover:text-success-foreground shadow-lg"
        >
          <Heart className="w-8 h-8" />
        </Button>
      </div>

      {/* Feedback */}
      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={cn(
            "fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-4 rounded-2xl shadow-xl border-2 font-medium",
            feedback.type === "good"
              ? "bg-success/10 border-success text-success"
              : "bg-destructive/10 border-destructive text-destructive"
          )}
        >
          {feedback.message}
        </motion.div>
      )}
    </div>
  );
};

interface SwipeCardProps {
  card: SwipeCard;
  onSwipe: (direction: "left" | "right") => void;
  isAnimating: boolean;
}

const SwipeCard = ({ card, onSwipe, isAnimating }: SwipeCardProps) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-30, 0, 30]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (isAnimating) return;

    const threshold = 100;
    if (Math.abs(info.offset.x) > threshold) {
      const direction = info.offset.x > 0 ? "right" : "left";
      onSwipe(direction);
    }
  };

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{
        x,
        rotate,
        opacity,
        zIndex: 100,
      }}
      drag={!isAnimating ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      whileTap={{ scale: 1.05 }}
    >
      <div className="w-full h-full bg-card rounded-3xl border-2 border-border shadow-2xl overflow-hidden">
        {/* Indicadores de Swipe */}
        <motion.div
          className="absolute top-8 left-8 bg-destructive text-destructive-foreground px-6 py-3 rounded-2xl font-bold text-xl rotate-[-20deg] border-4 border-destructive shadow-lg"
          style={{
            opacity: useTransform(x, [-200, -50, 0], [1, 0.5, 0]),
            scale: useTransform(x, [-200, -50, 0], [1.2, 1, 0.8]),
          }}
        >
          PASSA
        </motion.div>

        <motion.div
          className="absolute top-8 right-8 bg-success text-success-foreground px-6 py-3 rounded-2xl font-bold text-xl rotate-[20deg] border-4 border-success shadow-lg"
          style={{
            opacity: useTransform(x, [0, 50, 200], [0, 0.5, 1]),
            scale: useTransform(x, [0, 50, 200], [0.8, 1, 1.2]),
          }}
        >
          COMPRA
        </motion.div>

        {/* Conteúdo do Cartão */}
        <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-6">
          <div className="text-8xl mb-4">{card.emoji}</div>
          
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-foreground">
              {card.title}
            </h3>
            {card.description && (
              <p className="text-muted-foreground text-sm">
                {card.description}
              </p>
            )}
          </div>

          <div className="bg-primary/10 border-2 border-primary rounded-2xl px-8 py-4">
            <p className="text-3xl font-bold text-primary">
              R$ {card.price.toFixed(2)}
            </p>
          </div>

          <div className="text-xs text-muted-foreground pt-4">
            ← Deslize para decidir →
          </div>
        </div>
      </div>
    </motion.div>
  );
};
