# Orden de Ejecución: Implementación de Página de Detalle de Presupuesto

> **Plan Completo:** [PLAN_DETALLE_PRESUPUESTO.md](./PLAN_DETALLE_PRESUPUESTO.md)

---

## 📊 Resumen del Proyecto

**Objetivo:** Reemplazar `QuotationPreviewModal.jsx` con una página dedicada `/quotations/:quotationId`

**Tiempo Estimado:** 12-16 horas

**Complejidad:** Media

**Prioridad:** Alta

---

## 🎯 Pre-requisitos

Antes de comenzar, verificar:

- ✅ React Router v6.21+ configurado
- ✅ Firebase Firestore funcionando
- ✅ MinIO S3 configurado en `src/config/storage.js`
- ✅ Librerías jsPDF y html2canvas cargadas en `index.html`
- ✅ `FirebaseContext` y `ClientsContext` operativos

---

## 📋 Orden de Ejecución Paso a Paso

### **PASO 1: Crear Estructura de Archivos** (30 min)

#### 1.1 Crear carpetas
```bash
mkdir -p src/pages/QuotationDetail/components
mkdir -p src/pages/QuotationDetail/hooks
mkdir -p src/pages/QuotationDetail/utils
```

#### 1.2 Crear archivos base vacíos
```bash
touch src/pages/QuotationDetail/QuotationDetail.jsx
touch src/pages/QuotationDetail/README.md
touch src/pages/QuotationDetail/components/CompanyHeader.jsx
touch src/pages/QuotationDetail/components/QuotationMetadata.jsx
touch src/pages/QuotationDetail/components/QuotationItemsTable.jsx
touch src/pages/QuotationDetail/components/QuotationFooter.jsx
touch src/pages/QuotationDetail/components/QuotationActions.jsx
touch src/pages/QuotationDetail/components/PDFExportView.jsx
touch src/pages/QuotationDetail/components/LoadingSkeleton.jsx
touch src/pages/QuotationDetail/hooks/useQuotationDetail.js
touch src/pages/QuotationDetail/hooks/usePDFGeneration.js
touch src/pages/QuotationDetail/hooks/useQuotationActions.js
touch src/pages/QuotationDetail/utils/formatters.js
```

---

### **PASO 2: Implementar Utilidades** (1 hora)

#### 2.1 Crear `formatters.js`
Copiar código de **Fase 4.1** del plan completo

**Verificación:** Importar funciones en un componente test
```javascript
import { formatMoney, formatDimension, formatDate } from '../utils/formatters';
console.log(formatMoney(1234.56)); // Debe mostrar "$1,234.56"
```

---

### **PASO 3: Implementar Hooks de Datos** (2 horas)

#### 3.1 Crear `useQuotationDetail.js`
Copiar código de **Fase 1.3** del plan completo

**Verificación:**
- Hook debe retornar `{ quotation, loading, error }`
- Debe usar `onSnapshot` para real-time updates
- Path correcto: `artifacts/${appId}/users/${userId}/quotations/${quotationId}`

#### 3.2 Crear `usePDFGeneration.js`
Copiar código de **Fase 3.1** del plan completo

**Verificación:**
- Hook retorna `{ isGeneratingPdf, pdfMessage, downloadPDF, shareViaPDFWhatsApp, shareViaTextWhatsApp }`
- Debe usar `uploadPdfToStorage` correctamente

#### 3.3 Crear `useQuotationActions.js`
Copiar código de **Fase 3.2** del plan completo

**Verificación:**
- Hook retorna `{ deleteQuotation, updateStatus, duplicateQuotation, editQuotation, isDeleting, error }`
- Navegación con `useNavigate()` funciona

---

### **PASO 4: Implementar Componentes Visuales** (3-4 horas)

#### 4.1 Crear `LoadingSkeleton.jsx`
```javascript
export default function LoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
      <div className="bg-white rounded-lg shadow p-8">
        <div className="h-4 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>
  );
}
```

#### 4.2 Crear `CompanyHeader.jsx`
Copiar código de **Fase 2.1** del plan completo

**Verificación:** Renderizar con datos mock
```javascript
<CompanyHeader companyInfo={{ name: 'Test Company' }} />
```

#### 4.3 Crear `QuotationMetadata.jsx`
Copiar código de **Fase 2.2** del plan completo

**Nota:** Importar `QUOTATION_STATUS_LABELS` de constants si existe, o crear temporalmente

#### 4.4 Crear `QuotationItemsTable.jsx`
Copiar código de **Fase 2.3** del plan completo

