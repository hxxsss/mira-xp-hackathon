import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";

interface ContinueButtonProps {
  disabled: boolean;
  isLoading?: boolean;
  onClick: () => void;
}

export const ContinueButton = ({ disabled, isLoading, onClick }: ContinueButtonProps) => {
  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 p-6 bg-background/95 backdrop-blur-sm border-t border-border"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, delay: 0.5 }}
    >
      <div className="max-w-2xl mx-auto">
        <Button
          onClick={onClick}
          disabled={disabled || isLoading}
          className={cn(
            "w-full h-14 text-lg font-semibold rounded-2xl transition-all duration-300",
            disabled 
              ? "bg-muted text-muted-foreground cursor-not-allowed" 
              : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl"
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              Continuar
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
        
        {!disabled && (
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            animate={{
              boxShadow: [
                "0 0 0 0 rgba(124, 58, 237, 0.4)",
                "0 0 0 10px rgba(124, 58, 237, 0)",
              ],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: "loop",
            }}
          />
        )}
      </div>
    </motion.div>
  );
};

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
