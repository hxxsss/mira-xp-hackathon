import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectionOption {
  emoji?: string;
  text: string;
}

interface SelectionSessionProps {
  mode: "quiz" | "survey";
  question: string;
  options: SelectionOption[];
  correctIndex?: number;
  onComplete: () => void;
}

export const SelectionSession = ({
  mode,
  question,
  options,
  correctIndex,
  onComplete,
}: SelectionSessionProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [shakeIndex, setShakeIndex] = useState<number | null>(null);

  const handleOptionClick = (index: number) => {
    // Se já respondeu e acertou (modo quiz), não faz nada
    if (isCorrect === true) return;

    setSelectedIndex(index);

    if (mode === "survey") {
      // Modo Pesquisa: qualquer resposta é válida
      onComplete();
    } else {
      // Modo Quiz: valida resposta
      if (correctIndex !== undefined && index === correctIndex) {
        // Acertou
        setIsCorrect(true);
        onComplete();
      } else {
        // Errou
        setIsCorrect(false);
        setShakeIndex(index);

        // Remove o shake e limpa a seleção para permitir nova tentativa
        setTimeout(() => {
          setShakeIndex(null);
          setSelectedIndex(null);
          setIsCorrect(null);
        }, 600);
      }
    }
  };

  const getOptionState = (index: number) => {
    if (mode === "survey") {
      // Modo Pesquisa: apenas mostra selecionado
      return selectedIndex === index ? "selected" : "normal";
    } else {
      // Modo Quiz: mostra sucesso ou erro
      if (selectedIndex === index) {
        if (isCorrect === true) return "success";
        if (isCorrect === false) return "error";
      }
      return "normal";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-8 space-y-8">
      {/* Pergunta */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-2xl"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          {question}
        </h2>
      </motion.div>

      {/* Lista de Opções Vertical */}
      <div className="flex flex-col gap-4 w-full max-w-2xl">
        {options.map((option, index) => {
          const state = getOptionState(index);
          const shouldShake = shakeIndex === index;

          return (
            <motion.button
              key={index}
              onClick={() => handleOptionClick(index)}
              disabled={isCorrect === true}
              animate={shouldShake ? {
                x: [-10, 10, -10, 10, 0],
                transition: { duration: 0.4 }
              } : {}}
              whileHover={{ scale: isCorrect !== true ? 1.02 : 1 }}
              whileTap={{ scale: isCorrect !== true ? 0.98 : 1 }}
              className={cn(
                "flex items-center gap-4 p-6 rounded-2xl border-2 transition-all duration-200",
                "text-left w-full min-h-[80px]",
                // Estado Normal
                state === "normal" && "bg-card border-border hover:border-primary/50 hover:bg-accent",
                // Estado Selecionado (Pesquisa)
                state === "selected" && "bg-primary/10 border-primary shadow-lg",
                // Estado Sucesso (Quiz - Acertou)
                state === "success" && "bg-success/10 border-success shadow-lg cursor-default",
                // Estado Erro (Quiz - Errou)
                state === "error" && "bg-destructive/10 border-destructive"
              )}
            >
              {/* Emoji/Ícone à Esquerda */}
              <div className="flex-shrink-0 text-4xl md:text-5xl">
                {option.emoji || "💭"}
              </div>

              {/* Texto */}
              <div className="flex-1">
                <p className={cn(
                  "text-base md:text-lg font-semibold",
                  state === "normal" && "text-foreground",
                  state === "selected" && "text-primary",
                  state === "success" && "text-success",
                  state === "error" && "text-destructive"
                )}>
                  {option.text}
                </p>
              </div>

              {/* Ícone de Feedback à Direita */}
              <div className="flex-shrink-0">
                <AnimatePresence mode="wait">
                  {state === "selected" && mode === "survey" && (
                    <motion.div
                      key="check-survey"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    >
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-5 h-5 text-primary-foreground" />
                      </div>
                    </motion.div>
                  )}
                  {state === "success" && (
                    <motion.div
                      key="check-success"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    >
                      <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
                        <Check className="w-5 h-5 text-success-foreground" />
                      </div>
                    </motion.div>
                  )}
                  {state === "error" && (
                    <motion.div
                      key="x-error"
                      initial={{ scale: 0, rotate: 180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    >
                      <div className="w-8 h-8 bg-destructive rounded-full flex items-center justify-center">
                        <X className="w-5 h-5 text-destructive-foreground" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Feedback Visual (apenas no modo quiz ao acertar) */}
      <AnimatePresence>
        {isCorrect === true && mode === "quiz" && (
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
              Correto! 🎉
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
