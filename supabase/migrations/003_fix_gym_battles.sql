-- ============================================
-- FIX: Permitir múltiples líderes por gimnasio
-- ============================================

-- Eliminar el constraint único actual
ALTER TABLE gym_battles DROP CONSTRAINT IF EXISTS gym_battles_run_id_gym_number_key;

-- Agregar nuevo constraint que permite múltiples líderes por gimnasio
ALTER TABLE gym_battles ADD CONSTRAINT gym_battles_unique_leader
  UNIQUE(run_id, gym_number, leader_name);

-- ============================================
-- FIX: Agregar trigger para INSERT en gym_battles
-- ============================================

CREATE TRIGGER update_gyms_on_battle_insert AFTER INSERT ON gym_battles
  FOR EACH ROW EXECUTE FUNCTION update_gyms_defeated();

-- Ya existe: update_gyms_on_battle_update AFTER UPDATE
