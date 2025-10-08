<!-- 0b488401-bbe0-48d5-85ce-22cff5006833 e56b0740-f515-4e89-8327-54a02bb66381 -->
# Plan: Arquitectura Centrada en Clientes

## 1. Estructura Firestore

### Nuevas Colecciones

**Clientes**: `artifacts/{appId}/users/{userId}/clients`

```javascript
{
  id: "auto-generated",
  name: "string" (obligatorio),
  email: "string" (opcional),
  phone: "string" (opcional),
  priceProfileId: "string" (obligatorio - referencia a perfil),
  createdAt: "timestamp",
  updatedAt: "timestamp"
}
```

**Perfiles de Precios**: `artifacts/{appId}/users/{userId}/priceProfiles`

```javascript
{
  id: "auto-generated",
  name: "string" (obligatorio, ej: "Mayorista", "Minorista"),
  papers: [...], // Array igual estructura que public/data/papers
  plateSizes: [...],
  machineTypes: [...],
  finishingPrices: {...},
  digitalPrintingPrices: {...},
  settings: {
    profit: number,
    bcv: number,
    iva: number
  },
  createdAt: "timestamp",
  updatedAt: "timestamp"
}
```

**Cotizaciones Modificadas**: `artifacts/{appId}/users/{userId}/quotations`

```javascript
{
  // Campos existentes...
  clientId: "string" (obligatorio),
  clientName: "string" (mantener para mostrar nombre en UI)
}
```

## 2. Refactorizar PriceAdmin → PriceProfiles

**Renombrar**: `src/pages/PriceAdmin/` → `src/pages/PriceProfiles/`

### Cambios en Estructura

**PriceProfiles.jsx** (antes PriceAdmin.jsx):

- Agregar selector de perfil en la parte superior (dropdown)
- Botones: "Nuevo Perfil", "Duplicar Perfil", "Eliminar Perfil"
- Mostrar nombre del perfil seleccionado en el header
- Mantener toda la UI de edición de precios existente
- Estado: `selectedProfileId` para saber qué perfil se está editando

**Componentes mantener estructura**:

```
components/
  ├── BcvRateSection.jsx
  ├── DigitalPrintingSection.jsx  
  ├── FinishingSection.jsx
  ├── IvaSection.jsx
  ├── MachinesSection.jsx
  ├── PapersSection.jsx
  ├── PlatesSection.jsx
  ├── ProfitSection.jsx
  └── PriceProfileHeader.jsx (renombrar de PriceAdminHeader.jsx)
```

**Nuevos componentes**:

```
components/
  ├── ProfileSelector.jsx (dropdown + botones CRUD)
  └── ProfileFormModal.jsx (crear/editar/duplicar perfil)
```

### Cambios en Hooks

**usePriceData.js**:

- Cambiar parámetro: recibir `priceProfileId`
- Cambiar rutas Firestore de:
  - `artifacts/{appId}/public/data/...` 
  - A: `artifacts/{appId}/users/{userId}/priceProfiles/{profileId}/...`
- Mantener estructura de datos y listeners igual

**Nuevos hooks**:

```
hooks/
  ├── usePriceProfilesList.js (listar todos los perfiles)
  └── usePriceProfileCRUD.js (crear, duplicar, eliminar perfiles)
```

## 3. Crear Página de Clientes

**Nueva ubicación**: `src/pages/Clients/`

### Estructura

```
src/pages/Clients/
  ├── Clients.jsx
  ├── components/
  │   ├── ClientsHeader.jsx
  │   ├── ClientFormModal.jsx (crear/editar)
  │   ├── ClientCard.jsx
  │   └── ClientsList.jsx
  └── hooks/
      ├── useClientsData.js (fetch + listener)
      └── useClientsCRUD.js (crear, actualizar, eliminar)
```

### Funcionalidades

- Lista de clientes en tarjetas
- Modal para crear/editar cliente con campos:
  - Nombre (obligatorio)
  - Email (opcional, validar formato si se ingresa)
  - Teléfono (opcional)
  - Perfil de Precios (obligatorio, selector dropdown)
- Validación: no se puede crear cliente sin perfil de precios existente
- Mensaje informativo si no hay perfiles: "Crea un perfil de precios primero"
- Confirmación al eliminar
- Búsqueda por nombre

## 4. Actualizar Calculator

### Modificaciones en `src/pages/Calculator/`

**QuotationHeader.jsx**:

- Agregar selector de cliente (dropdown)
- Mensaje si no hay clientes: "Crea un cliente primero en la sección Clientes"
- Mantener campo de nombre de cotización

**useQuotation.js**:

