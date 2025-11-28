-- Allow users to delete their own group membership (leave team)
CREATE POLICY "Users can leave teams" 
ON public.pvp_group_members 
FOR DELETE 
USING (auth.uid() = user_id);