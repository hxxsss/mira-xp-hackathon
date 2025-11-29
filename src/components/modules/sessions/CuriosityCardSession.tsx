import { useEffect } from "react";
import { motion } from "framer-motion";
import { Lightbulb, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface CuriosityCardSessionProps {
  icon: string;
  title?: string;
  text: string;
  bgColor?: "yellow" | "blue" | "purple" | "green";
  onComplete: () => void;
}

export const CuriosityCardSession = ({
  icon,
  title = "CURIOSIDADE",
  text,
  bgColor = "purple",
  onComplete,
}: CuriosityCardSessionProps) => {
  
  // Auto-complete após visualização (usuário teve tempo de ler)
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000); // 3 segundos para ler

    return () => clearTimeout(timer);
  }, [onComplete]);

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

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ 
          duration: 0.5,
          type: "spring",
          stiffness: 100,
          damping: 15
        }}
        className="w-full max-w-2xl"
      >
        <div
          className={cn(
            "relative rounded-2xl border-2 p-8 md:p-12",
            "shadow-sm transition-all duration-300",
            "hover:shadow-md",
            bgColorMap[bgColor]
          )}
        >
          {/* Ícone Decorativo no Canto Superior */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              delay: 0.2,
              type: "spring",
              stiffness: 200,
              damping: 15
            }}
            className="absolute -top-6 -left-6 md:-top-8 md:-left-8"
          >
            <div className={cn(
              "w-12 h-12 md:w-16 md:h-16 rounded-full",
              "flex items-center justify-center shadow-lg",
              bgColorMap[bgColor]
            )}>
              <span className="text-3xl md:text-4xl">{icon}</span>
            </div>
          </motion.div>

          {/* Ícone Adicional (Lâmpada ou Estrela) - opcional */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.3, scale: 1 }}
            transition={{ delay: 0.4 }}
            className={cn(
              "absolute top-4 right-4",
              iconColorMap[bgColor]
            )}
          >
            {bgColor === "yellow" || bgColor === "purple" ? (
              <Lightbulb className="w-8 h-8" />
            ) : (
              <Sparkles className="w-8 h-8" />
            )}
          </motion.div>

          {/* Título */}
          {title && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-4"
            >
              <p className={cn(
                "text-xs md:text-sm font-bold uppercase tracking-wider",
                iconColorMap[bgColor]
              )}>
                {title}
              </p>
            </motion.div>
          )}

          {/* Texto do Fato */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-base md:text-lg leading-relaxed font-medium text-foreground">
              {text}
            </p>
          </motion.div>

          {/* Indicador Visual de "Lido" */}
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "100%" }}
            transition={{ delay: 0.6, duration: 2.4 }}
            className={cn(
              "absolute bottom-0 left-0 h-1 rounded-b-2xl",
              bgColor === "yellow" && "bg-yellow-400",
              bgColor === "blue" && "bg-blue-400",
              bgColor === "purple" && "bg-primary",
              bgColor === "green" && "bg-green-400"
            )}
          />
        </div>
      </motion.div>

      {/* Texto Auxiliar */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-sm text-muted-foreground mt-6"
      >
        Continue para a próxima sessão...
      </motion.p>
    </div>
  );
};
