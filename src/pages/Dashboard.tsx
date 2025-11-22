import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Lock, Target, Wallet, Trophy, Zap, Coins, Play, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { GoalDetailsModal } from "@/components/modules/GoalDetailsModal";
import { CoverFlowCarousel } from "@/components/CoverFlowCarousel";
import { GoalForm } from "@/components/financas/GoalForm";

// Mascotes/Skins do jogo (simulando com emojis, depois trocar por imagens)
const avatars = [
  { id: 1, emoji: "🐻", name: "Urso" },
  { id: 2, emoji: "🦁", name: "Leão" },
  { id: 3, emoji: "🐰", name: "Coelho" },
  { id: 4, emoji: "🐵", name: "Macaco" },
  { id: 5, emoji: "🦅", name: "Pássaro" }
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
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);

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

  const handleAvatarChange = async (avatarId: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('profiles')
        .update({ avatar_id: avatarId })
        .eq('id', user.id);

      setProfile(prev => prev ? { ...prev, avatar_id: avatarId } : null);
      setShowAvatarSelector(false);
      toast({
        title: "✨ Avatar Atualizado!",
        description: "Sua skin foi trocada com sucesso!",
      });
    } catch (error) {
      console.error("Error updating avatar:", error);
    }
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
        "relative h-screen overflow-hidden flex flex-col gradient-background transition-colors duration-500",
        getTrackClassName()
      )}
    >
      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
      }} />

      {/* Game HUD - Top Header */}
      <div className="flex-shrink-0 z-50 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Top Bar: Avatar + Logo + Resources */}
          <div className="flex items-center justify-between mb-4">
            
            {/* LEFT: Avatar Grande (Clicável para trocar skin) */}
            <div className="relative">
              <button
                onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 rounded-full blur-lg opacity-75 group-hover:opacity-100 animate-pulse" />
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 p-1 ring-4 ring-white/30 hover:ring-white/50 transition-all">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                    <span className="text-4xl group-hover:scale-110 transition-transform">
                      {avatars.find(a => a.id === profile?.avatar_id)?.emoji || '🐻'}
                    </span>
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center ring-2 ring-white">
                  <span className="text-xs">✨</span>
                </div>
              </button>

              {/* Avatar Selector Dropdown */}
              <AnimatePresence>
                {showAvatarSelector && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.9 }}
                    className="absolute top-24 left-0 glass-card-heavy rounded-3xl p-4 shadow-2xl z-50 min-w-[280px]"
                  >
                    <h3 className="text-white font-bold mb-3 text-center">Escolha seu Avatar</h3>
                    <div className="grid grid-cols-5 gap-3">
                      {avatars.map((avatar) => (
                        <button
                          key={avatar.id}
                          onClick={() => handleAvatarChange(avatar.id)}
                          className={cn(
                            "w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-all hover:scale-110",
                            profile?.avatar_id === avatar.id && "ring-4 ring-yellow-400 scale-110"
                          )}
                        >
                          <span className="text-2xl">{avatar.emoji}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* CENTER: Logo MIRA */}
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-black tracking-wider text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]">
                MIRA
              </h1>
            </div>

            {/* RIGHT: Resources (XP + Coins) + Quick Actions */}
            <div className="flex flex-col items-end gap-2">
              {/* XP Bar (Horizontal, estilo Duolingo) */}
              <div className="glass-card-heavy rounded-full px-4 py-2 min-w-[140px]">
                <div className="flex items-center justify-between gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                    <Zap className="w-5 h-5 text-white" strokeWidth={3} />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-white/70 font-semibold">XP</div>
                    <div className="text-lg font-black text-white leading-none">{profile?.current_xp || 0}</div>
                  </div>
                </div>
              </div>

              {/* Coins */}
              <div className="glass-card-heavy rounded-full px-4 py-2 min-w-[140px]">
                <div className="flex items-center justify-between gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                    <Coins className="w-5 h-5 text-white" strokeWidth={3} />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-white/70 font-semibold">Pontos</div>
                    <div className="text-lg font-black text-white leading-none">{profile?.dream_points || 0}</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions (compact) */}
              <div className="flex gap-2">
                <button 
                  onClick={() => navigate('/ranking')}
                  className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 hover:scale-110 transition-all flex items-center justify-center"
                  title="Ranking"
                >
                  <Trophy className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => navigate('/financas')}
                  className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 hover:scale-110 transition-all flex items-center justify-center"
                  title="Finanças"
                >
                  <Wallet className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Goal Indicator (if exists) - Compact */}
          {goal && (
            <motion.button
              onClick={() => setGoalModalOpen(true)}
              className="w-full glass-card-heavy rounded-2xl px-4 py-3 hover:scale-[1.02] transition-all"
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <Target className="w-6 h-6 text-white" strokeWidth={3} />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-xs text-white/80 font-semibold">{goal.title}</div>
                  <div className="relative h-2 bg-white/20 rounded-full mt-1 overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{
                        background: progressPercentage > 80 
                          ? 'linear-gradient(90deg, hsl(142 76% 36%), hsl(142 70% 50%))' 
                          : 'linear-gradient(90deg, hsl(280 80% 50%), hsl(320 80% 60%))'
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-white">{Math.round(progressPercentage)}%</div>
                  <div className="text-xs text-white/70">R$ {(goal.current_amount / 1000).toFixed(1)}k</div>
                </div>
              </div>
            </motion.button>
          )}
        </div>
      </div>


      {/* Track Navigation (Mundo / Trilhas) */}
      <div className="flex-shrink-0 z-40 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center gap-3">
            {tracks.map((track, index) => (
              <button
                key={track.id}
                onClick={() => handleTrackChange(index)}
                className={cn(
                  "relative px-5 py-3 rounded-2xl font-bold transition-all duration-300",
                  index === currentTrackIndex
                    ? 'glass-card-heavy text-white scale-105 shadow-2xl ring-2 ring-white/50'
                    : track.status === 'locked'
                    ? 'bg-white/5 text-white/40 cursor-not-allowed'
                    : 'bg-white/10 text-white/80 hover:bg-white/20 hover:scale-105'
                )}
                disabled={track.status === 'locked'}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{track.icon}</span>
                  <span className="text-sm hidden md:inline">{track.name}</span>
                </div>
                {track.status === 'locked' && (
                  <Lock className="absolute -top-2 -right-2 w-5 h-5 text-white/60" />
                )}
                {track.status === 'completed' && (
                  <CheckCircle2 className="absolute -top-2 -right-2 w-5 h-5 text-green-400" />
                )}
              </button>
            ))}
          </div>
          {currentTrack && (
            <motion.div
              key={currentTrack.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mt-3"
            >
              <p className="text-white/90 font-semibold text-base">{currentTrack.description}</p>
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
