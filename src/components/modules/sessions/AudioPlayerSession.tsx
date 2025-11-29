import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface AudioPlayerSessionProps {
  title: string;
  subtitle?: string;
  audioUrl: string;
  transcript: string;
  onComplete: () => void;
}

export const AudioPlayerSession = ({
  title,
  subtitle = "Com Mira",
  audioUrl,
  transcript,
  onComplete,
}: AudioPlayerSessionProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const [hasListened, setHasListened] = useState(false);
  const [hasCompletedOnce, setHasCompletedOnce] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      setHasListened(true);
      setHasCompletedOnce(true);
      onComplete();
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [onComplete]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!hasCompletedOnce) return; // Bloqueia interação até completar
    
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-card rounded-2xl border-2 border-border shadow-lg p-6 md:p-8 space-y-6">
          {/* Informações do Áudio */}
          <div className="text-center space-y-1">
            <h3 className="text-xl md:text-2xl font-bold text-foreground">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>

          {/* Waveform Visual (Animação Simples) */}
          <div className="flex items-center justify-center gap-1 h-16">
            {[...Array(40)].map((_, i) => (
              <motion.div
                key={i}
                className={cn(
                  "w-1 rounded-full",
                  isPlaying ? "bg-primary" : "bg-muted"
                )}
                animate={isPlaying ? {
                  height: [
                    Math.random() * 40 + 20,
                    Math.random() * 50 + 30,
                    Math.random() * 40 + 20,
                  ],
                  transition: {
                    duration: 0.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.05,
                  }
                } : {
                  height: 20
                }}
              />
            ))}
          </div>

          {/* Controles */}
          <div className="space-y-4">
            {/* Play/Pause Button + Barra de Progresso */}
            <div className="flex items-center gap-4">
              {/* Botão Play/Pause */}
              <Button
                size="icon"
                onClick={togglePlay}
                className="h-14 w-14 rounded-full shrink-0"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-1" />
                )}
              </Button>

              {/* Barra de Progresso */}
              <div className="flex-1 space-y-2">
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleProgressChange}
                    disabled={!hasCompletedOnce}
                    className={cn(
                      "w-full h-2 bg-muted rounded-full appearance-none transition-opacity",
                      hasCompletedOnce ? "cursor-pointer" : "cursor-not-allowed opacity-50",
                      "[&::-webkit-slider-thumb]:appearance-none",
                      "[&::-webkit-slider-thumb]:w-4",
                      "[&::-webkit-slider-thumb]:h-4",
                      "[&::-webkit-slider-thumb]:rounded-full",
                      "[&::-webkit-slider-thumb]:bg-primary",
                      hasCompletedOnce ? "[&::-webkit-slider-thumb]:cursor-pointer" : "[&::-webkit-slider-thumb]:cursor-not-allowed",
                      "[&::-moz-range-thumb]:w-4",
                      "[&::-moz-range-thumb]:h-4",
                      "[&::-moz-range-thumb]:rounded-full",
                      "[&::-moz-range-thumb]:bg-primary",
                      "[&::-moz-range-thumb]:border-0",
                      hasCompletedOnce ? "[&::-moz-range-thumb]:cursor-pointer" : "[&::-moz-range-thumb]:cursor-not-allowed"
                    )}
                    style={{
                      background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${progress}%, hsl(var(--muted)) ${progress}%, hsl(var(--muted)) 100%)`
                    }}
                  />
                </div>

                {/* Timestamps */}
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Botão Ver Transcrição */}
          <Collapsible open={isTranscriptOpen} onOpenChange={setIsTranscriptOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                {isTranscriptOpen ? "Ocultar Transcrição" : "Ver Transcrição"}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 bg-muted/50 rounded-xl border border-border"
              >
                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                  {transcript}
                </p>
              </motion.div>
            </CollapsibleContent>
          </Collapsible>

          {/* Indicador de Conclusão */}
          <AnimatePresence>
            {hasListened && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-2 text-success text-sm font-medium"
              >
                <div className="w-5 h-5 bg-success rounded-full flex items-center justify-center text-success-foreground text-xs">
                  ✓
                </div>
                Áudio completado!
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Elemento de Áudio */}
        <audio ref={audioRef} src={audioUrl} preload="metadata" />
      </motion.div>
    </div>
  );
};
