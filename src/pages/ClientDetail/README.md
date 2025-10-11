# ClientDetail - Vista Unificada de Cliente

Página de detalle del cliente implementada como parte de la **Iteración 5** del roadmap de mejoras.

## 📋 Descripción

Vista completa y unificada de un cliente específico con navegación por tabs. Centraliza toda la información y acciones relacionadas con el cliente en una sola página.

## 🗂️ Estructura de Archivos

```
src/pages/ClientDetail/
├── ClientDetail.jsx              # Componente principal
├── components/
│   ├── ClientInfoTab.jsx         # Tab de información y edición
│   ├── ClientQuotationsTab.jsx   # Tab de cotizaciones del cliente
│   ├── ClientPriceProfileTab.jsx # Tab de gestión de perfil de precios
│   └── ClientHistoryTab.jsx      # Tab de historial de actividad
└── hooks/
    ├── useClientDetail.js        # Hook para cargar y actualizar cliente
    └── useClientQuotations.js    # Hook para cotizaciones filtradas
```

## 🎯 Funcionalidades

### Tab 1: Información
- **Estadísticas destacadas:**
  - Total de cotizaciones
  - Ingresos totales generados
  - Fecha de última cotización
- **Formulario editable:**
  - Nombre, email, teléfono
  - RIF, dirección
  - Notas adicionales
- **Guardado inline:** Editar sin salir de la página

### Tab 2: Cotizaciones
- **Listado filtrado:** Solo cotizaciones del cliente actual
- **Ordenamiento:** Por fecha de actualización (más recientes primero)
- **Navegación directa:** Click en cotización → Calculator en modo edición
- **Botón destacado:** Nueva cotización para este cliente
- **Preview de productos:** Vista rápida de los ítems de cada cotización
- **Badges de estado:** Visual de estado (borrador, pendiente, aprobada, rechazada)
- **Identificación de plantillas:** Badge especial para cotizaciones marcadas como plantilla

### Tab 3: Perfil de Precios
- **Vista del perfil activo:**
  - Nombre y descripción
  - Margen de ganancia configurado
  - Tasa BCV actual
  - IVA configurado
  - Cantidad de papeles en el perfil
- **Cambio de perfil:**
  - Selector con todos los perfiles disponibles
  - Preview de impacto del cambio
  - Advertencia sobre efectos en cotizaciones futuras
- **Validación:** Las cotizaciones existentes no se ven afectadas

### Tab 4: Historial
- **Línea de tiempo visual:**
  - Creación del cliente
  - Cotizaciones creadas
  - Cotizaciones aprobadas
  - Cambios de perfil de precios
- **Resumen estadístico:**
  - Total de eventos registrados
  - Contadores por tipo de evento
- **Links directos:** Acceso rápido a cotizaciones desde el historial

## 🔗 Integración con React Router

### Ruta Dinámica
```javascript
// Configuración en src/router/index.jsx
{
  path: 'clients/:clientId',
  element: <ClientDetail />
}
```

### Navegación
```javascript
// Desde ClientCard (Clients.jsx)
<Link to={`/clients/${client.id}`}>Ver detalles</Link>

// Programática desde otros componentes
navigate(`/clients/${clientId}`);

// Con query params para acciones específicas
navigate(`/calculator?clientId=${clientId}`); // Nueva cotización
```

### Obtener parámetros de ruta
```javascript
import { useParams } from 'react-router-dom';

const { clientId } = useParams(); // Extrae clientId de la URL
```

## 🎨 Características de UX

### Header Destacado
- Gradiente visual (indigo → purple)
- Breadcrumb de navegación
- Información de contacto visible
- Botón prominente "Nueva Cotización"

### Navegación por Tabs
- Iconos descriptivos
- Diseño responsive (iconos solos en mobile)
- Estado activo visual claro
- Transiciones suaves

### Estados de Carga
- Spinner centrado durante carga inicial
- Mensajes de error amigables con opción de volver
- Skeleton states en tabs individuales

### Feedback al Usuario
- Toast notifications para operaciones exitosas/fallidas
- Estados de guardado con spinners
- Confirmaciones visuales de cambios

