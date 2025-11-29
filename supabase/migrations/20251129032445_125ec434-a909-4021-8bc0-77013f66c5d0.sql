-- Fix infinite recursion by simplifying pvp_matches policies to avoid cross-table references

-- Update SELECT policy: allow hosts, opponents, waiting matches and all group matches
DROP POLICY IF EXISTS "Users can view their matches" ON public.pvp_matches;

CREATE POLICY "Users can view their matches"
ON public.pvp_matches
FOR SELECT
USING (
  auth.uid() = host_user_id
  OR auth.uid() = opponent_user_id
  OR status = 'waiting'::text
  OR match_mode = 'group'::text
);

-- Update UPDATE policy: allow users to join as opponent and hosts/opponents to update
DROP POLICY IF EXISTS "Users can join matches as opponent" ON public.pvp_matches;

CREATE POLICY "Users can join matches as opponent"
ON public.pvp_matches
FOR UPDATE
USING (
  -- Anyone can attempt to join an open 1v1 match as opponent
  opponent_user_id IS NULL
  OR auth.uid() = opponent_user_id
  OR auth.uid() = host_user_id
)
WITH CHECK (
  -- After update, only host or opponent can own the row
  auth.uid() = opponent_user_id
  OR auth.uid() = host_user_id
);
