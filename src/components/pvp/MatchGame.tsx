import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Zap, Trophy, Clock, CheckCircle2, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { CountdownAnimation } from "./CountdownAnimation";
import { PvPHeader } from "./PvPHeader";

interface MatchGameProps {
  match: any;
  userId: string;
  onComplete: () => void;
  onLeave: () => void;
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

export const MatchGame = ({ match, userId, onComplete, onLeave }: MatchGameProps) => {
  const { toast } = useToast();
  const [showCountdown, setShowCountdown] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [startTime, setStartTime] = useState(Date.now());
  const [answers, setAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [myAnswered, setMyAnswered] = useState(false);
  const [opponentAnswered, setOpponentAnswered] = useState(false);
  const [showRoundResult, setShowRoundResult] = useState(false);
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  const [opponentDisconnected, setOpponentDisconnected] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasSubmittedRef = useRef(false);

  const questions = match.questions_data || [];
  const totalQuestions = questions.length;
  const progress = (currentQuestion / totalQuestions) * 100;
  const opponentUserId = match.host_user_id === userId ? match.opponent_user_id : match.host_user_id;

  const handleLeaveMatch = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    onLeave?.();
  };

  // Timer de 60 segundos - HOOK #1
  useEffect(() => {
    if (!match.questions_data || totalQuestions === 0 || !opponentUserId) return;
    
    hasSubmittedRef.current = false;
    setStartTime(Date.now());
    setTimeRemaining(60);
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
  }, [currentQuestion, match.questions_data, totalQuestions, opponentUserId]);

  // Listener para respostas e desconexão - HOOK #2
  useEffect(() => {
    if (!match.questions_data || totalQuestions === 0 || !opponentUserId) return;

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
            checkBothAnswered();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pvp_matches',
          filter: `id=eq.${match.id}`
        },
        async (payload) => {
          const updatedMatch = payload.new as any;
          
          if (updatedMatch.status === 'abandoned') {
            setOpponentDisconnected(true);
            if (timerRef.current) clearInterval(timerRef.current);
            toast({
              title: "Oponente desconectou!",
              description: "Você venceu por W.O.",
            });
            setTimeout(() => {
              onComplete();
            }, 2000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [match.id, currentQuestion, opponentUserId, match.questions_data, totalQuestions]);

  // Auto-advance after showing result - HOOK #3
  useEffect(() => {
    if (showRoundResult && roundResult) {
      const autoAdvanceTimer = setTimeout(() => {
        handleNextQuestion();
      }, 5000);
      
      return () => clearTimeout(autoAdvanceTimer);
    }
  }, [showRoundResult, roundResult]);

  const showRoundResultScreen = (myAnswerData: any, opponentAnswer: any) => {
    const result: RoundResult = {
      questionIndex: currentQuestion,
      myAnswer: myAnswerData?.selected_answer ?? -1,
      myCorrect: myAnswerData?.is_correct ?? false,
      myTime: myAnswerData?.time_taken_seconds ?? 60,
      myPoints: myAnswerData?.points_earned ?? 0,
      opponentCorrect: opponentAnswer?.is_correct ?? false,
      opponentTime: opponentAnswer?.time_taken_seconds ?? 60,
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
      await submitAnswer(null, 60);
      
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
    const speedBonus = Math.floor(100 * (1 - Math.min(timeSeconds / 60, 1)));
    return basePoints + speedBonus;
  };

  const submitAnswer = async (answer: number | null, time: number) => {
    const question = questions[currentQuestion];
    const isCorrect = answer !== null ? (question.options[answer]?.isCorrect || false) : false;
    const points = calculatePoints(isCorrect, time);

    try {
      // Check if answer already exists to prevent duplicates
      const { data: existingAnswer } = await supabase
        .from('pvp_match_answers')
        .select('id')
        .eq('match_id', match.id)
        .eq('user_id', userId)
        .eq('question_index', currentQuestion)
        .maybeSingle();

      if (existingAnswer) {
        console.log('Answer already exists, skipping duplicate submission');
        setMyAnswered(true);
        checkBothAnswered();
        return;
      }

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
      // Only show toast if it's not a duplicate key error
      if (!error.message?.includes('duplicate key')) {
        toast({
          title: "Erro ao enviar resposta",
          description: error.message,
          variant: "destructive",
        });
      }
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

  const myTotalScore = answers.reduce((sum, a) => sum + a.points, 0);
  const opponentTotalScore = 0;

  // Validações de estado - renderizadas condicionalmente após TODOS os hooks
  if (!match.questions_data || totalQuestions === 0) {
    return (
      <div className="min-h-screen pvp-bg-classic flex items-center justify-center p-4">
        <PvPHeader />
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

  if (!opponentUserId) {
    return (
      <div className="min-h-screen pvp-bg-classic flex items-center justify-center p-4">
        <PvPHeader />
        <Card className="w-full max-w-lg text-center">
          <CardContent className="pt-6">
            <Clock className="h-16 w-16 text-primary mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold mb-2">Aguardando oponente...</h2>
            <p className="text-muted-foreground">A partida iniciará em breve.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mostrar animação de contagem regressiva antes da primeira pergunta
  if (showCountdown) {
    return (
      <CountdownAnimation 
        onComplete={() => setShowCountdown(false)} 
      />
    );
  }

  if (currentQuestion >= totalQuestions) {
    return (
      <div className="min-h-screen pvp-bg-classic flex items-center justify-center p-4">
        <PvPHeader />
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
      <div className="min-h-screen pvp-bg-classic p-4 flex items-center justify-center relative overflow-hidden">
        <PvPHeader />
        
        {/* Confetti effect for correct answers */}
        {roundResult.myCorrect && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                initial={{ 
                  x: '50%',
                  y: '50%',
                  scale: 0
                }}
                animate={{
                  x: `${Math.random() * 100}%`,
                  y: `${Math.random() * 100}%`,
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: Math.random() * 2 + 1,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>
        )}

        <Card className="w-full max-w-3xl glass-card relative backdrop-blur-2xl bg-white/10 border-white/20 rounded-3xl">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <CardTitle className="text-white text-2xl mb-2 font-bold drop-shadow-lg">
                Rodada {currentQuestion + 1} - Resultado
              </CardTitle>
              {/* Auto-advance progress bar */}
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 5, ease: "linear" }}
                className="h-1 bg-cyan-400 rounded-full mt-4"
              />
              <p className="text-white/70 text-sm mt-2 font-medium">
                Próxima questão em 5 segundos
              </p>
            </motion.div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* VS Comparison */}
            <div className="grid grid-cols-2 gap-4">
              {/* Você */}
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className={`p-6 rounded-xl border-4 ${
                  roundResult.myCorrect ? 'bg-green-500/20 border-green-400' : 'bg-red-500/20 border-red-400'
                } relative overflow-hidden`}
              >
                {roundResult.myCorrect && (
                  <motion.div
                    animate={{ scale: [0, 1.5, 1] }}
                    className="absolute top-2 right-2"
                  >
                    ✨
                  </motion.div>
                )}
                <div className="text-center space-y-3">
                  <div className="inline-block px-4 py-1 bg-primary rounded-full">
                    <span className="text-white font-bold">VOCÊ</span>
                  </div>
                  
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring" }}
                    className={`text-5xl mx-auto w-20 h-20 rounded-full flex items-center justify-center ${
                      roundResult.myCorrect ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  >
                    {roundResult.myAnswer === -1 ? '⏰' : roundResult.myCorrect ? '✓' : '✗'}
                  </motion.div>

                  <div className="text-white space-y-1">
                    <p className="font-semibold">
                      {roundResult.myAnswer === -1 
                        ? 'Tempo esgotado' 
                        : roundResult.myCorrect ? 'Correto!' : 'Incorreto'}
                    </p>
                    {roundResult.myTime < 60 && (
                      <p className="text-sm text-white/70">
                        ⏱ {formatTime(roundResult.myTime)}
                      </p>
                    )}
                    <motion.p
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.6 }}
                      className="text-3xl font-bold text-yellow-400"
                    >
                      +{roundResult.myPoints}
                    </motion.p>
                  </div>
                </div>
              </motion.div>

              {/* Oponente */}
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className={`p-6 rounded-xl border-4 ${
                  roundResult.opponentCorrect ? 'bg-green-500/20 border-green-400' : 'bg-red-500/20 border-red-400'
                } relative overflow-hidden`}
              >
                {roundResult.opponentCorrect && (
                  <motion.div
                    animate={{ scale: [0, 1.5, 1] }}
                    className="absolute top-2 right-2"
                  >
                    ✨
                  </motion.div>
                )}
                <div className="text-center space-y-3">
                  <div className="inline-block px-4 py-1 bg-secondary rounded-full">
                    <span className="text-white font-bold">OPONENTE</span>
                  </div>
                  
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring" }}
                    className={`text-5xl mx-auto w-20 h-20 rounded-full flex items-center justify-center ${
                      roundResult.opponentCorrect ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  >
                    {roundResult.opponentTime >= 60 ? '⏰' : roundResult.opponentCorrect ? '✓' : '✗'}
                  </motion.div>

                  <div className="text-white space-y-1">
                    <p className="font-semibold">
                      {roundResult.opponentTime >= 60 
                        ? 'Tempo esgotado' 
                        : roundResult.opponentCorrect ? 'Correto!' : 'Incorreto'}
                    </p>
                    {roundResult.opponentTime < 60 && (
                      <p className="text-sm text-white/70">
                        ⏱ {formatTime(roundResult.opponentTime)}
                      </p>
                    )}
                    <motion.p
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.6 }}
                      className="text-3xl font-bold text-yellow-400"
                    >
                      +{roundResult.opponentPoints}
                    </motion.p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* VS Divider */}
            <div className="flex items-center justify-center">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 0.5,
                  repeat: Infinity,
                  repeatDelay: 1
                }}
                className="text-5xl font-bold text-white/20"
              >
                VS
              </motion.div>
            </div>

            {/* Placar atualizado */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="glass-card p-6 border-2 border-primary/30"
            >
              <h3 className="font-bold text-white text-center mb-4 text-lg drop-shadow-md">Placar Atual</h3>
              <div className="flex justify-around items-center">
                <div className="text-center">
                  <p className="text-white/70 text-sm mb-1 font-medium">Você</p>
                  <motion.p
                    key={myTotalScore}
                    initial={{ scale: 1.5 }}
                    animate={{ scale: 1 }}
                    className="text-4xl font-bold text-cyan-400"
                  >
                    {myTotalScore}
                  </motion.p>
                </div>
                <div className="text-white/40 text-4xl font-bold px-8">—</div>
                <div className="text-center">
                  <p className="text-white/70 text-sm mb-1 font-medium">Oponente</p>
                  <motion.p
                    key={opponentTotalScore}
                    initial={{ scale: 1.5 }}
                    animate={{ scale: 1 }}
                    className="text-4xl font-bold text-purple-400"
                  >
                    {opponentTotalScore || 0}
                  </motion.p>
                </div>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-4">
      <PvPHeader />
      
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header with scores */}
        <Card className="backdrop-blur-xl bg-white/10 border-white/20">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                  {myTotalScore}
                </div>
                <span className="text-white font-medium">Você</span>
              </div>
              
              <div className="flex flex-col items-center">
                <span className="text-xs text-purple-300">Pergunta</span>
                <span className="text-xl font-bold text-white">{currentQuestion + 1}/{totalQuestions}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-white font-medium">Oponente</span>
                <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white font-bold">
                  {opponentTotalScore}
                </div>
              </div>
            </div>
            
            <Progress 
              value={(currentQuestion / totalQuestions) * 100} 
              className="mt-3 h-2 bg-white/20"
            />
          </CardContent>
        </Card>

        {/* Timer */}
        <div className="flex justify-center">
          <motion.div
            animate={{ scale: timeRemaining <= 10 ? [1, 1.1, 1] : 1 }}
            transition={{ duration: 0.5, repeat: timeRemaining <= 10 ? Infinity : 0 }}
            className={`flex items-center gap-2 px-6 py-3 rounded-full ${
              timeRemaining <= 10 ? 'bg-red-500/30' : 'bg-white/10'
            } backdrop-blur-xl border border-white/20`}
          >
            <Clock className={`h-6 w-6 ${
              timeRemaining <= 10 ? 'text-red-500' : timeRemaining <= 30 ? 'text-yellow-500' : 'text-cyan-400'
            }`} />
            <span className={`text-3xl font-bold ${
              timeRemaining <= 10 ? 'text-red-500' : timeRemaining <= 30 ? 'text-yellow-500' : 'text-cyan-400'
            }`}>{timeRemaining}s</span>
          </motion.div>
        </div>

        {/* Question */}
        <Card className="backdrop-blur-xl bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-xl leading-relaxed">
              {question.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {question.options.map((option: any, index: number) => (
              <motion.button
                key={index}
                whileHover={{ scale: myAnswered ? 1 : 1.02 }}
                whileTap={{ scale: myAnswered ? 1 : 0.98 }}
                onClick={() => !myAnswered && setSelectedAnswer(index)}
                disabled={myAnswered}
                className={`w-full p-4 rounded-xl text-left transition-all ${
                  selectedAnswer === index
                    ? 'bg-cyan-500 text-white border-2 border-cyan-300'
                    : 'bg-white/10 text-white border-2 border-white/20 hover:bg-white/20'
                } ${myAnswered ? 'opacity-60' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    selectedAnswer === index ? 'bg-white/20' : 'bg-white/10'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="flex-1">{option.text}</span>
                  {selectedAnswer === index && (
                    <CheckCircle2 className="w-6 h-6" />
                  )}
                </div>
              </motion.button>
            ))}
          </CardContent>
        </Card>

        {/* Submit button */}
        {!myAnswered && (
          <Button
            onClick={handleAnswer}
            disabled={selectedAnswer === null}
            size="lg"
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold text-lg py-6"
          >
            <Zap className="w-5 h-5 mr-2" />
            CONFIRMAR RESPOSTA
          </Button>
        )}

        {/* Waiting for opponent */}
        {myAnswered && !showRoundResult && (
          <Card className="backdrop-blur-xl bg-yellow-500/20 border-yellow-400/50">
            <CardContent className="py-4 text-center">
              <Clock className="w-6 h-6 animate-spin text-yellow-400 mx-auto mb-2" />
              <p className="text-yellow-200">Aguardando oponente responder...</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