## 📊 Hooks Utilizados

### useClientDetail
```javascript
const {
  client,        // Datos del cliente
  loading,       // Estado de carga
  error,         // Error si ocurre
  saving,        // Estado de guardado
  updateClient   // Función para actualizar
} = useClientDetail(clientId);
```

### useClientQuotations
```javascript
const {
  quotations,  // Array de cotizaciones filtradas
  loading,     // Estado de carga
  error        // Error si ocurre
} = useClientQuotations(clientId);
```

### useClientStats (compartido)
```javascript
const { stats } = useClientStats(clientId);
// stats contiene:
// - quotationCount
// - totalRevenue
// - lastQuotationDate
// - pendingQuotations, approvedQuotations, rejectedQuotations
```

## 🔄 Flujos de Trabajo

### Flujo de Edición de Cliente
1. Usuario navega a `/clients/:clientId`
2. ClientDetail carga datos con useClientDetail
3. Usuario hace click en "Editar" (Tab Info)
4. Formulario se habilita para edición
5. Usuario modifica campos y hace click en "Guardar"
6. updateClient() envía cambios a Firestore
7. Toast confirma éxito
8. Formulario vuelve a modo lectura

### Flujo de Cambio de Perfil
1. Usuario navega al Tab "Perfil de Precios"
2. Click en "Cambiar Perfil"
3. Se muestra selector de perfiles disponibles
4. Usuario selecciona nuevo perfil
5. Advertencia de impacto se muestra
6. Usuario confirma cambio
7. updateClient() actualiza priceProfileId
8. Vista se actualiza con nuevo perfil

### Flujo de Nueva Cotización
1. Usuario hace click en "Nueva Cotización" (header o tab)
2. navigate(`/calculator?clientId=${clientId}`)
3. Calculator detecta query param clientId
4. Cliente se auto-selecciona en QuotationInitialScreen
5. Usuario continúa con flujo normal de cotización

## 🎯 Validaciones y Consideraciones

### Validaciones
- `clientId` debe existir en Firestore
- Si no existe → mensaje de error + botón "Volver a Clientes"
- Nombre del cliente es campo requerido
- Cambio de perfil muestra advertencia de impacto

### Performance
- useClientQuotations usa listener en tiempo real (onSnapshot)
- Actualización automática si se crean/modifican cotizaciones
- useClientDetail carga una vez y se actualiza al guardar
- Stats se recalculan automáticamente al cambiar cotizaciones

### Accesibilidad
- Botones con área táctil de 44x44px (touch-friendly)
- Labels descriptivos en formularios
- Estados de carga comunicados visualmente
- Navegación por teclado funcional

## 📱 Diseño Responsive

### Mobile (< 640px)
- Tabs muestran solo iconos
- Grid de estadísticas en columna única
- Botones apilados verticalmente
- Header compacto

### Tablet (640px - 1024px)
- Tabs con iconos + texto
- Grid 2 columnas para estadísticas
- Layout optimizado

### Desktop (> 1024px)
- Experiencia completa
- Grid 3-4 columnas para métricas
- Máximo ancho contenedor: 7xl (80rem)

## 🔧 Mejoras Futuras Potenciales

- [ ] Exportar historial de cliente a PDF
- [ ] Gráficos de evolución de ingresos
- [ ] Comparación de clientes (analytics)
- [ ] Notas y recordatorios por cliente
- [ ] Archivos adjuntos del cliente
- [ ] Tags/etiquetas para categorizar clientes
- [ ] Integración con CRM externo

## 📝 Relación con Plan de Mejoras

Esta implementación cumple con:

✅ **FASE 4.1** - Vista de Cliente Unificada (nueva página)
✅ **Sprint 4** - Vista Unificada de Cliente (2 semanas)
✅ Navegación fluida usando React Router con rutas dinámicas
✅ Tabs de información/cotizaciones/perfil/historial
✅ Edición inline sin salir de la página
✅ Botón crear cotización desde cliente

---

**Fecha de implementación:** Octubre 11, 2025
**Estado:** ✅ Completado
**Parte de:** Iteración 5 - Vista Unificada de Cliente
