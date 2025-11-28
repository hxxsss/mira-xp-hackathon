import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Crown, Medal, Trophy, Zap, Star, Calendar, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
const avatars = [{
  id: 1,
  emoji: "🦄"
}, {
  id: 2,
  emoji: "🚀"
}, {
  id: 3,
  emoji: "🎯"
}, {
  id: 4,
  emoji: "⭐"
}, {
  id: 5,
  emoji: "🌈"
}];
interface RankingUser {
  id: string;
  name: string;
  avatar_id: number;
  xp: number;
  position: number;
}
export default function Ranking() {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
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
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }
      setCurrentUserId(user.id);
      const xpField = period === "monthly" ? "monthly_xp" : "total_xp";
      const {
        data,
        error
      } = await supabase.from("profiles").select("id, name, avatar_id, monthly_xp, total_xp").order(xpField, {
        ascending: false
      }).limit(50);
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
  const getPodiumOrder = (users: RankingUser[]) => {
    // Return in order: 2nd, 1st, 3rd
    return [users[1], users[0], users[2]].filter(Boolean);
  };
  const top3 = rankings.slice(0, 3);
  const others = rankings.slice(3);
  return <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-4">
      {loading ? <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-12 h-12 animate-spin text-white" />
        </div> : <>
          {/* Animated blobs */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <motion.div className="absolute top-20 left-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, 30, 0]
        }} transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }} />
            <motion.div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" animate={{
          scale: [1.2, 1, 1.2],
          x: [0, -50, 0],
          y: [0, -30, 0]
        }} transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }} />
          </div>

          <div className="max-w-4xl mx-auto relative z-10">
            {/* Header */}
            <motion.div initial={{
          opacity: 0,
          y: -20
        }} animate={{
          opacity: 1,
          y: 0
        }} className="flex items-center gap-4 mb-6 md:mb-8">
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="text-white hover:bg-white/10">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1">
                <h1 className="text-2xl md:text-4xl font-bold text-white mb-2 flex items-center gap-2 md:gap-3">
                  <Trophy className="w-7 h-7 md:w-10 md:h-10 text-yellow-400" />
                  Ranking
                </h1>
                <Tabs value={period} onValueChange={v => setPeriod(v as "monthly" | "alltime")} className="w-full">
                  <TabsList className="bg-white/10 border-white/20">
                    <TabsTrigger value="monthly" className="data-[state=active]:bg-white/20 text-white text-xs md:text-sm">
                      <Calendar className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                      Mensal
                    </TabsTrigger>
                    <TabsTrigger value="alltime" className="data-[state=active]:bg-white/20 text-white text-xs md:text-sm">
                      <Star className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                      Geral
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </motion.div>

            {rankings.length === 0 ? <Card className="glass-card backdrop-blur-2xl bg-white/10 border-white/20">
                <CardContent className="p-8 text-center text-white">
                  <p className="text-lg">Nenhum usuário encontrado no ranking ainda.</p>
                </CardContent>
              </Card> : <>
                {/* Podium for Top 3 */}
                {top3.length > 0 && <motion.div initial={{
            opacity: 0,
            scale: 0.9
          }} animate={{
            opacity: 1,
            scale: 1
          }} transition={{
            delay: 0.2
          }} className="mb-6 md:mb-8">
                    <Card className="backdrop-blur-2xl border-white/20 p-4 md:p-8 rounded-3xl bg-purple-800">
                      <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 text-center flex items-center justify-center gap-2">
                        <Crown className="w-5 h-5 md:w-7 md:h-7 text-yellow-400" />
                        Pódio
                      </h2>
                      <div className="flex items-end justify-center gap-2 md:gap-4">
                        {getPodiumOrder(top3).map((user, idx) => <motion.div key={user.id} initial={{
                  opacity: 0,
                  y: 50
                }} animate={{
                  opacity: 1,
                  y: 0
                }} transition={{
                  delay: 0.3 + idx * 0.1
                }} className="flex flex-col items-center relative" style={{
                  height: getPodiumHeight(user.position)
                }}>
                            {/* Medal/Crown Icon */}
                            <motion.div className={cn("mb-1 md:mb-2 relative", user.position === 1 && "text-yellow-400", user.position === 2 && "text-gray-400", user.position === 3 && "text-orange-400")} animate={{
                    scale: user.position === 1 ? [1, 1.1, 1] : 1
                  }} transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}>
                              {user.position === 1 && <Crown className="w-8 h-8 md:w-12 md:h-12" />}
                              {user.position === 2 && <Medal className="w-6 h-6 md:w-10 md:h-10" />}
                              {user.position === 3 && <Medal className="w-5 h-5 md:w-9 md:h-9" />}
                            </motion.div>
                            
                            {/* Avatar */}
                            <div className={cn("text-4xl md:text-6xl mb-2 md:mb-3 transition-all", user.id === currentUserId && "ring-2 md:ring-4 ring-yellow-400 rounded-full p-1 md:p-2 bg-yellow-400/20")}>
                              {getAvatar(user.avatar_id)}
                            </div>
                            
                            {/* User Info Card */}
                            <div className={cn("px-3 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl text-center backdrop-blur-xl border-2 shadow-lg min-w-[90px] md:min-w-[140px]", user.position === 1 && "bg-gradient-to-br from-yellow-500/40 to-yellow-600/40 border-yellow-400/50", user.position === 2 && "bg-gradient-to-br from-gray-400/40 to-gray-500/40 border-gray-300/50", user.position === 3 && "bg-gradient-to-br from-orange-500/40 to-orange-600/40 border-orange-400/50")}>
                              <p className={cn("font-bold text-xs md:text-base mb-1 truncate max-w-[80px] md:max-w-[120px]", user.id === currentUserId ? "text-yellow-300" : "text-white")}>
                                {user.name}
                              </p>
                              <div className="flex items-center justify-center gap-1 text-white/90">
                                <Zap className="w-3 h-3 md:w-4 md:h-4" />
                                <p className="text-xs md:text-sm font-bold">
                                  {user.xp.toLocaleString()} XP
                                </p>
                              </div>
                              
                              {/* Progress Bar */}
                              <div className="mt-1 md:mt-2 w-full bg-white/20 rounded-full h-1 md:h-1.5 overflow-hidden">
                                <motion.div initial={{
                        width: 0
                      }} animate={{
                        width: `${Math.min(user.xp / (top3[0]?.xp || 1) * 100, 100)}%`
                      }} transition={{
                        duration: 1,
                        delay: 0.5 + idx * 0.1
                      }} className={cn("h-full rounded-full", user.position === 1 && "bg-yellow-400", user.position === 2 && "bg-gray-300", user.position === 3 && "bg-orange-400")} />
                              </div>
                            </div>
                          </motion.div>)}
                      </div>
                    </Card>
                  </motion.div>}

                {/* Rest of the ranking */}
                {others.length > 0 && <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.5
          }}>
                    <Card className="glass-card backdrop-blur-2xl bg-white/10 border-white/20 rounded-2xl md:rounded-3xl">
                      <CardContent className="p-2 md:p-4 bg-[#66209e] border-[#6c25a5]">
                        <ScrollArea className="h-[350px] md:h-[400px]">
                          <div className="space-y-2">
                            {others.map((user, idx) => <motion.div key={user.id} initial={{
                      opacity: 0,
                      x: -20
                    }} animate={{
                      opacity: 1,
                      x: 0
                    }} transition={{
                      delay: 0.6 + idx * 0.05
                    }} className={cn("flex items-center gap-2 md:gap-4 p-2 md:p-4 rounded-xl md:rounded-2xl transition-all border-2", user.id === currentUserId ? "bg-yellow-500/30 border-yellow-400 shadow-lg shadow-yellow-400/20" : "bg-white/5 hover:bg-white/10 border-white/10")}>
                                <div className="flex items-center gap-2 md:gap-3 flex-1">
                                  <div className={cn("flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl font-bold text-sm md:text-lg", user.id === currentUserId ? "bg-yellow-400/30 text-yellow-300" : "bg-white/10 text-white/70")}>
                                    #{user.position}
                                  </div>
                                  <div className="text-2xl md:text-4xl">{getAvatar(user.avatar_id)}</div>
                                  <div className="flex-1 min-w-0">
                                    <p className={cn("font-bold text-sm md:text-base truncate", user.id === currentUserId ? "text-yellow-300" : "text-white")}>
                                      {user.name}
                                    </p>
                                    <div className="flex items-center gap-1 text-white/70">
                                      <Zap className="w-3 h-3" />
                                      <p className="text-xs md:text-sm font-semibold">{user.xp.toLocaleString()} XP</p>
                                    </div>
                                  </div>
                                  
                                  {/* Level Badge */}
                                  <div className="px-2 md:px-3 py-1 bg-white/10 rounded-full border border-white/20 shrink-0">
                                    <p className="text-[10px] md:text-xs font-bold text-white/90">
                                      Nv {Math.floor(user.xp / 100) + 1}
                                    </p>
                                  </div>
                                </div>
                              </motion.div>)}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </motion.div>}
              </>}
          </div>
        </>}
    </div>;
}