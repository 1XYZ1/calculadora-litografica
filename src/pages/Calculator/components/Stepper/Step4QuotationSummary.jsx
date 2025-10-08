import React from "react";
import ItemsList from "../ResultsPanel/ItemsList";
import QuotationSummary from "../ResultsPanel/QuotationSummary";

/**
 * Paso 4: Resumen del Presupuesto
 * Vista final con todos los items y acciones de guardado
 */
const Step4QuotationSummary = ({
  items,
  grandTotals,
  bcvRate,
  editingQuotationId,
  onEditItem,
  onRemoveItem,
  onShowBreakdown,
  onSave,
  onUpdate,
  onCancel,
  onPreview,
  onAddNewItem,
  isSaving = false,
}) => {
  return (
    <div className="space-y-4 sm:space-y-6 animate-fadeIn">
      <div className="bg-white p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-sm border border-gray-200">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">
            Resumen del Presupuesto
          </h2>
          <p className="text-xs sm:text-sm text-gray-600">
            Revisa todos los items y guarda o previsualiza tu presupuesto
          </p>
        </div>

        {/* Lista de items */}
        <div className="mb-6 sm:mb-8">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-bold text-gray-800">
              Items del Presupuesto
            </h3>
            <span className="text-xs sm:text-sm text-gray-600">
              {items.length} {items.length === 1 ? "item" : "items"}
            </span>
          </div>

          <ItemsList
            items={items}
            onEdit={onEditItem}
            onRemove={onRemoveItem}
            onShowBreakdown={onShowBreakdown}
          />
        </div>

        {/* Botón para agregar más items */}
        {items.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <button
              onClick={onAddNewItem}
              className="w-full border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-2.5 sm:py-3 rounded-lg transition-all flex items-center justify-center space-x-2 min-h-[44px] text-sm sm:text-base"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span>Agregar Otro Item</span>
            </button>
          </div>
        )}

        {/* Resumen de totales y acciones */}
        <QuotationSummary
          grandTotals={grandTotals}
          bcvRate={bcvRate}
          editingQuotationId={editingQuotationId}
          onSave={onSave}
          onUpdate={onUpdate}
          onCancel={onCancel}
          onPreview={onPreview}
          isSaving={isSaving}
        />
      </div>

      {/* Indicador de ayuda */}
      {items.length === 0 ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 sm:p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-xs sm:text-sm text-yellow-700">
                <strong>Atención:</strong> No has agregado ningún item al
                presupuesto. Debes volver a los pasos anteriores y agregar al
                menos un item para poder guardar el presupuesto.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border-l-4 border-green-400 p-3 sm:p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-4 w-4 sm:h-5 sm:w-5 text-green-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-xs sm:text-sm text-green-700">
                <strong>¡Listo!</strong> Tu presupuesto está completo. Puedes
                guardarlo, generar una vista previa en PDF, o agregar más items
                si lo necesitas.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(Step4QuotationSummary);
