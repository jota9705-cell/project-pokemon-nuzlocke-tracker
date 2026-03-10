-- ============================================
-- SOFT DELETE FOR RUNS
-- ============================================

-- Agregar columna deleted_at
ALTER TABLE nuzlocke_runs ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Crear índice para búsquedas de runs activos
CREATE INDEX idx_nuzlocke_runs_not_deleted ON nuzlocke_runs(user_id) WHERE deleted_at IS NULL;

-- Actualizar políticas RLS para excluir runs eliminados

-- Reemplazar política de SELECT
DROP POLICY IF EXISTS "Users can view own runs" ON nuzlocke_runs;
CREATE POLICY "Users can view own runs"
  ON nuzlocke_runs FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);
