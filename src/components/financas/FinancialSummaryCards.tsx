import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, CreditCard } from "lucide-react";

interface FinancialSummaryCardsProps {
  transactions: any[];
  debts: any[];
  loading: boolean;
}

export const FinancialSummaryCards = ({
  transactions,
  debts,
  loading,
}: FinancialSummaryCardsProps) => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyTransactions = transactions.filter((t) => {
    const date = new Date(t.date || t.created_at);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const totalIncome = monthlyTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = monthlyTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = totalIncome - totalExpenses;

  const totalDebts = debts.reduce(
    (sum, d) => sum + (Number(d.total_amount) - Number(d.paid_amount)),
    0
  );

  const cards = [
    {
      title: "Saldo do Mês",
      value: `R$ ${balance.toFixed(2)}`,
      icon: DollarSign,
      color: balance >= 0 ? "text-green-500" : "text-red-500",
      bgColor: balance >= 0 ? "bg-green-500/10" : "bg-red-500/10",
    },
    {
      title: "Receitas",
      value: `R$ ${totalIncome.toFixed(2)}`,
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Despesas",
      value: `R$ ${totalExpenses.toFixed(2)}`,
      icon: TrendingDown,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      title: "Total em Dívidas",
      value: `R$ ${totalDebts.toFixed(2)}`,
      icon: CreditCard,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ];

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-20 bg-muted rounded" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card key={index} className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{card.title}</p>
              <p className="text-2xl font-bold">{card.value}</p>
            </div>
            <div className={`p-3 rounded-full ${card.bgColor}`}>
              <card.icon className={`h-6 w-6 ${card.color}`} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
