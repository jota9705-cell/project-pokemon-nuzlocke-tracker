'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { getRunById, getRunEncounters } from '@/lib/supabase/queries';
import { NuzlockeRun, Encounter } from '@/types';
import { encounters as allRoutes } from '@/lib/data/encounters';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Search } from 'lucide-react';

export default function RoutesListPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const runId = params.id as string;

  const [run, setRun] = useState<NuzlockeRun | null>(null);
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && runId) {
      loadData();
    }
  }, [user, runId]);

  const loadData = async () => {
    setLoading(true);

    const [runResult, encountersResult] = await Promise.all([
      getRunById(runId),
      getRunEncounters(runId),
    ]);

    if (runResult.run) setRun(runResult.run as NuzlockeRun);
    if (encountersResult.encounters) setEncounters(encountersResult.encounters as Encounter[]);

    setLoading(false);
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

  // Check if route already has an encounter
  const hasEncounter = (routeId: string) => {
    return encounters.some(e => e.route_id === routeId);
  };

  const getEncounterForRoute = (routeId: string) => {
    return encounters.find(e => e.route_id === routeId);
  };

  // Filter routes by search
  const filteredRoutes = allRoutes.filter(route =>
    route.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href={`/runs/${runId}`} className="text-sm text-gray-600 hover:text-gray-900 mb-4 inline-block">
            ← Volver al Run
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Rutas de Pokemon Añil</h1>
            <p className="text-gray-600">Selecciona una ruta para registrar tu encuentro</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Buscar ruta..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total de Rutas</CardDescription>
              <CardTitle className="text-2xl">{allRoutes.length}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Rutas Exploradas</CardDescription>
              <CardTitle className="text-2xl text-green-600">{encounters.length}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Rutas Disponibles</CardDescription>
              <CardTitle className="text-2xl text-blue-600">{allRoutes.length - encounters.length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Routes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRoutes.map((route) => {
            const encounter = getEncounterForRoute(route.id);
            const captured = hasEncounter(route.id);

            return (
              <Link key={route.id} href={`/runs/${runId}/routes/${route.id}`}>
                <Card className={`hover:shadow-lg transition-shadow cursor-pointer ${
                  captured ? 'border-green-300 bg-green-50' : ''
                }`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{route.name}</CardTitle>
                        <CardDescription>
                          {run.game_mode === 'classic'
                            ? `${route.pokemon_classic.length} Pokemon`
                            : `${route.pokemon_complete.length} Pokemon`}
                        </CardDescription>
                      </div>
                      {captured && (
                        <Badge variant="success">✓ Capturado</Badge>
                      )}
                    </div>
                  </CardHeader>

                  {encounter && (
                    <CardContent>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <div>
                          <div className="font-semibold">{encounter.nickname || encounter.pokemon_name}</div>
                          <div className="text-sm text-gray-600">Lv. {encounter.pokemon_level}</div>
                        </div>
                        <div className="flex gap-2">
                          {encounter.is_shiny && <Badge variant="warning">✨</Badge>}
                          <Badge variant={
                            encounter.status === 'alive' ? 'success' :
                            encounter.status === 'dead' ? 'danger' : 'secondary'
                          }>
                            {encounter.status === 'alive' ? 'Vivo' :
                             encounter.status === 'dead' ? 'Muerto' : 'Boxeado'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              </Link>
            );
          })}
        </div>

        {filteredRoutes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No se encontraron rutas con ese nombre</p>
          </div>
        )}
      </main>
    </div>
  );
}
