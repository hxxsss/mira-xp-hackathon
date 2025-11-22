import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface AddValueDialogProps {
  goal: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const AddValueDialog = ({ goal, open, onOpenChange, onSuccess }: AddValueDialogProps) => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) {
      toast.error("Digite um valor válido");
      return;
    }

    try {
      setLoading(true);
      const newAmount = goal.current_amount + value;

      const { error } = await supabase
        .from("goals")
        .update({ current_amount: newAmount })
        .eq("id", goal.id);

      if (error) throw error;

      const newProgress = Math.min((newAmount / goal.total_amount) * 100, 100);
      
      // Mensagem motivacional baseada no progresso
      let message = "Valor adicionado! 💰";
      if (newProgress >= 100) {
        message = "🎉 Parabéns! Você alcançou sua meta! 🎉";
      } else if (newProgress >= 80) {
        message = "🏆 Incrível! Você está quase lá!";
      } else if (newProgress >= 60) {
        message = "🚀 Excelente! Continue assim!";
      } else if (newProgress >= 40) {
        message = "💪 Ótimo progresso! Você consegue!";
      }

      toast.success(message);
      onSuccess();
      onOpenChange(false);
      setAmount("");
    } catch (error: any) {
      toast.error("Erro ao adicionar valor: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const currentProgress = goal ? (goal.current_amount / goal.total_amount) * 100 : 0;
  const previewAmount = parseFloat(amount) || 0;
  const newTotal = goal ? goal.current_amount + previewAmount : 0;
  const newProgress = goal ? Math.min((newTotal / goal.total_amount) * 100, 100) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] glass-card border-2 border-white/30 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <div className="relative">
              <div className="absolute inset-0 bg-primary rounded-full blur-lg opacity-50 animate-pulse" />
              <Plus className="w-6 h-6 text-primary relative drop-shadow-[0_0_10px_rgba(164,69,178,0.8)]" />
            </div>
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Adicionar Valor à Meta
            </span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Goal Info */}
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Meta:</span>
              <span className="font-semibold">{goal?.title}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Valor Atual:</span>
              <span className="font-bold text-primary">
                R$ {goal?.current_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Progresso:</span>
              <span className="font-bold">{currentProgress.toFixed(1)}%</span>
            </div>
          </div>

          {/* Input Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Quanto você quer adicionar?</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-10 text-lg"
                autoFocus
              />
            </div>
          </div>

          {/* Preview */}
          {previewAmount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-accent/10 to-primary/10 rounded-lg p-4 space-y-3"
            >
              <h3 className="font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Após adicionar R$ {previewAmount.toFixed(2)}:
              </h3>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Novo Total:</span>
                  <span className="font-bold text-accent">
                    R$ {newTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-accent"
                    initial={{ width: `${currentProgress}%` }}
                    animate={{ width: `${newProgress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Novo Progresso:</span>
                  <span className="font-bold text-primary">{newProgress.toFixed(1)}%</span>
                </div>

                {newProgress >= 100 && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center py-2"
                  >
                    <span className="text-2xl">🎉 Meta Alcançada! 🎉</span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !amount || parseFloat(amount) <= 0}
              className="flex-1"
            >
              {loading ? "Adicionando..." : "Adicionar Valor"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
