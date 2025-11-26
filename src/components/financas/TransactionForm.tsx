import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const PREDEFINED_CATEGORIES = [
  { name: "Alimentação", icon: "🍽️" },
  { name: "Transporte", icon: "🚗" },
  { name: "Moradia", icon: "🏠" },
  { name: "Saúde", icon: "⚕️" },
  { name: "Educação", icon: "📚" },
  { name: "Lazer", icon: "🎮" },
  { name: "Vestuário", icon: "👔" },
  { name: "Outras", icon: "📝" },
];

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
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
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
      const category = transaction.category || "";
      const isPredefined = PREDEFINED_CATEGORIES.some(c => c.name === category);
      
      setFormData({
        type: transaction.type || "expense",
        amount: transaction.amount?.toString() || "",
        description: transaction.description || "",
        category: isPredefined ? category : "Outras",
        date: transaction.date || new Date().toISOString().split("T")[0],
        is_recurring: transaction.is_recurring || false,
        is_impulse: transaction.is_impulse || false,
      });
      
      if (!isPredefined && category) {
        setShowCustomCategory(true);
        setCustomCategory(category);
      }
    }
  }, [transaction]);

  const handleCategorySelect = (categoryName: string) => {
    if (categoryName === "Outras") {
      setShowCustomCategory(true);
      setFormData({ ...formData, category: categoryName });
    } else {
      setShowCustomCategory(false);
      setCustomCategory("");
      setFormData({ ...formData, category: categoryName });
    }
  };

  const handleAmountKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
      e.preventDefault();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error("Por favor, insira um valor válido");
      return;
    }

    const finalCategory = showCustomCategory && customCategory 
      ? customCategory 
      : formData.category;

    if (!finalCategory) {
      toast.error("Por favor, selecione uma categoria");
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const data = {
        ...formData,
        category: finalCategory,
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
              min="0"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              onKeyDown={handleAmountKeyDown}
              placeholder="0.00"
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
            <Label>Categoria</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {PREDEFINED_CATEGORIES.map((cat) => (
                <Button
                  key={cat.name}
                  type="button"
                  variant={formData.category === cat.name ? "default" : "outline"}
                  onClick={() => handleCategorySelect(cat.name)}
                  className="justify-start"
                >
                  <span className="mr-2">{cat.icon}</span>
                  {cat.name}
                </Button>
              ))}
            </div>
            {showCustomCategory && (
              <Input
                className="mt-2"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Digite a categoria personalizada..."
                required
              />
            )}
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
