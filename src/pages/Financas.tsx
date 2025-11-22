import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, CreditCard, Wallet, Target } from "lucide-react";
import { FinancialSummaryCards } from "@/components/financas/FinancialSummaryCards";
import { TransactionList } from "@/components/financas/TransactionList";
import { DebtCard } from "@/components/financas/DebtCard";
import { TransactionForm } from "@/components/financas/TransactionForm";
import { DebtForm } from "@/components/financas/DebtForm";
import { BudgetCategoryForm } from "@/components/financas/BudgetCategoryForm";
import { GoalCard } from "@/components/financas/GoalCard";
import { GoalForm } from "@/components/financas/GoalForm";
import { AddValueDialog } from "@/components/financas/AddValueDialog";
import { GoalDetailsModal } from "@/components/modules/GoalDetailsModal";
import { toast } from "sonner";

const Financas = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [debts, setDebts] = useState<any[]>([]);
  const [budgetCategories, setBudgetCategories] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showDebtForm, setShowDebtForm] = useState(false);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showAddValueDialog, setShowAddValueDialog] = useState(false);
  const [showGoalDetailsModal, setShowGoalDetailsModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [editingDebt, setEditingDebt] = useState<any>(null);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);

  useEffect(() => {
    checkAuth();
    fetchData();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [transactionsRes, debtsRes, categoriesRes, goalsRes] = await Promise.all([
        supabase.from("transactions").select("*").order("date", { ascending: false }),
        supabase.from("debts").select("*").order("due_date", { ascending: true }),
        supabase.from("budget_categories").select("*"),
        supabase.from("goals").select("*").eq("user_id", user.id).order("is_active", { ascending: false }),
      ]);

      if (transactionsRes.error) throw transactionsRes.error;
      if (debtsRes.error) throw debtsRes.error;
      if (categoriesRes.error) throw categoriesRes.error;
      if (goalsRes.error) throw goalsRes.error;

      setTransactions(transactionsRes.data || []);
      setDebts(debtsRes.data || []);
      setBudgetCategories(categoriesRes.data || []);
      setGoals(goalsRes.data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar dados financeiros");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) throw error;
      toast.success("Transação excluída com sucesso");
      fetchData();
    } catch (error: any) {
      toast.error("Erro ao excluir transação");
    }
  };

  const handleDeleteDebt = async (id: string) => {
    try {
      const { error } = await supabase.from("debts").delete().eq("id", id);
      if (error) throw error;
      toast.success("Dívida excluída com sucesso");
      fetchData();
    } catch (error: any) {
      toast.error("Erro ao excluir dívida");
    }
  };

  return (
    <div className="min-h-screen gradient-background geometric-bg p-4 md:p-8 relative overflow-hidden">
      {/* Neon lines animadas */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className={`neon-line ${i % 2 === 0 ? 'neon-line-cyan' : 'neon-line-pink'}`}
          style={{
            left: `${10 + i * 12}%`,
            width: '2px',
            height: '200px',
            animationDelay: `${i * 0.5}s`,
          }}
        />
      ))}
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="glass-card hover:bg-white/30 border border-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.3)]"
            >
              <ArrowLeft className="h-6 w-6 text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">Finanças</h1>
              <p className="text-white/90 drop-shadow-sm">Gerencie suas finanças de forma inteligente</p>
            </div>
          </div>
        </div>

        <FinancialSummaryCards
          transactions={transactions}
          debts={debts}
          loading={loading}
        />

        <Tabs defaultValue="transacoes" className="mt-8">
          <TabsList className="grid w-full grid-cols-4 glass-card p-1 border border-white/30 shadow-lg">
            <TabsTrigger value="transacoes">
              <Wallet className="h-4 w-4 mr-2" />
              Transações
            </TabsTrigger>
            <TabsTrigger value="dividas">
              <CreditCard className="h-4 w-4 mr-2" />
              Dívidas
            </TabsTrigger>
            <TabsTrigger value="metas">
              <Target className="h-4 w-4 mr-2" />
              Metas
            </TabsTrigger>
            <TabsTrigger value="orcamento">
              <TrendingUp className="h-4 w-4 mr-2" />
              Orçamento
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transacoes" className="mt-6">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Minhas Transações</h2>
                <Button onClick={() => setShowTransactionForm(true)}>
                  Adicionar Transação
                </Button>
              </div>
              <TransactionList
                transactions={transactions}
                onEdit={(transaction) => {
                  setEditingTransaction(transaction);
                  setShowTransactionForm(true);
                }}
                onDelete={handleDeleteTransaction}
                loading={loading}
              />
            </Card>
          </TabsContent>

          <TabsContent value="dividas" className="mt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Minhas Dívidas</h2>
                <Button onClick={() => setShowDebtForm(true)}>
                  Adicionar Dívida
                </Button>
              </div>
              {loading ? (
                <Card className="p-6">
                  <p className="text-center text-muted-foreground">Carregando...</p>
                </Card>
              ) : debts.length === 0 ? (
                <Card className="p-6">
                  <p className="text-center text-muted-foreground">Nenhuma dívida cadastrada</p>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {debts.map((debt) => (
                    <DebtCard
                      key={debt.id}
                      debt={debt}
                      onEdit={(debt) => {
                        setEditingDebt(debt);
                        setShowDebtForm(true);
                      }}
                      onDelete={() => handleDeleteDebt(debt.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="metas" className="mt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-semibold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">Minhas Metas</h2>
                  <p className="text-sm text-white/90 drop-shadow-sm">Planeje e alcance seus sonhos financeiros</p>
                </div>
                <Button 
                  onClick={() => {
                    setEditingGoal(null);
                    setShowGoalForm(true);
                  }}
                  className="bg-gradient-to-r from-primary via-accent to-secondary hover:shadow-[0_0_20px_rgba(164,69,178,0.6)] transition-all"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Criar Nova Meta
                </Button>
              </div>
              {loading ? (
                <div className="glass-card p-6 border border-white/30">
                  <p className="text-center text-white/80">Carregando...</p>
                </div>
              ) : goals.length === 0 ? (
                <div className="glass-card p-12 text-center border border-white/30 shadow-lg">
                  <motion.div
                    animate={{ 
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Target className="w-16 h-16 mx-auto mb-4 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
                  </motion.div>
                  <h3 className="text-lg font-semibold mb-2 text-white">Nenhuma meta criada ainda</h3>
                  <p className="text-white/80 mb-4">
                    Comece a planejar seus objetivos financeiros agora!
                  </p>
                  <Button 
                    onClick={() => {
                      setEditingGoal(null);
                      setShowGoalForm(true);
                    }}
                    className="bg-gradient-to-r from-primary via-accent to-secondary hover:shadow-[0_0_20px_rgba(164,69,178,0.6)] transition-all"
                  >
                    Criar Primeira Meta
                  </Button>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {goals.map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      onEdit={() => {
                        setEditingGoal(goal);
                        setShowGoalForm(true);
                      }}
                      onAddValue={() => {
                        setSelectedGoal(goal);
                        setShowAddValueDialog(true);
                      }}
                      onViewDetails={() => {
                        setSelectedGoal(goal);
                        setShowGoalDetailsModal(true);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="orcamento" className="mt-6">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Categorias de Orçamento</h2>
                <Button onClick={() => setShowBudgetForm(true)}>
                  Adicionar Categoria
                </Button>
              </div>
              {loading ? (
                <p className="text-center text-muted-foreground">Carregando...</p>
              ) : budgetCategories.length === 0 ? (
                <p className="text-center text-muted-foreground">Nenhuma categoria cadastrada</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {budgetCategories.map((category) => {
                    const spent = transactions
                      .filter((t) => t.type === "expense" && t.category === category.name)
                      .reduce((sum, t) => sum + Number(t.amount), 0);
                    const percentage = (spent / Number(category.monthly_limit)) * 100;

                    return (
                      <Card key={category.id} className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-3xl">{category.icon}</span>
                          <div className="flex-1">
                            <h3 className="font-semibold">{category.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              R$ {spent.toFixed(2)} / R$ {Number(category.monthly_limit).toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{
                              width: `${Math.min(percentage, 100)}%`,
                              backgroundColor: category.color,
                            }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {percentage.toFixed(0)}% utilizado
                        </p>
                      </Card>
                    );
                  })}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {showTransactionForm && (
        <TransactionForm
          transaction={editingTransaction}
          onClose={() => {
            setShowTransactionForm(false);
            setEditingTransaction(null);
          }}
          onSuccess={() => {
            fetchData();
            setShowTransactionForm(false);
            setEditingTransaction(null);
          }}
        />
      )}

      {showDebtForm && (
        <DebtForm
          debt={editingDebt}
          onClose={() => {
            setShowDebtForm(false);
            setEditingDebt(null);
          }}
          onSuccess={() => {
            fetchData();
            setShowDebtForm(false);
            setEditingDebt(null);
          }}
        />
      )}

      {showBudgetForm && (
        <BudgetCategoryForm
          onClose={() => setShowBudgetForm(false)}
          onSuccess={() => {
            fetchData();
            setShowBudgetForm(false);
          }}
        />
      )}

      {showGoalForm && (
        <GoalForm
          goal={editingGoal}
          open={showGoalForm}
          onOpenChange={(open) => {
            setShowGoalForm(open);
            if (!open) setEditingGoal(null);
          }}
          onSuccess={fetchData}
        />
      )}

      {showAddValueDialog && selectedGoal && (
        <AddValueDialog
          goal={selectedGoal}
          open={showAddValueDialog}
          onOpenChange={(open) => {
            setShowAddValueDialog(open);
            if (!open) setSelectedGoal(null);
          }}
          onSuccess={fetchData}
        />
      )}

      {showGoalDetailsModal && selectedGoal && (
        <GoalDetailsModal
          goal={selectedGoal}
          open={showGoalDetailsModal}
          onOpenChange={(open) => {
            setShowGoalDetailsModal(open);
            if (!open) setSelectedGoal(null);
          }}
          onEdit={() => {
            setShowGoalDetailsModal(false);
            setEditingGoal(selectedGoal);
            setShowGoalForm(true);
          }}
        />
      )}
    </div>
  );
};

export default Financas;
