import React, { useMemo } from "react";
import { SECTION_COLORS } from "../../../utils/constants";

/**
 * Sección para configurar la tasa de dólar BCV con UX mejorada:
 * - Detección de cambios en tiempo real
 * - Indicadores visuales mejorados
 * - Mejor iconografía y jerarquía
 */
function BcvRateSection({
  bcvRateInput,
  setBcvRateInput,
  bcvRateData,
  updateBcvRate,
  loading,
}) {
  const colors = SECTION_COLORS.bcv;

  // Detectar cambios pendientes
  const hasChanged = useMemo(() => {
    const inputValue = parseFloat(bcvRateInput);
    return !isNaN(inputValue) && inputValue !== bcvRateData;
  }, [bcvRateInput, bcvRateData]);

  return (
    <section className={`${colors.bg} p-6 rounded-xl shadow-md`}>
      <h3
        className={`text-2xl font-bold ${colors.title} mb-6 flex items-center gap-2`}
      >
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
            clipRule="evenodd"
          />
        </svg>
        Tasa de Dólar BCV
      </h3>

      <div className="bg-white p-6 rounded-xl shadow-md border-2 border-gray-200">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Badge con valor actual */}
          <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-6 shadow-sm border-2 border-teal-200">
            <div className="flex items-center gap-2 mb-2">
              <svg
                className="w-5 h-5 text-teal-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-gray-700 font-medium">Tasa Actual</p>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-bold text-teal-600">
                {bcvRateData !== undefined ? bcvRateData.toFixed(2) : "0.00"}
              </p>
              <span className="text-lg text-gray-600 font-medium">Bs./$</span>
            </div>
          </div>

          {/* Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nueva Tasa (Bs./$)
              {hasChanged && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                  Modificado
                </span>
              )}
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="Ej. 36.50"
              value={bcvRateInput}
              onChange={(e) => setBcvRateInput(e.target.value)}
              disabled={loading}
              className={`w-full p-3 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                hasChanged
                  ? "border-amber-400 bg-amber-50"
                  : "border-gray-300 bg-white"
              }`}
            />
            <p className="mt-1 text-xs text-gray-500">
              Introduce la tasa de cambio BCV
            </p>
          </div>

          {/* Botón */}
          <button
            onClick={updateBcvRate}
            disabled={loading || !hasChanged}
            className={`${
              colors.button
            } text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg h-fit disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative ${
              hasChanged ? "ring-2 ring-amber-400 ring-offset-2" : ""
            }`}
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
              <>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Actualizar
                {hasChanged && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                  </span>
                )}
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}

export default React.memo(BcvRateSection);
