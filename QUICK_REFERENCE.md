# 🚀 Quick Reference - TiendaNube Scripts Manager

## Right Now

✅ **Server running**: http://localhost:3000  
✅ **All components**: Created and functional  
✅ **All APIs**: Implemented and working  
✅ **Documentation**: Complete  

---

## 🎯 Immediate Actions

### 1. Verify It Works (30 seconds)
```bash
# Open in browser
http://localhost:3000

# Should redirect to login
# Should show: Email + Password form
```

### 2. Test Login (1 minute)
```
Email: micaela@zasdigital.com
Password: test
```
✓ Should login and redirect to dashboard

### 3. What You Get
- Dashboard showing stores (currently empty)
- Store details page
- **Script Editor** with:
  - Monaco code editor (CSS/HTML/JS tabs)
  - Live preview in iframe
  - Save functionality
  - Deploy button

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Home with auth redirect |
| `src/app/auth/login/page.tsx` | Login form |
| `src/app/dashboard/page.tsx` | Store listing |
| `src/app/dashboard/[storeId]/editor/page.tsx` | **Script editor** |
| `src/components/ScriptEditor.tsx` | Editor with Monaco |
| `src/components/Preview.tsx` | Live iframe preview |
| `src/app/api/scripts/route.ts` | Script CRUD |
| `src/app/api/scripts/[id]/route.ts` | Update + versioning |

---

## 🔧 Available Commands

```bash
# Development
npm run dev          # Already running

# Build & Check
npm run build        # Production build
npx tsc --noEmit    # Type check

# Lint
npm run lint        # ESLint

# Stop server
pkill -f "npm run dev"
```

---

## 📊 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/auth/signin` | Login |
| `GET` | `/api/stores` | Get user's stores |
| `POST` | `/api/stores` | Create store |
| `GET` | `/api/scripts?storeId=<id>` | List scripts |
| `POST` | `/api/scripts` | Create script |
| `PUT` | `/api/scripts/<id>` | Update script |
| `POST` | `/api/tiendanube/deploy` | Deploy script |

---

## 🔐 Environment Variables

**Already configured in `.env.local`:**
- ✓ `NEXT_PUBLIC_SUPABASE_URL`
- ✓ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✓ `SUPABASE_SERVICE_KEY`
- ✓ `NEXTAUTH_SECRET`
- ✓ `TIENDANUBE_TOKEN`

**Don't commit `.env.local` to git!**

---

## 🗄️ Database Status

✅ Supabase connected  
✅ SQL schema ready (see `SUPABASE_SETUP.md`)  
✅ Tables: users, stores, scripts, script_versions, audit_log, profiles  
✅ RLS (Row Level Security) enabled  

**Need to run SQL?**  
→ See `SUPABASE_SETUP.md`

---

## 📚 Documentation Files

```
IMPLEMENTATION_STATUS.md  ← What's complete
GETTING_STARTED.md        ← Step-by-step setup
SUPABASE_SETUP.md         ← Database SQL
QUICK_REFERENCE.md        ← This file
README.md                 ← Project overview
```

---

## 🎨 UI Components Ready

✅ Login page  
✅ Dashboard with store cards  
✅ Store details page  
✅ **Full-featured script editor:**
  - Monaco editor with syntax highlighting
  - 3 tabs (CSS/HTML/JavaScript)
  - Live preview in iframe
  - Save button (creates versions)
  - Deploy button
  - Error notifications  

---

## 🚀 Test the Editor

```
1. Open http://localhost:3000
2. Login with: micaela@zasdigital.com / test
3. Click on a store (or create one)
4. Go to Editor tab
5. Start editing!
```

**In the editor:**
- Type CSS in "CSS" tab
- Type HTML in "HTML" tab  
- Type JavaScript in "JS" tab
- Click "Preview" button to see live render
- Click "Save" to save changes (creates version)
- Click "Deploy" to deploy to TiendaNube

---

## 🔍 Project Structure

```
src/
├── app/
│   ├── api/              ← 5 API routes
│   ├── auth/             ← Login page
│   ├── dashboard/        ← Store/editor pages
│   ├── layout.tsx        ← Root layout
│   └── page.tsx          ← Home redirect
├── components/           ← 4 React components
├── lib/                  ← 3 utility modules
├── store/                ← Zustand state
└── types/                ← TypeScript interfaces
```

---

## ✅ What's Implemented

- [x] Authentication (NextAuth.js)
- [x] Login/Register flow
- [x] Protected API routes
- [x] Dashboard with stores
- [x] Script editor with Monaco
- [x] Live preview
- [x] Save & versioning
- [x] Deploy to TiendaNube
- [x] Supabase integration
- [x] Type-safe code
- [x] Beautiful UI (TailwindCSS)
- [x] Error handling
- [x] Responsive design

---

## 📋 Testing Workflow

1. **Open browser**: http://localhost:3000
2. **Test Auth**: Login with test credentials
3. **View Stores**: Dashboard should load
4. **Create Store** (optional): Add a test store
5. **Create Script**: Add a test script
6. **Test Editor**: Edit CSS/HTML/JS
7. **Test Preview**: Click Preview button
8. **Test Save**: Click Save button
9. **Test Deploy**: Click Deploy button (needs TiendaNube creds)

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Page won't load | Restart server: `npm run dev` |
| Login fails | Check Supabase users table |
| Editor not loading | Check Monaco editor import |
| Preview blank | Check HTML/JS syntax |
| Save fails | Check API response in dev console |
| Deploy fails | Check TiendaNube token in env |

---

## 📞 Support Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **NextAuth Docs**: https://next-auth.js.org
- **Monaco Editor**: https://microsoft.github.io/monaco-editor/
- **TailwindCSS**: https://tailwindcss.com/docs

---

## 🎉 You're All Set!

The complete TiendaNube Scripts Manager is ready to use.

**Next steps:**
1. ✓ Open http://localhost:3000 and explore
2. ✓ Test the login and editor
3. ✓ Create test data
4. ✓ When ready, deploy to Vercel

**For detailed guides:**
- See `GETTING_STARTED.md` for step-by-step setup
- See `IMPLEMENTATION_STATUS.md` for what's implemented
- See `SUPABASE_SETUP.md` for database configuration

---

**Happy Coding! 🚀**
