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
import miraLogo from "@/assets/mira-logo.png";
import mentalidadeBadge from "@/assets/mentalidade-badge.png";
import organizacaoLocked from "@/assets/organizacao-locked.png";
import organizacaoUnlocked from "@/assets/organizacao-unlocked.png";
import aceleracaoLocked from "@/assets/aceleracao-locked.png";
import aceleracaoUnlocked from "@/assets/aceleracao-unlocked.png";

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
        "relative min-h-screen overflow-auto flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50",
        getTrackClassName()
      )}
    >
      {/* Floating decorative elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-purple-200 rounded-full opacity-20 blur-2xl animate-blob" />
      <div className="absolute top-40 right-20 w-32 h-32 bg-pink-200 rounded-full opacity-20 blur-2xl animate-blob animation-delay-2000" />
      <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-blue-200 rounded-full opacity-20 blur-2xl animate-blob animation-delay-4000" />

      {/* HUD - Top Navigation */}
      <div className="flex-shrink-0 z-50 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4 bg-white/80 backdrop-blur-lg rounded-3xl p-4 shadow-lg">
          {/* Left: Profile, Ranking, Financas */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate('/profile')}
              className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-3xl hover:shadow-lg hover:scale-105 transition-all group"
              title="Perfil"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">{avatars.find(a => a.id === profile?.avatar_id)?.emoji || '🦄'}</span>
            </button>

          <button 
            onClick={() => navigate('/ranking')}
            className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-3xl text-yellow-700 hover:shadow-lg hover:scale-105 transition-all"
            title="Ranking"
          >
            <Trophy className="w-6 h-6" />
          </button>

          <button 
            onClick={() => navigate('/financas')}
            className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-3xl text-green-700 hover:shadow-lg hover:scale-105 transition-all"
            title="Finanças"
          >
            <Wallet className="w-6 h-6" />
          </button>
          </div>

          {/* Center: Logo */}
          <div className="text-center">
            <img 
              src={miraLogo} 
              alt="MIRA" 
              className="h-12 md:h-14 w-auto object-contain"
            />
          </div>

          {/* Right: Goal + Stats */}
          <div className="flex items-center gap-2 justify-end">
            {/* Wrapper vertical para empilhar Meta e Stats */}
            <div className="flex flex-col gap-2 items-end">
              
              {/* Enhanced Goal Display */}
              {goal ? (
                <motion.button
                  onClick={() => setGoalModalOpen(true)}
                  className="relative flex items-center gap-3 px-4 py-3 bg-gradient-to-br from-pink-100 to-pink-200 rounded-3xl hover:shadow-lg transition-all group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center shadow-md">
                    <Target className="w-6 h-6 text-white" strokeWidth={2.5} />
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-400 flex items-center justify-center text-[10px] font-black text-white shadow-md">
                      {Math.round(progressPercentage)}%
                    </div>
                  </div>
                  
                  <div className="hidden lg:block text-left min-w-[140px]">
                    <div className="text-xs text-pink-700 font-bold leading-tight">{goal.title}</div>
                    <div className="relative h-1.5 bg-white/60 rounded-full mt-1 overflow-hidden">
                      <motion.div
                        className="absolute inset-y-0 left-0 rounded-full"
                        style={{
                          background: progressPercentage > 80 
                            ? 'linear-gradient(90deg, #4ade80, #22c55e)' 
                            : progressPercentage > 40
                            ? 'linear-gradient(90deg, #fbbf24, #f59e0b)'
                            : 'linear-gradient(90deg, #ec4899, #db2777)'
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] mt-0.5">
                      <span className="text-pink-600 font-medium">R$ {(goal.current_amount / 1000).toFixed(1)}k</span>
                      <span className="font-bold text-pink-700">{Math.round(progressPercentage)}%</span>
                    </div>
                  </div>
                  <span className="lg:hidden font-bold text-pink-700">{Math.round(progressPercentage)}%</span>
                </motion.button>
              ) : (
                <motion.button
                  onClick={() => {
                    setEditingGoal(null);
                    setGoalFormOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-br from-pink-100 to-pink-200 rounded-3xl text-pink-700 hover:shadow-lg transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Target className="w-5 h-5" />
                  <span className="hidden lg:inline font-bold text-sm">Criar Meta</span>
                </motion.button>
              )}

              {/* Stats */}
              <div className="flex items-center gap-2">
                <div className="px-3 py-2 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl hover:shadow-md transition-all hover:scale-105">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-xl bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center shadow-sm">
                      <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                    </div>
                    <span className="text-sm text-purple-700 font-bold">{profile?.current_xp || 0}</span>
                  </div>
                </div>
                <div className="px-3 py-2 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl hover:shadow-md transition-all hover:scale-105">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center shadow-sm">
                      <Coins className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                    </div>
                    <span className="text-sm text-yellow-700 font-bold">{profile?.dream_points || 0}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>


      {/* Track Navigation */}
      <div className="flex-shrink-0 z-40 mt-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center gap-3">
            {tracks.map((track, index) =>
              track.name.toLowerCase().includes('mentalidade') ? (
                <button
                  key={track.id}
                  onClick={() => handleTrackChange(index)}
                  className="relative transition-all hover:scale-110"
                >
                  <img 
                    src={mentalidadeBadge} 
                    alt="Mentalidade" 
                    className={`h-16 w-auto object-contain transition-all ${
                      index === currentTrackIndex
                        ? 'scale-110 drop-shadow-2xl'
                        : track.status === 'locked'
                        ? 'opacity-50 grayscale'
                        : 'opacity-80'
                    }`}
                  />
                  {track.status === 'locked' && (
                    <Lock className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-white drop-shadow-lg" />
                  )}
                  {track.status === 'completed' && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">✓</div>
                  )}
                </button>
              ) : track.name.toLowerCase().includes('organização') || track.name.toLowerCase().includes('organizacao') ? (
                <button
                  key={track.id}
                  onClick={() => handleTrackChange(index)}
                  className="relative transition-all hover:scale-110"
                >
                  <img 
                    src={track.status === 'locked' ? organizacaoLocked : organizacaoUnlocked} 
                    alt="Organização" 
                    className={`h-16 w-auto object-contain transition-all ${
                      index === currentTrackIndex
                        ? 'scale-110 drop-shadow-2xl'
                        : track.status === 'locked'
                        ? 'opacity-50'
                        : 'opacity-80'
                    }`}
                  />
                  {track.status === 'completed' && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">✓</div>
                  )}
                </button>
              ) : track.name.toLowerCase().includes('aceleração') || track.name.toLowerCase().includes('aceleracao') ? (
                <button
                  key={track.id}
                  onClick={() => handleTrackChange(index)}
                  className="relative transition-all hover:scale-110"
                >
                  <img 
                    src={track.status === 'locked' ? aceleracaoLocked : aceleracaoUnlocked} 
                    alt="Aceleração" 
                    className={`h-16 w-auto object-contain transition-all ${
                      index === currentTrackIndex
                        ? 'scale-110 drop-shadow-2xl'
                        : track.status === 'locked'
                        ? 'opacity-50'
                        : 'opacity-80'
                    }`}
                  />
                  {track.status === 'completed' && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">✓</div>
                  )}
                </button>
              ) : (
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
              )
            )}
          </div>
          {currentTrack && (
            <motion.div
              key={currentTrack.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mt-4 bg-white/60 backdrop-blur-sm rounded-3xl p-4 shadow-sm"
            >
              <p className="text-gray-700 text-base font-medium">{currentTrack.description}</p>
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
        className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-gradient-to-br from-purple-300 to-pink-300 rounded-3xl shadow-xl hover:scale-110 transition-all flex items-center justify-center text-white group"
      >
        <Sparkles className="w-8 h-8 group-hover:rotate-12 transition-transform" strokeWidth={2} />
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center shadow-md animate-pulse">
          <Sparkles className="w-3 h-3 text-white" strokeWidth={2.5} />
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
