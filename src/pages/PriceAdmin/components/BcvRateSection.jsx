import React from "react";
import { SECTION_COLORS } from "../../../utils/constants";

/**
 * Sección para configurar la tasa de dólar BCV
 */
function BcvRateSection({
  bcvRateInput,
  setBcvRateInput,
  bcvRateData,
  updateBcvRate,
}) {
  const colors = SECTION_COLORS.bcv;

  return (
    <section className={`${colors.bg} p-6 rounded-xl shadow-md`}>
      <h3 className={`text-2xl font-bold ${colors.title} mb-4`}>
        Tasa de Dólar BCV
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 items-center">
        <label className="text-gray-700 font-medium">Tasa (Bs./$):</label>
        <input
          type="number"
          step="0.01"
          placeholder="Ej. 36.50"
          value={bcvRateInput}
          onChange={(e) => setBcvRateInput(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
        />
        <button
          onClick={updateBcvRate}
          className={`${colors.button} text-white font-bold py-2 rounded-lg transition duration-300`}
        >
          Actualizar Tasa BCV
        </button>
      </div>
      <p className="mt-2 text-gray-600 mb-4">
        Actual: Bs.{" "}
        {bcvRateData !== undefined ? bcvRateData.toFixed(2) : "0.00"} / $
      </p>
    </section>
  );
}

export default React.memo(BcvRateSection);
