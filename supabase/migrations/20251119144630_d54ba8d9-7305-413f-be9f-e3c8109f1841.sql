-- Tabela para códigos de recuperação de senha
CREATE TABLE public.password_reset_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false
);

-- Índice para buscar códigos rapidamente
CREATE INDEX idx_password_reset_codes_email ON password_reset_codes(user_email);
CREATE INDEX idx_password_reset_codes_code ON password_reset_codes(code);

-- RLS para password_reset_codes (apenas edge functions podem acessar)
ALTER TABLE public.password_reset_codes ENABLE ROW LEVEL SECURITY;

-- Tabela para sessões ativas
CREATE TABLE public.active_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_token_hash TEXT NOT NULL,
  device_info TEXT,
  ip_address TEXT,
  user_agent TEXT,
  last_activity TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  revoked BOOLEAN DEFAULT false
);

-- Índice para buscar sessões de um usuário
CREATE INDEX idx_active_sessions_user_id ON active_sessions(user_id);
CREATE INDEX idx_active_sessions_token ON active_sessions(session_token_hash);

-- RLS para active_sessions
ALTER TABLE public.active_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions"
  ON public.active_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON public.active_sessions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
  ON public.active_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Adicionar colunas úteis na tabela profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS monthly_income NUMERIC;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS has_completed_tutorial BOOLEAN DEFAULT false;