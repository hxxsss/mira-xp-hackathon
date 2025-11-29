import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";

interface CompleteSentenceSessionProps {
  sentence: string;
  options: string[];
  correctIndex: number;
  onComplete: () => void;
}

export const CompleteSentenceSession = ({
  sentence,
  options,
  correctIndex,
  onComplete,
}: CompleteSentenceSessionProps) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [shakeIndex, setShakeIndex] = useState<number | null>(null);

  const handleOptionClick = (index: number) => {
    if (isCorrect !== null) return; // Já respondeu

    setSelectedOption(index);

    if (index === correctIndex) {
      // Resposta correta
      setIsCorrect(true);
      setShowFeedback(true);
    } else {
      // Resposta errada
      setIsCorrect(false);
      setShakeIndex(index);
      
      // Remove o shake após a animação
      setTimeout(() => {
        setShakeIndex(null);
        setSelectedOption(null);
      }, 600);
    }
  };

  const renderSentenceWithGap = () => {
    const parts = sentence.split("____");
    
    return (
      <div className="flex flex-wrap items-center justify-center gap-2 text-2xl md:text-3xl font-semibold text-foreground leading-relaxed">
        <span>{parts[0]}</span>
        
        <AnimatePresence mode="wait">
          {isCorrect && selectedOption !== null ? (
            <motion.span
              key="filled"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-success/20 text-success rounded-xl border-2 border-success font-bold"
            >
              {options[selectedOption]}
              <Check className="w-5 h-5" />
            </motion.span>
          ) : (
            <span
              key="gap"
              className="inline-block min-w-[120px] border-b-4 border-dashed border-primary/40 pb-1"
            />
          )}
        </AnimatePresence>
        
        <span>{parts[1]}</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-8 space-y-12">
      {/* Frase com Lacuna */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-3xl"
      >
        {renderSentenceWithGap()}
      </motion.div>

      {/* Opções */}
      <div className="flex flex-wrap justify-center gap-4 max-w-2xl">
        {options.map((option, index) => {
          const isSelected = selectedOption === index;
          const isWrong = isSelected && !isCorrect;
          const shouldShake = shakeIndex === index;

          return (
            <motion.div
              key={index}
              animate={shouldShake ? {
                x: [-10, 10, -10, 10, 0],
                transition: { duration: 0.4 }
              } : {}}
            >
              <Button
                onClick={() => handleOptionClick(index)}
                disabled={isCorrect !== null}
                variant="outline"
                className={`
                  px-6 py-3 text-lg font-medium rounded-xl transition-all duration-200
                  ${isSelected && isCorrect 
                    ? "bg-success text-success-foreground border-success hover:bg-success/90" 
                    : isWrong
                    ? "bg-destructive text-destructive-foreground border-destructive"
                    : "bg-card hover:bg-accent hover:scale-105"
                  }
                `}
              >
                {option}
              </Button>
            </motion.div>
          );
        })}
      </div>

      {/* Feedback Visual */}
      <AnimatePresence>
        {showFeedback && isCorrect && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="flex items-center gap-3 px-6 py-4 bg-success/10 border-2 border-success rounded-2xl"
          >
            <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center">
              <Check className="w-6 h-6 text-success-foreground" />
            </div>
            <span className="text-lg font-semibold text-success">
              Perfeito! 🎉
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botão Continuar */}
      <AnimatePresence>
        {isCorrect && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="w-full max-w-md"
          >
            <Button
              onClick={onComplete}
              className="w-full h-14 text-lg font-semibold rounded-2xl bg-primary hover:bg-primary/90 shadow-lg"
            >
              Continuar
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
