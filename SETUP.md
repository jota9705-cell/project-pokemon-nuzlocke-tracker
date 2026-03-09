# 🚀 Guía de Instalación y Setup

## Prerequisitos

Asegúrate de tener instalado:
- **Node.js 18+** (https://nodejs.org/)
- **npm** (viene con Node.js)

## Paso 1: Instalar Node.js

### macOS (usando Homebrew)
```bash
brew install node
```

### Verificar instalación
```bash
node --version  # Debe mostrar v18.x.x o superior
npm --version   # Debe mostrar 9.x.x o superior
```

## Paso 2: Instalar Dependencias

Una vez que Node.js esté instalado:

```bash
# Instalar todas las dependencias del proyecto
npm install
```

Esto instalará:
- Next.js 14
- TypeScript
- Tailwind CSS
- Supabase
- Y todas las demás dependencias

## Paso 3: Configurar Supabase

### 3.1 Crear proyecto en Supabase

1. Ve a https://supabase.com
2. Crea una cuenta (gratis)
3. Click en "New Project"
4. Configura:
   - **Name:** pokemon-anil-nuzlocke (o el que prefieras)
   - **Database Password:** (guárdala en un lugar seguro)
   - **Region:** Elige la más cercana (East US, South America, etc.)
5. Espera 1-2 minutos mientras se crea el proyecto

### 3.2 Obtener las credenciales

Una vez creado el proyecto:
1. Ve a **Settings** > **API**
2. Copia:
   - **Project URL** (algo como `https://xxxxx.supabase.co`)
   - **anon public** key
   - **service_role** key (en Service role > secret)

### 3.3 Configurar variables de entorno

```bash
# Copia el archivo de ejemplo
cp .env.local.example .env.local

# Edita .env.local y pega tus credenciales
```

Edita `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3.4 Ejecutar las migraciones de base de datos

#### Opción A: Desde el Dashboard de Supabase (Más fácil)

1. Ve a tu proyecto en Supabase
2. Click en **SQL Editor** en el menú lateral
3. Click en **New query**
4. Copia todo el contenido de `supabase/migrations/001_initial_schema.sql`
5. Pégalo en el editor
6. Click en **Run** (esquina inferior derecha)
7. ✅ Deberías ver "Success. No rows returned"

#### Opción B: Usando Supabase CLI (Avanzado)

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to proyecto
supabase link --project-ref tu-project-ref

# Ejecutar migraciones
supabase db push
```

### 3.5 Verificar que las tablas se crearon

1. En el dashboard de Supabase, ve a **Table Editor**
2. Deberías ver 4 tablas:
   - `nuzlocke_runs`
   - `encounters`
   - `gym_battles`
   - `battle_logs`

## Paso 4: Ejecutar el Proyecto

```bash
# Modo desarrollo
npm run dev
```

Abre http://localhost:3000 en tu navegador.

## Paso 5: Crear tu primera cuenta

1. Ve a http://localhost:3000
2. Click en "Registrarse"
3. Crea una cuenta con email y contraseña
4. ✅ ¡Listo! Ya puedes usar la app

## 🔧 Scripts Disponibles

```bash
npm run dev         # Modo desarrollo (con hot reload)
npm run build       # Build para producción
npm run start       # Ejecutar build de producción
npm run lint        # Ejecutar linter
npm run type-check  # Verificar tipos TypeScript
```

## 📁 Estructura del Proyecto

```
pokemon-anil-nuzlocke/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Páginas de autenticación
│   ├── (dashboard)/       # Páginas del dashboard
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página de inicio
├── components/            # Componentes reutilizables
├── lib/                   # Librerías y utilidades
│   ├── supabase/         # Cliente de Supabase
│   ├── data/             # Datos del juego
│   └── utils/            # Funciones utilitarias
├── types/                # Definiciones de TypeScript
├── game_data/            # Datos extraídos del juego
├── supabase/             # Migraciones de DB
└── public/               # Archivos estáticos
```

## 🐛 Solución de Problemas

### Error: "Module not found"
```bash
# Elimina node_modules y reinstala
rm -rf node_modules package-lock.json
npm install
```

### Error: Supabase connection failed
- Verifica que las credenciales en `.env.local` sean correctas
- Asegúrate de haber ejecutado las migraciones SQL
- Reinicia el servidor de desarrollo

### Error: Cannot find module '@/...'
- Asegúrate de que `tsconfig.json` tenga la configuración correcta de paths
- Reinicia el editor (VSCode, etc.)

## 📚 Próximos Pasos

Una vez que la app esté corriendo:

1. **Implementar autenticación funcional** (actualmente solo UI)
2. **Crear dashboard de usuario**
3. **Implementar CRUD de runs**
4. **Sistema de encuentros**
5. **Gestión de equipo**
6. **Tracker de gimnasios**

Ver **DESIGN.md** para el plan completo.

## 🆘 ¿Necesitas Ayuda?

- Revisa **DESIGN.md** para entender la arquitectura
- Lee **PROGRESS.md** para ver el estado actual
- Consulta la documentación de Next.js: https://nextjs.org/docs
- Documentación de Supabase: https://supabase.com/docs

---

**Estado Actual:** Setup básico completado ✅
**Siguiente:** Implementar autenticación funcional
