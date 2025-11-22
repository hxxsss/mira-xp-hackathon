import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, Calendar, CheckCircle, DollarSign, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
interface Goal {
  id: string;
  title: string;
  total_amount: number;
  current_amount: number;
  target_date?: string;
  created_at?: string;
  is_active?: boolean;
}
interface GoalDetailsModalProps {
  goal: Goal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
}
export function GoalDetailsModal({
  goal,
  open,
  onOpenChange,
  onEdit
}: GoalDetailsModalProps) {
  if (!goal) return null;
  const progressPercentage = goal.current_amount / goal.total_amount * 100;
  const remainingAmount = goal.total_amount - goal.current_amount;
  const createdAt = goal.created_at ? new Date(goal.created_at) : new Date();
  const daysSinceCreation = Math.floor((new Date().getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
  const daysUntilTarget = goal.target_date ? Math.ceil((new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 30; // fallback para 30 dias

  const dailySuggestion = daysUntilTarget > 0 ? remainingAmount / daysUntilTarget : 0;
  const getProgressColor = () => {
    if (progressPercentage >= 80) return "text-green-500";
    if (progressPercentage >= 40) return "text-yellow-500";
    return "text-blue-500";
  };
  const getMotivationalMessage = () => {
    if (progressPercentage >= 80) return "Você está quase lá! 🎉 Continue nesse ritmo incrível!";
    if (progressPercentage >= 50) return "Ótimo progresso! Mantenha o foco no seu objetivo! 💪";
    if (progressPercentage >= 20) return "Você começou bem! Cada passo conta! 🚀";
    return "Toda grande conquista começa com o primeiro passo! 🌟";
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] glass-card border-2 border-white/30 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-3xl">
            <div className="relative">
              {/* Glow neon */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-secondary rounded-full blur-xl opacity-70 animate-pulse" />
              {/* Ícone em container vibrante */}
              <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center shadow-2xl ring-4 ring-primary/20">
                <Target className="w-8 h-8 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" strokeWidth={3} />
              </div>
            </div>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary">
              Minha Meta
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-3">
          {/* Título da Meta */}
          <div className="text-center">
            <h3 className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">{goal.title}</h3>
          </div>

          {/* Barra de Progresso Principal com Bolinha - estilo neon */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white font-medium drop-shadow-sm">Progresso</span>
              <span className="font-bold text-accent text-lg drop-shadow-[0_0_10px_rgba(247,196,96,0.8)]">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            
            {/* Barra customizada com bolinha e neon glow */}
            <div className="relative w-full h-3 bg-white/20 rounded-full backdrop-blur-sm border border-white/30">
              {/* Barra de progresso preenchida com glow */}
              <div className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-primary via-accent to-secondary transition-all duration-300 shadow-[0_0_15px_rgba(164,69,178,0.6)]" style={{
              width: `${progressPercentage}%`
            }} />
              
              {/* Bolinha indicadora com neon */}
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-accent shadow-[0_0_20px_rgba(247,196,96,0.8)] border-2 border-white transition-all duration-300" style={{
              left: `${progressPercentage}%`
            }} />
            </div>
          </div>

          {/* Mensagem Motivacional */}
          <div className="glass-card border border-white/30 rounded-lg p-3 text-center shadow-[0_0_15px_rgba(164,69,178,0.3)]">
            <p className="text-sm font-medium text-white drop-shadow-sm">
              {getMotivationalMessage()}
            </p>
          </div>

          {/* Grid de 2 colunas: Progresso Financeiro e Estatísticas */}
          <div className="grid grid-cols-2 gap-4">
            {/* Coluna 1: Progresso Financeiro */}
            <div className="glass-card rounded-lg p-4 space-y-3 border border-white/30">
              <div className="flex items-center gap-2 text-white font-semibold">
                <DollarSign className="w-5 h-5 text-accent drop-shadow-[0_0_5px_rgba(247,196,96,0.6)]" />
                <span className="drop-shadow-sm">Progresso Financeiro</span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/80">Valor Atual:</span>
                  <span className="font-bold text-white">
                    R$ {goal.current_amount.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2
                  })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80">Meta Total:</span>
                  <span className="font-bold text-white">
                    R$ {goal.total_amount.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2
                  })}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-white/20">
                  <span className="text-white/80">Faltam:</span>
                  <span className="font-bold text-accent drop-shadow-[0_0_5px_rgba(247,196,96,0.6)]">
                    R$ {remainingAmount.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2
                  })}
                  </span>
                </div>
              </div>
            </div>

            {/* Coluna 2: Estatísticas */}
            <div className="glass-card rounded-lg p-4 space-y-3 border border-white/30">
              <div className="flex items-center gap-2 text-white font-semibold">
                <TrendingUp className="w-5 h-5 text-secondary drop-shadow-[0_0_5px_rgba(232,121,192,0.6)]" />
                <span className="drop-shadow-sm">Estatísticas</span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/80">Criado em:</span>
                  <span className="font-medium text-white">
                    {createdAt.toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80">Tempo decorrido:</span>
                  <span className="font-medium text-white">
                    {daysSinceCreation} {daysSinceCreation === 1 ? 'dia' : 'dias'}
                  </span>
                </div>
                {goal.target_date && <div className="flex justify-between">
                    <span className="text-white/80">Prazo:</span>
                    <span className="font-medium text-white">
                      {formatDistanceToNow(new Date(goal.target_date), {
                    locale: ptBR,
                    addSuffix: true
                  })}
                    </span>
                  </div>}
                {daysUntilTarget > 0 && <div className="flex justify-between">
                    <span className="text-white/80">Meta diária:</span>
                    <span className="font-medium text-white">
                      R$ {dailySuggestion.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2
                  })}
                    </span>
                  </div>}
              </div>
            </div>
          </div>

          {/* Dica */}
          <div className="glass-card rounded-lg p-3 border border-white/30">
            <div className="flex items-center gap-2 text-white font-semibold mb-2">
              <Sparkles className="w-5 h-5 text-accent drop-shadow-[0_0_10px_rgba(247,196,96,0.6)] animate-pulse" />
              <span className="drop-shadow-sm">Dica para alcançar sua meta</span>
            </div>
            <p className="text-sm text-white/90 drop-shadow-sm">
              {progressPercentage >= 50 ? "Continue economizando regularmente e complete módulos de aprendizado para ganhar pontos extras!" : "Estabeleça pequenas metas semanais e revise seu progresso regularmente para manter a motivação!"}
            </p>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              onClick={() => {
                onOpenChange(false);
                if (onEdit) onEdit();
              }} 
              className="flex-1 bg-gradient-to-r from-primary via-accent to-secondary hover:shadow-[0_0_25px_rgba(164,69,178,0.6)] border-0 text-white transition-all"
            >
              Editar Meta
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>;
}