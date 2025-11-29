import React, { useEffect, useCallback } from "react";
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

export interface CoverFlowItem {
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
  const [api, setApi] = React.useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [hasInitialized, setHasInitialized] = React.useState(false);

  // Cores baseadas na trilha
  const getTrackColors = useCallback(() => {
    const name = trackName.toLowerCase();
    if (name.includes('mentalidade')) {
      return { badgeBg: '#8B5CF6', badgeBorder: '#C4B5FD', cardColor: '#8B5CF6' };
    }
    if (name.includes('organização')) {
      return { badgeBg: '#F59E0B', badgeBorder: '#FDE68A', cardColor: '#F59E0B' };
    }
    if (name.includes('aceleração')) {
      return { badgeBg: '#10B981', badgeBorder: '#A7F3D0', cardColor: '#10B981' };
    }
    return { badgeBg: '#8B5CF6', badgeBorder: '#C4B5FD', cardColor: '#8B5CF6' };
  }, [trackName]);

  // REGRA 1: Encontra o índice do card ATUAL (primeiro unlocked/in_progress)
  const findCurrentCardIndex = useCallback(() => {
    // Prioridade: in_progress > unlocked > último completed
    const inProgressIdx = items.findIndex(item => item.status === 'in_progress');
    if (inProgressIdx !== -1) return inProgressIdx;

    const unlockedIdx = items.findIndex(item => item.status === 'unlocked');
    if (unlockedIdx !== -1) return unlockedIdx;

    // Se todos completados, último completado
    for (let i = items.length - 1; i >= 0; i--) {
      if (items[i].status === 'completed') return i;
    }

    return 0;
  }, [items]);

  // Mostra todos os módulos reais
  const visibleItems = React.useMemo(() => {
    return items;
  }, [items]);

  // REGRA 1: Inicialização - scroll automático para o card atual
  useEffect(() => {
    if (!api || hasInitialized) return;

    const targetIndex = Math.min(findCurrentCardIndex(), visibleItems.length - 1);
    
    const timer = setTimeout(() => {
      api.scrollTo(targetIndex, false); // false = sem animação na inicialização
      setHasInitialized(true);
    }, 50);

    return () => clearTimeout(timer);
  }, [api, findCurrentCardIndex, visibleItems.length, hasInitialized]);

  // Removed automatic reset to prevent carousel from jumping back on data reload

  // Atualiza selectedIndex ao navegar
  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setSelectedIndex(api.selectedScrollSnap());
    };

    api.on("select", onSelect);
    onSelect();

    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  // Efeito de escala/opacidade no scroll
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

        const scale = 1 - Math.min(centerDiff * 0.002, 0.25);
        const opacity = 1 - Math.min(centerDiff * 0.003, 0.5);

        const innerContent = slideNode.querySelector('.card-visual') as HTMLElement;
        if (innerContent) {
          innerContent.style.transform = `scale(${scale})`;
          innerContent.style.opacity = `${opacity}`;
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

  // REGRA 4: Estado visual
  const getButtonText = (status: string) => {
    switch (status) {
      case 'completed': return 'REVISAR'; // REGRA 3: Modo revisão
      case 'in_progress': return 'CONTINUAR';
      case 'unlocked': return 'COMEÇAR';
      case 'locked': return '🔒 BLOQUEADO';
      default: return 'INICIAR';
    }
  };

  const trackColors = getTrackColors();

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
          const isUnlocked = item.status === 'unlocked';
          const isCenterCard = index === selectedIndex;
          const isClickable = !isLocked && isCenterCard;

          return (
            <CarouselItem
              key={item.id}
              className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/3"
            >
              <div className="card-visual p-2 pb-8 h-full">
                <Card
                  className={cn(
                    "relative bg-white transition-all duration-300 border-0 shadow-xl pb-8",
                    "rounded-[35px] w-full aspect-[3/4] max-h-[350px] md:max-h-[400px] lg:max-h-[450px]",
                    isClickable && "cursor-pointer hover:shadow-2xl",
                    isLocked && "cursor-not-allowed opacity-60",
                    !isCenterCard && !isLocked && "opacity-70"
                  )}
                  style={{ fontFamily: "'Nunito', sans-serif" }}
                  onClick={() => isClickable && onItemClick(item.id, item.status)}
                >
                  <CardContent className="p-0 h-full flex flex-col relative">
                    {/* Header colorido */}
                    <div
                      className="relative h-[55%] w-full rounded-t-[35px] flex items-center justify-center overflow-visible"
                      style={{
                        backgroundColor: trackColors.cardColor,
                        borderBottomLeftRadius: '40px',
                        borderBottomRightRadius: '40px'
                      }}
                    >
                      <div className="z-10 -translate-y-2 drop-shadow-lg">
                        {isLocked ? (
                          <div className="text-7xl">🔒</div>
                        ) : isCompleted ? (
                          <div className="relative">
                            <div className="text-7xl">{item.icon}</div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-lg">✓</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-7xl">{item.icon}</div>
                        )}
                      </div>
                    </div>

                    {/* Conteúdo */}
                    <div className="px-8 pt-6 pb-8 text-center flex-1 flex flex-col justify-between relative">
                      {/* Badge número */}
                      <div
                        className="absolute -left-5 top-1/2 w-12 h-12 rounded-full flex items-center justify-center shadow-md z-20"
                        style={{
                          backgroundColor: trackColors.badgeBg,
                          border: `4px solid ${trackColors.badgeBorder}`
                        }}
                      >
                        <span className="font-extrabold text-lg text-white">
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
                      {item.progress !== undefined && item.progress > 0 && !isCompleted && (
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden mt-4">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${item.progress}%`,
                              backgroundColor: trackColors.cardColor
                            }}
                          />
                        </div>
                      )}

                      {/* Badge de completado */}
                      {isCompleted && (
                        <div className="mt-4 flex items-center justify-center gap-1 text-green-600 font-semibold text-sm">
                          <span>✓</span>
                          <span>Concluído</span>
                        </div>
                      )}
                    </div>

                    {/* Botão de ação */}
                    <button
                        className={cn(
                          "absolute -bottom-6 left-1/2 transform -translate-x-1/2 font-bold py-3 px-8 rounded-full shadow-lg transition-all text-sm whitespace-nowrap",
                          isLocked || !isCenterCard
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : isCompleted
                            ? "bg-green-400 hover:bg-green-300 text-green-900"
                            : "bg-yellow-400 hover:bg-yellow-300 text-indigo-950"
                        )}
                        style={{
                          boxShadow: isLocked || !isCenterCard
                            ? 'none'
                            : isCompleted
                            ? '0 4px 10px rgba(34, 197, 94, 0.4)'
                            : '0 4px 10px rgba(255, 193, 7, 0.4)'
                        }}
                        disabled={isLocked || !isCenterCard}
                      >
                        {getButtonText(item.status)}
                      </button>

                    {/* Overlay para bloqueados */}
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
