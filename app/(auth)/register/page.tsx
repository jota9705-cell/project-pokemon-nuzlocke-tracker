'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validations
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    const { error } = await signUp(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pokemon-red to-pokemon-yellow flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-2xl p-8 text-center">
          <div className="mb-4 text-6xl">✅</div>
          <h1 className="text-3xl font-bold mb-4">¡Cuenta Creada!</h1>
          <p className="text-gray-600 mb-6">
            Revisa tu email para confirmar tu cuenta.
          </p>
          <p className="text-sm text-gray-500">
            Redirigiendo al login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pokemon-red to-pokemon-yellow flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-center mb-8">Crear Cuenta</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              disabled={loading}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
            <Input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              className="mt-2"
            />
          </div>

          <Button
            type="submit"
            variant="pokemonRed"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-pokemon-red font-semibold hover:underline">
            Inicia sesión aquí
          </Link>
        </p>

        <Link
          href="/"
          className="block mt-4 text-center text-sm text-gray-500 hover:text-gray-700"
        >
          ← Volver al inicio
        </Link>
      </div>
    </div>
  );
}
