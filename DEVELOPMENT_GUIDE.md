# 👨‍💻 Guía de Desarrollo - TiendaNube Scripts Manager

**Última actualización:** 5 de Junio, 2026

---

## 🚀 Quick Start para Nuevas Sesiones

```bash
# 1. Ir al directorio
cd /Users/mica/tiendanube-scripts-manager

# 2. Instalar dependencias (si es primera vez)
npm install

# 3. Iniciar servidor de desarrollo
npm run dev

# 4. Abrir en navegador
# http://localhost:3000

# 5. Login con:
# Email: micaela@zasdigital.com
# Password: test
```

---

## 📁 Estructura del Proyecto

```
tiendanube-scripts-manager/
├── src/
│   ├── app/
│   │   ├── api/                    # Rutas API
│   │   │   ├── auth/[...nextauth]/ # NextAuth
│   │   │   ├── scripts/            # CRUD scripts
│   │   │   │   ├── route.ts        # GET list, POST create
│   │   │   │   └── [id]/route.ts   # GET detail, PUT update
│   │   │   ├── stores/             # CRUD stores
│   │   │   └── tiendanube/         # Deploy a TiendaNube
│   │   ├── auth/                   # Login page
│   │   ├── dashboard/              # Main dashboard
│   │   │   ├── page.tsx            # Dashboard (lista tiendas)
│   │   │   └── [storeId]/
│   │   │       ├── page.tsx        # Redirect to editor
│   │   │       └── editor/
│   │   │           └── page.tsx    # Editor (orquesta componentes)
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Home (redirect)
│   │   ├── globals.css             # Global styles
│   │   └── providers.tsx           # NextAuth + Toast providers
│   ├── components/
│   │   ├── UnifiedScriptEditor.tsx # Editor principal ⭐
│   │   ├── EditorSelection.tsx     # 3 tarjetas ⭐
│   │   ├── EnhancedVersionHistory.tsx # Historial ⭐
│   │   ├── Preview.tsx             # Preview iframe
│   │   ├── ScriptEditor.tsx        # (DEPRECATED - usar Unified)
│   │   ├── VersionHistory.tsx      # (DEPRECATED - usar Enhanced)
│   │   └── Providers.tsx           # Providers wrapper
│   ├── lib/
│   │   ├── supabase.ts             # Supabase clients
│   │   ├── auth.ts                 # NextAuth config
│   │   └── tiendanube.ts           # TiendaNube API
│   ├── store/
│   │   └── appStore.ts             # Zustand state
│   └── types/
│       └── index.ts                # TypeScript interfaces
├── public/                         # Static files
├── .env.local                      # Environment vars (GITIGNORE)
├── .env.example                    # Env template
├── next.config.ts                  # Next.js config
├── tsconfig.json                   # TypeScript config
├── tailwind.config.ts              # Tailwind config
├── package.json                    # Dependencies
├── SESSION_SUMMARY.md              # ← Resumen de esta sesión
├── DEVELOPMENT_GUIDE.md            # ← Este archivo
├── IMPLEMENTATION_STATUS.md        # Status de features
└── filtro-talle-mejorado.html      # Componente HTML extra
```

---

## 🎯 Componentes Principales

### 1. **UnifiedScriptEditor.tsx** ⭐

**Ubicación:** `src/components/UnifiedScriptEditor.tsx`

**Props:**
```typescript
interface UnifiedScriptEditorProps {
  scriptId: string;                    // ID del script
  storeId: string;                     // ID de la tienda
  initialContent: string;              // Contenido inicial
  scriptName: string;                  // Nombre del script
  scriptType: 'home' | 'product-list' | 'product-page';
  onSave: (content: string) => Promise<void>;
  onDeploy: () => Promise<void>;
  onBack: () => void;
  onShowHistory: () => void;
}
```

**Características:**
- Editor Monaco con syntax highlighting
- Preview en vivo (toggle)
- Contador de líneas
- Botones: Guardar, Deploy, Ver Historial, Volver
- Loading states
- Error handling

**Mejoras posibles:**
- Agregar word wrap por defecto
- Autocomplete/suggestions
- Syntax error detection
- Export a archivo

---

### 2. **EditorSelection.tsx** ⭐

**Ubicación:** `src/components/EditorSelection.tsx`

**Props:**
```typescript
interface EditorSelectionProps {
  onSelect: (type: 'home' | 'product-list' | 'product-page') => void;
  onBack: () => void;
}
```

**Características:**
- 3 tarjetas bonitas con gradientes
- Hover effects elegantes
- Iconos grandes
- Info útil en footer
- Responsive

**Mejoras posibles:**
- Agregar más secciones (header, footer, etc)
- Mostrar cantidad de cambios sin guardar
- Thumbnails del contenido actual
- Search/filter si hay muchas secciones

---

### 3. **EnhancedVersionHistory.tsx** ⭐

**Ubicación:** `src/components/EnhancedVersionHistory.tsx`

