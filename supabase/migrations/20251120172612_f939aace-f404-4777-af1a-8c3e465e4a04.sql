-- Adicionar colunas à tabela transactions
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS category text,
ADD COLUMN IF NOT EXISTS date date DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS is_recurring boolean DEFAULT false;

-- Atualizar RLS policies para transactions (adicionar UPDATE e DELETE)
DROP POLICY IF EXISTS "Users can update their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete their own transactions" ON public.transactions;

CREATE POLICY "Users can update their own transactions"
ON public.transactions
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
ON public.transactions
FOR DELETE
USING (auth.uid() = user_id);

-- Criar tabela de dívidas
CREATE TABLE IF NOT EXISTS public.debts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  total_amount numeric NOT NULL,
  paid_amount numeric NOT NULL DEFAULT 0,
  interest_rate numeric DEFAULT 0,
  due_date date,
  creditor text,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS para debts
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;

-- RLS policies para debts
CREATE POLICY "Users can view their own debts"
ON public.debts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own debts"
ON public.debts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own debts"
ON public.debts
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own debts"
ON public.debts
FOR DELETE
USING (auth.uid() = user_id);

-- Criar tabela de categorias de orçamento
CREATE TABLE IF NOT EXISTS public.budget_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  monthly_limit numeric NOT NULL,
  color text DEFAULT '#8B5CF6',
  icon text DEFAULT '💰',
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Enable RLS para budget_categories
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;

-- RLS policies para budget_categories
CREATE POLICY "Users can view their own budget categories"
ON public.budget_categories
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budget categories"
ON public.budget_categories
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budget categories"
ON public.budget_categories
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budget categories"
ON public.budget_categories
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger para updated_at em debts
CREATE OR REPLACE FUNCTION public.handle_debts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_debts_updated_at
BEFORE UPDATE ON public.debts
FOR EACH ROW
EXECUTE FUNCTION public.handle_debts_updated_at();