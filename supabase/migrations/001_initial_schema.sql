-- ============================================
-- POKEMON AÑIL NUZLOCKE TRACKER - SCHEMA
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: nuzlocke_runs
-- ============================================
CREATE TABLE nuzlocke_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic info
  run_name TEXT NOT NULL,
  game_mode TEXT NOT NULL CHECK (game_mode IN ('classic', 'complete', 'radical')),
  is_active BOOLEAN DEFAULT true,

  -- Selected rules (stored as JSON array)
  selected_rules JSONB DEFAULT '[]'::jsonb,

  -- Statistics
  total_captures INTEGER DEFAULT 0,
  total_deaths INTEGER DEFAULT 0,
  gyms_defeated INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(user_id, run_name)
);

CREATE INDEX idx_runs_user_active ON nuzlocke_runs(user_id, is_active);
CREATE INDEX idx_runs_created ON nuzlocke_runs(created_at DESC);

-- ============================================
-- TABLE: encounters
-- ============================================
CREATE TABLE encounters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_id UUID NOT NULL REFERENCES nuzlocke_runs(id) ON DELETE CASCADE,

  -- Route info
  route_id TEXT NOT NULL,
  route_name TEXT NOT NULL,

  -- Pokemon info
  pokemon_name TEXT NOT NULL,
  pokemon_level INTEGER NOT NULL,
  nickname TEXT,

  -- Status
  status TEXT NOT NULL DEFAULT 'alive' CHECK (status IN ('alive', 'dead', 'boxed')),
  is_in_team BOOLEAN DEFAULT false,
  team_position INTEGER CHECK (team_position BETWEEN 1 AND 6),

  -- Additional details
  is_shiny BOOLEAN DEFAULT false,
  nature TEXT,
  ability TEXT,
  notes TEXT,

  -- Timestamps
  caught_at TIMESTAMPTZ DEFAULT now(),
  died_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Only 1 capture per route in a run (Nuzlocke rule)
  UNIQUE(run_id, route_id)
);

CREATE INDEX idx_encounters_run ON encounters(run_id);
CREATE INDEX idx_encounters_team ON encounters(run_id, is_in_team) WHERE is_in_team = true;
CREATE INDEX idx_encounters_status ON encounters(run_id, status);

-- ============================================
-- TABLE: gym_battles
-- ============================================
CREATE TABLE gym_battles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_id UUID NOT NULL REFERENCES nuzlocke_runs(id) ON DELETE CASCADE,

  -- Gym info
  gym_number INTEGER NOT NULL CHECK (gym_number BETWEEN 1 AND 16),
  leader_name TEXT NOT NULL,
  variant_used TEXT,

  -- Battle status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost')),

  -- Results
  casualties INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 0,
  notes TEXT,

  -- Timestamps
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(run_id, gym_number)
);

CREATE INDEX idx_gym_battles_run ON gym_battles(run_id);
CREATE INDEX idx_gym_battles_status ON gym_battles(run_id, status);

-- ============================================
-- TABLE: battle_logs
-- ============================================
CREATE TABLE battle_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_id UUID NOT NULL REFERENCES nuzlocke_runs(id) ON DELETE CASCADE,

  -- Battle type
  battle_type TEXT NOT NULL CHECK (battle_type IN ('gym', 'trainer', 'wild', 'elite_four', 'champion')),
  battle_id UUID,

  -- Participants
  team_used JSONB,
  casualties JSONB,

  -- Result
  result TEXT NOT NULL CHECK (result IN ('won', 'lost', 'fled')),

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_battle_logs_run ON battle_logs(run_id);
CREATE INDEX idx_battle_logs_type ON battle_logs(run_id, battle_type);

-- ============================================
-- TRIGGERS - Auto update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_nuzlocke_runs_updated_at BEFORE UPDATE ON nuzlocke_runs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_encounters_updated_at BEFORE UPDATE ON encounters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gym_battles_updated_at BEFORE UPDATE ON gym_battles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TRIGGERS - Auto update statistics
-- ============================================
CREATE OR REPLACE FUNCTION update_run_statistics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update total captures
  UPDATE nuzlocke_runs
  SET total_captures = (
    SELECT COUNT(*) FROM encounters WHERE run_id = NEW.run_id
  )
  WHERE id = NEW.run_id;

  -- Update total deaths
  UPDATE nuzlocke_runs
  SET total_deaths = (
    SELECT COUNT(*) FROM encounters WHERE run_id = NEW.run_id AND status = 'dead'
  )
  WHERE id = NEW.run_id;

  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_stats_on_encounter_insert AFTER INSERT ON encounters
  FOR EACH ROW EXECUTE FUNCTION update_run_statistics();

CREATE TRIGGER update_stats_on_encounter_update AFTER UPDATE ON encounters
  FOR EACH ROW EXECUTE FUNCTION update_run_statistics();

-- Trigger for gym battles
CREATE OR REPLACE FUNCTION update_gyms_defeated()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE nuzlocke_runs
  SET gyms_defeated = (
    SELECT COUNT(*) FROM gym_battles WHERE run_id = NEW.run_id AND status = 'won'
  )
  WHERE id = NEW.run_id;

  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_gyms_on_battle_update AFTER UPDATE ON gym_battles
  FOR EACH ROW EXECUTE FUNCTION update_gyms_defeated();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE nuzlocke_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE encounters ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_logs ENABLE ROW LEVEL SECURITY;

-- Policies for nuzlocke_runs
CREATE POLICY "Users can view own runs"
  ON nuzlocke_runs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own runs"
  ON nuzlocke_runs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own runs"
  ON nuzlocke_runs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own runs"
  ON nuzlocke_runs FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for encounters
CREATE POLICY "Users can view encounters from own runs"
  ON encounters FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM nuzlocke_runs
      WHERE nuzlocke_runs.id = encounters.run_id
      AND nuzlocke_runs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert encounters in own runs"
  ON encounters FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM nuzlocke_runs
      WHERE nuzlocke_runs.id = encounters.run_id
      AND nuzlocke_runs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update encounters in own runs"
  ON encounters FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM nuzlocke_runs
      WHERE nuzlocke_runs.id = encounters.run_id
      AND nuzlocke_runs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete encounters in own runs"
  ON encounters FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM nuzlocke_runs
      WHERE nuzlocke_runs.id = encounters.run_id
      AND nuzlocke_runs.user_id = auth.uid()
    )
  );

-- Policies for gym_battles
CREATE POLICY "Users can view gym battles from own runs"
  ON gym_battles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM nuzlocke_runs
      WHERE nuzlocke_runs.id = gym_battles.run_id
      AND nuzlocke_runs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert gym battles in own runs"
  ON gym_battles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM nuzlocke_runs
      WHERE nuzlocke_runs.id = gym_battles.run_id
      AND nuzlocke_runs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update gym battles in own runs"
  ON gym_battles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM nuzlocke_runs
      WHERE nuzlocke_runs.id = gym_battles.run_id
      AND nuzlocke_runs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete gym battles in own runs"
  ON gym_battles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM nuzlocke_runs
      WHERE nuzlocke_runs.id = gym_battles.run_id
      AND nuzlocke_runs.user_id = auth.uid()
    )
  );

-- Policies for battle_logs
CREATE POLICY "Users can view battle logs from own runs"
  ON battle_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM nuzlocke_runs
      WHERE nuzlocke_runs.id = battle_logs.run_id
      AND nuzlocke_runs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert battle logs in own runs"
  ON battle_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM nuzlocke_runs
      WHERE nuzlocke_runs.id = battle_logs.run_id
      AND nuzlocke_runs.user_id = auth.uid()
    )
  );