**Props:**
```typescript
interface EnhancedVersionHistoryProps {
  versions: Version[];
  currentScriptName: string;
  onRevert: (versionId: string) => Promise<void>;
  onBack: () => void;
}
```

**Características:**
- Lista de versiones con timestamps
- Preview del contenido
- Botón revert (deshacer)
- Muestra cambios relativos (ej: "hace 2 horas")
- Split-view design

**Mejoras posibles:**
- Diff view (mostrar qué cambió)
- Comparar dos versiones
- Add description/message al guardar
- Tags o marcadores para versiones importantes
- Bulk delete old versions

---

## 🔌 API Endpoints

### Scripts

#### `GET /api/scripts?storeId=<storeId>`
Obtiene lista de scripts de una tienda

**Response:**
```json
[
  {
    "id": "uuid",
    "store_id": "uuid",
    "name": "Home Page",
    "script_type": "html",
    "content": "...",
    "created_at": "2026-06-05T...",
    "updated_at": "2026-06-05T...",
    ...
  }
]
```

---

#### `POST /api/scripts`
Crea un nuevo script

**Body:**
```json
{
  "name": "Home Page",
  "script_type": "html",
  "content": "",
  "storeId": "uuid",
  "description": "Página de Inicio"
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Home Page",
  ...
}
```

---

#### `GET /api/scripts/<id>`
Obtiene script con sus versiones

**Response:**
```json
{
  "id": "uuid",
  "name": "Home Page",
  "content": "...",
  "versions": [
    {
      "id": "uuid",
      "created_at": "2026-06-05T...",
      "changes_description": "Actualización de Home Page",
      "content": "..."
    }
  ]
}
```

---

#### `PUT /api/scripts/<id>`
Actualiza script (crea nueva versión)

**Body:**
```json
{
  "content": "nuevo contenido",
  "description": "Actualización de Home Page"
}
```

**Response:**
```json
{
  "script": { ... },
  "version": { ... }
}
```

---

### Otros

- `POST /api/auth/signin` - Login
- `POST /api/auth/signout` - Logout
- `GET /api/auth/session` - Get session
- `GET /api/stores` - List tiendas
- `POST /api/tiendanube/deploy` - Deploy a TiendaNube

---

## 🗄️ Base de Datos (Supabase)

### Tablas Principales

**users**
```sql
id, email, name, role, created_at, updated_at
```

**stores**
```sql
id, name, store_id, api_token, api_url, 
owner_id (FK users), is_active, created_at, updated_at
```

**scripts**
```sql
id, store_id (FK stores), name, script_type, 
content, version, is_active, created_by (FK users),
created_at, updated_at, deployed_at
```

**script_versions**
```sql
id, script_id (FK scripts), version_number, content,
changes_description, created_by (FK users), created_at,
deployed_to_production, deployment_timestamp
```

**audit_log**
```sql
id, store_id (FK stores), user_id (FK users),
action, details, timestamp
```

---

## 🔐 RLS (Row Level Security)

Todas las tablas tienen RLS habilitado:
- `users`: Solo puede ver su propia data
- `stores`: Solo puede ver sus propias tiendas
- `scripts`: Solo puede ver scripts de sus tiendas
- `script_versions`: Solo puede ver versiones de sus scripts

**Nota:** Los API routes usan `supabaseServer` (service key) que bypasea RLS

---

## 📚 Flujos Principales

### Flow 1: Editar un Script

```
1. Usuario navega a /dashboard/<storeId>/editor
2. Editor page carga scripts de la tienda
3. Si no hay scripts → createDefaultScripts()
4. Muestra EditorSelection (3 tarjetas)
5. Usuario elige un tipo → handleSelectType()
6. Carga script + versiones → GET /api/scripts/:id
7. Muestra UnifiedScriptEditor
8. Usuario edita código
9. Click Guardar → handleSaveScript()
10. PUT /api/scripts/:id (crea nueva versión)
11. Muestra toast de éxito
```

### Flow 2: Ver Historial

```
1. Usuario en editor hace click "Ver Historial"
2. setView('history')
3. Muestra EnhancedVersionHistory
4. Lista de versiones + preview
5. Click en versión → muestra contenido
6. Click "Deshacer" → handleRevertVersion()
7. PUT /api/scripts/:id con contenido antiguo
8. Vuelve a editor
```

### Flow 3: Deploy

```
1. Usuario en editor hace click "Deploy"
2. Confirmation dialog
3. POST /api/tiendanube/deploy
4. Hace backup automático (nueva versión)
5. Envía código a TiendaNube
6. Toast de éxito/error
```

---

## 🐛 Debugging

### Server Logs
```bash
# Ver logs en tiempo real
tail -f .next/dev/logs/next-development.log

# O en la terminal donde corre npm run dev
```

### Browser Console
- Abierto automáticamente con F12
- Ver requests en Network tab
- Ver errors en Console tab

