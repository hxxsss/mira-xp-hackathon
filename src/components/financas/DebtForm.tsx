import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface DebtFormProps {
  debt?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export const DebtForm = ({ debt, onClose, onSuccess }: DebtFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    total_amount: "",
    paid_amount: "",
    interest_rate: "",
    due_date: "",
    creditor: "",
    notes: "",
  });

  useEffect(() => {
    if (debt) {
      setFormData({
        name: debt.name || "",
        total_amount: debt.total_amount?.toString() || "",
        paid_amount: debt.paid_amount?.toString() || "",
        interest_rate: debt.interest_rate?.toString() || "",
        due_date: debt.due_date || "",
        creditor: debt.creditor || "",
        notes: debt.notes || "",
      });
    }
  }, [debt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const data = {
        name: formData.name,
        total_amount: parseFloat(formData.total_amount),
        paid_amount: parseFloat(formData.paid_amount || "0"),
        interest_rate: formData.interest_rate ? parseFloat(formData.interest_rate) : 0,
        due_date: formData.due_date || null,
        creditor: formData.creditor || null,
        notes: formData.notes || null,
        user_id: user.id,
      };

      if (debt) {
        const { error } = await supabase
          .from("debts")
          .update(data)
          .eq("id", debt.id);
        if (error) throw error;
        toast.success("Dívida atualizada com sucesso!");
      } else {
        const { error } = await supabase.from("debts").insert([data]);
        if (error) throw error;
        toast.success("Dívida adicionada com sucesso!");
      }

      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar dívida");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {debt ? "Editar Dívida" : "Nova Dívida"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome da Dívida</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Ex: Cartão de Crédito, Empréstimo..."
              required
            />
          </div>

          <div>
            <Label htmlFor="creditor">Credor (opcional)</Label>
            <Input
              id="creditor"
              value={formData.creditor}
              onChange={(e) =>
                setFormData({ ...formData, creditor: e.target.value })
              }
              placeholder="Ex: Banco XYZ, Loja ABC..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="total_amount">Valor Total (R$)</Label>
              <Input
                id="total_amount"
                type="number"
                step="0.01"
                value={formData.total_amount}
                onChange={(e) =>
                  setFormData({ ...formData, total_amount: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="paid_amount">Valor Pago (R$)</Label>
              <Input
                id="paid_amount"
                type="number"
                step="0.01"
                value={formData.paid_amount}
                onChange={(e) =>
                  setFormData({ ...formData, paid_amount: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="interest_rate">Taxa de Juros (%)</Label>
              <Input
                id="interest_rate"
                type="number"
                step="0.01"
                value={formData.interest_rate}
                onChange={(e) =>
                  setFormData({ ...formData, interest_rate: e.target.value })
                }
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="due_date">Data de Vencimento</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) =>
                  setFormData({ ...formData, due_date: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Informações adicionais sobre esta dívida..."
            />
          </div>

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
