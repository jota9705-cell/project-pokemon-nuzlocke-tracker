export * from './cn';

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function calculateSurvivalRate(captures: number, deaths: number): number {
  if (captures === 0) return 0;
  return Math.round(((captures - deaths) / captures) * 100);
}

export function getGameModeLabel(mode: string): string {
  const labels: Record<string, string> = {
    classic: 'Clásico',
    complete: 'Completo',
    radical: 'Radical',
  };
  return labels[mode] || mode;
}

export function getGameModeColor(mode: string): string {
  const colors: Record<string, string> = {
    classic: 'text-mode-classic',
    complete: 'text-mode-complete',
    radical: 'text-mode-radical',
  };
  return colors[mode] || '';
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    alive: 'text-status-alive',
    dead: 'text-status-dead',
    boxed: 'text-status-boxed',
    pending: 'text-yellow-500',
    won: 'text-green-500',
    lost: 'text-red-500',
  };
  return colors[status] || '';
}

export function getPokemonSpriteUrl(pokemonName: string): string {
  // Using PokeAPI sprites
  const formattedName = pokemonName.toLowerCase();
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${formattedName}.png`;
}