### Supabase Logs
- SQL queries: Supabase Dashboard → Logs
- RLS issues: Check auth_jwt claims
- Connection issues: Check credentials en .env.local

---

## 🧪 Testing

```bash
# TypeScript check
npx tsc --noEmit

# Build
npm run build

# Lint
npm run lint

# Dev server
npm run dev
```

---

## 🎨 Customización

### Cambiar Colores

Los colores principales están en:
- `src/components/UnifiedScriptEditor.tsx` (líneas con `bg-blue-*`)
- `src/components/EditorSelection.tsx` (colores gradient)
- `src/app/dashboard/page.tsx` (dashboard cards)

Buscar y reemplazar:
- `#3b82f6` → otro azul
- `#2563eb` → otro azul oscuro
- `text-white` → otro color texto

### Cambiar Iconos

Vienen de `lucide-react`:
```typescript
import { ChevronLeft, Save, Eye, Code } from 'lucide-react';
```

Otras opciones: ArrowLeft, Download, Settings, etc.

### Cambiar Textos

Buscar en archivos:
- "Guardar Cambios" → tu texto
- "Historial" → tu texto
- "¡Encontralo en el talle ideal para vos!" → tu texto (filtro)

---

## 📦 Dependencias Importantes

```json
{
  "next": "16.2.7",           // Framework
  "react": "19.2.4",          // UI Library
  "typescript": "^5",         // Type safety
  "@monaco-editor/react": "^4.7.0",  // Code editor
  "next-auth": "^4.24.14",    // Authentication
  "@supabase/supabase-js": "^2.107.0",  // Database
  "tailwindcss": "^4",        // Styling
  "lucide-react": "latest",   // Icons (NUEVO)
  "zustand": "^5.0.14",       // State management
  "react-hot-toast": "^2.6.0", // Notifications
  "date-fns": "^4.4.0"        // Date formatting
}
```

---

## 🚀 Deploy a Producción

```bash
# Build
npm run build

# Verificar
npm start

# Si todo OK, deploy a Vercel
vercel deploy --prod
```

**Variables de entorno necesarias en Vercel:**
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_KEY
- NEXTAUTH_SECRET
- NEXTAUTH_URL
- TIENDANUBE_TOKEN

---

## ⚠️ Problemas Comunes

### Error: "Failed to fetch versions: 403"
- Verificar RLS policies en Supabase
- Verificar SUPABASE_SERVICE_KEY en .env.local
- Revisar GET /api/scripts/:id en logs

### Error: "Script not found"
- Verificar que el script existe en BD
- Verificar que store_id es correcto
- Check RLS allows access

### Editor no muestra content
- Verificar que initialContent está siendo pasado
- Check network tab para GET /api/scripts/:id
- Verificar Monaco editor está compilado (no SSR)

### Preview no funciona
- Check iframe sandbox attributes
- Verificar content tiene HTML válido
- Test en firefox si hay issues en chrome

---

## 📝 Conventions

### Naming
- Componentes: PascalCase (`UnifiedScriptEditor.tsx`)
- Funciones: camelCase (`handleSaveScript`)
- Constants: UPPER_SNAKE_CASE (`DEFAULT_TIMEOUT`)
- Files: kebab-case (`unified-editor.tsx`) o PascalCase (componentes)

### Imports
```typescript
// Absolute imports (configured in tsconfig)
import { UnifiedScriptEditor } from '@/components/UnifiedScriptEditor';
import { Script } from '@/types';

// No relative imports
import { UnifiedScriptEditor } from '../../../components/UnifiedScriptEditor';
```

### Error Handling
```typescript
try {
  await operation();
  toast.success('Éxito');
} catch (error) {
  console.error('Context:', error);
  toast.error('Error message');
}
```

---

## 🎯 Checklist para Nuevas Features

- [ ] Crear componente si es UI
- [ ] Crear API route si necesita backend
- [ ] Agregar types en `src/types/index.ts`
- [ ] Type-check: `npx tsc --noEmit`
- [ ] Test manualmente
- [ ] Verificar responsive
- [ ] Update SESSION_SUMMARY.md si es feature grande

---

## 🔗 Enlaces Útiles

- **Supabase Dashboard:** https://app.supabase.com
- **NextAuth Docs:** https://next-auth.js.org
- **Monaco Editor Docs:** https://microsoft.github.io/monaco-editor
- **TailwindCSS Docs:** https://tailwindcss.com
- **React Docs:** https://react.dev
- **TypeScript:** https://www.typescriptlang.org

---

## 📞 Contacto

Para dudas sobre el desarrollo:
1. Revisar este documento (DEVELOPMENT_GUIDE.md)
2. Revisar SESSION_SUMMARY.md
3. Leer comentarios en el código
4. Check logs del servidor

---

**Creado:** 5 de Junio, 2026  
**Última actualización:** 5 de Junio, 2026  
**Status:** ✅ Listo para desarrollo