**Importante:** Usar helpers de `formatters.js`

#### 4.5 Crear `QuotationFooter.jsx`
Copiar código de **Fase 2.4** del plan completo

#### 4.6 Crear `QuotationActions.jsx`
Copiar código de **Fase 2.5** del plan completo

#### 4.7 Crear `PDFExportView.jsx`
Copiar código de **Fase 6.1** del plan completo

**Verificación:** Cada componente debe renderizar sin errores con props vacías

---

### **PASO 5: Crear Componente Principal** (1-2 horas)

#### 5.1 Crear `QuotationDetail.jsx`
Copiar código base de **Fase 1.4** del plan completo

#### 5.2 Integrar componentes y hooks
Modificar `QuotationDetail.jsx` para incluir:
- `useQuotationDetail(quotationId)`
- `usePDFGeneration(quotation)`
- `useQuotationActions(quotation)`
- Renderizar `PDFExportView`, `QuotationActions`

**Ejemplo de integración:**
```javascript
export default function QuotationDetail() {
  const { quotationId } = useParams();
  const { quotation, loading, error } = useQuotationDetail(quotationId);
  const { downloadPDF, shareViaPDFWhatsApp, shareViaTextWhatsApp, isGeneratingPdf, pdfMessage } = usePDFGeneration(quotation);
  const { deleteQuotation, duplicateQuotation, editQuotation } = useQuotationActions(quotation);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorView error={error} />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      {/* ... */}

      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna principal: Vista PDF */}
        <div className="lg:col-span-2">
          <PDFExportView quotation={quotation} paperTypes={[]} />
        </div>

        {/* Sidebar: Acciones */}
        <div className="lg:col-span-1">
          <QuotationActions
            quotation={quotation}
            onGeneratePDF={downloadPDF}
            onSharePDFWhatsApp={shareViaPDFWhatsApp}
            onShareTextWhatsApp={() => shareViaTextWhatsApp(quotation.items, [])}
            onDuplicate={duplicateQuotation}
            onDelete={deleteQuotation}
            isGeneratingPDF={isGeneratingPdf}
            pdfMessage={pdfMessage}
          />
        </div>
      </div>
    </div>
  );
}
```

**Verificación:** Navegar manualmente a `/quotations/test-id` y ver error "no encontrado" (esperado sin ruta configurada)

---

### **PASO 6: Configurar React Router** (30 min)

#### 6.1 Agregar ruta en `src/router/index.jsx`
```javascript
import QuotationDetail from '../pages/QuotationDetail/QuotationDetail';

// En el array de rutas dentro de MainLayout:
{
  path: 'quotations/:quotationId',
  element: <QuotationDetail />
}
```

**Verificación:** Navegar a `/quotations/EXISTING_ID` debe cargar la página

---

### **PASO 7: Integrar con SavedQuotations** (1 hora)

#### 7.1 Modificar `SavedQuotations.jsx`
Reemplazar modal con navegación:

```javascript
// ELIMINAR o comentar:
// const [showPreviewModal, setShowPreviewModal] = useState(false);
// const [previewQuotation, setPreviewQuotation] = useState(null);

// CAMBIAR handler:
const handlePreview = (quotation) => {
  navigate(`/quotations/${quotation.id}`);
};

// ELIMINAR del return:
// {showPreviewModal && (
//   <QuotationPreviewModal ... />
// )}
```

#### 7.2 Modificar `QuotationCard.jsx`
```javascript
import { useNavigate } from 'react-router-dom';

// En el componente:
const navigate = useNavigate();

// Botón "Ver":
<button
  onClick={() => navigate(`/quotations/${quotation.id}`)}
  className="..."
>
  <Eye className="w-4 h-4" />
  <span>Ver</span>
</button>
```

**Verificación:**
- Clic en "Ver" de cualquier presupuesto debe navegar a su página
- URL cambia correctamente
- Datos se muestran

---

### **PASO 8: Integrar con Calculator** (1 hora)

#### 8.1 Modificar `Calculator.jsx`
Cambiar vista previa por navegación:

```javascript
// Modificar handleShowPreview:
const handleShowPreview = () => {
  if (currentQuotationId) {
    navigate(`/quotations/${currentQuotationId}`);
  } else {
    showToast('Guarda el presupuesto primero para ver la vista previa', 'info');
  }
};

// ELIMINAR del return:
// {showPreview && (
//   <QuotationPreviewModal ... />
// )}
```

