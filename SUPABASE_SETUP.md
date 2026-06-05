# Supabase Setup Guide

## 1. Create Supabase Project

1. Go to https://supabase.com
2. Create a new project
3. Copy your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Get your `SUPABASE_SERVICE_KEY` from Project Settings > API

## 2. Run SQL Schema

Copy and paste the entire SQL script below into your Supabase SQL Editor, then run it.

```sql
-- 1. TABLA: USUARIOS
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  role TEXT DEFAULT 'editor',
  stores_access TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. TABLA: TIENDAS
CREATE TABLE stores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  store_id INTEGER NOT NULL UNIQUE,
  api_token TEXT NOT NULL,
  api_url TEXT DEFAULT 'https://api.tiendanube.com/v1',
  owner_id UUID NOT NULL REFERENCES users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. TABLA: SCRIPTS
CREATE TABLE scripts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  script_type TEXT NOT NULL,
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  version INTEGER DEFAULT 1,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deployed_at TIMESTAMP
);

-- 4. TABLA: VERSIONES (Historial)
CREATE TABLE script_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  script_id UUID NOT NULL REFERENCES scripts(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  content TEXT NOT NULL,
  changes_description TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  deployed_to_production BOOLEAN DEFAULT false,
  deployment_timestamp TIMESTAMP
);

-- 5. TABLA: AUDITORÍA
CREATE TABLE audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID REFERENCES stores(id),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  details JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- 6. TABLA: PERFILES (Presets reutilizables)
CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  scripts_json JSONB NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_scripts_store_id ON scripts(store_id);
CREATE INDEX idx_scripts_active ON scripts(is_active);
CREATE INDEX idx_versions_script_id ON script_versions(script_id);
CREATE INDEX idx_audit_store_id ON audit_log(store_id);
CREATE INDEX idx_audit_timestamp ON audit_log(timestamp);

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE script_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can see their own data"
  ON users FOR SELECT
  USING (auth.uid()::TEXT = id::TEXT OR auth.role() = 'authenticated');

CREATE POLICY "Users can see stores they have access to"
  ON stores FOR SELECT
  USING (owner_id = auth.uid() OR auth.role() = 'authenticated');

CREATE POLICY "Users can see scripts from their stores"
  ON scripts FOR SELECT
  USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));

-- Actualizar timestamps automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scripts_updated_at BEFORE UPDATE ON scripts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 3. Insert Test Data

```sql
-- Insertar usuario de test
INSERT INTO users (email, name, role)
VALUES ('micaela@zasdigital.com', 'Micaela', 'admin');

-- Insertar tienda Simona
INSERT INTO stores (name, store_id, api_token, owner_id, is_active)
VALUES (
  'Simona',
  4669331,
  'Bearer eyJ...',
  (SELECT id FROM users WHERE email = 'micaela@zasdigital.com'),
  true
);
```

## 4. Environment Variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_KEY=eyJxxx...
TIENDANUBE_API_URL=https://api.tiendanube.com/v1
TIENDANUBE_STORE_ID=4669331
TIENDANUBE_TOKEN=Bearer eyJ...
TIENDANUBE_USER_AGENT=ScriptManager
GITHUB_TOKEN=ghp_...
GITHUB_REPO=mica-lgtm/tiendanube-scripts
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3000
```

## 5. Start Development Server

```bash
npm run dev
```

Visit: http://localhost:3000
