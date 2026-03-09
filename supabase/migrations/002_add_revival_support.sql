-- ============================================
-- MIGRATION: Add Revival Support
-- ============================================
-- Adds support for the Pokemon Añil revival mechanic
-- where you get 1 revival token per gym defeated

-- Add revival_tokens_available to nuzlocke_runs
ALTER TABLE nuzlocke_runs
ADD COLUMN revival_tokens_available INTEGER DEFAULT 0;

COMMENT ON COLUMN nuzlocke_runs.revival_tokens_available IS 'Number of revival tokens available (1 per gym defeated)';

-- Add revival fields to encounters
ALTER TABLE encounters
ADD COLUMN was_revived BOOLEAN DEFAULT false,
ADD COLUMN revival_date TIMESTAMPTZ;

COMMENT ON COLUMN encounters.was_revived IS 'Whether this Pokemon was revived using a token';
COMMENT ON COLUMN encounters.revival_date IS 'When this Pokemon was revived';

-- Create index for tracking revivals
CREATE INDEX idx_encounters_revived ON encounters(run_id, was_revived) WHERE was_revived = true;
