'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { getRunById, getRunEncounters, getTeamPokemon, getRunGymBattles, revivePokemon } from '@/lib/supabase/queries';
import { NuzlockeRun, Encounter, GymBattle } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TeamManagement } from '@/components/TeamManagement';
import { GymBattles } from '@/components/GymBattles';
import { getGameModeLabel, formatDate, calculateSurvivalRate } from '@/lib/utils';
import Link from 'next/link';
import { nuzlockeRules } from '@/lib/data/rules';

export default function RunDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const runId = params.id as string;

  const [run, setRun] = useState<NuzlockeRun | null>(null);
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [team, setTeam] = useState<Encounter[]>([]);
  const [gymBattles, setGymBattles] = useState<GymBattle[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviving, setReviving] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && runId) {
      loadRunData();
    }
  }, [user, runId]);

  const loadRunData = async () => {
    setLoading(true);

    const [runResult, encountersResult, teamResult, battlesResult] = await Promise.all([
      getRunById(runId),
      getRunEncounters(runId),
      getTeamPokemon(runId),
      getRunGymBattles(runId),
    ]);

    if (runResult.run) setRun(runResult.run as NuzlockeRun);
    if (encountersResult.encounters) setEncounters(encountersResult.encounters as Encounter[]);
    if (teamResult.team) setTeam(teamResult.team as Encounter[]);
    if (battlesResult.battles) setGymBattles(battlesResult.battles as GymBattle[]);

    setLoading(false);
  };

  const handleRevive = async (encounterId: string) => {
    if (!run) return;

    if (run.revival_tokens_available <= 0) {
      alert('No tienes tokens de revival disponibles. Derrota más gimnasios para obtenerlos.');
      return;
    }

    if (!confirm('¿Estás seguro de revivir este Pokemon? Esto consumirá 1 token de revival.')) {
      return;
    }

    setReviving(encounterId);
    const { error } = await revivePokemon(encounterId, runId);

    if (error) {
      alert(error.message || 'Error al revivir Pokemon');
    } else {
      await loadRunData();
    }
    setReviving(null);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }

  if (!user || !run) {
    return null;
  }

  const aliveEncounters = encounters.filter(e => e.status === 'alive');
  const deadEncounters = encounters.filter(e => e.status === 'dead');
  const boxedEncounters = encounters.filter(e => e.status === 'boxed');
  const survivalRate = calculateSurvivalRate(run.total_captures, run.total_deaths);

  const getModeColor = (mode: string) => {
    const colors: Record<string, string> = {
      classic: 'bg-purple-100 text-purple-700 border-purple-300',
      complete: 'bg-blue-100 text-blue-700 border-blue-300',
      radical: 'bg-red-100 text-red-700 border-red-300',
    };
    return colors[mode] || 'bg-gray-100 text-gray-700';
  };

  const getRuleNames = (ruleIds: string[]) => {
    const allRules = [...nuzlockeRules.basic_rules, ...nuzlockeRules.optional_rules];
    return ruleIds.map(id => {
      const rule = allRules.find(r => r.id === id);
      return rule ? rule.name : id;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900 mb-4 inline-block">
            ← Volver al Dashboard
          </Link>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{run.run_name}</h1>
                <Badge variant={run.is_active ? "success" : "secondary"}>
                  {run.is_active ? '● Activo' : 'Completado'}
                </Badge>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getModeColor(run.game_mode)}`}>
                  {getGameModeLabel(run.game_mode)}
                </div>
              </div>
              <p className="text-sm text-gray-600">Creado el {formatDate(run.created_at)}</p>
            </div>
            <div className="flex gap-2">
              <Link href={`/runs/${runId}/routes`}>
                <Button variant="pokemon">
                  + Registrar Encuentro
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Capturas</CardDescription>
              <CardTitle className="text-3xl text-green-600">{run.total_captures}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Muertes</CardDescription>
              <CardTitle className="text-3xl text-red-600">{run.total_deaths}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Gimnasios</CardDescription>
              <CardTitle className="text-3xl text-blue-600">{run.gyms_defeated}/16</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Supervivencia</CardDescription>
              <CardTitle className="text-3xl text-purple-600">{survivalRate}%</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Revivals</CardDescription>
              <CardTitle className="text-3xl text-yellow-600">{run.revival_tokens_available}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="team" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="team">Equipo</TabsTrigger>
            <TabsTrigger value="encounters">Encuentros</TabsTrigger>
            <TabsTrigger value="gyms">Gimnasios</TabsTrigger>
            <TabsTrigger value="graveyard">Cementerio</TabsTrigger>
            <TabsTrigger value="info">Info</TabsTrigger>
          </TabsList>

          {/* Team Tab */}
          <TabsContent value="team">
            <Card>
              <CardHeader>
                <CardTitle>Equipo Actual</CardTitle>
                <CardDescription>Máximo 6 Pokemon • Click en + para agregar</CardDescription>
              </CardHeader>
              <CardContent>
                <TeamManagement runId={runId} team={team} onUpdate={loadRunData} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Encounters Tab */}
          <TabsContent value="encounters">
            <Card>
              <CardHeader>
                <CardTitle>Todos los Encuentros</CardTitle>
                <CardDescription>{encounters.length} Pokemon capturados</CardDescription>
              </CardHeader>
              <CardContent>
                {encounters.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📍</div>
                    <p className="text-gray-600 mb-4">Aún no has registrado encuentros</p>
                    <Link href={`/runs/${runId}/routes`}>
                      <Button variant="pokemon">Registrar Primer Encuentro</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {encounters.map((encounter) => (
                      <div key={encounter.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="font-semibold">{encounter.nickname || encounter.pokemon_name}</div>
                            <div className="text-sm text-gray-600">{encounter.route_name} • Lv. {encounter.pokemon_level}</div>
                          </div>
                          {encounter.is_shiny && <Badge variant="warning">✨ Shiny</Badge>}
                          {encounter.was_revived && <Badge variant="success" className="text-xs">💚 Revivido</Badge>}
                          {encounter.acquisition_method !== 'wild' && (
                            <Badge variant="outline" className="text-xs">
                              {encounter.acquisition_method === 'gift' ? '🎁 Regalo' : '🔄 Intercambio'}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {encounter.is_in_team && (
                            <Badge variant="success">En equipo</Badge>
                          )}
                          <Badge variant={
                            encounter.status === 'alive' ? 'success' :
                            encounter.status === 'dead' ? 'danger' : 'secondary'
                          }>
                            {encounter.status === 'alive' ? 'Vivo' : encounter.status === 'dead' ? 'Muerto' : 'Boxeado'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gyms Tab */}
          <TabsContent value="gyms">
            <Card>
              <CardHeader>
                <CardTitle>Gimnasios</CardTitle>
                <CardDescription>{run.gyms_defeated}/16 derrotados</CardDescription>
              </CardHeader>
              <CardContent>
                <GymBattles
                  runId={runId}
                  gameMode={run.game_mode}
                  gymBattles={gymBattles}
                  onUpdate={loadRunData}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Graveyard Tab */}
          <TabsContent value="graveyard">
            <Card>
              <CardHeader>
                <CardTitle>Cementerio</CardTitle>
                <CardDescription>{deadEncounters.length} Pokemon caídos</CardDescription>
              </CardHeader>
              <CardContent>
                {deadEncounters.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🕊️</div>
                    <p className="text-gray-600">¡Aún no has perdido ningún Pokemon!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {deadEncounters.map((encounter) => (
                      <div key={encounter.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-700">{encounter.nickname || encounter.pokemon_name}</div>
                          <div className="text-sm text-gray-500">
                            {encounter.route_name} • Lv. {encounter.pokemon_level}
                            {encounter.died_at && ` • Murió el ${formatDate(encounter.died_at)}`}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {encounter.is_shiny && <Badge variant="warning">✨ Shiny</Badge>}
                          {encounter.acquisition_method !== 'wild' && (
                            <Badge variant="outline" className="text-xs">
                              {encounter.acquisition_method === 'gift' ? '🎁 Regalo' : '🔄 Intercambio'}
                            </Badge>
                          )}
                          {run && run.revival_tokens_available > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRevive(encounter.id)}
                              disabled={reviving === encounter.id}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              {reviving === encounter.id ? 'Reviviendo...' : '💚 Revivir'}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Info Tab */}
          <TabsContent value="info">
            <Card>
              <CardHeader>
                <CardTitle>Información del Run</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Modo de Juego</h3>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getModeColor(run.game_mode)}`}>
                    {getGameModeLabel(run.game_mode)}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Reglas Activas</h3>
                  <div className="flex flex-wrap gap-2">
                    {getRuleNames(run.selected_rules).map((ruleName, index) => (
                      <Badge key={index} variant="outline">{ruleName}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Estadísticas</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600">Pokemon Vivos</div>
                      <div className="text-2xl font-bold text-green-600">{aliveEncounters.length}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600">Pokemon Boxeados</div>
                      <div className="text-2xl font-bold text-gray-600">{boxedEncounters.length}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Sistema de Revival</h3>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-sm text-gray-700 mb-2">
                      <span className="font-semibold">Tokens disponibles:</span> {run.revival_tokens_available}
                    </div>
                    <div className="text-xs text-gray-600">
                      • Ganas 1 token por cada gimnasio derrotado
                      <br />
                      • Usa tokens para revivir Pokemon muertos
                      <br />
                      • Los Pokemon revividos pueden volver al equipo
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Fechas</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Creado: {formatDate(run.created_at)}</p>
                    {run.completed_at && <p>Completado: {formatDate(run.completed_at)}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
