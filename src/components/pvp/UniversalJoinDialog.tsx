import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Search, Loader2, Swords, Users } from "lucide-react";

interface UniversalJoinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJoinSuccess: (type: '1v1' | 'group', matchId: string, groupId?: string) => void;
  userId: string;
}

export const UniversalJoinDialog = ({ open, onOpenChange, onJoinSuccess, userId }: UniversalJoinDialogProps) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [foundMatch, setFoundMatch] = useState<any>(null);
  const [foundGroup, setFoundGroup] = useState<any>(null);
  const [matchType, setMatchType] = useState<'1v1' | 'group' | null>(null);
  const { toast } = useToast();

  const searchCode = async () => {
    if (!code || code.length !== 6) {
      toast({
        title: "Código inválido",
        description: "Digite um código de 6 caracteres",
        variant: "destructive"
      });
      return;
    }

    setSearching(true);
    setFoundMatch(null);
    setFoundGroup(null);
    setMatchType(null);

    try {
      // Busca 1: Verificar se é match_code (1v1)
      const { data: match, error: matchError } = await supabase
        .from("pvp_matches")
        .select("*, profiles!pvp_matches_host_user_id_fkey(name, avatar_id)")
        .eq("match_code", code.toUpperCase())
        .eq("status", "waiting")
        .maybeSingle();

      if (match && match.match_mode === '1v1') {
        setFoundMatch(match);
        setMatchType('1v1');
        setSearching(false);
        return;
      }

      // Busca 2: Verificar se é invite_code (grupo)
      const { data: group, error: groupError } = await supabase
        .from("pvp_groups")
        .select(`
          *,
          pvp_matches!inner(*),
          profiles!pvp_groups_leader_user_id_fkey(name, avatar_id),
          pvp_group_members(count)
        `)
        .eq("invite_code", code.toUpperCase())
        .maybeSingle();

      if (group && group.pvp_matches.status === 'waiting') {
        setFoundGroup(group);
        setMatchType('group');
        setSearching(false);
        return;
      }

      toast({
        title: "Código não encontrado",
        description: "Verifique o código ou a partida já iniciou",
        variant: "destructive"
      });
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Erro ao buscar",
        description: "Tente novamente",
        variant: "destructive"
      });
    } finally {
      setSearching(false);
    }
  };

  const handleJoin = async () => {
    setLoading(true);

    try {
      // Verificar XP do usuário
      const { data: profile } = await supabase
        .from("profiles")
        .select("current_xp")
        .eq("id", userId)
        .single();

      const xpBet = matchType === '1v1' ? foundMatch.xp_bet : foundGroup.pvp_matches.xp_bet;

      if (!profile || profile.current_xp < xpBet) {
        toast({
          title: "XP insuficiente",
          description: `Você precisa de ${xpBet} XP para entrar`,
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      if (matchType === '1v1') {
        // Entrar em partida 1v1
        const { error: xpError } = await supabase
          .from("profiles")
          .update({ current_xp: profile.current_xp - xpBet })
          .eq("id", userId);

        if (xpError) throw xpError;

        const { error: matchError } = await supabase
          .from("pvp_matches")
          .update({
            opponent_user_id: userId,
            status: "in_progress",
            started_at: new Date().toISOString()
          })
          .eq("id", foundMatch.id);

        if (matchError) {
          // Rollback XP
          await supabase
            .from("profiles")
            .update({ current_xp: profile.current_xp })
            .eq("id", userId);
          throw matchError;
        }

        toast({
          title: "Partida encontrada!",
          description: "Boa sorte no duelo!"
        });

        onJoinSuccess('1v1', foundMatch.id);
      } else if (matchType === 'group') {
        // Entrar em grupo
        const { error: xpError } = await supabase
          .from("profiles")
          .update({ current_xp: profile.current_xp - xpBet })
          .eq("id", userId);

        if (xpError) throw xpError;

        const { error: memberError } = await supabase
          .from("pvp_group_members")
          .insert({
            group_id: foundGroup.id,
            user_id: userId
          });

        if (memberError) {
          // Rollback XP
          await supabase
            .from("profiles")
            .update({ current_xp: profile.current_xp })
            .eq("id", userId);
          throw memberError;
        }

        toast({
          title: "Grupo encontrado!",
          description: `Você entrou em ${foundGroup.name}`
        });

        onJoinSuccess('group', foundGroup.match_id, foundGroup.id);
      }
    } catch (error) {
      console.error("Join error:", error);
      toast({
        title: "Erro ao entrar",
        description: "Tente novamente",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-purple-900/95 to-pink-900/95 border-purple-500 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-white">🔑 Entrar com Código</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-purple-200">Digite o código (6 caracteres)</label>
            <div className="flex gap-2">
              <Input
                placeholder="ABC123"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="text-center text-2xl font-mono tracking-widest bg-purple-950/50 border-purple-600 text-white placeholder:text-purple-400"
              />
              <Button onClick={searchCode} disabled={searching || code.length !== 6}>
                {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {matchType === '1v1' && foundMatch && (
            <Card className="p-4 bg-purple-500/10 border-purple-500">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Swords className="w-6 h-6 text-purple-400" />
                  <h3 className="font-bold text-lg">Partida 1v1</h3>
                </div>
                <div className="space-y-1 text-sm">
                  <p><strong>Host:</strong> {foundMatch.profiles?.name || "Jogador"}</p>
                  <p><strong>Aposta:</strong> {foundMatch.xp_bet} XP</p>
                  <p><strong>Dificuldade:</strong> {foundMatch.difficulty_level}</p>
                </div>
                <Button onClick={handleJoin} disabled={loading} className="w-full">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Entrar na Partida
                </Button>
              </div>
            </Card>
          )}

          {matchType === 'group' && foundGroup && (
            <Card className="p-4 bg-blue-500/10 border-blue-500">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="w-6 h-6 text-blue-400" />
                  <h3 className="font-bold text-lg">Grupo: {foundGroup.name}</h3>
                </div>
                <div className="space-y-1 text-sm">
                  <p><strong>Líder:</strong> {foundGroup.profiles?.name || "Jogador"}</p>
                  <p><strong>Membros:</strong> {foundGroup.pvp_group_members?.[0]?.count || 0}</p>
                  <p><strong>Aposta:</strong> {foundGroup.pvp_matches.xp_bet} XP</p>
                  <p><strong>Dificuldade:</strong> {foundGroup.pvp_matches.difficulty_level}</p>
                </div>
                <Button onClick={handleJoin} disabled={loading} className="w-full">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Entrar no Grupo
                </Button>
              </div>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
