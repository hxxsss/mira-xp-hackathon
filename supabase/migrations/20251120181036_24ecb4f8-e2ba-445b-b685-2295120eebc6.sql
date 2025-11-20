-- Allow authenticated users to view public ranking data from all profiles
CREATE POLICY "Anyone can view public ranking data"
ON profiles FOR SELECT
TO authenticated
USING (true);