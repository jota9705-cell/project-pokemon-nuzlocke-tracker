// ============================================
// DATABASE TYPES
// ============================================

export type GameMode = 'classic' | 'complete' | 'radical';
export type EncounterStatus = 'alive' | 'dead' | 'boxed';
export type AcquisitionMethod = 'wild' | 'gift' | 'trade';
export type BattleStatus = 'pending' | 'won' | 'lost';
export type BattleType = 'gym' | 'trainer' | 'wild' | 'elite_four' | 'champion';
export type BattleResult = 'won' | 'lost' | 'fled';

export interface NuzlockeRun {
  id: string;
  user_id: string;
  run_name: string;
  game_mode: GameMode;
  is_active: boolean;
  selected_rules: string[];
  total_captures: number;
  total_deaths: number;
  gyms_defeated: number;
  revival_tokens_available: number; // NEW: Tokens for revival mechanic
  created_at: string;
  completed_at?: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface Encounter {
  id: string;
  run_id: string;
  route_id: string;
  route_name: string;
  pokemon_name: string;
  pokemon_level: number;
  nickname?: string;
  status: EncounterStatus;
  acquisition_method: AcquisitionMethod;
  is_in_team: boolean;
  team_position?: number;
  is_shiny: boolean;
  nature?: string;
  ability?: string;
  notes?: string;
  caught_at: string;
  died_at?: string;
  was_revived: boolean; // NEW: Whether this Pokemon was revived
  revival_date?: string; // NEW: When it was revived
  updated_at: string;
}

export interface GymBattle {
  id: string;
  run_id: string;
  gym_number: number;
  leader_name: string;
  variant_used?: string;
  status: BattleStatus;
  casualties: number;
  attempts: number;
  notes?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface BattleLog {
  id: string;
  run_id: string;
  battle_type: BattleType;
  battle_id?: string;
  team_used?: any;
  casualties?: any;
  result: BattleResult;
  notes?: string;
  created_at: string;
}

// ============================================
// GAME DATA TYPES
// ============================================

export interface Pokemon {
  name: string;
  min_level: number;
  max_level: number;
}

export interface RouteEncounter {
  id: string;
  name: string;
  pokemon_complete: Pokemon[];
  pokemon_classic: Pokemon[];
}

export interface GymLeaderVariant {
  variant_name: string;
  team: {
    name: string;
    level: number;
  }[];
}

export interface GymLeader {
  gym_number: number;
  name: string;
  quote: string;
  variants: GymLeaderVariant[];
}

export interface NuzlockeRule {
  id: string;
  name: string;
  description: string;
  default: boolean;
  mandatory?: boolean;
}

export interface NuzlockeRules {
  basic_rules: NuzlockeRule[];
  optional_rules: NuzlockeRule[];
}

export interface MapData {
  id: string;
  name: string;
}

// ============================================
// FORM TYPES
// ============================================

export interface CreateRunFormData {
  run_name: string;
  game_mode: GameMode;
  selected_rules: string[];
}

export interface RegisterEncounterFormData {
  route_id: string;
  route_name: string;
  pokemon_name: string;
  pokemon_level: number;
  nickname?: string;
  status: 'alive' | 'dead';
  acquisition_method: AcquisitionMethod;
  is_shiny: boolean;
  nature?: string;
  ability?: string;
  notes?: string;
}

export interface RegisterGymBattleFormData {
  gym_number: number;
  leader_name: string;
  variant_used?: string;
  status: 'won' | 'lost';
  casualties: number;
  casualty_ids: string[];
  attempts: number;
  notes?: string;
}

// ============================================
// UI TYPES
// ============================================

export interface RunStats {
  total_captures: number;
  total_deaths: number;
  gyms_defeated: number;
  survival_rate: number;
  current_team_size: number;
  routes_explored: number;
}

export interface TeamMember extends Encounter {
  position: number;
}
