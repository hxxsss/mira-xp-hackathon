import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface JoinMatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMatchJoined: (match: any) => void;
  userId: string;
}

export const JoinMatchDialog = ({
  open,
  onOpenChange,
  onMatchJoined,
  userId,
}: JoinMatchDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [matchCode, setMatchCode] = useState("");
  const [foundMatch, setFoundMatch] = useState<any>(null);
  const [userXp, setUserXp] = useState(0);

  const searchMatch = async () => {
    if (matchCode.length !== 6) {
      toast({
        title: "Código inválido",
        description: "O código deve ter 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Buscar XP do usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select('current_xp')
        .eq('id', userId)
        .single();

      if (profile) {
        setUserXp(profile.current_xp);
      }

      // Buscar partida
      const { data: match, error } = await supabase
        .from('pvp_matches')
        .select(`
          *,
          learning_modules (
            number,
            title
          )
        `)
        .eq('match_code', matchCode.toUpperCase())
        .eq('status', 'waiting')
        .single();

      if (error || !match) {
        toast({
          title: "Partida não encontrada",
          description: "Verifique o código e tente novamente.",
          variant: "destructive",
        });
        setFoundMatch(null);
        return;
      }

      if (match.host_user_id === userId) {
        toast({
          title: "Erro",
          description: "Você não pode entrar na sua própria partida.",
          variant: "destructive",
        });
        setFoundMatch(null);
        return;
      }

      setFoundMatch(match);
    } catch (error: any) {
      console.error('Error searching match:', error);
      toast({
        title: "Erro ao buscar partida",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!foundMatch) return;

    if (foundMatch.xp_bet > userXp) {
      toast({
        title: "XP insuficiente",
        description: `Você precisa de pelo menos ${foundMatch.xp_bet} XP para entrar nesta partida.`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Descontar XP do jogador
      await supabase
        .from('profiles')
        .update({ current_xp: userXp - foundMatch.xp_bet })
        .eq('id', userId);

      // Entrar na partida
      const { data: match, error } = await supabase
        .from('pvp_matches')
        .update({
          opponent_user_id: userId,
          status: 'in_progress',
          started_at: new Date().toISOString(),
        })
        .eq('id', foundMatch.id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Partida iniciada!",
        description: "Boa sorte!",
      });

      onMatchJoined(match);
    } catch (error: any) {
      console.error('Error joining match:', error);
      toast({
        title: "Erro ao entrar na partida",
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
          <DialogTitle>Entrar em Partida</DialogTitle>
          <DialogDescription>
            Digite o código de 6 dígitos para entrar em uma partida
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Código da Partida</Label>
            <div className="flex gap-2">
              <Input
                placeholder="ABC123"
                value={matchCode}
                onChange={(e) => setMatchCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="text-center text-lg font-mono tracking-widest"
              />
              <Button onClick={searchMatch} disabled={loading || matchCode.length !== 6}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {!loading && "Buscar"}
              </Button>
            </div>
          </div>

          {foundMatch && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold">Partida encontrada!</p>
                  <p className="text-sm">
                    Módulo: {foundMatch.learning_modules?.number} - {foundMatch.learning_modules?.title}
                  </p>
                  <p className="text-sm">
                    Aposta: <span className="font-bold text-primary">{foundMatch.xp_bet} XP</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Seu XP atual: {userXp}
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {foundMatch && (
            <Button
              onClick={handleJoin}
              disabled={loading || foundMatch.xp_bet > userXp}
              className="w-full"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Aceitar Desafio
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
