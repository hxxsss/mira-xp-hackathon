import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sparkles, MessageSquare, LogOut, User, Shield, ChevronRight } from "lucide-react";
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

// Módulos de aprendizado - Rups Style
const learningModules = [
  {
    id: 1,
    title: "Entendendo Dinheiro",
    description: "Descubra de onde vem seu dinheiro",
    icon: "💰",
    cardColor: "#FCD34D", // Yellow
    iconBg: "#FBBF24",
    status: "locked",
    number: "01"
  },
  {
    id: 2,
    title: "O Poder de Poupar",
    description: "Aprenda técnicas para guardar",
    icon: "🎯",
    cardColor: "#FCD34D", // Yellow
    iconBg: "#FBBF24",
    status: "locked",
    number: "02"
  },
  {
    id: 3,
    title: "Compreendendo Seu Dinheiro",
    description: "Descubra de onde vem e para onde vai seu dinheiro. Aprenda a controlar suas finanças de forma inteligente.",
    icon: "💰",
    cardColor: "#FFFFFF", // White - Active
    iconBg: "linear-gradient(135deg, #F87171 0%, #FB923C 100%)",
    status: "current",
    number: "03"
  },
  {
    id: 4,
    title: "Gastos Inteligentes",
    description: "Diferencie necessidades de desejos",
    icon: "🧠",
    cardColor: "#67E8F9", // Cyan
    iconBg: "#22D3EE",
    status: "locked",
    number: "04"
  },
  {
    id: 5,
    title: "Investindo Sonhos",
    description: "Faça seu dinheiro trabalhar",
    icon: "💎",
    cardColor: "#C084FC", // Purple
    iconBg: "#A855F7",
    status: "locked",
    number: "05"
  }
];

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
      setProfile(profileData);

      // Load active goal
      const { data: goalData, error: goalError } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

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

  const handleModuleClick = (moduleId: number, status: string) => {
    if (status === "current") {
      toast({
        title: "Iniciando Módulo...",
        description: "Preparando sua experiência de aprendizado",
      });
    } else {
      toast({
        title: "Módulo Bloqueado",
        description: "Complete o módulo anterior para desbloquear",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-primary-foreground animate-pulse" />
          </div>
          <p className="text-muted-foreground">Carregando seu painel...</p>
        </div>
      </div>
    );
  }

  const progress = goal ? Math.min((goal.current_amount / goal.total_amount) * 100, 100) : 0;
  const level = Math.floor((profile?.current_xp || 0) / 100) + 1;
  const selectedAvatar = avatars.find(a => a.id === profile?.avatar_id) || avatars[0];

  return (
    <div className="min-h-screen bg-[#7C3AED] relative overflow-hidden">
      {/* Doodle Background - Rups Style */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <circle cx="10%" cy="15%" r="30" fill="none" stroke="white" strokeWidth="3" />
          <path d="M 85% 20% Q 87% 22% 85% 24%" fill="none" stroke="white" strokeWidth="3" />
          <circle cx="15%" cy="80%" r="20" fill="none" stroke="white" strokeWidth="3" />
          <path d="M 90% 70% L 92% 68% L 94% 70% L 92% 72% Z" fill="white" />
          <circle cx="5%" cy="50%" r="15" fill="white" />
          <path d="M 95% 40% Q 96% 42% 95% 44%" fill="none" stroke="white" strokeWidth="3" />
          <circle cx="20%" cy="25%" r="25" fill="none" stroke="white" strokeWidth="3" />
          <path d="M 80% 85% L 82% 83% M 82% 85% L 80% 83%" stroke="white" strokeWidth="3" />
          <circle cx="70%" cy="10%" r="18" fill="none" stroke="white" strokeWidth="3" />
          <path d="M 10% 90% Q 12% 88% 14% 90%" fill="none" stroke="white" strokeWidth="3" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen p-4 lg:p-8">
        {/* A. Heads-Up Display (Top) - Rups Style */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/95 backdrop-blur-sm rounded-3xl p-4 mb-8 flex items-center justify-between shadow-xl"
        >
          {/* Left: Avatar + Level */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-[#7C3AED] flex items-center justify-center text-2xl">
                {selectedAvatar.emoji}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#FCD34D] text-gray-900 text-xs font-bold flex items-center justify-center border-2 border-white">
                {level}
              </div>
            </div>
            <div>
              <p className="font-semibold text-gray-900">{profile?.name}</p>
              <p className="text-sm text-gray-600">Nível {level}</p>
            </div>
          </div>

          {/* Right: Goal Summary */}
          {goal ? (
            <motion.div
              onClick={() => navigate("/profile")}
              className="flex-1 max-w-md ml-4 cursor-pointer hover-lift"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-900 truncate">{goal.title}</p>
                <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
              </div>
              <Progress value={progress} className="h-2 mb-1" />
              <p className="text-xs text-gray-600">
                R$ {goal.current_amount.toFixed(2)} / R$ {goal.total_amount.toFixed(2)}
              </p>
            </motion.div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/profile")}
              className="ml-4 border-gray-300 text-gray-900 hover:bg-gray-50"
            >
              Definir Meta
            </Button>
          )}

          {/* User Actions */}
          <div className="flex items-center gap-2 ml-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/profile")}
              className="rounded-xl hover:bg-gray-100 text-gray-700"
            >
              <User className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/sessions")}
              className="rounded-xl hover:bg-gray-100 text-gray-700"
            >
              <Shield className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="rounded-xl hover:bg-gray-100 text-gray-700"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* B. Main Stage - 3D Carousel (Hero) - Rups Style */}
        <div className="flex-1 flex flex-col items-center justify-center py-20 relative">

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="w-full max-w-7xl relative z-10"
          >
            <Swiper
              effect={'coverflow'}
              grabCursor={true}
              centeredSlides={true}
              slidesPerView={'auto'}
              coverflowEffect={{
                rotate: 0,
                stretch: 0,
                depth: 150,
                modifier: 3,
                slideShadows: false,
              }}
              pagination={{ clickable: true }}
              navigation={true}
              modules={[EffectCoverflow, Pagination, Navigation]}
              className="learning-swiper"
            >
              {learningModules.map((module, index) => (
                <SwiperSlide key={module.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <div className="relative">
                      {/* Number Badge - Rups Style */}
                      <div 
                        className="absolute -left-6 top-12 w-16 h-16 rounded-full bg-white flex items-center justify-center text-2xl font-bold z-30 shadow-xl"
                        style={{ color: module.status === 'current' ? '#7C3AED' : '#1F2937' }}
                      >
                        {module.number}
                      </div>

                      <Card
                        onClick={() => handleModuleClick(module.id, module.status)}
                        className="relative overflow-hidden cursor-pointer hover-lift group border-0 transition-all duration-300"
                        style={{ 
                          minHeight: module.status === 'current' ? '700px' : '480px',
                          backgroundColor: module.cardColor,
                          boxShadow: module.status === 'current' 
                            ? '0 30px 60px -15px rgba(0, 0, 0, 0.3)' 
                            : '0 20px 40px -10px rgba(0, 0, 0, 0.2)',
                          borderRadius: '40px'
                        }}
                      >
                        {module.status === 'current' ? (
                          // Active Card - Full Featured (Rups Style)
                          <div className="relative z-20 p-10 flex flex-col h-full">
                            {/* Illustration Area */}
                            <div className="flex-1 flex items-center justify-center mb-8">
                              <div 
                                className="w-full h-[340px] rounded-[32px] flex items-center justify-center text-9xl transform transition-transform group-hover:scale-105 relative overflow-hidden"
                                style={{ background: module.iconBg }}
                              >
                                <div className="text-[140px]">{module.icon}</div>
                                {/* Decorative elements like in Rups */}
                                <div className="absolute top-8 right-8 w-16 h-16 rounded-full bg-white/20" />
                                <div className="absolute bottom-12 left-12 w-20 h-20 rounded-full bg-white/15" />
                              </div>
                            </div>

                            {/* Content Area */}
                            <div className="space-y-6">
                              <div>
                                <h3 className="text-4xl font-bold text-gray-900 mb-3 leading-tight">
                                  {module.title}
                                </h3>
                                <p className="text-gray-600 text-lg leading-relaxed">
                                  {module.description}
                                </p>
                              </div>

                              <Button 
                                size="lg"
                                className="w-full h-16 text-xl font-bold rounded-full bg-[#FCD34D] hover:bg-[#FBBF24] text-gray-900 shadow-lg hover:shadow-xl transition-all border-0"
                              >
                                COMEÇAR AGORA
                              </Button>
                            </div>
                          </div>
                        ) : (
                          // Inactive Cards - Simplified (Rups Style)
                          <div className="relative z-20 p-8 flex flex-col items-center justify-center h-full text-center">
                            <div 
                              className="w-32 h-32 rounded-3xl flex items-center justify-center text-7xl mb-6 transform transition-transform group-hover:scale-110"
                              style={{ background: module.iconBg }}
                            >
                              {module.icon}
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 leading-tight">
                              {module.title}
                            </h3>
                          </div>
                        )}

                        {module.status === "locked" && (
                          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-30 rounded-[40px] flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-6xl mb-3">🔒</div>
                              <p className="text-white font-bold text-lg">Bloqueado</p>
                            </div>
                          </div>
                        )}
                      </Card>
                    </div>
                  </motion.div>
                </SwiperSlide>
              ))}
            </Swiper>
          </motion.div>
        </div>
      </div>

      {/* C. Floating Action Button - Oracle - Rups Style */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, type: "spring" }}
        className="fixed bottom-8 right-8 z-50"
      >
        <Button
          onClick={() => navigate("/oracle")}
          size="lg"
          className="w-16 h-16 lg:w-auto lg:h-auto lg:px-8 lg:py-6 rounded-full bg-white hover:bg-gray-50 text-[#7C3AED] shadow-2xl hover:shadow-[0_20px_60px_-10px_rgba(0,0,0,0.4)] transition-all duration-300 group relative overflow-hidden border-0"
        >
          <div className="absolute inset-0 bg-[#FCD34D]/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
          <MessageSquare className="w-6 h-6 lg:mr-2" />
          <span className="hidden lg:inline font-bold">Falar com Oráculo</span>
        </Button>
      </motion.div>

      <style>{`
        .learning-swiper {
          width: 100%;
          padding: 60px 0 100px 0;
        }

        .learning-swiper .swiper-slide {
          background-position: center;
          background-size: cover;
          width: 640px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .learning-swiper .swiper-slide-active {
          z-index: 3;
          transform: scale(1) !important;
        }

        .learning-swiper .swiper-slide-next,
        .learning-swiper .swiper-slide-prev {
          transform: scale(0.75) !important;
          opacity: 0.85;
        }

        .learning-swiper .swiper-pagination {
          bottom: 30px;
        }

        .learning-swiper .swiper-pagination-bullet {
          background: white;
          opacity: 0.5;
          width: 10px;
          height: 10px;
          transition: all 0.3s ease;
        }

        .learning-swiper .swiper-pagination-bullet-active {
          opacity: 1;
          transform: scale(1.4);
          background: white;
        }

        .learning-swiper .swiper-button-next,
        .learning-swiper .swiper-button-prev {
          color: #7C3AED;
          background: white;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.3);
          transition: all 0.3s ease;
        }

        .learning-swiper .swiper-button-next:hover,
        .learning-swiper .swiper-button-prev:hover {
          transform: scale(1.1);
          box-shadow: 0 15px 40px -5px rgba(0, 0, 0, 0.4);
        }

        .learning-swiper .swiper-button-next:after,
        .learning-swiper .swiper-button-prev:after {
          font-size: 22px;
          font-weight: bold;
        }

        @media (max-width: 1024px) {
          .learning-swiper .swiper-slide {
            width: 480px;
          }
        }

        @media (max-width: 640px) {
          .learning-swiper {
            padding: 30px 0 70px 0;
          }

          .learning-swiper .swiper-slide {
            width: 340px;
          }

          .learning-swiper .swiper-button-next,
          .learning-swiper .swiper-button-prev {
            width: 48px;
            height: 48px;
          }
        }

          .learning-swiper .swiper-button-next,
          .learning-swiper .swiper-button-prev {
            width: 44px;
            height: 44px;
          }

          .learning-swiper .swiper-button-next:after,
          .learning-swiper .swiper-button-prev:after {
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
