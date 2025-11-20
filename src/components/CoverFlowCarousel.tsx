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
        {items.map((item, index) => {
          const isLocked = item.status === 'locked';
          const isCompleted = item.status === 'completed';
          const isInProgress = item.status === 'in_progress';
          const color = item.color || cardColors[index % cardColors.length];

          return (
            <CarouselItem 
              key={item.id} 
              className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/3"
            >
              <div className="card-visual p-2">
                <Card
                  className={cn(
                    "relative overflow-hidden cursor-pointer transition-all duration-300 aspect-[3/4]",
                    "bg-white hover:shadow-[0_0_30px_rgba(0,0,0,0.3)]",
                    isLocked && "cursor-not-allowed"
                  )}
                  onClick={() => !isLocked && onItemClick(item.id, item.status)}
                >
                  <CardContent className="flex flex-col items-center justify-between h-full p-6 relative">
                    {/* Header: Badge e Número */}
                    <div className="w-full flex justify-between items-start">
                      <Badge
                        className={cn(
                          "text-xs font-semibold",
                          isCompleted && "bg-purple-100 text-purple-700 border-purple-200",
                          isInProgress && "bg-purple-500 text-white border-purple-600",
                          item.status === 'unlocked' && "bg-purple-500 text-white animate-pulse border-purple-600"
                        )}
                      >
                        {isCompleted && '✓ COMPLETO'}
                        {isInProgress && '🎯 NOVO'}
                        {item.status === 'unlocked' && '⭐ NOVO'}
                      </Badge>
                      
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-700 text-sm border-2 border-purple-200">
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
                            className="h-full bg-purple-500 rounded-full transition-all duration-500"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      )}

                      <Button
                        className="w-full font-semibold bg-purple-200 text-purple-700 hover:bg-purple-300"
                        disabled={isLocked}
                      >
                        {isCompleted && 'REVISAR'}
                        {isInProgress && 'CONTINUAR'}
                        {item.status === 'unlocked' && 'COMEÇAR'}
                        {isLocked && '🔒 BLOQUEADO'}
                      </Button>
                    </div>

                    {/* Overlay para cards bloqueados */}
                    {isLocked && (
                      <div className="absolute inset-0 bg-gray-900/60 flex items-center justify-center z-10">
                        <div className="text-center">
                          <div className="text-6xl mb-3">🔒</div>
                          <p className="text-purple-600 font-bold text-lg">BLOQUEADO</p>
                          <p className="text-purple-500 text-sm mt-1">
                            Complete de anterior
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
      
      <CarouselPrevious className="hidden md:flex -left-12 bg-white/80 hover:bg-white" />
      <CarouselNext className="hidden md:flex -right-12 bg-white/80 hover:bg-white" />
    </Carousel>
  );
}
