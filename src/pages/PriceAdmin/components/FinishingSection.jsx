import React from "react";
import { SECTION_COLORS, UV_SIZE_KEYS } from "../../../utils/constants";

/**
 * Sección para gestionar precios de acabados:
 * - UV por tamaño
 * - Remate
 * - Laminado mate y brillante
 * - Signado
 * - Troquelado
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
  updateFinishingPrice,
}) {
  const colors = SECTION_COLORS.finishing;

  return (
    <section className={`${colors.bg} p-6 rounded-xl shadow-md`}>
      <h3 className={`text-2xl font-bold ${colors.title} mb-4`}>
        Precios de Acabados
      </h3>

      {/* Subsección de precios de UV */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-6 border border-gray-200">
        <h4 className="text-xl font-bold text-gray-800 mb-4">
          Precios de UV por Tamaño (/unidad)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {UV_SIZE_KEYS.map((size) => (
            <div className="col-span-1" key={size.key}>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                {size.label}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.001"
                  placeholder="Precio"
                  value={uvPricesInput[size.key]}
                  onChange={(e) =>
                    handleUvPriceChange(size.key, e.target.value)
                  }
                  className="p-2 border border-gray-300 rounded-lg w-full"
                />
                <button
                  onClick={() =>
                    updateFinishingPrice(
                      `uv_${size.key}`,
                      uvPricesInput[size.key]
                    )
                  }
                  className={`${colors.button} text-white font-bold py-2 px-3 rounded-lg transition duration-300`}
                >
                  OK
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Actual: $
                {finishingPrices[`uv_${size.key}`]?.toFixed(3) || "0.000"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Remate */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 items-center">
        <label className="text-gray-700 font-medium">Remate:</label>
        <input
          type="number"
          step="0.01"
          placeholder="Precio por Millar de Pliegos"
          value={rematePriceInput}
          onChange={(e) => setRematePriceInput(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
        />
        <button
          onClick={() => updateFinishingPrice("remate", rematePriceInput)}
          className={`${colors.button} text-white font-bold py-2 rounded-lg transition duration-300`}
        >
          Actualizar Remate
        </button>
      </div>
      <p className="mt-2 text-gray-600 mb-4">
        Actual: $
        {finishingPrices["remate"] !== undefined
          ? finishingPrices["remate"].toFixed(2)
          : "0.00"}{" "}
        /millar de pliegos
      </p>

      {/* Laminado Mate */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 items-center">
        <label className="text-gray-700 font-medium">Laminado Mate:</label>
        <input
          type="number"
          step="0.001"
          placeholder="Precio por Unidad (por cara)"
          value={laminadoMatePriceInput}
          onChange={(e) => setLaminadoMatePriceInput(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
        />
        <button
          onClick={() =>
            updateFinishingPrice("laminado_mate", laminadoMatePriceInput)
          }
          className={`${colors.button} text-white font-bold py-2 rounded-lg transition duration-300`}
        >
          Actualizar Laminado Mate
        </button>
      </div>
      <p className="mt-2 text-gray-600 mb-4">
        Actual: $
        {finishingPrices["laminado_mate"] !== undefined
          ? finishingPrices["laminado_mate"].toFixed(3)
          : "0.000"}{" "}
        /unidad (por cara)
      </p>

      {/* Laminado Brillante */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 items-center">
        <label className="text-gray-700 font-medium">Laminado Brillante:</label>
        <input
          type="number"
          step="0.001"
          placeholder="Precio por Unidad (por cara)"
          value={laminadoBrillantePriceInput}
          onChange={(e) => setLaminadoBrillantePriceInput(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
        />
        <button
          onClick={() =>
            updateFinishingPrice(
              "laminado_brillante",
              laminadoBrillantePriceInput
            )
          }
          className={`${colors.button} text-white font-bold py-2 rounded-lg transition duration-300`}
        >
          Actualizar Laminado Brillante
        </button>
      </div>
      <p className="mt-2 text-gray-600 mb-4">
        Actual: $
        {finishingPrices["laminado_brillante"] !== undefined
          ? finishingPrices["laminado_brillante"].toFixed(3)
          : "0.000"}{" "}
        /unidad (por cara)
      </p>

      {/* Signado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 items-center">
        <label className="text-gray-700 font-medium">Signado:</label>
        <input
          type="number"
          step="0.01"
          placeholder="Precio por Millar de Pliegos"
          value={signadoPriceInput}
          onChange={(e) => setSignadoPriceInput(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
        />
        <button
          onClick={() => updateFinishingPrice("signado", signadoPriceInput)}
          className={`${colors.button} text-white font-bold py-2 rounded-lg transition duration-300`}
        >
          Actualizar Signado
        </button>
      </div>
      <p className="mt-2 text-gray-600 mb-4">
        Actual: $
        {finishingPrices["signado"] !== undefined
          ? finishingPrices["signado"].toFixed(2)
          : "0.00"}{" "}
        /millar de pliegos
      </p>

      {/* Troquelado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 items-center">
        <label className="text-gray-700 font-medium">Troquelado:</label>
        <input
          type="number"
          step="0.01"
          placeholder="Precio por Millar de Pliegos"
          value={troqueladoPriceInput}
          onChange={(e) => setTroqueladoPriceInput(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
        />
        <button
          onClick={() =>
            updateFinishingPrice("troquelado", troqueladoPriceInput)
          }
          className={`${colors.button} text-white font-bold py-2 rounded-lg transition duration-300`}
        >
          Actualizar Troquelado
        </button>
      </div>
      <p className="mt-2 text-gray-600 mb-4">
        Actual: $
        {finishingPrices["troquelado"] !== undefined
          ? finishingPrices["troquelado"].toFixed(2)
          : "0.00"}{" "}
        /millar de pliegos
      </p>
    </section>
  );
}

export default React.memo(FinishingSection);
