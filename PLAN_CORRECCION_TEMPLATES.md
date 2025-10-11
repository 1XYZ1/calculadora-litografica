# Plan de Corrección: Flujo de Templates

## 🔍 Análisis del Problema Actual

### Comportamiento Actual (INCORRECTO)
Cuando un usuario selecciona una plantilla mediante `TemplateSelector.jsx`:

1. **Navigation State:** Se navega con `state: { quotation: template, fromTemplate: true }`
2. **Carga en Calculator:** El hook `useQuotation` trata la plantilla como una cotización normal para editar
3. **Cliente NO se preserva:** La plantilla usa su cliente original, pero el usuario NO puede cambiar el cliente fácilmente
4. **Perfil de Precio NO se preserva:** Se carga el perfil basado en el cliente original de la plantilla
5. **Items se cargan:** ✅ Correcto (pero sin flujo de modificación claro)
6. **Propósito difuso:** No queda claro que es una plantilla para crear NUEVA cotización

### Comportamiento Esperado (CORRECTO)
Una plantilla debería funcionar como un **molde reutilizable**:

1. ✅ **Mismos items:** Configuraciones, materiales, acabados, cantidades
2. ✅ **Perfil de precio configurable:** Usar el perfil de la plantilla O permitir cambiarlo
3. ✅ **Permitir modificaciones:** El usuario debe poder:
   - Cambiar el cliente destino
   - Cambiar el perfil de precio (con advertencia de re-cálculo)
   - Modificar nombre de cotización
   - Ajustar items individuales (cantidades, materiales, etc.)
   - Mantener la estructura general
4. ✅ **Nueva cotización:** Al guardar, se crea una NUEVA cotización (no edita la plantilla)
5. ✅ **Tracking:** Incrementar `usageCount` de la plantilla y guardar metadata de cambios original

---

## 📋 Plan de Implementación

### **Fase 1: Rediseñar Flujo de Navegación**

#### 1.1 Modificar `TemplateSelector.jsx`
**Archivo:** `src/pages/Calculator/components/TemplateSelector.jsx`

**Cambios:**
```jsx
// ANTES (línea 18-26)
const handleUseTemplate = () => {
  if (!selectedTemplate) return;
  navigate('/calculator/edit', {
    state: {
      quotation: selectedTemplate,
      fromTemplate: true
    }
  });
  onClose();
};

// DESPUÉS
const handleUseTemplate = () => {
  if (!selectedTemplate) return;
  navigate('/calculator/config', {
    state: {
      templateData: selectedTemplate,
      mode: 'from-template'
    }
  });
  onClose();
};
```

**Justificación:** Llevar al usuario primero a `/calculator/config` para que pueda:
- Seleccionar el cliente destino
- Definir el nombre de la nueva cotización
- Ver preview de lo que está por crear desde la plantilla

---

#### 1.2 Crear Pantalla de Configuración con Template Preview
**Archivo:** `src/pages/Calculator/components/QuotationInitialScreen.jsx`

**Nuevas Props Necesarias:**
```jsx
function QuotationInitialScreen({
  // ... props existentes
  templateData,        // Nuevo: datos de la plantilla si viene de template
  mode,                // Nuevo: 'normal' | 'from-template'
  // ...
})
```

**Cambios en UI:**
1. Detectar `mode === 'from-template'`
2. Mostrar sección adicional:
   - **Preview de Template:** Nombre, cantidad de items, cliente original, perfil de precio original
   - **Mensaje informativo:** "Creando nueva cotización desde plantilla: [nombre]"
3. **Cliente selector:**
   - Permitir seleccionar CUALQUIER cliente (no forzar el de la plantilla)
   - Sugerencia: Pre-seleccionar cliente original de la plantilla pero permitir cambio
   - **IMPORTANTE:** Al cambiar cliente, mostrar el perfil de precio asociado
4. **Perfil de Precio selector (NUEVO):**
   - Mostrar dropdown con perfiles de precio disponibles
   - Pre-seleccionar el perfil del cliente elegido
   - **Permitir override:** Usuario puede elegir un perfil diferente al del cliente
   - Mostrar indicador visual: "Usando perfil: [nombre del perfil]"
   - **Caso especial:** Si el template tiene items con precios específicos, mostrar advertencia:
     - ⚠️ "Los items se re-calcularán con el perfil seleccionado"
5. **Nombre de cotización:**
   - Pre-rellenar con: `"${templateData.templateName} - ${new Date().toLocaleDateString()}"`
   - Permitir edición completa

