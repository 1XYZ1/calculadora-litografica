# Plan de Implementación: Página de Detalle de Presupuesto

> **📋 Orden de Ejecución:** [ORDEN_EJECUCION_DETALLE_PRESUPUESTO.md](./ORDEN_EJECUCION_DETALLE_PRESUPUESTO.md)

**Objetivo:** Reemplazar el modal `QuotationPreviewModal.jsx` con una página dedicada navegable por URL, mejorando la UX y la estructura del PDF generado.

---

## 📋 Resumen Ejecutivo

### Problemas Actuales
1. ✗ **Modal restrictivo**: `QuotationPreviewModal.jsx` es un modal modal que limita la experiencia de usuario
2. ✗ **No compartible**: No existe URL única para cada presupuesto
3. ✗ **PDF mal estructurado**: Diseño inconsistente, sin jerarquía semántica clara
4. ✗ **Navegación fragmentada**: Vista previa desconectada del flujo de navegación
5. ✗ **Hardcoded company info**: Datos de empresa están quemados en el componente

### Soluciones Propuestas
1. ✓ Nueva página `/quotations/:quotationId` con React Router
2. ✓ URL compartible y navegable directamente
3. ✓ PDF rediseñado con mejores prácticas de diseño y estructura semántica
4. ✓ Integración fluida con navegación existente
5. ✓ Configuración de empresa desde Firebase (futuro)

---

## 🗺️ Arquitectura de la Nueva Página

### Estructura de Archivos
```
src/pages/QuotationDetail/
├── QuotationDetail.jsx              # Orquestador principal
├── README.md                         # Documentación de la página
├── components/
│   ├── QuotationHeader.jsx          # Encabezado con nombre, cliente, fecha
│   ├── QuotationMetadata.jsx        # Estado, totales, estadísticas
│   ├── QuotationItemsTable.jsx      # Tabla de items del presupuesto
│   ├── QuotationFooter.jsx          # Notas, firmas, términos
│   ├── QuotationActions.jsx         # Botones de acción (compartir, PDF, etc)
│   ├── CompanyHeader.jsx            # Logo y datos de empresa
│   ├── PDFExportView.jsx            # Vista optimizada para generación PDF
│   └── LoadingSkeleton.jsx          # Estado de carga
├── hooks/
│   ├── useQuotationDetail.js        # Cargar datos del presupuesto
│   ├── usePDFGeneration.js          # Lógica de generación y compartir PDF
│   └── useQuotationActions.js       # Acciones (editar, duplicar, cambiar estado)
└── utils/
    ├── pdfHelpers.js                # Helpers para generación PDF
    └── formatters.js                # Formateo de moneda, fechas, dimensiones
```

### Ruta en React Router
```javascript
// src/router/index.jsx
{
  path: 'quotations/:quotationId',
  element: <QuotationDetail />
}
```

---

## 🎨 Diseño de la Nueva UI

### Layout de la Página
```
┌─────────────────────────────────────────────────────────┐
│ [← Volver a Presupuestos]          [Acciones: ⋮]       │ ← Breadcrumb + Actions
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │ VISTA PREVIA DEL PRESUPUESTO (PDFExportView)   │  │
│  │                                                 │  │
│  │  ┌────────────────────────────────────────┐    │  │
│  │  │ CompanyHeader (Logo + Datos Empresa)   │    │  │
│  │  ├────────────────────────────────────────┤    │  │
│  │  │ QuotationHeader (Nombre + Cliente)     │    │  │
│  │  ├────────────────────────────────────────┤    │  │
│  │  │ QuotationMetadata (Fecha, Estado, #)   │    │  │
│  │  ├────────────────────────────────────────┤    │  │
│  │  │ QuotationItemsTable                    │    │  │
│  │  │  - CANT | DESCRIPCIÓN | P/U | TOTAL    │    │  │
│  │  │  - Item 1                              │    │  │
│  │  │  - Item 2                              │    │  │
│  │  │  - ...                                 │    │  │
│  │  │  - TOTAL GENERAL: $XXX.XX              │    │  │
│  │  ├────────────────────────────────────────┤    │  │
│  │  │ QuotationFooter (Notas + Firma)        │    │  │
│  │  └────────────────────────────────────────┘    │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ QuotationActions:                                       │
│ [📄 Descargar PDF] [📱 WhatsApp PDF] [✉️ WhatsApp Texto]│
│ [✏️ Editar] [📋 Duplicar] [🗑️ Eliminar]                │
└─────────────────────────────────────────────────────────┘
```

### Mejoras de Diseño del PDF

#### Antes (Problemas):
- ❌ Logo placeholder "LOGO" en gris
- ❌ Información de empresa hardcoded
- ❌ Tabla sin jerarquía visual clara
- ❌ Espaciado inconsistente
- ❌ Tipografía sin contraste
- ❌ Sin información de número de presupuesto
- ❌ Precio unitario con 4 decimales ($X.XXXX)

