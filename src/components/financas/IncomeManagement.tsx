import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DollarSign, TrendingUp, Edit2, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface IncomeManagementProps {
  userId: string;
}

export const IncomeManagement = ({ userId }: IncomeManagementProps) => {
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [monthlyIncome, setMonthlyIncome] = useState<number | null>(null);
  const [customSavingsGoal, setCustomSavingsGoal] = useState<number | null>(null);
  const [tempIncome, setTempIncome] = useState("");
  const [tempSavings, setTempSavings] = useState("");

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("monthly_income, monthly_savings_goal")
        .eq("id", userId)
        .single();

      if (error) throw error;

      setMonthlyIncome(data.monthly_income);
      setCustomSavingsGoal(data.monthly_savings_goal);
      setTempIncome(data.monthly_income?.toString() || "");
      setTempSavings(data.monthly_savings_goal?.toString() || "");
    } catch (error: any) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const suggestedSavings = monthlyIncome ? monthlyIncome * 0.20 : 0;
  const effectiveSavings = customSavingsGoal || suggestedSavings;

  const handleSave = async () => {
    try {
      const newIncome = parseFloat(tempIncome) || null;
      const newSavings = parseFloat(tempSavings) || null;

      // Se o usuário não definiu economia customizada, calcular 20%
      const calculatedSavings = newIncome && !newSavings ? newIncome * 0.20 : newSavings;

      const { error } = await supabase
        .from("profiles")
        .update({
          monthly_income: newIncome,
          monthly_savings_goal: calculatedSavings,
        })
        .eq("id", userId);

      if (error) throw error;

      setMonthlyIncome(newIncome);
      setCustomSavingsGoal(calculatedSavings);
      setEditing(false);
      toast.success("Dados atualizados com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao atualizar dados");
      console.error(error);
    }
  };

  const handleCancel = () => {
    setTempIncome(monthlyIncome?.toString() || "");
    setTempSavings(customSavingsGoal?.toString() || "");
    setEditing(false);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Gestão de Renda e Economia
        </CardTitle>
        <CardDescription>
          Baseado na metodologia 50/30/20 de finanças pessoais
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {editing ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="income">Renda Mensal (R$)</Label>
              <Input
                id="income"
                type="number"
                step="0.01"
                value={tempIncome}
                onChange={(e) => setTempIncome(e.target.value)}
                placeholder="Ex: 2000.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="savings">Meta de Economia Mensal (R$)</Label>
              <Input
                id="savings"
                type="number"
                step="0.01"
                value={tempSavings}
                onChange={(e) => setTempSavings(e.target.value)}
                placeholder={`Sugerido: ${(parseFloat(tempIncome) * 0.20 || 0).toFixed(2)}`}
              />
              <p className="text-xs text-muted-foreground">
                💡 Sugestão automática: 20% da sua renda ({(parseFloat(tempIncome) * 0.20 || 0).toFixed(2)})
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1">
                <Check className="h-4 w-4 mr-2" />
                Salvar
              </Button>
              <Button onClick={handleCancel} variant="outline" className="flex-1">
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Renda Mensal</p>
                <p className="text-2xl font-bold text-foreground">
                  {monthlyIncome ? `R$ ${monthlyIncome.toFixed(2)}` : "Não definida"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Meta de Economia</p>
                <p className="text-2xl font-bold text-primary">
                  R$ {effectiveSavings.toFixed(2)}
                </p>
              </div>
            </div>

            {monthlyIncome && (
              <div className="bg-white/50 rounded-lg p-3 space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="font-medium">Regra 50/30/20</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Essenciais (50%)</p>
                    <p className="font-semibold">R$ {(monthlyIncome * 0.50).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Desejos (30%)</p>
                    <p className="font-semibold">R$ {(monthlyIncome * 0.30).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Economia (20%)</p>
                    <p className="font-semibold text-primary">R$ {suggestedSavings.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}

            <Button onClick={() => setEditing(true)} variant="outline" className="w-full">
              <Edit2 className="h-4 w-4 mr-2" />
              Editar Valores
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};