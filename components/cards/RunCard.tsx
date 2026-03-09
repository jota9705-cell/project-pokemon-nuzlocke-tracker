import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NuzlockeRun } from '@/types';
import { getGameModeLabel, formatDate } from '@/lib/utils';

interface RunCardProps {
  run: NuzlockeRun;
}

export function RunCard({ run }: RunCardProps) {
  const getModeColor = (mode: string) => {
    const colors: Record<string, string> = {
      classic: 'bg-purple-100 text-purple-700 border-purple-300',
      complete: 'bg-blue-100 text-blue-700 border-blue-300',
      radical: 'bg-red-100 text-red-700 border-red-300',
    };
    return colors[mode] || 'bg-gray-100 text-gray-700';
  };

  return (
    <Link href={`/runs/${run.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="mb-2">{run.run_name}</CardTitle>
              <CardDescription>{formatDate(run.created_at)}</CardDescription>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getModeColor(run.game_mode)}`}>
              {getGameModeLabel(run.game_mode)}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{run.total_captures}</div>
              <div className="text-xs text-gray-600">Capturas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{run.total_deaths}</div>
              <div className="text-xs text-gray-600">Muertes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{run.gyms_defeated}</div>
              <div className="text-xs text-gray-600">Gimnasios</div>
            </div>
          </div>

          {run.is_active && (
            <div className="mt-4 pt-4 border-t">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                ● Activo
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
