import { useState } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DragDropItem {
  id: string;
  label: string;
  correctZone: number;
}

interface DragDropZone {
  id: number;
  label: string;
  color: string;
}

interface DragDropSessionProps {
  title?: string;
  zones: DragDropZone[];
  items: DragDropItem[];
  onComplete: () => void;
}

export const DragDropSession = ({
  title,
  zones,
  items,
  onComplete,
}: DragDropSessionProps) => {
  const [availableItems, setAvailableItems] = useState<DragDropItem[]>(items);
  const [zoneItems, setZoneItems] = useState<Record<number, DragDropItem[]>>(
    zones.reduce((acc, zone) => ({ ...acc, [zone.id]: [] }), {})
  );
  const [draggedItem, setDraggedItem] = useState<DragDropItem | null>(null);
  const [feedback, setFeedback] = useState<{
    zoneId: number;
    type: "success" | "error";
  } | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const handleDragStart = (item: DragDropItem) => {
    setDraggedItem(item);
  };

  const handleDrop = (zoneId: number) => {
    if (!draggedItem) return;

    const isCorrect = draggedItem.correctZone === zoneId;

    if (isCorrect) {
      // Item correto - adiciona à zona
      setZoneItems((prev) => ({
        ...prev,
        [zoneId]: [...prev[zoneId], draggedItem],
      }));
      setAvailableItems((prev) => prev.filter((i) => i.id !== draggedItem.id));
      
      // Feedback de sucesso
      setFeedback({ zoneId, type: "success" });
      setTimeout(() => setFeedback(null), 800);

      // Verifica se completou
      if (availableItems.length === 1) {
        setTimeout(() => {
          setIsComplete(true);
          onComplete();
        }, 1000);
      }
    } else {
      // Item errado - feedback de erro
      setFeedback({ zoneId, type: "error" });
      setTimeout(() => setFeedback(null), 600);
    }

    setDraggedItem(null);
  };

  const getZoneColor = (zone: DragDropZone) => {
    const colors: Record<string, string> = {
      green: "bg-success/10 border-success",
      red: "bg-destructive/10 border-destructive",
      blue: "bg-primary/10 border-primary",
      yellow: "bg-yellow-500/10 border-yellow-500",
    };
    return colors[zone.color] || "bg-muted border-border";
  };

  const getZoneTextColor = (zone: DragDropZone) => {
    const colors: Record<string, string> = {
      green: "text-success",
      red: "text-destructive",
      blue: "text-primary",
      yellow: "text-yellow-600",
    };
    return colors[zone.color] || "text-foreground";
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-8 space-y-8">
      {/* Título */}
      {title && (
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-bold text-foreground text-center"
        >
          {title}
        </motion.h2>
      )}

      {!isComplete && (
        <>
          {/* Itens Disponíveis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl"
          >
            <p className="text-sm text-muted-foreground mb-3 text-center">
              Arraste os itens para a categoria correta
            </p>
            <div className="flex flex-wrap justify-center gap-3 p-4 bg-card/50 border border-border rounded-xl">
              <AnimatePresence mode="popLayout">
                {availableItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    drag
                    dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
                    dragElastic={0.1}
                    onDragStart={() => handleDragStart(item)}
                    whileDrag={{ scale: 1.1, zIndex: 50 }}
                    className="px-4 py-2 bg-background border-2 border-primary rounded-lg cursor-grab active:cursor-grabbing shadow-md hover:shadow-lg transition-shadow"
                  >
                    <span className="text-sm font-medium text-foreground">
                      {item.label}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Zonas de Destino */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
            {zones.map((zone) => {
              const isFeedbackActive = feedback?.zoneId === zone.id;
              const feedbackClass =
                isFeedbackActive && feedback.type === "error"
                  ? "animate-pulse border-destructive bg-destructive/20"
                  : isFeedbackActive && feedback.type === "success"
                  ? "border-success bg-success/20"
                  : "";

              return (
                <motion.div
                  key={zone.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: zone.id * 0.1 }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(zone.id)}
                  className={`
                    relative min-h-[200px] p-6 border-2 border-dashed rounded-xl
                    ${getZoneColor(zone)} ${feedbackClass}
                    transition-all duration-300
                  `}
                >
                  {/* Label da Zona */}
                  <div className="absolute top-3 left-3 right-3">
                    <h3
                      className={`text-lg font-bold ${getZoneTextColor(zone)}`}
                    >
                      {zone.label}
                    </h3>
                  </div>

                  {/* Itens na Zona */}
                  <div className="mt-10 space-y-2">
                    <AnimatePresence>
                      {zoneItems[zone.id]?.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-2 px-3 py-2 bg-background rounded-lg border border-border"
                        >
                          <Check className="w-4 h-4 text-success" />
                          <span className="text-sm font-medium text-foreground">
                            {item.label}
                          </span>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Ícone de Feedback */}
                  <AnimatePresence>
                    {isFeedbackActive && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                      >
                        {feedback.type === "success" ? (
                          <div className="w-20 h-20 bg-success rounded-full flex items-center justify-center">
                            <Check className="w-10 h-10 text-success-foreground" />
                          </div>
                        ) : (
                          <div className="w-20 h-20 bg-destructive rounded-full flex items-center justify-center">
                            <X className="w-10 h-10 text-destructive-foreground" />
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </>
      )}

      {/* Tela de Conclusão */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-6 p-8 bg-success/10 border-2 border-success rounded-2xl"
          >
            <div className="w-20 h-20 bg-success rounded-full flex items-center justify-center">
              <Check className="w-12 h-12 text-success-foreground" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold text-success">
                Parabéns! 🎉
              </h3>
              <p className="text-lg text-foreground">
                Você classificou todos os itens corretamente!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
