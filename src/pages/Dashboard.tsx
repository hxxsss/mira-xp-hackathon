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

// Módulos de aprendizado
const learningModules = [
  {
    id: 1,
    title: "Compreendendo Seu Dinheiro",
    description: "Descubra de onde vem e para onde vai seu dinheiro",
    icon: "💰",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    status: "current"
  },
  {
    id: 2,
    title: "O Poder de Poupar",
    description: "Aprenda técnicas simples para guardar dinheiro",
    icon: "🎯",
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    status: "locked"
  },
  {
    id: 3,
    title: "Gastos Inteligentes",
    description: "Diferencie necessidades de desejos",
    icon: "🧠",
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    status: "locked"
  },
  {
    id: 4,
    title: "Planejando Seu Futuro",
    description: "Crie metas realistas e alcançáveis",
    icon: "🚀",
    gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    status: "locked"
  },
  {
    id: 5,
    title: "Investindo Seus Sonhos",
    description: "Faça seu dinheiro trabalhar por você",
    icon: "💎",
    gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    status: "locked"
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 right-20 w-96 h-96 rounded-full blur-3xl gradient-primary opacity-20" />
        <div className="absolute bottom-20 left-20 w-96 h-96 rounded-full blur-3xl gradient-secondary opacity-20" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen p-4 lg:p-8">
        {/* A. Heads-Up Display (Top) */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-4 mb-8 flex items-center justify-between"
        >
          {/* Left: Avatar + Level */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center text-2xl">
                {selectedAvatar.emoji}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center border-2 border-background">
                {level}
              </div>
            </div>
            <div>
              <p className="font-semibold text-foreground">{profile?.name}</p>
              <p className="text-sm text-muted-foreground">Nível {level}</p>
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
                <p className="text-sm font-medium text-foreground truncate">{goal.title}</p>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </div>
              <Progress value={progress} className="h-2 mb-1" />
              <p className="text-xs text-muted-foreground">
                R$ {goal.current_amount.toFixed(2)} / R$ {goal.total_amount.toFixed(2)}
              </p>
            </motion.div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/profile")}
              className="ml-4"
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
              className="rounded-xl"
            >
              <User className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/sessions")}
              className="rounded-xl"
            >
              <Shield className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="rounded-xl"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* B. Main Stage - 3D Carousel (Hero) */}
        <div className="flex-1 flex flex-col items-center justify-center py-12 relative bg-gradient-to-b from-background via-primary/5 to-background">
          {/* Background Blob */}
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            <div className="w-[1000px] h-[1000px] rounded-full bg-gradient-to-br from-primary/15 via-purple-500/10 to-transparent blur-3xl" />
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl lg:text-7xl font-bold text-center mb-20 text-gradient relative z-10"
          >
            Sua Jornada Financeira
          </motion.h2>

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
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <Card
                      onClick={() => handleModuleClick(module.id, module.status)}
                      className="relative overflow-hidden cursor-pointer hover-lift group bg-white border-0 shadow-2xl transition-all duration-300"
                      style={{ 
                        minHeight: '780px',
                        boxShadow: '0 25px 50px -12px rgba(124, 58, 237, 0.25)'
                      }}
                    >
                      {module.status === "locked" && (
                        <div className="absolute inset-0 bg-muted/40 backdrop-blur-md z-10 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-8xl mb-4">🔒</div>
                            <p className="text-foreground font-bold text-xl">Bloqueado</p>
                            <p className="text-muted-foreground text-sm mt-2">Complete o módulo anterior</p>
                          </div>
                        </div>
                      )}

                      <div className="relative z-20 p-8 flex flex-col h-full justify-between">
                        {/* Illustration Area */}
                        <div className="flex-1 flex items-center justify-center mb-12">
                          <div 
                            className="w-80 h-80 rounded-3xl flex items-center justify-center text-9xl transform transition-transform group-hover:scale-110"
                            style={{ background: module.gradient }}
                          >
                            {module.icon}
                          </div>
                        </div>

                        {/* Content Area */}
                        <div className="space-y-8">
                          <div>
                            <h3 className="text-5xl font-bold text-foreground mb-4">
                              {module.title}
                            </h3>
                            <p className="text-muted-foreground text-xl">
                              {module.description}
                            </p>
                          </div>

                          {module.status === "current" ? (
                            <Button 
                              size="lg"
                              className="w-full h-16 text-xl font-bold rounded-2xl gradient-primary hover:opacity-90 transition-opacity"
                            >
                              Começar Agora
                            </Button>
                          ) : module.status === "locked" ? (
                            <Button 
                              size="lg"
                              disabled
                              className="w-full h-16 text-xl font-bold rounded-2xl"
                            >
                              Bloqueado
                            </Button>
                          ) : (
                            <Button 
                              size="lg"
                              variant="outline"
                              className="w-full h-16 text-xl font-bold rounded-2xl"
                            >
                              Revisar
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                </SwiperSlide>
              ))}
            </Swiper>
          </motion.div>
        </div>
      </div>

      {/* C. Floating Action Button - Oracle */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, type: "spring" }}
        className="fixed bottom-8 right-8 z-50"
      >
        <Button
          onClick={() => navigate("/oracle")}
          size="lg"
          className="w-16 h-16 lg:w-auto lg:h-auto lg:px-8 lg:py-6 rounded-full gradient-primary shadow-lg hover:shadow-glow transition-all duration-300 group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
          <MessageSquare className="w-6 h-6 lg:mr-2" />
          <span className="hidden lg:inline font-semibold">Falar com Oráculo</span>
        </Button>
      </motion.div>

      <style>{`
        .learning-swiper {
          width: 100%;
          padding: 80px 0 120px 0;
        }

        .learning-swiper .swiper-slide {
          background-position: center;
          background-size: cover;
          width: 720px;
          height: 800px;
          transition: all 0.3s ease;
        }

        .learning-swiper .swiper-slide-active {
          z-index: 3;
        }

        .learning-swiper .swiper-slide-active .relative {
          box-shadow: 0 30px 60px -15px rgba(124, 58, 237, 0.35);
        }

        .learning-swiper .swiper-slide-next,
        .learning-swiper .swiper-slide-prev {
          opacity: 0.65;
          filter: blur(0.5px);
        }

        .learning-swiper .swiper-pagination {
          bottom: 40px;
        }

        .learning-swiper .swiper-pagination-bullet {
          background: hsl(var(--primary));
          opacity: 0.3;
          width: 12px;
          height: 12px;
          transition: all 0.3s ease;
        }

        .learning-swiper .swiper-pagination-bullet-active {
          opacity: 1;
          transform: scale(1.5);
          background: hsl(var(--primary));
        }

        .learning-swiper .swiper-button-next,
        .learning-swiper .swiper-button-prev {
          color: hsl(var(--primary));
          background: white;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          box-shadow: 0 10px 30px -5px hsl(260 30% 20% / 0.2);
          transition: all 0.3s ease;
        }

        .learning-swiper .swiper-button-next:hover,
        .learning-swiper .swiper-button-prev:hover {
          transform: scale(1.1);
          box-shadow: 0 15px 40px -5px hsl(260 80% 60% / 0.4);
        }

        .learning-swiper .swiper-button-next:after,
        .learning-swiper .swiper-button-prev:after {
          font-size: 20px;
          font-weight: bold;
        }

        @media (max-width: 1024px) {
          .learning-swiper .swiper-slide {
            width: 500px;
            height: 680px;
          }
        }

        @media (max-width: 640px) {
          .learning-swiper {
            padding: 40px 0 80px 0;
          }

          .learning-swiper .swiper-slide {
            width: 360px;
            height: 580px;
          }
          
          .learning-swiper .swiper-slide .w-80 {
            width: 224px;
            height: 224px;
          }
          
          .learning-swiper .swiper-slide .text-5xl {
            font-size: 2.25rem;
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
