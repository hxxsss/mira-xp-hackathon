-- Ajustar política SELECT de pvp_matches para incluir participantes de batalhas em grupo
DROP POLICY IF EXISTS "Users can view their matches" ON public.pvp_matches;

CREATE POLICY "Users can view their matches"
ON public.pvp_matches
FOR SELECT
USING (
  -- Host ou oponente em partidas 1v1
  auth.uid() = host_user_id
  OR auth.uid() = opponent_user_id
  -- Qualquer usuário pode ver partidas ainda em espera (para entrar)
  OR status = 'waiting'::text
  -- Participantes de batalhas em grupo (via pvp_groups / pvp_group_members)
  OR EXISTS (
    SELECT 1
    FROM public.pvp_groups g
    JOIN public.pvp_group_members gm ON gm.group_id = g.id
    WHERE g.match_id = public.pvp_matches.id
      AND gm.user_id = auth.uid()
  )
);