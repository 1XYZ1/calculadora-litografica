# 🔐 Configuración de Autenticación con Google

## Pasos para configurar en Firebase Console

### 1. Habilitar Google Authentication

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a **Authentication** en el menú lateral
4. Click en **Sign-in method** (Método de inicio de sesión)
5. En la lista de proveedores, busca **Google**
6. Click en **Google** y luego en **Enable** (Habilitar)
7. Selecciona un **Project support email** (tu email)
8. Click en **Save** (Guardar)

### 2. Configurar dominios autorizados (opcional pero recomendado)

1. En la misma sección de **Authentication**
2. Ve a la pestaña **Settings** (Configuración)
3. Busca **Authorized domains** (Dominios autorizados)
4. Por defecto ya están:
   - `localhost` (para desarrollo)
   - `tu-proyecto.firebaseapp.com`
   - `tu-proyecto.web.app`
5. Si vas a usar un dominio personalizado, agrégalo aquí

### 3. Actualizar Reglas de Firestore (Importante para seguridad)

1. Ve a **Firestore Database** en el menú lateral
2. Click en la pestaña **Rules** (Reglas)
3. Reemplaza las reglas existentes con:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Reglas para datos públicos (precios, configuraciones)
    // Solo usuarios autenticados pueden leer
    match /artifacts/{appId}/public/data/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }

    // Reglas para datos de usuarios (cotizaciones)
    // Solo el dueño puede leer/escribir sus propios datos
    match /artifacts/{appId}/users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Denegar todo lo demás
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

4. Click en **Publish** (Publicar)

### 4. Verificar variables de entorno

Asegúrate de que tu archivo `.env` o `.env.local` tenga todas las variables necesarias:

```env
VITE_FIREBASE_API_KEY=tu-api-key
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu-sender-id
VITE_FIREBASE_APP_ID=tu-app-id
VITE_APP_ID=default-app-id
```

## ✅ Características Implementadas

### UI/UX

- ✨ Login minimalista y elegante
- 🎨 Diseño moderno con gradientes
- 📱 Totalmente responsive
- ⚡ Animaciones suaves
- 🖼️ Muestra foto de perfil de Google
- 🎯 Botón de Google con logo oficial

### Funcionalidad

- 🔐 Autenticación solo con Google
- 👤 Información de usuario (nombre, foto, email)
- 🔄 Cierre de sesión
- 🛡️ Protección de rutas (sin login no hay acceso)
- 📊 Cada usuario ve solo sus datos
- ⚠️ Manejo de errores en español

### Seguridad

- 🔒 Reglas de Firestore por usuario
- 🔑 Autenticación requerida para todas las operaciones
- 🚫 Datos públicos solo para usuarios autenticados
- ✅ Aislamiento de datos entre usuarios

## 🚀 Probar la Aplicación

1. Ejecuta el proyecto:

```bash
npm run dev
```

2. Abre el navegador en `http://localhost:5173`

3. Haz click en "Comenzar" o "Iniciar Sesión"

4. Selecciona tu cuenta de Google

5. ¡Listo! Ya puedes usar la aplicación

## 🐛 Problemas Comunes

### Error: "popup-blocked"

**Solución**: Permite ventanas emergentes en tu navegador para localhost

### Error: "unauthorized-domain"

**Solución**: Agrega tu dominio en Firebase Console → Authentication → Settings → Authorized domains

### Error: "auth/operation-not-allowed"

**Solución**: Verifica que Google esté habilitado en Firebase Console → Authentication → Sign-in method

### No se muestran datos

**Solución**: Verifica que las reglas de Firestore estén publicadas correctamente

## 📝 Notas Adicionales

- El primer usuario que se registre podrá crear cotizaciones inmediatamente
- Cada usuario tiene su propio espacio aislado en Firestore
- Los datos de precios son compartidos entre todos los usuarios autenticados
- La foto de perfil se obtiene automáticamente de Google
- El sistema detecta automáticamente si el usuario ya está autenticado

## 🎉 ¡Todo listo!

Una vez configurado Firebase, tu aplicación estará completamente funcional con autenticación segura de Google.
