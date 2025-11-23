-- Fix infinite recursion in RLS policies for pvp_groups and pvp_group_members

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Users can view groups in their matches" ON public.pvp_groups;
DROP POLICY IF EXISTS "Users can view members of their groups" ON public.pvp_group_members;

-- Create simplified policy for pvp_groups without recursion
CREATE POLICY "Users can view groups in their matches"
ON public.pvp_groups FOR SELECT
USING (
  -- Users can see groups if they are the leader
  leader_user_id = auth.uid()
  
  -- OR if the match is in waiting status (public to join)
  OR EXISTS (
    SELECT 1 FROM pvp_matches
    WHERE pvp_matches.id = pvp_groups.match_id
    AND pvp_matches.status = 'waiting'
  )
  
  -- OR if they are host or opponent of the match
  OR EXISTS (
    SELECT 1 FROM pvp_matches
    WHERE pvp_matches.id = pvp_groups.match_id
    AND (pvp_matches.host_user_id = auth.uid() OR pvp_matches.opponent_user_id = auth.uid())
  )
);

-- Create simplified policy for pvp_group_members without recursion
CREATE POLICY "Users can view members of their groups"
ON public.pvp_group_members FOR SELECT
USING (
  -- Users can see members if they are a member themselves
  user_id = auth.uid()
  
  -- OR if they are the leader of the group (direct check, no recursion)
  OR EXISTS (
    SELECT 1 FROM pvp_groups
    WHERE pvp_groups.id = pvp_group_members.group_id
    AND pvp_groups.leader_user_id = auth.uid()
  )
  
  -- OR if they are in the same match (via match_id)
  OR EXISTS (
    SELECT 1 FROM pvp_groups g
    JOIN pvp_matches m ON m.id = g.match_id
    WHERE g.id = pvp_group_members.group_id
    AND (m.host_user_id = auth.uid() OR m.opponent_user_id = auth.uid())
  )
);