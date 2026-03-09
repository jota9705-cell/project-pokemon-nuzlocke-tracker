# Pokemon Añil Nuzlocke Tracker - Diseño Completo

## 📋 Contexto del Juego

### Modos de Juego
Pokemon Añil tiene **3 modos** diferentes:

1. **Normal/Clásico** - Pokemon tradicionales (Gen 1-2 principalmente)
2. **Completo** - Todos los Pokemon y variantes (Gen 1-9)
3. **Radical** - Modo difícil (mismo pool que Completo)

### Diferencias de Encuentros

**Ejemplo: Ruta 1**
- **Modo Clásico:** PIDGEY, LEDYBA, RATTATA, MAREEP (4 Pokemon)
- **Modo Completo:** BIDOOF, FLABEBE, LEDYBA, LITLEO, MAREEP, PIDGEY, STARLY, PATRAT, PURRLOIN (9 Pokemon)

### Variantes de Líderes de Gimnasio

Cada líder tiene **3 variantes de equipos** diferentes según la dificultad:
- Variante 1: Equipo básico
- Variante 2: Equipo alternativo
- Variante 3: Equipo más difícil (más Pokemon)

**Ejemplo: Brock**
- Variante 1: OMANYTE, BONSLY, ONIX (3)
- Variante 2: DWEBBLE, BONSLY, ONIX (3)
- Variante 3: DWEBBLE, TYRUNT, BONSLY, ONIX (4)

## 🗄️ Estructura de Base de Datos

### Tablas Principales