#### Después (Soluciones):
- ✅ **Logo real** cargado desde Firebase Storage o placeholder profesional
- ✅ **Datos de empresa** desde configuración (futura feature)
- ✅ **Jerarquía visual clara**:
  - Header destacado con gradiente sutil
  - Separadores visuales entre secciones
  - Uso de color para enfatizar totales
- ✅ **Espaciado consistente**: 8px grid system
- ✅ **Tipografía mejorada**:
  - Títulos: font-bold, text-lg/xl
  - Subtítulos: font-semibold, text-base
  - Cuerpo: font-normal, text-sm
- ✅ **Metadata completa**:
  - Número de presupuesto: `#QUOT-{timestamp}`
  - Fecha de creación y validez
  - Estado (Pendiente/Enviada/Aceptada)
- ✅ **Precio unitario con 2 decimales** ($X.XX)
- ✅ **Desglose de costos mejorado**:
  - Subtotal por item visible
  - Total general destacado
  - Conversión Bs. con tasa BCV
- ✅ **Responsive**: Se adapta a A4 en PDF y pantalla

---

## 🔧 Implementación por Fases

### **Fase 1: Estructura Base** (2-3 horas)
#### 1.1 Crear estructura de carpetas
```bash
mkdir -p src/pages/QuotationDetail/{components,hooks,utils}
touch src/pages/QuotationDetail/QuotationDetail.jsx
touch src/pages/QuotationDetail/README.md
```

#### 1.2 Agregar ruta en React Router
```javascript
// src/router/index.jsx
import QuotationDetail from '../pages/QuotationDetail/QuotationDetail';

// Agregar en children de MainLayout:
{
  path: 'quotations/:quotationId',
  element: <QuotationDetail />
}
```

#### 1.3 Crear hook `useQuotationDetail.js`
```javascript
// src/pages/QuotationDetail/hooks/useQuotationDetail.js
import { useState, useEffect } from 'react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { useFirebase } from '../../../context/FirebaseContext';

export function useQuotationDetail(quotationId) {
  const { db, appId, userId } = useFirebase();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!quotationId || !db || !userId || !appId) {
      setLoading(false);
      return;
    }

    const quotationRef = doc(
      db,
      `artifacts/${appId}/users/${userId}/quotations/${quotationId}`
    );

    // Listener en tiempo real
    const unsubscribe = onSnapshot(
      quotationRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setQuotation({ id: docSnap.id, ...docSnap.data() });
          setError(null);
        } else {
          setError('Presupuesto no encontrado');
          setQuotation(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error al cargar presupuesto:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [quotationId, db, userId, appId]);

  return { quotation, loading, error };
}
```

#### 1.4 Crear componente principal `QuotationDetail.jsx`
```javascript
// src/pages/QuotationDetail/QuotationDetail.jsx
import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuotationDetail } from './hooks/useQuotationDetail';
import LoadingSkeleton from './components/LoadingSkeleton';

export default function QuotationDetail() {
  const { quotationId } = useParams();
  const navigate = useNavigate();
  const { quotation, loading, error } = useQuotationDetail(quotationId);

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
          <Link
            to="/quotations"
            className="mt-4 inline-block text-blue-600 hover:underline"
          >
            ← Volver a presupuestos
          </Link>
        </div>
      </div>
    );
  }

  if (!quotation) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/quotations" className="text-blue-600 hover:underline">
              Presupuestos
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-700 font-medium">{quotation.name}</span>
          </nav>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">{quotation.name}</h1>
        <p className="text-gray-600 mb-8">Cliente: {quotation.clientName}</p>

        {/* TODO: Agregar componentes aquí */}
        <div className="bg-white rounded-lg shadow p-8">
          <pre className="text-xs">{JSON.stringify(quotation, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
```

---

### **Fase 2: Componentes de Vista** (3-4 horas)

