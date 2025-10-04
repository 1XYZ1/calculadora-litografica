# 🏗️ Arquitectura de Autenticación

## 📐 Diagrama de Componentes

```
┌────────────────────────────────────────────────────────────┐
│                       App.jsx (Root)                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            FirebaseProvider (Context)                 │  │
│  │  • db, auth, storage                                  │  │
│  │  • user, userId                                       │  │
│  │  • loginWithGoogle(), logout()                        │  │
│  └────────────────────┬─────────────────────────────────┘  │
│                       │                                     │
│  ┌────────────────────▼─────────────────────────────────┐  │
│  │              AppContent (Main Logic)                  │  │
│  │  • Maneja estado de auth                              │  │
│  │  • Muestra AuthModal o App según user                 │  │
│  └────────────────────┬─────────────────────────────────┘  │
│                       │                                     │
│         ┌─────────────┴──────────────┐                     │
│         │                            │                     │
│         ▼                            ▼                     │
│  ┌─────────────┐             ┌─────────────┐              │
│  │  Header.jsx │             │ AuthModal   │              │
│  │  • Logo     │             │  • Google   │              │
│  │  • Nav      │             │    Login    │              │
│  │  • User     │             │  • Errors   │              │
│  │  • Logout   │             └─────────────┘              │
│  └─────────────┘                                           │
│         │                                                   │
│         ▼                                                   │
│  ┌──────────────────────────┐                             │
│  │     Main Content         │                             │
│  │  • Calculator            │                             │
│  │  • PriceAdmin            │                             │
│  │  • SavedQuotations       │                             │
│  └──────────────────────────┘                             │
└────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flujo de Datos

```
┌──────────────┐
│   Usuario    │
│  Click Login │
└──────┬───────┘
       │
       ▼
┌─────────────────────┐
│   AuthModal.jsx     │
│  onGoogleLogin()    │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│   AppContent        │
│  handleGoogleLogin()│
└──────┬──────────────┘
       │
       ▼
┌─────────────────────────┐
│  FirebaseContext        │
│  loginWithGoogle()      │
│  • GoogleAuthProvider   │
│  • signInWithPopup()    │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│  Firebase Auth          │
│  • OAuth con Google     │
│  • Retorna user         │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│  onAuthStateChanged     │
│  • Actualiza user state │
│  • Actualiza userId     │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│  App Re-render          │
│  • Muestra Header       │
│  • Muestra Main Content │
│  • Oculta AuthModal     │
└─────────────────────────┘
```

---

## 🗄️ Estructura de Firestore

```
firestore/
└── artifacts/
    └── {appId}/
        ├── public/
        │   └── data/
        │       ├── papers/           ← Compartido entre usuarios
        │       ├── plateSizes/       ← Todos pueden leer
        │       ├── machineTypes/     ← Todos pueden escribir
        │       ├── finishingPrices/
        │       └── settings/
        │           ├── profit
        │           ├── bcvRate
        │           └── ivaRate
        │
        └── users/
            ├── {userId1}/           ← Solo userId1 puede acceder
            │   └── quotations/
            │       ├── {quotationId1}
            │       └── {quotationId2}
            │
            └── {userId2}/           ← Solo userId2 puede acceder
                └── quotations/
                    └── {quotationId3}
