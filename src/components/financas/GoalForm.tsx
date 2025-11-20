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
import { CalendarIcon, TrendingUp, Target, Calendar as CalendarLucide } from "lucide-react";
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
  const progress = watchedValues.total_amount > 0 
    ? Math.min((watchedValues.current_amount / watchedValues.total_amount) * 100, 100)
    : 0;
  const remaining = watchedValues.total_amount - watchedValues.current_amount;
  const daysUntilTarget = watchedValues.target_date 
    ? differenceInDays(watchedValues.target_date, new Date())
    : null;
  const dailySuggestion = daysUntilTarget && daysUntilTarget > 0
    ? remaining / daysUntilTarget
    : null;

  const onSubmit = async (data: GoalFormData) => {
    try {
      setLoading(true);
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Target className="w-6 h-6 text-primary" />
            {isEditing ? "Editar Meta" : "Criar Nova Meta"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título da Meta</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Viagem dos Sonhos, Carro Novo..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="total_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Total</FormLabel>
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

            {/* Preview de Cálculos */}
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Previsão da Meta
              </h3>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progresso:</span>
                  <span className="font-bold text-primary">{progress.toFixed(1)}%</span>
                </div>
                
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Faltam:</span>
                  <span className="font-semibold">R$ {remaining.toFixed(2)}</span>
                </div>

                {dailySuggestion && daysUntilTarget && daysUntilTarget > 0 && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <CalendarLucide className="w-3 h-3" />
                        Dias até a meta:
                      </span>
                      <span className="font-semibold">{daysUntilTarget} dias</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sugestão diária:</span>
                      <span className="font-bold text-accent">R$ {dailySuggestion.toFixed(2)}/dia</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-3">
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