#### 2.1 `CompanyHeader.jsx`
Encabezado con logo y datos de empresa
```javascript
// src/pages/QuotationDetail/components/CompanyHeader.jsx
import React from 'react';

export default function CompanyHeader({ companyInfo }) {
  const {
    logo = null,
    name = 'JPC SERVICE C.A.',
    rif = 'J-40543994-7',
    address = 'Carrera 9 entre calles 14 y 15 No. S/N ofic. 1',
    city = 'DUACA-EDO. LARA',
    email = 'JPGSERVICE@GMAIL.COM',
    phone = '0414-538.41.12'
  } = companyInfo || {};

  return (
    <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-gray-200">
      {/* Logo y nombre */}
      <div className="flex flex-col items-center">
        {logo ? (
          <img
            src={logo}
            alt={name}
            className="w-24 h-24 object-contain rounded-full border-2 border-gray-300 mb-2"
          />
        ) : (
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-2 shadow-md">
            JPC
          </div>
        )}
        <p className="text-gray-900 text-lg font-bold">{name.split(' ')[0]}</p>
        <p className="text-gray-600 text-xs">{rif}</p>
        <p className="text-gray-600 text-xs text-center mt-1">
          SERVICE C.A.<br />PUBLICIDAD
        </p>
      </div>

      {/* Información de contacto */}
      <div className="text-right text-sm space-y-1">
        <p className="font-semibold text-gray-800">{address}</p>
        <p className="font-semibold text-gray-800">{city}</p>
        <p className="font-semibold text-gray-800">CORREO: {email}</p>
        <p className="font-semibold text-gray-800">CEL: {phone}</p>
      </div>
    </div>
  );
}
```

#### 2.2 `QuotationMetadata.jsx`
Información del presupuesto (número, fecha, estado)
```javascript
// src/pages/QuotationDetail/components/QuotationMetadata.jsx
import React from 'react';
import { formatQuotationDate } from '../../../pages/SavedQuotations/utils/quotationUtils';
import { QUOTATION_STATUS_LABELS } from '../../../utils/constants';

export default function QuotationMetadata({ quotation }) {
  const { timestamp, status = 'pending', id } = quotation;

  const quotationNumber = `#QUOT-${timestamp?.seconds || Date.now()}`;
  const formattedDate = formatQuotationDate(timestamp);
  const statusLabel = QUOTATION_STATUS_LABELS[status] || status;

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    sent: 'bg-blue-100 text-blue-800 border-blue-300',
    accepted: 'bg-green-100 text-green-800 border-green-300',
  };

  return (
    <div className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Número de presupuesto */}
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            Número de Presupuesto
          </p>
          <p className="text-lg font-bold text-gray-900">{quotationNumber}</p>
        </div>

        {/* Fecha */}
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            Fecha de Emisión
          </p>
          <p className="text-lg font-semibold text-gray-800">{formattedDate}</p>
        </div>

        {/* Estado */}
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            Estado
          </p>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${statusColors[status] || statusColors.pending}`}>
            {statusLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
```

#### 2.3 `QuotationItemsTable.jsx`
Tabla de items del presupuesto
```javascript
// src/pages/QuotationDetail/components/QuotationItemsTable.jsx
import React from 'react';
import { formatMoney, formatDimension } from '../utils/formatters';

export default function QuotationItemsTable({ items = [], paperTypes = [] }) {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay items en este presupuesto
      </div>
    );
  }

  return (
    <div className="overflow-x-auto mb-6">
      <table className="min-w-full bg-white border border-gray-300 rounded-lg">
        <colgroup>
          <col style={{ width: "10%" }} />
          <col style={{ width: "55%" }} />
          <col style={{ width: "17.5%" }} />
          <col style={{ width: "17.5%" }} />
        </colgroup>
        <thead>
          <tr className="bg-gradient-to-r from-gray-100 to-gray-50 border-b-2 border-gray-300">
            <th className="py-3 px-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wide">
              Cant.
            </th>
            <th className="py-3 px-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wide">
              Descripción
            </th>
            <th className="py-3 px-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wide">
              Precio Unitario
            </th>
            <th className="py-3 px-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wide">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const pieceSizeFormatted = `${formatDimension(item.pieceWidthCm)} x ${formatDimension(item.pieceHeightCm)}`;

            const paperName = item.isDigital
              ? ''
              : `, impreso en ${
                  paperTypes.find((p) => p.id === item.selectedPaperTypeId)?.name || 'N/A'
                }`;

            const colorDesc = item.isDigital
              ? ', Impresión Digital'
              : `, a ${item.colorsDescription}`;

            const quantityDisplay = item.isTalonarios
              ? item.numTalonarios
              : item.totalPieces;

            const copiesNum = parseInt(item.copiesPerSet, 10) || 0;
            const copiesText = copiesNum > 0
              ? `Original + ${copiesNum} ${copiesNum > 1 ? 'copias' : 'copia'}`
              : 'Solo Original';

            const fullDescription = item.isTalonarios
              ? `${item.quotationName} (Talonarios de ${item.sheetsPerSet}h, ${copiesText}), Tamaño ${pieceSizeFormatted}${paperName}${colorDesc}`
              : `${item.quotationName}, Tamaño ${pieceSizeFormatted}${paperName}${colorDesc}`;

            const pricePerUnit = item.totalPieces > 0
              ? item.costWithProfit / parseFloat(item.totalPieces)
              : 0;

            return (
              <tr
                key={item.id || index}
                className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <td className="py-3 px-4 text-sm text-gray-800 text-center font-medium">
                  {quantityDisplay}
                </td>
                <td className="py-3 px-4 text-sm text-gray-700">
                  {fullDescription}
                </td>
                <td className="py-3 px-4 text-sm text-gray-800 text-center">
                  {formatMoney(pricePerUnit)}
                </td>
                <td className="py-3 px-4 text-sm text-gray-900 text-center font-semibold">
                  {formatMoney(item.costWithProfit)}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="bg-gradient-to-r from-blue-50 to-blue-100 border-t-2 border-blue-300">
            <td colSpan="3" className="py-4 px-4 text-right text-lg font-bold text-gray-900">
              Total General
            </td>
            <td className="py-4 px-4 text-center text-xl font-bold text-blue-700">
              {formatMoney(
                items.reduce((sum, item) => sum + (item.costWithProfit || 0), 0)
              )}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
```

