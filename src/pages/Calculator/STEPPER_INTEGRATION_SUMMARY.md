# Resumen de Integración del Stepper en Calculator

## Cambios Realizados

### ✅ Paso 3: CostBreakdownInline Creado

**Archivo:** `src/pages/Calculator/components/Stepper/CostBreakdownInline.jsx`

Componente inline con acordeón expandible que reemplaza el `CostBreakdownModal`. Muestra:

- Costo de papel (con detalle de pliegos)
- Costo de planchas (con cantidad)
- Costo de tiraje (con pasadas)
- Costo de acabados
- Total costo directo
- Total final con ganancia

**Características:**

- Expandible/colapsable con animación
- Iconos visuales para cada categoría
- Diseño con gradientes y bordes de color
- Se usa en el Paso 5 del stepper

---

### ✅ Paso 4: Calculator.jsx Refactorizado con Stepper

**Archivo:** `src/pages/Calculator/Calculator.jsx`

#### Cambios en Imports

**Agregados:**

- `useEffect` de React
- `ToastContainer` (reemplaza ModalMessage)
- Todos los componentes del Stepper (Step1-Step6)
- Nuevos hooks: `useStepperNavigation`, `useStepValidation`, `useToast`

**Removidos:**

- `ModalMessage`
- `CostBreakdownModal`
- `ItemFormPanel` (ahora se usan los pasos individuales)
- `ResultsPanel` (integrado en Step6)

#### Cambios en Estado

**Agregados:**

```javascript
// Sistema de notificaciones Toast
const { toasts, addToast, removeToast } = useToast();

// Navegación del stepper
const {
  currentStep,
  goToStep,
  nextStep,
  previousStep,
  canAdvance,
  completedSteps,
  markStepComplete,
} = useStepperNavigation();

// Validación de pasos
const { validateStep, getStepErrors } = useStepValidation();
```

**Removidos:**

```javascript
const [modalMessage, setModalMessage] = useState(""); // Reemplazado por Toast
const [breakdownModalItem, setBreakdownModalItem] = useState(null); // Ahora inline
```

#### Handlers Modificados

1. **`handleAddItemToQuotation`** (antes `handleAddOrUpdateItem`)

   - Usa `addToast` en lugar de `setModalMessage`
   - Navega automáticamente al Paso 6 después de agregar

2. **`handleEditItem`**

   - Navega al Paso 1 al editar
   - Muestra Toast informativo

3. **`handleSaveQuotation` / `handleUpdateQuotation`**

   - Usan Toast en lugar de modal
   - Navegan al Paso 1 después de guardar exitosamente

4. **`handleCancelEdit`**

   - Navega al Paso 1
   - Muestra Toast de confirmación

5. **`handleShowPreview`**
   - Usa Toast para errores

#### Handlers Nuevos

1. **`handleNextStep`**

   - Valida el paso actual antes de avanzar
   - Muestra errores con Toast
   - Marca paso como completado
   - Auto-skip del Paso 3 si es digital
   - Auto-scroll suave al inicio

2. **`handlePreviousStep`**
   - Navega al paso anterior
   - Auto-skip del Paso 3 si es digital
   - Auto-scroll suave al inicio

#### Efecto Nuevo

```javascript
// Auto-scroll al cargar una cotización para editar
useEffect(() => {
  if (editingQuotationId && items.length > 0) {
    goToStep(6); // Ir directo al resumen si está editando
  }
}, [editingQuotationId, items.length, goToStep]);
```

#### Renderizado Condicional

**Función `renderCurrentStep()`:**

- Switch que renderiza el paso actual (1-6)
- Pasa props específicas a cada paso
- Incluye validación de errores inline

**JSX Principal:**

```jsx
<div className="p-6 bg-gray-50 min-h-screen font-inter">
  {/* Toast en lugar de ModalMessage */}
  <ToastContainer toasts={toasts} onRemove={removeToast} />

  {/* Modal de vista previa (se mantiene) */}
  <QuotationPreviewModal ... />

  <div className="max-w-6xl mx-auto bg-white p-8 rounded-2xl shadow-xl">
    <h2>Título</h2>

    {/* QuotationHeader solo en pasos 1 y 6 */}
    {(currentStep === 1 || currentStep === 6) && <QuotationHeader ... />}

    {/* StepperHeader en pasos 1-5 */}
    {currentStep < 6 && <StepperHeader ... />}

    {/* Contenido del paso actual */}
    <div className="mt-8 mb-6">
      {renderCurrentStep()}
    </div>

    {/* Botones de navegación en pasos 1-5 */}
    {currentStep < 6 && <StepNavigationButtons ... />}
  </div>
</div>
```

---

## Flujo de Navegación

### Navegación Normal (Offset)

1. **Paso 1** → Información Básica
2. **Paso 2** → Configuración de Impresión
3. **Paso 3** → Materiales y Equipos
4. **Paso 4** → Acabados
5. **Paso 5** → Resumen del Item
6. **Paso 6** → Resumen de Cotización

### Navegación Digital (Auto-Skip Paso 3)

1. **Paso 1** → Información Básica
2. **Paso 2** → Configuración de Impresión
3. **Paso 4** → Acabados (salta Paso 3)
4. **Paso 5** → Resumen del Item
5. **Paso 6** → Resumen de Cotización

