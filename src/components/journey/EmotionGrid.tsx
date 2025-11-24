import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface EmotionOption {
  emoji: string;
  label: string;
  color: string;
}

interface EmotionGridProps {
  question: string;
  options: EmotionOption[];
  selectedOption: number | null;
  onSelect: (index: number) => void;
}

export const EmotionGrid = ({ question, options, selectedOption, onSelect }: EmotionGridProps) => {
  return (
    <motion.div 
      className="bg-card rounded-3xl p-6 shadow-xl border border-border"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <h2 className="text-lg font-semibold text-foreground mb-6">
        {question}
      </h2>
      
      <div className="grid grid-cols-2 gap-4">
        {options.map((option, index) => (
          <motion.button
            key={index}
            onClick={() => onSelect(index)}
            className={cn(
              "relative p-6 rounded-2xl bg-background border-2 transition-all duration-300",
              "hover:shadow-lg active:scale-95",
              selectedOption === index
                ? "border-[3px] shadow-2xl scale-105"
                : "border-border hover:border-muted-foreground"
            )}
            style={{
              borderColor: selectedOption === index ? option.color : undefined,
              boxShadow: selectedOption === index 
                ? `0 10px 30px ${option.color}30` 
                : undefined,
            }}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
          >
            <div className="text-5xl mb-3">{option.emoji}</div>
            <div className="text-sm font-medium text-foreground">{option.label}</div>
            
            {selectedOption === index && (
              <motion.div
                className="absolute inset-0 rounded-2xl"
                style={{ backgroundColor: `${option.color}10` }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};
