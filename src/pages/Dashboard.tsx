import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Target, MessageSquare, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { GoalDetailsModal } from "@/components/modules/GoalDetailsModal";
import { CoverFlowCarousel } from "@/components/CoverFlowCarousel";
import { GoalForm } from "@/components/financas/GoalForm";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

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
    <SidebarProvider>
      <div className="min-h-screen w-full flex">
        <DashboardSidebar 
          tracks={tracks}
          currentTrackIndex={currentTrackIndex}
          onTrackChange={handleTrackChange}
        />
        
        <main className="flex-1 flex flex-col">
          {/* Background with neon gradient */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, hsl(280 100% 15%) 0%, hsl(320 90% 20%) 35%, hsl(220 95% 25%) 70%, hsl(280 100% 15%) 100%)'
            }}
          >
            {/* Abstract pattern */}
            <div className="absolute inset-0 opacity-5">
              <svg className="w-full h-full">
                <defs>
                  <pattern id="neon-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                    <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#neon-grid)" />
              </svg>
            </div>
            
            {/* Breathing animation */}
            <div 
              className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 breathing-animation" 
            />
          </div>

          {/* Header */}
          <header className="flex-shrink-0 z-50 p-4 border-b border-white/10 relative">
            <div className="max-w-7xl mx-auto flex justify-between items-start">
              
              {/* Left: Menu Hambúrguer + Logo MIRA */}
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-white hover:text-white/80" />
                <h1 className="text-5xl font-black tracking-wider relative">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9D4EDD] via-[#FF06B7] to-[#3D5AFE] drop-shadow-[0_0_30px_rgba(157,78,221,0.8)]">
                    MIRA
                  </span>
                  {/* Efeito de brilho pulsante */}
                  <span className="absolute inset-0 text-transparent bg-clip-text bg-gradient-to-r from-[#9D4EDD] via-[#FF06B7] to-[#3D5AFE] blur-xl opacity-50 animate-pulse">
                    MIRA
                  </span>
                </h1>
              </div>
              
              {/* Right: Usuário + Meta */}
              <div className="flex flex-col items-end gap-2">
                {/* Linha 1: Nome do usuário */}
                <button 
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all border border-white/20"
                >
                  <span className="text-xl">{selectedAvatar.emoji}</span>
                  <span className="font-semibold">{profile?.name || 'Usuário'}</span>
                </button>
                
                {/* Linha 2: Meta (abaixo do nome) */}
                {goal ? (
                  <motion.button
                    onClick={() => setGoalModalOpen(true)}
                    className="flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl text-white hover:bg-white/20 transition-all border border-white/20"
                    whileHover={{ scale: 1.05 }}
                  >
                    {/* Ícone da meta com brilho neon */}
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 rounded-full blur-xl opacity-60 animate-pulse" />
                      <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 flex items-center justify-center shadow-xl ring-2 ring-white/30">
                        <Target className="w-6 h-6 text-white" strokeWidth={3} />
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-xs font-black text-white ring-2 ring-white">
                        {Math.round(progressPercentage)}%
                      </div>
                    </div>
                    
                    {/* Info da meta */}
                    <div className="text-left">
                      <div className="text-xs font-semibold">{goal.title}</div>
                      <div className="text-xs text-white/70">
                        R$ {(goal.current_amount / 1000).toFixed(1)}k / R$ {(goal.total_amount / 1000).toFixed(1)}k
                      </div>
                    </div>
                  </motion.button>
                ) : (
                  <button
                    onClick={() => { setEditingGoal(null); setGoalFormOpen(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full text-white hover:from-orange-600 hover:to-pink-600 transition-all shadow-lg"
                  >
                    <Target className="w-4 h-4" />
                    <span className="text-sm font-medium">Criar Meta</span>
                  </button>
                )}
                
                {/* Stats (XP e Dream Points) */}
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                    <span className="text-xs text-white font-bold">⚡ {profile?.current_xp || 0}</span>
                  </div>
                  <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                    <span className="text-xs text-white font-bold">💎 {profile?.dream_points || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </header>

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
        </main>
      </div>

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

    </SidebarProvider>
  );
};

export default Dashboard;
