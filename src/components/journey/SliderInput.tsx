import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

interface SliderInputProps {
  question: string;
  minLabel: string;
  maxLabel: string;
  value: number | null;
  onChange: (value: number) => void;
}

export const SliderInput = ({ 
  question, 
  minLabel, 
  maxLabel, 
  value, 
  onChange 
}: SliderInputProps) => {
  const [currentValue, setCurrentValue] = useState(value ?? 5);

  const handleValueChange = (newValue: number[]) => {
    setCurrentValue(newValue[0]);
    onChange(newValue[0]);
  };

  const getEmoji = (val: number) => {
    if (val === 0) return "😌";
    if (val <= 2) return "🤔";
    if (val <= 4) return "😐";
    if (val <= 6) return "😬";
    if (val <= 8) return "💪";
    return "🧘";
  };

  const getMessage = (val: number) => {
    if (val === 0) return "Não estou disposto a cortar nada";
    if (val <= 2) return "Posso cortar muito pouco";
    if (val <= 4) return "Posso fazer alguns sacrifícios";
    if (val <= 6) return "Estou disposto a cortar bastante";
    if (val <= 8) return "Vou focar nas minhas metas";
    return "Modo Monge: Corto tudo que não é essencial";
  };

  return (
    <motion.div 
      className="bg-card rounded-3xl p-8 shadow-xl border border-border"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <h2 className="text-lg font-semibold text-foreground mb-8 text-center">
        {question}
      </h2>
      
      <div className="mb-8">
        <div className="flex justify-center mb-6">
          <motion.div 
            className="text-7xl"
            key={currentValue}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {getEmoji(currentValue)}
          </motion.div>
        </div>

        <motion.p 
          className="text-center text-foreground font-medium mb-8 min-h-[60px] flex items-center justify-center"
          key={currentValue}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {getMessage(currentValue)}
        </motion.p>

        <div className="space-y-6">
          <Slider
            value={[currentValue]}
            onValueChange={handleValueChange}
            max={10}
            min={0}
            step={1}
            className="w-full"
          />

          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 text-left">
              <div className="text-2xl font-bold text-primary mb-1">0</div>
              <div className="text-sm text-muted-foreground">{minLabel}</div>
            </div>
            
            <div className="flex-1 text-center">
              <div className="text-4xl font-bold text-primary">{currentValue}</div>
              <div className="text-xs text-muted-foreground mt-1">Nível atual</div>
            </div>
            
            <div className="flex-1 text-right">
              <div className="text-2xl font-bold text-primary mb-1">10</div>
              <div className="text-sm text-muted-foreground">{maxLabel}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-primary/10 rounded-2xl p-4 border border-primary/20">
        <p className="text-sm text-foreground/80 text-center">
          💡 <strong>Dica:</strong> Seja honesto com você mesmo. Esse dado ajudará a criar um plano realista para suas metas.
        </p>
      </div>
    </motion.div>
  );
};
