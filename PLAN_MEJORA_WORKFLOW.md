# Plan de Mejora del Workflow - Litografía Pro

## 📊 Análisis de la Situación Actual

### Páginas Principales Actuales
1. **Calculator** (Calculadora de Cotizaciones)
2. **Clients** (Gestión de Clientes)
3. **PriceProfiles** (Perfiles de Precios)
4. **SavedQuotations** (Cotizaciones Guardadas)

### Problemas Identificados en el Flujo Actual

#### 1. **Fragmentación del Flujo de Cotización**
- El usuario debe navegar entre 3 páginas diferentes para crear una cotización completa:
  - `Clients` → Crear/seleccionar cliente
  - `Calculator` → Crear cotización
  - `SavedQuotations` → Ver y gestionar cotizaciones
- **Impacto**: Pérdida de contexto, clics innecesarios, experiencia fragmentada

#### 2. **Gestión de Clientes Desconectada**
- La creación de clientes está separada del flujo de cotización
- Si el cliente no existe, el usuario debe:
  1. Salir de Calculator
  2. Ir a Clients
  3. Crear el cliente
  4. Volver a Calculator
  5. Reiniciar la cotización
- **Impacto**: Fricción en el flujo de trabajo, datos temporales perdidos

#### 3. **Perfiles de Precios como Isla**
- Los perfiles de precios solo se asignan en la página de Clientes
- No hay visibilidad de qué perfil se está usando durante la cotización
- No se puede cambiar el perfil sobre la marcha
- **Impacto**: Falta de flexibilidad, usuarios no saben qué precios se están aplicando

#### 4. **Cotizaciones Guardadas como Repositorio Pasivo**
- Solo sirve para ver historial
- No hay flujo para duplicar cotizaciones similares
- No hay estadísticas o insights sobre cotizaciones frecuentes
- **Impacto**: Trabajo repetitivo, oportunidades perdidas de eficiencia

#### 5. **Falta de Flujos de Trabajo Predefinidos**
- No hay diferenciación entre:
  - Cliente nuevo → Cotización nueva
  - Cliente existente → Cotización nueva
  - Cliente existente → Cotización basada en anterior
- **Impacto**: El usuario debe recordar todos los pasos manualmente

---

## 🎯 Objetivos de Mejora

1. **Reducir navegación innecesaria entre páginas**
2. **Integrar gestión de clientes en el flujo de cotización**
3. **Hacer visibles y accesibles los perfiles de precios**
4. **Aprovechar cotizaciones guardadas para trabajo repetitivo**
5. **Crear flujos de trabajo intuitivos y guiados**

---

## 🚀 Propuestas de Mejora del Workflow

### **FASE 1: Unificación del Flujo de Cotización**

#### 1.1 Pantalla de Inicio Inteligente (Nueva)
**Ubicación**: Reemplazar la pantalla actual de inicio de Calculator

**Funcionalidades**:
```
┌─────────────────────────────────────────────────────┐
│  ¿Qué deseas hacer?                                 │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │ 📋 Nueva     │  │ 👤 Cliente   │  │ 📑 Desde  │ │
│  │ Cotización   │  │ Nuevo        │  │ Plantilla │ │
│  └──────────────┘  └──────────────┘  └───────────┘ │
│                                                      │
│  Cotizaciones Recientes:                            │
│  • Cliente ABC - Tarjetas (hace 2 días)             │
│  • Cliente XYZ - Volantes (hace 1 semana)           │
└─────────────────────────────────────────────────────┘
```

**Rutas disponibles**:
- **Nueva Cotización** → Selector de cliente + nombre de cotización (actual)
- **Cliente Nuevo** → Modal de creación de cliente + automáticamente iniciar cotización
- **Desde Plantilla** → Listado de cotizaciones frecuentes para duplicar

**Beneficio**: El usuario decide el flujo desde el inicio, sin necesidad de navegar entre páginas.

---