- Agregar estado `selectedClientId` (obligatorio para guardar)
- Agregar estado `selectedClientName` (para guardar en cotización)
- Guardar `clientId` y `clientName` en Firestore
- Validación: no permitir guardar si no hay cliente seleccionado

**useFirestoreData.js** → crear **useDynamicPriceData.js**:

- Recibir parámetro `clientId`
- Si hay clientId: buscar cliente → obtener `priceProfileId` → cargar precios de ese perfil
- Ruta: `artifacts/{appId}/users/{userId}/priceProfiles/{profileId}/...`
- Mantener misma estructura de datos retornados
- Si no hay cliente seleccionado, retornar datos vacíos

**Calculator.jsx**:

- Mensaje de bienvenida si no hay clientes creados
- Bloquear formulario de items hasta seleccionar cliente
- Deshabilitar botones de guardar si no hay cliente seleccionado

## 5. Actualizar SavedQuotations

### Modificaciones en `src/pages/SavedQuotations/`

**QuotationCard.jsx**:

- Mostrar nombre del cliente desde `clientName`
- Badge/ícono de cliente

**SearchBar.jsx**:

- Agregar filtro por cliente (dropdown)
- Cargar lista de clientes para el filtro
- Opción "Todos los clientes" por defecto

**useQuotationsFilters.js**:

- Agregar filtro `selectedClientId`
- Aplicar filtro en la búsqueda si está seleccionado

**useQuotationsGrouping.js**:

- Mantener agrupación por clientName existente

## 6. Actualizar Navegación

**Header.jsx**:

- Cambiar "Precios" por "Configuración"
- Agregar botón "Clientes"
- Orden: Calculadora | Clientes | Configuración | Guardadas

**App.jsx**:

- Renombrar caso `"admin"` → `"priceProfiles"`
- Agregar caso `"clients"` → `<Clients />`
- Importar componentes actualizados

## 7. Hooks Compartidos Globales

**Nueva ubicación**: `src/hooks/` (nivel raíz)

```
src/hooks/
  ├── useClients.js (fetch todos los clientes del usuario)
  └── useClientProfile.js (obtener perfil de un cliente específico)
```

## Flujo de Trabajo del Usuario

1. **Primera vez (base de datos vacía)**:

   - Ir a "Configuración" → crear perfil de precios (ej: "Estándar")
   - Ir a "Clientes" → crear primer cliente y asociarlo al perfil

2. **Crear Cotización**:

   - Ir a "Calculadora"
   - Seleccionar cliente del dropdown
   - Los precios se cargan automáticamente del perfil del cliente
   - Agregar items y guardar

3. **Ver Cotizaciones**:

   - Ir a "Guardadas"
   - Filtrar por cliente si lo desea
   - Ver nombre del cliente en cada cotización

## Validaciones Clave

- No se puede crear cliente sin al menos 1 perfil de precios existente
- No se puede eliminar un perfil si tiene clientes asociados
- No se puede guardar cotización sin cliente seleccionado
- Nombre de perfil obligatorio
- Nombre de cliente obligatorio
- Email con formato válido si se proporciona

## Consideraciones Técnicas

### Rutas Firestore

- Perfiles: `artifacts/{appId}/users/{userId}/priceProfiles/{profileId}/`
- Subcolecciones/documentos dentro de perfil:
  - `papers` (subcolección)
  - `plateSizes` (subcolección)
  - `machineTypes` (subcolección)
  - `finishingPrices` (subcolección)
  - `digitalPrintingPrices` (subcolección)
  - `settings/profit` (documento)
  - `settings/bcvRate` (documento)
  - `settings/ivaRate` (documento)

### Performance

- Listeners solo en página activa
- Cache de lista de clientes en Calculator
- Cargar precios solo cuando cambia el cliente seleccionado
- Cancelar listeners al cambiar de página

### To-dos

- [ ] Diseñar y documentar estructura de colecciones Firestore para clientes y perfiles de precios
- [ ] Crear página de gestión de Clientes con CRUD completo (components, hooks, validaciones)
- [ ] Crear página de gestión de Perfiles de Precios con CRUD completo (reutilizar lógica de PriceAdmin)
- [ ] Implementar script de migración para crear cliente 'Sin Asignar', perfil 'Por Defecto', y actualizar cotizaciones existentes
- [ ] Agregar selector de cliente en Calculator y cargar precios dinámicamente según el cliente seleccionado
- [ ] Actualizar SavedQuotations para mostrar clientes en tarjetas, filtrar por cliente, y permitir asignar clientes
- [ ] Actualizar Header y App.jsx con nuevas páginas y ejecutar migración al inicio si es necesario