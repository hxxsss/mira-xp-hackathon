import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, CreditCard } from "lucide-react";
import { CircularIconBadge } from "@/components/ui/circular-icon-badge";

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
      gradient: balance >= 0 ? "from-green-500 via-emerald-500 to-teal-500" : "from-red-500 via-rose-500 to-pink-500",
      border: balance >= 0 ? "border-green-400" : "border-red-400",
      indicator: balance >= 0 ? "↑" : "↓",
      indicatorColor: balance >= 0 ? "bg-green-500" : "bg-red-500",
    },
    {
      title: "Receitas",
      value: `R$ ${totalIncome.toFixed(2)}`,
      icon: TrendingUp,
      gradient: "from-green-500 via-emerald-500 to-teal-500",
      border: "border-green-400",
      indicator: "↑",
      indicatorColor: "bg-green-500",
    },
    {
      title: "Despesas",
      value: `R$ ${totalExpenses.toFixed(2)}`,
      icon: TrendingDown,
      gradient: "from-red-500 via-rose-500 to-pink-500",
      border: "border-red-400",
      indicator: "↓",
      indicatorColor: "bg-red-500",
    },
    {
      title: "Total em Dívidas",
      value: `R$ ${totalDebts.toFixed(2)}`,
      icon: CreditCard,
      gradient: "from-orange-500 via-amber-500 to-yellow-500",
      border: "border-orange-400",
      indicator: totalDebts > 0 ? "!" : "✓",
      indicatorColor: totalDebts > 0 ? "bg-orange-500" : "bg-green-500",
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
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className={`p-6 rounded-2xl shadow-2xl border-2 ${card.border}`}>
            <div className="flex items-center justify-between">
              <CircularIconBadge
                icon={<Icon className="w-8 h-8" />}
                gradientColors={card.gradient}
                size="md"
                badge={{
                  content: card.indicator,
                  color: card.indicatorColor,
                }}
              />
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">{card.title}</p>
                <p className="text-2xl font-bold">{card.value}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
