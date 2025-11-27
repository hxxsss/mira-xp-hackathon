import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Zap, Trophy, Clock, CheckCircle2, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { CountdownAnimation } from "./CountdownAnimation";

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

  if (!opponentUserId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background flex items-center justify-center p-4">
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
      <div className="min-h-screen battle-gradient p-4 flex items-center justify-center relative overflow-hidden">
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

        <Card className="w-full max-w-3xl glass-card relative">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <CardTitle className="text-gray-800 text-3xl mb-2">
                🎯 Rodada {currentQuestion + 1} - Resultado
              </CardTitle>
              {/* Auto-advance progress bar */}
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 5, ease: "linear" }}
                className="h-1 bg-primary rounded-full mt-4"
              />
              <p className="text-gray-600 text-sm mt-2">
                ⏱️ Próxima questão em 5 segundos...
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
              <h3 className="font-bold text-gray-800 text-center mb-4 text-xl">📊 Placar Atual</h3>
              <div className="flex justify-around items-center">
                <div className="text-center">
                  <p className="text-gray-600 text-sm mb-1">Você</p>
                  <motion.p
                    key={myTotalScore}
                    initial={{ scale: 1.5 }}
                    animate={{ scale: 1 }}
                    className="text-4xl font-bold text-primary"
                  >
                    {myTotalScore}
                  </motion.p>
                </div>
                <div className="text-gray-400 text-5xl font-bold px-8">—</div>
                <div className="text-center">
                  <p className="text-gray-600 text-sm mb-1">Oponente</p>
                  <motion.p
                    key={opponentTotalScore}
                    initial={{ scale: 1.5 }}
                    animate={{ scale: 1 }}
                    className="text-4xl font-bold text-secondary"
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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/30 rounded-full"
            animate={{
              y: [-20, -1000],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              delay: Math.random() * 3
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: '100%'
            }}
          />
        ))}
      </div>

      <Card className="w-full max-w-3xl glass-card relative z-10">
        <CardHeader>
          {/* Timer and Progress */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-primary/20 rounded-full border-2 border-primary/50">
                <span className="text-gray-800 font-bold">
                  ⚡ {currentQuestion + 1}/{totalQuestions}
                </span>
              </div>
              <div className="text-gray-600 text-sm">
                Questão {currentQuestion + 1}
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLeaveMatch}
              disabled={loading}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 gap-2 disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />
              {loading ? "Saindo..." : "Sair"}
            </Button>

            {/* Circular Timer */}
            <div className="relative">
              <svg className="transform -rotate-90" width="80" height="80">
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="6"
                />
                <motion.circle
                  cx="40"
                  cy="40"
                  r="32"
                  fill="none"
                  stroke={
                    timeRemaining > 30 ? '#22c55e' : 
                    timeRemaining > 10 ? '#eab308' : 
                    '#ef4444'
                  }
                  strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 32}`}
                  strokeDashoffset={`${2 * Math.PI * 32 * (1 - timeRemaining / 60)}`}
                  strokeLinecap="round"
                  animate={timeRemaining < 10 ? { 
                    scale: [1, 1.1, 1],
                    opacity: [1, 0.8, 1]
                  } : {}}
                  transition={timeRemaining < 10 ? { 
                    duration: 1, 
                    repeat: Infinity 
                  } : {}}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-2xl font-bold ${
                  timeRemaining > 30 ? 'text-green-400' : 
                  timeRemaining > 10 ? 'text-yellow-400' : 
                  'text-red-400'
                }`}>
                  {timeRemaining}
                </span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
            className="h-2 bg-gradient-to-r from-primary to-secondary rounded-full"
          />
        </CardHeader>

        <CardContent className="space-y-6">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Question */}
            <div className="glass-card p-6 mb-6 border-2 border-primary/30">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xl">
                  {currentQuestion + 1}
                </div>
                <div className="flex-1">
                  <p className="text-gray-600 text-sm mb-2">📚 Educação Financeira</p>
            <CardTitle className="text-2xl text-gray-800 leading-relaxed">
              {question.question}
            </CardTitle>
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {question.options.map((option: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: myAnswered ? 1 : 1.02 }}
                  whileTap={{ scale: myAnswered ? 1 : 0.98 }}
                >
                  <Button
                    onClick={() => !myAnswered && setSelectedAnswer(index)}
                    variant={selectedAnswer === index ? "default" : "outline"}
                    className={`w-full justify-start text-left h-auto py-5 px-6 relative overflow-hidden group transition-all ${
                      selectedAnswer === index 
                        ? 'bg-gradient-to-r from-primary to-secondary border-primary text-white shadow-lg' 
                        : 'bg-background/50 hover:bg-accent/50 border-white/20'
                    }`}
                    disabled={myAnswered}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 group-hover:via-primary/20 transition-all" />
                    
                    <div className="flex items-center gap-4 relative z-10">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                        selectedAnswer === index
                          ? 'bg-white/20 text-white'
                          : 'bg-primary/20 text-primary'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="text-base flex-1">{option.text}</span>
                    </div>
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Status Bar */}
          <div className="glass-card p-4 flex justify-between items-center border border-white/10">
            <motion.div 
              className="flex items-center gap-2"
              animate={myAnswered ? { scale: [1, 1.1, 1] } : {}}
            >
              <div className={`w-3 h-3 rounded-full ${myAnswered ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`} />
              <span className="text-gray-700 text-sm font-medium">
                {myAnswered ? '✓ Você respondeu' : '⏳ Selecione sua resposta'}
              </span>
            </motion.div>
            <motion.div 
              className="flex items-center gap-2"
              animate={opponentAnswered ? { scale: [1, 1.1, 1] } : {}}
            >
              <span className="text-gray-700 text-sm font-medium">
                {opponentAnswered ? '✓ Oponente respondeu' : '⏳ Aguardando...'}
              </span>
              <div className={`w-3 h-3 rounded-full ${opponentAnswered ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`} />
            </motion.div>
          </div>

          {/* Confirm Button */}
          {!myAnswered && selectedAnswer !== null && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <Button
                onClick={handleAnswer}
                className="w-full arcade-button text-xl py-7 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold shadow-2xl"
              >
                ✓ CONFIRMAR RESPOSTA
              </Button>
            </motion.div>
          )}

          {/* Score Display */}
          <div className="text-center pt-2">
            <motion.p 
              key={myTotalScore}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="text-white font-bold text-lg"
            >
              💎 Seu Placar: <span className="text-yellow-400 text-2xl">{myTotalScore}</span> pts
            </motion.p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
