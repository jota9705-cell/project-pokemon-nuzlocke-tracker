# ⚡ Quick Start - 15 Minutos

## 🎯 De cero a app corriendo en 15 minutos

### Paso 1: Instalar Node.js (5 min)

```bash
# macOS
brew install node

# Verificar
node --version  # Debe ser v18+
npm --version   # Debe ser v9+
```

---

### Paso 2: Instalar Dependencias (3 min)

```bash
# Desde la carpeta del proyecto
npm install
```

**Espera a que termine...** ☕

---

### Paso 3: Configurar Supabase (7 min)

#### 3.1 Crear cuenta y proyecto (3 min)
1. Ve a: https://supabase.com
2. Sign up (con GitHub o Email)
3. Click "New Project"
4. Llena:
   - **Name:** `pokemon-anil-nuzlocke`
   - **Password:** (guárdala)
   - **Region:** South America (o más cercana)
5. Click "Create new project"
6. ⏳ Espera 1-2 minutos...

#### 3.2 Obtener credenciales (1 min)
1. En el proyecto, ve a: **Settings** → **API**
2. Copia estos 2 valores:
   - `Project URL`
   - `anon public` (en Project API keys)

#### 3.3 Configurar variables de entorno (30 seg)
```bash
# Copiar plantilla
cp .env.local.example .env.local

# Editar el archivo
# Pega tus credenciales de Supabase
```

Tu `.env.local` debe verse así:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### 3.4 Crear tablas (2 min)
1. En Supabase, ve a: **SQL Editor**
2. Click "New query"
3. Abre el archivo: `supabase/migrations/001_initial_schema.sql`
4. Copia TODO el contenido (Cmd+A, Cmd+C)
5. Pégalo en el editor de Supabase (Cmd+V)
6. Click "Run" (esquina inferior derecha)
7. ✅ Deberías ver: "Success. No rows returned"

**Verificar:** Ve a **Table Editor**, deberías ver 4 tablas:
- `nuzlocke_runs`
- `encounters`
- `gym_battles`
- `battle_logs`

---

### Paso 4: Ejecutar la App (10 seg)

```bash
npm run dev
```

Abre: **http://localhost:3000**

---

## 🎉 ¡LISTO!

Deberías ver la landing page del Pokemon Añil Nuzlocke Tracker.

---

## 🧪 Probar que Funciona

### Prueba 1: Landing page ✅
- Ve a http://localhost:3000
- Deberías ver el título y botones

### Prueba 2: Login page ✅
- Click en "Iniciar Sesión"
- Deberías ver el formulario de login

### Prueba 3: Register page ✅
- Click en "Registrarse"
- Deberías ver el formulario de registro

---

## 🔧 Si Algo Sale Mal

### Error: "npm: command not found"
👉 Node.js no está instalado
```bash
brew install node
```

### Error: "Cannot find module..."
👉 Dependencias no instaladas
```bash
rm -rf node_modules
npm install
```

### Error de Supabase
👉 Verifica `.env.local`
- Las credenciales deben ser correctas
- No debe haber espacios extra
- El archivo debe llamarse `.env.local` (no `.txt`)

### La página no carga
```bash
# Asegúrate de que el servidor esté corriendo
npm run dev

# Debería mostrar:
# ▲ Next.js 14.x.x
# - Local: http://localhost:3000
```

---

## 📱 Capturas de Pantalla Esperadas

### 1. Landing Page
```
┌────────────────────────────────┐
│     Pokemon Añil               │
│   Nuzlocke Tracker             │
│                                │
│  [Iniciar Sesión] [Registrar] │
│                                │
│  🎮 3 Modos | 📍 63 Rutas      │
└────────────────────────────────┘
```

### 2. Login Page
```
┌────────────────────────────────┐
│      Iniciar Sesión            │
│                                │
│  Email: [____________]         │
│  Pass:  [____________]         │
│                                │
│      [Entrar]                  │
│                                │
│  ¿No tienes cuenta? Regístrate │
└────────────────────────────────┘
```

---

## 🎯 Siguiente Paso

Una vez que veas la app corriendo, dime y continuaremos con:

1. **Implementar autenticación funcional**
   - Login real
   - Registro de usuarios
   - Sesiones persistentes

2. **Dashboard de usuario**
   - Ver lista de runs
   - Crear nuevo run
   - Estadísticas

3. **Y más...**

---

## 📊 Comandos Útiles

```bash
# Desarrollo (con hot reload)
npm run dev

# Build de producción
npm run build

# Ejecutar build
npm run start

# Verificar tipos TypeScript
npm run type-check

# Linter
npm run lint
```

---

## ✨ Cheat Sheet

```bash
# Si algo no funciona, reset completo:
rm -rf node_modules .next
npm install
npm run dev
```

---

**Tiempo total:** ~15 minutos
**Dificultad:** 🟢 Fácil
**Costo:** $0

¡Disfruta! 🎮
