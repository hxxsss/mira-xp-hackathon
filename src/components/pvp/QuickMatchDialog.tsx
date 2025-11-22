import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Loader2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QuickMatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMatchFound: (match: any) => void;
  userId: string;
}

export const QuickMatchDialog = ({ open, onOpenChange, onMatchFound, userId }: QuickMatchDialogProps) => {
  const { toast } = useToast();
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [xpBet, setXpBet] = useState(50);
  const [searching, setSearching] = useState(false);
  const [userXp, setUserXp] = useState(0);
  const [queueId, setQueueId] = useState<string | null>(null);

  useEffect(() => {
    if (open) loadUserXp();
  }, [open]);

  // Realtime: listen for match found
  useEffect(() => {
    if (!queueId) return;

    const channel = supabase
      .channel(`queue-${queueId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pvp_queue',
          filter: `id=eq.${queueId}`
        },
        async (payload) => {
          const updated = payload.new as any;
          
          if (updated.status === 'matched' && updated.match_id) {
            // Match found! Fetch match data
            const { data: match } = await supabase
              .from("pvp_matches")
              .select("*")
              .eq("id", updated.match_id)
              .single();

            if (match) {
              setSearching(false);
              setQueueId(null);
              toast({
                title: "Oponente encontrado! 🎮",
                description: "A batalha começa agora!",
              });
              onMatchFound(match);
              onOpenChange(false);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queueId, onMatchFound, onOpenChange, toast]);

  // Poll matchmaking function every 3 seconds
  useEffect(() => {
    if (!searching) return;

    const interval = setInterval(async () => {
      try {
        await supabase.functions.invoke("matchmaking");
      } catch (error) {
        console.error("Error calling matchmaking:", error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [searching]);

  const loadUserXp = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("current_xp")
      .eq("id", userId)
      .single();

    if (data) setUserXp(data.current_xp);
  };

  const handleSearch = async () => {
    if (!selectedLevel) {
      toast({
        title: "Selecione o nível",
        variant: "destructive",
      });
      return;
    }

    if (userXp < 10) {
      toast({
        title: "XP insuficiente",
        description: "Você precisa de pelo menos 10 XP.",
        variant: "destructive",
      });
      return;
    }

    if (xpBet > userXp) {
      toast({
        title: "XP insuficiente",
        description: `Você só tem ${userXp} XP disponível.`,
        variant: "destructive",
      });
      return;
    }

    setSearching(true);

    // Deduct XP
    const { error: xpError } = await supabase
      .from("profiles")
      .update({ current_xp: userXp - xpBet })
      .eq("id", userId);

    if (xpError) {
      toast({
        title: "Erro ao processar XP",
        variant: "destructive",
      });
      setSearching(false);
      return;
    }

    // Enter queue
    const { data: queueEntry, error: queueError } = await supabase
      .from("pvp_queue")
      .insert({
        user_id: userId,
        difficulty_level: selectedLevel,
        xp_bet: xpBet,
        status: "searching",
      })
      .select()
      .single();

    if (queueError || !queueEntry) {
      toast({
        title: "Erro ao entrar na fila",
        variant: "destructive",
      });
      // Refund XP
      await supabase
        .from("profiles")
        .update({ current_xp: userXp })
        .eq("id", userId);
      setSearching(false);
      return;
    }

    setQueueId(queueEntry.id);
    toast({
      title: "🔍 Procurando oponente...",
      description: "Isso pode levar alguns segundos.",
    });

    // Trigger matchmaking immediately
    try {
      await supabase.functions.invoke("matchmaking");
    } catch (error) {
      console.error("Error calling matchmaking:", error);
    }
  };

  const handleCancel = async () => {
    if (queueId) {
      // Refund XP
      await supabase
        .from("profiles")
        .update({ current_xp: userXp })
        .eq("id", userId);

      // Cancel queue entry
      await supabase
        .from("pvp_queue")
        .update({ status: "cancelled" })
        .eq("id", queueId);
    }

    setSearching(false);
    setQueueId(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={searching ? () => {} : onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>⚡ Busca Rápida</DialogTitle>
        </DialogHeader>

        {!searching ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nível de Dificuldade</label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Iniciante">Iniciante</SelectItem>
                  <SelectItem value="Básico">Básico</SelectItem>
                  <SelectItem value="Intermediário">Intermediário</SelectItem>
                  <SelectItem value="Avançado">Avançado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">
                Aposta de XP: <span className="text-primary font-bold text-lg">{xpBet} XP</span>
              </label>
              
              <Slider
                value={[xpBet]}
                onValueChange={([value]) => setXpBet(value)}
                min={10}
                max={Math.max(10, Math.min(500, userXp))}
                step={10}
                className="mb-2"
              />
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Mínimo: 10 XP</span>
                <span>Seu XP disponível: <strong className="text-foreground">{userXp}</strong></span>
                <span>Máximo: {Math.min(500, userXp)} XP</span>
              </div>
              
              {xpBet > userXp && (
                <p className="text-xs text-destructive mt-2">
                  ⚠️ Você não tem XP suficiente para esta aposta!
                </p>
              )}
              
              <div className="flex gap-2 mt-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setXpBet(10)}
                  className="flex-1"
                  type="button"
                >
                  10 XP
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setXpBet(Math.min(50, userXp))}
                  className="flex-1"
                  type="button"
                >
                  50 XP
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setXpBet(Math.min(100, userXp))}
                  className="flex-1"
                  type="button"
                >
                  100 XP
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setXpBet(Math.min(500, userXp))}
                  className="flex-1"
                  type="button"
                >
                  Max
                </Button>
              </div>
            </div>

            <Button onClick={handleSearch} className="w-full">
              <Search className="mr-2 h-4 w-4" />
              Buscar Partida
            </Button>
          </div>
        ) : (
          <div className="text-center space-y-4 py-8">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p className="text-lg font-semibold">Procurando oponente...</p>
            <p className="text-sm text-muted-foreground">
              Nível: {selectedLevel} | Aposta: {xpBet} XP
            </p>
            <Button variant="outline" onClick={handleCancel}>
              Cancelar Busca
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
