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
}) {
  const colors = SECTION_COLORS.digital;

  return (
    <section className={`${colors.bg} p-6 rounded-xl shadow-md`}>
      <h3 className={`text-2xl font-bold ${colors.title} mb-4`}>
        Precios de Impresión Digital
      </h3>

      {/* Precio de cuarto pliego digital (Tiro) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 items-center">
        <label className="text-gray-700 font-medium">
          1/4 Pliego Digital (Tiro):
        </label>
        <input
          type="number"
          step="0.01"
          placeholder="Precio por unidad"
          value={digitalQuarterTiroInput}
          onChange={(e) => setDigitalQuarterTiroInput(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
        />
        <button
          onClick={() =>
            updateFinishingPrice(
              "digital_quarter_tiro",
              digitalQuarterTiroInput
            )
          }
          className={`col-span-1 md:col-span-2 ${colors.button} text-white font-bold py-2 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md`}
        >
          Actualizar Precio Tiro
        </button>
      </div>
      <p className="mt-2 text-gray-600 mb-4">
        Actual: $
        {finishingPrices["digital_quarter_tiro"] !== undefined
          ? finishingPrices["digital_quarter_tiro"].toFixed(2)
          : "0.00"}{" "}
        /unidad
      </p>

      {/* Precio de cuarto pliego digital (Tiro y Retiro) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 items-center">
        <label className="text-gray-700 font-medium">
          1/4 Pliego Digital (Tiro y Retiro):
        </label>
        <input
          type="number"
          step="0.01"
          placeholder="Precio por unidad"
          value={digitalQuarterTiroRetiroInput}
          onChange={(e) => setDigitalQuarterTiroRetiroInput(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
        />
        <button
          onClick={() =>
            updateFinishingPrice(
              "digital_quarter_tiro_retiro",
              digitalQuarterTiroRetiroInput
            )
          }
          className={`col-span-1 md:col-span-2 ${colors.button} text-white font-bold py-2 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md`}
        >
          Actualizar Precio Tiro y Retiro
        </button>
      </div>
      <p className="mt-2 text-gray-600 mb-4">
        Actual: $
        {finishingPrices["digital_quarter_tiro_retiro"] !== undefined
          ? finishingPrices["digital_quarter_tiro_retiro"].toFixed(2)
          : "0.00"}{" "}
        /unidad
      </p>
    </section>
  );
}

export default React.memo(DigitalPrintingSection);