### Acciones Especiales

- **Agregar Item en Paso 5** → Va automáticamente a Paso 6
- **Editar Item en Paso 6** → Vuelve a Paso 1 con datos cargados
- **Agregar Nuevo Item en Paso 6** → Resetea formulario y va a Paso 1
- **Guardar Cotización** → Resetea todo y vuelve a Paso 1
- **Cancelar Edición** → Resetea todo y vuelve a Paso 1

---

## Sistema de Validaciones

### Validaciones por Paso

**Paso 1:**

- Nombre del item no vacío
- Cantidad total > 0
- Dimensiones > 0
- Si talonarios: validar campos adicionales

**Paso 2:**

- Área de impresión seleccionada
- Colores tiro > 0
- Si tiro/retiro sin work-and-turn: colores retiro > 0

**Paso 3:** (solo offset)

- Tipo de papel seleccionado
- Tamaño de plancha seleccionado
- Tipo de máquina seleccionado

**Paso 4:**

- Sin validaciones obligatorias (todo opcional)

**Paso 5:**

- Solo revisión

**Paso 6:**

- Al menos 1 item en la cotización para guardar

### Feedback Visual

- Errores mostrados con Toast (auto-dismiss 4s)
- Mensajes inline en los campos (componente ValidationMessage)
- Bordes rojos en campos con error
- Iconos contextuales

---

## Sistema de Notificaciones

### Tipos de Toast

1. **Success** (verde) - Operaciones exitosas
2. **Error** (rojo) - Errores de validación o guardado
3. **Info** (azul) - Información contextual

### Ejemplos de Uso

```javascript
// Éxito
addToast("Item agregado al presupuesto", "success");

// Error
addToast("Debe ingresar un nombre para el item", "error");

// Información
addToast("Editando item. Modifica los valores y guarda los cambios.", "info");
```

---

## Mejoras de UX

### Auto-Scroll

- Scroll suave al cambiar de paso
- Scroll al inicio al validar errores

### Progreso Visual

- Stepper horizontal con indicadores
- Pasos completados marcados con check
- Paso actual destacado en azul
- Pasos bloqueados en gris

### Responsive

- Stepper se adapta a móvil
- Contenido de pasos en una columna
- Botones de navegación siempre visibles

### Animaciones

- Transiciones suaves entre pasos (fade-in)
- Acordeón expandible/colapsable
- Toasts con entrada/salida animada

---

## Archivos Creados/Modificados

### Archivos Creados

1. `src/pages/Calculator/components/Stepper/CostBreakdownInline.jsx`
2. `src/pages/Calculator/components/Stepper/index.js` (exportaciones centralizadas)

### Archivos Modificados

1. `src/pages/Calculator/Calculator.jsx` (refactorización completa)

### Archivos Reutilizados

Los siguientes archivos se mantienen sin cambios y se reutilizan en los pasos:

- `ItemBasicInfo.jsx`
- `AdditionalPiecesManager.jsx`
- `PrintingAreaSelector.jsx`
- `ColorsPrintingConfig.jsx`
- `PaperMachineSelector.jsx`
- `FinishingOptions.jsx`
- `LayoutVisualization.jsx`
- `AdditionalPiecesYield.jsx`
- `ItemsList.jsx`
- `QuotationSummary.jsx`

---

## Próximos Pasos

### Pendientes

- [ ] Agregar animaciones de transición entre pasos
- [ ] Implementar indicador de progreso (progress bar)
- [ ] Testing completo del flujo
- [ ] Verificar responsive en móvil
- [ ] Ajustes finales de UX

### Testing Necesario

1. **Flujo completo Offset:**

   - Crear item → Agregar → Guardar cotización
   - Validaciones en cada paso
   - Auto-selección de plancha/máquina

2. **Flujo completo Digital:**

   - Verificar auto-skip del Paso 3
   - Navegación anterior/siguiente correcta

3. **Edición de cotización:**

   - Cargar cotización existente
   - Editar items
   - Actualizar cotización

4. **Validaciones:**

   - Intentar avanzar sin completar campos
   - Verificar mensajes de error
   - Validar todos los tipos de item

5. **Sistema Toast:**
   - Verificar auto-dismiss
   - Múltiples toasts simultáneos
   - Diferentes tipos (success, error, info)

---

## Notas Importantes

- El modal `QuotationPreviewModal` se mantiene sin cambios (abre en modal)
- El componente `QuotationHeader` se muestra solo en Pasos 1 y 6
- El stepper NO se muestra en el Paso 6 (resumen final)
- Los botones de navegación NO se muestran en el Paso 6 (tiene sus propios botones)
- La validación es inline y en tiempo real al intentar avanzar
- El auto-scroll mejora la experiencia en formularios largos

---

## Beneficios de la Refactorización

✅ **Proceso guiado** - Usuarios entienden en qué paso están

✅ **Validaciones claras** - Errores detectados antes de avanzar

✅ **Feedback no intrusivo** - Toast en lugar de modales bloqueantes

✅ **Navegación intuitiva** - Botones Anterior/Siguiente claros

✅ **Progreso visible** - Indicador de pasos completados

✅ **Auto-scroll** - No se pierde el contexto al cambiar paso

✅ **Responsive** - Funciona en todos los dispositivos

✅ **Código modular** - Componentes reutilizables y mantenibles
