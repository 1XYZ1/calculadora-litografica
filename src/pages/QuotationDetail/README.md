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

## Estado
🚧 En construcción - PASO 1 completado

## Ver más
- [Plan de Implementación](../../../PLAN_DETALLE_PRESUPUESTO.md)
- [Orden de Ejecución](../../../ORDEN_EJECUCION_DETALLE_PRESUPUESTO.md)
