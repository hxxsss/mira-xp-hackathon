-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can view members of their groups" ON public.pvp_group_members;

-- Create a more permissive policy that allows viewing all members in waiting matches
CREATE POLICY "Users can view members in waiting matches" 
ON public.pvp_group_members 
FOR SELECT 
USING (
  (user_id = auth.uid()) 
  OR 
  (EXISTS (
    SELECT 1 
    FROM pvp_groups g
    JOIN pvp_matches m ON m.id = g.match_id
    WHERE g.id = pvp_group_members.group_id 
    AND m.status = 'waiting'
  ))
  OR
  (EXISTS (
    SELECT 1 
    FROM pvp_groups g
    JOIN pvp_matches m ON m.id = g.match_id
    WHERE g.id = pvp_group_members.group_id 
    AND (m.host_user_id = auth.uid() OR m.opponent_user_id = auth.uid())
  ))
);