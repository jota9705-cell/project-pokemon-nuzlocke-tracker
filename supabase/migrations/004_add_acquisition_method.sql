-- ============================================
-- ADD: Acquisition method for encounters
-- ============================================

-- Agregar tipo de adquisición
ALTER TABLE encounters ADD COLUMN acquisition_method TEXT NOT NULL DEFAULT 'wild'
  CHECK (acquisition_method IN ('wild', 'gift', 'trade'));

-- ============================================
-- UPDATE: Trigger para contar solo capturas wild
-- ============================================

-- Reemplazar la función para contar solo capturas salvajes
CREATE OR REPLACE FUNCTION update_run_statistics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update total captures (solo wild encounters)
  UPDATE nuzlocke_runs
  SET total_captures = (
    SELECT COUNT(*) FROM encounters
    WHERE run_id = NEW.run_id AND acquisition_method = 'wild'
  )
  WHERE id = NEW.run_id;

  -- Update total deaths (todos los Pokemon muertos)
  UPDATE nuzlocke_runs
  SET total_deaths = (
    SELECT COUNT(*) FROM encounters
    WHERE run_id = NEW.run_id AND status = 'dead'
  )
  WHERE id = NEW.run_id;

  RETURN NEW;
END;
$$ language 'plpgsql';

-- Los triggers ya existen, solo actualizamos la función
