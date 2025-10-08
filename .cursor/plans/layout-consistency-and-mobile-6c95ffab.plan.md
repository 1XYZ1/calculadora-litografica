<!-- 6c95ffab-b0b0-4928-9c0b-23338b0753f4 63e4cde3-5f64-4ed2-ae9e-6ceeae309cbd -->
# Plan: Consistencia de Layout y Mejoras Mobile

## Objetivo

Crear una experiencia visual consistente entre todas las pantallas principales, con tarjetas que aprovechan todo el espacio disponible en móvil y mejor legibilidad de textos.

## Cambios a Implementar

### 1. Estructura de Tarjeta Base Consistente

**Patrón estándar para todas las páginas:**

- Desktop: `max-w-7xl mx-auto bg-white p-6 md:p-8 rounded-2xl shadow-xl`
- Mobile: Sin padding horizontal externo, tarjeta a todo ancho con `rounded-none sm:rounded-2xl`
- Contenedor exterior: `p-0 sm:p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen`

**Archivos a modificar:**

- `src/pages/Calculator/Calculator.jsx` (líneas 377, 410)
- `src/pages/Clients/Clients.jsx` (línea 114, 139)
- `src/pages/PriceProfiles/PriceProfiles.jsx` (línea 157, 185)
- `src/pages/SavedQuotations/SavedQuotations.jsx` (línea 89, 102)

### 2. Headers Consistentes (Estilo Clients)

**Patrón estándar basado en ClientsHeader:**

```jsx
<div className="mb-4 sm:mb-6">
  <h2 className="text-responsive-xl text-gray-800 mb-2">
    [Título de la Página]
  </h2>
  <p className="text-responsive-base text-gray-600 leading-relaxed">
    [Descripción opcional]
  </p>
</div>
```

**Archivos a actualizar:**

- `src/pages/Calculator/components/QuotationHeader.jsx` - Mantener pero ajustar tipografía
- `src/pages/PriceProfiles/components/PriceProfileHeader.jsx` (líneas 7-11)
- `src/pages/SavedQuotations/components/SavedQuotationsHeader.jsx` (líneas 7-19)

### 3. Tipografía Responsive Mejorada

**Actualizar `src/index.css`:**

Crear nueva clase para texto base con mejor legibilidad mobile:

```css
.text-responsive-base {
  @apply text-base sm:text-lg;
}

.label-responsive {
  @apply text-sm sm:text-base font-medium;
}
```

Actualizar las clases existentes para mayor tamaño en mobile:

```css
/* Antes: text-sm sm:text-base */
.text-responsive-sm {
  @apply text-base sm:text-lg;
}

/* Antes: text-xs sm:text-sm */
.text-responsive-xs {
  @apply text-sm sm:text-base font-medium;
}
```

### 4. Aplicar Nuevas Clases de Tipografía

**Labels de formularios** - Cambiar de `text-responsive-xs` a `label-responsive`:

- `src/pages/Calculator/components/QuotationHeader.jsx` (líneas 33, 49)
- Todos los labels en componentes de formularios dentro de `Calculator/components/ItemFormPanel/`
- `src/pages/Clients/components/ClientFormModal.jsx`
- `src/pages/PriceProfiles/components/` (todos los formularios)

**Párrafos descriptivos** - Cambiar de `text-responsive-sm` a `text-responsive-base`:

- `src/pages/Clients/components/ClientsHeader.jsx` (línea 13)
- Mensajes de advertencia y ayuda en todos los componentes

**Textos informativos** - Usar `text-responsive-sm` (ahora más grande):

- Contadores, metadata, información secundaria
- `src/pages/SavedQuotations/components/SavedQuotationsHeader.jsx` (línea 12)

### 5. Ajustes de Padding en Mobile

**QuotationInitialScreen** - Ajustar para que use el patrón de tarjeta consistente

- `src/pages/Calculator/components/QuotationInitialScreen.jsx`

**ClientsList** - Ya está bien, pero verificar padding interno

- `src/pages/Clients/components/ClientsList.jsx`

## Estructura Final Consistente

Todas las páginas seguirán este patrón:

```jsx
<div className="p-0 sm:p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
  <div className="max-w-7xl mx-auto bg-white p-4 sm:p-6 lg:p-8 rounded-none sm:rounded-2xl shadow-xl">
    {/* Header con estilo Clients */}
    <div className="mb-4 sm:mb-6">
      <h2 className="text-responsive-xl text-gray-800 mb-2">Título</h2>
      <p className="text-responsive-base text-gray-600">Descripción</p>
    </div>
    
    {/* Contenido específico de la página */}
  </div>
</div>
```

## Archivos Totales a Modificar

1. `src/index.css` - Actualizar clases responsive
2. `src/pages/Calculator/Calculator.jsx` - Contenedor y padding
3. `src/pages/Clients/Clients.jsx` - Añadir tarjeta contenedora
4. `src/pages/PriceProfiles/PriceProfiles.jsx` - Ajustar padding
5. `src/pages/SavedQuotations/SavedQuotations.jsx` - Ajustar padding
6. `src/pages/Calculator/components/QuotationHeader.jsx` - Labels
7. `src/pages/PriceProfiles/components/PriceProfileHeader.jsx` - Alinear estilo
8. `src/pages/SavedQuotations/components/SavedQuotationsHeader.jsx` - Alinear estilo
9. Todos los archivos en `src/pages/Calculator/components/ItemFormPanel/` - Labels
10. `src/pages/Clients/components/ClientFormModal.jsx` - Labels
11. Componentes de formulario en `src/pages/PriceProfiles/components/` - Labels

## Beneficios

- **Consistencia visual**: Todas las pantallas lucen uniformes
- **Mejor UX en móvil**: Tarjetas a pantalla completa aprovechan el espacio
- **Mayor legibilidad**: Textos más grandes facilitan la lectura en móvil
- **Accesibilidad**: Labels más grandes mejoran la experiencia táctil