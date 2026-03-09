# Pokemon Añil Nuzlocke Tracker - Progreso

## ✅ Completado

### 1. Análisis del Repositorio nuzlocke.app
- Stack identificado: SvelteKit + Tailwind CSS
- Arquitectura: SPA sin backend (localStorage)
- **Limitación:** No soporta múltiples usuarios

### 2. Extracción de Datos del Juego
✅ **Script creado:** `extract_game_data.py`

**Datos extraídos:**
- ✅ **63 rutas/zonas** con encuentros de Pokemon
- ✅ **24 variantes de líderes** (8 gimnasios x 3 versiones cada uno)
- ✅ **217 mapas** con metadatos

**Archivos generados en `/game_data/`:**
```
├── encounters.json      # Rutas con Pokemon disponibles
├── gym_leaders.json     # Líderes de gimnasio con equipos
└── maps.json           # Nombres de mapas y zonas
```

### 3. Estructura de Datos

**Encuentros (`encounters.json`):**
```json
{
  "id": "003",
  "name": "Ruta 1",
  "pokemon": [
    {
      "name": "PIDGEY",
      "min_level": 3,
      "max_level": 5
    }
  ]
}
```

**Líderes (`gym_leaders.json`):**
```json
{
  "gym_number": 1,
  "name": "Brock",
  "team": [
    {
      "name": "ONIX",
      "level": 14
    }
  ],
  "quote": "¡Me has dejado de piedra!"
}
```

## 📊 Estadísticas del Juego

- **63 zonas de captura** (rutas, bosques, cuevas, etc.)
- **8 líderes de gimnasio principales** (Kanto)
- **8 líderes adicionales** (Hoenn)
- **3 variantes por líder** (normal, dificultad, megaevolución)
- **~200+ Pokemon únicos** disponibles

## 🎯 Próximos Pasos

### Fase 1: Configuración del Proyecto
1. [ ] Decidir stack final (Next.js recomendado)
2. [ ] Inicializar proyecto con TypeScript
3. [ ] Configurar Supabase (DB gratuita)
4. [ ] Configurar Tailwind CSS

### Fase 2: Base de Datos
1. [ ] Crear esquema de DB en Supabase
2. [ ] Importar datos del juego (rutas, líderes)
3. [ ] Configurar Row Level Security (RLS)
4. [ ] Setup de autenticación

### Fase 3: MVP - Funcionalidad Básica
1. [ ] Sistema de login/registro
2. [ ] Dashboard de usuario
3. [ ] Crear nuevo run de Nuzlocke
4. [ ] Listar rutas disponibles
5. [ ] Registrar encuentros y capturas
6. [ ] Ver equipo actual
7. [ ] Marcar Pokemon como vivo/muerto

### Fase 4: Features Avanzadas
1. [ ] Tracker de líderes de gimnasio
2. [ ] Sistema de notas por encuentro
3. [ ] Apodos para Pokemon
4. [ ] Estadísticas del run
5. [ ] Historial de runs completados

## 💾 Estructura de DB Propuesta

```sql
-- Usuarios (manejado por Supabase Auth)
users (
  id uuid PRIMARY KEY,
  email text,
  username text
)

-- Partidas/Runs
nuzlocke_runs (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  run_name text,
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now()
)

-- Encuentros registrados
encounters (
  id uuid PRIMARY KEY,
  run_id uuid REFERENCES nuzlocke_runs(id),
  route_id text, -- referencia a encounters.json
  pokemon_name text,
  pokemon_level integer,
  nickname text,
  status text, -- 'caught', 'dead', 'alive', 'boxed'
  is_in_team boolean DEFAULT false,
  caught_at timestamp DEFAULT now()
)

-- Batallas de gimnasio
gym_battles (
  id uuid PRIMARY KEY,
  run_id uuid REFERENCES nuzlocke_runs(id),
  gym_number integer,
  leader_name text,
  status text, -- 'pending', 'won', 'lost'
  casualties integer DEFAULT 0,
  notes text,
  completed_at timestamp
)
```

## 🛠️ Stack Tecnológico Final

```
Frontend:
├── Next.js 14 (App Router)
├── TypeScript
├── Tailwind CSS
├── Shadcn/ui (componentes)
└── Zustand (estado global)

Backend/DB:
├── Supabase (PostgreSQL)
├── Supabase Auth
└── Supabase Realtime (opcional)

Deployment:
└── Vercel (FREE)

Costo Total: $0/mes
```

## 📝 Notas

- Pokemon Añil tiene **3 variantes de cada líder** (equipos diferentes)
- Hay líderes de **Kanto** (8) y **Hoenn** (8)
- El juego incluye Pokemon de hasta Gen 9
- Soporte para **Megaevoluciones**

## 🎮 Reglas de Nuzlocke a Implementar

**Reglas básicas:**
1. Solo puedes capturar el **primer Pokemon** de cada ruta
2. Si un Pokemon se debilita, se considera **muerto** (hay que liberarlo/boxearlo)
3. Debes **apodar** a todos los Pokemon capturados

**Reglas opcionales (configurables):**
- Dupes Clause: Permite re-rolear si ya tienes ese Pokemon
- Shiny Clause: Siempre puedes capturar Shinies
- Set Mode: No cambiar Pokemon cuando el rival va a sacar uno nuevo
- No usar ítems en combate
- Límite de nivel por gimnasio

## 🚀 ¿Listo para Empezar?

Ya tenemos todos los datos del juego. El siguiente paso es:
1. **Inicializar el proyecto Next.js**
2. **Configurar Supabase**
3. **Crear la base de datos**
4. **Empezar con el MVP**

¿Quieres que empiece con la configuración del proyecto?
