'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { getUserRuns } from '@/lib/supabase/queries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RunCard } from '@/components/cards/RunCard';
import { NuzlockeRun } from '@/types';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [runs, setRuns] = useState<NuzlockeRun[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadRuns();
    }
  }, [user]);

  const loadRuns = async () => {
    if (!user) return;

    setLoading(true);
    const { runs: userRuns, error } = await getUserRuns(user.id);

    if (!error && userRuns) {
      setRuns(userRuns as NuzlockeRun[]);
    }
    setLoading(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const activeRuns = runs.filter(run => run.is_active);
  const completedRuns = runs.filter(run => !run.is_active);
  const totalCaptures = runs.reduce((sum, run) => sum + run.total_captures, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pokemon Añil Nuzlocke Tracker</h1>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
            <Button onClick={handleSignOut} variant="outline">
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
            <p className="text-gray-600">Gestiona tus runs de Nuzlocke</p>
          </div>
          <Link href="/runs/new">
            <Button variant="pokemon" size="lg">
              + Crear Nuevo Run
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Runs Activos</CardTitle>
              <CardDescription>Partidas en progreso</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-600">{activeRuns.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Runs Completados</CardTitle>
              <CardDescription>Partidas finalizadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-600">{completedRuns.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pokemon Capturados</CardTitle>
              <CardDescription>Total de capturas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-purple-600">{totalCaptures}</div>
            </CardContent>
          </Card>
        </div>

        {/* Runs List */}
        {runs.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Tus Runs</CardTitle>
              <CardDescription>Crea tu primer run de Nuzlocke</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-6xl mb-4">🎮</div>
              <p className="text-gray-600 mb-6 text-center">
                Aún no tienes ningún run creado. ¡Empieza tu aventura Nuzlocke ahora!
              </p>
              <Link href="/runs/new">
                <Button variant="pokemon" size="lg">
                  Crear Nuevo Run
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div>
            <h3 className="text-xl font-semibold mb-4">Tus Runs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {runs.map((run) => (
                <RunCard key={run.id} run={run} />
              ))}
            </div>
          </div>
        )}

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
            <CardHeader>
              <CardTitle className="text-mode-classic">🎮 3 Modos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">
                Clásico, Completo y Radical
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
            <CardHeader>
              <CardTitle className="text-mode-complete">📍 63 Rutas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">
                Todas las zonas de Pokemon Añil
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100">
            <CardHeader>
              <CardTitle className="text-mode-radical">🏅 16 Líderes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">
                Kanto y Hoenn completos
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
