import React, { useMemo } from "react";
import { SECTION_COLORS } from "../../../utils/constants";

/**
 * Sección para configurar el porcentaje de IVA con UX mejorada:
 * - Detección de cambios en tiempo real
 * - Indicadores visuales mejorados
 * - Mejor iconografía y jerarquía
 */
function IvaSection({
  ivaPercentageInput,
  setIvaPercentageInput,
  ivaPercentageData,
  updateIvaPercentage,
  loading,
}) {
  const colors = SECTION_COLORS.iva;

  // Detectar cambios pendientes
  const hasChanged = useMemo(() => {
    const inputValue = parseFloat(ivaPercentageInput);
    return !isNaN(inputValue) && inputValue / 100 !== ivaPercentageData;
  }, [ivaPercentageInput, ivaPercentageData]);

  return (
    <section className={`${colors.bg} p-4 sm:p-6 rounded-xl shadow-md`}>
      <h3
        className={`text-xl sm:text-2xl font-bold ${colors.title} mb-4 sm:mb-6 flex items-center gap-2`}
      >
        <svg
          className="w-6 h-6 sm:w-7 sm:h-7"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-xl sm:text-2xl">Porcentaje de IVA</span>
      </h3>

      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md border-2 border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 items-center">
          {/* Badge con valor actual */}
          <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-4 sm:p-6 shadow-sm border-2 border-pink-200">
            <div className="flex items-center gap-2 mb-2">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v2a1 1 0 102 0V9z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-xs sm:text-sm text-gray-700 font-medium">
                IVA Actual
              </p>
            </div>
            <p className="text-3xl sm:text-4xl font-bold text-pink-600">
              {ivaPercentageData !== undefined
                ? (ivaPercentageData * 100).toFixed(2)
                : "0.00"}
              %
            </p>
          </div>

          {/* Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nuevo Porcentaje (%)
              {hasChanged && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                  Modificado
                </span>
              )}
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="Ej. 16"
              value={ivaPercentageInput}
              onChange={(e) => setIvaPercentageInput(e.target.value)}
              disabled={loading}
              className={`w-full p-2.5 sm:p-3 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base ${
                hasChanged
                  ? "border-amber-400 bg-amber-50"
                  : "border-gray-300 bg-white"
              }`}
            />
            <p className="mt-1 text-xs text-gray-500">
              Introduce el porcentaje de IVA aplicable
            </p>
          </div>

          {/* Botón */}
          <button
            onClick={updateIvaPercentage}
            disabled={loading || !hasChanged}
            className={`${
              colors.button
            } min-h-[44px] text-white font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg h-fit disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative text-sm sm:text-base ${
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

export default React.memo(IvaSection);
