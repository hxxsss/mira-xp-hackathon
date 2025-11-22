-- Create trigger to finalize PvP matches automatically
DROP TRIGGER IF EXISTS trigger_finalize_match ON pvp_match_answers;

CREATE TRIGGER trigger_finalize_match
  AFTER INSERT ON pvp_match_answers
  FOR EACH ROW
  EXECUTE FUNCTION check_and_finalize_match();