---

### **Fase 2: Rediseñar Hook `useQuotation`**

#### 2.1 Mejorar `loadFromTemplate()`
**Archivo:** `src/pages/Calculator/hooks/useQuotation.js` (líneas 234-244)

**ANTES (lógica incompleta):**
```javascript
const loadFromTemplate = useCallback((templateData, newClientId, newClientName, newQuotationName = null) => {
  if (!templateData) return;

  setClientId(newClientId);
  setClientName(newClientName);
  setMainQuotationName(
    newQuotationName || `${templateData.templateName || templateData.name} (desde plantilla)`
  );
  setEditingQuotationId(null); // Nueva cotización, no edición
  // Los items se cargarán desde templateData.items
}, [setClientId, setClientName, setMainQuotationName, setEditingQuotationId]);
```

**DESPUÉS (lógica completa):**
```javascript
const loadFromTemplate = useCallback((templateData, newClientId, newClientName, selectedPriceProfileId, newQuotationName = null) => {
  if (!templateData) return;

  // Configurar info básica
  setClientId(newClientId);
  setClientName(newClientName);
  setMainQuotationName(
    newQuotationName || `${templateData.templateName || templateData.name} - ${new Date().toLocaleDateString()}`
  );

  // CRITICAL: Cargar items de la plantilla
  // NOTA: Los items se re-calcularán automáticamente en el stepper con el nuevo perfil de precio
  setItems(templateData.items || []);

  // Asegurar que NO está en modo edición
  setEditingQuotationId(null);

  // Guardar referencia a plantilla original para tracking
  setTemplateSource({
    templateId: templateData.id,
    templateName: templateData.templateName || templateData.name,
    originalPriceProfileId: templateData.priceProfileId,      // Perfil original del template
    selectedPriceProfileId: selectedPriceProfileId,            // Perfil seleccionado por usuario
  });
}, []);
```

**Nuevo estado necesario:**
```javascript
const [templateSource, setTemplateSource] = useState(null);
```

**IMPORTANTE:** El `selectedPriceProfileId` se usará para:
1. Cargar precios desde `useDynamicPriceData(clientId)` automáticamente
2. Re-calcular todos los items con los nuevos precios al entrar al stepper
3. Guardar en la metadata de la nueva cotización para tracking

---

#### 2.2 Modificar `saveQuotation()` para manejar templates
**Archivo:** `src/pages/Calculator/hooks/useQuotation.js` (líneas 127-168)

**Cambios en `quotationData`:**
```javascript
const quotationData = {
  name: mainQuotationName,
  clientName,
  clientId,
  timestamp: Timestamp.now(),
  items,
  grandTotals,
  status: "pending",
  // Tracking de templates
  isTemplate: false,
  templateName: "",
  usageCount: 0,
  duplicatedFrom: templateSource?.templateId || null,     // ← NUEVO
  createdVia: templateSource ? "template" : "manual",     // ← MODIFICADO
};
```

**Después de guardar (incrementar usageCount):**
```javascript
await addDoc(quotationsCollectionRef, quotationData);

// Si viene de template, incrementar contador
if (templateSource?.templateId) {
  const templateRef = doc(
    db,
    `artifacts/${appId}/users/${userId}/quotations`,
    templateSource.templateId
  );
  await updateDoc(templateRef, {
    usageCount: increment(1),
    lastUsedAt: Timestamp.now()
  });
}

// Limpiar templateSource después de guardar
setTemplateSource(null);
```

**Metadata adicional a guardar (NUEVO):**
```javascript
const quotationData = {
  // ... campos existentes

  // Template tracking extendido
  templateMetadata: templateSource ? {
    originalTemplateId: templateSource.templateId,
    originalTemplateName: templateSource.templateName,
    originalPriceProfileId: templateSource.originalPriceProfileId,
    usedPriceProfileId: templateSource.selectedPriceProfileId,
    priceProfileChanged: templateSource.originalPriceProfileId !== templateSource.selectedPriceProfileId,
  } : null,
};
```

**Justificación:** Permite auditar si el usuario cambió el perfil de precio al usar la plantilla.

---

### **Fase 3: Actualizar Calculator Principal**

#### 3.1 Detectar modo template en `Calculator.jsx`
**Archivo:** `src/pages/Calculator/Calculator.jsx`

