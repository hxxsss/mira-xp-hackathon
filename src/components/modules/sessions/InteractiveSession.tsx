import { CompleteSentenceSession } from "./CompleteSentenceSession";
import { CarouselSession } from "./CarouselSession";
import { SelectionSession } from "./SelectionSession";
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
    
    // Futuros tipos de sessões serão adicionados aqui
    // case "multiple_choice":
    //   return <MultipleChoiceSession {...session.data} onComplete={onComplete} />;
    
    default:
      return (
        <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
          Tipo de sessão não suportado: {session.type}
        </div>
      );
  }
};
