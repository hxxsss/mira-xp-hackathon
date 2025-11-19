import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Target, Plus, MessageSquare, TrendingUp, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
const avatars = [{
  id: 1,
  emoji: "🦄"
}, {
  id: 2,
  emoji: "🚀"
}, {
  id: 3,
  emoji: "🎯"
}, {
  id: 4,
  emoji: "⭐"
}, {
  id: 5,
  emoji: "🌈"
}];
interface Profile {
  name: string;
  avatar_id: number;
  current_xp: number;
  weekly_xp: number;
  dream_points: number;
}
  interface Goal {
    id: string;
    title: string;
    total_amount: number;
    current_amount: number;
    target_date?: string;
  }
const Dashboard = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    loadData();
  }, []);
  const loadData = async () => {
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/");
        return;
      }

      // Load profile
      const {
        data: profileData,
        error: profileError
      } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (profileError) throw profileError;
      setProfile(profileData);

      // Load active goal
      const {
        data: goalData,
        error: goalError
      } = await supabase.from("goals").select("*").eq("user_id", user.id).eq("is_active", true).order("created_at", {
        ascending: false
      }).limit(1).single();
      if (goalError && goalError.code !== "PGRST116") throw goalError;
      setGoal(goalData);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };
  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-primary-foreground animate-pulse" />
          </div>
          <p className="text-muted-foreground">Carregando seu painel...</p>
        </div>
      </div>;
  }
  const progress = goal ? Math.min(goal.current_amount / goal.total_amount * 100, 100) : 0;
  const level = Math.floor((profile?.current_xp || 0) / 100) + 1;
  const xpProgress = (profile?.current_xp || 0) % 100 / 100;
  return <div className="min-h-screen bg-background p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{
        opacity: 0,
        y: -20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-gradient">DreamUp</h1>
          </div>
          <Button variant="outline" size="icon" onClick={handleLogout} className="rounded-2xl">
            <LogOut className="w-5 h-5" />
          </Button>
        </motion.div>

        {/* Welcome Message */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.1
      }} className="mb-8">
          <h2 className="text-2xl font-bold mb-2">
            Bem-vindo de volta, {profile?.name}! 👋
          </h2>
          <p className="text-muted-foreground">
            Continue o ótimo trabalho na sua jornada de economia
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Goal Tracker - Spans 2 columns */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.2
        }} className="lg:col-span-2">
            <Card className="glass-card p-8 rounded-3xl h-full">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold mb-1">Sua Meta dos Sonhos</h3>
                  <p className="text-muted-foreground">
                    {goal ? goal.title : "Nenhuma meta ativa"}
                  </p>
                </div>
                <Target className="w-8 h-8 text-primary" />
              </div>

              {goal ? <>
                  <div className="mb-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-3xl font-bold">
                        ${goal.current_amount.toFixed(2)}
                      </span>
                      <span className="text-xl text-muted-foreground">
                        / ${goal.total_amount.toFixed(2)}
                      </span>
                    </div>
                    <Progress value={progress} className="h-4 rounded-full" />
                    {goal.target_date && (
                      <p className="text-sm text-muted-foreground mt-3">
                        Meta prevista para: {new Date(goal.target_date).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-success" />
                    <span className="text-muted-foreground">
                      {progress.toFixed(0)}% concluído
                    </span>
                  </div>
                </> : <p className="text-muted-foreground">
                  Crie sua primeira meta para começar a acompanhar!
                </p>}
            </Card>
          </motion.div>

          {/* Avatar Card */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.3
        }}>
            <Card className="glass-card p-8 rounded-3xl h-full">
              <h3 className="text-xl font-semibold mb-6">Seu Mascote</h3>
              <div className="flex flex-col items-center">
                <div className="text-8xl mb-4">
                  {avatars.find(a => a.id === profile?.avatar_id)?.emoji}
                </div>
                <div className="w-full">
                  <div className="flex justify-between mb-2 text-sm">
                    <span className="font-semibold">Nível {level}</span>
                    <span className="text-muted-foreground">
                      {profile?.current_xp}XP
                    </span>
                  </div>
                  <Progress value={xpProgress * 100} className="h-2 rounded-full" />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.4
        }} className="lg:col-span-3">
            <Card className="glass-card p-8 rounded-3xl">
              <h3 className="text-xl font-semibold mb-6">Ações Rápidas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button size="lg" className="rounded-2xl gradient-primary hover:opacity-90 transition-opacity h-20 text-lg">
                  <Plus className="w-6 h-6 mr-2" />
                  Adicionar Economia
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/oracle")} className="rounded-2xl h-20 text-lg hover-lift text-[#4c0181] bg-violet-950 hover:bg-violet-800 font-extralight">
                  <MessageSquare className="w-6 h-6 mr-2" />
                  Consultar Oráculo
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>;
};
export default Dashboard;