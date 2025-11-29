import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { InteractiveSession } from './InteractiveSession';
import { SessionData } from './types';

interface SessionNavigatorProps {
  sessions: SessionData[];
  onAllSessionsComplete: () => void;
}

export const SessionNavigator = ({ sessions, onAllSessionsComplete }: SessionNavigatorProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCurrentComplete, setIsCurrentComplete] = useState(false);
  
  const currentSession = sessions[currentIndex];
  const isLastSession = currentIndex === sessions.length - 1;
  const isFirstSession = currentIndex === 0;
  
  const handleSessionComplete = () => {
    setIsCurrentComplete(true);
  };
  
  const handleNext = () => {
    if (isLastSession) {
      onAllSessionsComplete();
    } else {
      setCurrentIndex(prev => prev + 1);
      setIsCurrentComplete(false);
    }
  };
  
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsCurrentComplete(true); // Já completou antes
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Indicador de progresso das sessões */}
      <div className="flex items-center justify-center gap-2">
        {sessions.map((_, idx) => (
          <div 
            key={idx}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === currentIndex 
                ? 'w-8 bg-primary' 
                : idx < currentIndex 
                  ? 'w-2 bg-primary/60' 
                  : 'w-2 bg-muted'
            }`}
          />
        ))}
      </div>
      
      {/* Texto indicador */}
      <p className="text-center text-sm text-muted-foreground">
        Sessão {currentIndex + 1} de {sessions.length}
      </p>
      
      {/* Sessão atual com animação */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <InteractiveSession 
            session={currentSession}
            onComplete={handleSessionComplete}
          />
        </motion.div>
      </AnimatePresence>
      
      {/* Indicador de Sessão Completada */}
      {isCurrentComplete && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 text-success text-sm font-medium"
        >
          <div className="w-5 h-5 bg-success rounded-full flex items-center justify-center text-success-foreground text-xs">
            ✓
          </div>
          Sessão completada
        </motion.div>
      )}
      
      {/* Navegação */}
      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={isFirstSession}
        >
          ← Anterior
        </Button>
        
        <Button
          onClick={handleNext}
          disabled={!isCurrentComplete}
        >
          {isLastSession ? 'Finalizar Sessões' : 'Continuar →'}
        </Button>
      </div>
    </div>
  );
};