```sql
-- ============================================
-- TABLA: nuzlocke_runs (Partidas)
-- ============================================
CREATE TABLE nuzlocke_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Información básica
  run_name TEXT NOT NULL,
  game_mode TEXT NOT NULL CHECK (game_mode IN ('classic', 'complete', 'radical')),
  is_active BOOLEAN DEFAULT true,

  -- Reglas seleccionadas (JSON)
  selected_rules JSONB DEFAULT '[]'::jsonb,
  -- Ejemplo: ["dupes_clause", "shiny_clause", "level_cap"]

  -- Estadísticas
  total_captures INTEGER DEFAULT 0,
  total_deaths INTEGER DEFAULT 0,
  gyms_defeated INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,

  UNIQUE(user_id, run_name)
);

-- Índices
CREATE INDEX idx_runs_user_active ON nuzlocke_runs(user_id, is_active);
CREATE INDEX idx_runs_created ON nuzlocke_runs(created_at DESC);


-- ============================================
-- TABLA: encounters (Encuentros/Capturas)
-- ============================================
CREATE TABLE encounters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_id UUID NOT NULL REFERENCES nuzlocke_runs(id) ON DELETE CASCADE,

  -- Información de la ruta
  route_id TEXT NOT NULL, -- "003" (referencia a encounters.json)
  route_name TEXT NOT NULL, -- "Ruta 1"

  -- Pokemon encontrado
  pokemon_name TEXT NOT NULL,
  pokemon_level INTEGER NOT NULL,
  nickname TEXT,

  -- Estado
  status TEXT NOT NULL DEFAULT 'caught' CHECK (status IN ('caught', 'alive', 'dead', 'boxed')),
  is_in_team BOOLEAN DEFAULT false,
  team_position INTEGER CHECK (team_position BETWEEN 1 AND 6),

  -- Detalles adicionales
  is_shiny BOOLEAN DEFAULT false,
  nature TEXT,
  ability TEXT,
  notes TEXT,

  -- Timestamps
  caught_at TIMESTAMPTZ DEFAULT now(),
  died_at TIMESTAMPTZ,

  -- Solo 1 captura por ruta en un run (regla de Nuzlocke)
  UNIQUE(run_id, route_id)
);

-- Índices
CREATE INDEX idx_encounters_run ON encounters(run_id);
CREATE INDEX idx_encounters_team ON encounters(run_id, is_in_team) WHERE is_in_team = true;
CREATE INDEX idx_encounters_status ON encounters(run_id, status);


-- ============================================
-- TABLA: gym_battles (Batallas de Gimnasio)
-- ============================================
CREATE TABLE gym_battles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_id UUID NOT NULL REFERENCES nuzlocke_runs(id) ON DELETE CASCADE,

  -- Información del gimnasio
  gym_number INTEGER NOT NULL CHECK (gym_number BETWEEN 1 AND 16),
  leader_name TEXT NOT NULL,
  variant_used TEXT, -- "Brock", "Brock,1", "Brock,2"

  -- Estado de la batalla
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost')),

  -- Resultado
  casualties INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 0,
  notes TEXT,

  -- Timestamps
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(run_id, gym_number)
);

-- Índices
CREATE INDEX idx_gym_battles_run ON gym_battles(run_id);
CREATE INDEX idx_gym_battles_status ON gym_battles(run_id, status);


-- ============================================
-- TABLA: battle_logs (Registro de Combates)
-- ============================================
CREATE TABLE battle_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_id UUID NOT NULL REFERENCES nuzlocke_runs(id) ON DELETE CASCADE,

  -- Tipo de batalla
  battle_type TEXT NOT NULL CHECK (battle_type IN ('gym', 'trainer', 'wild', 'elite_four', 'champion')),
  battle_id UUID, -- Referencia a gym_battles si aplica

  -- Participantes
  team_used JSONB, -- Array de Pokemon usados
  -- Ejemplo: [{"name": "Pikachu", "nickname": "Sparky", "level": 15}]

  casualties JSONB, -- Pokemon que murieron en esta batalla
  -- Ejemplo: [{"name": "Pidgey", "nickname": "Birdie", "level": 10}]

  -- Resultado
  result TEXT NOT NULL CHECK (result IN ('won', 'lost', 'fled')),

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX idx_battle_logs_run ON battle_logs(run_id);
CREATE INDEX idx_battle_logs_type ON battle_logs(run_id, battle_type);


-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS
ALTER TABLE nuzlocke_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE encounters ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para nuzlocke_runs
CREATE POLICY "Users can view own runs"
  ON nuzlocke_runs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own runs"
  ON nuzlocke_runs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own runs"
  ON nuzlocke_runs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own runs"
  ON nuzlocke_runs FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para encounters
CREATE POLICY "Users can view encounters from own runs"
  ON encounters FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM nuzlocke_runs
      WHERE nuzlocke_runs.id = encounters.run_id
      AND nuzlocke_runs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert encounters in own runs"
  ON encounters FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM nuzlocke_runs
      WHERE nuzlocke_runs.id = encounters.run_id
      AND nuzlocke_runs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update encounters in own runs"
  ON encounters FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM nuzlocke_runs
      WHERE nuzlocke_runs.id = encounters.run_id
      AND nuzlocke_runs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete encounters in own runs"
  ON encounters FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM nuzlocke_runs
      WHERE nuzlocke_runs.id = encounters.run_id
      AND nuzlocke_runs.user_id = auth.uid()
    )
  );

-- Políticas similares para gym_battles y battle_logs
-- (seguir mismo patrón que encounters)
```

## 🎨 Estructura de la Aplicación

### Páginas Principales

```
/
├── / (landing page - público)
├── /login
├── /register
├── /dashboard (requiere auth)
│   ├── Resumen de todos los runs
│   └── Botón "Nuevo Run"
│
├── /runs/new (crear nuevo run)
│   ├── Nombre del run
│   ├── Seleccionar modo (Classic/Complete/Radical)
│   └── Seleccionar reglas (checkboxes)
│
├── /runs/[id] (dashboard del run específico)
│   ├── Header con nombre y stats
│   ├── Tabs:
│   │   ├── Equipo Actual
│   │   ├── Encuentros/Rutas
│   │   ├── Líderes de Gimnasio
│   │   ├── Cementerio (Pokemon muertos)
│   │   └── Historial de Batallas
│
├── /runs/[id]/routes (lista de rutas)
│   └── /runs/[id]/routes/[routeId] (detalle de ruta)
│       ├── Pokemon disponibles (según modo)
│       └── Registrar encuentro/captura
│
├── /runs/[id]/gym/[gymNumber] (detalle de gimnasio)
│   ├── Información del líder
│   ├── Variantes de equipo
│   ├── Registrar batalla
│   └── Notas de estrategia
│
└── /settings (configuración de usuario)
```

