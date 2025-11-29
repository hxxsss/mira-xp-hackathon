import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Sparkles, MessageSquare, User, Lock, Target, TrendingUp, Wallet, Trophy, Swords, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { GoalDetailsModal } from "@/components/modules/GoalDetailsModal";
import { CoverFlowCarousel } from "@/components/CoverFlowCarousel";
import { GoalForm } from "@/components/financas/GoalForm";
import { NavigationDock } from "@/components/NavigationDock";
import crystalBall from "@/assets/crystal-ball.png";

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

  // Carrega dados na montagem e quando a janela ganha foco (volta de outro módulo)
  useEffect(() => {
    loadData();

    // Recarrega dados quando a janela ganha foco (usuário volta do módulo)
    const handleFocus = () => {
      console.log("Window focused - recarregando dados do dashboard");
      loadData();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log("Nenhum usuário autenticado, redirecionando para login");
        navigate("/login");
        return;
      }

      console.log("Carregando dados para usuário:", user.id);

      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (profileError) {
        console.error("Erro ao carregar perfil:", profileError);
        toast({
          title: "Erro ao carregar perfil",
          description: "Não foi possível carregar seus dados. Tente novamente.",
          variant: "destructive"
        });
        throw profileError;
      }

      console.log("Perfil carregado:", profileData);

      // Load active goal
      const { data: goalData, error: goalError } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      if (goalError) {
        console.error("Erro ao carregar meta:", goalError);
      }

      // Load learning tracks
      const { data: tracksData, error: tracksError } = await supabase
        .from('learning_tracks')
        .select('*')
        .order('order_index');

      if (tracksError) {
        console.error("Erro ao carregar trilhas:", tracksError);
        throw tracksError;
      }

      // Load learning modules
      const { data: modules, error: modulesError } = await supabase
        .from('learning_modules')
        .select('*')
        .order('order_index');

      if (modulesError) {
        console.error("Erro ao carregar módulos:", modulesError);
        throw modulesError;
      }

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
        console.log("Inicializando primeira trilha e módulo");
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
      console.log("Dados carregados com sucesso");
    } catch (error: any) {
      console.error("Erro ao carregar dados do dashboard:", error);
      toast({
        title: "Erro ao carregar dados",
        description: error.message || "Ocorreu um erro. Tente recarregar a página.",
        variant: "destructive"
      });
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

  // Variantes de animação para transição entre trilhas
  const carouselVariants = {
    enter: {
      opacity: 0,
      scale: 0.95,
    },
    center: {
      opacity: 1,
      scale: 1,
    },
    exit: {
      opacity: 0,
      scale: 0.95,
    },
  };

  const [direction, setDirection] = useState(0);
  const [prevTrackIndex, setPrevTrackIndex] = useState(0);

  // Atualiza direção da animação quando a trilha muda
  useEffect(() => {
    setDirection(currentTrackIndex > prevTrackIndex ? 1 : -1);
    setPrevTrackIndex(currentTrackIndex);
  }, [currentTrackIndex]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

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
        "relative h-screen overflow-hidden flex flex-col bg-white",
        getTrackClassName()
      )}
    >
      {/* Animated Background with Neon Lines */}
      <div className={cn(
        "fixed inset-0 z-0 geometric-bg gradient-background transition-all duration-700",
        !currentTrack?.name.toLowerCase().includes('organização') && !currentTrack?.name.toLowerCase().includes('aceleração') && "",
        currentTrack?.name.toLowerCase().includes('organização') && "track-organizacao",
        currentTrack?.name.toLowerCase().includes('aceleração') && "track-aceleracao"
      )}>
        {/* Neon Lines - Meteor Effect */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "neon-line absolute",
              i % 2 === 0 ? "neon-line-cyan" : "neon-line-pink"
            )}
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 200 + 100}px`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 3 + 4}s`
            }}
          />
        ))}
      </div>

      {/* HUD - Top Navigation */}
      <div className="flex-shrink-0 z-50 p-2 sm:p-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4 relative">
          {/* Top row on mobile: Logo + Navigation */}
          <div className="flex w-full sm:w-auto justify-between sm:justify-start items-center gap-2">
            <NavigationDock avatarId={profile?.avatar_id} />
            
            {/* Logo - visible on mobile, repositioned on desktop */}
            <div className="flex sm:absolute sm:left-1/2 sm:transform sm:-translate-x-1/2 items-center gap-1 sm:gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Target className="text-white w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-gray-900 tracking-wider font-sans">mira</span>
            </div>
          </div>
          
          {/* Bottom row on mobile: Stats only (Goal moved to separate section) */}
          <div className="flex items-center gap-2 sm:gap-4 justify-center sm:justify-end w-full sm:w-auto">

            {/* Enhanced Goal Display - Desktop only */}
            {goal ? (
              <motion.button
                onClick={() => setGoalModalOpen(true)}
                className="hidden md:flex relative items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-2.5 bg-white rounded-xl sm:rounded-2xl text-gray-900 hover:bg-gray-50 transition-all group overflow-hidden border-2 border-indigo-200 shadow-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* Icon */}
                <div className="relative">
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 rounded-full blur-2xl opacity-60 animate-pulse" />
                  
                  {/* Icon container */}
                  <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-500 flex items-center justify-center shadow-2xl ring-4 ring-white/30">
                    <Target className="w-8 h-8 text-white" strokeWidth={3} />
                  </div>
                  
                  {/* Percentage badge */}
                  <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-xs font-black text-white ring-2 ring-white shadow-lg">
                    {Math.round(progressPercentage)}%
                  </div>
                </div>
                
                <div className="text-left min-w-[140px] lg:min-w-[180px] relative z-10">
                  <div className="text-xs text-gray-900 font-semibold leading-tight">{goal.title}</div>
                  <div className="relative h-2 bg-indigo-100 rounded-full mt-1 overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full shadow-lg"
                      style={{
                        background: progressPercentage > 80 
                          ? 'linear-gradient(90deg, hsl(142 76% 36%), hsl(142 70% 50%))' 
                          : progressPercentage > 40
                          ? 'linear-gradient(90deg, hsl(45 93% 47%), hsl(45 90% 60%))'
                          : 'linear-gradient(90deg, hsl(239 84% 67%), hsl(217 91% 60%))'
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-xs mt-1">
                    <span className="text-gray-600 font-medium">R$ {(goal.current_amount / 1000).toFixed(1)}k</span>
                    <span className="font-bold text-indigo-600">{Math.round(progressPercentage)}%</span>
                  </div>
                </div>
              </motion.button>
            ) : (
              <motion.button
                onClick={() => {
                  setEditingGoal(null);
                  setGoalFormOpen(true);
                }}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-indigo-100 rounded-full text-indigo-600 hover:bg-indigo-200 transition-all border-2 border-indigo-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Target className="w-5 h-5" />
                <span className="font-medium text-sm">Criar Meta</span>
              </motion.button>
            )}

            {/* Stats - Enhanced for mobile */}
            <div className="flex sm:flex-col gap-2">
              <div className="px-3 sm:px-3 py-1.5 sm:py-1.5 bg-indigo-100 rounded-full border-2 border-indigo-200">
                <span className="text-xs sm:text-xs text-indigo-700 font-bold">⚡ {profile?.current_xp || 0} XP</span>
              </div>
              <div className="px-3 sm:px-3 py-1.5 sm:py-1.5 bg-indigo-100 rounded-full border-2 border-indigo-200">
                <span className="text-xs sm:text-xs text-indigo-700 font-bold">💎 {profile?.dream_points || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Expanded Goal Section - Only visible on mobile */}
      {goal && (
        <motion.div 
          onClick={() => setGoalModalOpen(true)}
          className="md:hidden mx-4 mb-3 p-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-indigo-200 cursor-pointer"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Header with Icon and Title */}
          <div className="flex items-center gap-3 mb-3">
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 rounded-full blur-lg opacity-60 animate-pulse" />
              
              {/* Icon container */}
              <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-500 flex items-center justify-center shadow-xl ring-2 ring-white/30">
                <Target className="w-7 h-7 text-white" strokeWidth={3} />
              </div>
              
              {/* Percentage badge */}
              <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-[10px] font-black text-white ring-2 ring-white shadow-lg">
                {Math.round(progressPercentage)}%
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-500 font-medium mb-0.5">Sua Meta</div>
              <div className="text-sm font-bold text-gray-900 truncate">{goal.title}</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-3 bg-indigo-100 rounded-full overflow-hidden mb-2">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full shadow-md"
              style={{
                background: progressPercentage > 80 
                  ? 'linear-gradient(90deg, hsl(142 76% 36%), hsl(142 70% 50%))' 
                  : progressPercentage > 40
                  ? 'linear-gradient(90deg, hsl(45 93% 47%), hsl(45 90% 60%))'
                  : 'linear-gradient(90deg, hsl(239 84% 67%), hsl(217 91% 60%))'
              }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>

          {/* Values */}
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-600">
              <span className="font-semibold text-indigo-600">R$ {(goal.current_amount / 1000).toFixed(1)}k</span>
              <span className="text-gray-400 mx-1">/</span>
              <span className="font-medium">R$ {(goal.total_amount / 1000).toFixed(1)}k</span>
            </div>
            <div className="text-xs font-bold text-indigo-600">
              {Math.round(progressPercentage)}% alcançado
            </div>
          </div>
        </motion.div>
      )}

      {/* Mobile Create Goal Button - Only visible when no goal exists */}
      {!goal && (
        <motion.button
          onClick={() => {
            setEditingGoal(null);
            setGoalFormOpen(true);
          }}
          className="md:hidden mx-4 mb-3 flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl text-indigo-600 hover:from-indigo-100 hover:to-blue-100 transition-all border-2 border-indigo-200 border-dashed"
          whileTap={{ scale: 0.98 }}
        >
          <Target className="w-5 h-5" />
          <span className="font-semibold text-sm">Criar Sua Primeira Meta</span>
        </motion.button>
      )}

      {/* Track Navigation */}
      <div className="flex-shrink-0 z-40 mt-2 sm:mt-0">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="flex justify-center gap-1.5 sm:gap-3 md:gap-4 flex-wrap">
            {tracks.map((track, index) => {
              const trackName = track.name.toLowerCase();
              const isOrganizacao = trackName.includes('organização');
              const isAceleracao = trackName.includes('aceleração');
              const isActive = index === currentTrackIndex;
              
              // Define cores específicas para cada trilha
              let activeClasses = 'bg-indigo-600 border-indigo-600';
              let hoverClasses = 'hover:bg-indigo-50 border-indigo-200';
              
              if (isOrganizacao) {
                activeClasses = 'bg-amber-500 border-amber-500';
                hoverClasses = 'hover:bg-amber-50 border-amber-200';
              } else if (isAceleracao) {
                activeClasses = 'bg-emerald-500 border-emerald-500';
                hoverClasses = 'hover:bg-emerald-50 border-emerald-200';
              }
              
              return (
                <motion.button
                  key={track.id}
                  onClick={() => handleTrackChange(index)}
                  className={`relative px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm md:text-base font-bold transition-all border-2 ${
                    isActive
                      ? `${activeClasses} text-white scale-105 sm:scale-110 shadow-xl`
                      : track.status === 'locked'
                      ? 'bg-gray-100 text-gray-400 hover:bg-gray-200 border-gray-200 opacity-60'
                      : `bg-white text-gray-700 ${hoverClasses} opacity-80`
                  }`}
                  whileHover={{ scale: track.status !== 'locked' ? 1.05 : 1 }}
                  whileTap={{ scale: track.status !== 'locked' ? 0.95 : 1 }}
                >
                  <span className="mr-1 sm:mr-2 text-sm sm:text-base">{track.icon}</span>
                  <span className="hidden sm:inline">{track.name}</span>
                  <span className="sm:hidden">{track.name.split(' ')[0]}</span>
                  {track.status === 'locked' && (
                    <Lock className="inline-block ml-1 sm:ml-2 w-3 h-3 sm:w-4 sm:h-4" />
                  )}
                  {track.status === 'completed' && (
                    <span className="ml-1 sm:ml-2">✓</span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Stage - Cover Flow Carousel */}
      <div className="relative z-10 flex-1 flex items-center justify-center py-2 sm:py-4 overflow-hidden">
        <div className="w-full px-2 sm:px-4">
          <AnimatePresence mode="wait" initial={false}>
            {currentTrack && (
              <motion.div
                key={currentTrack.id}
                variants={carouselVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  duration: 0.3,
                  ease: "easeInOut"
                }}
                className="w-full h-full flex items-center justify-center"
              >
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
                  trackName={currentTrack.name}
                  onItemClick={(id, status) => handleModuleClick(id, status, currentTrack.status)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Blur Effect - Changes color based on track */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 h-64 pointer-events-none z-0 transition-all duration-700",
        !currentTrack?.name.toLowerCase().includes('organização') && !currentTrack?.name.toLowerCase().includes('aceleração') && "track-blur-mentalidade",
        currentTrack?.name.toLowerCase().includes('organização') && "track-blur-organizacao",
        currentTrack?.name.toLowerCase().includes('aceleração') && "track-blur-aceleracao"
      )} />

      {/* Floating Oracle Button */}
      <motion.button
        onClick={() => navigate('/oracle')}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-4 sm:bottom-8 right-4 sm:right-8 z-50 group"
      >
        <div className="absolute inset-0 bg-purple-500/30 rounded-full blur-lg sm:blur-xl animate-pulse" />
        <div className="relative w-14 h-14 sm:w-20 sm:h-20 rounded-full overflow-hidden shadow-xl sm:shadow-2xl ring-2 sm:ring-4 ring-purple-500/50">
          <img 
            src={crystalBall} 
            alt="Oráculo"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
          <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="white" />
        </div>
        
        {/* Label ao fazer hover - hidden on mobile */}
        <div className="hidden md:block absolute right-full mr-4 top-1/2 -translate-y-1/2 px-4 py-2 bg-gray-900 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          <div className="font-bold">Oráculo</div>
          <div className="text-xs text-gray-300">Converse com a IA!</div>
        </div>
      </motion.button>

      {/* Floating PvP Button */}
      <motion.button
        onClick={() => navigate('/pvp')}
        whileHover={{ scale: 1.15, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-4 sm:bottom-8 left-4 sm:left-8 z-50 group"
      >
        {/* Glow Effect pulsante */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-orange-500 to-purple-600 rounded-2xl sm:rounded-3xl blur-lg sm:blur-xl opacity-75 animate-pulse" />
        
        {/* Container do botão */}
        <div className="relative w-16 h-16 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-red-500 via-orange-500 to-purple-600 shadow-xl sm:shadow-2xl flex items-center justify-center">
          <Swords className="w-8 h-8 sm:w-12 sm:h-12 text-white" strokeWidth={2.5} />
          
          {/* Badge NOVO */}
          <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-300 text-[10px] sm:text-xs font-black text-gray-900 shadow-lg animate-pulse">
            NOVO!
          </div>
        </div>
        
        {/* Label ao fazer hover - hidden on mobile */}
        <div className="hidden md:block absolute left-full ml-4 top-1/2 -translate-y-1/2 px-4 py-2 bg-gray-900 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          <div className="font-bold">Modo PvP</div>
          <div className="text-xs text-gray-300">Desafie outro jogador!</div>
        </div>
      </motion.button>

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
