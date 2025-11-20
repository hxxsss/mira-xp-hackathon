import { motion } from "framer-motion";
import { Target, TrendingUp, Calendar, DollarSign, Edit, Eye, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { differenceInDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Goal {
  id: string;
  title: string;
  total_amount: number;
  current_amount: number;
  target_date?: string;
  created_at: string;
  is_active: boolean;
}

interface GoalCardProps {
  goal: Goal;
  onEdit: () => void;
  onAddValue: () => void;
  onViewDetails: () => void;
}

export const GoalCard = ({ goal, onEdit, onAddValue, onViewDetails }: GoalCardProps) => {
  const progress = Math.min((goal.current_amount / goal.total_amount) * 100, 100);
  const remaining = goal.total_amount - goal.current_amount;
  const daysUntilTarget = goal.target_date 
    ? differenceInDays(new Date(goal.target_date), new Date())
    : null;

  const getGradient = () => {
    if (progress >= 80) return "from-green-500 to-emerald-500";
    if (progress >= 40) return "from-yellow-500 to-amber-500";
    return "from-purple-500 to-pink-500";
  };

  const getProgressColor = () => {
    if (progress >= 80) return "from-green-400 to-emerald-400";
    if (progress >= 40) return "from-yellow-400 to-amber-400";
    return "from-purple-400 to-pink-400";
  };

  const getMotivationalIcon = () => {
    if (progress >= 80) return "🏆";
    if (progress >= 60) return "🚀";
    if (progress >= 40) return "💪";
    if (progress >= 20) return "🌱";
    return "🎯";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden relative group">
        {/* Gradient Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${getGradient()} opacity-10 group-hover:opacity-15 transition-opacity`} />
        
        <div className="relative p-6 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <span className="text-2xl">{getMotivationalIcon()}</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">{goal.title}</h3>
                {goal.is_active && (
                  <span className="text-xs font-medium text-primary">Meta Ativa</span>
                )}
              </div>
            </div>
            <Target className="w-6 h-6 text-primary animate-pulse" />
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Progresso</span>
              <span className="text-2xl font-bold text-primary">{progress.toFixed(1)}%</span>
            </div>
            <div className="relative w-full h-4 bg-muted rounded-full overflow-hidden">
              <motion.div
                className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getProgressColor()} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
              {/* Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
          </div>

          {/* Financial Info */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                Valor Atual
              </p>
              <p className="text-lg font-bold text-foreground">
                R$ {goal.current_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Meta Total
              </p>
              <p className="text-lg font-bold text-foreground">
                R$ {goal.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Remaining & Date */}
          <div className="flex justify-between items-center pt-2 border-t border-border/50">
            <div>
              <p className="text-xs text-muted-foreground">Faltam</p>
              <p className="text-sm font-semibold text-foreground">
                R$ {remaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            {goal.target_date && daysUntilTarget !== null && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                  <Calendar className="w-3 h-3" />
                  {daysUntilTarget > 0 ? "Faltam" : "Prazo"}
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {daysUntilTarget > 0 ? `${daysUntilTarget} dias` : "Expirado"}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="flex-1"
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={onAddValue}
              className="flex-1"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={onViewDetails}
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
