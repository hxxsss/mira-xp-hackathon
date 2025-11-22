import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Users } from "lucide-react";

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGroupCreated: (matchId: string, groupId: string) => void;
  userId: string;
}

export const CreateGroupDialog = ({ open, onOpenChange, onGroupCreated, userId }: CreateGroupDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [xpBet, setXpBet] = useState(50);
  const [maxGroups, setMaxGroups] = useState(2);
  const [currentXp, setCurrentXp] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadUserXp();
    }
  }, [open]);

  const loadUserXp = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("current_xp")
      .eq("id", userId)
      .single();
    if (data) setCurrentXp(data.current_xp);
  };


  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleCreate = async () => {
    if (!selectedLevel) {
      toast({ title: "Erro", description: "Selecione um nível" });
      return;
    }
    if (!groupName.trim()) {
      toast({ title: "Erro", description: "Digite o nome do grupo" });
      return;
    }
    if (xpBet > currentXp) {
      toast({ title: "XP insuficiente", description: "Você não tem XP suficiente para esta aposta" });
      return;
    }

    setLoading(true);
    try {
      // Buscar perguntas do nível selecionado
      const { data: questionsFromDb, error: questionsError } = await supabase
        .from('pvp_questions')
        .select('*')
        .eq('level', selectedLevel);

      if (questionsError) throw questionsError;

      if (!questionsFromDb || questionsFromDb.length < 5) {
        toast({ title: "Erro", description: "Nível sem perguntas suficientes" });
        setLoading(false);
        return;
      }

      const shuffledQuestions = [...questionsFromDb]
        .sort(() => Math.random() - 0.5)
        .slice(0, 5);

      // Deduct XP
      await supabase
        .from("profiles")
        .update({ current_xp: currentXp - xpBet })
        .eq("id", userId);

      // Create match
      const matchCode = generateCode();
      const { data: match, error: matchError } = await supabase
        .from("pvp_matches")
        .insert({
          host_user_id: userId,
          module_id: null,
          difficulty_level: selectedLevel,
          xp_bet: xpBet,
          match_code: matchCode,
          questions_data: shuffledQuestions,
          match_mode: 'group',
          max_groups: maxGroups,
          status: 'waiting'
        })
        .select()
        .single();

      if (matchError) throw matchError;

      // Create group
      const groupCode = generateCode();
      const { data: group, error: groupError } = await supabase
        .from("pvp_groups")
        .insert({
          name: groupName,
          leader_user_id: userId,
          match_id: match.id,
          invite_code: groupCode
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Add leader as member
      await supabase.from("pvp_group_members").insert({
        group_id: group.id,
        user_id: userId
      });

      toast({
        title: "Grupo criado!",
        description: `Compartilhe o código: ${groupCode}`
      });

      onGroupCreated(match.id, group.id);
      onOpenChange(false);
    } catch (error: any) {
      toast({ title: "Erro", description: error.message });
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
            Criar Grupo de Batalha
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-purple-200">Nome do Grupo</Label>
            <Input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="ex: Time Dragão 🐉"
              className="bg-purple-950/50 border-purple-600 text-white"
            />
          </div>

          <div>
            <Label className="text-purple-200">Nível de Dificuldade</Label>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="bg-purple-950/50 border-purple-600 text-white">
                <SelectValue placeholder="Selecione o nível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Iniciante">🌱 Iniciante</SelectItem>
                <SelectItem value="Básico">📚 Básico</SelectItem>
                <SelectItem value="Intermediário">🎯 Intermediário</SelectItem>
                <SelectItem value="Avançado">🚀 Avançado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-purple-200">Número de Grupos (2-5)</Label>
            <Slider
              value={[maxGroups]}
              onValueChange={([value]) => setMaxGroups(value)}
              min={2}
              max={5}
              step={1}
              className="my-4"
            />
            <p className="text-center text-lg font-bold text-purple-300">{maxGroups} grupos</p>
          </div>

          <div>
            <Label className="text-purple-200">Aposta de XP (por membro)</Label>
            <Slider
              value={[xpBet]}
              onValueChange={([value]) => setXpBet(value)}
              min={10}
              max={Math.min(500, currentXp)}
              step={10}
              className="my-4"
            />
            <div className="flex justify-between text-sm">
              <span className="text-purple-300">Seu XP: {currentXp}</span>
              <span className="text-yellow-400 font-bold">{xpBet} XP</span>
            </div>
          </div>

          <Button
            onClick={handleCreate}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-lg py-6"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "🎮 Criar Grupo"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
