import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft } from 'lucide-react';
import { LessonContent } from '@/components/modules/LessonContent';
import { QuizComponent } from '@/components/modules/QuizComponent';
import { RewardModal } from '@/components/modules/RewardModal';
import { useToast } from '@/hooks/use-toast';
import { VideoPlaceholder } from '@/components/journey/VideoPlaceholder';
import { EmotionGrid } from '@/components/journey/EmotionGrid';
import { SliderInput } from '@/components/journey/SliderInput';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';

interface Lesson {
  id: number;
  title: string;
  type: 'text' | 'quiz';
  content?: string;
  illustration?: string;
  questions?: Array<{
    question: string;
    options: string[];
    correct: number;
  }>;
}

interface Module {
  id: string;
  number: string;
  title: string;
  description: string;
  icon: string;
  xp_reward: number;
  points_reward: number;
  content: any;
}

interface JourneyStep {
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

const ModulePage = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [module, setModule] = useState<Module | null>(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizKey, setQuizKey] = useState(0);
  const [selectedJourneyOption, setSelectedJourneyOption] = useState<number | null>(null);
  const [isSubmittingJourney, setIsSubmittingJourney] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    loadModule();
  }, [moduleId]);

  const loadModule = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/login");
        return;
      }

      const { data: moduleData, error } = await supabase
        .from('learning_modules')
        .select('*')
        .eq('id', moduleId)
        .single();

      if (error) throw error;

      // Parse content if it's a string
      const parsedModule = {
        ...moduleData,
        content: typeof moduleData.content === 'string' 
          ? JSON.parse(moduleData.content) 
          : moduleData.content
      };

      setModule(parsedModule);

      // Update status to in_progress if not already
      await supabase
        .from('user_module_progress')
        .update({ 
          status: 'in_progress', 
          started_at: new Date().toISOString(),
          last_accessed_at: new Date().toISOString()
        })
        .eq('module_id', moduleId)
        .eq('user_id', user.id);

    } catch (error) {
      console.error("Error loading module:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o módulo",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNextLesson = () => {
    if (!module) return;
    
    // Journey module
    if (module.content.type === 'journey') {
      const totalSteps = module.content.steps.length;
      if (currentLessonIndex < totalSteps - 1) {
        setCurrentLessonIndex(currentLessonIndex + 1);
        setSelectedJourneyOption(null);
        updateProgress();
      }
      return;
    }
    
    // Regular module
    if (currentLessonIndex < module.content.lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
      updateProgress();
    }
  };

  const handlePreviousLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    }
  };

  const updateProgress = async () => {
    if (!module) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const totalSteps = module.content.type === 'journey' 
      ? module.content.steps.length 
      : module.content.lessons.length;
    
    const progressPercent = Math.round(((currentLessonIndex + 1) / totalSteps) * 100);

    await supabase
      .from('user_module_progress')
      .update({ 
        progress_percent: progressPercent,
        last_accessed_at: new Date().toISOString()
      })
      .eq('module_id', moduleId)
      .eq('user_id', user.id);
  };
  
  const handleJourneyContinue = async () => {
    if (selectedJourneyOption === null || !module) return;
    
    try {
      setIsSubmittingJourney(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro de autenticação",
          description: "Usuário não autenticado",
          variant: "destructive"
        });
        return;
      }

      const currentStep = module.content.steps[currentLessonIndex];
      
      console.log("Salvando progresso da jornada:", {
        user_id: user.id,
        step_id: currentStep.id,
        selected_option: selectedJourneyOption
      });

      // Salvar progresso da etapa
      const { error } = await supabase
        .from("user_journey_progress")
        .upsert({
          user_id: user.id,
          step_id: currentStep.id,
          selected_option: selectedJourneyOption,
        }, {
          onConflict: 'user_id,step_id'
        });

      if (error) {
        console.error("Erro ao salvar progresso:", error);
        toast({
          title: "Erro ao salvar",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }

      // Se for a última etapa, completar módulo
      if (currentLessonIndex === module.content.steps.length - 1) {
        await completeModule(100);
        setShowConfetti(true);
      } else {
        // Ir para próxima etapa
        handleNextLesson();
      }
    } catch (error) {
      console.error("Erro no fluxo da jornada:", error);
    } finally {
      setIsSubmittingJourney(false);
    }
  };

  const handleQuizSubmit = async (answers: number[]) => {
    setQuizAnswers(answers);
    const currentLesson = module?.content.lessons[currentLessonIndex];
    
    if (currentLesson?.type === 'quiz' && currentLesson.questions) {
      const correctAnswers = currentLesson.questions.filter(
        (q, index) => q.correct === answers[index]
      ).length;
      
      const score = Math.round((correctAnswers / currentLesson.questions.length) * 100);
      
      if (score >= 60) {
        await completeModule(score);
      } else {
        toast({
          title: "Continue tentando! 💪",
          description: `Você acertou ${correctAnswers} de ${currentLesson.questions.length}. Revise o conteúdo e tente novamente!`,
        });
      }
    }
  };

  const handleRetryQuiz = () => {
    setQuizKey(prev => prev + 1);
    setQuizAnswers([]);
  };

  const completeModule = async (quizScore: number) => {
    if (!module) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('user_module_progress')
        .update({ 
          status: 'completed', 
          completed_at: new Date().toISOString(),
          progress_percent: 100,
          quiz_score: quizScore
        })
        .eq('module_id', moduleId)
        .eq('user_id', user.id);

      setShowRewardModal(true);
    } catch (error) {
      console.error("Error completing module:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#7C3AED] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-[#7C3AED] flex items-center justify-center">
        <Card className="p-6">
          <p>Módulo não encontrado</p>
          <Button onClick={() => navigate('/dashboard')} className="mt-4">
            Voltar ao Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  // Check if it's a journey module
  const isJourneyModule = module.content.type === 'journey';
  const currentLesson = isJourneyModule 
    ? module.content.steps[currentLessonIndex]
    : module.content.lessons[currentLessonIndex];
  const totalItems = isJourneyModule 
    ? module.content.steps.length 
    : module.content.lessons.length;
  const progressPercent = ((currentLessonIndex + 1) / totalItems) * 100;

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
      
      <div className="min-h-screen bg-[#7C3AED] p-6">
        <div className="max-w-4xl mx-auto">
          <Button 
            onClick={() => navigate('/dashboard')} 
            variant="ghost" 
            className="text-white hover:bg-white/20 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>

          {isJourneyModule ? (
            /* Journey Module Rendering */
            <div className="bg-gradient-to-br from-purple-50 via-white to-purple-50 rounded-3xl p-8 shadow-2xl">
              {/* Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="text-6xl">{module.icon}</div>
                <div className="flex-1">
                  <div className="text-sm text-gray-500 mb-1">Módulo {module.number}</div>
                  <h1 className="text-3xl font-bold">{module.title}</h1>
                </div>
              </div>

              <Progress value={progressPercent} className="mb-6" />

              <div className="mb-6">
                <div className="text-sm text-gray-500 mb-2">
                  Etapa {currentLessonIndex + 1} de {totalItems}
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.h2 
                  className="text-3xl md:text-4xl font-bold text-center mb-8"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {currentLesson.title}
                </motion.h2>

                <div className="mb-8">
                  <VideoPlaceholder subtitle={currentLesson.subtitle} />
                </div>

                <div className="mb-6">
                  {currentLesson.input_type === 'slider' ? (
                    <SliderInput
                      question={currentLesson.question}
                      minLabel={currentLesson.slider_config?.min_label || "Mínimo"}
                      maxLabel={currentLesson.slider_config?.max_label || "Máximo"}
                      value={selectedJourneyOption}
                      onChange={setSelectedJourneyOption}
                    />
                  ) : (
                    <EmotionGrid
                      question={currentLesson.question}
                      options={currentLesson.options}
                      selectedOption={selectedJourneyOption}
                      onSelect={setSelectedJourneyOption}
                    />
                  )}
                </div>

                <div className="flex justify-between mt-8">
                  <Button
                    onClick={handlePreviousLesson}
                    disabled={currentLessonIndex === 0}
                    variant="outline"
                  >
                    Anterior
                  </Button>

                  <Button
                    onClick={handleJourneyContinue}
                    disabled={selectedJourneyOption === null || isSubmittingJourney}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isSubmittingJourney ? "Salvando..." : 
                     currentLessonIndex === totalItems - 1 ? "Finalizar" : "Continuar"}
                  </Button>
                </div>
              </motion.div>
            </div>
          ) : (
            /* Regular Module Rendering */
            <Card className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-6xl">{module.icon}</div>
                <div className="flex-1">
                  <div className="text-sm text-gray-500 mb-1">Módulo {module.number}</div>
                  <h1 className="text-3xl font-bold">{module.title}</h1>
                </div>
              </div>

              <Progress value={progressPercent} className="mb-6" />

              <div className="mb-6">
                <div className="text-sm text-gray-500 mb-2">
                  Lição {currentLessonIndex + 1} de {totalItems}
                </div>
                <h2 className="text-2xl font-bold mb-4">{currentLesson.title}</h2>
              </div>

              {currentLesson.type === 'text' ? (
                <LessonContent lesson={currentLesson} />
              ) : (
                <QuizComponent 
                  key={quizKey}
                  lesson={currentLesson} 
                  onSubmit={handleQuizSubmit}
                  onRetry={handleRetryQuiz}
                />
              )}

              <div className="flex justify-between mt-8">
                <Button
                  onClick={handlePreviousLesson}
                  disabled={currentLessonIndex === 0}
                  variant="outline"
                >
                  Anterior
                </Button>

                {currentLesson.type === 'text' && (
                  <Button
                    onClick={handleNextLesson}
                    disabled={currentLessonIndex === totalItems - 1}
                  >
                    Próxima Lição
                  </Button>
                )}
              </div>
            </Card>
          )}
        </div>

        {module && (
          <RewardModal
            open={showRewardModal}
            onClose={() => {
              setShowRewardModal(false);
              navigate('/dashboard');
            }}
            xpReward={module.xp_reward}
            pointsReward={module.points_reward}
            moduleTitle={module.title}
          />
        )}
      </div>
    </>
  );
};

export default ModulePage;
