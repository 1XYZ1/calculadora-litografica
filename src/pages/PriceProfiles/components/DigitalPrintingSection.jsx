import React from "react";
import { SECTION_COLORS } from "../../../utils/constants";

/**
 * Sección para gestionar precios de impresión digital
 * (Cuarto pliego tiro y tiro-retiro)
 */
function DigitalPrintingSection({
  finishingPrices,
  digitalQuarterTiroInput,
  setDigitalQuarterTiroInput,
  digitalQuarterTiroRetiroInput,
  setDigitalQuarterTiroRetiroInput,
  updateFinishingPrice,
  loadingItemId,
}) {
  const colors = SECTION_COLORS.digital;

  return (
    <section className={`${colors.bg} p-6 rounded-xl shadow-md`}>
      <h3 className={`text-2xl font-bold ${colors.title} mb-4`}>
        Precios de Impresión Digital
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Precio de cuarto pliego digital (Tiro) */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-3">
            1/4 Pliego Digital (Tiro)
          </h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio por Unidad
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="Ej. 0.50"
                value={digitalQuarterTiroInput}
                onChange={(e) => setDigitalQuarterTiroInput(e.target.value)}
                disabled={loadingItemId === "digital_quarter_tiro"}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 disabled:opacity-50"
              />
            </div>
            <button
              onClick={() =>
                updateFinishingPrice(
                  "digital_quarter_tiro",
                  digitalQuarterTiroInput
                )
              }
              disabled={loadingItemId === "digital_quarter_tiro"}
              className={`w-full ${colors.button} text-white font-bold py-3 rounded-lg transition duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
            >
              {loadingItemId === "digital_quarter_tiro" ? (
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
            <p className="text-sm text-gray-600">
              Actual: $
              {finishingPrices["digital_quarter_tiro"] !== undefined
                ? finishingPrices["digital_quarter_tiro"].toFixed(2)
                : "0.00"}{" "}
              /unidad
            </p>
          </div>
        </div>

        {/* Precio de cuarto pliego digital (Tiro y Retiro) */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-3">
            1/4 Pliego Digital (Tiro y Retiro)
          </h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio por Unidad
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="Ej. 0.80"
                value={digitalQuarterTiroRetiroInput}
                onChange={(e) =>
                  setDigitalQuarterTiroRetiroInput(e.target.value)
                }
                disabled={loadingItemId === "digital_quarter_tiro_retiro"}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 disabled:opacity-50"
              />
            </div>
            <button
              onClick={() =>
                updateFinishingPrice(
                  "digital_quarter_tiro_retiro",
                  digitalQuarterTiroRetiroInput
                )
              }
              disabled={loadingItemId === "digital_quarter_tiro_retiro"}
              className={`w-full ${colors.button} text-white font-bold py-3 rounded-lg transition duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
            >
              {loadingItemId === "digital_quarter_tiro_retiro" ? (
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
            <p className="text-sm text-gray-600">
              Actual: $
              {finishingPrices["digital_quarter_tiro_retiro"] !== undefined
                ? finishingPrices["digital_quarter_tiro_retiro"].toFixed(2)
                : "0.00"}{" "}
              /unidad
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default React.memo(DigitalPrintingSection);