#### 2.4 `QuotationFooter.jsx`
Notas, términos y firma
```javascript
// src/pages/QuotationDetail/components/QuotationFooter.jsx
import React from 'react';

export default function QuotationFooter() {
  return (
    <div className="mt-8 space-y-6">
      {/* Notas y términos */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
        <h3 className="text-sm font-bold text-gray-800 mb-2">Términos y Condiciones:</h3>
        <ul className="text-xs text-gray-700 space-y-1 list-disc list-inside">
          <li className="font-semibold">Precios no incluyen IVA.</li>
          <li className="font-semibold">
            Toda orden de trabajo comenzará al abonar el 70% del presupuesto.
          </li>
          <li>
            Todos nuestros productos son elaborados en material de primera calidad
            especial para este tipo de trabajo.
          </li>
        </ul>
      </div>

      {/* Firma */}
      <div className="text-center pt-8">
        <div className="inline-block">
          <div className="border-b-2 border-gray-400 pb-1 px-16 mb-2">
            <p className="text-gray-900 font-bold text-lg">JOSE OCHOA</p>
          </div>
          <p className="text-gray-600 text-sm font-semibold">GERENTE</p>
        </div>
      </div>
    </div>
  );
}
```

#### 2.5 `QuotationActions.jsx`
Botones de acción
```javascript
// src/pages/QuotationDetail/components/QuotationActions.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function QuotationActions({
  quotation,
  onGeneratePDF,
  onSharePDFWhatsApp,
  onShareTextWhatsApp,
  onDuplicate,
  onDelete,
  isGeneratingPDF = false,
  pdfMessage = ''
}) {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate('/calculator', { state: { quotation } });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sticky top-4">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Acciones</h3>

      <div className="space-y-3">
        {/* PDF Actions */}
        <div className="pb-3 border-b border-gray-200">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Compartir</p>

          <button
            onClick={onSharePDFWhatsApp}
            disabled={isGeneratingPDF}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <span>📱</span>
            <span>{isGeneratingPDF ? pdfMessage : 'WhatsApp PDF'}</span>
          </button>

          <button
            onClick={onShareTextWhatsApp}
            className="w-full mt-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
          >
            <span>💬</span>
            <span>WhatsApp Texto</span>
          </button>

          <button
            onClick={onGeneratePDF}
            disabled={isGeneratingPDF}
            className="w-full mt-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <span>📄</span>
            <span>Descargar PDF</span>
          </button>
        </div>

        {/* Edit/Duplicate/Delete */}
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Administrar</p>

          <button
            onClick={handleEdit}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <span>✏️</span>
            <span>Editar</span>
          </button>

          <button
            onClick={onDuplicate}
            className="w-full mt-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <span>📋</span>
            <span>Duplicar</span>
          </button>

          <button
            onClick={onDelete}
            className="w-full mt-2 bg-red-100 hover:bg-red-200 text-red-800 font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <span>🗑️</span>
            <span>Eliminar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

### **Fase 3: Lógica de Negocio (Hooks)** (2-3 horas)

#### 3.1 `usePDFGeneration.js`
Lógica de generación y compartir PDF (migrado desde `QuotationPreviewModal`)
```javascript
// src/pages/QuotationDetail/hooks/usePDFGeneration.js
import { useState } from 'react';
import { uploadPdfToStorage } from '../../../config/storage';
import { useFirebase } from '../../../context/FirebaseContext';

