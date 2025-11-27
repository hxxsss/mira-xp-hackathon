import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface CountdownAnimationProps {
  onComplete: () => void;
}

export const CountdownAnimation = ({ onComplete }: CountdownAnimationProps) => {
  const [count, setCount] = useState(3);
  const [showGo, setShowGo] = useState(false);

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => {
        setCount(count - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setShowGo(true);
      const goTimer = setTimeout(() => {
        onComplete();
      }, 800);
      return () => clearTimeout(goTimer);
    }
  }, [count, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center battle-gradient">
      {/* Animated background particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary/40 rounded-full"
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

      <AnimatePresence mode="wait">
        {!showGo ? (
          <motion.div
            key={count}
            initial={{ scale: 0, opacity: 0, rotate: -180 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0, rotate: 180 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 10 
            }}
            className="relative"
          >
            {/* Glow effect */}
            <motion.div
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
              }}
              className="absolute inset-0 bg-primary/30 rounded-full blur-3xl"
            />
            
            {/* Number */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                repeatDelay: 0.5,
              }}
              className="relative z-10 w-64 h-64 rounded-full bg-gradient-to-br from-primary via-secondary to-primary flex items-center justify-center shadow-2xl border-8 border-white/20"
            >
              <span className="text-9xl font-black text-white drop-shadow-2xl">
                {count}
              </span>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="go"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.2, 1], opacity: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 15 
            }}
            className="relative"
          >
            {/* Explosion effect */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-4 h-4 bg-yellow-400 rounded-full"
                initial={{ 
                  x: 0,
                  y: 0,
                  scale: 1,
                }}
                animate={{
                  x: Math.cos((i * Math.PI * 2) / 20) * 200,
                  y: Math.sin((i * Math.PI * 2) / 20) * 200,
                  scale: [1, 0],
                  opacity: [1, 0],
                }}
                transition={{
                  duration: 0.8,
                  ease: "easeOut",
                }}
                style={{
                  left: '50%',
                  top: '50%',
                }}
              />
            ))}
            
            {/* GO text */}
            <motion.div
              animate={{
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 0.3,
                repeat: 2,
              }}
              className="relative z-10 px-20 py-12 rounded-3xl bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 shadow-2xl border-8 border-white/30"
            >
              <span className="text-9xl font-black text-white drop-shadow-2xl">
                GO!
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
