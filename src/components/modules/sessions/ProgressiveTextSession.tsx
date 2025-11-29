import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProgressiveTextSessionProps {
  blocks: string[];
  title?: string;
  onComplete: () => void;
}

export const ProgressiveTextSession = ({
  blocks,
  title,
  onComplete,
}: ProgressiveTextSessionProps) => {
  const [revealedCount, setRevealedCount] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastBlockRef = useRef<HTMLDivElement>(null);

  const hasMoreBlocks = revealedCount < blocks.length;
  const isComplete = revealedCount === blocks.length;

  useEffect(() => {
    if (isComplete) {
      onComplete();
    }
  }, [isComplete, onComplete]);

  const handleRevealNext = () => {
    if (hasMoreBlocks) {
      setRevealedCount((prev) => prev + 1);
      
      // Scroll suave para o último bloco após um pequeno delay para a animação iniciar
      setTimeout(() => {
        lastBlockRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6" ref={containerRef}>
      {title && (
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-semibold text-foreground mb-6"
        >
          {title}
        </motion.h2>
      )}

      <div className="space-y-6">
        <AnimatePresence>
          {blocks.slice(0, revealedCount).map((block, index) => (
            <motion.div
              key={index}
              ref={index === revealedCount - 1 ? lastBlockRef : null}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="relative"
            >
              <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                <p className="text-lg leading-relaxed text-foreground">
                  {block}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {hasMoreBlocks && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-3 py-8"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <ChevronDown className="w-8 h-8 text-primary opacity-60" />
          </motion.div>
          
          <Button
            onClick={handleRevealNext}
            variant="outline"
            size="lg"
            className="text-base font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            Toque para continuar
          </Button>
        </motion.div>
      )}

      {isComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-6 text-sm text-muted-foreground"
        >
          ✓ Leitura completa
        </motion.div>
      )}
    </div>
  );
};
