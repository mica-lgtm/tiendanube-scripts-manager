# Editor de Scripts TiendaNube

MVP de un editor de scripts completo para gestionar CSS, HTML y JavaScript en tiendas TiendaNube.

## 🚀 Stack Tecnológico

- **Frontend**: Next.js 14 + TypeScript + TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Auth**: NextAuth.js
- **Editor**: Monaco Editor
- **State**: Zustand
- **Notifications**: React Hot Toast

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── api/          # API routes
│   ├── auth/         # Auth pages
│   ├── dashboard/    # Dashboard
│   └── layout.tsx    # Root layout
├── components/       # React components
├── lib/              # Utilities & clients
├── store/            # Zustand store
└── types/            # TypeScript types
```

## 🔧 Setup Rápido

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Supabase

Ver `SUPABASE_SETUP.md` para instrucciones completas.

### 3. Variables de entorno

Crear `.env.local` (ver `.env.example`):

```bash
cp .env.example .env.local
# Editar con tus valores
```

### 4. Ejecutar desarrollo

```bash
npm run dev
```

Abrir http://localhost:3000

## 🧪 Testing

**Login de prueba:**
- Email: `micaela@zasdigital.com`
- Password: `test`

## 📚 Documentación

- `SUPABASE_SETUP.md` - Setup de base de datos
- `README.md` - Este archivo

## ✅ Features

- ✓ Autenticación NextAuth
- ✓ Dashboard de tiendas
- ✓ Editor de código (Monaco)
- ✓ Preview en vivo
- ✓ Versionado de scripts
- ✓ Deploy a TiendaNube
- ✓ Audit log

## 🚀 Deploy

```bash
vercel deploy
```