**Líneas 38-40 (estado inicial):**
```javascript
// ANTES
const loadedQuotationFromState = location.state?.quotation || null;

// DESPUÉS
const loadedQuotationFromState = location.state?.quotation || null;
const templateDataFromState = location.state?.templateData || null;
const navigationMode = location.state?.mode || 'normal';
```

**Nuevo useEffect para cargar template:**
```javascript
useEffect(() => {
  if (templateDataFromState && navigationMode === 'from-template') {
    // Esperar a que el usuario configure cliente y nombre en /calculator/config
    // NO cargar automáticamente aquí
  }
}, [templateDataFromState, navigationMode]);
```

---

#### 3.2 Pasar `templateData` a `QuotationInitialScreen`
**Archivo:** `src/pages/Calculator/Calculator.jsx` (líneas 428-440)

```jsx
{location.pathname === '/calculator/config' && (
  <QuotationInitialScreen
    mainQuotationName={mainQuotationName}
    setMainQuotationName={setMainQuotationName}
    clientId={clientId}
    setClientId={setClientId}
    setClientName={setClientName}
    templateData={templateDataFromState}           // ← NUEVO
    mode={navigationMode}                           // ← NUEVO
    priceProfiles={priceProfiles}                   // ← NUEVO: pasar lista de perfiles
    selectedPriceProfileId={selectedPriceProfileId} // ← NUEVO: estado para perfil seleccionado
    setSelectedPriceProfileId={setSelectedPriceProfileId} // ← NUEVO
    onBeginQuotation={handleBeginQuotation}
    onNavigateToClients={() => navigate("/clients")}
    onLoadFromTemplate={loadFromTemplate}          // ← NUEVO
  />
)}
```

**Nuevos estados necesarios en Calculator.jsx:**
```javascript
const [selectedPriceProfileId, setSelectedPriceProfileId] = useState(null);

// Hook para cargar perfiles de precio
const { profiles: priceProfiles } = usePriceProfilesList();
```

---

#### 3.3 Nuevo handler en Calculator
**Archivo:** `src/pages/Calculator/Calculator.jsx`

```javascript
// Handler: Comenzar cotización desde template (después de configurar en /config)
const handleBeginQuotationFromTemplate = useCallback(() => {
  if (mainQuotationName.trim() === "" || !clientId) {
    showToast(
      "Debes completar el nombre del presupuesto y seleccionar un cliente",
      "error"
    );
    return;
  }

  if (!selectedPriceProfileId) {
    showToast(
      "Debes seleccionar un perfil de precio",
      "error"
    );
    return;
  }

  if (templateDataFromState) {
    // Cargar items de la plantilla con el nuevo cliente y perfil de precio
    loadFromTemplate(
      templateDataFromState,
      clientId,
      clientName,
      selectedPriceProfileId,  // ← NUEVO parámetro
      mainQuotationName
    );

    // Navegar al stepper
    navigate('/calculator/edit');
  }
}, [
  mainQuotationName,
  clientId,
  clientName,
  selectedPriceProfileId,   // ← NUEVO dependency
  templateDataFromState,
  loadFromTemplate,
  showToast,
  navigate
]);
```

**Modificar handler existente para soportar ambos modos:**
```javascript
const handleBeginQuotation = useCallback(() => {
  if (navigationMode === 'from-template') {
    handleBeginQuotationFromTemplate();
  } else {
    // Flujo normal (sin template)
    if (mainQuotationName.trim() === "" || !clientId) {
      showToast(
        "Debes completar el nombre del presupuesto y seleccionar un cliente",
        "error"
      );
      return;
    }
    navigate('/calculator/edit');
  }
}, [navigationMode, handleBeginQuotationFromTemplate, mainQuotationName, clientId, showToast, navigate]);
```

---

### **Fase 4: Mejorar UI de `QuotationInitialScreen`**

#### 4.1 Agregar sección de template preview
**Archivo:** `src/pages/Calculator/components/QuotationInitialScreen.jsx`

