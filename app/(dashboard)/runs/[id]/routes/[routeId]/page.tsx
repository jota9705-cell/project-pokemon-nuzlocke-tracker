'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { getRunById, getEncounterByRoute, createEncounter } from '@/lib/supabase/queries';
import { getEncounterById } from '@/lib/data/encounters';
import { NuzlockeRun, Encounter } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Link from 'next/link';
import { Textarea } from '@/components/ui/textarea';
import { AcquisitionMethod } from '@/types';

export default function RouteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const runId = params.id as string;
  const routeId = params.routeId as string;

  const [run, setRun] = useState<NuzlockeRun | null>(null);
  const [existingEncounter, setExistingEncounter] = useState<Encounter | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [selectedPokemon, setSelectedPokemon] = useState('');
  const [pokemonLevel, setPokemonLevel] = useState('');
  const [nickname, setNickname] = useState('');
  const [acquisitionMethod, setAcquisitionMethod] = useState<AcquisitionMethod>('wild');
  const [isShiny, setIsShiny] = useState(false);
  const [status, setStatus] = useState<'alive' | 'dead'>('alive');
  const [nature, setNature] = useState('');
  const [ability, setAbility] = useState('');
  const [notes, setNotes] = useState('');

  const route = getEncounterById(routeId);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && runId && routeId) {
      loadData();
    }
  }, [user, runId, routeId]);

  const loadData = async () => {
    setLoading(true);

    const [runResult, encounterResult] = await Promise.all([
      getRunById(runId),
      getEncounterByRoute(runId, routeId),
    ]);

    if (runResult.run) setRun(runResult.run as NuzlockeRun);

    // If encounter exists, show it instead of form
    if (encounterResult.encounter && !encounterResult.error) {
      setExistingEncounter(encounterResult.encounter as Encounter);
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

  if (!user || !run || !route) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Ruta no encontrada</div>
      </div>
    );
  }

  const pokemonList = run.game_mode === 'classic' ? route.pokemon_classic : route.pokemon_complete;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (!selectedPokemon) {
      setError('Debes seleccionar un Pokemon');
      setSubmitting(false);
      return;
    }

    if (!pokemonLevel || parseInt(pokemonLevel) < 1) {
      setError('Debes ingresar un nivel válido');
      setSubmitting(false);
      return;
    }

    const { encounter, error } = await createEncounter(
      {
        route_id: routeId,
        route_name: route.name,
        pokemon_name: selectedPokemon,
        pokemon_level: parseInt(pokemonLevel),
        nickname: nickname.trim() || undefined,
        status,
        acquisition_method: acquisitionMethod,
        is_shiny: isShiny,
        nature: nature.trim() || undefined,
        ability: ability.trim() || undefined,
        notes: notes.trim() || undefined,
      },
      runId
    );

    if (error) {
      setError(error.message);
      setSubmitting(false);
    } else {
      // Success! Redirect back to run detail
      router.push(`/runs/${runId}`);
    }
  };

  // If encounter already exists, show it
  if (existingEncounter) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link href={`/runs/${runId}/routes`} className="text-sm text-gray-600 hover:text-gray-900 mb-4 inline-block">
              ← Volver a Rutas
            </Link>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardHeader>
              <CardTitle>{route.name}</CardTitle>
              <CardDescription>
                {existingEncounter.acquisition_method === 'wild'
                  ? 'Ya capturaste un Pokemon salvaje en esta ruta'
                  : 'Encuentro registrado en esta ruta'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-6 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold">{existingEncounter.nickname || existingEncounter.pokemon_name}</h3>
                    {existingEncounter.nickname && (
                      <p className="text-gray-600">{existingEncounter.pokemon_name}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {existingEncounter.is_shiny && <Badge variant="warning">✨ Shiny</Badge>}
                    <Badge variant={
                      existingEncounter.acquisition_method === 'wild' ? 'default' :
                      existingEncounter.acquisition_method === 'gift' ? 'secondary' : 'outline'
                    }>
                      {existingEncounter.acquisition_method === 'wild' ? '🎯 Captura' :
                       existingEncounter.acquisition_method === 'gift' ? '🎁 Regalo' : '🔄 Intercambio'}
                    </Badge>
                    <Badge variant={
                      existingEncounter.status === 'alive' ? 'success' :
                      existingEncounter.status === 'dead' ? 'danger' : 'secondary'
                    }>
                      {existingEncounter.status === 'alive' ? 'Vivo' :
                       existingEncounter.status === 'dead' ? 'Muerto' : 'Boxeado'}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Nivel:</span>{' '}
                    <span className="font-semibold">{existingEncounter.pokemon_level}</span>
                  </div>
                  {existingEncounter.nature && (
                    <div>
                      <span className="text-gray-600">Naturaleza:</span>{' '}
                      <span className="font-semibold">{existingEncounter.nature}</span>
                    </div>
                  )}
                  {existingEncounter.ability && (
                    <div>
                      <span className="text-gray-600">Habilidad:</span>{' '}
                      <span className="font-semibold">{existingEncounter.ability}</span>
                    </div>
                  )}
                  {existingEncounter.is_in_team && (
                    <div>
                      <Badge variant="success">En el equipo</Badge>
                    </div>
                  )}
                </div>

                {existingEncounter.notes && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-1">Notas:</p>
                    <p className="text-sm">{existingEncounter.notes}</p>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <Link href={`/runs/${runId}`}>
                  <Button variant="pokemon" className="w-full">
                    Volver al Run
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Show registration form
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href={`/runs/${runId}/routes`} className="text-sm text-gray-600 hover:text-gray-900 mb-4 inline-block">
            ← Volver a Rutas
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{route.name}</h1>
            <p className="text-gray-600">Registra tu encuentro en esta ruta</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Pokemon Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Pokemon Disponibles</CardTitle>
              <CardDescription>Selecciona el Pokemon que encontraste</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {pokemonList.map((pokemon) => (
                  <button
                    key={pokemon.name}
                    type="button"
                    onClick={() => setSelectedPokemon(pokemon.name)}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      selectedPokemon === pokemon.name
                        ? 'border-pokemon-blue bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold">{pokemon.name}</div>
                    <div className="text-sm text-gray-600">
                      Lv. {pokemon.min_level}-{pokemon.max_level}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pokemon Details */}
          {selectedPokemon && (
            <Card>
              <CardHeader>
                <CardTitle>Detalles del Pokemon</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="level">Nivel *</Label>
                    <Input
                      type="number"
                      id="level"
                      value={pokemonLevel}
                      onChange={(e) => setPokemonLevel(e.target.value)}
                      placeholder="Ej: 5"
                      required
                      disabled={submitting}
                      min="1"
                      max="100"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="nickname">Apodo</Label>
                    <Input
                      type="text"
                      id="nickname"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="Ej: Sparky"
                      disabled={submitting}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="nature">Naturaleza</Label>
                    <Input
                      type="text"
                      id="nature"
                      value={nature}
                      onChange={(e) => setNature(e.target.value)}
                      placeholder="Ej: Adamant"
                      disabled={submitting}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="ability">Habilidad</Label>
                    <Input
                      type="text"
                      id="ability"
                      value={ability}
                      onChange={(e) => setAbility(e.target.value)}
                      placeholder="Ej: Static"
                      disabled={submitting}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Notas adicionales..."
                    disabled={submitting}
                    className="mt-2"
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Tipo de Adquisición</Label>
                  <RadioGroup
                    value={acquisitionMethod}
                    onValueChange={(value) => setAcquisitionMethod(value as AcquisitionMethod)}
                    disabled={submitting}
                    className="mt-2 space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="wild" id="wild" />
                      <Label htmlFor="wild" className="cursor-pointer font-normal">
                        🎯 Captura Salvaje (cuenta para regla de primer encuentro)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="gift" id="gift" />
                      <Label htmlFor="gift" className="cursor-pointer font-normal">
                        🎁 Regalo (no cuenta como captura)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="trade" id="trade" />
                      <Label htmlFor="trade" className="cursor-pointer font-normal">
                        🔄 Intercambio (no cuenta como captura)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isShiny"
                      checked={isShiny}
                      onCheckedChange={(checked) => setIsShiny(checked as boolean)}
                      disabled={submitting}
                    />
                    <Label htmlFor="isShiny" className="cursor-pointer">
                      ✨ Es Shiny
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isDead"
                      checked={status === 'dead'}
                      onCheckedChange={(checked) => setStatus(checked ? 'dead' : 'alive')}
                      disabled={submitting}
                    />
                    <Label htmlFor="isDead" className="cursor-pointer">
                      💀 Murió en la captura
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit */}
          <div className="flex gap-4">
            <Link href={`/runs/${runId}/routes`} className="flex-1">
              <Button type="button" variant="outline" className="w-full" disabled={submitting}>
                Cancelar
              </Button>
            </Link>
            <Button
              type="submit"
              variant="pokemon"
              className="flex-1"
              disabled={submitting || !selectedPokemon}
            >
              {submitting ? 'Registrando...' : 'Registrar Encuentro'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
