'use client';

import { useState, useEffect } from 'react';
import { Encounter } from '@/types';
import { getAvailablePokemon, addToTeam, removeFromTeam, markAsDead, markAsBoxed } from '@/lib/supabase/queries';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Plus } from 'lucide-react';

interface TeamManagementProps {
  runId: string;
  team: Encounter[];
  onUpdate: () => void;
}

export function TeamManagement({ runId, team, onUpdate }: TeamManagementProps) {
  const [availablePokemon, setAvailablePokemon] = useState<Encounter[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAvailablePokemon();
  }, [runId]);

  const loadAvailablePokemon = async () => {
    const { available } = await getAvailablePokemon(runId);
    if (available) {
      setAvailablePokemon(available as Encounter[]);
    }
  };

  const handleAddToTeam = async (pokemonId: string) => {
    if (selectedSlot === null) return;

    setLoading(true);
    const { error } = await addToTeam(pokemonId, selectedSlot);

    if (!error) {
      setDialogOpen(false);
      setSelectedSlot(null);
      await loadAvailablePokemon();
      onUpdate();
    }
    setLoading(false);
  };

  const handleRemoveFromTeam = async (pokemonId: string) => {
    setLoading(true);
    const { error } = await removeFromTeam(pokemonId);

    if (!error) {
      await loadAvailablePokemon();
      onUpdate();
    }
    setLoading(false);
  };

  const handleMarkAsDead = async (pokemonId: string) => {
    if (!confirm('¿Estás seguro de marcar este Pokemon como muerto? Esta acción no se puede deshacer fácilmente.')) {
      return;
    }

    setLoading(true);
    const { error } = await markAsDead(pokemonId);

    if (!error) {
      onUpdate();
    }
    setLoading(false);
  };

  const handleMarkAsBoxed = async (pokemonId: string) => {
    setLoading(true);
    const { error } = await markAsBoxed(pokemonId);

    if (!error) {
      await loadAvailablePokemon();
      onUpdate();
    }
    setLoading(false);
  };

  const openAddDialog = (position: number) => {
    setSelectedSlot(position);
    setDialogOpen(true);
  };

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => {
          const position = index + 1;
          const pokemon = team.find(p => p.team_position === position);

          return (
            <Card key={position} className={pokemon ? 'border-green-300 bg-green-50' : 'border-dashed'}>
              <CardContent className="p-4">
                {pokemon ? (
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-semibold text-lg">{pokemon.nickname || pokemon.pokemon_name}</div>
                        {pokemon.nickname && (
                          <div className="text-sm text-gray-600">{pokemon.pokemon_name}</div>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleRemoveFromTeam(pokemon.id)}>
                            📦 Boxear
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleMarkAsDead(pokemon.id)}
                            className="text-red-600"
                          >
                            💀 Marcar como muerto
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <Badge variant="secondary">Lv. {pokemon.pokemon_level}</Badge>
                      {pokemon.is_shiny && <Badge variant="warning">✨</Badge>}
                      {pokemon.was_revived && <Badge variant="success" className="text-xs">💚</Badge>}
                    </div>

                    {pokemon.nature && (
                      <div className="mt-2 text-xs text-gray-600">
                        {pokemon.nature}
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => openAddDialog(position)}
                    disabled={loading}
                    className="w-full text-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center h-full min-h-[100px]">
                      <Plus className="h-8 w-8 mb-2" />
                      <div className="text-sm">Agregar Pokemon</div>
                      <div className="text-xs">Slot {position}</div>
                    </div>
                  </button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add Pokemon Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Agregar Pokemon al Equipo</DialogTitle>
            <DialogDescription>
              Selecciona un Pokemon para agregar al slot {selectedSlot}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 mt-4">
            {availablePokemon.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                <div className="text-4xl mb-2">📦</div>
                <p>No tienes Pokemon disponibles</p>
                <p className="text-sm mt-1">Captura más Pokemon o mueve algunos del equipo a la caja</p>
              </div>
            ) : (
              availablePokemon.map((pokemon) => (
                <button
                  key={pokemon.id}
                  onClick={() => handleAddToTeam(pokemon.id)}
                  disabled={loading}
                  className="w-full p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-semibold">{pokemon.nickname || pokemon.pokemon_name}</div>
                      {pokemon.nickname && (
                        <div className="text-sm text-gray-600">{pokemon.pokemon_name}</div>
                      )}
                      <div className="text-sm text-gray-600 mt-1">
                        {pokemon.route_name} • Lv. {pokemon.pokemon_level}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {pokemon.status === 'boxed' && (
                        <Badge variant="secondary">📦 Boxeado</Badge>
                      )}
                      {pokemon.is_shiny && <Badge variant="warning">✨</Badge>}
                      {pokemon.nature && (
                        <Badge variant="outline">{pokemon.nature}</Badge>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
