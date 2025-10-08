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
  isSaving = false,
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
              disabled={isSaving}
              className={`flex-1 font-bold py-3 rounded-lg shadow-md transition-all flex items-center justify-center space-x-2 ${
                isSaving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 hover:scale-105"
              } text-white`}
            >
              {isSaving ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Actualizando...</span>
                </>
              ) : (
                <span>Actualizar Presupuesto</span>
              )}
            </button>
            <button
              onClick={onCancel}
              disabled={isSaving}
              className={`flex-1 font-bold py-3 rounded-lg shadow-md transition-all ${
                isSaving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700 hover:scale-105"
              } text-white`}
            >
              Cancelar Edición
            </button>
          </>
        ) : (
          <button
            onClick={onSave}
            disabled={isSaving}
            className={`flex-1 font-bold py-3 rounded-lg shadow-md transition-all flex items-center justify-center space-x-2 ${
              isSaving
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 hover:scale-105"
            } text-white`}
          >
            {isSaving ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Guardando...</span>
              </>
            ) : (
              <span>Guardar Presupuesto</span>
            )}
          </button>
        )}
        <button
          onClick={onPreview}
          disabled={isSaving}
          className={`flex-1 font-bold py-3 rounded-lg shadow-md transition-all ${
            isSaving
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gray-600 hover:bg-gray-700 hover:scale-105"
          } text-white`}
        >
          Vista Previa
        </button>
      </div>
    </div>
  );
};

export default React.memo(QuotationSummary);
