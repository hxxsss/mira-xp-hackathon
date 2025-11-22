import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Sparkles, MessageSquare, User, Lock, Target, TrendingUp, Wallet, Trophy, Zap, Coins, DollarSign, PiggyBank } from "lucide-react";
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
  total_xp: number;
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const selectedAvatar = avatars.find(a => a.id === profile?.avatar_id) || avatars[0];
  const progressPercentage = goal ? Math.min((Number(goal.current_amount) / Number(goal.total_amount)) * 100, 100) : 0;
  const currentTrack = tracks[currentTrackIndex];

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Floating Icons Background */}
      <div className="absolute top-20 left-[10%] w-16 h-16 bg-white rounded-2xl shadow-lg animate-float z-0 flex items-center justify-center">
        <DollarSign className="text-indigo-500 w-8 h-8" />
      </div>
      <div className="absolute top-40 right-[15%] w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center animate-float-delayed z-0">
        <TrendingUp className="text-purple-500 w-8 h-8" />
      </div>
      <div className="absolute top-60 left-[20%] w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center animate-float z-0">
        <Wallet className="text-emerald-500 w-8 h-8" />
      </div>
      <div className="absolute bottom-40 right-[20%] w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center animate-float-delayed z-0">
        <PiggyBank className="text-pink-500 w-8 h-8" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Olá, {profile?.name || "Sonhador"}! 👋
            </h1>
            <p className="text-gray-600">
              Continue sua jornada de crescimento financeiro
            </p>
          </div>

          <Button
            onClick={() => supabase.auth.signOut()}
            variant="outline"
            className="bg-white text-gray-900 border-gray-200 hover:bg-gray-50 shadow-md"
          >
            Sair
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {/* XP Card */}
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-3xl shadow-lg hover-lift">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-500 rounded-xl">
                  <Zap className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">XP Total</p>
                  <p className="text-2xl font-bold text-gray-900">{profile?.total_xp || 0}</p>
                </div>
              </div>
            </div>
            <Progress value={(profile?.current_xp || 0) % 100} className="h-2" />
            <p className="text-xs text-gray-600 mt-2">
              {100 - ((profile?.current_xp || 0) % 100)} XP até o próximo nível
            </p>
          </div>

          {/* Dream Points Card */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-3xl shadow-lg hover-lift">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-500 rounded-xl">
                  <Coins className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pontos dos Sonhos</p>
                  <p className="text-2xl font-bold text-gray-900">{profile?.dream_points || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Streak Card */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-3xl shadow-lg hover-lift">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500 rounded-xl">
                  <Trophy className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Sequência Diária</p>
                  <p className="text-2xl font-bold text-gray-900">7 dias 🔥</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Goal Section */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-8 border border-blue-100 shadow-xl mb-10 hover-lift">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl">
              <Target className="text-white w-6 h-6" />
            </div>
            Meta Financeira
          </h3>

          {goal ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-xl font-semibold text-gray-900">{goal.title}</h4>
                <span className="text-2xl font-bold text-indigo-600">{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
              <div className="flex justify-between text-sm text-gray-600">
                <span>R$ {goal.current_amount.toLocaleString('pt-BR')}</span>
                <span>R$ {goal.total_amount.toLocaleString('pt-BR')}</span>
              </div>
              <Button
                onClick={() => setGoalModalOpen(true)}
                className="w-full bg-indigo-600 text-white hover:bg-indigo-700 rounded-2xl py-6 text-lg font-semibold"
              >
                Ver Detalhes
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => {
                setEditingGoal(null);
                setGoalFormOpen(true);
              }}
              className="w-full bg-indigo-600 text-white hover:bg-indigo-700 rounded-2xl py-6 text-lg font-semibold"
            >
              <Target className="mr-2 h-5 w-5" />
              Criar Meta
            </Button>
          )}
        </div>

        {/* Navigation Links */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <Button
            onClick={() => navigate("/profile")}
            className="bg-white rounded-full border-2 border-indigo-200 text-gray-900 hover:shadow-xl hover:border-indigo-400 hover:scale-105 transition-all duration-300 py-6 text-lg font-semibold"
          >
            <User className="mr-2 h-5 w-5 text-indigo-600" />
            Perfil
          </Button>
          <Button
            onClick={() => navigate("/ranking")}
            className="bg-white rounded-full border-2 border-purple-200 text-gray-900 hover:shadow-xl hover:border-purple-400 hover:scale-105 transition-all duration-300 py-6 text-lg font-semibold"
          >
            <Trophy className="mr-2 h-5 w-5 text-purple-600" />
            Ranking
          </Button>
          <Button
            onClick={() => navigate("/financas")}
            className="bg-white rounded-full border-2 border-emerald-200 text-gray-900 hover:shadow-xl hover:border-emerald-400 hover:scale-105 transition-all duration-300 py-6 text-lg font-semibold"
          >
            <TrendingUp className="mr-2 h-5 w-5 text-emerald-600" />
            Finanças
          </Button>
        </div>

        {/* Learning Tracks Section */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Trilhas de Aprendizado</h2>

          {/* Track Badges Navigation */}
          <div className="flex justify-center gap-8 mb-10">
            {tracks.map((track, index) => (
              <button
                key={track.id}
                onClick={() => handleTrackChange(index)}
                className="relative transition-all hover:scale-110"
              >
                {track.id === "mentalidade" && (
                  <img
                    src={mentalidadeBadge}
                    alt="Mentalidade"
                    className={`h-24 w-auto object-contain transition-all ${
                      index === currentTrackIndex
                        ? 'scale-110 drop-shadow-2xl'
                        : track.status === 'locked'
                        ? 'opacity-50 grayscale'
                        : 'opacity-80'
                    }`}
                  />
                )}
                {track.id === "organizacao" && (
                  <img
                    src={track.status === 'locked' ? organizacaoLocked : organizacaoUnlocked}
                    alt="Organização"
                    className={`h-24 w-auto object-contain transition-all ${
                      index === currentTrackIndex
                        ? 'scale-110 drop-shadow-2xl'
                        : track.status === 'locked'
                        ? 'opacity-50'
                        : 'opacity-80'
                    }`}
                  />
                )}
                {track.id === "aceleracao" && (
                  <img
                    src={track.status === 'locked' ? aceleracaoLocked : aceleracaoUnlocked}
                    alt="Aceleração"
                    className={`h-24 w-auto object-contain transition-all ${
                      index === currentTrackIndex
                        ? 'scale-110 drop-shadow-2xl'
                        : track.status === 'locked'
                        ? 'opacity-50'
                        : 'opacity-80'
                    }`}
                  />
                )}
                {track.status === 'locked' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Lock className="w-8 h-8 text-gray-600 drop-shadow-lg" />
                  </div>
                )}
                {track.status === 'completed' && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">✓</div>
                )}
              </button>
            ))}
          </div>

          {/* Current Track Info */}
          {currentTrack && (
            <motion.div
              key={currentTrack.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-3xl shadow-lg mb-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{currentTrack.name}</h3>
                  <p className="text-gray-600 mt-2">{currentTrack.description}</p>
                </div>
                <Badge className={`text-white ${
                  currentTrack.status === "completed"
                    ? "bg-emerald-500"
                    : currentTrack.status === "unlocked"
                    ? "bg-blue-500"
                    : "bg-gray-400"
                }`}>
                  {currentTrack.status === "completed"
                    ? "Completo"
                    : currentTrack.status === "unlocked"
                      ? "Em Progresso"
                      : "Bloqueado"}
                </Badge>
              </div>
            </motion.div>
          )}
        </div>

        {/* Modules Carousel */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Módulos Disponíveis</h2>
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

        {/* Oracle Section */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-3xl shadow-xl hover-lift mb-10 border border-purple-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl">
              <Sparkles className="text-white w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Consulte o Oráculo</h2>
              <p className="text-gray-600">
                Tire suas dúvidas sobre finanças pessoais
              </p>
            </div>
          </div>
          <Button
            onClick={() => navigate("/oracle")}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-6 text-lg font-semibold hover:shadow-2xl hover:scale-105 transition-all rounded-2xl"
          >
            Abrir Chat do Oráculo
          </Button>
        </div>
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
    </div>
  );
};

export default Dashboard;