## 🎯 Flujo de Usuario

### 1. Crear Nuevo Run

```typescript
// Formulario de creación
interface CreateRunForm {
  runName: string;
  gameMode: 'classic' | 'complete' | 'radical';
  selectedRules: string[]; // IDs de reglas seleccionadas
}

// Ejemplo de reglas seleccionadas
const selectedRules = [
  'dupes_clause',
  'shiny_clause',
  'level_cap'
];
```

### 2. Registrar Encuentro

```typescript
interface RegisterEncounterForm {
  routeId: string;
  pokemonName: string;
  pokemonLevel: number;
  nickname: string;
  status: 'caught' | 'dead'; // Capturado o murió en la captura
  isShiny: boolean;
  notes?: string;
}
```

### 3. Gestionar Equipo

- Máximo 6 Pokemon en el equipo
- Drag & drop para reordenar
- Toggle para agregar/quitar del equipo
- Marcar como muerto (automáticamente sale del equipo)

### 4. Registrar Batalla de Gimnasio

```typescript
interface RegisterGymBattleForm {
  gymNumber: number;
  leaderName: string;
  variantUsed: string;
  status: 'won' | 'lost';
  casualties: number; // Número de Pokemon que murieron
  casualtiesList: string[]; // IDs de encounters que murieron
  attempts: number;
  notes?: string;
}
```

## 🎨 Componentes UI Principales

### RunCard
- Muestra resumen de un run
- Nombre, modo, estadísticas
- Botón para continuar

### PokemonCard
- Sprite del Pokemon
- Nombre/Apodo
- Nivel, estado (vivo/muerto)
- Indicador de shiny
- Badge de equipo actual

### RouteCard
- Nombre de la ruta
- Lista de Pokemon disponibles (según modo)
- Estado (sin capturar/capturado)
- Pokemon capturado si existe

### GymLeaderCard
- Nombre del líder
- Número de gimnasio
- Estado (pendiente/ganado/perdido)
- Preview del equipo

### TeamDisplay
- Grid de 6 slots para equipo
- Drag & drop para reordenar
- Pokemon cards en cada slot

### EncountersList
- Lista filtrable de todos los encuentros
- Por ruta, por estado, por equipo
- Búsqueda por nombre

## 📊 Estadísticas del Dashboard

```typescript
interface RunStats {
  // Básicas
  totalCaptures: number;
  totalDeaths: number;
  gymsDefeated: number;

  // Calculadas
  survivalRate: number; // (vivos / capturas) * 100
  currentTeamSize: number;
  routesExplored: number;
  totalBattles: number;

  // Por tipo
  typeDistribution: {
    [type: string]: number;
  };
}
```

## 🎨 Paleta de Colores (Tema Pokemon)

```css
:root {
  /* Principales */
  --pokemon-red: #EE1515;
  --pokemon-blue: #3B4CCA;
  --pokemon-yellow: #FFD700;

  /* Estados */
  --status-alive: #10b981; /* green-500 */
  --status-dead: #ef4444;  /* red-500 */
  --status-boxed: #6b7280; /* gray-500 */

  /* Modos */
  --mode-classic: #8b5cf6; /* purple-500 */
  --mode-complete: #3b82f6; /* blue-500 */
  --mode-radical: #ef4444;  /* red-500 */

  /* Tipos */
  --type-fire: #F08030;
  --type-water: #6890F0;
  --type-grass: #78C850;
  --type-electric: #F8D030;
  /* etc... */
}
```

## 🚀 Stack Técnico Final

```typescript
// Frontend
{
  "framework": "Next.js 14 (App Router)",
  "language": "TypeScript",
  "styling": "Tailwind CSS",
  "components": "shadcn/ui",
  "state": "Zustand",
  "forms": "React Hook Form + Zod",
  "icons": "Lucide React"
}

// Backend
{
  "database": "Supabase (PostgreSQL)",
  "auth": "Supabase Auth",
  "storage": "Supabase Storage (para sprites)",
  "realtime": "Supabase Realtime (opcional)"
}

// Deployment
{
  "frontend": "Vercel",
  "database": "Supabase Cloud",
  "cost": "$0/mes"
}
```

