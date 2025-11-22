import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Zap, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface MatchGameProps {
  match: any;
  userId: string;
  onComplete: () => void;
}

export const MatchGame = ({ match, userId, onComplete }: MatchGameProps) => {
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [startTime, setStartTime] = useState(Date.now());
  const [answers, setAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const questions = match.questions_data || [];
  const totalQuestions = questions.length;
  const progress = (currentQuestion / totalQuestions) * 100;

  useEffect(() => {
    setStartTime(Date.now());
  }, [currentQuestion]);

  const calculatePoints = (isCorrect: boolean, timeSeconds: number) => {
    if (!isCorrect) return 0;
    const basePoints = 100;
    const speedBonus = Math.floor(100 * (1 - Math.min(timeSeconds / 30, 1)));
    return basePoints + speedBonus;
  };

  const handleAnswer = async () => {
    if (selectedAnswer === null) return;

    setLoading(true);
    const timeSeconds = (Date.now() - startTime) / 1000;
    const question = questions[currentQuestion];
    const isCorrect = selectedAnswer === question.correct;
    const points = calculatePoints(isCorrect, timeSeconds);

    try {
      // Salvar resposta
      const { error } = await supabase
        .from('pvp_match_answers')
        .insert({
          match_id: match.id,
          user_id: userId,
          question_index: currentQuestion,
          selected_answer: selectedAnswer,
          is_correct: isCorrect,
          time_taken_seconds: timeSeconds,
          points_earned: points,
        });

      if (error) throw error;

      const newAnswers = [...answers, { isCorrect, points }];
      setAnswers(newAnswers);

      // Próxima pergunta ou finalizar
      if (currentQuestion < totalQuestions - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        toast({
          title: "Partida concluída!",
          description: "Aguardando resultado...",
        });
        onComplete();
      }
    } catch (error: any) {
      console.error('Error submitting answer:', error);
      toast({
        title: "Erro ao enviar resposta",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (currentQuestion >= totalQuestions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background flex items-center justify-center p-4">
        <Card className="w-full max-w-lg text-center">
          <CardContent className="pt-6">
            <Trophy className="h-16 w-16 text-primary mx-auto mb-4 animate-bounce" />
            <h2 className="text-2xl font-bold mb-2">Parabéns!</h2>
            <p className="text-muted-foreground">
              Você completou todas as perguntas. Aguardando resultado...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background p-4">
      <div className="max-w-3xl mx-auto py-8">
        <div className="mb-6 space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Pergunta {currentQuestion + 1} de {totalQuestions}</span>
            <span className="flex items-center gap-1">
              <Zap className="h-4 w-4 text-primary" />
              {answers.reduce((sum, a) => sum + a.points, 0)} pts
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">{question.question}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {question.options.map((option: string, index: number) => (
                  <Button
                    key={index}
                    variant={selectedAnswer === index ? "default" : "outline"}
                    className="w-full justify-start text-left h-auto py-4 px-6"
                    onClick={() => setSelectedAnswer(index)}
                    disabled={loading}
                  >
                    <span className="mr-3 font-bold">{String.fromCharCode(65 + index)}.</span>
                    <span>{option}</span>
                  </Button>
                ))}

                <Button
                  onClick={handleAnswer}
                  disabled={selectedAnswer === null || loading}
                  className="w-full mt-6"
                  size="lg"
                >
                  {loading ? "Enviando..." : "Confirmar Resposta"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