#### 1.2 Creación de Cliente Inline
**Ubicación**: Dentro del selector de cliente en Calculator

**Implementación**:
```jsx
// En QuotationInitialScreen.jsx
<select>
  <option value="">Seleccionar cliente...</option>
  {clients.map(...)}
  <option value="__new__">+ Crear nuevo cliente</option>
</select>

// Si selecciona "__new__", abrir modal ClientFormModal
// Al guardar, automáticamente seleccionar ese cliente
```

**Beneficio**: Sin salir del flujo de cotización, crear clientes nuevos.

---

#### 1.3 Indicador de Perfil de Precios en Calculator
**Ubicación**: Header del stepper, junto al nombre del cliente

**Diseño propuesto**:
```
┌────────────────────────────────────────────────┐
│ Cotización: Tarjetas de Presentación           │
│ Cliente: ABC Publicidad                        │
│ Perfil de Precios: Premium (🟢 Activo)         │
│   [Ver detalles] [Cambiar perfil]              │
└────────────────────────────────────────────────┘
```

**Funcionalidad**:
- Mostrar qué perfil de precios se está usando
- Permitir cambiar temporalmente el perfil (sin cambiar la configuración del cliente)
- Tooltip con resumen del perfil (margen de ganancia, tasa BCV, etc.)

**Beneficio**: Transparencia en cálculos, flexibilidad sin salir del flujo.

---

### **FASE 2: Mejoras en Cotizaciones Guardadas**

#### 2.1 Modo "Plantilla" para Cotizaciones
**Ubicación**: SavedQuotations con nueva funcionalidad

**Implementación**:
```javascript
// Agregar campo a quotation schema
quotation = {
  ...existingFields,
  isTemplate: false,        // Marcar como plantilla
  templateName: "",         // Nombre descriptivo (ej: "Tarjetas Estándar")
  usageCount: 0             // Contador de veces usada
}
```

**UI Propuesta**:
```
┌──────────────────────────────────────────────┐
│ Cotizaciones de Cliente ABC                  │
│                                               │
│ ⭐ PLANTILLAS                                 │
│ • Tarjetas estándar (usada 15 veces)         │
│   [Usar] [Editar] [Desmarcar]                │
│                                               │
│ 📋 COTIZACIONES REGULARES                    │
│ • Proyecto XYZ - $500                         │
│   [Abrir] [Duplicar] [Marcar como plantilla] │
└──────────────────────────────────────────────┘
```

**Beneficio**: Trabajo repetitivo se convierte en 1 clic.

---

#### 2.2 Duplicación Inteligente de Cotizaciones
**Ubicación**: Botón en QuotationCard

**Flujo propuesto**:
1. Click en "Duplicar" en una cotización
2. Modal pregunta:
   - ¿Mismo cliente o cambiar?
   - ¿Mismo nombre o renombrar?
3. Se carga en Calculator con todos los ítems
4. Usuario puede modificar lo necesario

**Beneficio**: Aprovechar trabajo previo, reducir tiempo de cotización en clientes recurrentes.

---

#### 2.3 Estadísticas y Sugerencias
**Ubicación**: Nueva sección en SavedQuotations

**Métricas propuestas**:
```
┌─────────────────────────────────────────────┐
│ 📊 Insights                                 │
│                                              │
│ • Productos más cotizados:                  │
│   1. Tarjetas de presentación (45%)         │
│   2. Volantes (30%)                         │
│   3. Catálogos (15%)                        │
│                                              │
│ • Clientes más activos:                     │
│   1. ABC Publicidad (12 cotizaciones)       │
│   2. XYZ Marketing (8 cotizaciones)         │
│                                              │
│ 💡 Sugerencia: Crea una plantilla para      │
│    "Tarjetas de presentación"               │
└─────────────────────────────────────────────┘
```

**Beneficio**: Identificar patrones, optimizar flujos de trabajo.

---

### **FASE 3: Mejoras en la Navegación General**

#### 3.1 React Router y Navegación
**Ubicación**: Configuración global de la aplicación

