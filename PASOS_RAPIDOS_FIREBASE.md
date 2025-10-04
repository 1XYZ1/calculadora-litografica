# ⚡ Configuración Rápida de Firebase (2 minutos)

## 🔥 Paso 1: Habilitar Google Authentication (30 segundos)

1. Ve a: https://console.firebase.google.com/
2. Selecciona tu proyecto
3. Click en **Authentication** (menú izquierdo)
4. Click en **Sign-in method**
5. Click en **Google**
6. Activa el switch **Enable**
7. Selecciona tu email en "Project support email"
8. Click **Save**

✅ **¡Listo!** Google Auth está habilitado

---

## 🔐 Paso 2: Configurar Reglas de Seguridad (1 minuto)

1. Click en **Firestore Database** (menú izquierdo)
2. Click en la pestaña **Rules**
3. **Copia y pega** esto (reemplaza todo):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /artifacts/{appId}/public/data/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    match /artifacts/{appId}/users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

4. Click **Publish**

✅ **¡Listo!** Base de datos protegida

---

## 📝 Paso 3: Variables de Entorno (30 segundos)

Tu archivo `.env` ya debería tener esto:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_APP_ID=default-app-id
```

Si no lo tienes, ve a **Project Settings** (⚙️) → **General** → Copia los valores de "Your apps"

✅ **¡Listo!** Configuración completa

---

## 🚀 Paso 4: Probar (10 segundos)

```bash
npm run dev
```

Abre: http://localhost:5173

1. Click "Comenzar"
2. Click "Continuar con Google"
3. Selecciona tu cuenta
4. **¡Ya estás dentro!** 🎉

---

## 🎯 Checklist Rápido

- [ ] Google Auth habilitado en Firebase
- [ ] Reglas de Firestore publicadas
- [ ] Variables de entorno configuradas
- [ ] Aplicación corriendo (`npm run dev`)
- [ ] Login funciona

---

## ⚠️ Si algo no funciona:

### Error: "popup-blocked"

**Solución**: Permite ventanas emergentes en tu navegador para localhost

### Error: "unauthorized-domain"

**Solución**: Ve a Authentication → Settings → Authorized domains → Agrega tu dominio

### Error: "operation-not-allowed"

**Solución**: Verifica que Google esté habilitado en Authentication → Sign-in method

### No veo mis datos

**Solución**: Verifica que las reglas de Firestore estén publicadas

---

## 📸 Capturas de Referencia

### Authentication → Sign-in method

```
┌─────────────────────────────────┐
│ Sign-in providers               │
├─────────────────────────────────┤
│ ⚪ Email/Password                │
│ 🔵 Google         [Enabled]     │ ← Debe estar así
│ ⚪ Facebook                      │
│ ⚪ Twitter                       │
└─────────────────────────────────┘
```

### Firestore → Rules (después de publicar)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /artifacts/{appId}/public/data/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    ...
}

Status: ✅ Published
```

---

## 🎉 ¡Eso es todo!

En menos de 3 minutos tu aplicación debe estar funcionando con autenticación de Google.

**¿Tienes problemas?** Revisa `CONFIGURACION_GOOGLE_AUTH.md` para guía detallada.
