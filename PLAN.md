# Pokemon Añil Nuzlocke Tracker - Plan de Desarrollo

## 📋 Resumen del Proyecto

Aplicación web para rastrear partidas Nuzlocke de Pokemon Añil con soporte para 4-5 usuarios simultáneos.

## 🔍 Análisis de nuzlocke.app

**Stack identificado:**
- **Frontend:** SvelteKit + Tailwind CSS
- **Bundler:** Vite
- **Hosting:** Vercel (gratis)
- **Arquitectura:** SPA (Single Page Application) sin backend
- **Almacenamiento:** LocalStorage (navegador)

**Limitación importante:** nuzlocke.app NO tiene sistema multi-usuario. Solo funciona localmente en el navegador.

## 🎯 Diferencias para tu Proyecto

Para soportar 4-5 usuarios simultáneos, necesitas agregar:
1. **Base de datos en la nube** (no solo localStorage)
2. **Autenticación de usuarios**
3. **Sincronización en tiempo real** (opcional pero recomendado)

## 🏗️ Arquitectura Propuesta

### Stack Tecnológico Recomendado

```
Frontend:
├── Next.js 14 (App Router) o SvelteKit
├── TypeScript
├── Tailwind CSS
└── Zustand/Context API (manejo de estado)

Backend/Database:
├── Supabase (PostgreSQL + Auth + Realtime)
│   └── Plan GRATIS: 500MB DB, 2GB storage, 50K usuarios/mes
│   └── Autenticación incluida
│   └── Row Level Security para privacidad
└── Alternativa: Firebase (Firestore + Auth)

Hosting:
└── Vercel (GRATIS para proyectos personales)
```

### 💰 Costos Estimados

**Para 4-5 usuarios: $0/mes**

- ✅ Vercel: Gratis (100GB bandwidth/mes)
- ✅ Supabase: Gratis (más que suficiente para 5 usuarios)
- ✅ Dominio custom: $10-15/año (opcional)

**Total: GRATIS** (excepto dominio opcional)

## 📊 Base de Datos - Estructura

```sql
-- Tabla de usuarios
users (
  id uuid PRIMARY KEY,
  email text,
  username text,
  created_at timestamp
)

-- Tabla de partidas/runs
nuzlocke_runs (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  run_name text,
  is_active boolean,
  created_at timestamp
)

-- Tabla de encuentros por ruta
encounters (
  id uuid PRIMARY KEY,
  run_id uuid REFERENCES nuzlocke_runs(id),
  route_name text,
  pokemon_name text,
  pokemon_level integer,
  is_caught boolean,
  status text, -- 'alive', 'dead', 'boxed'
  nickname text,
  created_at timestamp
)

-- Tabla de equipo actual
team (
  id uuid PRIMARY KEY,
  run_id uuid REFERENCES nuzlocke_runs(id),
  encounter_id uuid REFERENCES encounters(id),
  position integer, -- 1-6
  created_at timestamp
)

-- Tabla de batallas importantes
boss_battles (
  id uuid PRIMARY KEY,
  run_id uuid REFERENCES nuzlocke_runs(id),
  boss_name text,
  status text, -- 'pending', 'won', 'lost'
  casualties integer,
  notes text,
  created_at timestamp
)
```

## 🎮 Funcionalidades Principales

### Fase 1 - MVP (2-3 semanas)
- [ ] Autenticación de usuarios (email/password)
- [ ] Crear/iniciar un nuevo run de Nuzlocke
- [ ] Lista de rutas de Pokemon Añil
- [ ] Registrar encuentros por ruta (solo 1 captura por ruta)
- [ ] Marcar Pokemon como capturado/muerto
- [ ] Ver equipo actual (máximo 6)
- [ ] Dashboard personal

### Fase 2 - Características Avanzadas (2-3 semanas)
- [ ] Lista de combates importantes (Líderes, Equipo Rocket, etc.)
- [ ] Preparación para batallas (sugerencias de equipo)
- [ ] Estadísticas del run (capturas, muertes, tasa de éxito)
- [ ] Apodos personalizados para Pokemon
- [ ] Notas por encuentro/batalla
- [ ] Historial de runs anteriores

### Fase 3 - Extras (1-2 semanas)
- [ ] Exportar/importar runs (JSON)
- [ ] Modo oscuro
- [ ] Filtros y búsqueda
- [ ] Calculadora de tipos
- [ ] Visualización de stats del Pokemon

## 📁 Estructura de Proyecto Propuesta

```
pokemon-anil-nuzlocke/
├── app/                    # Next.js App Router
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── runs/
│   │   ├── encounters/
│   │   ├── team/
│   │   └── battles/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                 # Componentes reutilizables
│   ├── RunCard.tsx
│   ├── EncounterList.tsx
│   ├── TeamDisplay.tsx
│   └── BattleTracker.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── queries.ts
│   ├── data/
│   │   ├── routes.ts       # Rutas de Pokemon Añil
│   │   ├── pokemon.ts      # Datos de Pokemon
│   │   └── bosses.ts       # Batallas importantes
│   └── utils.ts
├── types/
│   └── index.ts
├── public/
│   └── pokemon-sprites/    # Imágenes de Pokemon
├── supabase/
│   └── migrations/         # Migraciones de DB
├── package.json
└── next.config.js
```

## 🚀 Pasos Siguientes

1. **Decidir stack:** ¿Next.js o SvelteKit?
2. **Crear cuenta en Supabase** (gratis)
3. **Recopilar datos de Pokemon Añil:**
   - Lista de rutas y zonas
   - Pokemon disponibles por zona
   - Batallas importantes (líderes, etc.)
4. **Iniciar proyecto base**
5. **Configurar base de datos**
6. **Desarrollar por fases**

## 🎨 Inspiración de Diseño

Basándote en nuzlocke.app pero con:
- Dashboard más moderno
- Navegación lateral para múltiples runs
- Cards para Pokemon con sprites
- Código de colores por estado (vivo/muerto/boxeado)

## ⏱️ Estimación de Tiempo

- **MVP funcional:** 2-3 semanas
- **Versión completa:** 4-6 semanas
- **Pulido y deployment:** 1 semana

**Total:** 5-7 semanas (trabajando tiempo parcial)

## 📝 Notas Adicionales

- Pokemon Añil es un fangame español, necesitarás recopilar los datos manualmente
- Considera agregar reglas customizables de Nuzlocke (hard mode, dupes clause, etc.)
- La sincronización en tiempo real de Supabase permite ver actualizaciones de otros usuarios instantáneamente