## 📦 Estructura de Archivos del Proyecto

```
pokemon-anil-nuzlocke/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/page.tsx
│   │   ├── runs/
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       ├── routes/
│   │   │       │   ├── page.tsx
│   │   │       │   └── [routeId]/page.tsx
│   │   │       └── gym/
│   │   │           └── [gymNumber]/page.tsx
│   │   └── settings/page.tsx
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── ui/ (shadcn)
│   ├── RunCard.tsx
│   ├── PokemonCard.tsx
│   ├── RouteCard.tsx
│   ├── GymLeaderCard.tsx
│   ├── TeamDisplay.tsx
│   ├── EncountersList.tsx
│   └── Navbar.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── queries.ts
│   ├── data/
│   │   ├── encounters.ts
│   │   ├── gymLeaders.ts
│   │   ├── routes.ts
│   │   └── rules.ts
│   ├── hooks/
│   │   ├── useRuns.ts
│   │   ├── useEncounters.ts
│   │   └── useGymBattles.ts
│   └── utils.ts
│
├── types/
│   └── index.ts
│
├── game_data/ (datos extraídos)
│   ├── encounters.json
│   ├── gym_leaders.json
│   ├── maps.json
│   └── nuzlocke_rules.json
│
├── public/
│   └── sprites/ (imágenes de Pokemon)
│
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
│
├── .env.local
├── next.config.js
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## ✅ Checklist de Implementación

### Fase 1: Setup (1 día)
- [ ] Inicializar proyecto Next.js + TypeScript
- [ ] Instalar dependencias (Tailwind, shadcn/ui, Supabase)
- [ ] Configurar Supabase (crear proyecto)
- [ ] Crear esquema de base de datos
- [ ] Configurar autenticación

### Fase 2: Autenticación (1-2 días)
- [ ] Páginas de login/registro
- [ ] Middleware de protección de rutas
- [ ] Layout de dashboard autenticado

### Fase 3: CRUD de Runs (2-3 días)
- [ ] Dashboard principal
- [ ] Crear nuevo run (formulario con modos y reglas)
- [ ] Ver detalle de run
- [ ] Editar/eliminar run

### Fase 4: Sistema de Encuentros (3-4 días)
- [ ] Lista de rutas disponibles (con filtro por modo)
- [ ] Detalle de ruta con Pokemon disponibles
- [ ] Formulario de registro de encuentro
- [ ] Lista de encuentros del run
- [ ] Filtros y búsqueda

### Fase 5: Equipo Actual (2-3 días)
- [ ] Vista de equipo (6 slots)
- [ ] Agregar/quitar Pokemon del equipo
- [ ] Reordenar equipo (drag & drop)
- [ ] Marcar Pokemon como muerto

### Fase 6: Gimnasios (2-3 días)
- [ ] Lista de gimnasios
- [ ] Detalle de gimnasio con variantes
- [ ] Registrar batalla
- [ ] Ver historial de batallas

### Fase 7: Estadísticas y Polish (2-3 días)
- [ ] Dashboard con estadísticas
- [ ] Cementerio (Pokemon muertos)
- [ ] Exportar/importar run (JSON)
- [ ] Modo oscuro
- [ ] Responsive design

## 🎮 Reglas de Nuzlocke Implementadas

### Reglas Básicas (Siempre Activas)
✅ Solo primer Pokemon por ruta
✅ Pokemon debilitado = muerto
✅ Apodos obligatorios

### Reglas Opcionales (Configurables)
- Dupes Clause
- Shiny Clause
- Level Cap
- No Items in Battle
- Set Mode
- No Overleveling
- Species Clause

## 💰 Costo Total

**$0/mes** para 4-5 usuarios:
- Vercel: Gratis
- Supabase: Gratis (500MB DB + Auth)
- Dominio: $10-15/año (opcional)

---

**Tiempo estimado total:** 4-6 semanas
**Complejidad:** Media
**Costo:** Gratis
