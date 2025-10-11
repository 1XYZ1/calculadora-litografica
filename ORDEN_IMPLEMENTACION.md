# Roadmap de Implementación - Litografía Pro

## 📋 Orden Lógico de Implementación

Este documento define el orden recomendado para implementar las mejoras propuestas en [PLAN_MEJORA_WORKFLOW.md](./PLAN_MEJORA_WORKFLOW.md), organizadas por dependencias técnicas y valor entregado.

---

## 🎯 Iteración 1: Fundamentos (Base Técnica)

### Objetivo
Establecer la infraestructura base que las demás iteraciones necesitarán. Sin esto, habrá que refactorizar después.

### Tareas

#### 1.1 Configuración de React Router
- **Archivos**:
  - `src/router/index.jsx` - Configuración de rutas
  - `src/layouts/MainLayout.jsx` - Layout principal con Outlet
- **Funcionalidad**:
  - Instalar `react-router-dom`
  - Configurar rutas principales: `/calculator`, `/clients`, `/clients/:clientId`, `/price-profiles`, `/quotations`
  - Implementar layout con Header y navegación persistente
  - Usar `useNavigate` para navegación programática
  - Usar `useLocation` para rutas activas en navegación

**Referencias del plan**:
- [FASE 3.1 - React Router y Navegación](./PLAN_MEJORA_WORKFLOW.md#31-react-router-y-navegación)
- [FASE 3.3 - Navegación con React Router](./PLAN_MEJORA_WORKFLOW.md#33-navegación-con-react-router)

#### 1.2 Migración de Schema en Firestore
- **Colecciones afectadas**: `quotations`, `clients`
- **Nuevos campos en `quotations`**:
  ```javascript
  {
    isTemplate: false,
    templateName: "",
    usageCount: 0,
    duplicatedFrom: null,
    createdVia: "manual" | "template" | "duplicate"
  }
  ```
- **Nuevos campos en `clients`**:
  ```javascript
  {
    quotationCount: 0,
    lastQuotationDate: null,
    totalRevenue: 0
  }
  ```
- **Script de migración**: Crear script para actualizar documentos existentes

**Referencias del plan**:
- [Cambios en Arquitectura de Datos](./PLAN_MEJORA_WORKFLOW.md#-cambios-en-arquitectura-de-datos)

#### 1.3 Hooks Compartidos Básicos
- **Refactorizar `useClients`**: Mover a contexto global `ClientsContext`
- **Crear `useClientStats`**: Hook para calcular métricas de clientes
- **Estructura**:
  ```
  src/
    context/
      ClientsContext.jsx
    hooks/
      useClientStats.js
    router/
      index.jsx
    layouts/
      MainLayout.jsx
  ```

**Referencias del plan**:
- [Refactorizaciones Necesarias - Hooks Compartidos](./PLAN_MEJORA_WORKFLOW.md#refactorizaciones-necesarias)

### Entregable
- ✅ React Router configurado con todas las rutas
- ✅ Navegación con `useNavigate` y `Link` componentes
- ✅ Schemas de Firestore actualizados
- ✅ Datos existentes migrados
- ✅ Hooks compartidos disponibles para otras iteraciones

---

## 🚀 Iteración 2: Quick Wins (Máximo Impacto)

### Objetivo
Implementar mejoras de alto impacto con esfuerzo bajo. Mejoras tangibles que el usuario notará inmediatamente.

### Tareas

#### 2.1 Creación de Cliente Inline
- **Ubicación**: `src/pages/Calculator/components/QuotationInitialScreen.jsx`
- **Funcionalidad**:
  - Agregar opción "+ Crear nuevo cliente" en selector
  - Implementar modal `ClientFormModal` reutilizable
  - Auto-seleccionar cliente creado tras guardarlo
- **Componente nuevo**: `src/components/ClientFormModal.jsx`

**Referencias del plan**:
- [FASE 1.2 - Creación de Cliente Inline](./PLAN_MEJORA_WORKFLOW.md#12-creación-de-cliente-inline)
- [Sprint 1 - Quick Wins](./PLAN_MEJORA_WORKFLOW.md#sprint-1-quick-wins-1-semana)

#### 2.2 Indicador de Perfil de Precios en Calculator
- **Ubicación**: Header del stepper en `src/pages/Calculator/Calculator.jsx`
- **Componente nuevo**: `src/pages/Calculator/components/PriceProfileIndicator.jsx`
- **Funcionalidad**:
  - Mostrar perfil activo del cliente
  - Tooltip con detalles (margen, tasa BCV, etc.)
  - Botón "Cambiar perfil temporalmente" (sin guardar en cliente)

**Referencias del plan**:
- [FASE 1.3 - Indicador de Perfil de Precios](./PLAN_MEJORA_WORKFLOW.md#13-indicador-de-perfil-de-precios-en-calculator)

#### 2.3 Botón Duplicar Cotización
- **Ubicación**: `src/pages/SavedQuotations/components/QuotationCard.jsx`
- **Funcionalidad**:
  - Agregar botón "Duplicar" en cada cotización
  - Modal simple: ¿Cambiar cliente? ¿Renombrar?
  - Cargar cotización duplicada en Calculator
- **Tracking**: Registrar `duplicatedFrom` y `createdVia: "duplicate"`

**Referencias del plan**:
- [FASE 2.2 - Duplicación Inteligente](./PLAN_MEJORA_WORKFLOW.md#22-duplicación-inteligente-de-cotizaciones)

### Entregable
- ✅ Usuarios pueden crear clientes sin salir de Calculator
- ✅ Visibilidad del perfil de precios activo
- ✅ Cotizaciones se pueden duplicar en 2 clics

---

## 📋 Iteración 3: Sistema de Plantillas

### Objetivo
Implementar el sistema completo de plantillas para reducir trabajo repetitivo. Aprovecha infraestructura de Iteración 1 y 2.

### Tareas

#### 3.1 Marcar/Desmarcar Plantillas
- **Ubicación**: `src/pages/SavedQuotations/components/QuotationCard.jsx`
- **Funcionalidad**:
  - Checkbox "Marcar como plantilla"
  - Input para nombre descriptivo de plantilla
  - Actualizar Firestore con `isTemplate: true`

#### 3.2 Sección de Plantillas en SavedQuotations
- **Componente nuevo**: `src/pages/SavedQuotations/components/TemplatesSection.jsx`
- **Funcionalidad**:
  - Filtrar cotizaciones con `isTemplate: true`
  - Ordenar por `usageCount` descendente
  - Botón "Usar plantilla" → carga en Calculator

#### 3.3 Hook de Plantillas
- **Archivo nuevo**: `src/hooks/useQuotationTemplates.js`
- **Funciones**:
  - `useTemplates(userId)` - Filtrar plantillas
  - `incrementUsageCount(templateId)` - Actualizar contador
  - `duplicateFromTemplate(templateId, newClientId)` - Crear desde plantilla

#### 3.4 Contador de Uso
- **Ubicación**: `src/utils/calculationEngine.js` o `src/pages/Calculator/hooks/useQuotation.js`
- **Funcionalidad**:
  - Al guardar cotización desde plantilla, incrementar `usageCount`
  - Registrar `duplicatedFrom` con ID de plantilla
  - Registrar `createdVia: "template"`

**Referencias del plan**:
- [FASE 2.1 - Modo "Plantilla"](./PLAN_MEJORA_WORKFLOW.md#21-modo-plantilla-para-cotizaciones)
- [Sprint 3 - Cotizaciones Guardadas](./PLAN_MEJORA_WORKFLOW.md#sprint-3-mejoras-en-cotizaciones-guardadas-1-semana)

### Entregable
- ✅ Cotizaciones se pueden marcar como plantillas
- ✅ Plantillas tienen nombre descriptivo
- ✅ Contador de uso funciona automáticamente
- ✅ Sección dedicada a plantillas en SavedQuotations

---

## 🎨 Iteración 4: Pantalla de Inicio Mejorada

### Objetivo
Crear punto de entrada unificado para todos los flujos de trabajo. Requiere que plantillas (Iteración 3) y quick wins (Iteración 2) estén listos.

### Tareas

#### 4.1 Nueva Pantalla de Inicio en Calculator
- **Ruta**: `/calculator` (pantalla de inicio)
- **Componente nuevo**: `src/pages/Calculator/components/CalculatorHome.jsx`
- **Reemplaza**: `QuotationInitialScreen.jsx` (o se convierte en segundo paso)
- **Funcionalidad**:
  - 3 botones grandes: "Nueva Cotización", "Cliente Nuevo", "Desde Plantilla"
  - Sección "Cotizaciones Recientes" (últimas 5)
  - Usar `useNavigate()` para navegar a `/calculator/new`, `/clients/new`, etc.

#### 4.2 Flujo "Cliente Nuevo" Directo
- **Funcionalidad**:
  - Al hacer click en "Cliente Nuevo":
    1. Mostrar modal de creación inline
    2. Guardar cliente
    3. Automáticamente iniciar stepper con ese cliente seleccionado

#### 4.3 Flujo "Desde Plantilla"
- **Componente nuevo**: `src/pages/Calculator/components/TemplateSelector.jsx`
- **Funcionalidad**:
  - Modal con listado de plantillas disponibles
  - Preview rápido de ítems de la plantilla
  - Al seleccionar → cargar en Calculator
  - Usar hook `useTemplates` de Iteración 3

#### 4.4 Cotizaciones Recientes
- **Ubicación**: Hook `src/pages/Calculator/hooks/useQuotation.js`
- **Funcionalidad**:
  - Función `getRecentQuotations(userId, limit=5)`
  - Ordenar por `updatedAt` descendente
  - Mostrar en CalculatorHome con link directo "Abrir"

**Referencias del plan**:
- [FASE 1.1 - Pantalla de Inicio Inteligente](./PLAN_MEJORA_WORKFLOW.md#11-pantalla-de-inicio-inteligente-nueva)
- [Sprint 2 - Pantalla de Inicio](./PLAN_MEJORA_WORKFLOW.md#sprint-2-pantalla-de-inicio-mejorada-1-semana)

### Entregable
- ✅ Punto de entrada único para todos los flujos
- ✅ Flujo "Cliente Nuevo" completamente integrado
- ✅ Acceso rápido a plantillas desde inicio
- ✅ Cotizaciones recientes visibles

---

## 👤 Iteración 5: Vista Unificada de Cliente

### Objetivo
Centralizar toda la información y acciones relacionadas con un cliente en una sola página. Requiere todas las piezas anteriores.

### Tareas

#### 5.1 Nueva Página ClientDetail
- **Ruta**: `/clients/:clientId`
- **Archivo nuevo**: `src/pages/ClientDetail/ClientDetail.jsx`
- **Estructura de tabs**:
  - Tab 1: Información del cliente
  - Tab 2: Cotizaciones del cliente
  - Tab 3: Perfil de precios asignado
  - Tab 4: Historial de actividad

#### 5.2 Tab de Información
- **Componente**: `src/pages/ClientDetail/components/ClientInfoTab.jsx`
- **Funcionalidad**:
  - Formulario editable de datos del cliente
  - Guardar cambios inline
  - Mostrar estadísticas: `quotationCount`, `totalRevenue`, `lastQuotationDate`
  - Usar hook `useClientStats`

#### 5.3 Tab de Cotizaciones
- **Componente**: `src/pages/ClientDetail/components/ClientQuotationsTab.jsx`
- **Funcionalidad**:
  - Listado filtrado de cotizaciones del cliente
  - Reutilizar `QuotationCard` con filtro `clientId`
  - Botón prominente "+ Nueva Cotización para este cliente"

#### 5.4 Tab de Perfil de Precios
- **Componente**: `src/pages/ClientDetail/components/ClientPriceProfileTab.jsx`
- **Funcionalidad**:
  - Ver perfil asignado al cliente
  - Botón "Cambiar perfil"
  - Preview de impacto: "Con este perfil, el margen promedio es X%"

#### 5.5 Navegación desde Clients
- **Modificar**: `src/pages/Clients/Clients.jsx`
- **Funcionalidad**:
  - Cada card de cliente → click → `navigate('/clients/' + clientId)`
  - Usar componente `<Link>` de React Router para navegación
  - Header automáticamente muestra ruta activa usando `useLocation()`

**Referencias del plan**:
- [FASE 4.1 - Vista de Cliente Unificada](./PLAN_MEJORA_WORKFLOW.md#41-vista-de-cliente-unificada-nueva-página)
- [Sprint 4 - Vista Unificada](./PLAN_MEJORA_WORKFLOW.md#sprint-4-vista-unificada-de-cliente-2-semanas)

### Entregable
- ✅ Página completa de detalle del cliente
- ✅ Todas las cotizaciones del cliente en un lugar
- ✅ Gestión de perfil de precios integrada
- ✅ Navegación fluida usando React Router con rutas dinámicas

---

## ⚡ Iteración 6: Optimizaciones y Estadísticas

### Objetivo
Refinar la experiencia con insights, accesos rápidos y mejoras UX. Puede implementarse después del MVP.

### Tareas

#### 6.1 Estadísticas en SavedQuotations
- **Componente nuevo**: `src/pages/SavedQuotations/components/QuotationInsights.jsx`
- **Funcionalidad**:
  - Productos más cotizados (top 3)
  - Clientes más activos (top 3)
  - Sugerencias automáticas: "Crea una plantilla para tarjetas estándar"

#### 6.2 Menú de Acciones Rápidas (FAB)
- **Componente nuevo**: `src/components/FloatingActionButton.jsx`
- **Funcionalidad**:
  - Botón flotante en esquina inferior derecha
  - Menu desplegable: Nueva Cotización, Nuevo Cliente, Ver Guardadas, Configurar Precios
  - Visible en todas las páginas excepto Calculator (para no interferir)

#### 6.3 Selector de Cliente Mejorado
- **Componente nuevo**: `src/components/ClientSelectorEnhanced.jsx`
- **Funcionalidad**:
  - Búsqueda en tiempo real (filtrar por nombre, email, teléfono)
  - Mostrar stats inline: "12 cotizaciones previas"
  - Ordenar por: Más recientes, Más cotizaciones, Alfabético
  - Reemplazar selector actual en Calculator

#### 6.4 Previsualización de Impacto de Precios
- **Ubicación**: `src/pages/PriceProfiles/PriceProfiles.jsx`
- **Funcionalidad**:
  - Al editar precio, calcular impacto en cotizaciones recientes
  - Mostrar ejemplo: "Tarjetas estándar: +$2.50 (↑5%)"
  - Advertencia si el cambio es >20%

#### 6.5 Plantillas Predefinidas de Perfiles
- **Ubicación**: `src/pages/PriceProfiles/PriceProfiles.jsx`
- **Funcionalidad**:
  - Botón "Importar plantilla"
  - 3 presets disponibles:
    - Estándar (margen 30%)
    - Mayorista (margen 15%)
    - Premium (margen 50%)
  - Aplicar valores predefinidos a todos los precios

**Referencias del plan**:
- [FASE 2.3 - Estadísticas y Sugerencias](./PLAN_MEJORA_WORKFLOW.md#23-estadísticas-y-sugerencias)
- [FASE 3.2 - Menú de Acciones Rápidas](./PLAN_MEJORA_WORKFLOW.md#32-menú-de-acciones-rápidas)
- [FASE 4.2 - Selector de Cliente Mejorado](./PLAN_MEJORA_WORKFLOW.md#42-selector-de-cliente-mejorado)
- [FASE 5.1 - Previsualización de Impacto](./PLAN_MEJORA_WORKFLOW.md#51-previsualización-de-impacto-de-precios)
- [FASE 5.2 - Perfiles Sugeridos](./PLAN_MEJORA_WORKFLOW.md#52-perfiles-de-precios-sugeridos)

### Entregable
- ✅ Insights automáticos sobre uso del sistema
- ✅ Accesos rápidos desde cualquier página
- ✅ Selector de cliente con búsqueda y stats
- ✅ Preview de impacto al cambiar precios
- ✅ Plantillas predefinidas de perfiles

---

## 📊 Resumen Visual del Orden

```
┌─────────────────────────────────────────────────────────┐
│ Iteración 1: FUNDAMENTOS                                │
│ └─> NavigationContext + Schemas + Hooks compartidos     │
│                                                          │
│ Iteración 2: QUICK WINS                                 │
│ └─> Cliente inline + Perfil indicator + Duplicar        │
│                                                          │
│ Iteración 3: PLANTILLAS                                 │
│ └─> Sistema completo de templates                       │
│                                                          │
│ Iteración 4: PANTALLA INICIO                            │
│ └─> Punto de entrada unificado                          │
│                                                          │
│ Iteración 5: VISTA CLIENTE                              │
│ └─> Hub completo de gestión por cliente                 │
│                                                          │
│ Iteración 6: OPTIMIZACIONES                             │
│ └─> Stats + FAB + Mejoras UX                            │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Criterios de Priorización

Este orden se definió usando los siguientes criterios:

1. **Dependencias técnicas**: Lo que otros módulos necesitan va primero
2. **Impacto en UX**: Quick wins tempranos para motivación
3. **Complejidad creciente**: De simple a complejo
4. **Reutilización**: Componentes base antes que features avanzadas
5. **MVP vs Nice-to-have**: Core primero, refinamientos después

---

## ✅ Hitos de Validación

Después de cada iteración, validar:

- **Iteración 1**: ¿Funciona React Router correctamente? ¿Las rutas navegan sin problemas? ¿Los nuevos campos se guardan en Firestore?
- **Iteración 2**: ¿El usuario puede crear cotizaciones sin salir de Calculator?
- **Iteración 3**: ¿Las plantillas reducen efectivamente el trabajo repetitivo?
- **Iteración 4**: ¿El flujo de inicio es intuitivo para usuarios nuevos?
- **Iteración 5**: ¿La vista de cliente centraliza toda la información relevante? ¿Las rutas dinámicas funcionan correctamente?
- **Iteración 6**: ¿Las optimizaciones mejoran la eficiencia percibida?

---

## 💡 Estrategia de Implementación

### MVP Mínimo Sólido
**Iteraciones 1 + 2 + 3 + 4** (Core Workflow Unificado)

Con esto tienes un workflow funcional y unificado que resuelve los problemas principales identificados en el plan.

### Versión Completa
**Todas las iteraciones (1-6)**

Para una experiencia pulida con todas las optimizaciones.

### Implementación Paralela (Si hay múltiples desarrolladores)
- **Developer A**: Iteraciones 1, 2, 3
- **Developer B**: Iteraciones 4, 5
- **Developer C**: Iteración 6 (en paralelo con 4 y 5)

---

## 📅 Checkpoints de Progreso

Crear issues/tasks para cada iteración con subtareas:

```markdown
## Iteración 1: Fundamentos
- [ ] React Router instalado y configurado
- [ ] Rutas principales definidas (/calculator, /clients, /clients/:id, etc.)
- [ ] MainLayout con navegación creado
- [ ] Schema migrado en Firestore
- [ ] ClientsContext implementado
- [ ] useClientStats funcionando

## Iteración 2: Quick Wins
- [ ] Cliente inline funcional
- [ ] PriceProfileIndicator visible
- [ ] Duplicar cotización funcionando

... (continuar para cada iteración)
```

---

**Fecha de creación**: Octubre 11, 2025
**Basado en**: [PLAN_MEJORA_WORKFLOW.md](./PLAN_MEJORA_WORKFLOW.md)
**Estado**: 📋 Roadmap Aprobado - Listo para Implementación
