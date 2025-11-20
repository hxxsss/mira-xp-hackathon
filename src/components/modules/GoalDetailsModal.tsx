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

export function GoalDetailsModal({ goal, open, onOpenChange, onEdit }: GoalDetailsModalProps) {
  if (!goal) return null;

  const progressPercentage = (goal.current_amount / goal.total_amount) * 100;
  const remainingAmount = goal.total_amount - goal.current_amount;
  
  const createdAt = goal.created_at ? new Date(goal.created_at) : new Date();
  const daysSinceCreation = Math.floor((new Date().getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
  
  const daysUntilTarget = goal.target_date 
    ? Math.ceil((new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 30; // fallback para 30 dias
    
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-3xl">
            <div className="relative">
              {/* Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 rounded-full blur-xl opacity-60 animate-pulse" />
              {/* Ícone em container vibrante */}
              <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 flex items-center justify-center shadow-2xl ring-4 ring-white/20">
                <Target className="w-8 h-8 text-white" strokeWidth={3} />
              </div>
            </div>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600">
              Minha Meta
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Título da Meta */}
          <div className="text-center">
            <h3 className="text-xl font-bold text-foreground">{goal.title}</h3>
          </div>

          {/* Barra de Progresso Principal */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progresso</span>
              <span className={`font-bold ${getProgressColor()}`}>
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <Progress value={progressPercentage} className="h-4" />
          </div>

          {/* Mensagem Motivacional */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-center">
            <p className="text-sm font-medium text-foreground">
              {getMotivationalMessage()}
            </p>
          </div>

          {/* Progresso Financeiro */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <DollarSign className="w-5 h-5" />
              <span>Progresso Financeiro</span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor Atual:</span>
                <span className="font-bold text-foreground">
                  R$ {goal.current_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Meta Total:</span>
                <span className="font-bold text-foreground">
                  R$ {goal.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="text-muted-foreground">Faltam:</span>
                <span className="font-bold text-primary">
                  R$ {remainingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <TrendingUp className="w-5 h-5" />
              <span>Estatísticas</span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Criado em:</span>
                <span className="font-medium text-foreground">
                  {createdAt.toLocaleDateString('pt-BR')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tempo decorrido:</span>
                <span className="font-medium text-foreground">
                  {daysSinceCreation} {daysSinceCreation === 1 ? 'dia' : 'dias'}
                </span>
              </div>
              {goal.target_date && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Prazo:</span>
                  <span className="font-medium text-foreground">
                    {formatDistanceToNow(new Date(goal.target_date), { 
                      locale: ptBR,
                      addSuffix: true 
                    })}
                  </span>
                </div>
              )}
              {daysUntilTarget > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Meta diária sugerida:</span>
                  <span className="font-medium text-foreground">
                    R$ {dailySuggestion.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-border">
                <span className="text-muted-foreground">Status:</span>
                <span className="flex items-center gap-1 font-medium text-green-500">
                  <CheckCircle className="w-4 h-4" />
                  {goal.is_active !== false ? 'Ativa' : 'Inativa'}
                </span>
              </div>
            </div>
          </div>

          {/* Dicas */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <Sparkles className="w-5 h-5 text-primary" />
              <span>Dicas para alcançar sua meta</span>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span>•</span>
                <span>Complete módulos de aprendizado para ganhar pontos extras</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Mantenha o foco economizando regularmente</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Revise seu progresso semanalmente para manter a motivação</span>
              </li>
            </ul>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Fechar
            </Button>
            <Button 
              className="flex-1"
              onClick={() => {
                onOpenChange(false);
                if (onEdit) onEdit();
              }}
            >
              Editar Meta
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
