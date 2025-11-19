-- Policy para password_reset_codes: apenas service role pode acessar
-- Usuários normais não podem fazer nada nesta tabela
CREATE POLICY "Service role only for password_reset_codes"
  ON public.password_reset_codes
  FOR ALL
  USING (false)
  WITH CHECK (false);