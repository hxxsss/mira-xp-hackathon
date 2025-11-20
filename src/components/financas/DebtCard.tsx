import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Pencil, Trash2, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DebtCardProps {
  debt: any;
  onEdit: (debt: any) => void;
  onDelete: () => void;
}

export const DebtCard = ({ debt, onEdit, onDelete }: DebtCardProps) => {
  const totalAmount = Number(debt.total_amount);
  const paidAmount = Number(debt.paid_amount);
  const remaining = totalAmount - paidAmount;
  const progress = (paidAmount / totalAmount) * 100;

  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold mb-1">{debt.name}</h3>
          {debt.creditor && (
            <p className="text-sm text-muted-foreground">{debt.creditor}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => onEdit(debt)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-semibold">{progress.toFixed(1)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-lg font-bold">R$ {totalAmount.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Restante</p>
            <p className="text-lg font-bold text-red-500">
              R$ {remaining.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Pago</p>
            <p className="text-lg font-bold text-green-500">
              R$ {paidAmount.toFixed(2)}
            </p>
          </div>
          {debt.interest_rate > 0 && (
            <div>
              <p className="text-sm text-muted-foreground">Juros</p>
              <p className="text-lg font-bold">
                {Number(debt.interest_rate).toFixed(1)}%
              </p>
            </div>
          )}
        </div>

        {debt.due_date && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
            <Calendar className="h-4 w-4" />
            <span>
              Vencimento:{" "}
              {format(new Date(debt.due_date), "dd 'de' MMMM 'de' yyyy", {
                locale: ptBR,
              })}
            </span>
          </div>
        )}

        {debt.notes && (
          <p className="text-sm text-muted-foreground pt-2 border-t">
            {debt.notes}
          </p>
        )}
      </div>
    </Card>
  );
};
