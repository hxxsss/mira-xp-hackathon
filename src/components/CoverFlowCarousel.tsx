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
  trackName: string;
  onItemClick: (id: string, status: string) => void;
}

export function CoverFlowCarousel({ items, trackName, onItemClick }: CoverFlowCarouselProps) {
  // Determina cores baseadas no nome da trilha
  const getTrackColors = () => {
    const name = trackName.toLowerCase();
    if (name.includes('mentalidade')) {
      return {
        badgeBg: '#8B5CF6', // Roxo
        badgeBorder: '#C4B5FD', // Roxo claro
      };
    }
    if (name.includes('organização')) {
      return {
        badgeBg: '#F59E0B', // Laranja/Amarelo
        badgeBorder: '#FDE68A', // Amarelo claro
      };
    }
    if (name.includes('aceleração')) {
      return {
        badgeBg: '#10B981', // Verde
        badgeBorder: '#A7F3D0', // Verde claro
      };
    }
    return {
      badgeBg: '#8B5CF6',
      badgeBorder: '#C4B5FD',
    };
  };
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
          const trackColors = getTrackColors();

          return (
            <CarouselItem 
              key={item.id} 
              className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/3"
            >
              <div className="card-visual p-2 h-full">
                <Card
                  className={cn(
                    "relative bg-white cursor-pointer transition-all duration-300 border-0 shadow-xl pb-8",
                    "rounded-[35px] w-full aspect-[3/4]",
                    isLocked && "cursor-not-allowed opacity-60"
                  )}
                  style={{ fontFamily: "'Nunito', sans-serif" }}
                  onClick={() => !isLocked && item.id !== 'continue-message' && onItemClick(item.id, item.status)}
                >
                  <CardContent className="p-0 h-full flex flex-col relative">
                    {/* Header colorido com curva */}
                    <div 
                      className="relative h-[55%] w-full rounded-t-[35px] flex items-center justify-center overflow-visible"
                      style={{
                        backgroundColor: color,
                        borderBottomLeftRadius: '40px',
                        borderBottomRightRadius: '40px'
                      }}
                    >
                      {/* Status badge no topo */}
                      <div className="absolute top-4 right-4">
                        <Badge
                          className={cn(
                            "text-xs font-bold px-3 py-1",
                            isCompleted && "bg-white/90 border-white/50",
                            isInProgress && "bg-white/90 border-white/50",
                            item.status === 'unlocked' && "bg-white/90 border-white/50 animate-pulse"
                          )}
                          style={{
                            color: color
                          }}
                        >
                          {isCompleted && '✓ COMPLETO'}
                          {isInProgress && '🎯 NOVO'}
                          {item.status === 'unlocked' && '⭐ NOVO'}
                        </Badge>
                      </div>

                      {/* Ícone/Ilustração */}
                      <div className="z-10 -translate-y-2 drop-shadow-lg">
                        {item.number === '01' && <div className="scale-75"><MoneyCircleIcon /></div>}
                        {item.number === '02' && <div className="scale-75"><TargetIcon /></div>}
                        {isLocked && item.number === '03' ? (
                          <div className="scale-75"><LockedIcon /></div>
                        ) : item.number === '03' ? (
                          <div className="text-7xl">{item.icon}</div>
                        ) : (
                          item.number !== '01' && item.number !== '02' && (
                            <div className="text-7xl">{item.icon}</div>
                          )
                        )}
                      </div>
                    </div>

                    {/* Texto */}
                    <div className="px-8 pt-6 pb-8 text-center flex-1 flex flex-col justify-between relative">
                      {/* Badge com número na parte inferior */}
                      <div 
                        className="absolute -left-5 top-1/2 w-12 h-12 rounded-full flex items-center justify-center shadow-md z-20"
                        style={{
                          backgroundColor: trackColors.badgeBg,
                          border: `4px solid ${trackColors.badgeBorder}`
                        }}
                      >
                        <span 
                          className="font-extrabold text-lg text-white"
                        >
                          {item.number}
                        </span>
                      </div>

                      <div>
                        <h2 className="text-indigo-950 font-extrabold text-xl tracking-wide uppercase mb-3">
                          {item.title}
                        </h2>
                        <p className="text-gray-500 text-xs leading-relaxed font-medium line-clamp-3">
                          {item.description}
                        </p>
                      </div>

                      {/* Barra de Progresso */}
                      {item.progress !== undefined && item.progress > 0 && (
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden mt-4">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ 
                              width: `${item.progress}%`,
                              backgroundColor: color
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Botão Amarelo Flutuante */}
                    {item.id !== 'continue-message' && (
                      <button
                        className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 bg-yellow-400 hover:bg-yellow-300 text-indigo-950 font-bold py-3 px-8 rounded-full shadow-lg transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        style={{
                          boxShadow: '0 4px 10px rgba(255, 193, 7, 0.4)'
                        }}
                        disabled={isLocked}
                      >
                        {isCompleted && 'REVISAR'}
                        {isInProgress && 'CONTINUAR'}
                        {item.status === 'unlocked' && 'COMEÇAR'}
                        {isLocked && '🔒 BLOQUEADO'}
                      </button>
                    )}

                    {/* Overlay para cards bloqueados */}
                    {isLocked && (
                      <div className="absolute inset-0 bg-gray-900/60 flex items-center justify-center z-10 rounded-[35px]">
                        <div className="text-center">
                          <div className="text-6xl mb-3">🔒</div>
                          <p className="text-white font-bold text-lg">BLOQUEADO</p>
                          <p className="text-gray-200 text-sm mt-1">
                            Complete o anterior
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
      
      <CarouselPrevious className="-left-12 bg-white shadow-lg hover:bg-gray-50 border-2 border-gray-200" />
      <CarouselNext className="-right-12 bg-white shadow-lg hover:bg-gray-50 border-2 border-gray-200" />
    </Carousel>
  );
}
