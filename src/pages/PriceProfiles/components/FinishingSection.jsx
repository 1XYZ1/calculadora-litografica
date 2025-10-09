import React, { useMemo } from "react";
import { SECTION_COLORS, UV_SIZE_KEYS } from "../../../utils/constants";

/**
 * Componente individual para campo de precio de acabado
 * Memoizado para evitar re-renders innecesarios
 */
const PriceField = React.memo(({
  label,
  value,
  onChange,
  currentPrice,
  unit,
  step = "0.01",
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
        step={step}
        placeholder="0.00"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full p-3 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed ${
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
        Actual: ${currentPrice?.toFixed(step === "0.001" ? 3 : 2) || "0.00"}{" "}
        {unit}
      </p>
    </div>
  );
});

PriceField.displayName = 'PriceField';

/**
 * Sección para gestionar precios de acabados con UX mejorada:
 * - 2 botones de actualización masiva (UV y Otros)
 * - Indicadores visuales de cambios pendientes
 * - Validación en tiempo real
 * - Mejor jerarquía visual
 */
function FinishingSection({
  finishingPrices,
  uvPricesInput,
  handleUvPriceChange,
  rematePriceInput,
  setRematePriceInput,
  laminadoMatePriceInput,
  setLaminadoMatePriceInput,
  laminadoBrillantePriceInput,
  setLaminadoBrillantePriceInput,
  signadoPriceInput,
  setSignadoPriceInput,
  troqueladoPriceInput,
  setTroqueladoPriceInput,
  updateAllUvPrices,
  updateAllOtherFinishings,
  loadingItemId,
}) {
  const colors = SECTION_COLORS.finishing;

  // Detectar si hay cambios pendientes en UV
  const hasUvChanges = useMemo(() => {
    return UV_SIZE_KEYS.some((size) => {
      const inputValue = parseFloat(uvPricesInput[size.key]);
      return !isNaN(inputValue) && inputValue !== finishingPrices[`uv_${size.key}`];
    });
  }, [uvPricesInput, finishingPrices]);

  // Detectar si hay cambios pendientes en otros acabados
  const hasOtherChanges = useMemo(() => {
    const remateChanged = !isNaN(parseFloat(rematePriceInput)) &&
      parseFloat(rematePriceInput) !== finishingPrices["remate"];
    const mateChanged = !isNaN(parseFloat(laminadoMatePriceInput)) &&
      parseFloat(laminadoMatePriceInput) !== finishingPrices["laminado_mate"];
    const brillanteChanged = !isNaN(parseFloat(laminadoBrillantePriceInput)) &&
      parseFloat(laminadoBrillantePriceInput) !== finishingPrices["laminado_brillante"];
    const signadoChanged = !isNaN(parseFloat(signadoPriceInput)) &&
      parseFloat(signadoPriceInput) !== finishingPrices["signado"];
    const troqueladoChanged = !isNaN(parseFloat(troqueladoPriceInput)) &&
      parseFloat(troqueladoPriceInput) !== finishingPrices["troquelado"];

    return remateChanged || mateChanged || brillanteChanged || signadoChanged || troqueladoChanged;
  }, [
    rematePriceInput,
    laminadoMatePriceInput,
    laminadoBrillantePriceInput,
    signadoPriceInput,
    troqueladoPriceInput,
    finishingPrices
  ]);

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
            d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-xl sm:text-2xl">Precios de Acabados</span>
      </h3>

      {/* Subsección de precios de UV */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md mb-4 sm:mb-6 border-2 border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
              </svg>
            </div>
            <div>
              <h4 className="text-lg sm:text-xl font-bold text-gray-800">
                Precios de UV por Tamaño
              </h4>
              <p className="text-xs sm:text-sm text-gray-500">
                Precio por unidad
              </p>
            </div>
          </div>

          {/* Botón de actualización masiva de UV */}
          <button
            onClick={updateAllUvPrices}
            disabled={loadingItemId === "uv_all" || !hasUvChanges}
            className={`${colors.button} min-h-[44px] text-white font-bold py-2 sm:py-3 px-3 sm:px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base relative ${
              hasUvChanges ? "ring-2 ring-amber-400 ring-offset-2" : ""
            }`}
          >
            {loadingItemId === "uv_all" ? (
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
                {hasUvChanges && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                  </span>
                )}
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {UV_SIZE_KEYS.map((size) => (
            <PriceField
              key={size.key}
              label={size.label}
              value={uvPricesInput[size.key]}
              onChange={(value) => handleUvPriceChange(size.key, value)}
              currentPrice={finishingPrices[`uv_${size.key}`]}
              unit="/unidad"
              step="0.001"
              disabled={loadingItemId === "uv_all"}
            />
          ))}
        </div>
      </div>

      {/* Otros acabados */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md border-2 border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h4 className="text-lg sm:text-xl font-bold text-gray-800">
                Otros Acabados
              </h4>
              <p className="text-xs sm:text-sm text-gray-500">
                Laminados, remate, signado y troquelado
              </p>
            </div>
          </div>

          {/* Botón de actualización masiva de otros acabados */}
          <button
            onClick={updateAllOtherFinishings}
            disabled={loadingItemId === "other_all" || !hasOtherChanges}
            className={`${colors.button} min-h-[44px] text-white font-bold py-2 sm:py-3 px-3 sm:px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base relative ${
              hasOtherChanges ? "ring-2 ring-amber-400 ring-offset-2" : ""
            }`}
          >
            {loadingItemId === "other_all" ? (
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
                {hasOtherChanges && (
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
            label="Remate"
            value={rematePriceInput}
            onChange={setRematePriceInput}
            currentPrice={finishingPrices["remate"]}
            unit="/millar"
            disabled={loadingItemId === "other_all"}
          />
          <PriceField
            label="Laminado Mate"
            value={laminadoMatePriceInput}
            onChange={setLaminadoMatePriceInput}
            currentPrice={finishingPrices["laminado_mate"]}
            unit="/unidad (por cara)"
            step="0.001"
            disabled={loadingItemId === "other_all"}
          />
          <PriceField
            label="Laminado Brillante"
            value={laminadoBrillantePriceInput}
            onChange={setLaminadoBrillantePriceInput}
            currentPrice={finishingPrices["laminado_brillante"]}
            unit="/unidad (por cara)"
            step="0.001"
            disabled={loadingItemId === "other_all"}
          />
          <PriceField
            label="Signado"
            value={signadoPriceInput}
            onChange={setSignadoPriceInput}
            currentPrice={finishingPrices["signado"]}
            unit="/millar"
            disabled={loadingItemId === "other_all"}
          />
          <PriceField
            label="Troquelado"
            value={troqueladoPriceInput}
            onChange={setTroqueladoPriceInput}
            currentPrice={finishingPrices["troquelado"]}
            unit="/millar"
            disabled={loadingItemId === "other_all"}
          />
        </div>
      </div>
    </section>
  );
}

export default React.memo(FinishingSection);
