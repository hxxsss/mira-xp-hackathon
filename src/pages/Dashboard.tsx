import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sparkles, MessageSquare, LogOut, User, Shield, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSessionTracking } from "@/hooks/useSessionTracking";
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Navigation } from 'swiper/modules';

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
    const track = tracks[trackIndex];
    if (track.status === 'locked') {
      toast({
        title: "🔒 Trilha Bloqueada",
        description: "Complete todas as trilhas anteriores para desbloquear!",
        variant: "destructive"
      });
      return;
    }
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
      className="relative min-h-screen overflow-hidden transition-colors duration-700"
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
      <div className="absolute top-0 left-0 right-0 z-50 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all"
            >
              <User className="w-5 h-5" />
              <span className="hidden sm:inline font-medium">{profile?.name || 'Perfil'}</span>
            </button>
            
            <button 
              onClick={() => navigate('/sessions')}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all"
            >
              <Shield className="w-5 h-5" />
              <span className="hidden sm:inline font-medium">Sessões</span>
            </button>
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-white tracking-wider">
              DreamUp
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {goal && (
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white">
                <span className="text-sm font-medium">Meta:</span>
                <div className="w-24">
                  <Progress value={progressPercentage} className="h-2" />
                </div>
                <span className="text-sm font-bold">{Math.round(progressPercentage)}%</span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all flex items-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </div>

      {/* Track Navigation */}
      <div className="absolute top-24 left-0 right-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center gap-4">
            {tracks.map((track, index) => (
              <button
                key={track.id}
                onClick={() => handleTrackChange(index)}
                className={`relative px-6 py-3 rounded-full font-bold transition-all ${
                  index === currentTrackIndex
                    ? 'bg-white text-gray-900 scale-110 shadow-xl'
                    : track.status === 'locked'
                    ? 'bg-white/20 text-white/50 cursor-not-allowed'
                    : 'bg-white/30 text-white hover:bg-white/40'
                }`}
                disabled={track.status === 'locked'}
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
      <div className="relative z-10 min-h-screen flex items-center justify-center pt-32 pb-20">
        <div className="w-full max-w-[1400px] px-4">
          {currentTrack && (
            <Swiper
              key={currentTrack.id}
              effect={'coverflow'}
              grabCursor={true}
              centeredSlides={true}
              slidesPerView={'auto'}
              initialSlide={currentTrack.modules.findIndex(m => m.status === 'unlocked' || m.status === 'in_progress') || 0}
              coverflowEffect={{
                rotate: 0,
                stretch: 0,
                depth: 200,
                modifier: 2,
                slideShadows: false,
              }}
              pagination={{ clickable: true }}
              navigation={true}
              modules={[EffectCoverflow, Pagination, Navigation]}
              className="learning-swiper"
            >
              {currentTrack.modules.map((module, index) => (
                <SwiperSlide key={module.id}>
                  <Card
                    className="learning-module-card group cursor-pointer"
                    onClick={() => handleModuleClick(module.id, module.status, currentTrack.status)}
                    style={{
                    backgroundColor: module.card_color,
                    boxShadow: module.status === 'in_progress' || module.status === 'unlocked'
                      ? '0 40px 80px -20px rgba(0, 0, 0, 0.4), 0 20px 40px -10px rgba(124, 58, 237, 0.3)' 
                      : '0 10px 20px -5px rgba(0, 0, 0, 0.15)'
                  }}
                >
                  {/* Progress Bar */}
                  {(module.status === 'in_progress' || module.status === 'completed') && (
                    <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-200 rounded-b-[40px] overflow-hidden z-50">
                      <div 
                        className="h-full bg-[#F5A623] transition-all duration-500"
                        style={{ width: `${module.progress_percent}%` }}
                      />
                    </div>
                  )}

                  {/* Completed Badge */}
                  {module.status === 'completed' && (
                    <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 z-40">
                      ✓ Completo
                    </div>
                  )}

                  {/* New Badge for unlocked modules */}
                  {module.status === 'unlocked' && module.progress_percent === 0 && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse z-40">
                      NOVO!
                    </div>
                  )}

                  {/* Number Badge - Rups Style */}
                  <div 
                    className="absolute -left-6 top-12 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold z-30 shadow-xl border-4 border-white"
                    style={{
                      backgroundColor: module.status === 'completed' ? '#10B981' : 
                                     module.status === 'in_progress' || module.status === 'unlocked' ? '#7C3AED' : 
                                     'rgba(124, 58, 237, 0.8)',
                      color: 'white'
                    }}
                  >
                    {module.number}
                  </div>

                  {/* Active/Unlocked Card Content */}
                  {(module.status === "unlocked" || module.status === "in_progress") && (
                    <div className="relative z-20 p-8 flex flex-col items-center justify-between h-full">
                      <div className="w-full max-h-[50%] aspect-video rounded-[32px] flex items-center justify-center text-9xl transform transition-transform group-hover:scale-105 relative overflow-hidden" style={{
                        background: module.icon_bg
                      }}>
                        <div className="text-[140px]">{module.icon}</div>
                      </div>

                      <div className="text-center flex-1 flex flex-col justify-center">
                        <h3 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">
                          {module.title}
                        </h3>
                        <p className="text-gray-600 text-base">
                          {module.description}
                        </p>
                      </div>

                      <Button 
                        size="lg" 
                        className="w-full h-16 text-xl font-bold rounded-full text-gray-900 shadow-lg hover:shadow-xl transition-all border-0 uppercase tracking-wide"
                        style={{
                          backgroundColor: '#F5A623',
                          backgroundImage: 'linear-gradient(180deg, #F5A623 0%, #F7B731 100%)'
                        }}
                      >
                        {module.status === 'in_progress' ? 'CONTINUAR' : 'COMEÇAR AGORA'}
                      </Button>
                    </div>
                  )}

                  {/* Inactive/Locked/Completed Cards */}
                  {module.status !== "unlocked" && module.status !== "in_progress" && (
                    <div className="relative z-20 p-8 flex flex-col items-center justify-center h-full text-center">
                      <div 
                        className="w-32 h-32 rounded-3xl flex items-center justify-center text-7xl mb-6 transform transition-transform group-hover:scale-110 backdrop-blur-sm"
                        style={{
                          background: module.icon_bg
                        }}
                      >
                        {module.icon}
                      </div>
                      <h3 className="text-2xl font-bold text-white leading-tight">
                        {module.title}
                      </h3>
                    </div>
                  )}

                  {/* Locked Overlay */}
                  {module.status === "locked" && (
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] z-30 rounded-[40px] flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-5xl mb-2">🔒</div>
                        <p className="text-white font-bold text-base">Bloqueado</p>
                      </div>
                    </div>
                  )}
                  </Card>
                </SwiperSlide>
              ))}
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

      {/* Swiper Custom Styles */}
      <style>{`
        .learning-swiper {
          width: 100%;
          padding: 60px 0 !important;
        }

        .learning-swiper .swiper-slide {
          width: 500px !important;
          height: 600px !important;
        }

        .learning-module-card {
          width: 100%;
          height: 100%;
          border-radius: 40px;
          position: relative;
          overflow: hidden;
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .learning-swiper .swiper-slide-active .learning-module-card {
          transform: scale(1.05);
        }

        .learning-swiper .swiper-slide-next,
        .learning-swiper .swiper-slide-prev {
          transform: scale(0.75) !important;
          opacity: 0.7;
        }

        .learning-swiper .swiper-pagination-bullet {
          background: white;
          opacity: 0.5;
        }

        .learning-swiper .swiper-pagination-bullet-active {
          opacity: 1;
          background: white;
        }

        .learning-swiper .swiper-button-prev,
        .learning-swiper .swiper-button-next {
          color: white;
          background: rgba(255, 255, 255, 0.2);
          width: 50px;
          height: 50px;
          border-radius: 50%;
          backdrop-filter: blur(10px);
        }

        .learning-swiper .swiper-button-prev:after,
        .learning-swiper .swiper-button-next:after {
          font-size: 20px;
        }

        @media (max-width: 768px) {
          .learning-swiper .swiper-slide {
            width: 350px !important;
            height: 500px !important;
          }
          
          .learning-swiper .swiper-button-prev,
          .learning-swiper .swiper-button-next {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
