-- Corrigir warnings de segurança: adicionar search_path às funções

-- Função 1: generate_match_code
CREATE OR REPLACE FUNCTION public.generate_match_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$function$;

-- Função 2: calculate_speed_points
CREATE OR REPLACE FUNCTION public.calculate_speed_points(is_correct boolean, time_seconds numeric)
RETURNS integer
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $function$
BEGIN
  IF NOT is_correct THEN
    RETURN 0;
  END IF;
  
  RETURN 100 + FLOOR(100 * (1 - (time_seconds / 30)));
END;
$function$;