**Implementación**:
```javascript
// src/router/index.jsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { path: '/', element: <Navigate to="/calculator" /> },
      { path: '/calculator', element: <Calculator /> },
      { path: '/calculator/new', element: <Calculator /> },
      { path: '/clients', element: <Clients /> },
      { path: '/clients/:clientId', element: <ClientDetail /> },
      { path: '/price-profiles', element: <PriceProfiles /> },
      { path: '/quotations', element: <SavedQuotations /> },
    ]
  }
]);
```

**Beneficio**: Sistema de navegación robusto, estándar y familiar. Soporta rutas dinámicas y anidadas nativamente.

---

#### 3.2 Menú de Acciones Rápidas
**Ubicación**: Botón flotante (FAB) en esquina inferior derecha o navegación en Header

**Acciones disponibles**:
```jsx
// Usando useNavigate de React Router
import { useNavigate } from 'react-router-dom';

const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="quick-actions">
      <button onClick={() => navigate('/calculator/new')}>
        📋 Nueva Cotización
      </button>
      <button onClick={() => navigate('/clients/new')}>
        👤 Nuevo Cliente
      </button>
      <button onClick={() => navigate('/quotations')}>
        📁 Ver Guardadas
      </button>
      <button onClick={() => navigate('/price-profiles')}>
        ⚙️ Configurar Precios
      </button>
    </div>
  );
};
```

**Beneficio**: Acceso directo a acciones clave desde cualquier página usando navegación programática estándar.

---

#### 3.3 Navegación con React Router
**Ubicación**: Componentes que requieren navegación

**Implementación**:
```jsx
// En lugar de context personalizado, usar hooks de React Router
import { useNavigate, useLocation, Link } from 'react-router-dom';

// Navegación programática
const navigate = useNavigate();
navigate('/clients/123');
navigate(-1); // Volver atrás

// Links declarativos
<Link to="/calculator/new">Nueva Cotización</Link>

// Detectar ruta activa
const location = useLocation();
const isActive = location.pathname === '/calculator';

// Parámetros de ruta
import { useParams } from 'react-router-dom';
const { clientId } = useParams();
```

**Beneficio**: API estándar, bien documentada, familiar para developers. Navegación natural con historial del navegador.

---

### **FASE 4: Unificación de Gestión de Clientes**

#### 4.1 Vista de Cliente Unificada (Nueva Página)
**Concepto**: Al hacer click en un cliente, navegar a ruta dinámica `/clients/:clientId`

**Diseño propuesto**:
```jsx
// src/pages/ClientDetail/ClientDetail.jsx
import { useParams } from 'react-router-dom';

const ClientDetail = () => {
  const { clientId } = useParams();
  // Cargar datos del cliente usando clientId

  return (
    <div>
      <h1>👤 {client.name}</h1>
      <p>Perfil: {client.priceProfile} | Teléfono: ... | Email: ...</p>

      {/* Tabs de información */}
      <Tabs>
        <Tab label="Info" />
        <Tab label="Cotizaciones" />
        <Tab label="Perfil" />
        <Tab label="Historial" />
      </Tabs>

      {/* Contenido según tab activo */}
    </div>
  );
};
```

**Funcionalidades**:
- Ver/editar información del cliente
- Ver todas sus cotizaciones
- Configurar su perfil de precios
- Iniciar nueva cotización directamente usando `navigate('/calculator/new?clientId=' + clientId)`

**Beneficio**: Visión completa del cliente en un solo lugar. URL compartible para acceso directo.

---

#### 4.2 Selector de Cliente Mejorado
**Ubicación**: Calculator - QuotationInitialScreen

**Mejoras propuestas**:
```jsx
// Agregar búsqueda, filtros, y datos relevantes
<ClientSelector
  clients={clients}
  onSelect={handleClientSelect}
  onCreate={handleCreateClient}
  showRecentClients={true}
  showSearchBar={true}
  showStats={true}  // Ej: "12 cotizaciones previas"
/>
```

