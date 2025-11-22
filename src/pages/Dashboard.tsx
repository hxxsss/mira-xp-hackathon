import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Sparkles, MessageSquare, User, Lock, Target, TrendingUp, Wallet, Trophy, Zap, Coins } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { GoalDetailsModal } from "@/components/modules/GoalDetailsModal";
import { CoverFlowCarousel } from "@/components/CoverFlowCarousel";
import { GoalForm } from "@/components/financas/GoalForm";

const avatars = [
  { id: 1, emoji: "🦄" },
  { id: 2, emoji: "🚀" },
  { id: 3, emoji: "🎯" },
  { id: 4, emoji: "⭐" },
  { id: 5, emoji: "🌈" }
];

interface LearningModule {
  id: string;
  number: string;
  title: string;
  description: string;
  icon: string;
  card_color: string;
  icon_bg: string;
  order_index: number;
  track_id: string;
  status: 'locked' | 'unlocked' | 'in_progress' | 'completed';
  progress_percent: number;
  xp_reward: number;
  points_reward: number;
}

interface LearningTrack {
  id: string;
  name: string;
  description: string;
  order_index: number;
  background_color: string;
  icon: string;
  status: 'locked' | 'unlocked' | 'completed';
  modules: LearningModule[];
}

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
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);
  const [tracks, setTracks] = useState<LearningTrack[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [goalFormOpen, setGoalFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/login");
        return;
      }

      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (profileError) throw profileError;

      // Load active goal
      const { data: goalData } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      // Load learning tracks
      const { data: tracksData } = await supabase
        .from('learning_tracks')
        .select('*')
        .order('order_index');

      // Load learning modules
      const { data: modules } = await supabase
        .from('learning_modules')
        .select('*')
        .order('order_index');

      // Load user module progress
      const { data: moduleProgress } = await supabase
        .from('user_module_progress')
        .select('*')
        .eq('user_id', user.id);

      // Load user track progress
      const { data: trackProgress } = await supabase
        .from('user_track_progress')
        .select('*')
        .eq('user_id', user.id);

      // Initialize first track and module if no progress exists
      if (tracksData && tracksData.length > 0 && (!trackProgress || trackProgress.length === 0)) {
        // Unlock first track
        await supabase
          .from('user_track_progress')
          .insert({
            user_id: user.id,
            track_id: tracksData[0].id,
            status: 'unlocked'
          });

        // Unlock first module
        const firstModule = modules?.find(m => m.track_id === tracksData[0].id);
        if (firstModule) {
          await supabase
            .from('user_module_progress')
            .insert({
              user_id: user.id,
              module_id: firstModule.id,
              status: 'unlocked'
            });
        }
        
        // Reload data
        const { data: newTrackProgress } = await supabase
          .from('user_track_progress')
          .select('*')
          .eq('user_id', user.id);

        const { data: newModuleProgress } = await supabase
          .from('user_module_progress')
          .select('*')
          .eq('user_id', user.id);

        buildTracksWithModules(tracksData, modules, newModuleProgress, newTrackProgress);
      } else {
        buildTracksWithModules(tracksData, modules, moduleProgress, trackProgress);
      }

      setProfile(profileData);
      setGoal(goalData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const buildTracksWithModules = (
    tracksData: any[],
    modules: any[],
    moduleProgress: any[],
    trackProgress: any[]
  ) => {
    const tracksWithModules = tracksData?.map(track => {
      const trackUserProgress = trackProgress?.find(p => p.track_id === track.id);
      const trackModules = modules?.filter(m => m.track_id === track.id).map(module => {
        const userProgress = moduleProgress?.find(p => p.module_id === module.id);
        return {
          ...module,
          status: userProgress?.status || 'locked',
          progress_percent: userProgress?.progress_percent || 0
        } as LearningModule;
      }) || [];

      return {
        ...track,
        status: trackUserProgress?.status || 'locked',
        modules: trackModules
      } as LearningTrack;
    }) || [];

    setTracks(tracksWithModules);

    // Set current track to first unlocked/in-progress track
    const activeTrackIndex = tracksWithModules.findIndex(
      t => t.status === 'unlocked' || t.modules.some(m => m.status === 'in_progress' || m.status === 'unlocked')
    );
    setCurrentTrackIndex(activeTrackIndex >= 0 ? activeTrackIndex : 0);
  };

  const handleModuleClick = (moduleId: string, status: string, trackStatus: string) => {
    if (trackStatus === "locked") {
      toast({
        title: "🔒 Trilha Bloqueada",
        description: "Complete a trilha anterior para desbloquear!",
        variant: "destructive"
      });
      return;
    }

    if (status === "locked") {
      toast({
        title: "🔒 Módulo Bloqueado",
        description: "Complete o módulo anterior para desbloquear!",
        variant: "destructive"
      });
      return;
    }
    
    navigate(`/module/${moduleId}`);
  };

  const handleTrackChange = (trackIndex: number) => {
    setCurrentTrackIndex(trackIndex);
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-background geometric-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  const selectedAvatar = avatars.find(a => a.id === profile?.avatar_id) || avatars[0];
  const progressPercentage = goal ? Math.min((Number(goal.current_amount) / Number(goal.total_amount)) * 100, 100) : 0;
  const currentTrack = tracks[currentTrackIndex];
  const currentBgColor = currentTrack?.background_color || '#7C3AED';
  
  // Determina a classe CSS baseada no nome da trilha
  const getTrackClassName = () => {
    if (!currentTrack) return '';
    const trackName = currentTrack.name.toLowerCase();
    if (trackName.includes('organização')) return 'track-organizacao';
    if (trackName.includes('aceleração')) return 'track-aceleracao';
    return ''; // Mentalidade (padrão)
  };

  return (
    <div 
      className={cn(
        "relative h-screen overflow-hidden flex flex-col gradient-background geometric-bg",
        getTrackClassName()
      )}
    >
      {/* Meteoros Neon - Variação de espessura e distribuição */}
      {/* Linhas finas (2-4px) */}
      <div className="neon-line neon-line-cyan" style={{ width: '3px', height: '220px', left: '5%', animationDelay: '0s', animationDuration: '4.2s' }} />
      <div className="neon-line neon-line-pink" style={{ width: '2px', height: '280px', left: '15%', animationDelay: '1.5s', animationDuration: '5.8s' }} />
      <div className="neon-line neon-line-cyan" style={{ width: '4px', height: '240px', left: '60%', animationDelay: '3.2s', animationDuration: '4.5s' }} />
      <div className="neon-line neon-line-pink" style={{ width: '3px', height: '200px', left: '75%', animationDelay: '2.1s', animationDuration: '5.2s' }} />
      <div className="neon-line neon-line-cyan" style={{ width: '2px', height: '260px', left: '-8%', animationDelay: '4.8s', animationDuration: '4.8s' }} />
      
      {/* Linhas médias (5-8px) */}
      <div className="neon-line neon-line-pink" style={{ width: '6px', height: '350px', left: '10%', animationDelay: '0.8s', animationDuration: '5s' }} />
      <div className="neon-line neon-line-cyan" style={{ width: '7px', height: '420px', left: '25%', animationDelay: '2.5s', animationDuration: '4.3s' }} />
      <div className="neon-line neon-line-pink" style={{ width: '5px', height: '380px', left: '35%', animationDelay: '1.2s', animationDuration: '5.5s' }} />
      <div className="neon-line neon-line-cyan" style={{ width: '8px', height: '400px', left: '50%', animationDelay: '3.8s', animationDuration: '4.7s' }} />
      <div className="neon-line neon-line-pink" style={{ width: '6px', height: '340px', left: '65%', animationDelay: '5.2s', animationDuration: '5.3s' }} />
      <div className="neon-line neon-line-cyan" style={{ width: '7px', height: '360px', left: '-5%', animationDelay: '1.8s', animationDuration: '4.9s' }} />
      
      {/* Linhas grossas (10-14px) */}
      <div className="neon-line neon-line-cyan" style={{ width: '12px', height: '500px', left: '20%', animationDelay: '0.3s', animationDuration: '5.8s' }} />
      <div className="neon-line neon-line-pink" style={{ width: '14px', height: '550px', left: '40%', animationDelay: '2.9s', animationDuration: '4.2s' }} />
      <div className="neon-line neon-line-cyan" style={{ width: '10px', height: '480px', left: '55%', animationDelay: '4.5s', animationDuration: '5.6s' }} />
      <div className="neon-line neon-line-pink" style={{ width: '13px', height: '520px', left: '70%', animationDelay: '1.1s', animationDuration: '4.4s' }} />
      <div className="neon-line neon-line-cyan" style={{ width: '11px', height: '460px', left: '80%', animationDelay: '3.5s', animationDuration: '5.1s' }} />
      <div className="neon-line neon-line-pink" style={{ width: '14px', height: '600px', left: '0%', animationDelay: '5.8s', animationDuration: '3.8s' }} />
      <div className="neon-line neon-line-cyan" style={{ width: '12px', height: '540px', left: '45%', animationDelay: '6.5s', animationDuration: '4.6s' }} />
      
      {/* Linhas extras para densidade */}
      <div className="neon-line neon-line-pink" style={{ width: '4px', height: '300px', left: '30%', animationDelay: '4.2s', animationDuration: '5.4s' }} />
      <div className="neon-line neon-line-cyan" style={{ width: '9px', height: '440px', left: '12%', animationDelay: '6.8s', animationDuration: '4.1s' }} />
      <div className="neon-line neon-line-pink" style={{ width: '5px', height: '320px', left: '72%', animationDelay: '2.7s', animationDuration: '5.7s' }} />
      <div className="neon-line neon-line-cyan" style={{ width: '8px', height: '390px', left: '58%', animationDelay: '0.5s', animationDuration: '4.9s' }} />
      <div className="neon-line neon-line-pink" style={{ width: '11px', height: '510px', left: '85%', animationDelay: '3.9s', animationDuration: '5.2s' }} />

      {/* HUD - Top Navigation */}
      <div className="flex-shrink-0 z-50 p-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          {/* Left: Profile, Ranking, Financas & Logout */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/profile')}
              className="flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 hover:scale-110 transition-all group"
              title="Perfil"
            >
              <span className="text-2xl group-hover:scale-125 transition-transform">{avatars.find(a => a.id === profile?.avatar_id)?.emoji || '🦄'}</span>
            </button>

          <button 
            onClick={() => navigate('/ranking')}
            className="flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 hover:scale-110 transition-all"
            title="Ranking"
          >
            <Trophy className="w-6 h-6" />
          </button>

          <button 
            onClick={() => navigate('/financas')}
            className="flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 hover:scale-110 transition-all"
            title="Finanças"
          >
            <Wallet className="w-6 h-6" />
          </button>
          </div>

          {/* Center: Logo */}
          <div className="text-center relative">
            <h1 className="text-6xl md:text-7xl font-logo font-bold tracking-[0.3em] relative">
              {/* Glow neon effect */}
              <span className="absolute inset-0 blur-2xl bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 opacity-70 animate-pulse"></span>
              
              {/* Texto principal branco com sombras neon */}
              <span className="relative text-white drop-shadow-[0_0_25px_rgba(168,85,247,0.8)] drop-shadow-[0_0_50px_rgba(236,72,153,0.6)]">
                MIRA
              </span>
            </h1>
          </div>

          {/* Right: Goal + Stats */}
          <div className="flex items-center gap-2 justify-end">
            {/* Wrapper vertical para empilhar Meta e Stats */}
            <div className="flex flex-col gap-2 items-end">
              
              {/* Enhanced Goal Display */}
              {goal ? (
                <motion.button
                  onClick={() => setGoalModalOpen(true)}
                  className="relative flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-md rounded-2xl text-white hover:from-white/30 hover:to-white/20 transition-all group overflow-hidden"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Animated Background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Ícone MAIOR e mais vibrante */}
                  <div className="relative">
                    {/* Glow effect pulsante */}
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 rounded-full blur-2xl opacity-60 animate-pulse" />
                    
                    {/* Container do ícone */}
                    <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 flex items-center justify-center shadow-2xl ring-4 ring-white/30">
                      <Target className="w-8 h-8 text-white" strokeWidth={3} />
                    </div>
                    
                    {/* Badge de porcentagem */}
                    <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-xs font-black text-white ring-2 ring-white shadow-lg">
                      {Math.round(progressPercentage)}%
                    </div>
                  </div>
                  
                  <div className="hidden lg:block text-left min-w-[180px] relative z-10">
                    <div className="text-xs text-white font-semibold leading-tight">{goal.title}</div>
                    <div className="relative h-2 bg-white/20 rounded-full mt-1 overflow-hidden">
                      <motion.div
                        className="absolute inset-y-0 left-0 rounded-full shadow-lg"
                        style={{
                          background: progressPercentage > 80 
                            ? 'linear-gradient(90deg, hsl(142 76% 36%), hsl(142 70% 50%))' 
                            : progressPercentage > 40
                            ? 'linear-gradient(90deg, hsl(45 93% 47%), hsl(45 90% 60%))'
                            : 'linear-gradient(90deg, hsl(280 80% 50%), hsl(320 80% 60%))'
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-xs mt-1">
                      <span className="text-white/80 font-medium">R$ {(goal.current_amount / 1000).toFixed(1)}k</span>
                      <span className="font-bold text-accent">{Math.round(progressPercentage)}%</span>
                    </div>
                  </div>
                  <span className="lg:hidden font-bold text-accent text-lg relative z-10">{Math.round(progressPercentage)}%</span>
                </motion.button>
              ) : (
                <motion.button
                  onClick={() => {
                    setEditingGoal(null);
                    setGoalFormOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent/30 to-primary/30 backdrop-blur-md rounded-full text-white hover:from-accent/40 hover:to-primary/40 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Target className="w-5 h-5" />
                  <span className="hidden lg:inline font-medium">Criar Meta</span>
                </motion.button>
              )}

              {/* Stats */}
              <div className="flex items-center gap-2">
                <div className="group relative px-3 py-1.5 bg-gradient-to-r from-purple-500/30 to-pink-500/30 backdrop-blur-md rounded-full hover:from-purple-500/40 hover:to-pink-500/40 transition-all hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-0 group-hover:opacity-20 blur-xl transition-opacity" />
                  <div className="flex items-center gap-1.5 relative z-10">
                    <div className="w-5 h-5 rounded-md bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Zap className="w-3 h-3 text-white" strokeWidth={3} />
                    </div>
                    <span className="text-xs text-white font-bold">{profile?.current_xp || 0}</span>
                  </div>
                </div>
                <div className="group relative px-3 py-1.5 bg-gradient-to-r from-yellow-500/30 to-orange-500/30 backdrop-blur-md rounded-full hover:from-yellow-500/40 hover:to-orange-500/40 transition-all hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full opacity-0 group-hover:opacity-20 blur-xl transition-opacity" />
                  <div className="flex items-center gap-1.5 relative z-10">
                    <div className="w-5 h-5 rounded-md bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                      <Coins className="w-3 h-3 text-white" strokeWidth={3} />
                    </div>
                    <span className="text-xs text-white font-bold">{profile?.dream_points || 0}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>


      {/* Track Navigation */}
      <div className="flex-shrink-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center gap-4">
            {tracks.map((track, index) => (
              <button
                key={track.id}
                onClick={() => handleTrackChange(index)}
                className={`relative px-6 py-2 rounded-full font-bold transition-all border ${
                  index === currentTrackIndex
                    ? 'bg-white text-gray-900 scale-110 shadow-xl border-white'
                    : track.status === 'locked'
                    ? 'bg-white/5 text-white/50 hover:bg-white/10 border-white/10 opacity-60'
                    : 'bg-white/5 text-white hover:bg-white/15 border-white/10 opacity-80'
                }`}
              >
                <span className="mr-2">{track.icon}</span>
                {track.name}
                {track.status === 'locked' && (
                  <Lock className="inline-block ml-2 w-4 h-4" />
                )}
                {track.status === 'completed' && (
                  <span className="ml-2">✓</span>
                )}
              </button>
            ))}
          </div>
          {currentTrack && (
            <motion.div
              key={currentTrack.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mt-4"
            >
              <p className="text-white/90 text-lg">{currentTrack.description}</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Main Stage - Cover Flow Carousel */}
      <div className="relative z-10 flex-1 flex items-center justify-center py-8">
        <div className="w-full px-4">
          {currentTrack && (
            <CoverFlowCarousel
              items={currentTrack.modules.map(module => ({
                id: module.id,
                number: module.number,
                title: module.title,
                description: module.description,
                icon: module.icon,
                color: module.card_color,
                status: module.status,
                progress: module.progress_percent
              }))}
              onItemClick={(id, status) => handleModuleClick(id, status, currentTrack.status)}
            />
          )}
        </div>
      </div>

      {/* Floating Oracle Button */}
      <button
        onClick={() => navigate('/oracle')}
        className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full shadow-2xl hover:scale-110 transition-all flex items-center justify-center text-white group relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full blur-xl opacity-60 group-hover:opacity-80 transition-opacity" />
        <Sparkles className="w-8 h-8 relative z-10 group-hover:rotate-12 transition-transform" strokeWidth={2.5} />
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-pulse">
          <Sparkles className="w-3 h-3 text-white" strokeWidth={3} />
        </div>
      </button>

      {/* Goal Details Modal */}
      <GoalDetailsModal 
        goal={goal}
        open={goalModalOpen}
        onOpenChange={setGoalModalOpen}
        onEdit={() => {
          setEditingGoal(goal);
          setGoalModalOpen(false);
          setGoalFormOpen(true);
        }}
      />

      {/* Goal Form Modal */}
      <GoalForm
        goal={editingGoal}
        open={goalFormOpen}
        onOpenChange={setGoalFormOpen}
        onSuccess={() => {
          loadData();
          setEditingGoal(null);
        }}
      />

    </div>
  );
};

export default Dashboard;
