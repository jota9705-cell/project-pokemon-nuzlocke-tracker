import { RouteEncounter } from '@/types';
import encountersData from '@/game_data/encounters.json';

export const encounters = encountersData as RouteEncounter[];

export function getEncounterById(id: string): RouteEncounter | undefined {
  return encounters.find(e => e.id === id);
}

export function getEncountersByMode(mode: 'classic' | 'complete' | 'radical'): RouteEncounter[] {
  return encounters.map(route => ({
    ...route,
    // For radical mode, use complete pokemon list
    pokemon: mode === 'classic' ? route.pokemon_classic : route.pokemon_complete
  })) as any;
}

export function searchEncounters(query: string): RouteEncounter[] {
  const lowerQuery = query.toLowerCase();
  return encounters.filter(route =>
    route.name.toLowerCase().includes(lowerQuery)
  );
}