**Nueva sección (cuando `mode === 'from-template'`):**
```jsx
{/* Template Preview Section */}
{mode === 'from-template' && templateData && (
  <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl">
    <div className="flex items-start gap-3">
      <div className="p-2 bg-amber-100 rounded-lg">
        <span className="text-2xl">📋</span>
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-gray-900 mb-1">
          Creando desde plantilla: "{templateData.templateName || templateData.name}"
        </h3>
        <div className="space-y-1 text-sm text-gray-700">
          <p>• <strong>{templateData.items?.length || 0}</strong> ítems pre-configurados</p>
          <p>• Cliente original: <strong>{templateData.clientName}</strong></p>
          <p>• Perfil de precio original: <strong>{getProfileName(templateData.priceProfileId)}</strong></p>
          <p>• Usada <strong>{templateData.usageCount || 0}</strong> {templateData.usageCount === 1 ? 'vez' : 'veces'}</p>
        </div>
        <div className="mt-3 p-2 bg-white rounded border border-amber-200 text-xs text-gray-600">
          💡 Los ítems se cargarán con la misma configuración. Podrás modificarlos antes de guardar.
        </div>
      </div>
    </div>
  </div>
)}

{/* Selector de Perfil de Precio - Solo en modo template */}
{mode === 'from-template' && (
  <div className="mb-4">
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      Perfil de Precio *
    </label>
    <select
      value={selectedPriceProfileId || ''}
      onChange={(e) => setSelectedPriceProfileId(e.target.value)}
      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
    >
      <option value="">-- Seleccionar perfil --</option>
      {priceProfiles.map(profile => (
        <option key={profile.id} value={profile.id}>
          {profile.name} {profile.id === templateData?.priceProfileId ? '(Original)' : ''}
        </option>
      ))}
    </select>

    {selectedPriceProfileId && selectedPriceProfileId !== templateData?.priceProfileId && (
      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-300 rounded text-xs text-yellow-800">
        ⚠️ Has seleccionado un perfil diferente al original. Los ítems se re-calcularán con los nuevos precios.
      </div>
    )}
  </div>
)}
```

**Helper function para obtener nombre del perfil:**
```javascript
const getProfileName = (profileId) => {
  const profile = priceProfiles.find(p => p.id === profileId);
  return profile?.name || 'Desconocido';
};
```

---

### **Fase 5: Eliminación de Lógica Obsoleta**

#### 5.1 Remover lógica de edición de templates
**Archivos a revisar:**
- `src/pages/Calculator/Calculator.jsx` (líneas 302-316)

**Código a eliminar/modificar:**
```javascript
// Detectar si se cargó una cotización desde el estado de navegación
useEffect(() => {
  if (loadedQuotationFromState) {
    // ANTES: navigate('/calculator/edit', { replace: true });
    // DESPUÉS: Distinguir entre edición y template
    if (location.state?.fromTemplate) {
      // Ya no debería llegar aquí - TemplateSelector ahora navega a /config
      console.warn('Template flow should go through /config first');
    } else {
      // Edición normal
      navigate('/calculator/edit', { replace: true });
    }
  }
}, [loadedQuotationFromState, navigate]);
```

---

## 🔄 Flujo Completo Rediseñado

### **Flujo A: Usuario selecciona template desde TemplateSelector**

```
1. Usuario abre TemplateSelector desde CalculatorHome
   ↓
2. Selecciona una plantilla
   ↓
3. Click "Usar esta plantilla"
   ↓
4. Navegación: /calculator/config
   state: { templateData: {...}, mode: 'from-template' }
   ↓
5. QuotationInitialScreen muestra:
   - Preview de la plantilla (items, cliente original, perfil de precio original)
   - Selector de cliente (pre-seleccionado cliente original, permite cambio)
   - Selector de perfil de precio (pre-seleccionado perfil original, permite cambio)
   - Advertencia si cambia perfil: "Los items se re-calcularán"
   - Input de nombre (pre-rellenado: "Template Name - fecha")
   ↓
6. Usuario modifica cliente/nombre/perfil y click "Comenzar Cotización"
   ↓
7. handleBeginQuotationFromTemplate():
   - loadFromTemplate(templateData, newClientId, newClientName, selectedPriceProfileId, newName)
   - Carga items de la plantilla
   - Navega a /calculator/edit
   ↓
8. Stepper se inicia con items pre-cargados (se re-calculan con perfil seleccionado)
   ↓
9. Usuario revisa/modifica items en cada paso
   ↓
10. Al guardar:
    - Se crea NUEVA cotización (no edita plantilla)
    - duplicatedFrom = templateId
    - createdVia = "template"
    - templateMetadata con info de perfiles (original vs seleccionado)
    - Se incrementa usageCount de la plantilla original
```

### **Flujo B: Usuario duplica desde SavedQuotations**

```
1. Usuario selecciona "Duplicar" en QuotationCard
   ↓
2. Se abre DuplicateQuotationModal
   ↓
3. Selecciona cliente y nombre
   ↓
4. executeDuplicate() crea nueva cotización directamente en Firestore
   ↓
5. NO navega a Calculator (permanece en SavedQuotations)
```

