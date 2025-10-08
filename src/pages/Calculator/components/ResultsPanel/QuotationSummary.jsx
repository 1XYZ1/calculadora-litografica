import React from "react";

/**
 * Componente para mostrar totales y acciones del presupuesto
 */
const QuotationSummary = ({
  grandTotals,
  bcvRate,
  editingQuotationId,
  onSave,
  onUpdate,
  onCancel,
  onPreview,
}) => {
  return (
    <div className="space-y-6 bg-gray-100 p-6 rounded-xl shadow-inner">
      <h3 className="text-2xl font-bold text-green-700 mb-4">
        Resultados Globales
      </h3>

      {/* Total en USD */}
      <div className="info-box bg-indigo-100 p-4 rounded-lg">
        <p className="font-semibold">Total General:</p>
        <span className="text-indigo-800 text-4xl font-extrabold">
          ${grandTotals.totalGeneral.toFixed(2)}
        </span>
      </div>

      {/* Total en Bs */}
      <div className="info-box bg-teal-100 p-4 rounded-lg mt-4">
        <p className="font-semibold">
          Total en Bs. (Tasa {bcvRate.toFixed(2)}):
        </p>
        <span className="text-teal-800 text-4xl font-extrabold">
          Bs. {grandTotals.totalCostInBs.toFixed(2)}
        </span>
      </div>

      {/* Botones de acción */}
      <div className="flex space-x-4 mt-6">
        {editingQuotationId ? (
          <>
            <button
              onClick={onUpdate}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow-md transition-colors"
            >
              Actualizar Presupuesto
            </button>
            <button
              onClick={onCancel}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg shadow-md transition-colors"
            >
              Cancelar Edición
            </button>
          </>
        ) : (
          <button
            onClick={onSave}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow-md transition-colors"
          >
            Guardar Presupuesto
          </button>
        )}
        <button
          onClick={onPreview}
          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-lg shadow-md transition-colors"
        >
          Vista Previa
        </button>
      </div>
    </div>
  );
};

export default React.memo(QuotationSummary);
