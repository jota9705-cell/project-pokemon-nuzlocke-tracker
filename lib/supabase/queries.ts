// @ts-nocheck
import { createClient } from './client';
import { NuzlockeRun, CreateRunFormData, RegisterEncounterFormData } from '@/types';

// ============================================
// NUZLOCKE RUNS
// ============================================

export async function createRun(data: CreateRunFormData, userId: string) {
  const supabase = createClient();

  const { data: run, error } = await supabase
    .from('nuzlocke_runs')
    .insert({
      user_id: userId,
      run_name: data.run_name,
      game_mode: data.game_mode,
      selected_rules: data.selected_rules,
    })
    .select()
    .single();

  return { run, error };
}

export async function getUserRuns(userId: string) {
  const supabase = createClient();

  const { data: runs, error } = await supabase
    .from('nuzlocke_runs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return { runs, error };
}

export async function getRunById(runId: string) {
  const supabase = createClient();

  const { data: run, error } = await supabase
    .from('nuzlocke_runs')
    .select('*')
    .eq('id', runId)
    .single();

  return { run, error };
}

export async function updateRun(runId: string, updates: Partial<NuzlockeRun>) {
  const supabase = createClient();

  const { data: run, error } = await supabase
    .from('nuzlocke_runs')
    .update(updates)
    .eq('id', runId)
    .select()
    .single();

  return { run, error };
}

export async function deleteRun(runId: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from('nuzlocke_runs')
    .delete()
    .eq('id', runId);

  return { error };
}

// ============================================
// ENCOUNTERS
// ============================================

export async function createEncounter(data: RegisterEncounterFormData, runId: string) {
  const supabase = createClient();

  const { data: encounter, error } = await supabase
    .from('encounters')
    .insert({
      run_id: runId,
      route_id: data.route_id,
      route_name: data.route_name,
      pokemon_name: data.pokemon_name,
      pokemon_level: data.pokemon_level,
      nickname: data.nickname,
      status: data.status,
      acquisition_method: data.acquisition_method,
      is_shiny: data.is_shiny,
      nature: data.nature,
      ability: data.ability,
      notes: data.notes,
    })
    .select()
    .single();

  return { encounter, error };
}

export async function getRunEncounters(runId: string) {
  const supabase = createClient();

  const { data: encounters, error } = await supabase
    .from('encounters')
    .select('*')
    .eq('run_id', runId)
    .order('caught_at', { ascending: false });

  return { encounters, error };
}

export async function getEncounterByRoute(runId: string, routeId: string) {
  const supabase = createClient();

  // Solo verificar encuentros salvajes (wild) para la regla de "primer encuentro"
  const { data: encounter, error } = await supabase
    .from('encounters')
    .select('*')
    .eq('run_id', runId)
    .eq('route_id', routeId)
    .eq('acquisition_method', 'wild')
    .single();

  return { encounter, error };
}

export async function updateEncounter(encounterId: string, updates: any) {
  const supabase = createClient();

  const { data: encounter, error } = await supabase
    .from('encounters')
    .update(updates)
    .eq('id', encounterId)
    .select()
    .single();

  return { encounter, error };
}

export async function deleteEncounter(encounterId: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from('encounters')
    .delete()
    .eq('id', encounterId);

  return { error };
}

export async function getTeamPokemon(runId: string) {
  const supabase = createClient();

  const { data: team, error } = await supabase
    .from('encounters')
    .select('*')
    .eq('run_id', runId)
    .eq('is_in_team', true)
    .order('team_position', { ascending: true });

  return { team, error };
}

export async function getAvailablePokemon(runId: string) {
  const supabase = createClient();

  const { data: available, error } = await supabase
    .from('encounters')
    .select('*')
    .eq('run_id', runId)
    .in('status', ['alive', 'boxed'])
    .eq('is_in_team', false)
    .order('caught_at', { ascending: false });

  return { available, error };
}

// ============================================
// TEAM MANAGEMENT
// ============================================

export async function addToTeam(encounterId: string, position: number) {
  const supabase = createClient();

  const { data: encounter, error } = await supabase
    .from('encounters')
    .update({
      is_in_team: true,
      team_position: position,
      status: 'alive',
    })
    .eq('id', encounterId)
    .select()
    .single();

  return { encounter, error };
}

export async function removeFromTeam(encounterId: string) {
  const supabase = createClient();

  const { data: encounter, error } = await supabase
    .from('encounters')
    .update({
      is_in_team: false,
      team_position: null,
      status: 'boxed',
    })
    .eq('id', encounterId)
    .select()
    .single();

  return { encounter, error };
}

export async function updateTeamPosition(encounterId: string, position: number) {
  const supabase = createClient();

  const { data: encounter, error } = await supabase
    .from('encounters')
    .update({
      team_position: position,
    })
    .eq('id', encounterId)
    .select()
    .single();

  return { encounter, error };
}

export async function markAsDead(encounterId: string) {
  const supabase = createClient();

  const { data: encounter, error } = await supabase
    .from('encounters')
    .update({
      status: 'dead',
      is_in_team: false,
      team_position: null,
      died_at: new Date().toISOString(),
    })
    .eq('id', encounterId)
    .select()
    .single();

  return { encounter, error };
}

export async function markAsBoxed(encounterId: string) {
  const supabase = createClient();

  const { data: encounter, error } = await supabase
    .from('encounters')
    .update({
      status: 'boxed',
      is_in_team: false,
      team_position: null,
    })
    .eq('id', encounterId)
    .select()
    .single();

  return { encounter, error };
}

export async function revivePokemon(encounterId: string, runId: string) {
  const supabase = createClient();

  // Verificar que hay tokens disponibles
  const { data: run } = await supabase
    .from('nuzlocke_runs')
    .select('revival_tokens_available')
    .eq('id', runId)
    .single();

  if (!run || run.revival_tokens_available <= 0) {
    return { encounter: null, error: { message: 'No hay tokens de revival disponibles' } };
  }

  // Revivir el Pokemon
  const { data: encounter, error } = await supabase
    .from('encounters')
    .update({
      status: 'alive',
      was_revived: true,
      revival_date: new Date().toISOString(),
    })
    .eq('id', encounterId)
    .select()
    .single();

  if (error) return { encounter: null, error };

  // Decrementar tokens
  const { error: updateError } = await supabase
    .from('nuzlocke_runs')
    .update({
      revival_tokens_available: run.revival_tokens_available - 1,
    })
    .eq('id', runId);

  if (updateError) return { encounter: null, error: updateError };

  return { encounter, error: null };
}

// ============================================
// GYM BATTLES
// ============================================

export async function getRunGymBattles(runId: string) {
  const supabase = createClient();

  const { data: battles, error } = await supabase
    .from('gym_battles')
    .select('*')
    .eq('run_id', runId)
    .order('gym_number', { ascending: true });

  return { battles, error };
}

export async function registerGymVictory(
  runId: string,
  gymNumber: number,
  leaderName: string,
  variantName: string
) {
  const supabase = createClient();

  const { data: battle, error } = await supabase
    .from('gym_battles')
    .insert({
      run_id: runId,
      gym_number: gymNumber,
      leader_name: leaderName,
      variant_used: variantName,
      status: 'won',
      completed_at: new Date().toISOString(),
    })
    .select()
    .single();

  return { battle, error };
}

export async function deleteGymBattle(battleId: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from('gym_battles')
    .delete()
    .eq('id', battleId);

  return { error };
}
