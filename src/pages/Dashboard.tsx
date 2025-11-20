import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Sparkles, MessageSquare, LogOut, User, Shield, Lock, Target, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSessionTracking } from "@/hooks/useSessionTracking";
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Navigation } from 'swiper/modules';
import { GoalDetailsModal } from "@/components/modules/GoalDetailsModal";

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

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
  useSessionTracking();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);
  const [tracks, setTracks] = useState<LearningTrack[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [goalModalOpen, setGoalModalOpen] = useState(false);

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
          {/* Left: Profile & Sessions */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all"
            >
              <span className="text-xl">{avatars.find(a => a.id === profile?.avatar_id)?.emoji || '🦄'}</span>
              <span className="hidden md:inline font-medium">{profile?.name || 'Perfil'}</span>
            </button>
            
            <button 
              onClick={() => navigate('/sessions')}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all"
            >
              <Shield className="w-5 h-5" />
              <span className="hidden md:inline font-medium">Sessões</span>
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
            {/* Compact Gamified Goal */}
            {goal && (
              <motion.button
                onClick={() => setGoalModalOpen(true)}
                className="flex items-center gap-2 px-3 py-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-all group relative"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Target className="w-4 h-4 text-accent animate-pulse" />
                <div className="hidden lg:block text-left min-w-[160px]">
                  <div className="text-[10px] text-white/70 leading-tight">{goal.title}</div>
                  <div className="relative h-1.5 bg-white/20 rounded-full mt-0.5 overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{
                        background: progressPercentage > 80 
                          ? 'linear-gradient(90deg, hsl(var(--success)), hsl(145 70% 65%))' 
                          : progressPercentage > 40
                          ? 'linear-gradient(90deg, hsl(var(--accent)), hsl(45 95% 70%))'
                          : 'linear-gradient(90deg, hsl(var(--secondary)), hsl(10 80% 75%))'
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] mt-0.5">
                    <span className="text-white/70">💰 {(goal.current_amount / 1000).toFixed(1)}k</span>
                    <span className="font-bold text-accent">{Math.round(progressPercentage)}%</span>
                  </div>
                </div>
                <span className="lg:hidden font-bold text-accent text-sm">{Math.round(progressPercentage)}%</span>
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

      {/* Main Stage - Learning Path Carousel */}
      <div className="relative z-10 flex-1 flex items-center justify-center">
        <div className="w-full max-w-[1400px] px-4">
          {currentTrack && (
            <Swiper
              key={currentTrack.id}
              effect={'coverflow'}
              grabCursor={true}
              centeredSlides={true}
              slidesPerView={1.8}
              initialSlide={currentTrack.modules.findIndex(m => m.status === 'unlocked' || m.status === 'in_progress') || 0}
              coverflowEffect={{
                rotate: 0,
                stretch: 0,
                depth: 200,
                modifier: 1,
                slideShadows: false,
              }}
              breakpoints={{
                320: {
                  slidesPerView: 1,
                  spaceBetween: 20,
                  centeredSlides: true
                },
                768: {
                  slidesPerView: 1,
                  spaceBetween: 30,
                  centeredSlides: true
                },
                1024: {
                  slidesPerView: 1.5,
                  spaceBetween: 40,
                  centeredSlides: true
                },
                1280: {
                  slidesPerView: 1.8,
                  spaceBetween: 50,
                  centeredSlides: true
                }
              }}
              pagination={{ clickable: true, dynamicBullets: true }}
              navigation={true}
              modules={[EffectCoverflow, Pagination, Navigation]}
              className="learning-swiper"
            >
              {currentTrack.modules.map((module, index) => {
                const isLocked = module.status === 'locked';
                const isCompleted = module.status === 'completed';
                const isInProgress = module.status === 'in_progress';
                
                return (
                  <SwiperSlide key={module.id}>
                    <motion.div whileHover={!isLocked ? { y: -4 } : {}} className="w-full h-full">
                      <Card 
                        className={cn(
                          'learning-module-card relative overflow-hidden transition-all cursor-pointer h-full flex flex-col bg-white shadow-lg rounded-3xl',
                          isLocked && 'cursor-not-allowed'
                        )}
                        onClick={() => !isLocked && handleModuleClick(module.id, module.status, currentTrack.status)}
                      >
                        <div className="h-1 w-full" style={{ backgroundColor: isCompleted ? '#10b981' : module.card_color }} />
                        
                        <CardContent className="flex flex-col flex-1 justify-between p-6 relative">
                          <div className="flex justify-between items-start mb-4">
                            <Badge className={cn(
                              'text-xs font-semibold',
                              isCompleted && 'bg-green-100 text-green-700 border-green-200',
                              isInProgress && 'bg-blue-100 text-blue-700 border-blue-200',
                              module.status === 'unlocked' && 'bg-red-100 text-red-700 border-red-200 animate-pulse'
                            )}>
                              {isCompleted && '✓ COMPLETO'}
                              {isInProgress && '🎯 EM PROGRESSO'}
                              {module.status === 'unlocked' && '⭐ NOVO!'}
                            </Badge>
                            
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2"
                              style={{
                                borderColor: isCompleted ? '#10b981' : module.card_color,
                                backgroundColor: 'white',
                                color: isCompleted ? '#10b981' : module.card_color
                              }}
                            >
                              #{module.number}
                            </div>
                          </div>

                          <div className="flex-shrink-0 mb-6 flex justify-center">
                            <div 
                              className="w-32 h-32 rounded-2xl flex items-center justify-center"
                              style={{ 
                                backgroundColor: isCompleted ? 'rgba(16, 185, 129, 0.2)' : `${module.card_color}33` 
                              }}
                            >
                              <span className="text-6xl">{module.icon}</span>
                            </div>
                          </div>

                          <div className="flex-1 flex flex-col justify-center text-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{module.title}</h3>
                            <p className="text-gray-600 text-sm line-clamp-2">{module.description}</p>
                          </div>

                          {module.progress_percent !== undefined && module.progress_percent > 0 && (
                            <div className="mb-4">
                              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                <div 
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{ 
                                    width: `${module.progress_percent}%`,
                                    backgroundColor: isCompleted ? '#10b981' : module.card_color 
                                  }}
                                />
                              </div>
                              <p className="text-xs text-gray-500 mt-1 text-center">{module.progress_percent}% concluído</p>
                            </div>
                          )}

                          <Button
                            className="w-full font-semibold py-6 text-lg text-white"
                            disabled={isLocked}
                            style={{
                              backgroundColor: isLocked ? '#9ca3af' : isCompleted ? '#6b7280' : module.card_color
                            }}
                          >
                            {isCompleted && 'REVISAR'}
                            {isInProgress && 'CONTINUAR'}
                            {module.status === 'unlocked' && 'COMEÇAR AGORA'}
                            {isLocked && '🔒 BLOQUEADO'}
                          </Button>

                          {isLocked && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-3xl">
                              <div className="text-center">
                                <div className="text-5xl mb-3">🔒</div>
                                <p className="text-gray-700 font-semibold">Bloqueado</p>
                                <p className="text-gray-500 text-sm mt-1">Complete o módulo anterior</p>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
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
      />

      {/* Swiper Custom Styles */}
      <style>{`
        .learning-swiper {
          width: 100%;
          padding: 60px 0 !important;
          overflow: visible !important;
        }

        .learning-swiper .swiper-slide {
          width: 450px !important;
          height: 540px !important;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.4s ease;
        }

        .learning-swiper .swiper-slide-active {
          transform: scale(1.08) translateZ(0);
          z-index: 10;
        }

        .learning-swiper .swiper-slide-active .learning-module-card {
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.15), 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .learning-swiper .swiper-slide-next,
        .learning-swiper .swiper-slide-prev {
          transform: scale(0.88) translateZ(0);
          opacity: 0.6;
        }

        .learning-swiper .swiper-slide:not(.swiper-slide-active):not(.swiper-slide-next):not(.swiper-slide-prev) {
          opacity: 0.3;
          transform: scale(0.7);
        }

        .learning-module-card:not(.cursor-not-allowed):hover {
          box-shadow: 0 40px 100px rgba(0, 0, 0, 0.2);
        }

        .learning-swiper .swiper-button-prev,
        .learning-swiper .swiper-button-next {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: white;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
          color: #1f2937;
        }

        .learning-swiper .swiper-button-prev:after,
        .learning-swiper .swiper-button-next:after {
          font-size: 20px;
          font-weight: bold;
        }

        .learning-swiper .swiper-pagination {
          bottom: 10px !important;
        }

        .learning-swiper .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background: rgba(0, 0, 0, 0.3);
          opacity: 1;
          transition: all 0.3s;
        }

        .learning-swiper .swiper-pagination-bullet-active {
          width: 24px;
          border-radius: 4px;
          background: #1f2937;
        }

        @media (max-width: 768px) {
          .learning-swiper .swiper-slide {
            width: 340px !important;
            height: 500px !important;
          }
          
          .learning-swiper .swiper-button-prev,
          .learning-swiper .swiper-button-next {
            width: 40px;
            height: 40px;
          }
          
          .learning-swiper .swiper-button-prev:after,
          .learning-swiper .swiper-button-next:after {
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
