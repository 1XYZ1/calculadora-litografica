# 🔐 Variables de Entorno

## Configuración Requerida

Crea un archivo `.env` en la raíz de tu proyecto con las siguientes variables:

```bash
# ====================================
# FIREBASE CONFIGURATION
# ====================================
# Configuración de Firebase (Firestore + Auth)
VITE_FIREBASE_API_KEY=tu_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# App ID y token de autenticación inicial (opcional)
VITE_APP_ID=default-app-id
VITE_INITIAL_AUTH_TOKEN=

# ====================================
# MinIO STORAGE CONFIGURATION
# ====================================
# Configuración de MinIO en Railway para almacenamiento de PDFs

# Región (dejar como us-east-1 para MinIO)
VITE_STORAGE_REGION=us-east-1

# URL del endpoint de MinIO en Railway
# Ejemplo: https://tu-minio-production-xxxx.railway.app
VITE_STORAGE_ENDPOINT=https://tu-minio.railway.app

# Credenciales de acceso de MinIO
# Estas las obtienes al crear un Service Account en MinIO Console
VITE_STORAGE_ACCESS_KEY_ID=tu_access_key_de_minio
VITE_STORAGE_SECRET_ACCESS_KEY=tu_secret_key_de_minio

# Nombre del bucket donde se guardarán los PDFs
VITE_STORAGE_BUCKET_NAME=litografia-pdfs

# URL pública base para acceder a los archivos
# Generalmente es la misma que VITE_STORAGE_ENDPOINT
VITE_STORAGE_PUBLIC_URL=https://tu-minio.railway.app
```

## 📝 Notas Importantes

1. **Nunca subas el archivo `.env` a Git** - Ya está en `.gitignore`
2. **Para producción**, agrega estas variables en:
   - **Vercel:** Dashboard → Settings → Environment Variables
   - **Railway:** Servicio → Variables
3. **Las URLs de MinIO** no deben tener barra al final
4. **Las credenciales de MinIO** las obtienes en MinIO Console → Identity → Service Accounts

## ✅ Verificar Configuración

Abre la consola del navegador al iniciar la app. Deberías ver:

```
✅ Configuración de MinIO storage verificada correctamente
```

Si ves un error, verifica que todas las variables estén configuradas correctamente.
