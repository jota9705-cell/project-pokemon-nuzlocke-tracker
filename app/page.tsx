import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pokemon-blue to-pokemon-red flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-2xl p-8 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Pokemon Añil
        </h1>
        <h2 className="text-3xl font-semibold text-pokemon-blue mb-6">
          Nuzlocke Tracker
        </h2>

        <p className="text-gray-600 mb-8 text-lg">
          Rastrea tus partidas Nuzlocke de Pokemon Añil.
          Gestiona tus encuentros, equipo y batallas de gimnasio.
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/login"
            className="px-8 py-3 bg-pokemon-blue text-white rounded-lg font-semibold hover:bg-opacity-90 transition"
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/register"
            className="px-8 py-3 bg-pokemon-red text-white rounded-lg font-semibold hover:bg-opacity-90 transition"
          >
            Registrarse
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-lg mb-2 text-mode-classic">🎮 3 Modos</h3>
            <p className="text-sm text-gray-600">Clásico, Completo y Radical</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-lg mb-2 text-mode-complete">📍 63 Rutas</h3>
            <p className="text-sm text-gray-600">Todas las zonas de Pokemon Añil</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-lg mb-2 text-mode-radical">🏅 16 Líderes</h3>
            <p className="text-sm text-gray-600">Kanto y Hoenn completos</p>
          </div>
        </div>
      </div>
    </div>
  );
}
