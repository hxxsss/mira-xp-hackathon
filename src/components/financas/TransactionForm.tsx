import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface TransactionFormProps {
  transaction?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export const TransactionForm = ({
  transaction,
  onClose,
  onSuccess,
}: TransactionFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "expense",
    amount: "",
    description: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
    is_recurring: false,
    is_impulse: false,
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type || "expense",
        amount: transaction.amount?.toString() || "",
        description: transaction.description || "",
        category: transaction.category || "",
        date: transaction.date || new Date().toISOString().split("T")[0],
        is_recurring: transaction.is_recurring || false,
        is_impulse: transaction.is_impulse || false,
      });
    }
  }, [transaction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const data = {
        ...formData,
        amount: parseFloat(formData.amount),
        user_id: user.id,
      };

      if (transaction) {
        const { error } = await supabase
          .from("transactions")
          .update(data)
          .eq("id", transaction.id);
        if (error) throw error;
        toast.success("Transação atualizada com sucesso!");
      } else {
        const { error } = await supabase.from("transactions").insert([data]);
        if (error) throw error;
        toast.success("Transação adicionada com sucesso!");
      }

      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar transação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {transaction ? "Editar Transação" : "Nova Transação"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Tipo</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Button
                type="button"
                variant={formData.type === "income" ? "default" : "outline"}
                onClick={() => setFormData({ ...formData, type: "income" })}
              >
                Receita
              </Button>
              <Button
                type="button"
                variant={formData.type === "expense" ? "default" : "outline"}
                onClick={() => setFormData({ ...formData, type: "expense" })}
              >
                Despesa
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="amount">Valor (R$)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Ex: Salário, Mercado, Conta de luz..."
            />
          </div>

          <div>
            <Label htmlFor="category">Categoria</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              placeholder="Ex: Alimentação, Transporte, Lazer..."
            />
          </div>

          <div>
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="is_recurring">Recorrente</Label>
            <Switch
              id="is_recurring"
              checked={formData.is_recurring}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_recurring: checked })
              }
            />
          </div>

          {formData.type === "expense" && (
            <div className="flex items-center justify-between">
              <Label htmlFor="is_impulse">Compra por impulso</Label>
              <Switch
                id="is_impulse"
                checked={formData.is_impulse}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_impulse: checked })
                }
              />
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
