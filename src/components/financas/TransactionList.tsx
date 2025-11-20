import { Button } from "@/components/ui/button";
import { Pencil, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TransactionListProps {
  transactions: any[];
  onEdit: (transaction: any) => void;
  onDelete: (id: string) => void;
  loading: boolean;
}

export const TransactionList = ({
  transactions,
  onEdit,
  onDelete,
  loading,
}: TransactionListProps) => {
  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Carregando...</div>;
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhuma transação cadastrada
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-center gap-4 flex-1">
            <div
              className={`p-2 rounded-full ${
                transaction.type === "income"
                  ? "bg-green-500/10"
                  : "bg-red-500/10"
              }`}
            >
              {transaction.type === "income" ? (
                <TrendingUp className="h-5 w-5 text-green-500" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-500" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold">
                  {transaction.description || "Sem descrição"}
                </p>
                {transaction.is_recurring && (
                  <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                    Recorrente
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {transaction.category && (
                  <span className="bg-muted px-2 py-0.5 rounded text-xs">
                    {transaction.category}
                  </span>
                )}
                <span>
                  {format(
                    new Date(transaction.date || transaction.created_at),
                    "dd MMM yyyy",
                    { locale: ptBR }
                  )}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p
                className={`text-lg font-bold ${
                  transaction.type === "income"
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {transaction.type === "income" ? "+" : "-"} R${" "}
                {Number(transaction.amount).toFixed(2)}
              </p>
            </div>
          </div>
          <div className="flex gap-2 ml-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(transaction)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(transaction.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
