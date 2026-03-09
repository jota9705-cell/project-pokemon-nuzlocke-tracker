'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { createRun } from '@/lib/supabase/queries';
import { nuzlockeRules, getDefaultRules, getMandatoryRules } from '@/lib/data/rules';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { GameMode } from '@/types';
import Link from 'next/link';

export default function NewRunPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [runName, setRunName] = useState('');
  const [gameMode, setGameMode] = useState<GameMode>('complete');
  const [selectedRules, setSelectedRules] = useState<string[]>(getDefaultRules());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const mandatoryRules = getMandatoryRules();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const toggleRule = (ruleId: string) => {
    // Can't toggle mandatory rules
    if (mandatoryRules.includes(ruleId)) return;

    if (selectedRules.includes(ruleId)) {
      setSelectedRules(selectedRules.filter(id => id !== ruleId));
    } else {
      setSelectedRules([...selectedRules, ruleId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!runName.trim()) {
      setError('El nombre del run es requerido');
      setLoading(false);
      return;
    }

    const { run, error } = await createRun(
      {
        run_name: runName.trim(),
        game_mode: gameMode,
        selected_rules: selectedRules,
      },
      user.id
    );

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
            ← Volver al Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Crear Nuevo Run</h1>
          <p className="text-gray-600">Configura tu partida de Nuzlocke de Pokemon Añil</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Run Name */}
          <Card>
            <CardHeader>
              <CardTitle>Nombre del Run</CardTitle>
              <CardDescription>Dale un nombre único a tu partida</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                type="text"
                value={runName}
                onChange={(e) => setRunName(e.target.value)}
                placeholder="Ej: Mi Primer Nuzlocke, Run Radical 2024"
                required
                disabled={loading}
              />
            </CardContent>
          </Card>

          {/* Game Mode */}
          <Card>
            <CardHeader>
              <CardTitle>Modo de Juego</CardTitle>
              <CardDescription>Selecciona qué Pokemon estarán disponibles</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={gameMode} onValueChange={(value) => setGameMode(value as GameMode)}>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="classic" id="classic" />
                    <div className="flex-1">
                      <Label htmlFor="classic" className="cursor-pointer">
                        <div className="font-semibold text-mode-classic">Clásico</div>
                        <div className="text-sm text-gray-600">
                          Pokemon tradicionales de Gen 1-2 principalmente
                        </div>
                      </Label>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer bg-blue-50 border-blue-200">
                    <RadioGroupItem value="complete" id="complete" />
                    <div className="flex-1">
                      <Label htmlFor="complete" className="cursor-pointer">
                        <div className="font-semibold text-mode-complete">Completo (Recomendado)</div>
                        <div className="text-sm text-gray-600">
                          Todos los Pokemon de Gen 1-9 disponibles
                        </div>
                      </Label>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="radical" id="radical" />
                    <div className="flex-1">
                      <Label htmlFor="radical" className="cursor-pointer">
                        <div className="font-semibold text-mode-radical">Radical</div>
                        <div className="text-sm text-gray-600">
                          Modo difícil con todos los Pokemon (Gen 1-9)
                        </div>
                      </Label>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Rules */}
          <Card>
            <CardHeader>
              <CardTitle>Reglas del Nuzlocke</CardTitle>
              <CardDescription>Las reglas básicas son obligatorias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Basic Rules */}
                <div>
                  <h3 className="font-semibold mb-3 text-gray-900">Reglas Básicas (Obligatorias)</h3>
                  <div className="space-y-3">
                    {nuzlockeRules.basic_rules.map((rule) => (
                      <div key={rule.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Checkbox
                          id={rule.id}
                          checked={true}
                          disabled={true}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <Label htmlFor={rule.id} className="font-medium text-gray-900">
                            {rule.name}
                          </Label>
                          <p className="text-sm text-gray-600">{rule.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Optional Rules */}
                <div>
                  <h3 className="font-semibold mb-3 text-gray-900">Reglas Opcionales</h3>
                  <div className="space-y-3">
                    {nuzlockeRules.optional_rules.map((rule) => (
                      <div
                        key={rule.id}
                        className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <Checkbox
                          id={rule.id}
                          checked={selectedRules.includes(rule.id)}
                          onCheckedChange={() => toggleRule(rule.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <Label htmlFor={rule.id} className="cursor-pointer font-medium text-gray-900">
                            {rule.name}
                          </Label>
                          <p className="text-sm text-gray-600">{rule.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Link href="/dashboard" className="flex-1">
              <Button type="button" variant="outline" className="w-full" disabled={loading}>
                Cancelar
              </Button>
            </Link>
            <Button type="submit" variant="pokemon" className="flex-1" disabled={loading}>
              {loading ? 'Creando...' : 'Crear Run'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
