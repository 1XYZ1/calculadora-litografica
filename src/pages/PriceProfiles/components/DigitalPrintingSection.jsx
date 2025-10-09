import React, { useMemo } from "react";
import { SECTION_COLORS } from "../../../utils/constants";

/**
 * Componente individual para campo de precio de impresión digital
 * Memoizado para evitar re-renders innecesarios
 */
const PriceField = React.memo(({
  label,
  value,
  onChange,
  currentPrice,
  description,
  disabled,
}) => {
  // Detectar cambios pendientes para este campo específico
  const hasChanged = useMemo(() => {
    const inputValue = parseFloat(value);
    return !isNaN(inputValue) && inputValue !== currentPrice;
  }, [value, currentPrice]);

  return (
    <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200 transition-all duration-200 hover:border-gray-300">
      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
        {label}
        {hasChanged && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
            Modificado
          </span>
        )}
      </label>
      <input
        type="number"
        step="0.01"
        placeholder="0.00"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full p-3 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed ${
          hasChanged
            ? "border-amber-400 bg-amber-50"
            : "border-gray-300 bg-white"
        }`}
      />
      <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
            clipRule="evenodd"
          />
        </svg>
        Actual: ${currentPrice?.toFixed(2) || "0.00"} {description}
      </p>
    </div>
  );
});

PriceField.displayName = 'PriceField';

/**
 * Sección para gestionar precios de impresión digital con UX mejorada:
 * - Un solo botón para actualizar ambos precios
 * - Indicadores visuales de cambios pendientes
 * - Validación en tiempo real
 * - Mejor jerarquía visual
 */
function DigitalPrintingSection({
  finishingPrices,
  digitalQuarterTiroInput,
  setDigitalQuarterTiroInput,
  digitalQuarterTiroRetiroInput,
  setDigitalQuarterTiroRetiroInput,
  updateAllDigitalPrinting,
  loadingItemId,
}) {
  const colors = SECTION_COLORS.digital;

  // Detectar si hay cambios pendientes
  const hasAnyChanges = useMemo(() => {
    const tiroChanged = !isNaN(parseFloat(digitalQuarterTiroInput)) &&
      parseFloat(digitalQuarterTiroInput) !== finishingPrices["digital_quarter_tiro"];
    const tiroRetiroChanged = !isNaN(parseFloat(digitalQuarterTiroRetiroInput)) &&
      parseFloat(digitalQuarterTiroRetiroInput) !== finishingPrices["digital_quarter_tiro_retiro"];

    return tiroChanged || tiroRetiroChanged;
  }, [digitalQuarterTiroInput, digitalQuarterTiroRetiroInput, finishingPrices]);

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
            d="M4 4a1 1 0 011-1h10a1 1 0 011 1v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4zm2 1v10h8V5H6z"
            clipRule="evenodd"
          />
          <path d="M7 7h6v1H7V7zm0 2h6v1H7V9zm0 2h6v1H7v-1z" />
        </svg>
        <span className="text-xl sm:text-2xl">
          Precios de Impresión Digital
        </span>
      </h3>

      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md border-2 border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4 4a1 1 0 011-1h10a1 1 0 011 1v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4zm2 1v10h8V5H6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h4 className="text-lg sm:text-xl font-bold text-gray-800">
                Cuarto Pliego Digital
              </h4>
              <p className="text-xs sm:text-sm text-gray-500">
                Precio por unidad impresa
              </p>
            </div>
          </div>

          {/* Botón de actualización masiva */}
          <button
            onClick={updateAllDigitalPrinting}
            disabled={loadingItemId === "digital_all" || !hasAnyChanges}
            className={`${colors.button} min-h-[44px] text-white font-bold py-2 sm:py-3 px-3 sm:px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base relative ${
              hasAnyChanges ? "ring-2 ring-amber-400 ring-offset-2" : ""
            }`}
          >
            {loadingItemId === "digital_all" ? (
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
                {hasAnyChanges && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                  </span>
                )}
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <PriceField
            label="1/4 Pliego Digital (Tiro)"
            value={digitalQuarterTiroInput}
            onChange={setDigitalQuarterTiroInput}
            currentPrice={finishingPrices["digital_quarter_tiro"]}
            description="/unidad"
            disabled={loadingItemId === "digital_all"}
          />
          <PriceField
            label="1/4 Pliego Digital (Tiro y Retiro)"
            value={digitalQuarterTiroRetiroInput}
            onChange={setDigitalQuarterTiroRetiroInput}
            currentPrice={finishingPrices["digital_quarter_tiro_retiro"]}
            description="/unidad"
            disabled={loadingItemId === "digital_all"}
          />
        </div>
      </div>
    </section>
  );
}

export default React.memo(DigitalPrintingSection);
