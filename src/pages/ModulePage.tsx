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

const ModulePage = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [module, setModule] = useState<Module | null>(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);

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
    if (module && currentLessonIndex < module.content.lessons.length - 1) {
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

    const progressPercent = Math.round(((currentLessonIndex + 1) / module.content.lessons.length) * 100);

    await supabase
      .from('user_module_progress')
      .update({ 
        progress_percent: progressPercent,
        last_accessed_at: new Date().toISOString()
      })
      .eq('module_id', moduleId)
      .eq('user_id', user.id);
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
          title: "Tente novamente",
          description: `Você acertou ${correctAnswers} de ${currentLesson.questions.length}. Tente conseguir pelo menos 60%!`,
          variant: "destructive"
        });
      }
    }
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

  const currentLesson = module.content.lessons[currentLessonIndex];
  const progressPercent = ((currentLessonIndex + 1) / module.content.lessons.length) * 100;

  return (
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
              Lição {currentLessonIndex + 1} de {module.content.lessons.length}
            </div>
            <h2 className="text-2xl font-bold mb-4">{currentLesson.title}</h2>
          </div>

          {currentLesson.type === 'text' ? (
            <LessonContent lesson={currentLesson} />
          ) : (
            <QuizComponent 
              lesson={currentLesson} 
              onSubmit={handleQuizSubmit}
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
                disabled={currentLessonIndex === module.content.lessons.length - 1}
              >
                Próxima Lição
              </Button>
            )}
          </div>
        </Card>
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
  );
};

export default ModulePage;