**Beneficio**: Encontrar clientes rápidamente, información contextual.

---

### **FASE 5: Optimización de Perfiles de Precios**

#### 5.1 Previsualización de Impacto de Precios
**Ubicación**: PriceProfiles al editar precios

**Funcionalidad**:
```
┌────────────────────────────────────────────┐
│ Editando: Papel Bond 20 → $5.50 (antes $5)│
│                                             │
│ 💡 Impacto en cotizaciones:                │
│ • Tarjetas estándar: +$2.50 (↑5%)         │
│ • Volantes A4: +$8.00 (↑8%)                │
└────────────────────────────────────────────┘
```

**Beneficio**: Transparencia en cambios de precios, evitar sorpresas.

---

#### 5.2 Perfiles de Precios Sugeridos
**Ubicación**: PriceProfiles - página inicial

**Implementación**:
```
┌──────────────────────────────────────────┐
│ ¿No tienes perfiles configurados?        │
│                                           │
│ Usa una plantilla predefinida:           │
│ • Precios estándar (margen 30%)          │
│ • Precios mayoristas (margen 15%)        │
│ • Precios premium (margen 50%)           │
│                                           │
│ [Importar plantilla]                     │
└──────────────────────────────────────────┘
```

**Beneficio**: Onboarding más rápido para nuevos usuarios.

---

## 📋 Roadmap de Implementación

### **Sprint 1: Quick Wins (1 semana)**
- [ ] **Instalar React Router**: `npm install react-router-dom`
- [ ] Configurar rutas básicas en `src/router/index.jsx`
- [ ] Crear `MainLayout.jsx` con navegación
- [ ] Migrar navegación actual a usar `<Link>` y `useNavigate()`
- [ ] Creación de cliente inline en Calculator
- [ ] Indicador de perfil de precios en Calculator header
- [ ] Botón "Duplicar cotización" en SavedQuotations

### **Sprint 2: Pantalla de Inicio Mejorada (1 semana)**
- [ ] Nueva pantalla de inicio en Calculator
- [ ] Opción "Cliente Nuevo" directa
- [ ] Listado de cotizaciones recientes
- [ ] Implementar flujo de plantillas

### **Sprint 3: Mejoras en Cotizaciones Guardadas (1 semana)**
- [ ] Campo `isTemplate` en schema
- [ ] UI para marcar/desmarcar plantillas
- [ ] Contador de uso de plantillas
- [ ] Sección de estadísticas básicas

### **Sprint 4: Vista Unificada de Cliente (2 semanas)**
- [ ] Nueva página ClientDetail en ruta `/clients/:clientId`
- [ ] Usar `useParams()` para obtener clientId de la URL
- [ ] Tabs de información/cotizaciones/perfil
- [ ] Integración con cotizaciones del cliente
- [ ] Botón crear cotización desde cliente usando `navigate('/calculator/new?clientId=...')`
- [ ] Actualizar `Clients.jsx` para navegar con `<Link to={`/clients/${client.id}`}>`

### **Sprint 5: Optimizaciones Finales (1 semana)**
- [ ] Menú de acciones rápidas (FAB)
- [ ] Selector de cliente mejorado con búsqueda
- [ ] Previsualización de impacto de precios
- [ ] Plantillas predefinidas de perfiles

---

## 🎨 Mockups Conceptuales

### Flujo Nuevo vs Actual

**FLUJO ACTUAL (Fragmentado)**
```
Usuario quiere cotizar para cliente nuevo:
1. Ir a "Clientes" → Crear cliente → Asignar perfil
2. Ir a "Calculator" → Seleccionar cliente → Llenar formulario
3. Guardar → Ir a "Cotizaciones Guardadas" → Ver resultado
Total: 3 páginas navegadas
```

