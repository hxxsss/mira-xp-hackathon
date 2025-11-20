import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Sparkles, MessageSquare, LogOut, User, Lock, Target, TrendingUp, Wallet, Trophy } from "lucide-react";
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
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
      <div className="min-h-screen bg-[#7C3AED] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  const selectedAvatar = avatars.find(a => a.id === profile?.avatar_id) || avatars[0];
  const progressPercentage = goal ? Math.min((Number(goal.current_amount) / Number(goal.total_amount)) * 100, 100) : 0;
  const currentTrack = tracks[currentTrackIndex];
  const currentBgColor = currentTrack?.background_color || '#7C3AED';

  return (
    <div 
      className="relative h-screen overflow-hidden transition-colors duration-700 flex flex-col"
      style={{ backgroundColor: currentBgColor }}
    >
      {/* Diagonal Lines Background - Rups Style */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="diagonal-lines" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="40" y2="40" stroke="white" strokeWidth="2" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#diagonal-lines)" />
        </svg>
      </div>

      {/* HUD - Top Navigation */}
      <div className="flex-shrink-0 z-50 p-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          {/* Left: Profile, Ranking & Financas */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all"
            >
              <span className="text-xl">{avatars.find(a => a.id === profile?.avatar_id)?.emoji || '🦄'}</span>
              <span className="hidden md:inline font-medium">{profile?.name || 'Perfil'}</span>
            </button>

            <button 
              onClick={() => navigate('/ranking')}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all"
            >
              <Trophy className="w-5 h-5" />
              <span className="hidden md:inline font-medium">Ranking</span>
            </button>

            <button 
              onClick={() => navigate('/financas')}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all"
            >
              <Wallet className="w-5 h-5" />
              <span className="hidden md:inline font-medium">Finanças</span>
            </button>
          </div>

          {/* Center: Logo */}
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wider">
              DreamUp
            </h1>
          </div>

          {/* Right: Goal + Gamified Stats */}
          <div className="flex items-center gap-2">
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

            {/* Gamified Stats */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full">
                <span className="text-xs text-white font-bold">⚡ {profile?.current_xp || 0}</span>
              </div>
              <div className="px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full">
                <span className="text-xs text-white font-bold">💎 {profile?.dream_points || 0}</span>
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
                className={`relative px-6 py-2 rounded-full font-bold transition-all ${
                  index === currentTrackIndex
                    ? 'bg-white text-gray-900 scale-110 shadow-xl'
                    : track.status === 'locked'
                    ? 'bg-white/20 text-white/50 hover:bg-white/30'
                    : 'bg-white/30 text-white hover:bg-white/40'
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
        className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full shadow-2xl hover:scale-110 transition-all flex items-center justify-center text-white group"
      >
        <MessageSquare className="w-8 h-8 group-hover:rotate-12 transition-transform" />
        <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-yellow-300 animate-pulse" />
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
