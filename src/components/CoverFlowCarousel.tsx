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
                    "bg-white rounded-3xl shadow-lg hover:shadow-2xl border-0",
                    isLocked && "cursor-not-allowed opacity-60"
                  )}
                  onClick={() => !isLocked && item.id !== 'continue-message' && onItemClick(item.id, item.status)}
                >
                  <CardContent className="flex flex-col items-center justify-between h-full p-6 relative">
                    {/* Header: Badge e Número */}
                    <div className="w-full flex justify-between items-start">
                      <Badge
                        className={cn(
                          "text-xs font-semibold rounded-2xl px-3 py-1",
                          isCompleted && "bg-green-100 text-green-700 border-0",
                          isInProgress && "bg-purple-100 text-purple-700 border-0",
                          item.status === 'unlocked' && "bg-blue-100 text-blue-700 animate-pulse border-0"
                        )}
                      >
                        {isCompleted && '✓ COMPLETO'}
                        {isInProgress && '⭐ EM PROGRESSO'}
                        {item.status === 'unlocked' && '🎯 NOVO'}
                      </Badge>
                      
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center font-bold text-purple-700 text-sm shadow-sm">
                        #{item.number}
                      </div>
                    </div>

                    {/* Centro: Ícone Grande */}
                    <div className="flex-1 flex flex-col items-center justify-center">
                      <div className="mb-4">
                        {item.number === '01' && <MoneyCircleIcon />}
                        {item.number === '02' && <TargetIcon />}
                        {isLocked && item.number === '03' ? <LockedIcon /> : item.number === '03' && <div className="text-8xl">{item.icon}</div>}
                        {item.number !== '01' && item.number !== '02' && item.number !== '03' && (
                          <div className="text-8xl">{item.icon}</div>
                        )}
                      </div>
                      
                      {/* Módulo Label */}
                      <div className="text-center mb-2">
                        <h3 className="text-2xl font-bold text-gray-900">
                          Módulo {item.number}
                        </h3>
                        <h4 className="text-xl font-semibold text-gray-900 mt-1">
                          {item.title}
                        </h4>
                      </div>
                    </div>

                    {/* Footer: Descrição e Botão */}
                    <div className="w-full space-y-3">
                      <p className="text-sm text-gray-600 text-center line-clamp-2">
                        {item.description}
                      </p>

                      {/* Barra de Progresso */}
                      {item.progress !== undefined && item.progress > 0 && (
                        <div className="w-full bg-purple-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-400 to-purple-500 rounded-full transition-all duration-500 shadow-sm"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      )}

                      {item.id !== 'continue-message' && (
                        <Button
                          className="w-full font-bold rounded-2xl shadow-md bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700 hover:from-purple-200 hover:to-purple-300 border-0"
                          disabled={isLocked}
                        >
                          {isCompleted && '✓ REVISAR'}
                          {isInProgress && '▶ CONTINUAR'}
                          {item.status === 'unlocked' && '🚀 COMEÇAR'}
                          {isLocked && '🔒 BLOQUEADO'}
                        </Button>
                      )}
                    </div>

                    {/* Overlay para cards bloqueados */}
                    {isLocked && (
                      <div className="absolute inset-0 bg-gray-100/90 backdrop-blur-sm flex items-center justify-center z-10 rounded-3xl">
                        <div className="text-center">
                          <div className="text-5xl mb-2">🔒</div>
                          <p className="text-gray-600 font-bold text-base">BLOQUEADO</p>
                          <p className="text-gray-500 text-xs mt-1">
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
      
      <CarouselPrevious className="hidden md:flex -left-12 bg-white rounded-3xl shadow-lg hover:shadow-xl border-0" />
      <CarouselNext className="hidden md:flex -right-12 bg-white rounded-3xl shadow-lg hover:shadow-xl border-0" />
    </Carousel>
  );
}
