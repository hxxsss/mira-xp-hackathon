import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, Trophy } from "lucide-react";

interface JoinMatchRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJoinSuccess: (matchId: string) => void;
  userId: string;
}

export const JoinMatchRoomDialog = ({ open, onOpenChange, onJoinSuccess, userId }: JoinMatchRoomDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [matchCode, setMatchCode] = useState("");
  const { toast } = useToast();

  const searchAndJoinMatch = async () => {
    if (matchCode.length !== 6) {
      toast({ 
        title: "Código inválido", 
        description: "Digite um código de 6 caracteres", 
        variant: "destructive" 
      });
      return;
    }

    setLoading(true);
    try {
      const { data: match, error } = await supabase
        .from("pvp_matches")
        .select("*")
        .eq("match_code", matchCode.toUpperCase())
        .eq("match_mode", "group")
        .maybeSingle();

      if (error || !match) {
        toast({ 
          title: "Sala não encontrada", 
          description: "Código inválido ou sala não existe", 
          variant: "destructive" 
        });
        return;
      }

      if (match.status !== 'waiting') {
        toast({ 
          title: "Sala indisponível", 
          description: "Esta partida já começou ou terminou", 
          variant: "destructive" 
        });
        return;
      }

      toast({ 
        title: "Sala encontrada!", 
        description: "Carregando grupos disponíveis...",
        className: "bg-green-500" 
      });
      
      onJoinSuccess(match.id);
      onOpenChange(false);
      setMatchCode("");
    } catch (error) {
      console.error("Erro ao buscar sala:", error);
      toast({ 
        title: "Erro", 
        description: "Não foi possível buscar a sala", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-purple-900/95 to-purple-800/95 backdrop-blur-xl border-purple-500 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="w-7 h-7 text-yellow-400" />
            Entrar na Sala
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-purple-200 font-semibold">Código da Sala de Batalha</Label>
            <div className="flex gap-2">
              <Input
                value={matchCode}
                onChange={(e) => setMatchCode(e.target.value.toUpperCase())}
                placeholder="ABC123"
                maxLength={6}
                className="bg-purple-950/50 border-purple-500 text-white text-center text-3xl font-mono tracking-widest placeholder:text-purple-400/50"
                disabled={loading}
                onKeyDown={(e) => e.key === 'Enter' && searchAndJoinMatch()}
              />
              <Button
                onClick={searchAndJoinMatch}
                disabled={loading || matchCode.length !== 6}
                size="lg"
                className="bg-purple-600 hover:bg-purple-700 px-6"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
              </Button>
            </div>
            <p className="text-purple-300 text-sm">
              Digite o código de 6 caracteres da sala
            </p>
          </div>

          <div className="bg-purple-950/30 rounded-lg p-4 border border-purple-500/30">
            <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              Como funciona?
            </h4>
            <ol className="text-purple-200 text-sm space-y-2 list-decimal list-inside">
              <li>Digite o código da sala recebido</li>
              <li>Veja os grupos disponíveis</li>
              <li>Entre em um grupo ou crie o seu</li>
              <li>Aguarde o início da batalha</li>
            </ol>
          </div>

          <Button
            onClick={searchAndJoinMatch}
            disabled={loading || matchCode.length !== 6}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-lg py-6 rounded-xl"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Procurando sala...
              </>
            ) : (
              "Entrar na Sala"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
