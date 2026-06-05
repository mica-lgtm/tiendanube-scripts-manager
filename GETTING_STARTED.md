# 🚀 Guía de Inicio Rápido

## Paso 1: Setup Inicial (5 minutos)

### 1.1 Clonar y configurar

```bash
# Ya estás en el directorio del proyecto
npm install
```

### 1.2 Crear `.env.local`

```bash
# Copiar template
cp .env.example .env.local
```

Editar `.env.local` con tus valores:
- `NEXT_PUBLIC_SUPABASE_URL` - De Supabase Project > Settings > API
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Anon key
- `SUPABASE_SERVICE_KEY` - Service role key
- `NEXTAUTH_SECRET` - Generar con: `openssl rand -base64 32`
- Mantener los demás como están por ahora

## Paso 2: Configurar Supabase (10 minutos)

**Ver `SUPABASE_SETUP.md` para instrucciones detalladas**

### Resumen:
1. Ir a https://supabase.com
2. Crear nuevo proyecto
3. Copiar credentials a `.env.local`
4. Ejecutar el SQL script en Supabase SQL Editor
5. Insertar datos de prueba

## Paso 3: Ejecutar en desarrollo (2 minutos)

```bash
npm run dev
```

Abrir http://localhost:3000

## Paso 4: Login de Prueba (1 minuto)

En la pantalla de login:
- **Email**: micaela@zasdigital.com
- **Password**: test
- Click "Iniciar sesión"

Si funciona, verás el dashboard con "Simona" store.

## Paso 5: Crear y Editar Script (5 minutos)

1. Click en "Simona" tienda
2. Click en "Editor" en el sidebar
3. Debería haber un script de prueba
4. Edita el CSS/HTML/JS en los tabs
5. Click "Guardar" para guardarlo
6. Click "Preview" para ver cambios en vivo

## Paso 6: Deploy a TiendaNube (Opcional)

Para testear deploy a TiendaNube:

1. Editar `.env.local` con tus credenciales reales:
   ```env
   TIENDANUBE_STORE_ID=tu_store_id
   TIENDANUBE_TOKEN=tu_token
   ```

2. En el editor, click "Deploy"

3. Confirmar cuando te pida

4. Si funciona, deberías ver el script en tu tienda

## 📚 Archivos Importantes

| Archivo | Descripción |
|---------|------------|
| `.env.example` | Template de variables de entorno |
| `SUPABASE_SETUP.md` | Setup detallado de la BD |
| `package.json` | Dependencies y scripts |
| `src/app/page.tsx` | Home (redirige a login/dashboard) |
| `src/app/auth/login/page.tsx` | Página de login |
| `src/app/dashboard/page.tsx` | Dashboard de tiendas |
| `src/app/dashboard/[storeId]/editor/page.tsx` | Editor de scripts |
| `src/lib/auth.ts` | Configuración de NextAuth |

## 🔧 Comandos Útiles

```bash
# Development
npm run dev

# Build
npm run build

# Type checking
npx tsc --noEmit

# Lint
npm run lint
```

## 🆘 Common Issues

### "Unauthorized" en login
- Verificar que el usuario está en tabla `users`
- Revisar env vars de Supabase

### "Connection refused" en Supabase
- Verificar URL y keys en `.env.local`
- Asegurar que Supabase project está activo

### Monaco editor no carga
- Verificar que `@monaco-editor/react` está instalado
- Check browser console para errores

### Deploy falla a TiendaNube
- Verificar token de TiendaNube en BD
- Revisar audit_log para errores

## ✅ Checklist de Verificación

- [ ] Proyecto clonado
- [ ] Dependencies instaladas (`npm install`)
- [ ] `.env.local` creado con credenciales
- [ ] Supabase project creado y configurado
- [ ] SQL schema ejecutado en Supabase
- [ ] Usuario y tienda de prueba creados
- [ ] `npm run dev` funciona sin errores
- [ ] Puedo logearme
- [ ] Veo el dashboard
- [ ] Puedo editar un script
- [ ] Preview funciona

## 📞 Next Steps

1. **Entender la estructura**: Revisar el código en `src/`
2. **Conectar a tienda real**: Actualizar env vars con credenciales reales
3. **Testing completo**: Seguir checklist en `README.md`
4. **Deployment**: Seguir `DEPLOYMENT.md` (próximo documento)

---

**¡Listo! Ahora tienes un editor de scripts funcional para TiendaNube 🎉**
