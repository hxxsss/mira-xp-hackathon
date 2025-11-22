import React, { useEffect } from "react";
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
import { Play, Lock, CheckCircle2 } from "lucide-react";

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
        // Pega a posição do slide em relação ao viewport
        const slideRect = slideNode.getBoundingClientRect();
        const viewportRect = api.rootNode().getBoundingClientRect();
        
        // Calcula distância do centro
        const centerDiff = Math.abs(
          (slideRect.left + slideRect.width / 2) - 
          (viewportRect.left + viewportRect.width / 2)
        );
        
        // Lógica de Escala: 1 no centro, diminui conforme afasta
        let scale = 1 - Math.min(centerDiff * 0.002, 0.25); // Ajuste 0.002 para sensibilidade
        let opacity = 1 - Math.min(centerDiff * 0.003, 0.5);

        // Aplica no container visual dentro do CarouselItem
        const innerContent = slideNode.querySelector('.card-visual') as HTMLElement;
        if (innerContent) {
          innerContent.style.transform = `scale(${scale})`;
          innerContent.style.opacity = `${opacity}`;
          // Garante transição suave apenas se não estiver arrastando
          innerContent.style.transition = 'transform 0.1s ease-out, opacity 0.1s ease-out';
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
              <div className="card-visual p-2 h-full max-h-[70vh]">
                <Card
                  className={cn(
                    "relative overflow-hidden cursor-pointer transition-all duration-300 aspect-[2/3]",
                    "glass-card-heavy border-2 border-white/20",
                    !isLocked && "hover:scale-105 hover:border-white/40 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]",
                    isLocked && "cursor-not-allowed opacity-60"
                  )}
                  onClick={() => !isLocked && item.id !== 'continue-message' && onItemClick(item.id, item.status)}
                >
                  <CardContent className="flex flex-col items-center justify-between h-full p-6 relative">
                    {/* Header: Badge Status */}
                    <div className="w-full flex justify-between items-start">
                      {!isLocked && (
                        <Badge
                          className={cn(
                            "text-xs font-bold px-3 py-1 rounded-full",
                            isCompleted && "bg-green-500/90 text-white backdrop-blur-sm",
                            isInProgress && "bg-yellow-500/90 text-white backdrop-blur-sm animate-pulse",
                            item.status === 'unlocked' && "bg-blue-500/90 text-white backdrop-blur-sm animate-pulse"
                          )}
                        >
                          {isCompleted && <><CheckCircle2 className="w-3 h-3 inline mr-1" />COMPLETO</>}
                          {isInProgress && '🎯 EM PROGRESSO'}
                          {item.status === 'unlocked' && '✨ NOVO'}
                        </Badge>
                      )}
                      
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-black text-white text-base shadow-lg ring-2 ring-white/30">
                        {isLocked ? <Lock className="w-5 h-5" /> : `#${item.number}`}
                      </div>
                    </div>

                    {/* Centro: Ícone Grande (Fase do Jogo) */}
                    <div className="flex-1 flex flex-col items-center justify-center">
                      <div className="mb-6 relative">
                        {/* Glow effect */}
                        {!isLocked && (
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-500 blur-3xl opacity-40 animate-pulse" />
                        )}
                        
                        <div className="relative">
                          {item.number === '01' && <MoneyCircleIcon />}
                          {item.number === '02' && <TargetIcon />}
                          {isLocked && item.number === '03' ? <LockedIcon /> : item.number === '03' && <div className="text-7xl filter drop-shadow-lg">{item.icon}</div>}
                          {item.number !== '01' && item.number !== '02' && item.number !== '03' && (
                            <div className="text-7xl filter drop-shadow-lg">{isLocked ? '🔒' : item.icon}</div>
                          )}
                        </div>
                      </div>
                      
                      {/* Título da Fase */}
                      <div className="text-center mb-4">
                        <h3 className="text-xl font-black text-white drop-shadow-lg mb-1">
                          {item.title}
                        </h3>
                        <p className="text-sm text-white/80 font-semibold line-clamp-2 px-2">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Footer: Progresso e Botão */}
                    <div className="w-full space-y-3">
                      {/* Barra de Progresso */}
                      {item.progress !== undefined && item.progress > 0 && (
                        <div className="w-full bg-white/20 backdrop-blur-sm rounded-full h-3 overflow-hidden ring-1 ring-white/30">
                          <div
                            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500 shadow-lg"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      )}

                      {/* Botão JOGAR (estilo mobile game) */}
                      {item.id !== 'continue-message' && !isLocked && (
                        <Button
                          className={cn(
                            "w-full font-black text-lg py-6 rounded-2xl transition-all duration-300 shadow-xl",
                            isCompleted && "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 hover:scale-105",
                            isInProgress && "bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 hover:scale-105 animate-pulse",
                            item.status === 'unlocked' && "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 hover:scale-105 animate-pulse"
                          )}
                        >
                          <Play className="w-6 h-6 mr-2 fill-white" />
                          {isCompleted && 'JOGAR NOVAMENTE'}
                          {isInProgress && 'CONTINUAR'}
                          {item.status === 'unlocked' && 'JOGAR'}
                        </Button>
                      )}
                      
                      {isLocked && (
                        <Button
                          className="w-full font-black text-lg py-6 rounded-2xl bg-gray-600/50 text-white/50 cursor-not-allowed"
                          disabled
                        >
                          <Lock className="w-5 h-5 mr-2" />
                          BLOQUEADO
                        </Button>
                      )}
                    </div>

                    {/* Overlay decorativo para locked (sutil, não bloqueia tudo) */}
                    {isLocked && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center pointer-events-none z-10">
                        <div className="text-center">
                          <Lock className="w-16 h-16 text-white/60 mx-auto mb-2" strokeWidth={2} />
                          <p className="text-white/80 font-bold text-sm drop-shadow-lg">
                            Complete o módulo anterior
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      
      <CarouselPrevious className="hidden md:flex -left-12 glass-card-heavy text-white hover:bg-white/30 border-white/30" />
      <CarouselNext className="hidden md:flex -right-12 glass-card-heavy text-white hover:bg-white/30 border-white/30" />
    </Carousel>
  );
}
