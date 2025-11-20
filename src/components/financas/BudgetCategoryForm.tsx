import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface BudgetCategoryFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const PRESET_CATEGORIES = [
  { name: "Alimentação", icon: "🍔", color: "#10b981" },
  { name: "Transporte", icon: "🚗", color: "#3b82f6" },
  { name: "Moradia", icon: "🏠", color: "#8b5cf6" },
  { name: "Lazer", icon: "🎮", color: "#ec4899" },
  { name: "Saúde", icon: "💊", color: "#ef4444" },
  { name: "Educação", icon: "📚", color: "#f59e0b" },
  { name: "Compras", icon: "🛍️", color: "#06b6d4" },
  { name: "Outros", icon: "💰", color: "#6366f1" },
];

export const BudgetCategoryForm = ({
  onClose,
  onSuccess,
}: BudgetCategoryFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    monthly_limit: "",
    color: "#8B5CF6",
    icon: "💰",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const data = {
        name: formData.name,
        monthly_limit: parseFloat(formData.monthly_limit),
        color: formData.color,
        icon: formData.icon,
        user_id: user.id,
      };

      const { error } = await supabase.from("budget_categories").insert([data]);
      if (error) throw error;

      toast.success("Categoria adicionada com sucesso!");
      onSuccess();
    } catch (error: any) {
      if (error.code === "23505") {
        toast.error("Você já possui uma categoria com este nome");
      } else {
        toast.error(error.message || "Erro ao salvar categoria");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Categoria de Orçamento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Categorias Pré-definidas</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {PRESET_CATEGORIES.map((preset) => (
                <Button
                  key={preset.name}
                  type="button"
                  variant="outline"
                  className="h-auto flex-col gap-1 p-2"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      name: preset.name,
                      icon: preset.icon,
                      color: preset.color,
                    })
                  }
                >
                  <span className="text-2xl">{preset.icon}</span>
                  <span className="text-xs">{preset.name}</span>
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="name">Nome da Categoria</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Ex: Alimentação, Transporte..."
              required
            />
          </div>

          <div>
            <Label htmlFor="monthly_limit">Limite Mensal (R$)</Label>
            <Input
              id="monthly_limit"
              type="number"
              step="0.01"
              value={formData.monthly_limit}
              onChange={(e) =>
                setFormData({ ...formData, monthly_limit: e.target.value })
              }
              placeholder="0.00"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="icon">Emoji</Label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) =>
                  setFormData({ ...formData, icon: e.target.value })
                }
                placeholder="💰"
                maxLength={2}
              />
            </div>

            <div>
              <Label htmlFor="color">Cor</Label>
              <Input
                id="color"
                type="color"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
              />
            </div>
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
