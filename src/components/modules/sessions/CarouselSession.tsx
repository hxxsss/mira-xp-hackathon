import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface Slide {
  emoji: string;
  title: string;
  text: string;
}

interface CarouselSessionProps {
  slides: Slide[];
  onComplete: () => void;
}

export const CarouselSession = ({ slides, onComplete }: CarouselSessionProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isLastSlide = currentSlide === slides.length - 1;

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const slideWidth = container.offsetWidth * 0.88; // 88% = largura do card + gap
      const newSlide = Math.round(scrollLeft / slideWidth);
      
      if (newSlide !== currentSlide) {
        setCurrentSlide(newSlide);
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [currentSlide]);

  useEffect(() => {
    // Notifica quando chegar no último slide
    if (isLastSlide) {
      onComplete();
    }
  }, [isLastSlide, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-0 py-8 space-y-8">
      {/* Carrossel de Slides */}
      <div className="w-full overflow-hidden">
        <div
          ref={scrollContainerRef}
          className="flex gap-4 px-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {slides.map((slide, index) => (
            <motion.div
              key={index}
              className="flex-shrink-0 snap-center"
              style={{ width: 'calc(100vw - 3rem)' }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="bg-card rounded-2xl shadow-lg p-8 h-[400px] flex flex-col items-center justify-center space-y-6">
                {/* Emoji/Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 260, 
                    damping: 20,
                    delay: index * 0.1 + 0.2 
                  }}
                  className="text-6xl md:text-7xl"
                >
                  {slide.emoji}
                </motion.div>

                {/* Título */}
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  className="text-2xl md:text-3xl font-bold text-center text-foreground"
                >
                  {slide.title}
                </motion.h3>

                {/* Texto Explicativo */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.4 }}
                  className="text-base md:text-lg text-center text-muted-foreground leading-relaxed max-w-md"
                >
                  {slide.text}
                </motion.p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Indicadores de Paginação (Dots) */}
      <div className="flex items-center justify-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              const container = scrollContainerRef.current;
              if (!container) return;
              const slideWidth = container.offsetWidth * 0.88;
              container.scrollTo({
                left: slideWidth * index,
                behavior: 'smooth',
              });
            }}
            className={`rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'w-8 h-3 bg-primary'
                : 'w-3 h-3 bg-muted hover:bg-muted-foreground/30'
            }`}
            aria-label={`Ir para slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Indicador Visual de "Deslize" - Aparece apenas no primeiro slide */}
      {currentSlide === 0 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <span>Deslize para o lado</span>
          <motion.span
            animate={{ x: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            👉
          </motion.span>
        </motion.div>
      )}

      {/* Feedback quando chegar no último slide */}
      {isLastSlide && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center gap-2 px-6 py-3 bg-success/10 border-2 border-success rounded-xl text-success font-semibold"
        >
          ✓ Pronto para continuar!
        </motion.div>
      )}
    </div>
  );
};
