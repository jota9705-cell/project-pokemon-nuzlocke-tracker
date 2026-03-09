-- ============================================
-- AUTO GRANT REVIVAL TOKENS
-- Otorgar 1 token por cada gimnasio derrotado
-- ============================================

CREATE OR REPLACE FUNCTION grant_revival_token()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo otorgar token si el gimnasio fue derrotado (won)
  IF NEW.status = 'won' THEN
    UPDATE nuzlocke_runs
    SET revival_tokens_available = revival_tokens_available + 1
    WHERE id = NEW.run_id;
  END IF;

  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para INSERT (nueva victoria)
CREATE TRIGGER grant_revival_token_on_gym_victory AFTER INSERT ON gym_battles
  FOR EACH ROW EXECUTE FUNCTION grant_revival_token();

-- Trigger para UPDATE (por si se cambia el status)
CREATE TRIGGER grant_revival_token_on_gym_update AFTER UPDATE ON gym_battles
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'won')
  EXECUTE FUNCTION grant_revival_token();
