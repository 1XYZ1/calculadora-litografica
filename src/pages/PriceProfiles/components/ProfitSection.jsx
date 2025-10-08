import React from "react";
import { SECTION_COLORS } from "../../../utils/constants";

/**
 * Sección para configurar el porcentaje de ganancia
 */
function ProfitSection({
  profitPercentageInput,
  setProfitPercentageInput,
  profitPercentageData,
  updateProfitPercentage,
  loading,
}) {
  const colors = SECTION_COLORS.profit;

  return (
    <section className={`${colors.bg} p-6 rounded-xl shadow-md`}>
      <h3 className={`text-2xl font-bold ${colors.title} mb-6`}>
        Porcentaje de Ganancia
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        {/* Badge con valor actual */}
        <div className="bg-white rounded-lg p-6 shadow-sm border-2 border-orange-200">
          <p className="text-sm text-gray-600 mb-2 font-medium">Valor Actual</p>
          <p className="text-4xl font-bold text-orange-600">
            {profitPercentageData !== undefined
              ? (profitPercentageData * 100).toFixed(2)
              : "0.00"}
            %
          </p>
        </div>

        {/* Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nuevo Porcentaje (%)
          </label>
          <input
            type="number"
            step="0.01"
            placeholder="Ej. 20"
            value={profitPercentageInput}
            onChange={(e) => setProfitPercentageInput(e.target.value)}
            disabled={loading}
            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-gray-500">
            Introduce el porcentaje de ganancia deseado
          </p>
        </div>

        {/* Botón */}
        <button
          onClick={updateProfitPercentage}
          disabled={loading}
          className={`${colors.button} text-white font-bold py-3 px-6 rounded-lg transition duration-300 shadow-md hover:shadow-lg h-fit disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
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
              Guardando...
            </>
          ) : (
            "Actualizar"
          )}
        </button>
      </div>
    </section>
  );
}

export default React.memo(ProfitSection);