**Verificación:**
- Guardar presupuesto en Calculator
- Clic en "Vista Previa" debe navegar a página de detalle

---

### **PASO 9: Mejorar Estilos PDF** (1-2 horas)

#### 9.1 Agregar estilos de impresión en `src/index.css`
Copiar estilos de **Fase 6.2** del plan completo

#### 9.2 Ajustar espaciado y colores en componentes
- Revisar `QuotationItemsTable.jsx` - bordes de tabla
- Revisar `CompanyHeader.jsx` - logo placeholder
- Revisar `QuotationFooter.jsx` - términos destacados

**Verificación:**
1. Abrir página de detalle
2. Generar PDF
3. Revisar que se vea profesional
4. Probar en Chrome, Firefox, Safari

---

### **PASO 10: Testing Manual Completo** (2 horas)

#### 10.1 Test de Navegación
- [ ] `/quotations/:id` carga correctamente desde URL directa
- [ ] Breadcrumb "← Volver" funciona
- [ ] Clic en "Editar" lleva a Calculator con datos cargados
- [ ] Clic en "Duplicar" lleva a Calculator con datos duplicados

#### 10.2 Test de PDF
- [ ] Descargar PDF funciona
- [ ] PDF tiene nombre correcto
- [ ] PDF se ve profesional
- [ ] Todos los datos están presentes
- [ ] Precios tienen 2 decimales

#### 10.3 Test de WhatsApp
- [ ] Compartir PDF por WhatsApp genera URL de MinIO
- [ ] WhatsApp se abre con mensaje correcto
- [ ] URL del PDF es accesible
- [ ] Compartir texto por WhatsApp incluye todos los items

#### 10.4 Test de Estados
- [ ] Loading skeleton se muestra mientras carga
- [ ] Error se muestra si ID no existe
- [ ] Estado "Generando PDF..." se muestra correctamente
- [ ] Confirmación de eliminación funciona

#### 10.5 Test Responsive
- [ ] Mobile (< 640px): layout en una columna
- [ ] Tablet (640-1024px): layout adaptado
- [ ] Desktop (> 1024px): sidebar + contenido principal

#### 10.6 Test de Datos
- [ ] Presupuesto con 1 item
- [ ] Presupuesto con múltiples items
- [ ] Presupuesto con talonarios
- [ ] Presupuesto digital
- [ ] Presupuesto offset

---

### **PASO 11: Deprecar Modal Antiguo** (30 min)

#### 11.1 Mover archivo antiguo
```bash
mkdir -p src/components/deprecated
mv src/components/QuotationPreviewModal.jsx src/components/deprecated/
```

#### 11.2 Buscar y eliminar imports antiguos
```bash
# Buscar referencias
grep -r "QuotationPreviewModal" src/
```

Eliminar todos los imports y usos restantes.

**Verificación:**
- No hay errores en consola
- No hay warnings de imports no encontrados
- Build pasa sin errores: `npm run build`

---

### **PASO 12: Documentación** (30 min)

#### 12.1 Crear `src/pages/QuotationDetail/README.md`
```markdown
# QuotationDetail - Página de Detalle de Presupuesto

Vista dedicada para un presupuesto individual, reemplazando el modal anterior.

## Ruta
`/quotations/:quotationId`

## Responsabilidades
- Mostrar información completa del presupuesto
- Generar y descargar PDF
- Compartir por WhatsApp (PDF y texto)
- Editar, duplicar, eliminar presupuesto
- Cambiar estado del presupuesto

## Arquitectura
- `QuotationDetail.jsx` - Orquestador principal
- `components/` - UI presentacional
- `hooks/` - Lógica de negocio
- `utils/` - Helpers de formateo

## Hooks Principales
- `useQuotationDetail(quotationId)` - Carga datos con onSnapshot
- `usePDFGeneration(quotation)` - Genera y comparte PDF
- `useQuotationActions(quotation)` - CRUD y navegación

## Ver más
[Plan de Implementación](../../../PLAN_DETALLE_PRESUPUESTO.md)
[Orden de Ejecución](../../../ORDEN_EJECUCION_DETALLE_PRESUPUESTO.md)
```

#### 12.2 Actualizar README principal del proyecto
Agregar mención a la nueva página en `README.md` principal

---

### **PASO 13: Optimización y Refinamiento** (1-2 horas)

#### 13.1 Performance
- [ ] Memoizar cálculos en `QuotationItemsTable` si hay > 20 items
- [ ] Lazy load de `PDFExportView` si no se va a generar PDF inmediatamente
- [ ] Optimizar imágenes del logo si se implementa upload

