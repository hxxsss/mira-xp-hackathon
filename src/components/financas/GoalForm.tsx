import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Target } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const goalSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(100, "Título muito longo"),
  total_amount: z.coerce.number().min(1, "Valor deve ser maior que 0"),
  current_amount: z.coerce.number().min(0, "Valor não pode ser negativo"),
  target_date: z.date().optional(),
});

type GoalFormData = z.infer<typeof goalSchema>;

interface GoalFormProps {
  goal?: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const GoalForm = ({ goal, open, onOpenChange, onSuccess }: GoalFormProps) => {
  const [loading, setLoading] = useState(false);
  const isEditing = !!goal;

  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: goal?.title || "",
      total_amount: goal?.total_amount || 0,
      current_amount: goal?.current_amount || 0,
      target_date: goal?.target_date ? new Date(goal.target_date) : undefined,
    },
  });

  useEffect(() => {
    if (goal && open) {
      form.reset({
        title: goal.title,
        total_amount: goal.total_amount,
        current_amount: goal.current_amount,
        target_date: goal.target_date ? new Date(goal.target_date) : undefined,
      });
    } else if (!goal && open) {
      form.reset({
        title: "",
        total_amount: 0,
        current_amount: 0,
        target_date: undefined,
      });
    }
  }, [goal, open, form]);

  const watchedValues = form.watch();

  const onSubmit = async (data: GoalFormData) => {
    try {
      setLoading(true);
      
      // Detectar mudanças drásticas
      if (isEditing && goal) {
        const titleChanged = data.title.toLowerCase() !== goal.title.toLowerCase();
        const valueChangePercent = Math.abs(data.total_amount - goal.total_amount) / goal.total_amount * 100;
        
        if (titleChanged && valueChangePercent > 30) {
          const confirmed = window.confirm(
            `Você está mudando de "${goal.title}" para "${data.title}" com uma diferença de ${valueChangePercent.toFixed(0)}% no valor.\n\nTem certeza que deseja continuar?`
          );
          if (!confirmed) {
            setLoading(false);
            return;
          }
        }
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const goalData = {
        title: data.title,
        total_amount: data.total_amount,
        current_amount: data.current_amount,
        target_date: data.target_date ? data.target_date.toISOString() : null,
        user_id: user.id,
        is_active: true,
      };

      if (isEditing) {
        const { error } = await supabase
          .from("goals")
          .update(goalData)
          .eq("id", goal.id);

        if (error) throw error;
        toast.success("Meta atualizada com sucesso! 🎯");
      } else {
        // Desativar metas anteriores
        await supabase
          .from("goals")
          .update({ is_active: false })
          .eq("user_id", user.id);

        const { error } = await supabase
          .from("goals")
          .insert(goalData);

        if (error) throw error;
        toast.success("Meta criada com sucesso! 🚀");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Erro ao salvar meta: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2 text-xl">
            <Target className="w-5 h-5 text-primary" />
            {isEditing ? "Editar Meta" : "Criar Nova Meta"}
          </DialogTitle>
          {isEditing && (
            <p className="text-sm text-muted-foreground">
              💡 <strong>Mudou de ideia?</strong> Você pode escolher uma meta completamente diferente!
            </p>
          )}
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Qual é sua meta?</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Viagem dos Sonhos, Carro Novo..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="total_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quanto você precisa?</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="current_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Atual</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="target_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data Alvo (Opcional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: ptBR })
                          ) : (
                            <span>Escolha uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Botão "Começar Meta do Zero" */}
            {isEditing && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset({
                    title: "",
                    total_amount: 0,
                    current_amount: 0,
                    target_date: undefined,
                  });
                  toast.info("Formulário resetado! Agora você pode criar uma nova meta.");
                }}
                className="w-full"
              >
                🔄 Começar Meta do Zero
              </Button>
            )}

 {/* Preview "Antes vs Depois" */}
            {isEditing && goal && (
              <div className="bg-muted/50 rounded-lg p-2 space-y-0.5 border border-border">
                <h4 className="text-xs font-semibold text-foreground">📊 Comparação</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground block">Meta Atual</span>
                    <span className="font-semibold text-foreground text-sm">{goal.title}</span>
                    <span className="block text-xs text-muted-foreground">
                      R$ {goal.total_amount.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Nova Meta</span>
                    <span className="font-bold text-primary text-sm">{watchedValues.title || "..."}</span>
                    <span className="block text-xs text-primary">
                      R$ {Number(watchedValues.total_amount || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Salvando..." : isEditing ? "Atualizar Meta" : "Criar Meta"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
