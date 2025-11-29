import { useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ReflectionSentenceSessionProps {
  sentence: string;
  options: string[];
  category?: string;
  sessionIndex: number;
  onComplete: () => void;
}

export const ReflectionSentenceSession = ({
  sentence,
  options,
  category,
  sessionIndex,
  onComplete,
}: ReflectionSentenceSessionProps) => {
  const { moduleId } = useParams();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOptionClick = async (index: number) => {
    if (isSubmitting) return;
    
    setSelectedIndex(index);
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Você precisa estar logado");
        setIsSubmitting(false);
        return;
      }

      // Save the response
      const { error } = await supabase
        .from("user_session_responses")
        .insert({
          user_id: user.id,
          module_id: moduleId,
          session_index: sessionIndex,
          session_type: "reflection_sentence",
          response: {
            selectedOption: options[index],
            selectedIndex: index,
            category: category,
          },
        });

      if (error) throw error;

      // Show positive feedback
      setTimeout(() => {
        onComplete();
      }, 1000);
    } catch (error) {
      console.error("Error saving response:", error);
      toast.error("Erro ao salvar sua resposta");
      setIsSubmitting(false);
      setSelectedIndex(null);
    }
  };

  const renderSentenceWithGap = () => {
    const parts = sentence.split("_");
    
    return (
      <div className="text-2xl md:text-3xl font-bold text-center mb-12 leading-relaxed">
        {parts[0]}
        <span className="inline-block mx-2 px-6 py-2 border-b-4 border-primary min-w-[200px] text-center">
          {selectedIndex !== null ? (
            <span className="text-primary animate-in fade-in duration-300">
              {options[selectedIndex]}
            </span>
          ) : (
            <span className="text-muted-foreground/30">_______</span>
          )}
        </span>
        {parts[1]}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-8">
      <div className="w-full max-w-3xl">
        {renderSentenceWithGap()}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionClick(index)}
              disabled={isSubmitting}
              className={`
                p-6 rounded-xl text-lg font-semibold
                transition-all duration-300 transform
                ${
                  selectedIndex === index
                    ? "bg-primary text-primary-foreground scale-105 shadow-lg"
                    : "bg-card hover:bg-accent hover:scale-105 border-2 border-border"
                }
                ${isSubmitting ? "cursor-not-allowed opacity-50" : "hover:shadow-md"}
              `}
            >
              {option}
            </button>
          ))}
        </div>

        {selectedIndex !== null && (
          <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <p className="text-xl text-primary font-semibold mb-2">
              Obrigado por compartilhar! 🎯
            </p>
            <p className="text-muted-foreground">
              Sua resposta nos ajuda a personalizar sua experiência
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
