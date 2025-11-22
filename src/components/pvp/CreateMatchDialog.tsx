import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { quizQuestions } from "@/data/quiz-questions";

interface CreateMatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMatchCreated: (match: any) => void;
  userId: string;
}

export const CreateMatchDialog = ({
  open,
  onOpenChange,
  onMatchCreated,
  userId,
}: CreateMatchDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [xpBet, setXpBet] = useState([50]);
  const [userXp, setUserXp] = useState(0);

  useEffect(() => {
    if (open) {
      loadUserXp();
    }
  }, [open]);

  const loadUserXp = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('current_xp')
      .eq('id', userId)
      .single();
    
    if (data) {
      setUserXp(data.current_xp);
    }
  };


  const handleCreate = async () => {
    if (!selectedLevel) {
      toast({
        title: "Selecione um nível",
        description: "Escolha o nível de dificuldade para a partida.",
        variant: "destructive",
      });
      return;
    }

    if (userXp < 10) {
      toast({
        title: "XP insuficiente",
        description: "Você precisa de pelo menos 10 XP para criar uma partida.",
        variant: "destructive",
      });
      return;
    }

    if (xpBet[0] > userXp) {
      toast({
        title: "XP insuficiente",
        description: `Você precisa de pelo menos ${xpBet[0]} XP para criar esta partida.`,
        variant: "destructive",
      });
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
        throw new Error("Nível sem perguntas suficientes");
      }

      // Embaralhar e selecionar 5 perguntas
      const shuffled = [...questionsFromDb].sort(() => Math.random() - 0.5);
      const selectedQuestions = shuffled.slice(0, 5);

      // Gerar código da partida (6 caracteres aleatórios)
      const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
      };

      // Descontar XP do jogador
      await supabase
        .from('profiles')
        .update({ current_xp: userXp - xpBet[0] })
        .eq('id', userId);

      // Criar a partida
      const { data: match, error } = await supabase
        .from('pvp_matches')
        .insert({
          host_user_id: userId,
          module_id: null,
          difficulty_level: selectedLevel,
          xp_bet: xpBet[0],
          questions_data: selectedQuestions as any,
          status: 'waiting',
          match_code: generateCode(),
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Partida criada!",
        description: `Código da sala: ${match.match_code}`,
      });

      onMatchCreated(match);
    } catch (error: any) {
      console.error('Error creating match:', error);
      toast({
        title: "Erro ao criar partida",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Nova Partida</DialogTitle>
          <DialogDescription>
            Configure sua partida PvP e convide um amigo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Nível de Dificuldade</Label>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger>
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

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Aposta de XP</Label>
              <span className="text-sm text-muted-foreground">
                Seu XP: {userXp}
              </span>
            </div>
            <Slider
              value={xpBet}
              onValueChange={setXpBet}
              min={10}
              max={Math.max(10, Math.min(500, userXp))}
              step={10}
              className="w-full"
            />
            <div className="text-center">
              <span className="text-2xl font-bold text-primary">{xpBet[0]} XP</span>
              <p className="text-xs text-muted-foreground mt-1">
                O vencedor leva {xpBet[0] * 2} XP
              </p>
            </div>
          </div>

          <Button
            onClick={handleCreate}
            disabled={loading || !selectedLevel}
            className="w-full"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Criar Partida
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
