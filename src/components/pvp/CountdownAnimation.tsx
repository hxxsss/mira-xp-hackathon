import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";

interface CountdownAnimationProps {
  onComplete: () => void;
}

export const CountdownAnimation = ({ onComplete }: CountdownAnimationProps) => {
  const [count, setCount] = useState(3);
  const onCompleteRef = useRef(onComplete);
  const safetyTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Atualiza a referência sem causar re-render
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Timer de segurança: força início após 4 segundos
  useEffect(() => {
    safetyTimerRef.current = setTimeout(() => {
      console.log("⚠️ Safety timeout triggered - forcing game start");
      onCompleteRef.current();
    }, 4000);

    return () => {
      if (safetyTimerRef.current) {
        clearTimeout(safetyTimerRef.current);
      }
    };
  }, []);

  // Timer da contagem: 3 -> 2 -> 1 -> GO
  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => {
        setCount(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Quando chegar a 0, mostra GO por 500ms e depois dispara onComplete
      const goTimer = setTimeout(() => {
        if (safetyTimerRef.current) {
          clearTimeout(safetyTimerRef.current);
        }
        onCompleteRef.current();
      }, 500);
      return () => clearTimeout(goTimer);
    }
  }, [count]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900">
      {/* Animated background particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/40 rounded-full"
            initial={{
              x: "50%",
              y: "50%",
              scale: 0,
            }}
            animate={{
              x: `${Math.random() * 100}%`,
              y: `${Math.random() * 100}%`,
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 2 + 1,
              ease: "easeOut",
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Número ou GO */}
      <motion.div
        key={count}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 200, 
          damping: 15 
        }}
        className="relative z-10"
      >
        {count > 0 ? (
          <div className="w-64 h-64 rounded-full bg-gradient-to-br from-white/20 via-white/10 to-white/5 flex items-center justify-center shadow-2xl border-8 border-white/30 backdrop-blur-sm">
            <span className="text-9xl font-black text-white drop-shadow-2xl">
              {count}
            </span>
          </div>
        ) : (
          <div className="px-20 py-12 rounded-3xl bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 shadow-2xl border-8 border-white/30">
            <span className="text-9xl font-black text-white drop-shadow-2xl">
              GO!
            </span>
          </div>
        )}
      </motion.div>
    </div>
  );
};