export function usePDFGeneration(quotation) {
  const { userId } = useFirebase();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfMessage, setPdfMessage] = useState('');

  const generatePDF = async (elementId = 'quotation-print-area') => {
    if (!window.jspdf || !window.html2canvas) {
      throw new Error('Librerías PDF no encontradas');
    }

    const { jsPDF } = window.jspdf;
    const input = document.getElementById(elementId);

    const canvas = await window.html2canvas(input, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    return pdf;
  };

  const downloadPDF = async () => {
    setIsGeneratingPdf(true);
    setPdfMessage('Generando PDF...');

    try {
      const pdf = await generatePDF();
      const fileName = `presupuesto-${quotation.name}-${Date.now()}.pdf`;
      pdf.save(fileName);
      setPdfMessage('¡PDF descargado!');

      setTimeout(() => {
        setIsGeneratingPdf(false);
        setPdfMessage('');
      }, 2000);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      setPdfMessage(`Error: ${error.message}`);
      setTimeout(() => {
        setIsGeneratingPdf(false);
        setPdfMessage('');
      }, 5000);
    }
  };

  const shareViaPDFWhatsApp = async () => {
    setIsGeneratingPdf(true);
    setPdfMessage('Generando PDF...');

    try {
      const pdf = await generatePDF();

      setPdfMessage('Subiendo PDF a MinIO...');
      const pdfBlob = pdf.output('blob');
      const pdfId = `presupuesto-${Date.now()}.pdf`;
      const downloadURL = await uploadPdfToStorage(pdfBlob, userId, pdfId);

      const whatsappText = encodeURIComponent(
        `¡Hola! Aquí está tu presupuesto de ${quotation.name}:\n\n` +
        `Cliente: ${quotation.clientName || 'Cliente'}\n` +
        `Total: $${quotation.grandTotals?.totalGeneral?.toFixed(2) || '0.00'}\n\n` +
        `Puedes ver y descargar el presupuesto completo en el siguiente enlace:\n` +
        `${downloadURL}\n\n` +
        `¡Gracias por tu confianza!\n- Litografía Pro`
      );

      setPdfMessage('¡Listo! Abriendo WhatsApp...');
      window.open(`https://wa.me/?text=${whatsappText}`, '_blank');

      setTimeout(() => {
        setIsGeneratingPdf(false);
        setPdfMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error al compartir PDF:', error);
      setPdfMessage(`Error: ${error.message}`);
      setTimeout(() => {
        setIsGeneratingPdf(false);
        setPdfMessage('');
      }, 8000);
    }
  };

  const shareViaTextWhatsApp = (items = [], paperTypes = []) => {
    const itemsText = items
      .map((item) => {
        const pieceSize = `${item.pieceWidthCm}cm x ${item.pieceHeightCm}cm`;
        const description = item.isDigital
          ? 'Impresión Digital'
          : `impreso en ${
              paperTypes.find((p) => p.id === item.selectedPaperTypeId)?.name || 'N/A'
            }, a ${item.colorsDescription}`;
        return `- ${item.quotationName} (${item.totalPieces} piezas de ${pieceSize}), ${description}`;
      })
      .join('\n');

    const { grandTotals = {}, clientName, name, date } = quotation;
    const whatsappText = encodeURIComponent(
      `¡Hola! Aquí está tu presupuesto de impresión de Litografía Pro:\n\n` +
      `Cliente: ${clientName || 'Cliente'}\n` +
      `Concepto: ${name}\n\n` +
      `Items:\n${itemsText}\n\n` +
      `Precio Total: $${grandTotals.totalGeneral?.toFixed(2) || '0.00'}\n` +
      `En Bs.: Bs. ${grandTotals.totalCostInBs?.toFixed(2) || '0.00'} ` +
      `(Tasa BCV: ${quotation.bcvRate?.toFixed(2) || '0.00'} Bs./$)\n\n` +
      `¡Gracias por tu confianza!\n\n` +
      `Para ver el presupuesto detallado, por favor solicita el PDF.`
    );

    window.open(`https://wa.me/?text=${whatsappText}`, '_blank');
  };

  return {
    isGeneratingPdf,
    pdfMessage,
    downloadPDF,
    shareViaPDFWhatsApp,
    shareViaTextWhatsApp,
  };
}
```

#### 3.2 `useQuotationActions.js`
Acciones de editar, duplicar, eliminar, cambiar estado
```javascript
// src/pages/QuotationDetail/hooks/useQuotationActions.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { useFirebase } from '../../../context/FirebaseContext';

export function useQuotationActions(quotation) {
  const navigate = useNavigate();
  const { db, appId, userId } = useFirebase();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const deleteQuotation = async () => {
    if (!quotation?.id) return;

    const confirmed = window.confirm(
      `¿Estás seguro de eliminar el presupuesto "${quotation.name}"?`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    setError(null);

    try {
      const quotationRef = doc(
        db,
        `artifacts/${appId}/users/${userId}/quotations/${quotation.id}`
      );
      await deleteDoc(quotationRef);
      navigate('/quotations');
    } catch (err) {
      console.error('Error al eliminar:', err);
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const updateStatus = async (newStatus) => {
    if (!quotation?.id) return;

    try {
      const quotationRef = doc(
        db,
        `artifacts/${appId}/users/${userId}/quotations/${quotation.id}`
      );
      await updateDoc(quotationRef, { status: newStatus });
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      setError(err.message);
    }
  };

  const duplicateQuotation = () => {
    if (!quotation) return;
    navigate('/calculator', {
      state: {
        duplicateFrom: quotation,
      },
    });
  };

  const editQuotation = () => {
    if (!quotation) return;
    navigate('/calculator', {
      state: {
        quotation,
      },
    });
  };

  return {
    deleteQuotation,
    updateStatus,
    duplicateQuotation,
    editQuotation,
    isDeleting,
    error,
  };
}
```

---

### **Fase 4: Utilidades y Helpers** (1 hora)

#### 4.1 `formatters.js`
Helpers de formateo
```javascript
// src/pages/QuotationDetail/utils/formatters.js

/**
 * Formatea un número como moneda USD
 */
export function formatMoney(amount, currency = 'USD', decimals = 2) {
  const num = parseFloat(amount);
  if (!Number.isFinite(num)) return `$0.00`;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Formatea dimensiones en cm a cm o metros según tamaño
 */
export function formatDimension(cm) {
  const val = parseFloat(cm);
  if (isNaN(val)) return '';

  if (val < 100) {
    return `${parseFloat(val.toFixed(2))}cm`;
  }
  return `${parseFloat((val / 100).toFixed(2))}m`;
}

/**
 * Formatea timestamp de Firestore a fecha legible
 */
export function formatDate(timestamp) {
  if (!timestamp) return '';

  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);

  return new Intl.DateTimeFormat('es-VE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}
```

---

### **Fase 5: Integración y Refactoring** (2-3 horas)

#### 5.1 Reemplazar modal por navegación
Cambiar todos los usos de `QuotationPreviewModal` por navegación a la nueva página.

**En `SavedQuotations.jsx`:**
```javascript
// ANTES
const handlePreview = (quotation) => {
  setPreviewQuotation(quotation);
  setShowPreviewModal(true);
};

// DESPUÉS
const handlePreview = (quotation) => {
  navigate(`/quotations/${quotation.id}`);
};
```

**En `Calculator.jsx`:**
```javascript
// ANTES
const handleShowPreview = () => {
  setShowPreview(true);
};

// DESPUÉS
const handleShowPreview = () => {
  // Si el presupuesto ya está guardado, navegar a su página
  if (currentQuotationId) {
    navigate(`/quotations/${currentQuotationId}`);
  } else {
    // Si no está guardado, mostrar mensaje para guardar primero
    showToast('Guarda el presupuesto primero para ver la vista previa', 'info');
  }
};
```

#### 5.2 Eliminar `QuotationPreviewModal.jsx`
Una vez confirmado que la nueva página funciona correctamente:
```bash
# Mover a carpeta deprecated por si acaso
mkdir -p src/components/deprecated
mv src/components/QuotationPreviewModal.jsx src/components/deprecated/
```

#### 5.3 Actualizar navegación en `QuotationCard.jsx`
```javascript
// src/pages/SavedQuotations/components/QuotationCard.jsx

// Reemplazar botón "Ver" con navegación
<button
  onClick={() => navigate(`/quotations/${quotation.id}`)}
  className="..."
>
  <Eye className="w-4 h-4" />
  <span>Ver</span>
</button>
```

---

### **Fase 6: Mejoras del PDF** (2-3 horas)

#### 6.1 Crear `PDFExportView.jsx`
Vista optimizada específicamente para generación PDF
```javascript
// src/pages/QuotationDetail/components/PDFExportView.jsx
import React from 'react';
import CompanyHeader from './CompanyHeader';
import QuotationMetadata from './QuotationMetadata';
import QuotationItemsTable from './QuotationItemsTable';
import QuotationFooter from './QuotationFooter';

export default function PDFExportView({ quotation, paperTypes = [] }) {
  if (!quotation) return null;

  const { clientName, items = [] } = quotation;

  return (
    <div
      id="quotation-print-area"
      className="bg-white p-8 max-w-4xl mx-auto"
      style={{ minHeight: '29.7cm' }} // A4 height
    >
      {/* Encabezado de empresa */}
      <CompanyHeader />

      {/* Información del presupuesto */}
      <QuotationMetadata quotation={quotation} />

      {/* Cliente */}
      <div className="mb-6">
        <p className="text-lg font-semibold text-gray-900">
          SEÑORES: <span className="uppercase">{clientName || 'CLIENTE'}</span>
        </p>
      </div>

      {/* Tabla de items */}
      <QuotationItemsTable items={items} paperTypes={paperTypes} />

      {/* Footer */}
      <QuotationFooter />
    </div>
  );
}
```

#### 6.2 Estilos de impresión CSS
Agregar estilos específicos para print/PDF en archivo CSS global o inline
```css
/* src/index.css o styles dedicados */
@media print {
  /* Ocultar elementos de navegación y acciones */
  .no-print,
  nav,
  button,
  .sticky {
    display: none !important;
  }

  /* Ajustar página a A4 */
  @page {
    size: A4;
    margin: 1cm;
  }

  /* Evitar saltos de página en elementos clave */
  table,
  .avoid-break {
    page-break-inside: avoid;
  }

  /* Fondo blanco para PDF */
  body {
    background: white;
  }

  /* Bordes visibles en tablas para PDF */
  table,
  th,
  td {
    border: 1px solid #ccc !important;
  }
}
```

---

## 🔄 Flujo de Usuario Mejorado

### Navegación desde SavedQuotations
```
[Lista de Presupuestos]
    │
    ├─→ Clic en "Ver" → `/quotations/:id`
    │                      ↓
    │                   [QuotationDetail]
    │                      │
    │                      ├─→ Descargar PDF
    │                      ├─→ Compartir WhatsApp
    │                      ├─→ Editar → `/calculator` (con state)
    │                      ├─→ Duplicar → `/calculator` (con state)
    │                      └─→ Eliminar → `/quotations` (redirect)
    │
    └─→ URL directa → `/quotations/abc123` (shareable!)
```

### Navegación desde Calculator
```
[Calculator - Paso 4]
    │
    ├─→ Guardar Presupuesto
    │      ↓
    │   [Presupuesto guardado con ID]
    │      │
    │      └─→ "Ver Vista Previa" → `/quotations/:id`
    │
    └─→ Editar existente → Carga datos → Guardar → `/quotations/:id`
```

---

## 📋 Checklist de Implementación

### Fase 1: Estructura Base ✅
- [ ] Crear carpeta `src/pages/QuotationDetail/`
- [ ] Crear subcarpetas: `components/`, `hooks/`, `utils/`
- [ ] Agregar ruta en `src/router/index.jsx`
- [ ] Crear hook `useQuotationDetail.js`
- [ ] Crear componente base `QuotationDetail.jsx`
- [ ] Probar navegación con URL manual

### Fase 2: Componentes de Vista ✅
- [ ] `CompanyHeader.jsx` - Logo y datos empresa
- [ ] `QuotationMetadata.jsx` - Número, fecha, estado
- [ ] `QuotationItemsTable.jsx` - Tabla de items
- [ ] `QuotationFooter.jsx` - Términos y firma
- [ ] `QuotationActions.jsx` - Botones de acción
- [ ] `LoadingSkeleton.jsx` - Estado de carga

### Fase 3: Lógica de Negocio ✅
- [ ] Hook `usePDFGeneration.js`
- [ ] Hook `useQuotationActions.js`
- [ ] Integrar hooks en `QuotationDetail.jsx`

### Fase 4: Utilidades ✅
- [ ] `formatters.js` - Helpers de formateo
- [ ] Importar y usar en componentes

### Fase 5: Integración ✅
- [ ] Reemplazar modal en `SavedQuotations.jsx`
- [ ] Reemplazar modal en `Calculator.jsx`
- [ ] Actualizar `QuotationCard.jsx` navegación
- [ ] Probar flujo completo end-to-end
- [ ] Eliminar/deprecar `QuotationPreviewModal.jsx`

### Fase 6: Mejoras PDF ✅
- [ ] Crear `PDFExportView.jsx`
- [ ] Agregar estilos de impresión CSS
- [ ] Probar generación PDF en diferentes navegadores
- [ ] Optimizar calidad y tamaño del PDF
- [ ] Probar compartir por WhatsApp

### Fase 7: Testing y Refinamiento ✅
- [ ] Probar con diferentes presupuestos
- [ ] Verificar responsive mobile/tablet
- [ ] Validar compartir en WhatsApp
- [ ] Optimizar performance
- [ ] Documentar en README.md

---

## 🚀 Mejoras Futuras (Backlog)

### V2.0 - Configuración de Empresa
- [ ] Crear página `/settings/company` para configurar:
  - Logo (upload a Firebase Storage)
  - Nombre, RIF, dirección, contacto
  - Firma digital del gerente
- [ ] Guardar config en `artifacts/{appId}/users/{userId}/settings/company`
- [ ] Usar config en `CompanyHeader.jsx`

### V2.1 - Templates de PDF
- [ ] Permitir múltiples plantillas de diseño
- [ ] Selector de plantilla en QuotationDetail
- [ ] Plantillas: Clásica, Moderna, Minimalista

### V2.2 - Email Integration
- [ ] Enviar presupuesto por email directamente
- [ ] Adjuntar PDF automáticamente
- [ ] Templates de email personalizables

### V2.3 - Analytics
- [ ] Rastrear vistas de presupuestos
- [ ] Tiempo de visualización
- [ ] Tasa de conversión (enviado → aceptado)

### V2.4 - Versionado
- [ ] Historial de versiones de presupuesto
- [ ] Comparar versiones side-by-side
- [ ] Restaurar versión anterior

---

## 📝 Notas Técnicas

### Consideraciones de Performance
1. **Lazy loading de componentes** para páginas no visitadas frecuentemente
2. **Memoización** de cálculos costosos en tablas grandes
3. **Debounce** en búsquedas/filtros si se agregan
4. **Virtual scrolling** si lista de items > 50

### Accesibilidad (A11y)
1. Usar roles ARIA apropiados (`role="table"`, `role="button"`)
2. Labels descriptivos en botones
3. Contraste de color WCAG AA mínimo
4. Navegación por teclado funcional
5. Screen reader friendly

### SEO (si aplica)
1. Meta tags dinámicos por presupuesto
2. Open Graph para compartir en redes
3. Structured data (JSON-LD) para presupuestos

### Security
1. Validar `quotationId` en params
2. Verificar ownership del presupuesto (userId match)
3. Sanitizar inputs antes de mostrar
4. Rate limiting en generación de PDFs (prevenir abuso)

---

## 🎯 Definición de "Hecho" (DoD)

Un presupuesto está completamente implementado cuando:

✅ **Funcionalidad**
- La página carga correctamente desde URL directa
- Todos los datos del presupuesto se muestran correctamente
- PDF se genera sin errores
- WhatsApp sharing funciona (PDF y texto)
- Navegación funciona en ambas direcciones

✅ **UI/UX**
- Responsive en mobile, tablet, desktop
- Estados de carga visibles
- Mensajes de error claros
- Transiciones suaves
- PDF se ve profesional

✅ **Código**
- Siguiendo convenciones del proyecto
- Hooks separados por responsabilidad
- Componentes reutilizables
- Sin warnings en consola
- Código documentado (JSDoc)

✅ **Testing Manual**
- Probado en Chrome, Firefox, Safari
- Probado en mobile (iOS/Android)
- PDF validado en múltiples viewers
- WhatsApp sharing probado en dispositivos reales

✅ **Documentación**
- README.md actualizado en QuotationDetail/
- Comentarios en código complejo
- Plan de implementación ejecutado

---

## 📚 Referencias

### Documentación Relacionada
- **[Orden de Ejecución Paso a Paso](./ORDEN_EJECUCION_DETALLE_PRESUPUESTO.md)** - Guía de implementación secuencial
- [Instrucciones del Proyecto](./.github/copilot-instructions.md) - Convenciones y arquitectura
- [Orden de Implementación General](./ORDEN_IMPLEMENTACION.md) - Roadmap completo
- [Plan de Mejora de Workflow](./PLAN_MEJORA_WORKFLOW.md) - Mejoras futuras

### Archivos a Modificar
1. `src/router/index.jsx` - Agregar ruta
2. `src/pages/SavedQuotations/SavedQuotations.jsx` - Cambiar handler
3. `src/pages/SavedQuotations/components/QuotationCard.jsx` - Navegación
4. `src/pages/Calculator/Calculator.jsx` - Vista previa
5. `src/components/QuotationPreviewModal.jsx` - Deprecar

### Archivos a Crear
1. `src/pages/QuotationDetail/QuotationDetail.jsx`
2. `src/pages/QuotationDetail/components/*.jsx` (7 componentes)
3. `src/pages/QuotationDetail/hooks/*.js` (3 hooks)
4. `src/pages/QuotationDetail/utils/*.js` (1 utility)
5. `src/pages/QuotationDetail/README.md`

### Dependencias Existentes (no instalar nada nuevo)
- `jspdf` - Generación PDF (ya incluido en index.html)
- `html2canvas` - Captura HTML a imagen (ya incluido)
- `@aws-sdk/client-s3` - Upload a MinIO (ya instalado)
- React Router v6 - Navegación (ya configurado)

---

## ✨ Resultado Final Esperado

Al finalizar esta implementación tendremos:

1. ✅ **URL Compartible**: `/quotations/abc123` navegable directamente
2. ✅ **Vista Profesional**: Diseño limpio y semántico del presupuesto
3. ✅ **PDF Mejorado**: Documento con mejor estructura y legibilidad
4. ✅ **UX Mejorada**: Sin modales restrictivos, flujo natural
5. ✅ **Código Mantenible**: Arquitectura clara y modular
6. ✅ **Integración Completa**: Funciona desde Calculator, SavedQuotations, y URL directa

---

**Tiempo Estimado Total:** 12-16 horas de desarrollo

**Prioridad:** Alta - Mejora significativa de UX

**Complejidad:** Media - Requiere refactoring de código existente

**Riesgo:** Bajo - No afecta funcionalidad crítica durante desarrollo
