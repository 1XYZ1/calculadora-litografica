<!-- 932a591f-465e-42a7-833b-d5fc9b8660d1 bbe65cc1-0db1-4e2f-893a-8d76f2256f8a -->
# Plan: Corrección de Flujo de Edición de Presupuestos

## Problemas Identificados

1. **Cancelar edición rompe la aplicación**: Al dar click en "Cancelar Edición" en el paso 4, el componente resetea el estado pero no navega a ninguna página, causando que la UI quede en un estado inconsistente.

2. **Botón "Guardar Cotización" aparece incorrectamente en Paso 3**: En el paso 3 (Resumen del Item), aparece un botón verde "Guardar Cotización" en StepNavigationButtons que no debería estar ahí. Este paso ya tiene su propio botón específico "Agregar/Actualizar Item".

## Solución Propuesta

### 1. Modificar el flujo de cancelación en Calculator.jsx

**Archivo**: `src/pages/Calculator/Calculator.jsx`

Modificar el prop `onNavigateToClients` para que sea genérico `onNavigateToPage` y actualizar el handler de cancelación.

**Cambio en props del componente (línea 30-34)**:

```javascript
// ANTES:
function QuotationCalculator({
  loadedQuotation = null,
  setLoadedQuotation = () => {},
  onNavigateToClients = () => {},
}) {

// DESPUÉS:
function QuotationCalculator({
  loadedQuotation = null,
  setLoadedQuotation = () => {},
  onNavigateToPage = () => {},
}) {
```

**Cambio en handler de cancelación (línea 239-244)**:

```javascript
// ANTES:
const handleCancelEdit = useCallback(() => {
  resetQuotation();
  resetItemForm();
  goToStep(1);
  showToast("Edición cancelada", "info");
}, [resetQuotation, resetItemForm, goToStep, showToast]);

// DESPUÉS:
const handleCancelEdit = useCallback(() => {
  resetQuotation();
  resetItemForm();
  setLoadedQuotation(null);
  showToast("Edición cancelada. Redirigiendo a Cotizaciones Guardadas...", "info");
  setTimeout(() => {
    onNavigateToPage("savedQuotations");
  }, 500);
}, [resetQuotation, resetItemForm, setLoadedQuotation, showToast, onNavigateToPage]);
```

**Actualizar llamada al componente hijo QuotationInitialScreen (línea 406)**:

```javascript
// ANTES:
onNavigateToClients={onNavigateToClients}

// DESPUÉS:
onNavigateToClients={() => onNavigateToPage("clients")}
```

### 2. Actualizar App.jsx para pasar el handler de navegación

**Archivo**: `src/App.jsx`

**Cambio en línea 139-144**:

```javascript
// ANTES:
{currentPage === "calculator" && (
  <Calculator
    loadedQuotation={loadedQuotationData}
    setLoadedQuotation={setLoadedQuotationData}
    onNavigateToClients={() => setCurrentPage("clients")}
  />
)}

// DESPUÉS:
{currentPage === "calculator" && (
  <Calculator
    loadedQuotation={loadedQuotationData}
    setLoadedQuotation={setLoadedQuotationData}
    onNavigateToPage={setCurrentPage}
  />
)}
```

### 3. Eliminar StepNavigationButtons del Paso 3

**Archivo**: `src/pages/Calculator/Calculator.jsx`

El Paso 3 tiene su propio botón interno de acción, por lo que NO debe mostrar StepNavigationButtons.

**Cambio en línea 451-460**:

```javascript
// ANTES:
{/* Botones de navegación - No mostrar en paso 4 (resumen final) */}
{currentStep < 4 && (
  <StepNavigationButtons
    currentStep={currentStep}
    onPrevious={handlePreviousStep}
    onNext={handleNextStep}
    isFirstStep={currentStep === 1}
    isLastStep={currentStep === 3}
    isValid={true}
  />
)}

// DESPUÉS:
{/* Botones de navegación - Solo en pasos 1 y 2 */}
{currentStep <= 2 && (
  <StepNavigationButtons
    currentStep={currentStep}
    onPrevious={handlePreviousStep}
    onNext={handleNextStep}
    isFirstStep={currentStep === 1}
    isLastStep={false}
    isValid={true}
  />
)}
```

### 4. Simplificar texto del botón en Step3ItemSummary.jsx (opcional)

**Archivo**: `src/pages/Calculator/components/Stepper/Step3ItemSummary.jsx`

Para mayor claridad, simplificar el texto del botón.

**Cambio en línea 183-187**:

```javascript
// ANTES:
<span>
  {editingItemId
    ? "Actualizar Item en el Presupuesto"
    : "Agregar Item al Presupuesto"}
</span>

// DESPUÉS:
<span>
  {editingItemId
    ? "Actualizar Item"
    : "Agregar Item"}
</span>
```

## Archivos a Modificar

1. **`src/pages/Calculator/Calculator.jsx`** - Cambiar props, handler de cancelación, y condición de StepNavigationButtons
2. **`src/App.jsx`** - Actualizar prop pasado al Calculator
3. **`src/pages/Calculator/components/Stepper/Step3ItemSummary.jsx`** - Simplificar texto del botón (opcional)

## Flujo Final Esperado

1. Usuario carga presupuesto desde SavedQuotations
2. App navega a Calculator con `loadedQuotationData` 
3. Calculator carga los datos y muestra paso 4 (resumen del presupuesto)
4. Usuario edita items o decide cancelar
5. Al dar "Cancelar Edición":

   - Se resetea todo el estado (cotización + items + formulario)
   - Se limpia `loadedQuotationData` 
   - Se muestra toast: "Edición cancelada. Redirigiendo a Cotizaciones Guardadas..."
   - Después de 500ms, navega a página "savedQuotations"

6. Usuario regresa a la lista de presupuestos guardados

## Navegación en los pasos

- **Paso 1**: Muestra botones "Anterior" (deshabilitado) y "Siguiente"
- **Paso 2**: Muestra botones "Anterior" y "Siguiente"
- **Paso 3**: NO muestra StepNavigationButtons, solo botón propio "Agregar/Actualizar Item"
- **Paso 4**: NO muestra StepNavigationButtons, solo botones propios "Guardar/Actualizar Presupuesto", "Cancelar", "Vista Previa"

## Beneficios

- Flujo de cancelación claro y predecible
- Elimina botón confuso "Guardar Cotización" del paso 3
- No deja estados inconsistentes en la UI
- Feedback visual al usuario con toast antes de navegar
- Limpieza completa del estado al cancelar
- Navegación coherente entre pasos