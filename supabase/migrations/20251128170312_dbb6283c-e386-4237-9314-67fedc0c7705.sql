-- Remove a constraint antiga que limita xp_bet a valores fixos
ALTER TABLE public.pvp_matches DROP CONSTRAINT pvp_matches_xp_bet_check;

-- Adiciona nova constraint que permite valores de 10 a 500 (múltiplos de 10)
ALTER TABLE public.pvp_matches ADD CONSTRAINT pvp_matches_xp_bet_check CHECK (xp_bet >= 10 AND xp_bet <= 500);