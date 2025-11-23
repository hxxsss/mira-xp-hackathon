import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Users, Search } from "lucide-react";

interface JoinGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGroupJoined: (matchId: string, groupId: string) => void;
  userId: string;
}

export const JoinGroupDialog = ({ open, onOpenChange, onGroupJoined, userId }: JoinGroupDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [foundGroup, setFoundGroup] = useState<any>(null);
  const [currentXp, setCurrentXp] = useState(0);
  const { toast } = useToast();

  const searchGroup = async () => {
    if (inviteCode.length !== 6) {
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

      const { data: group, error } = await supabase
        .from("pvp_groups")
        .select(`
          *,
          pvp_matches!inner(
            id,
            xp_bet,
            difficulty_level,
            status,
            max_groups
          )
        `)
        .eq("invite_code", inviteCode.toUpperCase())
        .maybeSingle();

      if (error || !group) {
        toast({ 
          title: "Grupo não encontrado", 
          description: "Código inválido ou grupo não existe", 
          variant: "destructive" 
        });
        return;
      }

      if (group.pvp_matches.status !== 'waiting') {
        toast({ 
          title: "Grupo indisponível", 
          description: "Esta partida já começou ou terminou", 
          variant: "destructive" 
        });
        return;
      }

      const { data: existingMember } = await supabase
        .from("pvp_group_members")
        .select("id")
        .eq("group_id", group.id)
        .eq("user_id", userId)
        .maybeSingle();

      if (existingMember) {
        toast({ 
          title: "Já está no grupo", 
          description: "Você já é membro deste grupo" 
        });
        onGroupJoined(group.pvp_matches.id, group.id);
        onOpenChange(false);
        return;
      }

      setFoundGroup(group);
      toast({ 
        title: "Grupo encontrado!", 
        description: `${group.name} encontrado`,
        className: "bg-green-500" 
      });
    } catch (error) {
      console.error("Erro ao buscar grupo:", error);
      toast({ 
        title: "Erro", 
        description: "Não foi possível buscar o grupo", 
        variant: "destructive" 
      });
    } finally {
      setSearching(false);
    }
  };

  const handleJoin = async () => {
    if (!foundGroup) return;

    const xpBet = foundGroup.pvp_matches.xp_bet;
    if (currentXp < xpBet) {
      toast({
        title: "XP insuficiente 🎮",
        description: `Você precisa de ${xpBet} XP. Complete módulos na aba Mentalidade!`,
        variant: "destructive",
        duration: 6000
      });
      return;
    }

    setLoading(true);
    try {
      await supabase
        .from("profiles")
        .update({ current_xp: currentXp - xpBet })
        .eq("id", userId);

      const { error } = await supabase
        .from("pvp_group_members")
        .insert({
          group_id: foundGroup.id,
          user_id: userId
        });

      if (error) throw error;

      toast({ 
        title: "Entrou no grupo!", 
        description: `Você entrou em ${foundGroup.name}` 
      });
      onGroupJoined(foundGroup.pvp_matches.id, foundGroup.id);
      onOpenChange(false);
      setInviteCode("");
      setFoundGroup(null);
    } catch (error: any) {
      console.error("Erro ao entrar no grupo:", error);
      
      await supabase
        .from("profiles")
        .update({ current_xp: currentXp })
        .eq("id", userId);
      
      toast({ 
        title: "Erro", 
        description: "Não foi possível entrar no grupo", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-purple-900/90 to-pink-900/90 border-purple-500">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-purple-300">
            <Users className="w-6 h-6" />
            Entrar em Grupo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-purple-200">Código do Grupo</Label>
            <div className="flex gap-2">
              <Input
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="ABC123"
                maxLength={6}
                className="bg-purple-950/50 border-purple-600 text-white text-center text-2xl font-mono tracking-widest"
              />
              <Button
                onClick={searchGroup}
                disabled={searching || inviteCode.length !== 6}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {searching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {foundGroup && (
            <div className="bg-purple-950/50 rounded-lg p-4 space-y-3 border-2 border-purple-500">
              <h3 className="text-xl font-bold text-white">{foundGroup.name}</h3>
              <div className="space-y-2 text-sm text-purple-200">
                <p>📊 <strong>Dificuldade:</strong> {foundGroup.pvp_matches.difficulty_level}</p>
                <p>💰 <strong>Aposta:</strong> {foundGroup.pvp_matches.xp_bet} XP</p>
                <p>🎮 <strong>Máx. Grupos:</strong> {foundGroup.pvp_matches.max_groups}</p>
                <p className="text-yellow-300">⚡ <strong>Seu XP:</strong> {currentXp} XP</p>
              </div>

              <Button
                onClick={handleJoin}
                disabled={loading || currentXp < foundGroup.pvp_matches.xp_bet}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : currentXp < foundGroup.pvp_matches.xp_bet ? (
                  "❌ XP Insuficiente"
                ) : (
                  "✅ Entrar no Grupo"
                )}
              </Button>

              {currentXp < foundGroup.pvp_matches.xp_bet && (
                <p className="text-sm text-yellow-300 text-center bg-yellow-900/30 p-2 rounded-lg">
                  💡 Complete módulos na aba <strong>Mentalidade</strong> para ganhar mais XP!
                </p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