**Diferencia clave:** Templates usan Calculator para modificaciones antes de guardar.

---

## ✅ Checklist de Implementación

### Fase 1: Navegación
- [ ] Modificar `TemplateSelector.jsx` - navegar a `/calculator/config` con `templateData`
- [ ] Actualizar `Calculator.jsx` - detectar `templateData` y `mode` desde navigation state

### Fase 2: QuotationInitialScreen
- [ ] Agregar props `templateData` y `mode`
- [ ] Mostrar template preview cuando `mode === 'from-template'`
- [ ] Agregar selector de perfil de precio (dropdown con perfiles disponibles)
- [ ] Pre-seleccionar perfil del template original (permitir cambio)
- [ ] Mostrar advertencia si se cambia el perfil de precio
- [ ] Pre-rellenar cliente y nombre (permitir edición)
- [ ] Modificar `onBeginQuotation` para distinguir flujos

### Fase 3: useQuotation Hook
- [ ] Completar `loadFromTemplate()` - cargar items y metadata
- [ ] Agregar parámetro `selectedPriceProfileId` a `loadFromTemplate()`
- [ ] Agregar estado `templateSource` para tracking (incluir perfil original y seleccionado)
- [ ] Modificar `saveQuotation()` - guardar tracking e incrementar usageCount
- [ ] Guardar metadata extendida: `templateMetadata` con info de perfiles
- [ ] Eliminar/deprecar lógica obsoleta de edición de templates

### Fase 4: Stepper
- [ ] Verificar que items pre-cargados se muestran correctamente en Paso 4
- [ ] Permitir modificación de items (editar/eliminar/agregar)
- [ ] Mostrar indicador de "Desde plantilla: [nombre]"

### Fase 5: Testing
- [ ] Crear plantilla nueva
- [ ] Usar plantilla con el MISMO perfil de precio
- [ ] Usar plantilla cambiando a DIFERENTE perfil de precio
- [ ] Verificar que los items se re-calculan con nuevos precios
- [ ] Usar plantilla cambiando cliente
- [ ] Modificar items antes de guardar
- [ ] Verificar que usageCount se incrementa
- [ ] Verificar que se crea NUEVA cotización (no edita plantilla)
- [ ] Verificar tracking: `duplicatedFrom`, `createdVia`, `templateMetadata`
- [ ] Verificar que `templateMetadata.priceProfileChanged` es correcto

---

## 🎯 Resultado Esperado

Después de esta corrección:

✅ **Templates son moldes reutilizables:** Misma configuración, diferentes clientes y perfiles
✅ **Flexibilidad en perfil de precio:** Usuario puede mantener el original o cambiarlo según necesidad
✅ **Re-cálculo automático:** Items se actualizan con precios del perfil seleccionado
✅ **Flujo claro:** Seleccionar template → Configurar cliente/perfil/nombre → Modificar items → Guardar NUEVA cotización
✅ **Tracking completo:** `usageCount`, `duplicatedFrom`, `createdVia`, `templateMetadata`
✅ **UX mejorada:** Usuario entiende que está CREANDO desde un template, no editando
✅ **Datos preservados:** Items, configuraciones del template original
✅ **Auditoría:** Se guarda si el perfil de precio fue cambiado respecto al original

---

## 📝 Notas Importantes

1. **NO eliminar DuplicateQuotationModal:** Ese flujo es diferente (duplicación directa sin pasar por Calculator)
2. **Mantener compatibilidad:** Cotizaciones existentes deben seguir funcionando con flujo de edición normal
3. **Perfil de precios - Casos de uso:**
   - **Caso A:** Usuario mantiene mismo perfil → Items mantienen precios exactos del template
   - **Caso B:** Usuario cambia perfil → Items se re-calculan automáticamente con nuevos precios
   - **Caso C:** Cliente nuevo tiene perfil diferente → Mostrar advertencia clara
4. **Re-cálculo de items:**
   - Los items del template tienen configuraciones (materiales, acabados, cantidades)
   - Al cambiar perfil, `useItemCalculations` re-calcula automáticamente con nuevos precios
   - NO se modifican las configuraciones, solo los precios resultantes
5. **Validación:** Asegurar que todos los campos de template se validan antes de permitir guardar
6. **Metadata extendida:** `templateMetadata` permite analizar patrones de uso (¿usuarios cambian perfiles frecuentemente?)
