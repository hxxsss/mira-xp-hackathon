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
import { SessionNavigator } from '@/components/modules/sessions';
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

      console.log('🔄 [ModulePage] Carregando módulo:', moduleId);

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

      console.log('📦 [ModulePage] Módulo carregado:', {
        id: parsedModule.id,
        title: parsedModule.title,
        contentStructure: parsedModule.content,
        lessonsCount: parsedModule.content?.lessons?.length,
        firstLesson: parsedModule.content?.lessons?.[0]
      });

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
    if (!module || !module.content) return;
    
    // Journey module
    if (module.content.type === 'journey') {
      const totalSteps = module.content.steps?.length || 0;
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
    if (!user || !module?.content) return;

    const totalSteps = module.content.type === 'journey' 
      ? module.content.steps?.length || 0
      : module.content.lessons?.length || 0;
    
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
    const currentLesson = module?.content?.lessons?.[currentLessonIndex];
    
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

      // Verifica se o módulo já foi completado anteriormente
      const { data: existingProgress } = await supabase
        .from('user_module_progress')
        .select('status, completed_at')
        .eq('module_id', moduleId)
        .eq('user_id', user.id)
        .single();

      const isFirstCompletion = existingProgress?.status !== 'completed';

      // Atualiza o progresso do módulo
      await supabase
        .from('user_module_progress')
        .update({ 
          status: 'completed', 
          completed_at: existingProgress?.completed_at || new Date().toISOString(),
          progress_percent: 100,
          quiz_score: quizScore
        })
        .eq('module_id', moduleId)
        .eq('user_id', user.id);

      // Só dá recompensas na primeira vez
      if (isFirstCompletion) {
        // Atualiza XP e pontos do usuário
        const { data: profile } = await supabase
          .from('profiles')
          .select('current_xp, total_xp, weekly_xp, monthly_xp, dream_points')
          .eq('id', user.id)
          .single();

        if (profile) {
          await supabase
            .from('profiles')
            .update({
              current_xp: (profile.current_xp || 0) + (module.xp_reward || 0),
              total_xp: (profile.total_xp || 0) + (module.xp_reward || 0),
              weekly_xp: (profile.weekly_xp || 0) + (module.xp_reward || 0),
              monthly_xp: (profile.monthly_xp || 0) + (module.xp_reward || 0),
              dream_points: (profile.dream_points || 0) + (module.points_reward || 0)
            })
            .eq('id', user.id);
        }

        // Desbloqueia o próximo módulo
        await unlockNextModule(user.id);

        setShowRewardModal(true);
      } else {
        // Modo revisão - apenas mostra toast de conclusão
        toast({
          title: "Revisão Concluída! 📚",
          description: "Você revisou este módulo com sucesso. Nenhum XP adicional foi ganho.",
        });
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Error completing module:", error);
    }
  };

  const unlockNextModule = async (userId: string) => {
    if (!module) return;

    try {
      console.log("Iniciando desbloqueio do próximo módulo...");
      
      // Busca o módulo atual para saber a track_id e order_index
      const { data: currentModule, error: currentModuleError } = await supabase
        .from('learning_modules')
        .select('track_id, order_index')
        .eq('id', moduleId)
        .single();

      if (currentModuleError || !currentModule) {
        console.error("Erro ao buscar módulo atual:", currentModuleError);
        return;
      }

      console.log("Módulo atual:", currentModule);

      // Busca o próximo módulo na mesma trilha (usando maybeSingle para evitar erro)
      const { data: nextModules, error: nextModuleError } = await supabase
        .from('learning_modules')
        .select('id, title, order_index')
        .eq('track_id', currentModule.track_id)
        .gt('order_index', currentModule.order_index)
        .order('order_index', { ascending: true })
        .limit(1);

      if (nextModuleError) {
        console.error("Erro ao buscar próximo módulo:", nextModuleError);
        return;
      }

      const nextModule = nextModules?.[0];

      if (nextModule) {
        console.log("Próximo módulo encontrado:", nextModule);
        
        // Verifica se já existe progresso (usando maybeSingle)
        const { data: existingProgressList } = await supabase
          .from('user_module_progress')
          .select('id, status')
          .eq('module_id', nextModule.id)
          .eq('user_id', userId)
          .limit(1);

        const existingProgress = existingProgressList?.[0];

        if (!existingProgress) {
          console.log("Criando registro de progresso para próximo módulo...");
          const { error: insertError } = await supabase
            .from('user_module_progress')
            .insert({
              user_id: userId,
              module_id: nextModule.id,
              status: 'unlocked'
            });
          
          if (insertError) {
            console.error("Erro ao criar progresso:", insertError);
          } else {
            console.log("Próximo módulo desbloqueado com sucesso!");
          }
        } else if (existingProgress.status === 'locked') {
          console.log("Atualizando status para desbloqueado...");
          const { error: updateError } = await supabase
            .from('user_module_progress')
            .update({ status: 'unlocked' })
            .eq('id', existingProgress.id);
          
          if (updateError) {
            console.error("Erro ao atualizar progresso:", updateError);
          } else {
            console.log("Módulo atualizado para desbloqueado!");
          }
        } else {
          console.log("Módulo já estava desbloqueado:", existingProgress.status);
        }
      } else {
        console.log("Não há próximo módulo na trilha, verificando próxima trilha...");
        await unlockNextTrack(userId, currentModule.track_id);
      }
    } catch (error) {
      console.error("Error unlocking next module:", error);
    }
  };

  const unlockNextTrack = async (userId: string, currentTrackId: string) => {
    try {
      // Verifica se todos os módulos da trilha atual foram completados
      const { data: trackModules } = await supabase
        .from('learning_modules')
        .select('id')
        .eq('track_id', currentTrackId);

      if (!trackModules || trackModules.length === 0) return;

      const moduleIds = trackModules.map(m => m.id);
      
      const { data: completedModules } = await supabase
        .from('user_module_progress')
        .select('module_id')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .in('module_id', moduleIds);

      // Se todos módulos da trilha estão completos
      if (completedModules && completedModules.length >= trackModules.length) {
        // Marca trilha atual como completa
        await supabase
          .from('user_track_progress')
          .update({ 
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('track_id', currentTrackId)
          .eq('user_id', userId);

        // Busca a trilha atual
        const { data: currentTrack } = await supabase
          .from('learning_tracks')
          .select('order_index')
          .eq('id', currentTrackId)
          .single();

        if (!currentTrack) return;

        // Busca a próxima trilha
        const { data: nextTrack } = await supabase
          .from('learning_tracks')
          .select('id')
          .gt('order_index', currentTrack.order_index)
          .order('order_index', { ascending: true })
          .limit(1)
          .single();

        if (nextTrack) {
          // Desbloqueia a próxima trilha
          const { data: existingTrackProgress } = await supabase
            .from('user_track_progress')
            .select('id, status')
            .eq('track_id', nextTrack.id)
            .eq('user_id', userId)
            .single();

          if (!existingTrackProgress) {
            await supabase
              .from('user_track_progress')
              .insert({
                user_id: userId,
                track_id: nextTrack.id,
                status: 'unlocked',
                unlocked_at: new Date().toISOString()
              });
          } else if (existingTrackProgress.status === 'locked') {
            await supabase
              .from('user_track_progress')
              .update({ 
                status: 'unlocked',
                unlocked_at: new Date().toISOString()
              })
              .eq('id', existingTrackProgress.id);
          }

          // Desbloqueia o primeiro módulo da próxima trilha
          const { data: firstModuleNextTrack } = await supabase
            .from('learning_modules')
            .select('id')
            .eq('track_id', nextTrack.id)
            .order('order_index', { ascending: true })
            .limit(1)
            .single();

          if (firstModuleNextTrack) {
            const { data: existingModuleProgress } = await supabase
              .from('user_module_progress')
              .select('id')
              .eq('module_id', firstModuleNextTrack.id)
              .eq('user_id', userId)
              .single();

            if (!existingModuleProgress) {
              await supabase
                .from('user_module_progress')
                .insert({
                  user_id: userId,
                  module_id: firstModuleNextTrack.id,
                  status: 'unlocked'
                });
            }
          }
        }
      }
    } catch (error) {
      console.error("Error unlocking next track:", error);
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
  if (!module.content) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 max-w-md text-center">
          <h2 className="text-xl font-bold mb-4">Conteúdo não disponível</h2>
          <p className="text-gray-600 mb-6">Este módulo não possui conteúdo configurado.</p>
          <Button onClick={() => navigate('/dashboard')}>
            Voltar ao Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const isJourneyModule = module.content.type === 'journey';
  const currentLesson = isJourneyModule 
    ? module.content.steps?.[currentLessonIndex]
    : module.content.lessons?.[currentLessonIndex];
  const totalItems = isJourneyModule 
    ? module.content.steps?.length || 0
    : module.content.lessons?.length || 0;
  const progressPercent = totalItems > 0 ? ((currentLessonIndex + 1) / totalItems) * 100 : 0;

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

              {!currentLesson ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Conteúdo não encontrado.</p>
                  <Button onClick={() => navigate('/dashboard')} className="mt-4">
                    Voltar ao Dashboard
                  </Button>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <div className="text-sm text-gray-500 mb-2">
                      Lição {currentLessonIndex + 1} de {totalItems}
                    </div>
                    <h2 className="text-2xl font-bold mb-4">{currentLesson.title}</h2>
                  </div>

              {/* Video Type */}
              {currentLesson.type === 'video' && (
                <div className="space-y-6">
                  <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
                    <video
                      src={currentLesson.video_url}
                      controls
                      className="w-full h-full object-contain"
                      poster="/placeholder.svg"
                    >
                      Seu navegador não suporta vídeos.
                    </video>
                  </div>
                  {currentLesson.content && (
                    <p className="text-lg text-gray-700 leading-relaxed">{currentLesson.content}</p>
                  )}
                </div>
              )}

              {/* Quiz Slider Type */}
              {currentLesson.type === 'quiz_slider' && (
                <div className="space-y-6">
                  {currentLesson.context && (
                    <p className="text-gray-600 italic">{currentLesson.context}</p>
                  )}
                  <p className="text-lg font-medium">{currentLesson.question}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {currentLesson.options?.map((option: string, idx: number) => (
                      <Button
                        key={idx}
                        variant={selectedJourneyOption === idx ? "default" : "outline"}
                        className="py-4 h-auto"
                        onClick={() => setSelectedJourneyOption(idx)}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                  {selectedJourneyOption !== null && currentLesson.feedback && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-purple-50 rounded-lg border border-purple-200"
                    >
                      <p className="text-purple-800">{currentLesson.feedback}</p>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Fill Blank Type */}
              {currentLesson.type === 'fill_blank' && (
                <div className="space-y-6">
                  <p className="text-lg font-medium">{currentLesson.sentence}</p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {currentLesson.options?.map((option: string, idx: number) => (
                      <Button
                        key={idx}
                        variant={selectedJourneyOption === idx ? "default" : "outline"}
                        className="px-6 py-3"
                        onClick={() => setSelectedJourneyOption(idx)}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                  {selectedJourneyOption !== null && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-lg border ${
                        selectedJourneyOption === currentLesson.correct_answer
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <p className={selectedJourneyOption === currentLesson.correct_answer ? 'text-green-800' : 'text-red-800'}>
                        {selectedJourneyOption === currentLesson.correct_answer 
                          ? '✓ Correto! ' + (currentLesson.justification || '')
                          : '✗ Tente novamente!'}
                      </p>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Icon Selection Type */}
              {currentLesson.type === 'icon_selection' && (
                <div className="space-y-6">
                  {currentLesson.context && (
                    <p className="text-gray-600 italic">{currentLesson.context}</p>
                  )}
                  <p className="text-lg font-medium">{currentLesson.question}</p>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {currentLesson.options?.map((option: { emoji: string; label: string }, idx: number) => (
                      <Button
                        key={idx}
                        variant={selectedJourneyOption === idx ? "default" : "outline"}
                        className="flex flex-col items-center gap-2 py-6 h-auto"
                        onClick={() => setSelectedJourneyOption(idx)}
                      >
                        <span className="text-3xl">{option.emoji}</span>
                        <span className="text-sm">{option.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Info Type */}
              {currentLesson.type === 'info' && (
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-100">
                    <p className="text-lg text-gray-700 leading-relaxed">{currentLesson.content}</p>
                  </div>
                </div>
              )}

              {/* Interactive Sessions Type */}
              {currentLesson.type === 'interactive_sessions' && currentLesson.sessions && (
                <SessionNavigator
                  sessions={currentLesson.sessions}
                  onAllSessionsComplete={() => {
                    // Se é a última lição, completa o módulo
                    if (currentLessonIndex === totalItems - 1) {
                      completeModule(100);
                      setShowConfetti(true);
                    } else {
                      // Avança para próxima lição
                      handleNextLesson();
                    }
                  }}
                />
              )}

              {/* Legacy text type */}
              {currentLesson.type === 'text' && (
                <LessonContent lesson={currentLesson} />
              )}

              {/* Legacy quiz type */}
              {currentLesson.type === 'quiz' && (
                <QuizComponent 
                  key={quizKey}
                  lesson={currentLesson} 
                  onSubmit={handleQuizSubmit}
                  onRetry={handleRetryQuiz}
                />
              )}

              {currentLesson.type !== 'interactive_sessions' && (
                <div className="flex justify-between mt-8">
                  <Button
                    onClick={handlePreviousLesson}
                    disabled={currentLessonIndex === 0}
                    variant="outline"
                  >
                    Anterior
                  </Button>

                  {currentLesson.type !== 'quiz' && (
                    <Button
                      onClick={() => {
                        setSelectedJourneyOption(null);
                        handleNextLesson();
                      }}
                      disabled={currentLessonIndex === totalItems - 1}
                    >
                      {currentLessonIndex === totalItems - 1 ? 'Finalizar' : 'Próxima Lição'}
                    </Button>
                  )}
                </div>
              )}
                </>
              )}
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