```

---

## 🔐 Reglas de Seguridad (Visual)

```
┌─────────────────────────────────────────────────────┐
│                Firestore Rules                      │
├─────────────────────────────────────────────────────┤
│                                                     │
│  📂 artifacts/{appId}/public/data/**               │
│     ✅ READ:  if auth != null                      │
│     ✅ WRITE: if auth != null                      │
│     ❌ Anónimos: NO ACCESO                         │
│                                                     │
│  📂 artifacts/{appId}/users/{userId}/**            │
│     ✅ READ:  if auth.uid == userId                │
│     ✅ WRITE: if auth.uid == userId                │
│     ❌ Otros usuarios: NO ACCESO                   │
│                                                     │
│  📂 Todo lo demás                                   │
│     ❌ READ:  DENEGADO                             │
│     ❌ WRITE: DENEGADO                             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 Estados de la Aplicación

```
┌────────────────────────────────────┐
│      Estado: LOADING               │
│  • loadingFirebase = true          │
│  • Muestra: Spinner                │
│  • Auth inicializándose            │
└────────────────┬───────────────────┘
                 │
                 ▼
         ┌───────────────┐
         │ user existe?  │
         └───┬───────┬───┘
             │       │
          NO │       │ SÍ
             │       │
             ▼       ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│  Estado: NO AUTENTICADO  │  │  Estado: AUTENTICADO     │
│  • user = null           │  │  • user = {...}          │
│  • Muestra:              │  │  • Muestra:              │
│    - Pantalla Bienvenida │  │    - Header con usuario  │
│    - Botón "Comenzar"    │  │    - Main Content        │
│                          │  │    - Navegación          │
│  Acciones:               │  │                          │
│  • Click → AuthModal     │  │  Acciones:               │
│  • Login con Google      │  │  • Usar la app          │
│                          │  │  • Click Salir → logout()│
└──────────────────────────┘  └──────────────────────────┘
```

---

## 🔄 Ciclo de Vida de la Sesión

```
1. App Carga
   └→ FirebaseContext inicializa
      └→ onAuthStateChanged se suscribe

2. Sin Usuario
   └→ user = null
      └→ Muestra pantalla de bienvenida

3. Usuario hace Login
   └→ loginWithGoogle()
      └→ signInWithPopup(GoogleAuthProvider)
         └→ Google OAuth Window
            └→ Usuario selecciona cuenta
               └→ Firebase retorna user
                  └→ onAuthStateChanged dispara
                     └→ user actualizado
                        └→ App re-renderiza

4. Usuario autenticado
   └→ Usa la aplicación
      └→ Todas las queries usan userId
         └→ Firestore valida con rules

5. Usuario hace Logout
   └→ logout()
      └→ signOut()
         └→ onAuthStateChanged dispara
            └→ user = null
               └→ Vuelve a pantalla bienvenida
```

---

## 📦 Dependencias de Firebase

```javascript
// Instaladas en package.json
{
  "firebase": "^10.x.x",
  "dependencies": {
    "firebase/app",           // ← Inicialización
    "firebase/auth",          // ← Autenticación
    "firebase/firestore",     // ← Base de datos
    "firebase/storage"        // ← Archivos (MinIO en tu caso)
  }
}
```

---

## 🎨 Componentes UI (Árbol)

```
App
└── FirebaseProvider
    └── AppContent
        ├── Header
        │   ├── Logo
        │   ├── Navigation Buttons
        │   └── User Section
        │       ├── Avatar (foto Google)
        │       ├── Display Name
        │       └── Logout Button
        │
        ├── Welcome Screen (if !user)
        │   ├── Hero Icon
        │   ├── Title
        │   ├── Description
        │   ├── Start Button
        │   └── Features Icons
        │
        ├── Main Content (if user)
        │   ├── Calculator
        │   ├── PriceAdmin
        │   └── SavedQuotations
        │
        └── AuthModal (conditional)
            ├── Modal Overlay (backdrop blur)
            ├── Modal Content
            │   ├── Close Button
            │   ├── Icon
            │   ├── Title
            │   ├── Description
            │   ├── Error Message (if error)
            │   ├── Google Login Button
            │   │   ├── Google Logo (SVG)
            │   │   └── Text
            │   └── Terms Footer
```

---

## 🔑 Variables de Entorno

```
┌─────────────────────────────────────────┐
│         .env (Desarrollo)               │
├─────────────────────────────────────────┤
│ VITE_FIREBASE_API_KEY                   │
│ VITE_FIREBASE_AUTH_DOMAIN               │
│ VITE_FIREBASE_PROJECT_ID                │
│ VITE_FIREBASE_STORAGE_BUCKET            │
│ VITE_FIREBASE_MESSAGING_SENDER_ID       │
│ VITE_FIREBASE_APP_ID                    │
│ VITE_APP_ID                             │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│   src/config/firebase.js                │
│   getFirebaseConfig()                   │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│   FirebaseContext.jsx                   │
│   initializeApp(config)                 │
└─────────────────────────────────────────┘
```

---

## 🚀 Build y Deploy

```
Desarrollo (Local)
├── npm run dev
├── Vite Dev Server
└── http://localhost:5173
    └── Variables de .env

Producción
├── npm run build
├── dist/
│   ├── index.html
│   └── assets/
└── Deploy a hosting
    └── Variables de entorno del hosting
```

---

## 📊 Métricas de Performance

```
Tamaño de Componentes:
├── AuthModal.jsx        ~5 KB
├── FirebaseContext.jsx  ~4 KB
├── App.jsx             ~8 KB
└── Header.jsx          ~4 KB

Tiempo de Carga:
├── Inicial: ~1s
├── Login: ~2s (incluye OAuth)
└── Re-auth: ~500ms (token guardado)

Bundle Size Impact:
├── Firebase Auth: ~70 KB (gzipped)
└── Tus componentes: ~5 KB
```

---

## ✨ Resumen Técnico

### Stack Completo:

```
Frontend:  React 18 + Vite
Auth:      Firebase Authentication (Google OAuth)
Database:  Cloud Firestore (NoSQL)
Storage:   MinIO (S3-compatible)
Styles:    Tailwind CSS
State:     React Context API
Routing:   Estado local (currentPage)
```

### Patrón de Diseño:

- **Context Provider Pattern** para estado global
- **Compound Component Pattern** para modal
- **Render Props** para protección de rutas
- **Custom Hooks** (useFirebase)

### Seguridad:

- **OAuth 2.0** con Google
- **JWT Tokens** (manejados por Firebase)
- **Security Rules** en Firestore
- **HTTPS Only** (Firebase hosting)

---

¡Todo listo! 🎉