**FLUJO PROPUESTO (Unificado)**
```
Usuario quiere cotizar para cliente nuevo:
1. Ir a "Calculator" → Opción "Cliente Nuevo"
2. Modal inline → Crear cliente rápido
3. Automáticamente carga en stepper → Llenar formulario
4. Guardar → Opción "Ver en guardadas" o "Nueva cotización"
Total: 1 página, flujo continuo
```

---

## 🔄 Cambios en Arquitectura de Datos

### Nuevos Campos en Firestore

#### Collection: `quotations`
```javascript
{
  ...existingFields,
  isTemplate: false,
  templateName: "",
  usageCount: 0,
  duplicatedFrom: null,  // ID de cotización original si es duplicada
  createdVia: "manual" | "template" | "duplicate"
}
```

#### Collection: `clients`
```javascript
{
  ...existingFields,
  quotationCount: 0,      // Total de cotizaciones
  lastQuotationDate: null,
  totalRevenue: 0         // Suma de cotizaciones aprobadas
}
```

---

## 📊 Métricas de Éxito

### KPIs a Medir Después de Implementar Mejoras

1. **Tiempo promedio para crear cotización**: Reducir de ~5min a ~2min
2. **Clics necesarios para cotización completa**: Reducir de ~20 a ~8
3. **Tasa de uso de plantillas**: Meta >40% de cotizaciones desde plantillas
4. **Clientes creados inline**: Meta >70% desde Calculator
5. **Navegación entre páginas**: Reducir en 50%

---

## 🚧 Consideraciones Técnicas

### Refactorizaciones Necesarias

1. **React Router Setup**
   - Instalar `react-router-dom`
   - Crear configuración de rutas en `src/router/index.jsx`
   - Implementar `MainLayout` con `<Outlet />` para páginas anidadas
   - Migrar navegación actual a usar hooks de React Router

2. **Hooks Compartidos**
   - Mover `useClients` a un contexto global
   - Crear `useQuotationTemplates` hook
   - Crear `useClientStats` hook

3. **Componentes Reutilizables**
   - `ClientSelectorWithCreate` (selector + creación inline)
   - `PriceProfileIndicator` (indicador de perfil activo)
   - `QuotationQuickActions` (acciones rápidas)
   - `FloatingActionButton` (FAB para acciones rápidas)

4. **Nuevas Utilidades**
   - `quotationTemplates.js` (lógica de plantillas)
   - `clientStats.js` (cálculos estadísticos)

---

## 💡 Ideas Adicionales (Backlog)

### Funcionalidades Futuras (Post-MVP)

1. **Dashboard Principal**
   - Resumen de actividad del día/semana/mes
   - Gráficos de cotizaciones por estado
   - Clientes más activos

2. **Notificaciones**
   - Recordatorios de cotizaciones pendientes
   - Alertas de cambios en precios
   - Seguimiento de cotizaciones enviadas

3. **Comparador de Cotizaciones**
   - Comparar 2-3 cotizaciones lado a lado
   - Ver diferencias en ítems y precios

4. **Modo Offline**
   - Guardar cotizaciones en IndexedDB
   - Sincronizar cuando vuelva la conexión

5. **Exportación Avanzada**
   - Excel de cotizaciones por período
   - Reportes de rentabilidad por cliente

6. **Multiusuario**
   - Roles (admin, vendedor)
   - Cotizaciones compartidas entre usuarios

---

## ✅ Conclusión

Este plan transforma Litografía Pro de una aplicación con **4 módulos aislados** a un **sistema integrado con flujos de trabajo continuos**.

**Beneficios clave**:
- ✅ Menos clics, más productividad
- ✅ Flujos guiados e intuitivos
- ✅ Aprovechamiento de datos históricos
- ✅ Transparencia en cálculos de precios
- ✅ Experiencia de usuario fluida

**Implementación progresiva**: Cada sprint añade valor sin romper funcionalidad existente.

---

**Fecha de creación**: Octubre 11, 2025
**Autor**: Plan generado para mejorar UX/UI de Litografía Pro
**Estado**: 📝 Propuesta - Pendiente de aprobación
