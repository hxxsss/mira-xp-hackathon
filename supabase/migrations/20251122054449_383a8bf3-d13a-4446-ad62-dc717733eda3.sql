-- Add new columns to pvp_matches for group mode
ALTER TABLE pvp_matches 
ADD COLUMN IF NOT EXISTS match_mode text DEFAULT '1v1' CHECK (match_mode IN ('1v1', 'group')),
ADD COLUMN IF NOT EXISTS max_groups integer DEFAULT 5,
ADD COLUMN IF NOT EXISTS current_round integer DEFAULT 1;

-- Create pvp_groups table
CREATE TABLE IF NOT EXISTS public.pvp_groups (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  leader_user_id uuid NOT NULL,
  match_id uuid NOT NULL REFERENCES public.pvp_matches(id) ON DELETE CASCADE,
  invite_code text NOT NULL UNIQUE,
  ready_to_start boolean NOT NULL DEFAULT false,
  total_score integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create pvp_group_members table
CREATE TABLE IF NOT EXISTS public.pvp_group_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid NOT NULL REFERENCES public.pvp_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  has_played boolean NOT NULL DEFAULT false,
  score integer NOT NULL DEFAULT 0,
  UNIQUE(group_id, user_id)
);

-- Enable RLS on new tables
ALTER TABLE public.pvp_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pvp_group_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pvp_groups
CREATE POLICY "Users can view groups in their matches"
ON public.pvp_groups FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM pvp_matches
    WHERE pvp_matches.id = pvp_groups.match_id
    AND (pvp_matches.host_user_id = auth.uid() OR pvp_matches.opponent_user_id = auth.uid())
  )
  OR EXISTS (
    SELECT 1 FROM pvp_group_members
    WHERE pvp_group_members.group_id = pvp_groups.id
    AND pvp_group_members.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM pvp_matches
    WHERE pvp_matches.id = pvp_groups.match_id
    AND pvp_matches.status = 'waiting'
  )
);

CREATE POLICY "Users can create groups"
ON public.pvp_groups FOR INSERT
WITH CHECK (auth.uid() = leader_user_id);

CREATE POLICY "Leaders can update their groups"
ON public.pvp_groups FOR UPDATE
USING (auth.uid() = leader_user_id);

-- RLS Policies for pvp_group_members
CREATE POLICY "Users can view members of their groups"
ON public.pvp_group_members FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM pvp_groups
    WHERE pvp_groups.id = pvp_group_members.group_id
    AND (
      pvp_groups.leader_user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM pvp_group_members AS pm
        WHERE pm.group_id = pvp_groups.id
        AND pm.user_id = auth.uid()
      )
    )
  )
);

CREATE POLICY "Users can join groups"
ON public.pvp_group_members FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Members can update their own records"
ON public.pvp_group_members FOR UPDATE
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pvp_groups_match_id ON pvp_groups(match_id);
CREATE INDEX IF NOT EXISTS idx_pvp_groups_invite_code ON pvp_groups(invite_code);
CREATE INDEX IF NOT EXISTS idx_pvp_group_members_group_id ON pvp_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_pvp_group_members_user_id ON pvp_group_members(user_id);

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.pvp_groups;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pvp_group_members;