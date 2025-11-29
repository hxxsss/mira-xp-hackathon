import { CompleteSentenceSession } from "./CompleteSentenceSession";
import { CarouselSession } from "./CarouselSession";
import { SelectionSession } from "./SelectionSession";
import { CuriosityCardSession } from "./CuriosityCardSession";
import { AudioPlayerSession } from "./AudioPlayerSession";
import { ProgressiveTextSession } from "./ProgressiveTextSession";
import { SwipeGameSession } from "./SwipeGameSession";
import { DragDropSession } from "./DragDropSession";
import { DualSliderSession } from "./DualSliderSession";
import { SessionData } from "./types";

interface InteractiveSessionProps {
  session: SessionData;
  onComplete: () => void;
}

export const InteractiveSession = ({ session, onComplete }: InteractiveSessionProps) => {
  switch (session.type) {
    case "complete_sentence":
      return (
        <CompleteSentenceSession
          sentence={session.data.sentence}
          options={session.data.options}
          correctIndex={session.data.correctIndex}
          onComplete={onComplete}
        />
      );
    
    case "carousel":
      return (
        <CarouselSession
          slides={session.data.slides}
          onComplete={onComplete}
        />
      );
    
    case "selection":
      return (
        <SelectionSession
          mode={session.data.mode}
          question={session.data.question}
          options={session.data.options}
          correctIndex={session.data.correctIndex}
          onComplete={onComplete}
        />
      );
    
    case "curiosity_card":
      return (
        <CuriosityCardSession
          cards={session.data.cards}
          onComplete={onComplete}
        />
      );
    
    case "audio_player":
      return (
        <AudioPlayerSession
          title={session.data.title}
          subtitle={session.data.subtitle}
          audioUrl={session.data.audioUrl}
          transcript={session.data.transcript}
          onComplete={onComplete}
        />
      );
    
    case "progressive_text":
      return (
        <ProgressiveTextSession
          blocks={session.data.blocks}
          title={session.data.title}
          onComplete={onComplete}
        />
      );
    
    case "swipe_game":
      return (
        <SwipeGameSession
          cards={session.data.cards}
          onComplete={onComplete}
        />
      );
    
    case "drag_drop":
      return (
        <DragDropSession
          title={session.data.title}
          zones={session.data.zones}
          items={session.data.items}
          onComplete={onComplete}
        />
      );
    
    case "dual_slider":
      return (
        <DualSliderSession
          sliders={session.data.sliders}
          onComplete={onComplete}
        />
      );
    
    default:
      return (
        <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
          Tipo de sessão não suportado
        </div>
      );
  }
};
