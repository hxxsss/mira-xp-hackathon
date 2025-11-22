import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Crown, Medal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { TrophyGameIcon, ProfileGameIcon } from "@/components/ui/game-icons";

const avatars = [
  { id: 1, emoji: "🦄" },
  { id: 2, emoji: "🚀" },
  { id: 3, emoji: "🎯" },
  { id: 4, emoji: "⭐" },
  { id: 5, emoji: "🌈" }
];

interface RankingUser {
  id: string;
  name: string;
  avatar_id: number;
  xp: number;
  position: number;
}

export default function Ranking() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"monthly" | "alltime">("monthly");
  const [rankings, setRankings] = useState<RankingUser[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    loadRankings();
  }, [period]);

  const loadRankings = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/login");
        return;
      }

      setCurrentUserId(user.id);

      const xpField = period === "monthly" ? "monthly_xp" : "total_xp";
      
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, avatar_id, monthly_xp, total_xp")
        .order(xpField, { ascending: false })
        .limit(50);

      if (error) throw error;

      const rankedData = data?.map((user, index) => ({
        id: user.id,
        name: user.name,
        avatar_id: user.avatar_id,
        xp: period === "monthly" ? user.monthly_xp : user.total_xp,
        position: index + 1
      })) || [];

      setRankings(rankedData);
    } catch (error: any) {
      console.error("Error loading rankings:", error);
      toast({
        title: "Erro ao carregar ranking",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getAvatar = (avatarId: number) => {
    return avatars.find(a => a.id === avatarId)?.emoji || "🦄";
  };

  const getPodiumHeight = (position: number) => {
    if (position === 1) return "h-40";
    if (position === 2) return "h-32";
    return "h-28";
  };

  const getPodiumOrder = (position: number) => {
    if (position === 1) return "order-2";
    if (position === 2) return "order-1";
    return "order-3";
  };

  const top3 = rankings.slice(0, 3);
  const others = rankings.slice(3);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={() => navigate("/dashboard")}
            variant="ghost"
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <div className="flex items-center gap-3">
            <TrophyGameIcon className="w-10 h-10" />
            <h1 className="text-4xl font-bold text-white">Ranking</h1>
          </div>

          <Tabs value={period} onValueChange={(v) => setPeriod(v as any)}>
            <TabsList className="bg-white/10 backdrop-blur-sm">
              <TabsTrigger value="monthly" className="data-[state=active]:bg-white/20 text-white">
                Deste Mês
              </TabsTrigger>
              <TabsTrigger value="alltime" className="data-[state=active]:bg-white/20 text-white">
                Todos os Tempos
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Top 3 Podium */}
        {top3.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-end justify-center gap-4 mb-12"
          >
            {top3.map((user) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: user.position * 0.1 }}
                className={`flex flex-col items-center ${getPodiumOrder(user.position)}`}
              >
                {/* Medal/Crown */}
                <div className="mb-4">
                  {user.position === 1 && <Crown className="w-12 h-12 text-yellow-400 animate-pulse" />}
                  {user.position === 2 && <Medal className="w-10 h-10 text-gray-400" />}
                  {user.position === 3 && <Medal className="w-10 h-10 text-amber-700" />}
                </div>

                {/* Avatar */}
                <div className={`relative ${user.position === 1 ? 'w-28 h-28' : 'w-24 h-24'} mb-3`}>
                  <div className={`relative w-full h-full rounded-full flex items-center justify-center
                    ${user.position === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-2xl shadow-yellow-500/50' : ''}
                    ${user.position === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500 shadow-xl shadow-gray-500/50' : ''}
                    ${user.position === 3 ? 'bg-gradient-to-br from-amber-600 to-amber-800 shadow-xl shadow-amber-700/50' : ''}
                  `}>
                    <div className="absolute inset-0">
                      <ProfileGameIcon className="w-full h-full" />
                    </div>
                    <span className="relative text-5xl z-10">
                      {getAvatar(user.avatar_id)}
                    </span>
                  </div>
                  {user.id === currentUserId && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                      Você
                    </div>
                  )}
                </div>

                {/* Name */}
                <p className="text-white font-bold text-lg mb-2 text-center">
                  {user.name}
                </p>

                {/* Podium */}
                <div className={`${getPodiumHeight(user.position)} ${user.position === 1 ? 'w-32' : 'w-28'} rounded-t-xl flex flex-col items-center justify-center
                  ${user.position === 1 ? 'bg-gradient-to-b from-yellow-400 to-yellow-600' : ''}
                  ${user.position === 2 ? 'bg-gradient-to-b from-gray-300 to-gray-500' : ''}
                  ${user.position === 3 ? 'bg-gradient-to-b from-amber-600 to-amber-800' : ''}
                `}>
                  <span className="text-4xl font-black text-white mb-1">#{user.position}</span>
                  <span className="text-2xl font-bold text-white">{user.xp}</span>
                  <span className="text-sm text-white/80">XP</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Ranking List (4+) */}
        {others.length > 0 && (
          <div className="space-y-3">
            {others.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`p-4 ${user.id === currentUserId ? 'bg-gradient-to-r from-green-500/20 to-green-600/20 border-green-500' : 'bg-white/10 backdrop-blur-sm border-white/20'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Position */}
                      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">#{user.position}</span>
                      </div>

                      {/* Avatar */}
                      <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg">
                        <div className="absolute inset-0">
                          <ProfileGameIcon className="w-full h-full" />
                        </div>
                        <span className="relative text-3xl z-10">
                          {getAvatar(user.avatar_id)}
                        </span>
                      </div>

                      {/* Name */}
                      <div>
                        <p className="text-white font-bold text-lg">{user.name}</p>
                        {user.id === currentUserId && (
                          <span className="text-green-400 text-sm font-semibold">Você</span>
                        )}
                      </div>
                    </div>

                    {/* XP */}
                    <div className="text-right">
                      <p className="text-3xl font-black text-white">{user.xp}</p>
                      <p className="text-sm text-white/70">XP</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {rankings.length === 0 && (
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              <TrophyGameIcon className="w-16 h-16 opacity-30" />
            </div>
            <p className="text-white/70 text-lg">Nenhum usuário no ranking ainda.</p>
          </div>
        )}
      </div>
    </div>
  );
}
