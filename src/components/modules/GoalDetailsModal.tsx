import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, Calendar, CheckCircle, DollarSign, Sparkles, Plus } from "lucide-react";
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
  onAddValue?: () => void;
}
export function GoalDetailsModal({
  goal,
  open,
  onOpenChange,
  onEdit,
  onAddValue
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
      <DialogContent className="max-w-4xl max-h-[85vh] bg-white">
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

        <div className="space-y-4 py-3">
          {/* Título da Meta */}
          <div className="text-center">
            <h3 className="text-xl font-bold text-foreground">{goal.title}</h3>
          </div>

          {/* Barra de Progresso Principal com Bolinha */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-black font-medium">Progresso</span>
              <span className="font-bold text-[#b8860b] text-lg">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            
            {/* Barra customizada com bolinha */}
            <div className="relative w-full h-3 bg-gray-200 rounded-full">
              {/* Barra de progresso preenchida */}
              <div className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 transition-all duration-300" style={{
              width: `${progressPercentage}%`
            }} />
              
              {/* Bolinha indicadora */}
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#b8860b] shadow-lg border-2 border-white transition-all duration-300" style={{
              left: `${progressPercentage}%`
            }} />
            </div>
          </div>

          {/* Mensagem Motivacional */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-center">
            <p className="text-sm font-medium text-foreground">
              {getMotivationalMessage()}
            </p>
          </div>

          {/* Grid de 2 colunas: Progresso Financeiro e Estatísticas */}
          <div className="grid grid-cols-2 gap-4">
            {/* Coluna 1: Progresso Financeiro */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-gray-900 font-semibold">
                <DollarSign className="w-5 h-5" />
                <span>Progresso Financeiro</span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor Atual:</span>
                  <span className="font-bold text-gray-900">
                    R$ {goal.current_amount.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2
                  })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Meta Total:</span>
                  <span className="font-bold text-gray-900">
                    R$ {goal.total_amount.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2
                  })}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-gray-600">Faltam:</span>
                  <span className="font-bold text-[#b8860b]">
                    R$ {remainingAmount.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2
                  })}
                  </span>
                </div>
              </div>
            </div>

            {/* Coluna 2: Estatísticas */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-gray-900 font-semibold">
                <TrendingUp className="w-5 h-5" />
                <span>Estatísticas</span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Criado em:</span>
                  <span className="font-medium text-gray-900">
                    {createdAt.toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tempo decorrido:</span>
                  <span className="font-medium text-gray-900">
                    {daysSinceCreation} {daysSinceCreation === 1 ? 'dia' : 'dias'}
                  </span>
                </div>
                {goal.target_date && <div className="flex justify-between">
                    <span className="text-gray-600">Prazo:</span>
                    <span className="font-medium text-gray-900">
                      {formatDistanceToNow(new Date(goal.target_date), {
                    locale: ptBR,
                    addSuffix: true
                  })}
                    </span>
                  </div>}
                {daysUntilTarget > 0 && <div className="flex justify-between">
                    <span className="text-gray-600">Meta diária:</span>
                    <span className="font-medium text-gray-900">
                      R$ {dailySuggestion.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2
                  })}
                    </span>
                  </div>}
              </div>
            </div>
          </div>

          {/* Dica */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-900 font-semibold mb-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span>Dica para alcançar sua meta</span>
            </div>
            <p className="text-sm text-black">
              {progressPercentage >= 50 ? "Continue economizando regularmente e complete módulos de aprendizado para ganhar pontos extras!" : "Estabeleça pequenas metas semanais e revise seu progresso regularmente para manter a motivação!"}
            </p>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-2 pt-2">
            <Button 
              onClick={() => {
                onOpenChange(false);
                if (onAddValue) onAddValue();
              }}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Guardar Dinheiro
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => {
                onOpenChange(false);
                if (onEdit) onEdit();
              }} 
              className="flex-1 hover:border-indigo-400 transition-colors bg-indigo-600 hover:bg-indigo-500 text-slate-50"
            >
              Editar Meta
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>;
}