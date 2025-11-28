-- Add foreign key from pvp_group_members.user_id to profiles.id
ALTER TABLE public.pvp_group_members
ADD CONSTRAINT pvp_group_members_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;