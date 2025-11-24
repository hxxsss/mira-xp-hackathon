import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { JourneyHeader } from "@/components/journey/JourneyHeader";
import { VideoPlaceholder } from "@/components/journey/VideoPlaceholder";
import { EmotionGrid } from "@/components/journey/EmotionGrid";
import { ContinueButton } from "@/components/journey/ContinueButton";
import { toast } from "sonner";
import { motion } from "framer-motion";
import Confetti from "react-confetti";

interface JourneyStepData {
  id: string;
  step_number: number;
  title: string;
  subtitle: string;
  video_url: string | null;
  question: string;
  options: Array<{
    emoji: string;
    label: string;
    color: string;
  }>;
}

const JourneyStep = () => {
  const { stepNumber } = useParams();
  const navigate = useNavigate();
  const [stepData, setStepData] = useState<JourneyStepData | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = 5;
  const currentStep = Number(stepNumber);

  useEffect(() => {
    loadStepData();
  }, [stepNumber]);

  const loadStepData = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("journey_steps")
        .select("*")
        .eq("step_number", currentStep)
        .single();

      if (error) throw error;
      setStepData(data as unknown as JourneyStepData);
    } catch (error) {
      console.error("Erro ao carregar etapa:", error);
      toast.error("Erro ao carregar a etapa");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = async () => {
    if (selectedOption === null || !stepData) return;

    try {
      setIsSubmitting(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Salvar progresso
      const { error } = await supabase
        .from("user_journey_progress")
        .upsert({
          user_id: user.id,
          step_id: stepData.id,
          selected_option: selectedOption,
        });

      if (error) throw error;

      // Se for a última etapa, desbloquear trilha Mentalidade
      if (currentStep === totalSteps) {
        await unlockMentalidadeTrack(user.id);
        setShowConfetti(true);
        
        setTimeout(() => {
          toast.success("🎉 Jornada completa! Trilha Mentalidade desbloqueada!");
          setTimeout(() => navigate("/dashboard"), 2000);
        }, 500);
      } else {
        // Ir para próxima etapa
        navigate(`/journey/${currentStep + 1}`);
      }
    } catch (error) {
      console.error("Erro ao salvar progresso:", error);
      toast.error("Erro ao salvar progresso");
    } finally {
      setIsSubmitting(false);
    }
  };

  const unlockMentalidadeTrack = async (userId: string) => {
    try {
      // Buscar ID da trilha Mentalidade
      const { data: track } = await supabase
        .from("learning_tracks")
        .select("id")
        .eq("name", "Mentalidade")
        .single();

      if (!track) return;

      // Desbloquear trilha
      await supabase
        .from("user_track_progress")
        .upsert({
          user_id: userId,
          track_id: track.id,
          status: "unlocked",
          unlocked_at: new Date().toISOString(),
        });

      // Desbloquear primeiro módulo da trilha
      const { data: firstModule } = await supabase
        .from("learning_modules")
        .select("id")
        .eq("track_id", track.id)
        .order("order_index")
        .limit(1)
        .single();

      if (firstModule) {
        await supabase
          .from("user_module_progress")
          .upsert({
            user_id: userId,
            module_id: firstModule.id,
            status: "unlocked",
          });
      }
    } catch (error) {
      console.error("Erro ao desbloquear trilha:", error);
    }
  };

  if (isLoading || !stepData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <>
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={500}
        />
      )}
      
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/20">
        <JourneyHeader currentStep={currentStep} totalSteps={totalSteps} />
        
        <div className="pt-24 pb-32 px-6">
          <motion.div
            className="max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Título da Etapa */}
            <motion.h1 
              className="text-3xl md:text-4xl font-bold text-center text-foreground mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {stepData.title}
            </motion.h1>

            {/* Vídeo Placeholder */}
            <div className="mb-8">
              <VideoPlaceholder subtitle={stepData.subtitle} />
            </div>

            {/* Grid de Emoções */}
            <div className="mb-6">
              <EmotionGrid
                question={stepData.question}
                options={stepData.options}
                selectedOption={selectedOption}
                onSelect={setSelectedOption}
              />
            </div>
          </motion.div>
        </div>

        {/* Botão Continuar */}
        <ContinueButton
          disabled={selectedOption === null}
          isLoading={isSubmitting}
          onClick={handleContinue}
        />
      </div>
    </>
  );
};

export default JourneyStep;
