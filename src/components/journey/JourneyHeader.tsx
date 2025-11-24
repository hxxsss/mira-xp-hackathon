import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

interface JourneyHeaderProps {
  currentStep: number;
  totalSteps: number;
}

export const JourneyHeader = ({ currentStep, totalSteps }: JourneyHeaderProps) => {
  const navigate = useNavigate();
  const progress = (currentStep / totalSteps) * 100;

  const handleClose = () => {
    if (window.confirm("Deseja sair da jornada? Seu progresso será salvo.")) {
      navigate("/dashboard");
    }
  };

  return (
    <motion.div 
      className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-2xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-muted-foreground">
            Etapa {currentStep} de {totalSteps}
          </span>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-accent transition-colors"
            aria-label="Fechar jornada"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    </motion.div>
  );
};
