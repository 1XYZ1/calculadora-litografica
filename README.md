# Litografía Pro 🖨️

Sistema de cotización y administración de precios para imprentas y litografías.

## 🚀 Características

- **Calculadora de Cotizaciones**: Calcula presupuestos detallados para trabajos de impresión
- **Administrador de Precios**: Gestiona precios de papeles, planchas, máquinas y acabados
- **Cotizaciones Guardadas**: Almacena y recupera cotizaciones anteriores
- **Generación de PDF**: Genera PDFs profesionales de los presupuestos
- **Compartir por WhatsApp**: Comparte presupuestos directamente por WhatsApp
- **Firebase Firestore**: Base de datos en tiempo real
- **MinIO Storage**: Almacenamiento de archivos PDF en Railway

## 📋 Requisitos Previos

- Node.js (v16 o superior)
- npm o yarn
- Cuenta de Firebase (para Firestore y Auth)
- Cuenta de Railway (para MinIO)

## ⚙️ Instalación

1. **Clonar el repositorio**

```bash
cd litografia
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar Firebase**

Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)

4. **Configurar variables de entorno**

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Firebase (Firestore + Auth)
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
VITE_APP_ID=litografia-pro

# MinIO Storage (Railway)
VITE_STORAGE_REGION=us-east-1
VITE_STORAGE_ENDPOINT=https://tu-minio.railway.app
VITE_STORAGE_ACCESS_KEY_ID=tu_access_key
VITE_STORAGE_SECRET_ACCESS_KEY=tu_secret_key
VITE_STORAGE_BUCKET_NAME=litografia-pdfs
VITE_STORAGE_PUBLIC_URL=https://tu-minio.railway.app
```

> 📖 **Ver documentación completa de variables de entorno:** [VARIABLES_ENTORNO.md](./VARIABLES_ENTORNO.md)

5. **Configurar MinIO en Railway**

Para el almacenamiento de PDFs, necesitas configurar MinIO en Railway:

> 📖 **Guía completa de configuración:** [CONFIGURACION_MINIO.md](./CONFIGURACION_MINIO.md)

**Resumen rápido:**

1. Despliega MinIO desde template en Railway
2. Agrega un volumen persistente (`/data`)
3. Crea un bucket llamado `litografia-pdfs`
4. Genera credenciales (Service Account)
5. Configura las variables de entorno en tu `.env`

6. **Configurar reglas de Firestore**

En la consola de Firebase, ve a Firestore → Rules y pega:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /artifacts/{appId}/public/data/{document=**} {
      allow read, write: if request.auth != null;
    }
    match /artifacts/{appId}/users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🏃 Ejecutar en Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🏗️ Construir para Producción

```bash
npm run build
```

Los archivos optimizados estarán en la carpeta `dist/`

## 📁 Estructura del Proyecto

```
litografia/
├── src/
│   ├── components/         # Componentes reutilizables
│   │   ├── Header.jsx
│   │   ├── ModalMessage.jsx
│   │   ├── ConfirmationModal.jsx
│   │   ├── CostBreakdownModal.jsx
│   │   ├── QuotationPreviewModal.jsx
│   │   ├── LayoutSketch.jsx
│   │   └── TroquelLayoutSketch.jsx
│   ├── pages/             # Páginas principales
│   │   ├── Calculator.jsx
│   │   ├── PriceAdmin.jsx
│   │   └── SavedQuotations.jsx
│   ├── context/           # Contextos de React
│   │   └── FirebaseContext.jsx
│   ├── config/            # Configuración
│   │   └── firebase.js
│   ├── utils/             # Utilidades y constantes
│   │   ├── constants.js
│   │   └── calculations.js
│   ├── App.jsx            # Componente principal
│   ├── main.jsx           # Punto de entrada
│   └── index.css          # Estilos globales
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── .env
```

## 🎨 Tecnologías Utilizadas

- **React 18** - Biblioteca de UI
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework de CSS
- **Firebase** - Backend as a Service
  - Firestore - Base de datos
  - Authentication - Autenticación
  - Storage - Almacenamiento de archivos
- **jsPDF** - Generación de PDFs
- **html2canvas** - Captura de HTML para PDF

## 📝 Uso

### Calculadora de Cotizaciones

1. Ingresa el nombre del presupuesto y cliente
2. Añade items con sus especificaciones:
   - Dimensiones
   - Cantidad
   - Área de impresión
   - Tipo de papel
   - Colores
   - Acabados (UV, laminado, etc.)
3. Visualiza el costo total
4. Guarda o genera PDF del presupuesto

### Administrador de Precios

1. Actualiza precios de papeles
2. Gestiona tamaños y precios de planchas
3. Configura precios de máquinas
4. Ajusta precios de acabados
5. Establece porcentaje de ganancia
6. Actualiza tasa del dólar BCV

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y de uso interno.

## 👥 Autor

JPC SERVICE C.A. - PUBLICIDAD

## 📞 Soporte

Para soporte, contacta a: jpgservice@gmail.com
