# Componentes de Pasos del Stepper - Calculator

## Descripción General

Este directorio contiene los 4 componentes de pasos que conforman el flujo guiado tipo wizard de la calculadora de cotizaciones. Cada paso reutiliza componentes existentes del `ItemFormPanel` para mantener consistencia y evitar duplicación de código.

## Estructura de Pasos (4 Pasos Optimizados)

### Paso 1: Información Completa (`Step1Complete.jsx`)

**Fusión de:** Información básica + Configuración de impresión

**Componentes reutilizados:**

- `ItemBasicInfo`
- `AdditionalPiecesManager`
- `PrintingAreaSelector`
- `ColorsPrintingConfig`

**Secciones incluidas:**

1. **Información Básica:**

   - Nombre del item
   - Checkbox de talonarios (con campos condicionales: cantidad, hojas, copias)
   - Cantidad total de piezas
   - Dimensiones (ancho x alto en cm)
   - Piezas adicionales de diferentes tamaños

2. **Configuración de Impresión:**
   - Área de impresión (selector de tamaño)
   - Colores tiro
   - Checkbox tiro/retiro
   - Work-and-turn (si aplica)
   - Colores retiro (si aplica y no es work-and-turn)
   - Dúplex digital (solo para digital)

**Validaciones requeridas:**

- `quotationName`: no vacío
- `totalPieces`: > 0
- `pieceWidthCm`: > 0
- `pieceHeightCm`: > 0
- Si `isTalonarios`: validar `numTalonarios`, `sheetsPerSet`, `copiesPerSet`
- `printingAreaOption`: seleccionado (no vacío)
- `numColorsTiro`: > 0
- Si `isTiroRetiro && !isWorkAndTurn`: `numColorsRetiro` > 0

**Lógica especial:**

- Si es digital (`quarter_sheet_digital`), muestra solo checkbox de dúplex
- Si es offset, muestra configuración completa de colores y work-and-turn

---

### Paso 2: Materiales y Acabados (`Step2MaterialsFinishing.jsx`)

**Fusión de:** Materiales/Equipos + Acabados

**Componentes reutilizados:**

- `PaperMachineSelector`
- `FinishingOptions`

**Secciones incluidas:**

1. **Materiales y Equipos (solo offset):**

   - Tipo de papel (selector)
   - Sobrante en pliegos
   - Tamaño de plancha (auto-seleccionado, editable)
   - Tipo de máquina (auto-seleccionado, editable)

2. **Acabados (offset y digital):**
   - UV (checkbox + selector de tamaño)
   - Laminado mate (checkbox + opción ambas caras)
   - Laminado brillante (checkbox + opción ambas caras)
   - Remate (checkbox, deshabilitado en digital)
   - Signado (checkbox, deshabilitado en digital)
   - Troquelado (checkbox + precio fijo, deshabilitado en digital)

**Validaciones requeridas:**

- Si es **offset**:
  - `selectedPaperTypeId`: seleccionado
  - `selectedPlateSizeId`: seleccionado
  - `selectedMachineTypeId`: seleccionado
- Acabados: todos opcionales (sin validaciones)

**Lógica especial:**

- Si es digital, solo muestra sección de acabados
- Si es offset, muestra ambas secciones
- Badges visuales de acabados seleccionados
- Mensaje si no hay acabados seleccionados

---

### Paso 3: Resumen del Item (`Step3ItemSummary.jsx`)

**Componentes reutilizados:**

- `ItemCostPreview`
- `LayoutVisualization`
- `AdditionalPiecesYield`

**Secciones incluidas:**

- Nombre y dimensiones del item
- Costo total destacado
- Desglose de costos (acordeón expandible inline)
  - Papel
  - Plancha
  - Máquina
  - Acabados
  - Margen de ganancia
  - Total
- Visualización del layout (con troquelado si aplica)
- Rendimiento de piezas adicionales
- Botón "Agregar Item al Presupuesto" / "Actualizar Item"

**Validaciones requeridas:**

- Solo revisión (no se valida nada adicional)

**Características adicionales:**

- Desglose inline reemplaza el modal `CostBreakdownModal`
- Animación al expandir/colapsar desglose
- Botón dinámico según si está editando o agregando

---

### Paso 4: Resumen de Cotización (`Step4QuotationSummary.jsx`)

**Componentes reutilizados:**

- `ItemsList`
- `QuotationSummary`

**Secciones incluidas:**

- Lista de todos los items agregados
- Contador de items
- Botón para agregar más items
- Totales generales (USD y Bs)
- Botones de acción:
  - Guardar/Actualizar presupuesto
  - Cancelar edición
  - Vista previa PDF

**Validaciones requeridas:**

- `items.length` > 0 para poder guardar

**Características adicionales:**

- Mensaje de advertencia si no hay items
- Mensaje de éxito si hay items
- Opción de agregar más items sin retroceder pasos

---

## Props Comunes

Todos los componentes de pasos reciben:

```jsx
{
  currentItem,        // Estado actual del item en edición
  handleItemChange,   // Handler para cambios de inputs
  // ... props específicos según el paso
}
```

## Animaciones

Todos los pasos incluyen la clase `animate-fadeIn` para transiciones suaves:

```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

## Indicadores de Ayuda

Cada paso incluye un panel de ayuda con:

- Icono informativo
- Tip contextual según el paso
- Color distintivo (azul, verde, ámbar, etc.)

## Responsive Design

Todos los componentes están diseñados con Tailwind CSS y son completamente responsivos:

- Layouts de grid que se adaptan a móvil
- Espaciado consistente
- Tipografía escalable

## Uso en Calculator.jsx

```jsx
import {
  Step1Complete,
  Step2MaterialsFinishing,
  Step3ItemSummary,
  Step4QuotationSummary,
} from "./components/Stepper";

// Renderizar según currentStep (4 pasos)
const renderStep = () => {
  switch (currentStep) {
    case 1:
      return <Step1Complete {...props} />;
    case 2:
      return <Step2MaterialsFinishing {...props} />;
    case 3:
      return <Step3ItemSummary {...props} />;
    case 4:
      return <Step4QuotationSummary {...props} />;
    default:
      return null;
  }
};
```

## Ventajas de la Nueva Estructura (4 Pasos)

✅ **Menos clicks:** De 6 pasos a 4 pasos (33% reducción)
✅ **Flujo más fluido:** Información relacionada agrupada
✅ **Menos navegación:** Campos relacionados en la misma vista
✅ **Mejor UX:** Menos contexto switching para el usuario
✅ **Más eficiente:** Especialmente para impresión digital (solo 4 pasos vs 6)

## Mejoras Implementadas

- ✅ Fusión de pasos relacionados sin perder funcionalidad
- ✅ Validaciones consolidadas en hooks especializados
- ✅ Diseño más limpio sin emojis innecesarios
- ✅ Lógica adaptativa según tipo de impresión
- ✅ Mensajes contextuales según digital/offset

## Mejoras Futuras

- [ ] Agregar tooltips en campos complejos
- [ ] Implementar auto-save del progreso
- [ ] Agregar historial de navegación entre pasos
- [ ] Mejorar accesibilidad (ARIA labels, navegación por teclado)
- [ ] Agregar modo oscuro
- [ ] Implementar atajos de teclado (Enter para siguiente, Esc para cancelar)
