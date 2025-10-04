# ✅ Migración Completada: Firebase Storage → MinIO en Railway

## 🎉 ¡La migración se completó exitosamente!

Tu aplicación ahora usa **MinIO en Railway** para almacenar los PDFs en lugar de Firebase Storage.

---

## 📋 Resumen de Cambios

### ✨ Archivos Creados

1. **`src/config/storage.js`**

   - Configuración del cliente S3 para MinIO
   - Función `uploadPdfToStorage()` para subir PDFs
   - Función `checkStorageConfig()` para verificar variables de entorno

2. **`CONFIGURACION_MINIO.md`**

   - Guía completa paso a paso para configurar MinIO en Railway
   - Instrucciones de configuración de buckets y credenciales
   - Sección de troubleshooting

3. **`VARIABLES_ENTORNO.md`**

   - Documentación de todas las variables de entorno necesarias
   - Ejemplos de configuración

4. **`MIGRACION_COMPLETADA.md`** (este archivo)
   - Resumen de la migración

### 🔧 Archivos Modificados

1. **`src/context/FirebaseContext.jsx`**

   - ❌ Eliminado: `import { getStorage } from "firebase/storage"`
   - ✅ Agregado: Importación de funciones de MinIO desde `src/config/storage.js`
   - ✅ Agregado: Inicialización del cliente MinIO en lugar de Firebase Storage
   - ✅ Agregado: Verificación de configuración de MinIO al iniciar

2. **`src/components/QuotationPreviewModal.jsx`**

   - ❌ Eliminado: Imports de Firebase Storage (`ref`, `uploadBytes`, `getDownloadURL`)
   - ✅ Agregado: Import de `uploadPdfToStorage` desde `src/config/storage.js`
   - ✅ Modificado: Función `handleSharePdfViaWhatsApp` para usar MinIO
   - ✅ Mejorado: Manejo de errores específico para MinIO
   - ✅ Cambiado: Mensaje de "Subiendo PDF a Firebase..." → "Subiendo PDF a MinIO..."

3. **`src/pages/Calculator.jsx`**

   - ✅ Agregado: `export default QuotationCalculator` (faltaba)

4. **`src/pages/PriceAdmin.jsx`**

   - ✅ Agregado: `export default PriceAdmin` (faltaba)

5. **`README.md`**
   - ✅ Actualizado: Sección de características
   - ✅ Actualizado: Requisitos previos
   - ✅ Actualizado: Instrucciones de instalación con MinIO
   - ✅ Agregado: Referencias a la documentación de MinIO

### 📦 Dependencias Instaladas

- `@aws-sdk/client-s3` - SDK de AWS S3 (compatible con MinIO)

---

## 🚀 Próximos Pasos

### 1. Configurar Variables de Entorno Locales

Crea un archivo `.env` en la raíz del proyecto:

```bash
# Firebase (mantener existente)
VITE_FIREBASE_API_KEY=tu_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
VITE_APP_ID=litografia-pro

# MinIO Storage (NUEVO - necesitas configurar)
VITE_STORAGE_REGION=us-east-1
VITE_STORAGE_ENDPOINT=https://tu-minio.railway.app
VITE_STORAGE_ACCESS_KEY_ID=tu_access_key
VITE_STORAGE_SECRET_ACCESS_KEY=tu_secret_key
VITE_STORAGE_BUCKET_NAME=litografia-pdfs
VITE_STORAGE_PUBLIC_URL=https://tu-minio.railway.app
```

> 📖 **Ver guía completa:** [VARIABLES_ENTORNO.md](./VARIABLES_ENTORNO.md)

### 2. Configurar MinIO en Railway

Sigue la guía completa paso a paso:

> 📖 **[CONFIGURACION_MINIO.md](./CONFIGURACION_MINIO.md)**

**Pasos rápidos:**