#### 13.2 Accesibilidad
- [ ] Agregar `aria-label` a botones de acciones
- [ ] Verificar contraste de colores con herramienta (WebAIM)
- [ ] Probar navegación por teclado (Tab, Enter, Esc)

#### 13.3 Error Handling
- [ ] Manejo de error si MinIO no está disponible
- [ ] Timeout en generación de PDF (> 30s)
- [ ] Retry logic en upload a S3

---

## ✅ Checklist de Completado

### Funcionalidad Core
- [ ] Página carga desde URL directa
- [ ] Real-time updates con onSnapshot
- [ ] PDF se genera correctamente
- [ ] WhatsApp PDF funciona
- [ ] WhatsApp texto funciona
- [ ] Editar presupuesto funciona
- [ ] Duplicar presupuesto funciona
- [ ] Eliminar presupuesto funciona (con confirmación)

### UI/UX
- [ ] Loading skeleton se muestra
- [ ] Errores se muestran claramente
- [ ] Breadcrumb funciona
- [ ] Responsive en mobile, tablet, desktop
- [ ] Transiciones suaves
- [ ] PDF se ve profesional

### Integración
- [ ] SavedQuotations navega correctamente
- [ ] Calculator navega correctamente
- [ ] QuotationCard actualizado
- [ ] Modal antiguo eliminado
- [ ] No hay warnings en consola

### Calidad de Código
- [ ] Siguiendo convenciones del proyecto
- [ ] Imports desde constants
- [ ] Named exports en hooks
- [ ] Comentarios en código complejo
- [ ] Sin código duplicado

### Testing
- [ ] Probado en Chrome
- [ ] Probado en Firefox
- [ ] Probado en Safari
- [ ] Probado en mobile (iOS/Android)
- [ ] PDF validado en múltiples viewers
- [ ] WhatsApp probado en dispositivo real

### Documentación
- [ ] README.md en QuotationDetail/
- [ ] Comentarios JSDoc en hooks complejos
- [ ] README principal actualizado
- [ ] Plan marcado como completado

---

## 🚨 Problemas Comunes y Soluciones

### Problema: "quotation is null" en hooks
**Causa:** Hook se ejecuta antes de que datos carguen
**Solución:** Agregar guard clause en inicio de hook
```javascript
if (!quotation) return { /* valores por defecto */ };
```

### Problema: PDF no se genera en Firefox
**Causa:** CORS con canvas
**Solución:** Verificar `useCORS: true` en html2canvas options

### Problema: URL de MinIO no accesible
**Causa:** Bucket no es público
**Solución:** Verificar configuración de bucket en Railway

### Problema: Navegación no funciona desde Calculator
**Causa:** `currentQuotationId` no se actualiza después de guardar
**Solución:** Asegurar que `saveQuotation()` actualiza estado correctamente

### Problema: Estilos no se aplican en PDF
**Causa:** CSS de Tailwind no se captura
**Solución:** Usar clases inline o estilos en `<style>` dentro de PDFExportView

---

## 📊 Métricas de Éxito

Al finalizar, deberías poder:

1. ✅ **Navegar** a cualquier presupuesto con URL única
2. ✅ **Compartir** URL del presupuesto con cliente
3. ✅ **Generar** PDF profesional en < 5 segundos
4. ✅ **Compartir** por WhatsApp sin errores
5. ✅ **Editar** presupuesto desde vista de detalle
6. ✅ **Ver** actualizaciones en tiempo real si otro usuario edita

---

## 🔗 Enlaces Relacionados

- [Plan Completo de Implementación](./PLAN_DETALLE_PRESUPUESTO.md)
- [Instrucciones del Proyecto](./github/copilot-instructions.md)
- [Orden de Implementación General](./ORDEN_IMPLEMENTACION.md)
- [Plan de Mejora de Workflow](./PLAN_MEJORA_WORKFLOW.md)

---

## 📞 Soporte

Si encuentras problemas durante la implementación:

1. Revisar sección "Problemas Comunes" arriba
2. Verificar consola del navegador para errores
3. Confirmar que todos los pre-requisitos están cumplidos
4. Revisar que paths de Firestore sean correctos
5. Validar que MinIO S3 esté configurado correctamente

---

**Última actualización:** 11 de octubre, 2025

**Estado:** ⏳ Pendiente de implementación

**Responsable:** Equipo de desarrollo Litografía Pro
