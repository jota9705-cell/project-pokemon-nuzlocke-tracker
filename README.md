# 🎮 Pokemon Añil Nuzlocke Tracker

Aplicación web para rastrear partidas Nuzlocke del fangame Pokemon Añil, con soporte para múltiples usuarios simultáneos.

## ✨ Características Implementadas

- ✅ **Autenticación de usuarios** con Supabase Auth
- ✅ **3 modos de juego** (Clásico, Completo, Radical)
- ✅ **Reglas configurables** (3 básicas + 8 opcionales)
- ✅ **63 rutas** con encuentros de Pokemon
- ✅ **16 líderes de gimnasio** con variantes
- ✅ **Gestión de equipo** (6 slots, añadir/remover/boxear)
- ✅ **Tipos de adquisición** (Captura, Regalo, Intercambio)
- ✅ **Sistema de Revival Tokens** (1 por gimnasio derrotado)
- ✅ **Estadísticas automáticas** (capturas, muertes, supervivencia)
- ✅ **Cementerio** con función de revival
- 📱 **Responsive design**

## 🛠️ Stack Tecnológico

```
Frontend:  Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
Backend:   Supabase (PostgreSQL + Auth)
Deploy:    Vercel
Costo:     $0/mes (gratis)
```

## 📁 Archivos del Proyecto

```
📂 game_data/           # Datos extraídos del juego
  ├── encounters.json       # 63 rutas con Pokemon (ambos modos)
  ├── gym_leaders.json      # 16 líderes con variantes
  ├── maps.json            # 217 mapas/zonas
  └── nuzlocke_rules.json  # Reglas configurables

📄 PLAN.md              # Plan original del proyecto
📄 DESIGN.md            # Diseño completo (DB, UI, flujos)
📄 PROGRESS.md          # Progreso actual
📄 extract_game_data.py # Script de extracción de datos
```

## 🎯 Datos Extraídos

### Encuentros por Ruta
- **Modo Clásico:** Pokemon tradicionales (Gen 1-2)
- **Modo Completo:** Todos los Pokemon (Gen 1-9)

**Ejemplo: Ruta 1**
- Clásico: PIDGEY, LEDYBA, RATTATA, MAREEP (4)
- Completo: BIDOOF, FLABEBE, LITLEO, STARLY, PATRAT + más (9)

### Líderes de Gimnasio
- **8 líderes de Kanto** (Brock, Misty, Surge, etc.)
- **8 líderes de Hoenn** (Norman, Candela, Alana, etc.)
- **3 variantes por líder** (diferentes equipos)

### Reglas de Nuzlocke

**Básicas (obligatorias):**
1. ✅ Solo primer Pokemon por ruta
2. ✅ Pokemon debilitado = muerto
3. ✅ Apodos obligatorios

**Opcionales:**
- Dupes Clause (re-rolear duplicados)
- Shiny Clause (siempre capturar shinies)
- Level Cap (no superar nivel del próximo líder)
- No Items in Battle
- Set Mode
- Species Clause
- Y más...

## 🗄️ Base de Datos

```sql
Tables:
├── nuzlocke_runs       # Partidas de usuario
├── encounters          # Pokemon capturados/encontrados
├── gym_battles         # Batallas de gimnasio
└── battle_logs         # Historial de combates
```

**Features de DB:**
- Row Level Security (RLS) - Cada usuario solo ve sus datos
- Triggers automáticos para estadísticas
- Soft deletes para historial

## 🚀 Estado del Proyecto

### ✅ Completado
1. ✅ Setup del proyecto Next.js + Supabase
2. ✅ Autenticación de usuarios
3. ✅ CRUD de runs (crear, ver, eliminar)
4. ✅ Sistema de encuentros y capturas
5. ✅ Tipos de adquisición (wild/gift/trade)
6. ✅ Gestión de equipo (6 Pokemon max)
7. ✅ Tracker de gimnasios (16 líderes)
8. ✅ Sistema de Revival Tokens
9. ✅ Estadísticas y dashboard
10. ✅ Triggers automáticos para contadores

### 📋 Backlog (Futuras mejoras)
- [ ] Drag & drop para reordenar equipo
- [ ] Editar encuentros existentes
- [ ] Filtros y búsqueda avanzada
- [ ] Exportar/Importar runs
- [ ] Estadísticas globales de todos los runs

## 🚀 Instalación y Setup

### 1. Variables de Entorno
Crea un archivo `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Ejecutar migraciones en Supabase
Ve a SQL Editor en tu dashboard de Supabase y ejecuta en orden:
1. `001_initial_schema.sql`
2. `002_add_revival_support.sql`
3. `003_fix_gym_battles.sql`
4. `004_add_acquisition_method.sql`
5. `005_auto_grant_revival_tokens.sql`

### 4. Desarrollo local
```bash
npm run dev
```

## 📦 Deployment a Vercel

1. Push del código a GitHub
2. Importar proyecto en Vercel
3. Configurar variables de entorno en Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy automático

## 💰 Hosting Gratis

- ✅ **Vercel** - Frontend (gratis)
- ✅ **Supabase** - DB + Auth (gratis hasta 500MB)
- ✅ **4-5 usuarios simultáneos** - Sin problema

## 📚 Documentación

- **PLAN.md** - Plan inicial y análisis de nuzlocke.app
- **DESIGN.md** - Diseño completo (DB, UI, componentes, flujos)
- **PROGRESS.md** - Progreso y estadísticas del juego

## 🎮 Pokemon Añil

Fangame español basado en Pokemon Essentials (RPG Maker).
- Incluye Pokemon de Gen 1-9
- 3 modos de juego
- Megaevoluciones
- Historia original

---

**Estado:** ✅ **Proyecto Completado y Funcional**
**Listo para:** Deployment a producción en Vercel
