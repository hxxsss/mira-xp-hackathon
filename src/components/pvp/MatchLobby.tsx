import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Users, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MatchLobbyProps {
  match: any;
  userId: string;
  onLeave: () => void;
}

export const MatchLobby = ({ match, userId, onLeave }: MatchLobbyProps) => {
  const { toast } = useToast();
  const isHost = match.host_user_id === userId;

  const copyMatchCode = () => {
    navigator.clipboard.writeText(match.match_code);
    toast({
      title: "Código copiado!",
      description: "Compartilhe com seu oponente.",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Users className="h-16 w-16 text-primary animate-pulse" />
          </div>
          <CardTitle className="text-3xl">Aguardando Oponente</CardTitle>
          <CardDescription>
            {isHost ? "Compartilhe o código abaixo com seu amigo" : "O jogo iniciará em breve..."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">Código da Sala</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-4xl font-bold font-mono tracking-widest bg-primary/10 px-6 py-3 rounded-lg">
                {match.match_code}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={copyMatchCode}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Aposta:</span>
              <span className="font-bold text-primary">{match.xp_bet} XP</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Prêmio:</span>
              <span className="font-bold text-primary">{match.xp_bet * 2} XP</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Aguardando jogador...</span>
          </div>

          <Button
            variant="outline"
            onClick={onLeave}
            className="w-full"
          >
            {isHost ? "Cancelar Partida" : "Sair"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
