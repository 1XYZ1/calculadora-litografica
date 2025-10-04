# Instrucciones para Completar el Proyecto

## ✅ Archivos Ya Creados

### Configuración

- ✅ `package.json` - Dependencias del proyecto
- ✅ `vite.config.js` - Configuración de Vite
- ✅ `tailwind.config.js` - Configuración de Tailwind
- ✅ `postcss.config.js` - Configuración de PostCSS
- ✅ `index.html` - HTML principal con scripts de jsPDF y html2canvas
- ✅ `.gitignore` - Archivos a ignorar en git
- ✅ `README.md` - Documentación del proyecto

### Código Fuente

- ✅ `src/main.jsx` - Punto de entrada de la aplicación
- ✅ `src/App.jsx` - Componente principal
- ✅ `src/index.css` - Estilos globales y Tailwind

### Context

- ✅ `src/context/FirebaseContext.jsx` - Contexto de Firebase con autenticación

### Configuración

- ✅ `src/config/firebase.js` - Configuración de Firebase

### Utilidades

- ✅ `src/utils/constants.js` - Constantes del proyecto
- ✅ `src/utils/calculations.js` - Funciones de cálculo

### Componentes

- ✅ `src/components/Header.jsx` - Header de la aplicación
- ✅ `src/components/ModalMessage.jsx` - Modal de mensajes
- ✅ `src/components/ConfirmationModal.jsx` - Modal de confirmación
- ✅ `src/components/CostBreakdownModal.jsx` - Modal de desglose de costos
- ✅ `src/components/QuotationPreviewModal.jsx` - Modal de vista previa de cotización
- ✅ `src/components/LayoutSketch.jsx` - Componente de visualización de montaje
- ✅ `src/components/TroquelLayoutSketch.jsx` - Componente de visualización de troquel

### Páginas

- ✅ `src/pages/SavedQuotations.jsx` - Página de cotizaciones guardadas
- ⚠️ `src/pages/PriceAdmin.jsx` - FALTA CREAR
- ⚠️ `src/pages/Calculator.jsx` - FALTA CREAR

## 📝 Archivos Pendientes

### 1. PriceAdmin.jsx

Este archivo maneja la administración de precios. Debes copiar el código desde `app.jsx` líneas 699-1732 y adaptarlo con los siguientes imports:

\`\`\`javascript
import React, { useState, useEffect } from "react";
import {
collection,
doc,
onSnapshot,
updateDoc,
deleteDoc,
addDoc,
setDoc,
getDoc,
} from "firebase/firestore";
import { useFirebase } from "../context/FirebaseContext";
import ModalMessage from "../components/ModalMessage";

export default function PriceAdmin() {
// ... Copiar todo el contenido de la función PriceAdmin del archivo original
}
\`\`\`

### 2. Calculator.jsx

Este es el archivo más grande y complejo. Debes copiar desde `app.jsx` líneas 2103-3703. Los imports necesarios son:

\`\`\`javascript
import React, { useState, useEffect } from "react";
import {
collection,
doc,
onSnapshot,
addDoc,
updateDoc,
Timestamp,
} from "firebase/firestore";
import { useFirebase } from "../context/FirebaseContext";
import {
initialItemState,
initialQuotationState,
HALF_SHEET_WIDTH,
HALF_SHEET_HEIGHT,
QUARTER_SHEET_WIDTH,
QUARTER_SHEET_HEIGHT,
DIGITAL_QUARTER_SHEET_WIDTH,
DIGITAL_QUARTER_SHEET_HEIGHT,
TABLOIDE_WIDTH,
TABLOIDE_HEIGHT,
OFICIO_WIDTH,
OFICIO_HEIGHT,
CARTA_WIDTH,
CARTA_HEIGHT,
TROQUEL_SHEET_WIDTH,
TROQUEL_SHEET_HEIGHT,
TROQUEL_SEPARATION,
} from "../utils/constants";
import { calculateBestFit, calculateTroquelFit } from "../utils/calculations";
import ModalMessage from "../components/ModalMessage";
import CostBreakdownModal from "../components/CostBreakdownModal";
import QuotationPreviewModal from "../components/QuotationPreviewModal";
import LayoutSketch from "../components/LayoutSketch";
import TroquelLayoutSketch from "../components/TroquelLayoutSketch";

export default function Calculator({ loadedQuotation, setLoadedQuotation }) {
// ... Copiar todo el contenido de QuotationCalculator del archivo original
}
\`\`\`

## 🚀 Pasos para Completar

### 1. Crear los archivos faltantes

Crea `src/pages/PriceAdmin.jsx` copiando el contenido desde el archivo original `app.jsx`:

- Líneas 699-1732
- Añade los imports mencionados arriba
- Cambia `function PriceAdmin()` por `export default function PriceAdmin()`

Crea `src/pages/Calculator.jsx` copiando el contenido desde el archivo original `app.jsx`:

- Líneas 2103-3703
- Añade los imports mencionados arriba
- Cambia `function QuotationCalculator()` por `export default function Calculator()`
- Renombra todas las referencias internas de `QuotationCalculator` a `Calculator`

### 2. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

\`\`\`env
VITE_FIREBASE_API_KEY=tu_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
VITE_APP_ID=litografia-pro
\`\`\`

Reemplaza los valores con tus credenciales de Firebase.

### 3. Instalar dependencias

\`\`\`bash
npm install
\`\`\`

### 4. Configurar Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto o usa uno existente
3. Activa Firestore Database
4. Activa Authentication (modo anónimo)
5. Activa Storage
6. Configura las reglas de seguridad como se indica en el README.md

### 5. Ejecutar el proyecto

\`\`\`bash
npm run dev
\`\`\`

El proyecto se abrirá en `http://localhost:3000`

## 🔧 Resolución de Problemas

### Error: "Cannot find module"

- Verifica que todos los archivos estén en las rutas correctas
- Ejecuta `npm install` nuevamente

### Error de Firebase

- Verifica que tus credenciales en `.env` sean correctas
- Asegúrate de que las reglas de Firebase estén configuradas

### Errores de compilación

- Verifica que hayas copiado correctamente los archivos PriceAdmin.jsx y Calculator.jsx
- Revisa que los imports sean correctos

## 📞 Soporte

Si tienes problemas, revisa:

1. Los errores en la consola del navegador
2. Los errores en la terminal donde corre `npm run dev`
3. Las reglas de Firebase Storage y Firestore

## ✨ Próximos Pasos

Una vez que todo funcione:

1. Personaliza los estilos según tus necesidades
2. Añade tu logo en el PDF
3. Ajusta los precios iniciales desde el panel de administración
4. ¡Empieza a crear cotizaciones!
