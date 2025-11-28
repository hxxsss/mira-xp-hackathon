import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, Trophy, Zap, Target, Users } from "lucide-react";

interface JoinRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRoomJoined: (matchId: string) => void;
  userId: string;
}

export const JoinRoomDialog = ({ open, onOpenChange, onRoomJoined, userId }: JoinRoomDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [foundRoom, setFoundRoom] = useState<any>(null);
  const [currentXp, setCurrentXp] = useState(0);
  const { toast } = useToast();

  const searchRoom = async () => {
    if (roomCode.length !== 6) {
      toast({ 
        title: "Código inválido", 
        description: "Digite um código de 6 caracteres", 
        variant: "destructive" 
      });
      return;
    }

    setSearching(true);
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("current_xp")
        .eq("id", userId)
        .single();
      
      if (profile) setCurrentXp(profile.current_xp);

      const { data: room, error } = await supabase
        .from("pvp_matches")
        .select("*")
        .eq("match_code", roomCode.toUpperCase())
        .eq("match_mode", "group")
        .maybeSingle();

      if (error || !room) {
        toast({ 
          title: "Sala não encontrada", 
          description: "Código inválido ou sala não existe", 
          variant: "destructive" 
        });
        return;
      }

      if (room.status !== 'waiting') {
        toast({ 
          title: "Sala indisponível", 
          description: "Esta partida já começou ou terminou", 
          variant: "destructive" 
        });
        return;
      }

      // Contar grupos
      const { count } = await supabase
        .from("pvp_groups")
        .select("*", { count: "exact", head: true })
        .eq("match_id", room.id);

      setFoundRoom({ ...room, groupCount: count || 0 });
      toast({ 
        title: "Sala encontrada!", 
        description: `Batalha Épica - ${room.difficulty_level}`,
        className: "bg-green-500" 
      });
    } catch (error) {
      console.error("Erro ao buscar sala:", error);
      toast({ 
        title: "Erro", 
        description: "Não foi possível buscar a sala", 
        variant: "destructive" 
      });
    } finally {
      setSearching(false);
    }
  };

  const handleJoin = async () => {
    if (!foundRoom) return;

    setLoading(true);
    try {
      onRoomJoined(foundRoom.id);
      onOpenChange(false);
      setRoomCode("");
      setFoundRoom(null);
    } catch (error: any) {
      console.error("Erro ao entrar na sala:", error);
      toast({ 
        title: "Erro", 
        description: "Não foi possível entrar na sala", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-purple-900/95 to-pink-900/95 border-purple-500 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-purple-300">
            <Trophy className="w-6 h-6" />
            Entrar em Sala
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-purple-200">Código da Sala</Label>
            <div className="flex gap-2">
              <Input
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="ABC123"
                maxLength={6}
                className="bg-purple-950/50 border-purple-600 text-white text-center text-2xl font-mono tracking-widest"
              />
              <Button
                onClick={searchRoom}
                disabled={searching || roomCode.length !== 6}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {searching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {foundRoom && (
            <div className="bg-purple-950/50 rounded-lg p-4 space-y-3 border-2 border-purple-500">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Batalha Épica
              </h3>
              <div className="space-y-2 text-sm text-purple-200">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-cyan-400" />
                  <span><strong>Dificuldade:</strong> {foundRoom.difficulty_level}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span><strong>Aposta:</strong> {foundRoom.xp_bet} XP por jogador</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-400" />
                  <span><strong>Grupos:</strong> {foundRoom.groupCount}/{foundRoom.max_groups}</span>
                </div>
                <p className="text-yellow-300 mt-2">
                  ⚡ <strong>Seu XP:</strong> {currentXp} XP
                </p>
              </div>

              <Button
                onClick={handleJoin}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "✅ Entrar na Sala"
                )}
              </Button>

              <p className="text-xs text-purple-300 text-center">
                Você escolherá ou criará seu grupo na próxima tela
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
