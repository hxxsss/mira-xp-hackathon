import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Zap, Trophy, Clock, CheckCircle2, Users, Swords, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { CountdownAnimation } from "./CountdownAnimation";
import { PvPHeader } from "./PvPHeader";

interface GroupMatchGameProps {
  match: any;
  userId: string;
  onComplete: () => void;
  onLeave: () => void;
}

interface Pairing {
  id: string;
  player1_id: string;
  player2_id: string;
  player1_group_id: string;
  player2_group_id: string;
  player1_score: number;
  player2_score: number;
  status: string;
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

export const GroupMatchGame = ({ match, userId, onComplete, onLeave }: GroupMatchGameProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [showCountdown, setShowCountdown] = useState(false);
  const [pairing, setPairing] = useState<Pairing | null>(null);
  const [opponentProfile, setOpponentProfile] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [startTime, setStartTime] = useState(Date.now());
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [myAnswered, setMyAnswered] = useState(false);
  const [opponentAnswered, setOpponentAnswered] = useState(false);
  const [showRoundResult, setShowRoundResult] = useState(false);
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  const [myTotalScore, setMyTotalScore] = useState(0);
  const [opponentTotalScore, setOpponentTotalScore] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasSubmittedRef = useRef(false);

  const questions = match.questions_data || [];
  const totalQuestions = questions.length;
  const opponentId = pairing 
    ? (pairing.player1_id === userId ? pairing.player2_id : pairing.player1_id)
    : null;

  // Load pairing and generate if needed (client-side, sem edge function)
  useEffect(() => {
    loadOrGeneratePairing();
  }, [match.id, userId]);
 
  const loadOrGeneratePairing = async () => {
    try {
      // 1) Verificar se já existe pareamento para este jogador
      const { data: existingPairing, error } = await supabase
        .from('pvp_group_pairings')
        .select('*')
        .eq('match_id', match.id)
        .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
        .maybeSingle();
 
      if (error) {
        console.error('[GroupMatchGame] Error fetching existing pairing:', error);
      }
 
      if (existingPairing) {
        console.log('[GroupMatchGame] Found existing pairing:', existingPairing);
        setPairing(existingPairing as Pairing);
        const oppId = existingPairing.player1_id === userId
          ? existingPairing.player2_id
          : existingPairing.player1_id;
 
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, avatar_id')
          .eq('id', oppId)
          .single();
 
        setOpponentProfile(profile);
        setLoading(false);
        setShowCountdown(true);
        return;
      }
 
      // 2) Não existe pareamento ainda: gerar tudo no cliente
      console.log('[GroupMatchGame] No pairing found, generating on client...');
 
      const { data: groups, error: groupsError } = await supabase
        .from('pvp_groups')
        .select('id, name')
        .eq('match_id', match.id);
 
      if (groupsError) throw groupsError;
      if (!groups || groups.length === 0) {
        throw new Error('Nenhum grupo encontrado para esta partida.');
      }
 
      const groupIds = groups.map(g => g.id);
 
      const { data: members, error: membersError } = await supabase
        .from('pvp_group_members')
        .select('id, user_id, group_id, profiles(name)')
        .in('group_id', groupIds);
 
      if (membersError) throw membersError;
      if (!members || members.length === 0) {
        throw new Error('Nenhum jogador encontrado nos grupos.');
      }
 
      type PlayerLocal = { id: string; user_id: string; group_id: string; name?: string };
      const players: PlayerLocal[] = (members as any[]).map(m => ({
        id: m.id,
        user_id: m.user_id,
        group_id: m.group_id,
        name: m.profiles?.name || 'Jogador',
      }));
 
      console.log('[GroupMatchGame] Generating pairings for', players.length, 'players');
 
      const pairings: { player1: PlayerLocal; player2: PlayerLocal }[] = [];
      const playersCopy = [...players];
      const usedPlayers = new Set<string>();
 
      // Primeira passada: tentar sempre grupos diferentes
      while (playersCopy.length >= 2) {
        const player1 = playersCopy.shift()!;
        usedPlayers.add(player1.user_id);
 
        const opponentIndex = playersCopy.findIndex(
          p => p.group_id !== player1.group_id && !usedPlayers.has(p.user_id)
        );
 
        if (opponentIndex !== -1) {
          const player2 = playersCopy.splice(opponentIndex, 1)[0];
          usedPlayers.add(player2.user_id);
          pairings.push({ player1, player2 });
        } else {
          if (pairings.length > 0) {
            const randomPairing = pairings[Math.floor(Math.random() * pairings.length)];
            const duplicateOpponent = Math.random() > 0.5 ? randomPairing.player1 : randomPairing.player2;
            pairings.push({ player1, player2: duplicateOpponent });
          } else {
            playersCopy.push(player1);
          }
        }
      }
 
      if (playersCopy.length === 1 && pairings.length > 0) {
        const lastPlayer = playersCopy[0];
        const randomPairing = pairings[Math.floor(Math.random() * pairings.length)];
        const duplicateOpponent = Math.random() > 0.5 ? randomPairing.player1 : randomPairing.player2;
        pairings.push({ player1: lastPlayer, player2: duplicateOpponent });
      }
 
      const pairingInserts = pairings.map(p => ({
        match_id: match.id,
        round_number: 1,
        player1_id: p.player1.user_id,
        player1_group_id: p.player1.group_id,
        player2_id: p.player2.user_id,
        player2_group_id: p.player2.group_id,
        status: 'pending',
      }));
 
      const { error: insertError } = await supabase
        .from('pvp_group_pairings')
        .insert(pairingInserts);
 
      if (insertError) throw insertError;
 
      // 3) Buscar novamente o pareamento deste jogador
      const { data: newPairing } = await supabase
        .from('pvp_group_pairings')
        .select('*')
        .eq('match_id', match.id)
        .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
        .maybeSingle();
 
      if (newPairing) {
        setPairing(newPairing as Pairing);
        const oppId = newPairing.player1_id === userId
          ? newPairing.player2_id
          : newPairing.player1_id;
 
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, avatar_id')
          .eq('id', oppId)
          .single();
 
        setOpponentProfile(profile);
        setShowCountdown(true);
      }
    } catch (err: any) {
      console.error('[GroupMatchGame] Error preparing group match:', err);
      toast({
        title: 'Erro ao iniciar partida',
        description: err.message || 'Tente novamente',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Timer - 30 seconds per question
  useEffect(() => {
    if (!pairing || showCountdown || loading || gameFinished) return;
    
    hasSubmittedRef.current = false;
    setStartTime(Date.now());
    setTimeRemaining(30);
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
  }, [currentQuestion, pairing, showCountdown, loading, gameFinished]);

  // Listen for opponent answers
  useEffect(() => {
    if (!pairing || !opponentId || loading || gameFinished) return;

    const channel = supabase
      .channel(`group-match-${match.id}-${currentQuestion}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pvp_match_answers',
          filter: `match_id=eq.${match.id}`,
        },
        (payload) => {
          if (payload.new.question_index === currentQuestion && payload.new.user_id === opponentId) {
            setOpponentAnswered(true);
            checkBothAnswered();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [match.id, currentQuestion, opponentId, pairing, loading, gameFinished]);

  // Auto-advance after showing result
  useEffect(() => {
    if (showRoundResult && roundResult) {
      const autoAdvanceTimer = setTimeout(() => {
        handleNextQuestion();
      }, 4000);
      
      return () => clearTimeout(autoAdvanceTimer);
    }
  }, [showRoundResult, roundResult]);

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
      const { data: existingAnswer } = await supabase
        .from('pvp_match_answers')
        .select('id')
        .eq('match_id', match.id)
        .eq('user_id', userId)
        .eq('question_index', currentQuestion)
        .maybeSingle();

      if (existingAnswer) {
        console.log('[GroupMatchGame] Answer already exists');
        setMyAnswered(true);
        checkBothAnswered();
        return;
      }

      const { error } = await supabase
        .from('pvp_match_answers')
        .insert({
          match_id: match.id,
          user_id: userId,
          question_index: currentQuestion,
          selected_answer: answer ?? -1,
          is_correct: isCorrect,
          time_taken_seconds: time,
          points_earned: points,
        });

      if (error) throw error;

      setMyTotalScore(prev => prev + points);
      setMyAnswered(true);
      checkBothAnswered();
    } catch (error: any) {
      console.error('[GroupMatchGame] Error submitting answer:', error);
    }
  };

  const handleTimeout = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    if (!hasSubmittedRef.current) {
      hasSubmittedRef.current = true;
      await submitAnswer(null, 30);
      
      toast({
        title: "⏰ Tempo esgotado!",
        description: "Passando para próxima pergunta...",
      });
    }
    
    // Fetch answers and show result
    setTimeout(async () => {
      const { data: bothAnswers } = await supabase
        .from('pvp_match_answers')
        .select('*')
        .eq('match_id', match.id)
        .eq('question_index', currentQuestion);
      
      const myAnswerData = bothAnswers?.find(a => a.user_id === userId);
      const opponentAnswer = bothAnswers?.find(a => a.user_id === opponentId);
      
      showRoundResultScreen(myAnswerData, opponentAnswer);
    }, 500);
  };

  const checkBothAnswered = async () => {
    const { data: bothAnswers } = await supabase
      .from('pvp_match_answers')
      .select('*')
      .eq('match_id', match.id)
      .eq('question_index', currentQuestion);
    
    const myAnswerData = bothAnswers?.find(a => a.user_id === userId);
    const opponentAnswer = bothAnswers?.find(a => a.user_id === opponentId);
    
    if (myAnswerData && opponentAnswer) {
      if (timerRef.current) clearInterval(timerRef.current);
      showRoundResultScreen(myAnswerData, opponentAnswer);
    }
  };

  const showRoundResultScreen = (myAnswerData: any, opponentAnswer: any) => {
    const result: RoundResult = {
      questionIndex: currentQuestion,
      myAnswer: myAnswerData?.selected_answer ?? -1,
      myCorrect: myAnswerData?.is_correct ?? false,
      myTime: myAnswerData?.time_taken_seconds ?? 30,
      myPoints: myAnswerData?.points_earned ?? 0,
      opponentCorrect: opponentAnswer?.is_correct ?? false,
      opponentTime: opponentAnswer?.time_taken_seconds ?? 30,
      opponentPoints: opponentAnswer?.points_earned ?? 0,
    };
    
    if (opponentAnswer) {
      setOpponentTotalScore(prev => prev + (opponentAnswer.points_earned || 0));
    }
    
    setRoundResult(result);
    setShowRoundResult(true);
  };

  const handleAnswer = async () => {
    if (selectedAnswer === null || myAnswered || hasSubmittedRef.current) return;
    
    hasSubmittedRef.current = true;
    const timeSeconds = (Date.now() - startTime) / 1000;
    await submitAnswer(selectedAnswer, timeSeconds);
  };

  const handleNextQuestion = async () => {
    setShowRoundResult(false);
    setRoundResult(null);
    
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Game finished - update pairing scores
      await finishGame();
    }
  };

  const finishGame = async () => {
    setGameFinished(true);
    
    if (pairing) {
      const isPlayer1 = pairing.player1_id === userId;
      const updateData = isPlayer1 
        ? { player1_score: myTotalScore, status: opponentTotalScore > 0 ? 'completed' : 'pending' }
        : { player2_score: myTotalScore, status: pairing.player1_score !== null ? 'completed' : 'pending' };
      
      await supabase
        .from('pvp_group_pairings')
        .update(updateData)
        .eq('id', pairing.id);
      
      // Update user's group score and member data
      const { data: member } = await supabase
        .from('pvp_group_members')
        .select('group_id, score')
        .eq('user_id', userId)
        .eq('group_id', isPlayer1 ? pairing.player1_group_id : pairing.player2_group_id)
        .single();
      
      if (member) {
        await supabase
          .from('pvp_group_members')
          .update({ 
            score: (member.score || 0) + myTotalScore,
            has_played: true 
          })
          .eq('user_id', userId)
          .eq('group_id', member.group_id);
        
        // Update group total score
        const { data: allMembers } = await supabase
          .from('pvp_group_members')
          .select('score')
          .eq('group_id', member.group_id);
        
        const totalGroupScore = allMembers?.reduce((sum, m) => sum + (m.score || 0), 0) || 0;
        
        await supabase
          .from('pvp_groups')
          .update({ total_score: totalGroupScore })
          .eq('id', member.group_id);

        // Check if ALL pairings are completed
        const { data: allPairings } = await supabase
          .from('pvp_group_pairings')
          .select('status')
          .eq('match_id', match.id);
        
        const allPairingsCompleted = allPairings?.every(p => p.status === 'completed');
        
        if (allPairingsCompleted) {
          console.log('[GroupMatchGame] All pairings completed, finalizing match...');
          
          // Get all groups to calculate final positions and distribute XP
          const { data: finalGroups } = await supabase
            .from('pvp_groups')
            .select('id, total_score')
            .eq('match_id', match.id)
            .order('total_score', { ascending: false });
          
          if (finalGroups && finalGroups.length > 0) {
            // Winner is the group with highest score
            const winnerGroupId = finalGroups[0].id;
            
            // Distribute XP to all members
            for (let i = 0; i < finalGroups.length; i++) {
              const group = finalGroups[i];
              const position = i + 1;
              
              // Get members of this group
              const { data: groupMembers } = await supabase
                .from('pvp_group_members')
                .select('user_id')
                .eq('group_id', group.id);
              
              if (groupMembers) {
                // Calculate XP for this position
                const totalPlayers = allPairings?.length || 0;
                const totalPot = match.xp_bet * totalPlayers * 2; // Each pairing = 2 players
                let xpPerMember = 0;
                
                if (position === 1) xpPerMember = Math.floor((totalPot * 0.4) / groupMembers.length);
                else if (position === 2) xpPerMember = Math.floor((totalPot * 0.25) / groupMembers.length);
                else if (position === 3) xpPerMember = Math.floor((totalPot * 0.15) / groupMembers.length);
                else xpPerMember = -match.xp_bet; // Lost bet
                
                // Update XP for each member
                for (const gm of groupMembers) {
                  const { data: profile } = await supabase
                    .from('profiles')
                    .select('current_xp, total_xp, weekly_xp, monthly_xp')
                    .eq('id', gm.user_id)
                    .single();
                  
                  if (profile) {
                    await supabase
                      .from('profiles')
                      .update({
                        current_xp: Math.max(0, profile.current_xp + xpPerMember),
                        total_xp: profile.total_xp + Math.max(0, xpPerMember),
                        weekly_xp: profile.weekly_xp + Math.max(0, xpPerMember),
                        monthly_xp: profile.monthly_xp + Math.max(0, xpPerMember)
                      })
                      .eq('id', gm.user_id);
                  }
                }
              }
            }
            
            // Mark match as completed
            await supabase
              .from('pvp_matches')
              .update({ 
                status: 'completed',
                completed_at: new Date().toISOString(),
                winner_user_id: null // Group mode doesn't have single winner
              })
              .eq('id', match.id);
          }
        }
      }
    }
    
    toast({
      title: "Batalha concluída!",
      description: `Sua pontuação: ${myTotalScore} pts`,
    });

    setTimeout(() => {
      onComplete();
    }, 3000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
        <PvPHeader />
        <Card className="w-full max-w-lg text-center backdrop-blur-xl bg-white/10 border-white/20">
          <CardContent className="pt-6">
            <Loader2 className="h-16 w-16 text-cyan-400 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold mb-2 text-white">Preparando batalha...</h2>
            <p className="text-purple-200">Gerando pareamentos de jogadores</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No pairing found
  if (!pairing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
        <PvPHeader />
        <Card className="w-full max-w-lg text-center backdrop-blur-xl bg-white/10 border-white/20">
          <CardContent className="pt-6">
            <Users className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-white">Aguardando pareamento...</h2>
            <p className="text-purple-200">O sistema está organizando as batalhas</p>
            <Button onClick={loadOrGeneratePairing} className="mt-4">
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Countdown
  if (showCountdown) {
    return <CountdownAnimation onComplete={() => setShowCountdown(false)} />;
  }

  // Game finished
  if (gameFinished) {
    const isWinner = myTotalScore > opponentTotalScore;
    const isDraw = myTotalScore === opponentTotalScore;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
        <PvPHeader />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-lg"
        >
          <Card className="text-center backdrop-blur-xl bg-white/10 border-white/20">
            <CardContent className="pt-8 pb-8">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 3 }}
              >
                <Trophy className={`h-20 w-20 mx-auto mb-4 ${
                  isWinner ? 'text-yellow-400' : isDraw ? 'text-gray-300' : 'text-red-400'
                }`} />
              </motion.div>
              <h2 className="text-3xl font-bold mb-2 text-white">
                {isWinner ? '🎉 Vitória!' : isDraw ? '🤝 Empate!' : '😔 Derrota'}
              </h2>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-green-500/20 rounded-xl p-4 border border-green-400/50">
                  <p className="text-green-300 text-sm">Você</p>
                  <p className="text-3xl font-bold text-white">{myTotalScore}</p>
                </div>
                <div className="bg-red-500/20 rounded-xl p-4 border border-red-400/50">
                  <p className="text-red-300 text-sm">{opponentProfile?.name || 'Oponente'}</p>
                  <p className="text-3xl font-bold text-white">{opponentTotalScore}</p>
                </div>
              </div>
              <p className="text-purple-200 mt-6">Voltando ao lobby...</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Question validation
  if (!questions.length || currentQuestion >= totalQuestions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
        <PvPHeader />
        <Card className="w-full max-w-lg text-center backdrop-blur-xl bg-white/10 border-white/20">
          <CardContent className="pt-6">
            <Trophy className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-white">Partida concluída!</h2>
            <p className="text-purple-200">Calculando resultados...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const timerColor = timeRemaining <= 5 ? "text-red-500" : timeRemaining <= 15 ? "text-yellow-500" : "text-cyan-400";

  // Round result screen
  if (showRoundResult && roundResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-4 flex items-center justify-center">
        <PvPHeader />
        
        <Card className="w-full max-w-2xl backdrop-blur-xl bg-white/10 border-white/20 rounded-3xl">
          <CardHeader className="text-center">
            <CardTitle className="text-white text-2xl">
              Rodada {currentQuestion + 1} - Resultado
            </CardTitle>
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 4, ease: "linear" }}
              className="h-1 bg-cyan-400 rounded-full mt-4"
            />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {/* You */}
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className={`p-6 rounded-xl border-2 ${
                  roundResult.myCorrect ? 'bg-green-500/20 border-green-400' : 'bg-red-500/20 border-red-400'
                }`}
              >
                <div className="text-center space-y-3">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold">VOCÊ</span>
                  <div className={`text-4xl mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
                    roundResult.myCorrect ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    {roundResult.myAnswer === -1 ? '⏰' : roundResult.myCorrect ? '✓' : '✗'}
                  </div>
                  <p className="text-white font-semibold">
                    {roundResult.myAnswer === -1 ? 'Tempo!' : roundResult.myCorrect ? 'Correto!' : 'Errado'}
                  </p>
                  {roundResult.myTime < 30 && (
                    <p className="text-white/70 text-sm">⏱ {roundResult.myTime.toFixed(1)}s</p>
                  )}
                  <p className="text-3xl font-bold text-yellow-400">+{roundResult.myPoints}</p>
                </div>
              </motion.div>

              {/* Opponent */}
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className={`p-6 rounded-xl border-2 ${
                  roundResult.opponentCorrect ? 'bg-green-500/20 border-green-400' : 'bg-red-500/20 border-red-400'
                }`}
              >
                <div className="text-center space-y-3">
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {opponentProfile?.name || 'OPONENTE'}
                  </span>
                  <div className={`text-4xl mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
                    roundResult.opponentCorrect ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    {roundResult.opponentCorrect ? '✓' : '✗'}
                  </div>
                  <p className="text-white font-semibold">
                    {roundResult.opponentCorrect ? 'Correto!' : 'Errado'}
                  </p>
                  {roundResult.opponentTime < 30 && (
                    <p className="text-white/70 text-sm">⏱ {roundResult.opponentTime.toFixed(1)}s</p>
                  )}
                  <p className="text-3xl font-bold text-yellow-400">+{roundResult.opponentPoints}</p>
                </div>
              </motion.div>
            </div>

            {/* Total scores */}
            <div className="flex justify-center gap-8 pt-4 border-t border-white/20">
              <div className="text-center">
                <p className="text-white/60 text-sm">Seu Total</p>
                <p className="text-2xl font-bold text-white">{myTotalScore} pts</p>
              </div>
              <div className="text-center">
                <p className="text-white/60 text-sm">Total Oponente</p>
                <p className="text-2xl font-bold text-white">{opponentTotalScore} pts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main game screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-4">
      <PvPHeader />
      
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
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
                <span className="text-white font-medium">{opponentProfile?.name || 'Oponente'}</span>
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
            animate={{ scale: timeRemaining <= 5 ? [1, 1.1, 1] : 1 }}
            transition={{ duration: 0.5, repeat: timeRemaining <= 5 ? Infinity : 0 }}
            className={`flex items-center gap-2 px-6 py-3 rounded-full ${
              timeRemaining <= 5 ? 'bg-red-500/30' : 'bg-white/10'
            } backdrop-blur-xl border border-white/20`}
          >
            <Clock className={`h-6 w-6 ${timerColor}`} />
            <span className={`text-3xl font-bold ${timerColor}`}>{timeRemaining}s</span>
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
              <Loader2 className="w-6 h-6 animate-spin text-yellow-400 mx-auto mb-2" />
              <p className="text-yellow-200">Aguardando oponente responder...</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
