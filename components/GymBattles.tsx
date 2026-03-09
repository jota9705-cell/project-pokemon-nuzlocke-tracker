'use client';

import { useState } from 'react';
import { GymBattle } from '@/types';
import { registerGymVictory, deleteGymBattle } from '@/lib/supabase/queries';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle2, Circle, Trash2 } from 'lucide-react';
import gymLeadersData from '@/game_data/gym_leaders.json';

interface GymBattlesProps {
  runId: string;
  gameMode: string;
  gymBattles: GymBattle[];
  onUpdate: () => void;
}

interface GymLeader {
  gym_number: number;
  name: string;
  quote: string;
  variants: {
    variant_name: string;
    team: { name: string; level: number }[];
  }[];
}

export function GymBattles({ runId, gameMode, gymBattles, onUpdate }: GymBattlesProps) {
  const [selectedLeader, setSelectedLeader] = useState<GymLeader | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegisterVictory = async (leader: GymLeader, variantName: string) => {
    console.log('Registrando victoria:', { runId, gymNumber: leader.gym_number, leaderName: leader.name, variantName });

    setLoading(true);
    const { error } = await registerGymVictory(
      runId,
      leader.gym_number,
      leader.name,
      variantName
    );

    console.log('Resultado:', { error });

    if (!error) {
      setDialogOpen(false);
      setSelectedLeader(null);
      onUpdate();
    } else {
      console.error('Error al registrar victoria:', error);
    }
    setLoading(false);
  };

  const handleDeleteBattle = async (battleId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta victoria de gimnasio?')) {
      return;
    }

    setLoading(true);
    const { error } = await deleteGymBattle(battleId);

    if (!error) {
      onUpdate();
    }
    setLoading(false);
  };

  const getLeaderBattle = (leaderName: string) => {
    return gymBattles.find(b => b.leader_name === leaderName && b.status === 'won');
  };

  const openDialog = (leader: GymLeader) => {
    setSelectedLeader(leader);
    setDialogOpen(true);
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(gymLeadersData as GymLeader[]).map((leader) => {
          const battle = getLeaderBattle(leader.name);
          const defeated = !!battle;

          return (
            <Card key={`${leader.gym_number}-${leader.name}`} className={defeated ? 'border-green-300 bg-green-50' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {defeated ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400" />
                      )}
                      {leader.name}
                    </CardTitle>
                    <p className="text-xs text-gray-600 mt-1">Gimnasio {leader.gym_number}</p>
                  </div>
                  <Badge variant={defeated ? 'success' : 'secondary'}>
                    {defeated ? 'Derrotado' : 'Pendiente'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {defeated && battle ? (
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-600">
                        Variante: {battle.variant_used}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Derrotado el {new Date(battle.completed_at || '').toLocaleDateString()}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteBattle(battle.id)}
                      disabled={loading}
                      className="w-full text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar victoria
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 italic line-clamp-2">
                      "{leader.quote}"
                    </p>
                    <Button
                      variant="pokemon"
                      size="sm"
                      onClick={() => openDialog(leader)}
                      disabled={loading}
                      className="w-full"
                    >
                      Registrar Victoria
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Dialog para seleccionar variante */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedLeader?.name} - Selecciona la variante derrotada</DialogTitle>
            <DialogDescription>
              Elige la variante del equipo que enfrentaste
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            {selectedLeader?.variants.map((variant) => (
              <div
                key={variant.variant_name}
                className="border rounded-lg p-4 hover:bg-gray-50"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold text-lg">
                      {variant.variant_name === selectedLeader.name
                        ? 'Variante Clásica'
                        : variant.variant_name.includes(',1')
                        ? 'Variante Completa'
                        : 'Variante Radical'}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {variant.team.length} Pokemon
                    </div>
                  </div>
                  <Button
                    variant="pokemon"
                    size="sm"
                    onClick={() => handleRegisterVictory(selectedLeader, variant.variant_name)}
                    disabled={loading}
                  >
                    Seleccionar
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {variant.team.map((pokemon, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {pokemon.name} Lv.{pokemon.level}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
