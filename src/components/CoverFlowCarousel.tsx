import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { MoneyCircleIcon, TargetIcon, LockedIcon } from "@/components/modules/ModuleIcons";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CoverFlowItem {
  id: string;
  number: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  status: 'locked' | 'unlocked' | 'in_progress' | 'completed';
  progress?: number;
}

interface CoverFlowCarouselProps {
  items: CoverFlowItem[];
  onItemClick: (id: string, status: string) => void;
}

export function CoverFlowCarousel({ items, onItemClick }: CoverFlowCarouselProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  
  // Limitar visualização: mostrar apenas módulos completos + atual + 2 bloqueados + mensagem
  const visibleItems = React.useMemo(() => {
    const firstUnlockedIndex = items.findIndex(item => 
      item.status === 'unlocked' || item.status === 'in_progress'
    );
    
    if (firstUnlockedIndex === -1) return items;
    
    const visibleEndIndex = firstUnlockedIndex + 3;
    const visibleModules = items.slice(0, visibleEndIndex);
    
    if (visibleEndIndex < items.length) {
      visibleModules.push({
        id: 'continue-message',
        number: '...',
        title: 'Continue para desbloquear',
        description: 'Complete os módulos anteriores',
        icon: '🔒',
        color: '#94a3b8',
        status: 'locked' as const,
        progress: 0
      });
    }
    
    return visibleModules;
  }, [items]);

  useEffect(() => {
    if (!api) return;

    // Sempre inicializa no primeiro card
    api.scrollTo(0, true);
  }, [api, items]);

  useEffect(() => {
    if (!api) return;

    const applyScaleStyle = () => {
      const slideNodes = api.slideNodes();
      
      slideNodes.forEach((slideNode) => {
        const slideRect = slideNode.getBoundingClientRect();
        const viewportRect = api.rootNode().getBoundingClientRect();
        
        const centerDiff = Math.abs(
          (slideRect.left + slideRect.width / 2) - 
          (viewportRect.left + viewportRect.width / 2)
        );
        
        // Efeito 3D Cover Flow: escala + rotação + opacidade
        let scale = 1 - Math.min(centerDiff * 0.0015, 0.3);
        let opacity = 1 - Math.min(centerDiff * 0.002, 0.6);
        let rotateY = Math.min(centerDiff * 0.05, 25); // Rotação 3D
        
        // Determina direção da rotação
        const direction = (slideRect.left + slideRect.width / 2) < (viewportRect.left + viewportRect.width / 2) ? -1 : 1;

        const innerContent = slideNode.querySelector('.card-visual') as HTMLElement;
        if (innerContent) {
          innerContent.style.transform = `scale(${scale}) perspective(1000px) rotateY(${rotateY * direction}deg)`;
          innerContent.style.opacity = `${opacity}`;
          innerContent.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease-out';
        }
      });
    };

    api.on("scroll", applyScaleStyle);
    api.on("reInit", applyScaleStyle);
    applyScaleStyle();

    return () => {
      api.off("scroll", applyScaleStyle);
      api.off("reInit", applyScaleStyle);
    };
  }, [api]);

  const cardColors = [
    '#FF6B6B', // Vermelho coral
    '#FFD93D', // Amarelo
    '#6BCB77', // Verde
    '#4D96FF', // Azul claro
    '#9D4EDD', // Roxo
  ];

  return (
    <Carousel
      opts={{
        align: "center",
        loop: false,
        containScroll: false,
      }}
      setApi={setApi}
      className="w-full max-w-7xl mx-auto"
    >
      <CarouselContent className="-ml-4">
        {visibleItems.map((item, index) => {
          const isLocked = item.status === 'locked';
          const isCompleted = item.status === 'completed';
          const isInProgress = item.status === 'in_progress';
          const color = item.color || cardColors[index % cardColors.length];

          return (
            <CarouselItem 
              key={item.id} 
              className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/3"
            >
              <motion.div 
                className="card-visual p-2 h-full max-h-[70vh]"
                whileHover={{ scale: 1.05, y: -10 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Card
                  className={cn(
                    "relative overflow-hidden cursor-pointer aspect-[2/3]",
                    "glass-card-game border-4 border-white/40",
                    "hover:shadow-[0_0_60px_rgba(124,58,237,0.6),0_20px_40px_rgba(0,0,0,0.3)]",
                    "hover:border-white/60 transition-all duration-300",
                    isLocked && "cursor-not-allowed opacity-70"
                  )}
                  onClick={() => !isLocked && item.id !== 'continue-message' && onItemClick(item.id, item.status)}
                >
                  <CardContent className="flex flex-col items-center justify-between h-full p-6 relative">
                    {/* Animated Background Gradient */}
                    <motion.div 
                      className="absolute inset-0 opacity-20"
                      style={{
                        background: `radial-gradient(circle at 50% 50%, ${color}, transparent 70%)`
                      }}
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.2, 0.3, 0.2],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />

                    {/* Header: Badge e Número */}
                    <div className="w-full flex justify-between items-start relative z-10">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                      >
                        <Badge
                          className={cn(
                            "text-xs font-bold px-3 py-1 shadow-lg",
                            isCompleted && "bg-gradient-to-r from-emerald-400 to-green-500 text-white border-0",
                            isInProgress && "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 animate-pulse",
                            item.status === 'unlocked' && "bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 animate-pulse"
                          )}
                        >
                          {isCompleted && '✓ COMPLETO'}
                          {isInProgress && '🎯 EM PROGRESSO'}
                          {item.status === 'unlocked' && '⭐ NOVO'}
                        </Badge>
                      </motion.div>
                      
                      <motion.div 
                        className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center font-black text-white text-sm shadow-xl ring-4 ring-white/50"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        #{item.number}
                      </motion.div>
                    </div>

                    {/* Centro: Ícone Grande com Animação */}
                    <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                      <motion.div 
                        className="mb-4 relative"
                        animate={{ 
                          y: [0, -10, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        {/* Glow effect */}
                        <div className="absolute inset-0 blur-3xl opacity-50" style={{ backgroundColor: color }} />
                        
                        <div className="relative">
                          {item.number === '01' && <MoneyCircleIcon />}
                          {item.number === '02' && <TargetIcon />}
                          {isLocked && item.number === '03' ? <LockedIcon /> : item.number === '03' && <div className="text-9xl drop-shadow-2xl">{item.icon}</div>}
                          {item.number !== '01' && item.number !== '02' && item.number !== '03' && (
                            <div className="text-9xl drop-shadow-2xl">{item.icon}</div>
                          )}
                        </div>
                      </motion.div>
                      
                      {/* Módulo Label */}
                      <motion.div 
                        className="text-center mb-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <h3 className="text-3xl font-black text-gray-900 tracking-tight">
                          Módulo {item.number}
                        </h3>
                        <h4 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mt-1">
                          {item.title}
                        </h4>
                      </motion.div>
                    </div>

                    {/* Footer: Descrição e Botão */}
                    <div className="w-full space-y-3 relative z-10">
                      <p className="text-sm text-gray-700 font-medium text-center line-clamp-2">
                        {item.description}
                      </p>

                      {/* Barra de Progresso */}
                      {item.progress !== undefined && item.progress > 0 && (
                        <div className="w-full bg-purple-100 rounded-full h-3 overflow-hidden shadow-inner">
                          <motion.div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg"
                            initial={{ width: 0 }}
                            animate={{ width: `${item.progress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                        </div>
                      )}

                      {item.id !== 'continue-message' && (
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            className={cn(
                              "w-full font-black text-lg py-6 rounded-2xl shadow-xl transition-all",
                              isCompleted && "bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700",
                              isInProgress && "bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700 animate-pulse",
                              item.status === 'unlocked' && "bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700",
                              isLocked && "bg-gray-300 text-gray-500"
                            )}
                            disabled={isLocked}
                          >
                            {isCompleted && '✓ REVISAR'}
                            {isInProgress && '▶ CONTINUAR'}
                            {item.status === 'unlocked' && '⚡ COMEÇAR'}
                            {isLocked && '🔒 BLOQUEADO'}
                          </Button>
                        </motion.div>
                      )}
                    </div>

                    {/* Overlay para cards bloqueados */}
                    {isLocked && (
                      <motion.div 
                        className="absolute inset-0 backdrop-blur-md bg-gray-900/70 flex items-center justify-center z-20"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <motion.div 
                          className="text-center"
                          animate={{ 
                            scale: [1, 1.1, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          <div className="text-7xl mb-4 drop-shadow-2xl">🔒</div>
                          <p className="text-white font-black text-2xl drop-shadow-lg">BLOQUEADO</p>
                          <p className="text-purple-300 text-base mt-2 font-semibold">
                            Complete o anterior
                          </p>
                        </motion.div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      
      <CarouselPrevious className="hidden md:flex -left-12 glass-card-game border-2 border-white/40 hover:scale-110 transition-all shadow-2xl" />
      <CarouselNext className="hidden md:flex -right-12 glass-card-game border-2 border-white/40 hover:scale-110 transition-all shadow-2xl" />
    </Carousel>
  );
}