1. Accede a tu proyecto en [Railway](https://railway.app/)
2. Despliega MinIO desde template
3. Agrega volumen persistente (`/data`)
4. Genera dominio público
5. Crea bucket `litografia-pdfs`
6. Genera Service Account (credenciales)
7. Configura políticas de acceso público
8. Copia las credenciales al archivo `.env`

### 3. Probar Localmente

```bash
# Iniciar servidor de desarrollo
npm run dev
```

1. Abre `http://localhost:5173`
2. Crea una cotización de prueba
3. Click en "Compartir PDF por WhatsApp"
4. Verifica:
   - ✅ Se genera el PDF correctamente
   - ✅ Mensaje dice "Subiendo PDF a MinIO..."
   - ✅ Se obtiene URL del PDF
   - ✅ WhatsApp se abre con el mensaje
   - ✅ La URL del PDF funciona

### 4. Desplegar en Producción

#### Opción A: Vercel (Recomendado)

```bash
# Instalar CLI de Vercel
npm install -g vercel

# Desplegar
vercel
```

Luego en el Dashboard de Vercel:

- Settings → Environment Variables
- Agregar todas las variables del `.env`

#### Opción B: Railway (Todo en un solo lugar)

1. Conecta tu repositorio de GitHub a Railway
2. Crea nuevo servicio desde GitHub Repo
3. Agrega variables de entorno en Settings → Variables
4. Railway desplegará automáticamente

---

## 🔍 Verificación de Funcionamiento

### En el navegador, abre la consola (F12) y busca:

✅ **Mensaje de éxito:**

```
✅ Configuración de MinIO storage verificada correctamente
```

❌ **Si ves error:**

```
❌ Faltan variables de entorno para MinIO storage: [...]
```

→ Revisa que todas las variables estén en el `.env`

---

## 📊 Arquitectura Actualizada

```
┌─────────────────────────────────────────────────┐
│           APLICACIÓN LITOGRAFÍA PRO             │
├─────────────────────────────────────────────────┤
│                                                 │
│  Frontend (React + Vite)                        │
│  ├─ Calculadora de Cotizaciones                 │
│  ├─ Administrador de Precios                    │
│  └─ Cotizaciones Guardadas                      │
│                                                 │
└──────┬─────────────────────────────┬────────────┘
       │                             │
       │                             │
   ────▼────                    ─────▼─────
  │Firebase │                  │  MinIO   │
  │Firestore│                  │ Railway  │
  │  + Auth │                  │ Storage  │
  └─────────┘                  └──────────┘
       │                             │
       │                             │
  Base de datos                  Archivos PDF
  en tiempo real                 de cotizaciones
```

### Antes:

- ✅ Firebase Firestore (Base de datos)
- ✅ Firebase Auth (Autenticación)
- ❌ Firebase Storage (Archivos PDF) → **LIMITADO EN PLAN GRATUITO**

### Ahora:

- ✅ Firebase Firestore (Base de datos)
- ✅ Firebase Auth (Autenticación)
- ✅ **MinIO en Railway** (Archivos PDF) → **SIN LÍMITES EN TU PLAN**

---

## 🎯 Beneficios de la Migración

| Aspecto               | Firebase Storage          | MinIO en Railway              |
| --------------------- | ------------------------- | ----------------------------- |
| **Costo**             | Limitado en plan gratuito | Incluido en tu plan Railway   |
| **Control**           | Limitado                  | Control total del servidor    |
| **Escalabilidad**     | Automática                | Manual (ajustar volumen)      |
| **Compatible con S3** | No                        | ✅ Sí (fácil migrar a AWS/R2) |
| **Configuración**     | Simple                    | Requiere setup inicial        |

---

## 🐛 Troubleshooting Común

### ❌ Error: "Network Error" al subir PDF

**Causa:** CORS no configurado en MinIO

**Solución:**

1. MinIO Console → Settings → API → CORS
2. Allowed Origins: `*`
3. Allowed Methods: `GET, PUT, POST`

### ❌ Error: "Access Denied" (403)

**Causa:** Credenciales incorrectas o bucket no público

**Solución:**

1. Verifica `VITE_STORAGE_ACCESS_KEY_ID` y `VITE_STORAGE_SECRET_ACCESS_KEY`
2. Verifica que el bucket tenga política pública (Anonymous → readonly)

### ❌ URL del PDF no funciona (404)

**Causa:** URL pública mal configurada

**Solución:**
Verifica que `VITE_STORAGE_PUBLIC_URL` sea exactamente la URL de MinIO:

```bash
# ✅ Correcto
VITE_STORAGE_PUBLIC_URL=https://minio-production-xxxx.railway.app

# ❌ Incorrecto (con barra al final)
VITE_STORAGE_PUBLIC_URL=https://minio-production-xxxx.railway.app/
```

### ❌ Los archivos desaparecen al reiniciar MinIO

**Causa:** Falta volumen persistente

**Solución:**
Railway → Servicio MinIO → Settings → Volumes → Add Volume → Mount path: `/data`

---

## 📚 Documentación Adicional

- 📖 [CONFIGURACION_MINIO.md](./CONFIGURACION_MINIO.md) - Guía completa de configuración
- 📖 [VARIABLES_ENTORNO.md](./VARIABLES_ENTORNO.md) - Todas las variables necesarias
- 📖 [README.md](./README.md) - Documentación general del proyecto

---

## ✅ Checklist Final

Marca cada ítem a medida que lo completes:

- [ ] MinIO desplegado en Railway
- [ ] Volumen persistente agregado a MinIO
- [ ] Bucket `litografia-pdfs` creado
- [ ] Política de acceso público configurada
- [ ] Service Account (credenciales) creado
- [ ] Variables de entorno configuradas en `.env`
- [ ] Probado localmente (`npm run dev`)
- [ ] PDF se genera y sube correctamente
- [ ] URL del PDF funciona
- [ ] Variables agregadas en producción (Vercel/Railway)
- [ ] Aplicación desplegada en producción
- [ ] Probado en producción

---

## 🎉 ¡Felicidades!

Has migrado exitosamente de Firebase Storage a MinIO en Railway. Tu aplicación ahora tiene:

✅ Mayor control sobre el almacenamiento
✅ Sin límites de Firebase
✅ Compatibilidad con estándar S3
✅ Todo centralizado en Railway
✅ Fácil de migrar en el futuro

**¿Tienes dudas?** Revisa la [guía de configuración](./CONFIGURACION_MINIO.md) o la sección de [troubleshooting](#-troubleshooting-común).
