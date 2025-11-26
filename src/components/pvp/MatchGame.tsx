import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Zap, Trophy, Clock, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface MatchGameProps {
  match: any;
  userId: string;
  onComplete: () => void;
}

interface RoundResult {
  questionIndex: number;
  myAnswer: number;
  myCorrect: boolean;
  myTime: number;
  myPoints: number;
  opponentCorrect: boolean;
  opponentTime: number;
  opponentPoints: number;
}

export const MatchGame = ({ match, userId, onComplete }: MatchGameProps) => {
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [startTime, setStartTime] = useState(Date.now());
  const [answers, setAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(90);
  const [myAnswered, setMyAnswered] = useState(false);
  const [opponentAnswered, setOpponentAnswered] = useState(false);
  const [showRoundResult, setShowRoundResult] = useState(false);
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasSubmittedRef = useRef(false); // Evitar race conditions

  const questions = match.questions_data || [];
  const totalQuestions = questions.length;
  const progress = (currentQuestion / totalQuestions) * 100;
  const opponentUserId = match.host_user_id === userId ? match.opponent_user_id : match.host_user_id;

  // Protection against empty questions_data
  if (totalQuestions === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background flex items-center justify-center p-4">
        <Card className="w-full max-w-lg text-center">
          <CardContent className="pt-6">
            <Clock className="h-16 w-16 text-primary mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold mb-2">Carregando perguntas...</h2>
            <p className="text-muted-foreground">Aguarde enquanto preparamos a partida.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Timer de 90 segundos
  useEffect(() => {
    hasSubmittedRef.current = false; // Resetar ao mudar de questão
    setStartTime(Date.now());
    setTimeRemaining(90);
    setMyAnswered(false);
    setOpponentAnswered(false);
    setSelectedAnswer(null);
    setShowRoundResult(false);

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentQuestion]);

  // Listener para respostas (minha ou do oponente)
  useEffect(() => {
    const channel = supabase
      .channel(`match-answers-${match.id}-${currentQuestion}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pvp_match_answers',
          filter: `match_id=eq.${match.id}`,
        },
        (payload) => {
          if (payload.new.question_index === currentQuestion) {
            if (payload.new.user_id === opponentUserId) {
              setOpponentAnswered(true);
            }
            // Verificar se ambos responderam (independente de quem respondeu)
            checkBothAnswered();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [match.id, currentQuestion, opponentUserId]);

  const showRoundResultScreen = (myAnswerData: any, opponentAnswer: any) => {
    const result: RoundResult = {
      questionIndex: currentQuestion,
      myAnswer: myAnswerData?.selected_answer ?? -1,
      myCorrect: myAnswerData?.is_correct ?? false,
      myTime: myAnswerData?.time_taken_seconds ?? 90,
      myPoints: myAnswerData?.points_earned ?? 0,
      opponentCorrect: opponentAnswer?.is_correct ?? false,
      opponentTime: opponentAnswer?.time_taken_seconds ?? 90,
      opponentPoints: opponentAnswer?.points_earned ?? 0,
    };
    
    setRoundResult(result);
    setShowRoundResult(true);
  };

  const handleTimeout = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Se eu não respondi, enviar resposta anulada
    if (!hasSubmittedRef.current) {
      hasSubmittedRef.current = true;
      await submitAnswer(null, 90);
      
      toast({
        title: "⏰ Tempo esgotado!",
        description: "Sua resposta foi anulada.",
        variant: "destructive",
      });
    }
    
    // Buscar respostas de ambos
    const { data: bothAnswers } = await supabase
      .from('pvp_match_answers')
      .select('*')
      .eq('match_id', match.id)
      .eq('question_index', currentQuestion);
    
    const myAnswerData = bothAnswers?.find(a => a.user_id === userId);
    const opponentAnswer = bothAnswers?.find(a => a.user_id === opponentUserId);
    
    // Mostrar resultado (mesmo que um ou ambos não tenham respondido)
    showRoundResultScreen(myAnswerData, opponentAnswer);
  };

  const checkBothAnswered = async () => {
    // Buscar todas as respostas desta questão
    const { data: bothAnswers } = await supabase
      .from('pvp_match_answers')
      .select('*')
      .eq('match_id', match.id)
      .eq('question_index', currentQuestion);
    
    const myAnswerData = bothAnswers?.find(a => a.user_id === userId);
    const opponentAnswer = bothAnswers?.find(a => a.user_id === opponentUserId);
    
    // Se AMBOS responderam, parar timer e mostrar resultado
    if (myAnswerData && opponentAnswer) {
      if (timerRef.current) clearInterval(timerRef.current);
      showRoundResultScreen(myAnswerData, opponentAnswer);
    }
  };

  const calculatePoints = (isCorrect: boolean, timeSeconds: number) => {
    if (!isCorrect) return 0;
    const basePoints = 100;
    const speedBonus = Math.floor(100 * (1 - Math.min(timeSeconds / 30, 1)));
    return basePoints + speedBonus;
  };

  const submitAnswer = async (answer: number | null, time: number) => {
    const question = questions[currentQuestion];
    const isCorrect = answer !== null ? (question.options[answer]?.isCorrect || false) : false;
    const points = calculatePoints(isCorrect, time);

    try {
      const { data, error } = await supabase
        .from('pvp_match_answers')
        .insert({
          match_id: match.id,
          user_id: userId,
          question_index: currentQuestion,
          selected_answer: answer ?? -1,
          is_correct: isCorrect,
          time_taken_seconds: time,
          points_earned: points,
        })
        .select()
        .single();

      if (error) throw error;

      const newAnswers = [...answers, { isCorrect, points }];
      setAnswers(newAnswers);
      setMyAnswered(true);

      // Verificar se oponente já respondeu
      checkBothAnswered();
    } catch (error: any) {
      console.error('Error submitting answer:', error);
      toast({
        title: "Erro ao enviar resposta",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAnswer = async () => {
    if (selectedAnswer === null || myAnswered || hasSubmittedRef.current) return;
    
    hasSubmittedRef.current = true;
    setLoading(true);
    const timeSeconds = (Date.now() - startTime) / 1000;
    await submitAnswer(selectedAnswer, timeSeconds);
    setLoading(false);
  };

  const handleNextQuestion = () => {
    setShowRoundResult(false);
    setRoundResult(null);
    
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      toast({
        title: "Partida concluída!",
        description: "Aguardando resultado final...",
      });
      onComplete();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
  const timerColor = timeRemaining <= 10 ? "text-red-500" : timeRemaining <= 30 ? "text-yellow-500" : "text-primary";

  // Tela de resultado da rodada
  if (showRoundResult && roundResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Resultado da Questão {currentQuestion + 1}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Meu resultado */}
              <div className="p-4 bg-primary/10 rounded-lg border-2 border-primary">
                <h3 className="font-bold text-center mb-3">Você</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-center gap-2">
                    {roundResult.myTime >= 90 || roundResult.myAnswer === -1 ? (
                      <span className="text-orange-600 font-semibold">⏰ Não respondeu</span>
                    ) : roundResult.myCorrect ? (
                      <span className="text-green-600 font-semibold">✅ Correto</span>
                    ) : (
                      <span className="text-red-600 font-semibold">❌ Incorreto</span>
                    )}
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{formatTime(roundResult.myTime)}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="font-bold">{roundResult.myPoints} pts</span>
                  </div>
                </div>
              </div>

              {/* Resultado do oponente */}
              <div className="p-4 bg-muted rounded-lg border-2 border-border">
                <h3 className="font-bold text-center mb-3">Oponente</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-center gap-2">
                    {roundResult.opponentTime >= 90 ? (
                      <span className="text-orange-600 font-semibold">⏰ Não respondeu</span>
                    ) : roundResult.opponentCorrect ? (
                      <span className="text-green-600 font-semibold">✅ Correto</span>
                    ) : (
                      <span className="text-red-600 font-semibold">❌ Incorreto</span>
                    )}
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{formatTime(roundResult.opponentTime)}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="font-bold">{roundResult.opponentPoints} pts</span>
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={handleNextQuestion}
              className="w-full"
              size="lg"
            >
              {currentQuestion < totalQuestions - 1 ? "Próxima Questão →" : "Ver Resultado Final"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background p-4">
      <div className="max-w-3xl mx-auto py-8">
        <div className="mb-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Pergunta {currentQuestion + 1} de {totalQuestions}</span>
            <span className="flex items-center gap-1">
              <Zap className="h-4 w-4 text-primary" />
              {answers.reduce((sum, a) => sum + a.points, 0)} pts
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          
          {/* Timer */}
          <div className={`flex items-center justify-center gap-2 text-lg font-bold ${timerColor}`}>
            <Clock className="h-5 w-5" />
            <span>{formatTime(timeRemaining)}</span>
          </div>

          {/* Indicador de oponente */}
          {opponentAnswered && !myAnswered && (
            <div className="flex items-center justify-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-950 p-2 rounded-lg animate-pulse">
              <CheckCircle2 className="h-4 w-4" />
              <span>Oponente já respondeu!</span>
            </div>
          )}

          {myAnswered && !opponentAnswered && (
            <div className="flex items-center justify-center gap-2 text-sm text-blue-600 bg-blue-50 dark:bg-blue-950 p-2 rounded-lg">
              <Clock className="h-4 w-4" />
              <span>Aguardando oponente...</span>
            </div>
          )}
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
                {question.options.map((option: any, index: number) => (
                  <Button
                    key={index}
                    variant={selectedAnswer === index ? "default" : "outline"}
                    className="w-full justify-start text-left h-auto py-4 px-6"
                    onClick={() => !myAnswered && setSelectedAnswer(index)}
                    disabled={myAnswered}
                  >
                    <span className="mr-3 font-bold">{String.fromCharCode(65 + index)}.</span>
                    <span>{option.text}</span>
                  </Button>
                ))}

                <Button
                  onClick={handleAnswer}
                  disabled={selectedAnswer === null || loading || myAnswered}
                  className="w-full mt-6"
                  size="lg"
                >
                  {loading ? "Enviando..." : myAnswered ? "Resposta Enviada ✓" : "Confirmar Resposta"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
