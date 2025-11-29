import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselApi,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";

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
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [canAdvance, setCanAdvance] = useState(false);
  const isLastSlide = current === count - 1;

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
      setCanAdvance(false); // Reset quando muda de slide
    });
  }, [api]);

  // Tempo mínimo de 3 segundos em cada slide antes de poder avançar
  useEffect(() => {
    const timer = setTimeout(() => {
      setCanAdvance(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [current]);

  useEffect(() => {
    // Notifica quando chegar no último slide E tiver passado o tempo mínimo
    if (isLastSlide && count > 0 && canAdvance) {
      onComplete();
    }
  }, [isLastSlide, count, canAdvance, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-8 space-y-8">
      {/* Carrossel de Slides */}
      <Carousel 
        setApi={setApi} 
        className="w-full max-w-2xl"
        opts={{
          align: "start",
        }}
      >
        <CarouselContent className="-ml-4">
          {slides.map((slide, index) => (
            <CarouselItem key={index} className="pl-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-2">
                  <CardContent className="flex flex-col items-center justify-center p-8 min-h-[400px] space-y-6">
                    {/* Emoji/Icon */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 260, 
                        damping: 20,
                        delay: 0.2 
                      }}
                      className="text-6xl md:text-7xl"
                    >
                      {slide.emoji}
                    </motion.div>

                    {/* Título */}
                    <motion.h3
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-2xl md:text-3xl font-bold text-center text-foreground"
                    >
                      {slide.title}
                    </motion.h3>

                    {/* Texto Explicativo */}
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-base md:text-lg text-center text-muted-foreground leading-relaxed"
                    >
                      {slide.text}
                    </motion.p>
                  </CardContent>
                </Card>
              </motion.div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="-left-12" disabled={current === 0} />
        <CarouselNext className="-right-12" disabled={!canAdvance} />
      </Carousel>

      {/* Indicadores de Paginação (Dots) */}
      <div className="flex items-center justify-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => api?.scrollTo(index)}
            className={`rounded-full transition-all duration-300 ${
              index === current
                ? 'w-8 h-3 bg-primary'
                : 'w-3 h-3 bg-muted hover:bg-muted-foreground/30'
            }`}
            aria-label={`Ir para slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Texto indicador */}
      <p className="text-center text-sm text-muted-foreground">
        Slide {current + 1} de {count}
      </p>

      {/* Feedback quando chegar no último slide */}
      {isLastSlide && count > 0 && canAdvance && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center gap-2 px-6 py-3 bg-success/10 border-2 border-success rounded-xl text-success font-semibold"
        >
          ✓ Pronto para continuar!
        </motion.div>
      )}
      
      {/* Indicador de tempo mínimo */}
      {!canAdvance && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-muted-foreground"
        >
          Leia com atenção...
        </motion.div>
      )}
    </div>
  );
};
