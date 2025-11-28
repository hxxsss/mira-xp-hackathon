-- Adicionar coluna nickname na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS nickname text UNIQUE;

-- Criar índice para busca rápida de nickname
CREATE INDEX IF NOT EXISTS idx_profiles_nickname ON public.profiles(nickname);

-- Adicionar comentário descritivo
COMMENT ON COLUMN public.profiles.nickname IS 'Nickname único do usuário para exibição pública';