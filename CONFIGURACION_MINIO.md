# 🚂 Configuración de MinIO en Railway

Esta guía te ayudará a configurar MinIO como almacenamiento de archivos en Railway para reemplazar Firebase Storage.

## 📋 Índice

1. [Desplegar MinIO en Railway](#1-desplegar-minio-en-railway)
2. [Configurar MinIO](#2-configurar-minio)
3. [Crear Bucket y Credenciales](#3-crear-bucket-y-credenciales)
4. [Variables de Entorno](#4-variables-de-entorno)
5. [Desplegar la Aplicación](#5-desplegar-la-aplicación)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. Desplegar MinIO en Railway

### Paso 1.1: Crear servicio MinIO

1. Ve a tu proyecto en [Railway](https://railway.app/)
2. Click en **"+ New Service"**
3. Selecciona **"Deploy from Template"**
4. Busca **"MinIO"** o usa este template: https://railway.app/template/minio
5. Click en **"Deploy"**

### Paso 1.2: Agregar volumen persistente

**IMPORTANTE:** Sin un volumen, los archivos se perderán al reiniciar el servicio.

1. En el servicio MinIO, ve a **Settings → Volumes**
2. Click en **"+ New Volume"**
3. Mount Path: `/data`
4. Size: Mínimo 1 GB (ajusta según tus necesidades)
5. Click en **"Add"**

### Paso 1.3: Configurar variables de entorno en MinIO

En el servicio MinIO, ve a **Variables** y agrega:

```bash
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=TuPasswordSeguro123456!
MINIO_SERVER_URL=https://tu-minio-production-xxxx.railway.app
```

> ⚠️ **Importante:** Cambia `TuPasswordSeguro123456!` por una contraseña segura real.

### Paso 1.4: Generar dominio público

1. En el servicio MinIO, ve a **Settings → Networking**
2. Click en **"Generate Domain"**
3. Railway generará una URL como: `minio-production-xxxx.railway.app`
4. **Guarda esta URL**, la necesitarás más adelante

---

## 2. Configurar MinIO

### Paso 2.1: Acceder a MinIO Console

1. Abre la URL generada en el navegador: `https://tu-minio-production-xxxx.railway.app`
2. Login con las credenciales:
   - **Username:** `admin` (el que configuraste en `MINIO_ROOT_USER`)
   - **Password:** `TuPasswordSeguro123456!` (el que configuraste)

---

## 3. Crear Bucket y Credenciales

### Paso 3.1: Crear Bucket

1. En MinIO Console, click en **"Buckets"** en el menú lateral
2. Click en **"Create Bucket"**
3. Nombre del bucket: `litografia-pdfs`
4. Click en **"Create Bucket"**

### Paso 3.2: Configurar política de acceso público

Para que los PDFs sean accesibles públicamente:

1. Click en el bucket `litografia-pdfs`
2. Ve a la pestaña **"Anonymous"**
3. Click en **"Add Access Rule"**
4. Prefix: deja en blanco (para acceso a todo el bucket)
5. Access: selecciona **"readonly"** o **"download"**
6. Click en **"Add"**

**Alternativa (más seguro):** Solo hacer público el directorio de PDFs:

- Prefix: `quotations_pdf/`
- Access: `readonly`

### Paso 3.3: Crear Service Account (Credenciales)

1. En MinIO Console, ve a **"Identity"** → **"Service Accounts"**
2. Click en **"Create Service Account"**
3. Configuración:
   - **Access Key:** Se genera automáticamente (copiarlo)
   - **Secret Key:** Se genera automáticamente (copiarlo)
   - **Policy:** Selecciona `readwrite` o crea una política personalizada
4. Click en **"Create"**

> ⚠️ **MUY IMPORTANTE:** Guarda el **Access Key** y **Secret Key** inmediatamente. No podrás verlos de nuevo.

Ejemplo de salida:

```
Access Key: VQ7LKJG6F4RHZXN2M8WS
Secret Key: Ab3dE5fG7hI9jK0lM2nO4pQ6rS8tU1vW3xY5zA7b
```

---

## 4. Variables de Entorno

### Paso 4.1: Para desarrollo local

Crea un archivo `.env` en la raíz del proyecto:

```bash
# Firebase (mantener existente)
VITE_FIREBASE_API_KEY=tu_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
VITE_APP_ID=default-app-id
VITE_INITIAL_AUTH_TOKEN=

# MinIO Storage (NUEVO)
VITE_STORAGE_REGION=us-east-1
VITE_STORAGE_ENDPOINT=https://tu-minio-production-xxxx.railway.app
VITE_STORAGE_ACCESS_KEY_ID=VQ7LKJG6F4RHZXN2M8WS
VITE_STORAGE_SECRET_ACCESS_KEY=Ab3dE5fG7hI9jK0lM2nO4pQ6rS8tU1vW3xY5zA7b
VITE_STORAGE_BUCKET_NAME=litografia-pdfs
VITE_STORAGE_PUBLIC_URL=https://tu-minio-production-xxxx.railway.app
```

> 🔒 **Seguridad:** Nunca subas el archivo `.env` a Git. Ya está en `.gitignore`.

### Paso 4.2: Para producción (Vercel/Railway)

Agrega las mismas variables en el dashboard de tu plataforma de hosting.

---

## 5. Desplegar la Aplicación

### Opción A: Vercel (Recomendado para frontend)

#### 5.1 Instalar Vercel CLI (si no lo tienes)

```bash
npm install -g vercel
```

#### 5.2 Desplegar

```bash
vercel
```

#### 5.3 Configurar variables de entorno

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Settings → Environment Variables
3. Agrega todas las variables del archivo `.env`

### Opción B: Railway (Todo en un lugar)

#### 5.1 Crear servicio para el frontend

1. En tu proyecto Railway, click en **"+ New Service"**
2. Selecciona **"GitHub Repo"**
3. Conecta tu repositorio
4. Railway detectará automáticamente que es un proyecto Vite

#### 5.2 Configurar variables de entorno

1. En el servicio del frontend, ve a **Variables**
2. Agrega todas las variables de MinIO y Firebase

#### 5.3 Configurar build (si es necesario)

Railway debería detectar automáticamente, pero si no:

- **Build Command:** `npm run build`
- **Start Command:** `npm run preview`

---

## 6. Troubleshooting

### ❌ Error: "Network Error" al subir PDF

**Causa:** CORS no configurado en MinIO

**Solución:**

1. Accede a MinIO Console
2. Ve a **Settings** → **API** → **CORS**
3. Agrega:
   ```
   Allowed Origins: *
   Allowed Methods: GET, PUT, POST
   Allowed Headers: *
   ```

### ❌ Error: "Access Denied" o 403

**Causa:** Credenciales incorrectas o bucket no público

**Solución:**

1. Verifica que las variables `VITE_STORAGE_ACCESS_KEY_ID` y `VITE_STORAGE_SECRET_ACCESS_KEY` sean correctas
2. Verifica que el bucket tenga política de acceso público (Paso 3.2)

### ❌ URL del PDF no funciona (404)

**Causa:** La URL pública no está bien configurada

**Solución:**
Verifica que `VITE_STORAGE_PUBLIC_URL` sea exactamente la URL de MinIO (sin barra al final):

```bash
# ✅ Correcto
VITE_STORAGE_PUBLIC_URL=https://minio-production-xxxx.railway.app

# ❌ Incorrecto
VITE_STORAGE_PUBLIC_URL=https://minio-production-xxxx.railway.app/
```

### ❌ Los archivos se pierden al reiniciar

**Causa:** No hay volumen persistente configurado

**Solución:**
Ve al Paso 1.2 y agrega un volumen al servicio MinIO.

### 🔍 Verificar que todo funciona

1. **Desarrollo local:**

   ```bash
   npm run dev
   ```

2. **Generar una cotización de prueba**
3. **Click en "Compartir PDF por WhatsApp"**
4. **Verificar que:**
   - ✅ Se genera el PDF
   - ✅ Se sube a MinIO (mensaje "Subiendo PDF a MinIO...")
   - ✅ La URL del PDF funciona
   - ✅ WhatsApp se abre con el mensaje

---

## 📊 Comparación: Firebase Storage vs MinIO en Railway

| Característica    | Firebase Storage          | MinIO en Railway          |
| ----------------- | ------------------------- | ------------------------- |
| **Costo**         | Limitado en plan gratuito | Incluido en plan Railway  |
| **Control**       | Limitado                  | Control total             |
| **Velocidad**     | CDN global                | Depende de región Railway |
| **Configuración** | Más simple                | Requiere setup inicial    |
| **Escalabilidad** | Automática                | Manual (volumen)          |

---

## 🎉 ¡Listo!

Tu aplicación ahora usa MinIO en Railway para almacenar PDFs en lugar de Firebase Storage.

**Ventajas:**

- ✅ Sin límites de Firebase
- ✅ Todo en Railway (más simple)
- ✅ Compatible con S3 (puedes migrar fácilmente a AWS S3 o Cloudflare R2 en el futuro)

**¿Dudas?** Revisa la sección de [Troubleshooting](#6-troubleshooting) o abre un issue en GitHub.
