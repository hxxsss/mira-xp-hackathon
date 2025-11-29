-- Ajustar política UPDATE de pvp_matches para permitir membros de grupos atualizarem quando necessário
DROP POLICY IF EXISTS "Users can join matches as opponent" ON public.pvp_matches;

CREATE POLICY "Users can join matches as opponent"
ON public.pvp_matches
FOR UPDATE
USING (
  -- Oponente pode entrar (opponent_user_id NULL ou é o próprio)
  (opponent_user_id IS NULL) 
  OR (auth.uid() = opponent_user_id) 
  OR (auth.uid() = host_user_id)
  -- Membros de grupos podem atualizar status da partida (para marcar como completed)
  OR EXISTS (
    SELECT 1
    FROM public.pvp_groups g
    JOIN public.pvp_group_members gm ON gm.group_id = g.id
    WHERE g.match_id = public.pvp_matches.id
      AND gm.user_id = auth.uid()
  )
)
WITH CHECK (
  (auth.uid() = opponent_user_id) 
  OR (auth.uid() = host_user_id)
  -- Membros de grupos podem atualizar
  OR EXISTS (
    SELECT 1
    FROM public.pvp_groups g
    JOIN public.pvp_group_members gm ON gm.group_id = g.id
    WHERE g.match_id = public.pvp_matches.id
      AND gm.user_id = auth.uid()
  )
);